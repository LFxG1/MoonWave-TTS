import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Download, Volume2, VolumeX } from 'lucide-react';
import Waveform from './Waveform.jsx';
import { formatTime } from '../lib/format.js';

/**
 * Full audio preview: play/pause, scrubbable waveform, time readout,
 * volume control, and a download button.
 */
export default function AudioPlayer({ audio, durationHint = 0 }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationHint || 0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  // Reset transport whenever a new clip is loaded.
  useEffect(() => {
    setPlaying(false);
    setCurrentTime(0);
    setDuration(durationHint || 0);
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
    }
  }, [audio?.url, durationHint]);

  const togglePlay = () => {
    const el = audioRef.current;
    if (!el) return;
    if (playing) {
      el.pause();
    } else {
      el.play().catch(() => setPlaying(false));
    }
  };

  const handleSeek = (fraction) => {
    const el = audioRef.current;
    if (!el || !duration) return;
    el.currentTime = fraction * duration;
    setCurrentTime(el.currentTime);
  };

  const handleVolume = (event) => {
    const value = Number(event.target.value);
    setVolume(value);
    setMuted(value === 0);
    if (audioRef.current) audioRef.current.volume = value;
  };

  const toggleMute = () => {
    const el = audioRef.current;
    if (!el) return;
    const next = !muted;
    setMuted(next);
    el.muted = next;
  };

  const progress = duration ? currentTime / duration : 0;
  const volumePct = `${(muted ? 0 : volume) * 100}%`;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-soft backdrop-blur-xl">
      <audio
        ref={audioRef}
        src={audio?.url}
        preload="metadata"
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          if (Number.isFinite(d) && d > 0) setDuration(d);
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={togglePlay}
          className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-moon-gradient text-white shadow-[0_8px_20px_-6px_rgba(91,141,239,0.85)] focus-ring"
          aria-label={playing ? 'Pause' : 'Play'}
        >
          {playing ? <Pause size={20} fill="currentColor" /> : <Play size={20} fill="currentColor" className="ml-0.5" />}
        </button>

        <div className="min-w-0 flex-1">
          <Waveform progress={progress} playing={playing} onSeek={handleSeek} bars={72} height={48} />
        </div>

        <div className="hidden w-[88px] shrink-0 text-right font-mono text-xs text-slate-500 sm:block">
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            className="rounded text-slate-400 transition-colors hover:text-slate-700 focus-ring"
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={muted ? 0 : volume}
            onChange={handleVolume}
            style={{ '--_pct': volumePct }}
            className="w-24"
            aria-label="Volume"
          />
        </div>

        <a
          href={audio?.url}
          download={audio?.fileName}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/70 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-white focus-ring"
        >
          <Download size={16} />
          Download {audio?.ext ? audio.ext.toUpperCase() : ''}
        </a>
      </div>
    </div>
  );
}
