// Background service worker for WCA Competitions Tracker
// Handles side panel opening and view mode preferences

// Function to update action based on view mode preference
async function updateActionBasedOnPreference() {
    const result = await chrome.storage.sync.get(["preferredViewMode"]);
    const viewMode = result.preferredViewMode || "popup";

    console.log("Updating action for view mode:", viewMode);

    if (viewMode === "popup") {
        // Set popup to open when icon is clicked
        await chrome.action.setPopup({ popup: "popup.html" });
        console.log("Action set to popup mode");
    } else {
        // Clear popup so onClicked listener fires
        await chrome.action.setPopup({ popup: "" });
        console.log("Action set to sidebar mode (popup cleared)");
    }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Background received message:", message);

    if (message.action === "openSidePanel") {
        // Open the side panel
        // Get the current window since popup doesn't have a tab
        chrome.windows.getCurrent((window) => {
            chrome.sidePanel.open({ windowId: window.id })
                .then(() => {
                    console.log("Side panel opened successfully");
                    sendResponse({ success: true });
                })
                .catch((error) => {
                    console.error("Error opening side panel:", error);
                    sendResponse({ success: false, error: error.message });
                });
        });
        return true; // Keep message channel open for async response
    }

    if (message.action === "updateViewModePreference") {
        // Update the action when preference changes
        updateActionBasedOnPreference();
        sendResponse({ success: true });
        return true;
    }

    if (message.action === "checkViewMode") {
        // Check if we should open as side panel based on saved preference
        chrome.storage.sync.get(["preferredViewMode"], (result) => {
            sendResponse({ viewMode: result.preferredViewMode || "popup" });
        });
        return true; // Keep message channel open for async response
    }
});

// When extension icon is clicked (only fires when popup is not set)
chrome.action.onClicked.addListener(async (tab) => {
    console.log("Extension icon clicked - opening side panel");

    // This only fires when popup is cleared (sidebar mode)
    try {
        await chrome.sidePanel.open({ windowId: tab.windowId });
        console.log("Side panel opened from icon click");
    } catch (error) {
        console.error("Error opening side panel:", error);
    }
});

// Initialize on extension startup
chrome.runtime.onStartup.addListener(() => {
    console.log("Extension started");
    updateActionBasedOnPreference();
});

// Initialize on extension installation or update
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed/updated");
    updateActionBasedOnPreference();
});

// Listen for storage changes to update action dynamically
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "sync" && changes.preferredViewMode) {
        console.log("View mode preference changed:", changes.preferredViewMode.newValue);
        updateActionBasedOnPreference();
    }
});
