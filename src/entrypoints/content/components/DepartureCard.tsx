import type { CSSProperties } from 'react';
import type { Departure } from '@/lib/trains/types';
import { LINES } from '@/lib/trains/lines';
import { formatCountdown, formatDuration, formatTimeRange, isUpcoming, minutesUntil } from '@/lib/trains/format';
import { TrainIcon } from './Icons';

interface Props {
  departure: Departure;
  now: Date;
  upcomingThresholdMin: number;
}

export default function DepartureCard({ departure, now, upcomingThresholdMin }: Props) {
  const departs = new Date(departure.departsAt);
  const arrives = new Date(departure.arrivesAt);
  const minutes = minutesUntil(departs, now);
  const line = LINES[departure.line];

  return (
    <li className="card" data-upcoming={isUpcoming(minutes, upcomingThresholdMin)}>
      <div className="row card-top">
        <span className="card-time numeric">{formatTimeRange(departs, arrives)}</span>
        <span className="card-duration numeric">({formatDuration(minutesUntil(arrives, departs))})</span>
        {departure.track && <span className="card-track numeric push">Track {departure.track}</span>}
      </div>

      <span
        className="badge"
        style={{ '--badge-color': line.color } as CSSProperties}
        title={`${line.name} Line`}
      >
        <TrainIcon />
        {departure.terminal}
      </span>

      <div className="row card-bottom">
        <span className="card-peak" data-peak={departure.peak}>
          {departure.peak ? 'Peak' : 'Off Peak'}
        </span>
        <span className="card-countdown numeric push">{formatCountdown(minutes)}</span>
      </div>
    </li>
  );
}
