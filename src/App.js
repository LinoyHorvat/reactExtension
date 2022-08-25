/*global chrome*/
import React, { useEffect, useState } from "react";
import Table from "./components/Table/Table";
import TableHead from "./components/Table/TableHead";
import TableTotal from "./components/Table/TableTotal";
import "./App.css";

const getTeams = async () => {
  return await chrome.storage.sync.get(["teams"]);
};

function App() {
  const [dataFromJira, setDataFromJira] = useState([]);
  const [chosenTeam, setChosenTeam] = useState("fintechCore");
  const [teams, setTeams] = useState(getTeams());
  const [chosenSprint, setChosenSprint] = useState(Number);
  const [sprintsArr, setSprintsArr] = useState([]);
  const [refreshPage, setRefreshPage] = useState(false);

  const getData = async () => {
    try {
      await chrome.storage.sync.get(["dataFromJira"], (items) => {
        setDataFromJira(items.dataFromJira);
      });
      await chrome.storage.sync.get(["sprintsArr"], (items) => {
        setSprintsArr((prev) => items.sprintsArr);
      });
      await chrome.storage.sync.get(["chosenSprintId"], (items) => {
        setChosenSprint((prev) => items.chosenSprintId);
      });
      await chrome.storage.sync.get(["teams"], (items) => {
        setTeams((prev) => items.teams);
      });
    } catch (error) {
      console.log(error);
    }
  };

  const handleChange = (e, name, colName, index) => {
    let newData = { ...teams };
    newData[chosenTeam][index].daysTotal = Number(e.target.value);
    setTeams(newData);
    chrome.storage.sync.set({ teams: newData }, () => {});
  };

  const getDocumentBody = async () => {
    let queryOptions = { active: true, currentWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  };
  const addEventListenersFromTab = () => {
    chrome.runtime.onMessage.addListener(function (
      request,
      sender,
      sendResponse
    ) {
      setRefreshPage((prev) => !prev);

      if (request.greeting === "hello") {
        sendResponse({ farewell: "goodbye" });
      }
    });
  };
  const addEventListenerFromJira = () => {
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
          assign = task.children[0]
            .getAttribute("alt")
            .replace("Assignee: ", "");
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
    const config = { subtree: true, childList: true };
    setTimeout(() => {
      const sprint = document.querySelector(`[data-sprint-id="${id}"]`);
      const callback = (mutationsList, observer) => {
        getAllDataFromJira(sprint);
      };
      const observer = new MutationObserver(callback);
      //   observer.disconnect();
      observer.observe(sprint, config);
    }, 5000);
    const editWindow = document.body.querySelector(
      '[data-test-id="issue-view-layout-templates-views.ui.context.visible-hidden.ui.primary-items"]'
    );
  };
  const activateScriptOnJira = () => {
    if (document.readyState === "complete") {
      getDocumentBody().then((tab) =>
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: addEventListenerFromJira,
        })
      );
    } else {
      setTimeout(() => {
        activateScriptOnJira();
      }, 1000);
    }
  };
  useEffect(() => {
    try {
      getData();
      activateScriptOnJira();
      addEventListenersFromTab(); //message api
      sendTeamSizeToContentScript(teams[chosenTeam]);
    } catch (e) {
      console.log(e);
    }
  }, []);

  useEffect(() => {
    getData();
  }, [refreshPage, chosenSprint]);

  const showData = () => {
    const team =
      chosenTeam === "fintechCore"
        ? teams.fintechCore
        : teams.fintechCoreTurboTeam;
    if (!team) {
      return;
    }
    return teams[chosenTeam].map((userObj, index) => {
      const dataFromJiraUser = dataFromJira.find((user) => {
        return user.assign === userObj.assign;
      });
      return (
        <div key={index}>
          <Table
            handleChange={handleChange}
            data={teams[chosenTeam][index]}
            assign={userObj.assign}
            index={index}
            dataFromJira={dataFromJiraUser ? dataFromJiraUser : 0}
            refreshPage={refreshPage}
          />
        </div>
      );
    });
  };

  const showTotal = () => {
    let totalTime = 0;
    let totalDays = 0;
    const team =
      chosenTeam === "fintechCore"
        ? teams.fintechCore
        : teams.fintechCoreTurboTeam;
    if (!team) {
      return;
    }
    teams[chosenTeam].forEach((userObj) => {
      const dataFromJiraUser = dataFromJira.find((user) => {
        return user.assign === userObj.assign;
      });
      if (dataFromJiraUser) totalTime += dataFromJiraUser.time;
      totalDays += userObj.daysTotal;
    });
    return (
      <TableTotal
        handleChange={handleChange}
        totalTime={totalTime}
        totalDays={totalDays}
      />
    );
  };

  const showSprintsOptions = () => {
    return sprintsArr.map((sprint) => {
      return (
        <option key={sprint.sprintId} value={sprint.sprintId}>
          {sprint.sprintName}
        </option>
      );
    });
  };

  const selectSprint = async (e) => {
    setChosenSprint(e.target.value);
    await chrome.storage.sync.set({ chosenSprintId: e.target.value });
    setRefreshPage((prev) => !prev);
    getData();
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { message: "scrap Jira" },
        function (response) {
          console.log(response.farewell);
        }
      );
    });
    activateScriptOnJira()
  };

  const sendTeamSizeToContentScript = (team) => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(
        tabs[0].id,
        { length: team.length ?? 6 },
        function (response) {}
      );
    });
  };
  const selectTeam = async (e) => {
    await setChosenTeam(e.target.value);
    const team = teams[e.target.value];
    sendTeamSizeToContentScript(team);
    getData();
  };

  return (
    <div className="App">
      <div className="selects-div">
        <label htmlFor="Sprints"> Sprint:</label>
        <select
          id="selectSprint"
          name="Sprints"
          onChange={selectSprint}
          value={chosenSprint}
        >
          {sprintsArr && sprintsArr.length > 0 && showSprintsOptions()}
        </select>
        <label htmlFor="Team"> Team:</label>
        <select name="Team" onChange={selectTeam} value={chosenTeam}>
          <option key={"fintechCore"} value={"fintechCore"}>
            fintechCore
          </option>
          )
          <option key={"fintechCoreTurboTeam"} value={"fintechCoreTurboTeam"}>
            fintechCoreTurboTeam
          </option>
          )
        </select>
      </div>
      <TableHead />
      <div className="container">
        {dataFromJira && dataFromJira.length > 0 && showData()}
        {dataFromJira && dataFromJira.length > 0 && showTotal()}
      </div>
    </div>
  );
}

export default App;
