/*global chrome*/

const teams = {
  fintechCore: [
    { assign: "Idan Magled", daysTotal: 0, time: 0 },
    { assign: "Kfir Arad", daysTotal: 0, time: 0 },
    { assign: "Ester Pratt", daysTotal: 0, time: 0 },
    { assign: "Arie Moldawsky", daysTotal: 0, time: 0 },
    { assign: "Yuval Beiton", daysTotal: 0, time: 0 },
    { assign: "Unassigned", daysTotal: 0, time: 0 },
  ],
  fintechCoreTurboTeam: [
    { assign: "Elena Lembersky", daysTotal: 0, time: 0 },
    { assign: "Ihor Morhun", daysTotal: 0, time: 0 },
    { assign: "Alexander Herhel", daysTotal: 0, time: 0 },
    { assign: "Daria Pronina", daysTotal: 0, time: 0 },
    { assign: "Denys Ivko", daysTotal: 0, time: 0 },
    { assign: "Unassigned", daysTotal: 0, time: 0 },
  ],
};

chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, {
      message: "clicked_browser_action",
    });
  });
});

// on install
chrome.runtime.onInstalled.addListener(() => {
  console.log("initial");
  chrome.storage.sync.get(["teams"], (items) => {
    if (!items.teams) {
      chrome.storage.sync.set({ teams: teams });
    }
  });
});
