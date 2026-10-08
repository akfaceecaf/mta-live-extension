import { useEffect, useState } from 'react';
import { UPCOMING_THRESHOLD_RANGE, useSettings, type Settings } from '@/lib/settings';
import { stationsSorted } from '@/lib/mta/rail/staticData';

const STATIONS = stationsSorted();

export default function App() {
  const [settings, updateSettings, loaded] = useSettings();

  if (!loaded) return null;

  return (
    <main className="page stack">
      <h1>MTA Live Settings</h1>

      <section className="panel stack">
        <h2>Route</h2>
        <RouteFields settings={settings} onSave={updateSettings} />
      </section>

      <section className="panel stack">
        <h2>Alerts</h2>
        <ThresholdField
          value={settings.upcomingThresholdMin}
          onSave={(upcomingThresholdMin) => updateSettings({ upcomingThresholdMin })}
        />
      </section>
    </main>
  );
}

/** Origin and destination dropdowns. Each change saves immediately. */
function RouteFields({
  settings,
  onSave,
}: {
  settings: Settings;
  onSave: (patch: Partial<Settings>) => void;
}) {
  const { originId, destinationId } = settings;
  const sameStation = originId !== null && originId === destinationId;

  return (
    <div className="route-fields">
      <StationSelect
        id="origin"
        label="From"
        value={originId}
        onChange={(id) => onSave({ originId: id })}
      />
      <button
        type="button"
        className="swap-button"
        aria-label="Swap origin and destination"
        title="Swap"
        onClick={() => onSave({ originId: destinationId, destinationId: originId })}
      >
        <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true">
          <path
            d="M5 2v11M2 10l3 3 3-3M11 14V3M8 6l3-3 3 3"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      <StationSelect
        id="destination"
        label="To"
        value={destinationId}
        onChange={(id) => onSave({ destinationId: id })}
      />
      {sameStation && (
        <p className="field-error" role="alert">
          Pick two different stations.
        </p>
      )}
    </div>
  );
}

function StationSelect(props: {
  id: string;
  label: string;
  value: string | null;
  onChange: (id: string | null) => void;
}) {
  return (
    <div className="field">
      <label htmlFor={props.id}>{props.label}</label>
      <select
        id={props.id}
        className="input select"
        value={props.value ?? ''}
        onChange={(e) => props.onChange(e.target.value || null)}
      >
        <option value="">Choose a station</option>
        {STATIONS.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
    </div>
  );
}

/** Minutes input that saves on blur/Enter, so typing "45" doesn't briefly save "4" */
function ThresholdField({ value, onSave }: { value: number; onSave: (minutes: number) => void }) {
  const [draft, setDraft] = useState(String(value));
  const { min, max } = UPCOMING_THRESHOLD_RANGE;

  // Stay in sync if the value changes elsewhere
  useEffect(() => setDraft(String(value)), [value]);

  const commit = () => {
    const minutes = Math.round(Number(draft));
    if (Number.isFinite(minutes) && draft.trim() !== '') {
      const clamped = Math.min(max, Math.max(min, minutes));
      onSave(clamped);
      setDraft(String(clamped));
    } else {
      setDraft(String(value));
    }
  };

  return (
    <div className="field">
      <label htmlFor="upcoming-threshold">Departing soon</label>
      <div className="row">
        <input
          id="upcoming-threshold"
          className="input numeric"
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && commit()}
          aria-describedby="upcoming-threshold-hint"
        />
        <span className="text-muted">minutes</span>
      </div>
      <p id="upcoming-threshold-hint" className="hint text-muted">
        Trains leaving within this time show in red, and the collapsed tab shakes.
      </p>
    </div>
  );
}
