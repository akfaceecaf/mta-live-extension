import { useEffect, useState } from 'react';
import { UPCOMING_THRESHOLD_RANGE, useSettings } from '@/lib/settings';

export default function App() {
  const [settings, updateSettings, loaded] = useSettings();

  if (!loaded) return null;

  return (
    <main className="page stack">
      <h1>MTA Live Settings</h1>

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
