// background.js

let activeTabId = null;
let startTime = null;
let activeUrl = null;
let activeTitle = null;

// Function to log activity to the backend
async function logActivity(url, title, duration, startTimeStr) {
  if (!url || !duration || duration < 1) return; // Ignore short/empty logs

  // Determine category/productivity (Basic logic for now, can be improved or done on backend)
  let productivity = 'neutral';
  let category = 'Other';

  if (url.includes('github.com') || url.includes('stackoverflow.com') || url.includes('docs.')) {
    productivity = 'productive';
    category = 'Development';
  } else if (url.includes('youtube.com') || url.includes('netflix.com') || url.includes('reddit.com')) {
    productivity = 'unproductive';
    category = 'Entertainment';
  }

  const log = {
    url,
    title,
    timestamp: startTimeStr,
    duration, // seconds
    productivity,
    category
  };

  console.log('Sending log to backend:', log);

  try {
    await fetch("http://localhost:5000/api/activity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(log)
    });
  } catch (err) {
    console.error('Failed to send log to backend:', err);
  }
}

// Update the current active tab info
async function updateActiveTab() {
  try {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs.length > 0) {
      const tab = tabs[0];
      activeTabId = tab.id;
      activeUrl = tab.url;
      activeTitle = tab.title;
      startTime = new Date();
    } else {
      activeTabId = null;
      startTime = null;
    }
  } catch (error) {
    console.error("Error updating active tab:", error);
  }
}

// Handle tab switch or url update
async function handleTabChange() {
  const now = new Date();
  
  // If there was a previous active tab, log it
  if (startTime && activeUrl) {
    const duration = (now - startTime) / 1000; // seconds
    await logActivity(activeUrl, activeTitle, duration, startTime);
  }

  // Update to the new tab
  await updateActiveTab();
}

// Listeners
chrome.tabs.onActivated.addListener(handleTabChange);
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // Only handle if the active tab's URL changed
  if (tabId === activeTabId && changeInfo.url) {
    handleTabChange();
  }
});

chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Browser lost focus, log the last session
    const now = new Date();
    if (startTime && activeUrl) {
      const duration = (now - startTime) / 1000;
      logActivity(activeUrl, activeTitle, duration, startTime);
    }
    startTime = null; // Stop tracking
  } else {
    // Window focused, start tracking
    handleTabChange();
  }
});

// Initial setup
updateActiveTab();

