import { useMemo, useRef } from 'react';

/**
 * Stylized audio waveform that doubles as a seek bar.
 * Bars below `progress` are tinted with the brand gradient; the rest are muted.
 */
export default function Waveform({
  progress = 0,
  playing = false,
  bars = 64,
  onSeek,
  className = '',
  height = 56,
}) {
  const containerRef = useRef(null);

  // Deterministic pseudo-random bar heights so the shape is stable across renders.
  const heights = useMemo(() => {
    const result = [];
    for (let i = 0; i < bars; i += 1) {
      const wave = Math.sin(i * 0.5) * 0.5 + 0.5;
      const jitter = ((Math.sin(i * 12.9898) * 43758.5453) % 1 + 1) % 1;
      const value = 0.25 + wave * 0.45 + jitter * 0.3;
      result.push(Math.min(1, value));
    }
    return result;
  }, [bars]);

  const handleSeek = (event) => {
    if (!onSeek || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const fraction = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    onSeek(fraction);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleSeek}
      className={`flex items-center gap-[3px] ${onSeek ? 'cursor-pointer' : ''} ${className}`}
      style={{ height }}
      role={onSeek ? 'slider' : undefined}
      aria-label={onSeek ? 'Audio progress' : undefined}
      aria-valuenow={Math.round(progress * 100)}
    >
      {heights.map((value, index) => {
        const played = index / bars < progress;
        return (
          <span
            key={index}
            className="flex-1 rounded-full transition-colors duration-150"
            style={{
              height: `${Math.max(8, value * 100)}%`,
              background: played
                ? 'linear-gradient(to top, #5B8DEF, #84B3FF)'
                : 'rgba(100,116,139,0.28)',
              boxShadow: played ? '0 0 8px rgba(91,141,239,0.4)' : 'none',
              transform: playing && played ? 'scaleY(1.08)' : 'scaleY(1)',
              transformOrigin: 'center',
              transition: 'transform 0.2s ease, background 0.15s ease',
            }}
          />
        );
      })}
    </div>
  );
}
