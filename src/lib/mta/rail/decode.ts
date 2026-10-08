// Decodes the Metro-North GTFS-Realtime feed with the official gtfs-realtime-bindings
// and flattens it into the few fields this app uses.
import GtfsRealtimeBindings from 'gtfs-realtime-bindings';
import protobuf from 'protobufjs/minimal.js';

type StopTimeUpdate = GtfsRealtimeBindings.transit_realtime.TripUpdate.IStopTimeUpdate;

export interface LiveStop {
  stopId: string;
  /** Epoch seconds */
  arrival?: number;
  departure?: number;
  track?: string;
}

export interface LiveTrain {
  /** Entity ID, which for Metro-North is the train number (static trips.txt trip_short_name) */
  trainNumber: string;
  routeId: string;
  /** Upcoming stops in order. Stops the train has already left aren't included. */
  stops: LiveStop[];
}

export interface LiveFeed {
  /** Epoch seconds when MTA generated the feed */
  timestamp: number;
  trains: LiveTrain[];
}

/** MTA's railroad extension on StopTimeUpdate; its field 1 is the track */
const MTA_RAILROAD_FIELD = 1005;
const MTA_TRACK_FIELD = 1;

/**
 * The bindings don't know MTA's extension, but keep its raw bytes in `$unknowns`.
 * Each entry is one whole field (tag + length + body). MTA sends the extension twice
 * per stop, so return the first non-empty track.
 */
function readTrack(stop: StopTimeUpdate): string | undefined {
  for (const raw of stop.$unknowns ?? []) {
    const reader = protobuf.Reader.create(raw);
    if (reader.uint32() >>> 3 !== MTA_RAILROAD_FIELD) continue;
    const end = reader.uint32() + reader.pos;
    while (reader.pos < end) {
      const tag = reader.uint32();
      if (tag >>> 3 !== MTA_TRACK_FIELD) {
        reader.skipType(tag & 7);
        continue;
      }
      const track = reader.string();
      if (track) return track;
    }
  }
  return undefined;
}

/** int64 times come back as a number or a Long object, depending on the environment */
const toSeconds = (time: number | Long | null | undefined) => (time == null ? undefined : Number(time));

export function decodeFeed(bytes: Uint8Array): LiveFeed {
  const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(bytes);
  return {
    timestamp: toSeconds(feed.header.timestamp) ?? 0,
    trains: feed.entity
      .filter((e) => e.tripUpdate)
      .map((e) => ({
        trainNumber: e.id,
        routeId: e.tripUpdate!.trip.routeId ?? '',
        stops: (e.tripUpdate!.stopTimeUpdate ?? []).map((s) => ({
          stopId: s.stopId ?? '',
          arrival: toSeconds(s.arrival?.time),
          departure: toSeconds(s.departure?.time),
          track: readTrack(s),
        })),
      })),
  };
}

/** Fetches and decodes a Metro-North GTFS-Realtime feed */
export async function fetchFeed(url: string): Promise<LiveFeed> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`MTA feed request failed: ${res.status} ${res.statusText}`);
  return decodeFeed(new Uint8Array(await res.arrayBuffer()));
}
