// Simple inline icons drawn for this project (not MTA assets)

const CHEVRON_PATHS = {
  left: 'M10 3L5 8l5 5',
  right: 'M6 3l5 5-5 5',
  up: 'M3 10l5-5 5 5',
  down: 'M3 6l5 5 5-5',
};

export function ChevronIcon({ direction }: { direction: keyof typeof CHEVRON_PATHS }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d={CHEVRON_PATHS[direction]}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ArrowIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M2 8h11M9 4l4 4-4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrainIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true">
      <rect x="3" y="1.5" width="10" height="10.5" rx="2.5" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 7h9" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="6" cy="9.6" r="0.9" fill="currentColor" />
      <circle cx="10" cy="9.6" r="0.9" fill="currentColor" />
      <path d="M5.5 12l-1.5 2.5M10.5 12l1.5 2.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}
