import { useEffect, useState } from 'react';

/** Current time, re-rendering at the start of each minute so countdowns stay accurate */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer: number;
    const schedule = () => {
      const msToNextMinute = 60_000 - (Date.now() % 60_000);
      timer = window.setTimeout(() => {
        setNow(new Date());
        schedule();
      }, msToNextMinute);
    };
    schedule();
    return () => window.clearTimeout(timer);
  }, []);

  return now;
}
