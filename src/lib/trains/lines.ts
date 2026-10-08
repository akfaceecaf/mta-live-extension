import type { LineId } from './types';

/** CSS color token for each line's badge */
export const LINE_COLORS: Record<LineId, string> = {
  hudson: 'var(--line-hudson)',
  harlem: 'var(--line-harlem)',
  'new-haven': 'var(--line-new-haven)',
};

/** Static GTFS route_id → line color family. 4–6 are New Haven line branches (New Canaan, Danbury, Waterbury). */
const LINE_BY_ROUTE_ID: Record<string, LineId> = {
  '1': 'hudson',
  '2': 'harlem',
  '3': 'new-haven',
  '4': 'new-haven',
  '5': 'new-haven',
  '6': 'new-haven',
};

export function lineForRoute(routeId: string): LineId {
  return LINE_BY_ROUTE_ID[routeId] ?? 'harlem';
}
