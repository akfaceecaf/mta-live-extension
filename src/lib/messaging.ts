// Typed messages between the content script / options page and the background worker.
// Network requests go through the background worker: it has host_permissions for the
// MTA API, while a content script's fetch is subject to the host page's CORS rules.
import type { Trip } from './trains/types';

export type Message =
  | { type: 'GET_TRIP'; originId: string; destinationId: string }
  /** Content scripts can't call chrome.runtime.openOptionsPage(), so they ask the background */
  | { type: 'OPEN_OPTIONS' };

export type MessageResponse = {
  GET_TRIP:
    | { ok: true; trip: Trip; /** ISO time the MTA feed was generated */ updatedAt: string }
    | { ok: false; error: string };
  OPEN_OPTIONS: void;
};

export function sendMessage<M extends Message>(message: M): Promise<MessageResponse[M['type']]> {
  return chrome.runtime.sendMessage(message);
}
