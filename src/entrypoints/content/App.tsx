import { useState } from 'react';
import { useStoredState } from '@/lib/useStoredState';
import { useSettings } from '@/lib/settings';
import { useNow } from '@/lib/useNow';
import { sendMessage } from '@/lib/messaging';
import { stationName } from '@/lib/mta/rail/staticData';
import { formatTime, isUpcoming, minutesUntil } from '@/lib/trains/format';
import DepartureCard from './components/DepartureCard';
import { ArrowIcon, ChevronIcon, SwapIcon, TrainIcon } from './components/Icons';
import { useLiveTrip } from './useLiveTrip';

export default function App() {
  const [collapsed, setCollapsed, collapsedLoaded] = useStoredState('ui.collapsed', false);
  const [settings, updateSettings, settingsLoaded] = useSettings();
  // Compact by default: only the next train. Resets on each page so the popup stays small.
  const [showAll, setShowAll] = useState(false);
  const now = useNow();
  const { originId, destinationId } = settings;
  const hasRoute = Boolean(originId && destinationId);
  const live = useLiveTrip(originId, destinationId);

  // Between polls, drop trains that have already left
  const departures = (live.trip?.departures ?? []).filter(
    (d) => minutesUntil(new Date(d.departsAt), now) >= 0,
  );
  const visible = showAll ? departures : departures.slice(0, 1);
  const moreCount = departures.length - 1;
  const hasUpcoming = departures.some((d) =>
    isUpcoming(minutesUntil(new Date(d.departsAt), now), settings.upcomingThresholdMin),
  );

  if (!collapsedLoaded || !settingsLoaded) return null;

  const openSettings = () => void sendMessage({ type: 'OPEN_OPTIONS' });

  let body;
  if (!hasRoute) {
    body = (
      <div className="message stack">
        <p>Choose the route you want to track.</p>
        <button type="button" className="button" onClick={openSettings}>
          Open settings
        </button>
      </div>
    );
  } else if (departures.length > 0) {
    body = (
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
    );
  } else if (live.loading) {
    body = <p className="message text-muted">Loading trains…</p>;
  } else if (live.error && !live.trip) {
    body = <p className="message text-muted">Couldn't reach MTA. Retrying…</p>;
  } else {
    body = <p className="message text-muted">No live trains on this route right now.</p>;
  }

  return (
    <div className="mta-live" data-collapsed={collapsed} data-upcoming={hasUpcoming}>
      {/* `inert` keeps the off-screen popup out of keyboard focus and screen readers */}
      <section className="popup" aria-label="Upcoming trains" inert={collapsed}>
        <header className="row popup-header">
          <h2 className="route">
            {hasRoute ? (
              <>
                <span>{stationName(originId!)}</span>
                <ArrowIcon />
                <span>{stationName(destinationId!)}</span>
              </>
            ) : (
              "Where's My Train At?"
            )}
          </h2>
          {/* Saves to settings, so every tab and the options page flip too (e.g. the ride home) */}
          {hasRoute && (
            <button
              type="button"
              className="icon-button swap-button"
              aria-label="Swap origin and destination"
              title="Swap"
              onClick={() => updateSettings({ originId: destinationId, destinationId: originId })}
            >
              <SwapIcon />
            </button>
          )}
          <button
            type="button"
            className="icon-button push"
            aria-label="Hide train times"
            onClick={() => setCollapsed(true)}
          >
            <ChevronIcon direction="right" />
          </button>
        </header>

        <div className="departures">{body}</div>

        {/* Status and "View more" share one row to keep the popup short */}
        {hasRoute && (live.updatedAt || live.error || moreCount > 0) && (
          <footer className="row popup-footer">
            <span className="footer-status text-muted">
              {live.error ? (
                "Couldn't reach MTA · retrying"
              ) : live.updatedAt ? (
                <>
                  Live · Updated <span className="numeric">{formatTime(live.updatedAt)}</span>
                </>
              ) : null}
            </span>
            {/* MTA data terms require saying the data may not be real time and that we're not MTA-licensed */}
            <button
              type="button"
              className="info-button"
              aria-label="About this data"
              aria-describedby="mta-live-disclaimer"
            >
              ?
            </button>
            <span id="mta-live-disclaimer" role="tooltip" className="info-tooltip">
              Unofficial app, not affiliated with or endorsed by the MTA. Data comes from MTA's
              public feeds and may not be real time, accurate, or complete.
            </span>
            {moreCount > 0 && (
              <button
                type="button"
                className="view-more push"
                aria-expanded={showAll}
                aria-controls="mta-live-departures"
                onClick={() => setShowAll(!showAll)}
              >
                {showAll ? 'Show less' : `View ${moreCount} more`}
                <ChevronIcon direction={showAll ? 'up' : 'down'} />
              </button>
            )}
          </footer>
        )}
      </section>

      <button
        type="button"
        className="tab"
        aria-label={hasUpcoming ? 'Show train times (train departing soon)' : 'Show train times'}
        aria-expanded={!collapsed}
        inert={!collapsed}
        onClick={() => setCollapsed(false)}
      >
        <TrainIcon size={20} />
        {hasUpcoming && <span className="tab-dot" aria-hidden="true" />}
      </button>
    </div>
  );
}
