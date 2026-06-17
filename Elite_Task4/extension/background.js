let currentTab = "";
let startTime = Date.now();

const productiveSites = [
  "github.com",
  "leetcode.com",
  "stackoverflow.com",
  "hackerrank.com",
  "geeksforgeeks.org",
  "codepen.io",
  "w3schools.com",
];

function trackTime(newUrl) {
  if (!newUrl) return;

  // First tab
  if (!currentTab) {
    currentTab = newUrl;
    startTime = Date.now();
    return;
  }

  const timeSpent = Math.floor(
    (Date.now() - startTime) / 1000
  );

  const category = productiveSites.some((site) =>
    currentTab.includes(site)
  )
    ? "Productive"
    : "Unproductive";

  console.log("Sending data:", {
    website: currentTab,
    category,
    timeSpent,
  });

  fetch("http://localhost:5000/track", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      website: currentTab,
      category,
      timeSpent,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      console.log("Saved:", data);
    })
    .catch((err) => {
      console.error("Error:", err);
    });

  currentTab = newUrl;
  startTime = Date.now();
}

// When user switches tabs
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);

    if (tab.url) {
      trackTime(tab.url);
    }
  } catch (err) {
    console.error(err);
  }
});

// When page URL changes (refresh/navigation)
chrome.tabs.onUpdated.addListener(
  (tabId, changeInfo, tab) => {
    if (
      changeInfo.status === "complete" &&
      tab.active &&
      tab.url
    ) {
      trackTime(tab.url);
    }
  }
);