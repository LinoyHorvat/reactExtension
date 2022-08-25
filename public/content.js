/*global chrome*/
let iframeOverlay = document.createElement("div");
let iframe = document.createElement("iframe");
let closeButton = document.createElement("button");
closeButton.className = "x-button";
closeButton.innerText = "X";
closeButton.onclick = toggle;

const init = async function () {
  iframeOverlay.className = "frameOverlay";
  iframeOverlay.id = "iframeOverlayId";
  iframeOverlay.draggable = true;
  iframe.draggable = true;
  iframe.src = chrome.runtime.getURL("/index.html");
  iframe.style.cssText = "display:block;" + "z-index:1000;";
  iframeOverlay.appendChild(iframe);
  iframeOverlay.appendChild(closeButton);
  document.body.appendChild(iframeOverlay);
};

init();

function toggle() {
  if (iframe.style.display === "none") {
    iframe.style.display = "block";
    closeButton.classList.toggle("rotate_to_side");
    iframeOverlay.classList.add("maximize");
    iframeOverlay.classList.remove("minimize");
  } else {
    iframe.style.display = "none";
    closeButton.classList.toggle("rotate_to_side");
    iframeOverlay.classList.remove("maximize");
    iframeOverlay.classList.add("minimize");
  }
}

iframe.style.display = "none";
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.message === "clicked_browser_action") {
    toggle();
  }
  if (request.length) {
    iframe.style.height = request.length * 20 + 118 + "px";
  }
  if (request.message === "scrap Jira") {
    scrapJira();
  }
});

dragElement(document.getElementById("iframeOverlayId"));

function dragElement(elmnt) {
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  elmnt.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    e = e || window.event;
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    elmnt.style.top = elmnt.offsetTop - pos2 + "px";
    elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
  }
  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

function fetchAllSprints() {
  const isSprintDiv = (div) => {
    const classesNamesArray = [
      "ghx-backlog-container",
      "js-sprint-container",
      "ui-droppable",
    ];
    const classNameOpen = "ghx-open";
    const classNameClosed = "ghx-closed";
    const classNamePlanned = "ghx-sprint-planned";
    const classNameActive = "ghx-sprint-active";
    return (
      div.classList.contains(
        classesNamesArray && classNameOpen && classNamePlanned
      ) ||
      div.classList.contains(
        classesNamesArray && classNameClosed && classNamePlanned
      ) ||
      div.classList.contains(
        classesNamesArray && classNameOpen && classNameActive
      ) ||
      div.classList.contains(
        classesNamesArray && classNameClosed && classNameActive
      )
    );
  };

  setTimeout(() => {
    const sprintsArr = [];
    const allSprints = document.querySelectorAll("[data-sprint-id]");
    let sprintId;
    allSprints.forEach((div) => {
      if (isSprintDiv(div)) {
        const sprintName = div.querySelector(".ghx-name").textContent;
        sprintId = div.attributes["data-sprint-id"].textContent;
        const sprintObj = { sprintName: sprintName, sprintId: sprintId };
        sprintsArr.push(sprintObj);
      }
    });
    chrome.storage.sync.set({ sprintsArr: sprintsArr });
    sprintId = sprintsArr.length > 0 ? sprintsArr[0].sprintId : "1939";
    chrome.storage.sync.get(["chosenSprintId"], (items) => {
      sprintId = Number(items.chosenSprintId);
    });
  }, 4000);
}

const scrapJira = () => {
  const getAllDataFromJira = (sprint) => {
    let data = [];
    const sprintTable = sprint.querySelector(".ghx-has-issues");
    const len = sprintTable.childNodes.length;
    for (let i = 1; i < len - 2; i++) {
      const task = sprintTable.children[i].querySelector(
        "span.ghx-end.ghx-items-container"
      );
      let assign, time;
      if (task.childNodes.length === 3) {
        assign = "Unassigned";
        time = Number(task.children[2].innerHTML.replace("d", ""));
      } else {
        assign = task.children[0].getAttribute("alt").replace("Assignee: ", "");
        time = Number(task.children[3]?.innerHTML.replace("d", ""));
      }
      if (!time) time = 0;
      const obj = { assign: assign, time: time };
      data.push(obj);
    }
    sortData(data);
  };
  const sortData = (data) => {
    const returnData = [];
    const dataObj = {};
    data.forEach((obj) => {
      const name = obj.assign;
      dataObj.hasOwnProperty(name)
        ? (dataObj[name].time += obj.time)
        : (dataObj[name] = obj);
    });
    for (const assign in dataObj) {
      returnData.push({ assign: assign, time: dataObj[assign].time });
    }
    chrome.storage.sync.set({ dataFromJira: returnData });
    chrome.runtime.sendMessage({ greeting: "hello" }, function (response) {});
  };
  let id;
  chrome.storage.sync.get(["chosenSprintId"], (items) => {
    id = items.chosenSprintId;
    return id;
  });
  setTimeout(() => {
    const sprint = document.querySelector(`[data-sprint-id="${id}"]`);
    getAllDataFromJira(sprint);
  }, 100);
};

fetchAllSprints();
