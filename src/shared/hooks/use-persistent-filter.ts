import { useState, useCallback } from 'react';

/**
 * Like useState but persists to localStorage under a namespaced key.
 * Falls back to defaultValue if stored data is missing or unparseable.
 */
export function usePersistentFilter<T>(key: string, defaultValue: T) {
  const storageKey = `nms-filter:${key}`;

  const [state, setState] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return raw !== null ? (JSON.parse(raw) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setAndPersist = useCallback(
    (value: T | ((prev: T) => T)) => {
      setState(prev => {
        const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value;
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          // localStorage quota exceeded — ignore, state still updates in-memory
        }
        return next;
      });
    },
    [storageKey],
  );

  const clear = useCallback(() => {
    localStorage.removeItem(storageKey);
    setState(defaultValue);
  }, [storageKey, defaultValue]);

  return [state, setAndPersist, clear] as const;
}
