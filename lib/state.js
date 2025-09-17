const { loadJSON, saveJSON, betweenTimes } = require("./utils");
const configPath = "./data/config.json";
let config = loadJSON(configPath);
let state = { mode: "online" }; // online | offline | auto

function getState() {
  if (config.autoMode && betweenTimes(config.offlineStart, config.offlineEnd)) {
    return "offline";
  }
  return state.mode;
}

function setState(newState) {
  state.mode = newState;
  return state.mode;
}

module.exports = { getState, setState, config, configPath, saveConfig: () => saveJSON(configPath, config) };