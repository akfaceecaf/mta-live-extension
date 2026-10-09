// Searchable station picker (ARIA "combobox" pattern): type to filter, arrow keys to
// move, Enter to pick, Escape to cancel. Each result shows its line colors, like the
// TrainTime app's station search.
import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import type { Station } from '@/lib/mta/rail/staticData';
import { LINE_COLORS } from '@/lib/trains/lines';

interface Props {
  label: string;
  stations: Station[];
  value: string | null;
  onChange: (id: string | null) => void;
}

/** Lowercase words without punctuation: "Harlem-125 St" → ["harlem", "125", "st"] */
const words = (text: string) => text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

/**
 * Stations matching `query`: every typed word must start a word in the station name
 * (so "new hav" finds "New Haven" and "125" finds "Harlem-125 St"). Names starting
 * with the query come first.
 */
function search(stations: Station[], query: string): Station[] {
  const q = words(query);
  if (q.length === 0) return stations;
  const matches = stations.filter((s) => {
    const name = words(s.name);
    return q.every((part) => name.some((w) => w.startsWith(part)));
  });
  const starts = (s: Station) => words(s.name)[0].startsWith(q[0]);
  return matches.sort((a, b) => Number(starts(b)) - Number(starts(a)));
}

export default function StationSearch({ label, stations, value, onChange }: Props) {
  const id = useId();
  const listId = `${id}-list`;
  const listRef = useRef<HTMLUListElement>(null);
  // null = not typing, so the input shows the selected station's name
  const [query, setQuery] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const selected = stations.find((s) => s.id === value);
  const results = search(stations, query ?? '');

  const close = () => {
    setOpen(false);
    setQuery(null);
  };

  const pick = (station: Station) => {
    onChange(station.id);
    close();
  };

  const moveActive = (next: number) => {
    const index = Math.max(0, Math.min(results.length - 1, next));
    setActive(index);
    listRef.current?.children[index]?.scrollIntoView({ block: 'nearest' });
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) setOpen(true);
      else moveActive(active + 1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      moveActive(active - 1);
    } else if (e.key === 'Enter' && open && results[active]) {
      e.preventDefault();
      pick(results[active]);
    } else if (e.key === 'Escape') {
      close();
    }
  };

  // Leaving the field: an emptied field clears the choice; anything else reverts
  const onBlur = () => {
    if (query !== null && query.trim() === '') onChange(null);
    close();
  };

  return (
    <div className="field station-search">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        className="input station-input"
        type="text"
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && results[active] ? `${id}-${results[active].id}` : undefined}
        autoComplete="off"
        spellCheck={false}
        placeholder="Search stations"
        value={query ?? selected?.name ?? ''}
        onFocus={(e) => {
          e.target.select();
          setOpen(true);
          setActive(0);
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(0);
        }}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
      />
      {open && (
        <ul className="station-results" id={listId} role="listbox" ref={listRef} aria-label={`${label} stations`}>
          {results.length === 0 && <li className="station-empty">No stations found</li>}
          {results.map((s, i) => (
            <li
              key={s.id}
              id={`${id}-${s.id}`}
              role="option"
              aria-selected={i === active}
              className="station-option"
              // mousedown + preventDefault so the input keeps focus and blur doesn't close the list first
              onMouseDown={(e) => {
                e.preventDefault();
                pick(s);
              }}
              onMouseEnter={() => setActive(i)}
            >
              <span className="line-pills" aria-hidden="true">
                {s.lines.map((line) => (
                  <span key={line} className="line-pill" style={{ '--pill-color': LINE_COLORS[line] } as CSSProperties} />
                ))}
              </span>
              {s.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
