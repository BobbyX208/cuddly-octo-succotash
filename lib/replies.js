const { loadJSON, saveJSON, randomChoice } = require("./utils");
const repliesPath = "./data/replies.json";
let replies = loadJSON(repliesPath);

function getReply(type = "day") {
  return randomChoice(replies[type] || []);
}

function addReply(type, msg) {
  if (!replies[type]) replies[type] = [];
  replies[type].push(msg);
  saveJSON(repliesPath, replies);
  return replies[type].length - 1;
}

function listReplies() {
  return replies;
}

function deleteReply(type, index) {
  if (!replies[type] || !replies[type][index]) return false;
  replies[type].splice(index, 1);
  saveJSON(repliesPath, replies);
  return true;
}

module.exports = { getReply, addReply, listReplies, deleteReply };