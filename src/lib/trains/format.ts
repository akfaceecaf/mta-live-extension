const timeFormat = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit' });

/** "12:05 PM" */
export function formatTime(date: Date): string {
  return timeFormat.format(date);
}

/** "12:05 PM - 12:26". The end time drops AM/PM when it matches the start, as in TrainTime. */
export function formatTimeRange(start: Date, end: Date): string {
  const startText = formatTime(start);
  const endText = formatTime(end);
  const samePeriod = startText.slice(-2) === endText.slice(-2);
  return `${startText} - ${samePeriod ? endText.slice(0, -3) : endText}`;
}

/** "21 min", or "1h 47m" for an hour or more (compact so a card row fits in 320px) */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h === 0 ? `${m} min` : `${h}h${m === 0 ? '' : ` ${m}m`}`;
}

/** Whole minutes from `now` until `date`, rounded down (0 = departing now) */
export function minutesUntil(date: Date, now: Date): number {
  return Math.floor((date.getTime() - now.getTime()) / 60_000);
}

/** "Now", "in 9 min", "in 1h 5m" */
export function formatCountdown(minutes: number): string {
  return minutes <= 0 ? 'Now' : `in ${formatDuration(minutes)}`;
}

/** True if a train `minutes` away departs within `thresholdMin` (the user's "departing soon" setting) */
export function isUpcoming(minutes: number, thresholdMin: number): boolean {
  return minutes >= 0 && minutes <= thresholdMin;
}
