const { loadJSON, saveJSON, nowTime } = require("./utils");
const path = "./sessions/nightlog.json";

function logMessage(entry) {
  const log = loadJSON(path, []);
  log.push({ ...entry, time: nowTime() });
  saveJSON(path, log);
}

function getNightLog() {
  return loadJSON(path, []);
}

function clearNightLog() {
  saveJSON(path, []);
}

function formatNightLog(entries, ownerName, date = new Date()) {
  if (!entries.length) return `✅ No activity while ${ownerName} was away.`;

  let text = `📋 Nightly log for ${date.toISOString().split("T")[0]}\n──────────────────────────────\n`;
  entries.forEach((e, i) => {
    text += `${i + 1}) [${e.time}] ${e.fromName} — "${e.message}"\n`;
    text += `   Bot reply: "${e.reply}" | Group: ${e.group ? "Yes" : "No"} | Reacted: ${e.reacted ? "Yes" : "No"}\n\n`;
  });
  text += `──────────────────────────────\n📊 Total: ${entries.length} messages\n`;
  return text;
}

module.exports = { logMessage, getNightLog, clearNightLog, formatNightLog };