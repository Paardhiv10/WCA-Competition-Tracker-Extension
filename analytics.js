const POSTHOG_TOKEN = "phc_kBw8eA8BM95s9aVa8kwWK59oCJffmUoaqSdBviSghSDt";
const POSTHOG_HOST = "https://us.i.posthog.com";
const IS_DEV = !('update_url' in chrome.runtime.getManifest());

async function getDistinctId() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['analytics_id'], (result) => {
      if (result.analytics_id) {
        resolve(result.analytics_id);
      } else {
        const id = crypto.randomUUID();
        chrome.storage.local.set({ analytics_id: id });
        resolve(id);
      }
    });
  });
}

async function capture(event, properties = {}) {
  try {
    const distinctId = await getDistinctId();
    await fetch(`${POSTHOG_HOST}/capture/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: POSTHOG_TOKEN,
        event,
        distinct_id: distinctId,
        properties: {
          $lib: 'chrome-extension',
          extension_version: chrome.runtime.getManifest().version,
          is_dev: IS_DEV,
          ...properties
        }
      })
    });
  } catch (e) {
    // analytics must never break the extension
  }
}
