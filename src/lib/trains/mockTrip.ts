import type { Departure, Trip } from './types';

// Example data for designing the UI before the real MTA feed is connected.
// Times are relative to `now`, so the countdowns and the "upcoming" state always look realistic.

const SCHEDULE: Array<{ in: number; ride: number; track: string; peak: boolean; terminal: string }> = [
  { in: 4, ride: 112, track: '19', peak: true, terminal: 'New Haven' },
  { in: 19, ride: 86, track: '24', peak: true, terminal: 'New Haven-State St' },
  { in: 38, ride: 109, track: '21', peak: false, terminal: 'New Haven' },
  { in: 64, ride: 115, track: '17', peak: false, terminal: 'New Haven' },
  { in: 95, ride: 108, track: '23', peak: false, terminal: 'New Haven' },
];

export function createMockTrip(now = new Date()): Trip {
  // Start of the current minute, so countdowns are whole minutes
  const base = Math.floor(now.getTime() / 60_000) * 60_000;
  const at = (minutes: number) => new Date(base + minutes * 60_000).toISOString();

  const departures: Departure[] = SCHEDULE.map((t, i) => ({
    id: `mock-${i}`,
    line: 'new-haven',
    terminal: t.terminal,
    departsAt: at(t.in),
    arrivesAt: at(t.in + t.ride),
    track: t.track,
    peak: t.peak,
  }));

  return { origin: 'Grand Central', destination: 'New Haven', departures };
}
