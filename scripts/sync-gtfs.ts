// Downloads Metro-North's static GTFS timetable and writes the small lookup file the
// extension ships with: src/lib/mta/rail/static.json.
//
// Run with `npm run gtfs:sync` when MTA publishes a new schedule (a few times a year).
// The live feed only has IDs; this file turns them into station names, line names
// and peak/off-peak.
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { strFromU8, unzipSync } from 'fflate';

const SOURCE = 'https://rrgtfsfeeds.s3.amazonaws.com/gtfsmnr.zip';
const OUT = resolve(import.meta.dirname, '../src/lib/mta/rail/static.json');

/** Parses CSV into objects keyed by the header row. Handles quoted fields with commas and "" escapes. */
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') quoted = false;
      else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      if (row.some((f) => f !== '')) rows.push(row);
      row = [];
      field = '';
    } else field += c;
  }
  if (field !== '' || row.length > 0) rows.push([...row, field]);

  const [header, ...data] = rows;
  const keys = header.map((h) => h.replace(/^﻿/, '').trim());
  return data.map((r) => Object.fromEntries(keys.map((k, i) => [k, r[i] ?? ''])));
}

console.log(`Downloading ${SOURCE}`);
const res = await fetch(SOURCE);
if (!res.ok) throw new Error(`Download failed: ${res.status} ${res.statusText}`);
const files = unzipSync(new Uint8Array(await res.arrayBuffer()), {
  filter: (f) => ['stops.txt', 'routes.txt', 'trips.txt', 'stop_times.txt'].includes(f.name),
});
const read = (name: string) => parseCsv(strFromU8(files[name]));

const trips = read('trips.txt');

// Which routes (lines) stop at each station, for the line colors in the station search
const routeByTrip = new Map(trips.map((t) => [t.trip_id, t.route_id]));
const routesByStop = new Map<string, Set<string>>();
for (const st of read('stop_times.txt')) {
  const route = routeByTrip.get(st.trip_id);
  if (!route) continue;
  if (!routesByStop.has(st.stop_id)) routesByStop.set(st.stop_id, new Set());
  routesByStop.get(st.stop_id)!.add(route);
}

// Only stations with scheduled Metro-North service; the rest can never show trains
const stations: Record<string, { name: string; routes: string[] }> = {};
for (const s of read('stops.txt')) {
  const routes = routesByStop.get(s.stop_id);
  if (routes) stations[s.stop_id] = { name: s.stop_name, routes: [...routes].sort() };
}

const routes: Record<string, { name: string; color: string }> = {};
for (const r of read('routes.txt')) {
  routes[r.route_id] = { name: r.route_long_name, color: `#${r.route_color}` };
}

// A train number runs on many dates (one static trip each). A few numbers have
// mixed peak flags across dates, so use the majority.
const peakVotes = new Map<string, number>();
for (const t of trips) {
  const vote = t.peak_offpeak === '1' ? 1 : -1;
  peakVotes.set(t.trip_short_name, (peakVotes.get(t.trip_short_name) ?? 0) + vote);
}
const peakTrains = [...peakVotes]
  .filter(([, votes]) => votes > 0)
  .map(([train]) => train)
  .sort((a, b) => Number(a) - Number(b));

const data = { generatedAt: new Date().toISOString(), source: SOURCE, stations, routes, peakTrains };
writeFileSync(OUT, JSON.stringify(data, null, 1) + '\n');
console.log(
  `Wrote ${OUT}: ${Object.keys(stations).length} stations, ${Object.keys(routes).length} routes, ` +
    `${peakTrains.length} of ${peakVotes.size} train numbers are peak`,
);
