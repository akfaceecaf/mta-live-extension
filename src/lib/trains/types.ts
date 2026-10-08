// Display model for the UI. Real MTA data will be mapped into these shapes later,
// so components never depend on the raw GTFS feed format.

export type LineId = 'hudson' | 'harlem' | 'new-haven' | 'port-jervis' | 'pascack-valley';

export interface Departure {
  id: string;
  line: LineId;
  /** Where this train ends its run, shown on the line badge (e.g. "New Haven") */
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
