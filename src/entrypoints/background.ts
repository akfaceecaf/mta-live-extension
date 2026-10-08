// Background service worker. Chrome starts and stops it as needed, so don't keep
// state in variables here. Put anything that must persist in chrome.storage.
import type { Message, MessageResponse } from '@/lib/messaging';

chrome.runtime.onInstalled.addListener(({ reason }) => {
  console.log('[mta-live] installed:', reason);
});

// Clicking the toolbar icon opens the settings page for now
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
  switch (message.type) {
    case 'PING': {
      const response: MessageResponse['PING'] = { type: 'PONG', at: Date.now() };
      sendResponse(response);
      return false;
    }
  }
});
