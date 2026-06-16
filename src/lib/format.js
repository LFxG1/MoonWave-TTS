/** Format a number of seconds as mm:ss (e.g. 14 -> "00:14"). */
export function formatTime(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '00:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Rough spoken-duration estimate based on character count.
 * Real duration replaces this once Azure returns the audio.
 * (~12 characters per second is a reasonable average speaking pace.)
 */
export function estimateDurationSeconds(text) {
  const chars = (text || '').trim().length;
  if (!chars) return 0;
  return Math.max(1, Math.round(chars / 12));
}

export function countCharacters(text) {
  return (text || '').length;
}

export function countWords(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/** Short single-line snippet used as a title for recent items. */
export function snippet(text, max = 48) {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return 'Untitled audio';
  return clean.length > max ? `${clean.slice(0, max).trim()}…` : clean;
}

/** Relative-ish timestamp like "May 12, 2025 - 09:41". */
export function formatTimestamp(ms) {
  try {
    const date = new Date(ms);
    const datePart = date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
    const timePart = date.toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${datePart} · ${timePart}`;
  } catch {
    return '';
  }
}
