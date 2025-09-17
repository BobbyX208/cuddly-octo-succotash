require("dotenv").config();
const { makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const { handleCommand } = require("./lib/commands");
const { getState, config } = require("./lib/state");
const { getReply } = require("./lib/replies");
const { logMessage } = require("./lib/logger");
const { loadJSON, saveJSON } = require("./lib/utils");

(async () => {
  const { state, saveCreds } = await useMultiFileAuthState("./sessions");
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false
  });

  sock.ev.on("creds.update", saveCreds);

  sock.ev.on("connection.update", (update) => {
    if (update.connection === "open") {
      console.log("✅ Bot connected");
    }
  });

  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    if (!msg.message) return;

    const sender = msg.key.remoteJid;
    const text = msg.message.conversation || msg.message.extendedTextMessage?.text || "";
    const isGroup = sender.endsWith("@g.us");

    // Load metadata
    const metaPath = "./sessions/metadata.json";
    let metadata = loadJSON(metaPath, {});
    if (!metadata.ownerJid) {
      metadata.ownerJid = `${process.env.BOT_OWNER_NUMBER}@s.whatsapp.net`;
      metadata.ownerName = process.env.BOT_NAME || "Owner";
      saveJSON(metaPath, metadata);
    }
    const ownerJid = metadata.ownerJid;
    const ownerName = metadata.ownerName;

    // Owner commands
    if (sender === ownerJid) {
      if (handleCommand(ownerJid, text, (jid, content) => sock.sendMessage(jid, { text: content }), ownerName)) return;
    }

    // Assistant mode
    if (getState() === "offline") {
      if (!isGroup) {
        const reply = getReply("night");
        await sock.sendMessage(sender, { text: reply });
        if (config.autoreact) await sock.sendMessage(sender, { react: { text: config.reactEmoji, key: msg.key } });
        logMessage({ from: sender, fromName: sender, message: text, reply, group: false, reacted: config.autoreact });
      } else {
        const mentions = msg.message.extendedTextMessage?.contextInfo?.mentionedJid || [];
        if (mentions.includes(ownerJid)) {
          const reply = getReply("group");
          await sock.sendMessage(sender, { text: reply });
          if (config.autoreact) await sock.sendMessage(sender, { react: { text: config.reactEmoji, key: msg.key } });
          logMessage({ from: sender, fromName: sender, message: text, reply, group: true, reacted: config.autoreact });
        }
      }
    }
  });
})();