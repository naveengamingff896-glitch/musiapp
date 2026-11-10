import { useCallback, useEffect, useRef, useState } from 'react';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * localStorage-backed state with a stable API. Used for the prototype's local
 * data persistence (library, playlists, settings, admin overrides).
 */
export function usePersistentState<T>(
  key: string,
  initial: T
): [T, (value: T | ((previous: T) => T)) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window === 'undefined') return initial;
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) return initial;
      const parsed: unknown = JSON.parse(raw);
      if (isPlainObject(initial) && isPlainObject(parsed)) {
        return { ...(initial as Record<string, unknown>), ...parsed } as T;
      }
      return parsed as T;
    } catch {
      return initial;
    }
  });

  const initialRef = useRef(initial);
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state));
    } catch {
      /* storage can be unavailable in private mode; the app still works in-memory */
    }
  }, [key, state]);

  const update = useCallback((value: T | ((previous: T) => T)) => {
    setState((previous) => (typeof value === 'function' ? (value as (p: T) => T)(previous) : value));
  }, []);

  return [state, update];
}

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
