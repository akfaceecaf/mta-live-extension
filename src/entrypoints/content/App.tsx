import { useState } from 'react';
import { useStoredState } from '@/lib/useStoredState';
import { useSettings } from '@/lib/settings';
import { useNow } from '@/lib/useNow';
import { createMockTrip } from '@/lib/trains/mockTrip';
import { formatTime, isUpcoming, minutesUntil } from '@/lib/trains/format';
import DepartureCard from './components/DepartureCard';
import { ArrowIcon, ChevronIcon } from './components/Icons';

/** Most trains shown in the expanded list */
const MAX_DEPARTURES = 5;

export default function App() {
  const [collapsed, setCollapsed, collapsedLoaded] = useStoredState('ui.collapsed', false);
  const [settings, , settingsLoaded] = useSettings();
  // Compact by default: only the next train. Resets on each page so the popup stays small.
  const [showAll, setShowAll] = useState(false);
  const now = useNow();
  // Example data until the MTA feed is connected
  const [trip] = useState(() => createMockTrip());
  const [updatedAt] = useState(() => new Date());

  const departures = trip.departures
    .filter((d) => minutesUntil(new Date(d.departsAt), now) >= 0)
    .slice(0, MAX_DEPARTURES);
  const visible = showAll ? departures : departures.slice(0, 1);
  const moreCount = departures.length - 1;
  const hasUpcoming = departures.some((d) =>
    isUpcoming(minutesUntil(new Date(d.departsAt), now), settings.upcomingThresholdMin),
  );

  if (!collapsedLoaded || !settingsLoaded) return null;

  return (
    <div className="mta-live" data-collapsed={collapsed} data-upcoming={hasUpcoming}>
      {/* `inert` keeps the off-screen popup out of keyboard focus and screen readers */}
      <section className="popup" aria-label="Upcoming trains" inert={collapsed}>
        <header className="row popup-header">
          <h2 className="route">
            <span>{trip.origin}</span>
            <ArrowIcon />
            <span>{trip.destination}</span>
          </h2>
          <button
            type="button"
            className="icon-button push"
            aria-label="Hide train times"
            onClick={() => setCollapsed(true)}
          >
            <ChevronIcon direction="right" />
          </button>
        </header>

        <div className="departures">
          {departures.length > 0 ? (
            <ul className="stack" id="mta-live-departures">
              {visible.map((d) => (
                <DepartureCard
                  key={d.id}
                  departure={d}
                  now={now}
                  upcomingThresholdMin={settings.upcomingThresholdMin}
                />
              ))}
            </ul>
          ) : (
            <p className="empty text-muted">No more trains on this route.</p>
          )}
        </div>

        {moreCount > 0 && (
          <button
            type="button"
            className="view-more"
            aria-expanded={showAll}
            aria-controls="mta-live-departures"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show less' : `View ${moreCount} more`}
            <ChevronIcon direction={showAll ? 'up' : 'down'} />
          </button>
        )}

        <footer className="popup-footer text-muted">
          Example data · Updated <span className="numeric">{formatTime(updatedAt)}</span>
        </footer>
      </section>

      <button
        type="button"
        className="tab"
        aria-label={hasUpcoming ? 'Show train times (train departing soon)' : 'Show train times'}
        aria-expanded={!collapsed}
        inert={!collapsed}
        onClick={() => setCollapsed(false)}
      >
        <ChevronIcon direction="left" />
        {hasUpcoming && <span className="tab-dot" aria-hidden="true" />}
      </button>
    </div>
  );
}
