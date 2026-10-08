import type { LineId } from './types';

/** Display name and CSS color token for each Metro-North line */
export const LINES: Record<LineId, { name: string; color: string }> = {
  hudson: { name: 'Hudson', color: 'var(--line-hudson)' },
  harlem: { name: 'Harlem', color: 'var(--line-harlem)' },
  'new-haven': { name: 'New Haven', color: 'var(--line-new-haven)' },
  'port-jervis': { name: 'Port Jervis', color: 'var(--line-port-jervis)' },
  'pascack-valley': { name: 'Pascack Valley', color: 'var(--line-pascack-valley)' },
};
