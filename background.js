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

    if (message.action === "switchToPopupMode") {
        // Handle switching from sidebar to popup
        console.log("Switching to popup mode, windowId:", message.windowId);

        // First update the preference
        updateActionBasedOnPreference().then(() => {
            // Wait for sidebar to close, then open popup
            setTimeout(async () => {
                try {
                    await chrome.action.openPopup({ windowId: message.windowId });
                    console.log("Popup opened after sidebar closed");
                } catch (error) {
                    console.log("Could not auto-open popup:", error);
                }
            }, 500); // 500ms delay to ensure sidebar is fully closed
        });

        sendResponse({ success: true });
        return true;
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
    setupNotificationsAlarm();
});

// Initialize on extension installation or update
chrome.runtime.onInstalled.addListener(() => {
    console.log("Extension installed/updated");
    updateActionBasedOnPreference();
    setupNotificationsAlarm();
});

// Listen for storage changes to update action dynamically
chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName === "sync") {
        if (changes.preferredViewMode) {
            console.log("View mode preference changed:", changes.preferredViewMode.newValue);
            updateActionBasedOnPreference();
        }
        if (changes.enableNotifications !== undefined || changes.preferredCountries !== undefined) {
            setupNotificationsAlarm();
        }
    }
});

// Notifications Feature 
const ALARM_NAME = "checkNewComps";
const FETCH_INTERVAL_MINUTES = 60;
const RECENT_THRESHOLD_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

let isCheckingComps = false;

async function checkNewCompetitions() {
    if (isCheckingComps) {
        console.log("Already checking competitions. Skipping to prevent duplicates.");
        return;
    }
    isCheckingComps = true;

    try {
        console.log("=== Starting checkNewCompetitions ===");
        const syncStore = await chrome.storage.sync.get(["preferredCountries", "enableNotifications"]);
        console.log("Sync Store:", syncStore);
        if (!syncStore.enableNotifications || !syncStore.preferredCountries || syncStore.preferredCountries.length === 0) {
            console.log("Notifications disabled or no countries selected. Exiting.");
            return;
        }

        const localStore = await chrome.storage.local.get(["knownCompIds", "monitoredCountries"]);
        let knownCompIds = localStore.knownCompIds || [];
        let monitoredCountries = localStore.monitoredCountries || [];
        let isInitialRun = !localStore.knownCompIds;
        console.log("Known Comp IDs length:", knownCompIds.length);
        console.log("Is Initial Run?", isInitialRun);
        console.log("Monitored Countries:", monitoredCountries);

        let newCompsFound = false;
        let newKnownCompIds = [...knownCompIds];
        const newCountriesToMonitor = syncStore.preferredCountries.filter(c => !monitoredCountries.includes(c));

        for (const countryCode of syncStore.preferredCountries) {
            const isCountryNewlyAdded = !monitoredCountries.includes(countryCode);
            try {
                console.log(`Fetching comps for country: ${countryCode}...`);
                const url = `https://www.worldcubeassociation.org/api/v0/competitions?country_iso2=${countryCode}&sort=-announced_at&per_page=20`;
                const response = await fetch(url);
                if (!response.ok) {
                    console.warn("API error", response.status);
                    continue;
                }

                const comps = await response.json();
                console.log(`Got ${comps.length} recent comps for ${countryCode}`);
                for (const comp of comps) {
                    if (!newKnownCompIds.includes(comp.id)) {
                        newKnownCompIds.push(comp.id);
                        newCompsFound = true;

                        if (comp.announced_at) {
                            const isRecent = (new Date() - new Date(comp.announced_at)) < RECENT_THRESHOLD_MS;
                            console.log(`Comp ${comp.id} announced on ${new Date(comp.announced_at).toLocaleDateString()}, isRecent: ${isRecent}`);

                            if (!isInitialRun && !isCountryNewlyAdded && isRecent) {
                                console.log(`--> TRIGGERING NOTIFICATION for ${comp.id}`);
                                const startDate = new Date(comp.start_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
                                // Provide comp.id as the notification ID to ensure idempotency (updates existing if already shown)
                                chrome.notifications.create(`comp-${comp.id}`, {
                                    type: 'basic',
                                    iconUrl: 'images/icon128.png',
                                    title: 'New WCA Competition!',
                                    message: `${comp.name} in ${comp.city}, ${comp.country_iso2}\nDate: ${startDate}`
                                });
                            } else {
                                if (isInitialRun) console.log(`Skipping notification for ${comp.id} (Initial Run Protection)`);
                                else if (isCountryNewlyAdded) console.log(`Skipping notification for ${comp.id} (Newly Added Country Protection: ${countryCode})`);
                                else if (!isRecent) console.log(`Skipping notification for ${comp.id} (Older than threshold)`);
                            }
                        }
                    }
                }
            } catch (error) {
                // Using warn instead of error to prevent prominent badges in Chrome Extensions page for standard network issues
                console.warn(`Error fetching competitions for ${countryCode} (Network down?):`, error.message);
            }
        }

        // Prevent strictly growing array forever by keeping only last 500
        if (newKnownCompIds.length > 500) {
            newKnownCompIds = newKnownCompIds.slice(newKnownCompIds.length - 500);
        }

        const monitoredCountriesChanged = monitoredCountries.length !== syncStore.preferredCountries.length || newCountriesToMonitor.length > 0;
        if (newCompsFound || isInitialRun || monitoredCountriesChanged) {
            await chrome.storage.local.set({
                knownCompIds: newKnownCompIds,
                monitoredCountries: syncStore.preferredCountries
            });
        }
        console.log("=== Check Complete ===");
    } finally {
        isCheckingComps = false;
    }
}

async function setupNotificationsAlarm() {
    const store = await chrome.storage.sync.get(["enableNotifications"]);
    if (store.enableNotifications) {
        chrome.alarms.get(ALARM_NAME, (alarm) => {
            if (!alarm) {
                chrome.alarms.create(ALARM_NAME, {
                    periodInMinutes: FETCH_INTERVAL_MINUTES
                });
            }
        });
        checkNewCompetitions();
    } else {
        chrome.alarms.clear(ALARM_NAME);
    }
}

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) {
        checkNewCompetitions();
    }
});

// Handle notification clicks to redirect to the competition page
chrome.notifications.onClicked.addListener((notificationId) => {
    console.log("Notification clicked:", notificationId);
    if (notificationId.startsWith("comp-")) {
        const compId = notificationId.substring("comp-".length);
        const compUrl = `https://www.worldcubeassociation.org/competitions/${compId}`;
        chrome.tabs.create({ url: compUrl }, (tab) => {
            console.log(`Opened tab for competition ${compId}:`, tab);
        });
    }
});

