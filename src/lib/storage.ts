// Thin typed wrapper around chrome.storage.local. All user data stays on this device.
// Works from any extension context (background, content script, options page).

export async function getItem<T>(key: string): Promise<T | undefined> {
  const result = await chrome.storage.local.get(key);
  return result[key] as T | undefined;
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  await chrome.storage.local.set({ [key]: value });
}

export async function removeItem(key: string): Promise<void> {
  await chrome.storage.local.remove(key);
}

/** Calls `callback` whenever `key` changes, from any context. Returns an unsubscribe function. */
export function watchItem<T>(key: string, callback: (value: T | undefined) => void): () => void {
  const listener = (changes: Record<string, chrome.storage.StorageChange>, area: string) => {
    if (area === 'local' && key in changes) callback(changes[key].newValue as T | undefined);
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
