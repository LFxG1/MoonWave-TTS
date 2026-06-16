import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'moonwave.recent.v1';
const MAX_ITEMS = 24;

function readStored() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('MoonWave: could not read recent items.', error);
    return [];
  }
}

/**
 * Stores lightweight metadata about each generation so the history list
 * survives reloads. Audio blobs themselves stay in memory for the session
 * (object URLs cannot be persisted), so replay is only available until reload.
 */
export function useRecent() {
  const [recent, setRecent] = useState(readStored);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
    } catch (error) {
      console.warn('MoonWave: could not persist recent items.', error);
    }
  }, [recent]);

  const addRecent = useCallback((item) => {
    setRecent((prev) => [item, ...prev].slice(0, MAX_ITEMS));
  }, []);

  const removeRecent = useCallback((id) => {
    setRecent((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const clearRecent = useCallback(() => setRecent([]), []);

  return { recent, addRecent, removeRecent, clearRecent };
}
