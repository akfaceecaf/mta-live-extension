import { useEffect, useState } from 'react';
import { sendMessage } from '@/lib/messaging';
import type { Trip } from '@/lib/trains/types';

/** How often an open, visible tab asks for fresh train times */
const POLL_MS = 30_000;

export interface LiveTripState {
  trip?: Trip;
  /** When MTA generated the data shown */
  updatedAt?: Date;
  /** Set when the latest request failed. `trip` still holds the last good data. */
  error?: string;
  loading: boolean;
}

/**
 * Live departures for a route. Asks the background worker on mount, every 30s while
 * the tab is visible, and right away when the tab becomes visible again.
 */
export function useLiveTrip(originId: string | null, destinationId: string | null): LiveTripState {
  const [state, setState] = useState<LiveTripState>({ loading: true });

  useEffect(() => {
    if (!originId || !destinationId) return;
    let cancelled = false;
    setState({ loading: true });

    const load = async () => {
      if (document.visibilityState !== 'visible') return;
      try {
        const res = await sendMessage({ type: 'GET_TRIP', originId, destinationId });
        if (cancelled) return;
        setState((prev) =>
          res.ok
            ? { trip: res.trip, updatedAt: new Date(res.updatedAt), loading: false }
            : { ...prev, error: res.error, loading: false },
        );
      } catch (err) {
        // e.g. the extension was reloaded and this page still runs the old content script
        if (!cancelled) setState((prev) => ({ ...prev, error: String(err), loading: false }));
      }
    };

    void load();
    const timer = window.setInterval(load, POLL_MS);
    document.addEventListener('visibilitychange', load);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
      document.removeEventListener('visibilitychange', load);
    };
  }, [originId, destinationId]);

  return state;
}
