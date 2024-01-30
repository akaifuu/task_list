chrome.runtime.onStartup.addListener(function () {
  checkAndShowPopup();
});

chrome.runtime.onInstalled.addListener(() => {
  // Set an alarm for 8 PM every day
  chrome.alarms.create("dailyCheck", {
    when: get8PMToday(),
    periodInMinutes: 1440,
  });

  // Set an hourly check alarm
  chrome.alarms.create("hourlyCheck", { periodInMinutes: 60 });

  // Set an alarm for 23:59 every day to clear the list
  chrome.alarms.create("clearList", {
    when: getSpecificTimeToday(23, 59),
    periodInMinutes: 1440,
  });

  // On alarm, open the checklist
  // Alarm listener
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "dailyCheck") {
      chrome.tabs.create({ url: "checklist.html" });
    } else if (alarm.name === "clearList") {
      clearToDoList();
    } else if (alarm.name === "hourlyCheck") {
      checkAndShowPopup();
    }
  });
});

// Function to calculate the time for 8 PM today
function get8PMToday() {
  let now = new Date();
  let eightPM = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    20,
    0,
    0,
    0
  );
  return eightPM.getTime();
}

// Function to calculate the time for a specific hour and minute today
function getSpecificTimeToday(hour, minute) {
  let now = new Date();
  let specificTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hour,
    minute,
    0,
    0
  );
  return specificTime.getTime();
}

// Function to clear the to-do list
function clearToDoList() {
  chrome.storage.sync.set({ items: [] }, function () {
    console.log("ToDo list cleared.");
  });
}

// Function to check if the popup should be shown
function checkAndShowPopup() {
  let today = new Date().toDateString(); // Get today's date as a string

  chrome.storage.sync.get({ lastPopupDate: "" }, function (data) {
    if (today !== data.lastPopupDate) {
      chrome.storage.sync.set({ lastPopupDate: today }, function () {
        chrome.tabs.create({ url: "popup.html" }); // Open the popup page in a new tab
      });
    }
  });
}
