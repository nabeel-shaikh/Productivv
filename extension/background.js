// background.js

// Helper to get current state from storage
async function getTrackingState() {
  const result = await chrome.storage.local.get(['trackingState']);
  return result.trackingState || null;
}

// Helper to save state
async function setTrackingState(state) {
  await chrome.storage.local.set({ trackingState: state });
}

// Helper to clear state
async function clearTrackingState() {
  await chrome.storage.local.remove(['trackingState']);
}

// Function to log activity to the backend
async function logActivity(url, title, duration, startTimeStr) {
  // Check if extension is active
  const result = await chrome.storage.local.get(['isExtensionActive']);
  if (result.isExtensionActive === false) {
    console.log('Extension is inactive, skipping log.');
    return;
  }

  if (!url || !duration || duration < 120) return; // Ignore logs < 2 minutes

  // Determine category/productivity (Basic logic for now, can be improved or done on backend)
  let productivity = 'neutral';
  let category = 'Other';

  if (url.includes('github.com') || url.includes('stackoverflow.com') || url.includes('docs.') || url.includes('chatgpt.com')) {
    productivity = 'productive';
    category = 'Development';
  } else if (url.includes('youtube.com') || url.includes('netflix.com') || url.includes('reddit.com') || url.includes('instagram.com')) {
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
    await fetch("http://localhost:5001/api/activity", {
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

// Core tracking logic
async function handleActivityUpdate() {
  const now = new Date();
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  
  // Get previous state
  const prevState = await getTrackingState();

  if (prevState) {
    // Calculate duration for the previous activity
    const startTime = new Date(prevState.startTime);
    const duration = (now - startTime) / 1000;
    
    // Log the *previous* activity
    if (prevState.url && duration > 0) {
      await logActivity(prevState.url, prevState.title, duration, prevState.startTime);
    }
  }

  // Start tracking new activity
  if (tabs.length > 0) {
    const tab = tabs[0];
    if (tab.url && !tab.url.startsWith('chrome://')) {
      await setTrackingState({
        url: tab.url,
        title: tab.title,
        startTime: now.toISOString()
      });
    } else {
      await clearTrackingState();
    }
  } else {
    await clearTrackingState();
  }
}

// Listeners
chrome.tabs.onActivated.addListener(handleActivityUpdate);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.url && tab.active) {
    handleActivityUpdate();
  }
});

chrome.windows.onFocusChanged.addListener(async (windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Browser lost focus - stop tracking/log current
    const now = new Date();
    const prevState = await getTrackingState();
    if (prevState) {
      const startTime = new Date(prevState.startTime);
      const duration = (now - startTime) / 1000;
      await logActivity(prevState.url, prevState.title, duration, prevState.startTime);
      await clearTrackingState();
    }
  } else {
    // Window focused - check if we need to restart or just continue
    // Ideally we just re-evaluate active tab
    handleActivityUpdate();
  }
});

// Handle browser close / cleanup
chrome.runtime.onSuspend.addListener(async () => {
    const now = new Date();
    const prevState = await getTrackingState();
    if (prevState) {
      const startTime = new Date(prevState.startTime);
      const duration = (now - startTime) / 1000;
      await logActivity(prevState.url, prevState.title, duration, prevState.startTime);
      await clearTrackingState();
    }
});
