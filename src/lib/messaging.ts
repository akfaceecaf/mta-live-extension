// Typed messages between the content script / options page and the background worker.
// Network requests go through the background worker: it has host_permissions for the
// MTA API, while a content script's fetch is subject to the host page's CORS rules.

export type Message = { type: 'PING' };

export type MessageResponse = {
  PING: { type: 'PONG'; at: number };
};

export function sendMessage<M extends Message>(message: M): Promise<MessageResponse[M['type']]> {
  return chrome.runtime.sendMessage(message);
}
