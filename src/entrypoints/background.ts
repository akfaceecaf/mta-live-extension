// Background service worker. Chrome starts and stops it as needed, so module variables
// can disappear at any time. Only use them for caches; put anything that must
// persist in chrome.storage.
import type { Message, MessageResponse } from '@/lib/messaging';
import { env } from '@/lib/env';
import { fetchFeed, type LiveFeed } from '@/lib/mta/rail/decode';
import { findDepartures } from '@/lib/mta/rail/departures';

/** Reuse a fetched feed this long, so many open tabs share one request */
const FEED_CACHE_MS = 30_000;

let cache: { feed: LiveFeed; fetchedAt: number } | undefined;
let inFlight: Promise<LiveFeed> | undefined;

async function getFeed(): Promise<LiveFeed> {
  if (cache && Date.now() - cache.fetchedAt < FEED_CACHE_MS) return cache.feed;
  // Several tabs asking at once share a single request
  inFlight ??= fetchFeed(env.mtaMnrFeedUrl)
    .then((feed) => {
      cache = { feed, fetchedAt: Date.now() };
      return feed;
    })
    .finally(() => {
      inFlight = undefined;
    });
  return inFlight;
}

async function getTrip(originId: string, destinationId: string): Promise<MessageResponse['GET_TRIP']> {
  try {
    const feed = await getFeed();
    return {
      ok: true,
      trip: findDepartures(feed, originId, destinationId),
      updatedAt: new Date(feed.timestamp * 1000).toISOString(),
    };
  } catch (err) {
    console.error('[mta-live] feed error', err);
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
  console.log('[mta-live] installed:', reason);
});

// Clicking the toolbar icon opens the settings page for now
chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

chrome.runtime.onMessage.addListener((message: Message, _sender, sendResponse) => {
  switch (message.type) {
    case 'GET_TRIP':
      getTrip(message.originId, message.destinationId).then(sendResponse);
      // Returning true tells Chrome the response will be sent asynchronously
      return true;
    case 'OPEN_OPTIONS':
      chrome.runtime.openOptionsPage();
      return false;
  }
});
