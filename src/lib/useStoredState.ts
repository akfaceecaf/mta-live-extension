import { useEffect, useState } from 'react';
import { getItem, setItem, watchItem } from './storage';

/**
 * Like useState, but saved to chrome.storage.local and kept in sync across every
 * tab and extension page (e.g. collapsing the popup in one tab collapses it in all).
 * `loaded` is false until the saved value has been read, so callers can avoid
 * briefly rendering the default first.
 */
export function useStoredState<T>(key: string, initial: T): [T, (value: T) => void, boolean] {
  const [value, setValue] = useState<T>(initial);
  const [loaded, setLoaded] = useState(false);

  // `initial` is only a fallback, so it's left out of the dependencies on purpose
  useEffect(() => {
    getItem<T>(key).then((stored) => {
      if (stored !== undefined) setValue(stored);
      setLoaded(true);
    });
    return watchItem<T>(key, (next) => setValue(next ?? initial));
  }, [key]);

  const update = (next: T) => {
    setValue(next);
    void setItem(key, next);
  };

  return [value, update, loaded];
}
