import { useStoredState } from './useStoredState';

/** User preferences, saved in chrome.storage.local and shared by every extension context */
export interface Settings {
  /** Station IDs (static GTFS stop_id) of the route to track. null until the user picks one. */
  originId: string | null;
  destinationId: string | null;
  /** A departure within this many minutes counts as "departing soon": red time, shaking tab */
  upcomingThresholdMin: number;
}

export const DEFAULT_SETTINGS: Settings = {
  originId: null,
  destinationId: null,
  upcomingThresholdMin: 30,
};

export const UPCOMING_THRESHOLD_RANGE = { min: 1, max: 120 } as const;

/** Current settings, with defaults filled in for any not saved yet */
export function useSettings(): [Settings, (patch: Partial<Settings>) => void, boolean] {
  const [stored, setStored, loaded] = useStoredState<Partial<Settings>>('settings', {});
  const settings = { ...DEFAULT_SETTINGS, ...stored };
  return [settings, (patch) => setStored({ ...stored, ...patch }), loaded];
}
