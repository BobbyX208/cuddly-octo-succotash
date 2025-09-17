const { config, configPath, saveConfig, setState, getState } = require("./state");
const { addReply, listReplies, deleteReply } = require("./replies");
const { saveJSON } = require("./utils");
const { getNightLog, clearNightLog, formatNightLog } = require("./logger");
const fs = require("fs");

function handleCommand(ownerJid, msg, sendMessage, ownerName) {
  const prefix = config.prefix || "/";
  if (!msg.startsWith(prefix)) return false;

  const args = msg.slice(prefix.length).trim().split(/\s+/);
  const cmd = args.shift().toLowerCase();

  switch (cmd) {
    case "help":
      sendMessage(ownerJid, `
📖 *Assistant Bot Commands*
${prefix}offline – Enable away mode
${prefix}online – Disable away mode
${prefix}auto on|off – Toggle auto mode
${prefix}set <key> <value> – Change config (interval, prefix, etc.)
${prefix}prefix <new> – Change command prefix
${prefix}add <day|night|group> <msg> – Add new reply
${prefix}list replies – Show current replies
${prefix}delete <day|night|group> <index> – Delete a reply
${prefix}status – Show bot status
${prefix}ownerlog now – Send current logs
${prefix}help – Show this message

👨‍💻 Author: ChatGPT (OpenAI)
      `);
      return true;

    case "offline":
      setState("offline");
      sendMessage(ownerJid, "✅ Assistant is now in *offline* mode.");
      return true;

    case "online":
      setState("online");
      const log = getNightLog();
      if (log.length) {
        sendMessage(ownerJid, formatNightLog(log, ownerName));
        clearNightLog();
      }
      sendMessage(ownerJid, "✅ Assistant is back *online*.");
      return true;

    case "auto":
      if (args[0] === "on") config.autoMode = true;
      else if (args[0] === "off") config.autoMode = false;
      saveConfig();
      sendMessage(ownerJid, `✅ Auto mode = ${config.autoMode}`);
      return true;

    case "set":
      if (args.length >= 2) {
        const key = args[0];
        const value = args.slice(1).join(" ");
        config[key] = value;
        saveConfig();
        sendMessage(ownerJid, `✅ Setting updated: ${key} = ${value}`);
      } else {
        sendMessage(ownerJid, `⚠️ Usage: ${prefix}set <key> <value>`);
      }
      return true;

    case "prefix":
      if (args[0]) {
        config.prefix = args[0];
        saveConfig();
        sendMessage(ownerJid, `✅ Prefix updated to: ${args[0]}`);
      }
      return true;

    case "add":
      if (args.length >= 2) {
        const type = args[0];
        const msg = args.slice(1).join(" ");
        const id = addReply(type, msg);
        sendMessage(ownerJid, `✅ Added new ${type} reply at index ${id}`);
      } else {
        sendMessage(ownerJid, `⚠️ Usage: ${prefix}add <day|night|group> <msg>`);
      }
      return true;

    case "list":
      if (args[0] === "replies") {
        const replies = listReplies();
        let out = "📋 *Current Replies*:\n";
        for (let type in replies) {
          out += `\n*${type}*:\n`;
          replies[type].forEach((r, i) => (out += `${i}) ${r}\n`));
        }
        sendMessage(ownerJid, out);
      }
      return true;

    case "delete":
      if (args.length >= 2) {
        const type = args[0];
        const index = parseInt(args[1]);
        const ok = deleteReply(type, index);
        sendMessage(ownerJid, ok ? `✅ Deleted reply ${index} from ${type}` : "⚠️ Failed.");
      }
      return true;

    case "status":
      sendMessage(ownerJid, `📊 Status: ${getState()} | Prefix: ${config.prefix} | AutoMode: ${config.autoMode}`);
      return true;

    case "ownerlog":
      if (args[0] === "now") {
        const entries = getNightLog();
        sendMessage(ownerJid, formatNightLog(entries, ownerName));
      } else if (args[0] === "clear") {
        clearNightLog();
        sendMessage(ownerJid, "✅ Night log cleared.");
      }
      return true;

    default:
      sendMessage(ownerJid, `⚠️ Unknown command. Type ${prefix}help`);
      return true;
  }
}

module.exports = { handleCommand };