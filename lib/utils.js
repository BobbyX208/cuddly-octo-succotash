const fs = require("fs");

function loadJSON(path, fallback = {}) {
  try {
    return JSON.parse(fs.readFileSync(path, "utf8"));
  } catch {
    return fallback;
  }
}

function saveJSON(path, data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2));
}

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function nowTime() {
  return new Date().toISOString();
}

function betweenTimes(start, end, now = new Date()) {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const startMins = sh * 60 + sm;
  const endMins = eh * 60 + em;
  const nowMins = now.getHours() * 60 + now.getMinutes();
  if (startMins < endMins) return nowMins >= startMins && nowMins < endMins;
  return nowMins >= startMins || nowMins < endMins; // overnight
}

module.exports = { loadJSON, saveJSON, randomChoice, nowTime, betweenTimes };