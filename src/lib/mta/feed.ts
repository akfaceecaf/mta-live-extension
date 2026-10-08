import GtfsRealtimeBindings from 'gtfs-realtime-bindings';

export type FeedMessage = GtfsRealtimeBindings.transit_realtime.FeedMessage;

/** Fetches a GTFS-Realtime feed and decodes the protobuf into a FeedMessage. */
export async function fetchFeed(url: string): Promise<FeedMessage> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MTA feed request failed: ${res.status} ${res.statusText}`);
  const buffer = new Uint8Array(await res.arrayBuffer());
  return GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(buffer);
}
