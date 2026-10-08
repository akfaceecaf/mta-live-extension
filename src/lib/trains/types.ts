// Display model for the UI. MTA data is mapped into these shapes (see src/lib/mta/rail/departures.ts),
// so components never depend on the raw GTFS feed format.

/** Color family for a train's line badge. The New Haven line's branches share its red. */
export type LineId = 'hudson' | 'harlem' | 'new-haven';

export interface Departure {
  /** Train number, e.g. "1497" */
  id: string;
  line: LineId;
  /** Line or branch name from the timetable, e.g. "New Canaan" */
  lineName: string;
  /** Where this train ends its run, shown on the line badge (e.g. "Grand Central") */
  terminal: string;
  /** ISO timestamps */
  departsAt: string;
  arrivesAt: string;
  track?: string;
  peak: boolean;
}

export interface Trip {
  origin: string;
  destination: string;
  departures: Departure[];
}
