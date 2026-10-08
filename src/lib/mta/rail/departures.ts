// Turns the decoded live feed into the display model for one origin → destination route.
import type { Departure, Trip } from '@/lib/trains/types';
import { lineForRoute } from '@/lib/trains/lines';
import type { LiveFeed } from './decode';
import { isPeakTrain, routeName, stationName } from './staticData';

/** Most departures returned; the popup shows the first, "View more" shows the rest */
export const MAX_DEPARTURES = 5;

export function findDepartures(
  feed: LiveFeed,
  originId: string,
  destinationId: string,
  now = new Date(),
): Trip {
  const nowSec = now.getTime() / 1000;
  const departures: Departure[] = [];

  for (const train of feed.trains) {
    const from = train.stops.findIndex((s) => s.stopId === originId);
    const to = train.stops.findIndex((s) => s.stopId === destinationId);
    // Must stop at both, in this direction
    if (from === -1 || to === -1 || from >= to) continue;

    const origin = train.stops[from];
    const destination = train.stops[to];
    const departs = origin.departure ?? origin.arrival;
    const arrives = destination.arrival ?? destination.departure;
    if (departs === undefined || arrives === undefined || departs < nowSec - 60) continue;

    departures.push({
      id: train.trainNumber,
      line: lineForRoute(train.routeId),
      lineName: routeName(train.routeId),
      terminal: stationName(train.stops[train.stops.length - 1].stopId),
      departsAt: new Date(departs * 1000).toISOString(),
      arrivesAt: new Date(arrives * 1000).toISOString(),
      track: origin.track,
      peak: isPeakTrain(train.trainNumber),
    });
  }

  departures.sort((a, b) => a.departsAt.localeCompare(b.departsAt));

  return {
    origin: stationName(originId),
    destination: stationName(destinationId),
    departures: departures.slice(0, MAX_DEPARTURES),
  };
}
