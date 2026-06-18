import { useEffect, useRef, useState } from 'react';
import {
  Download,
  Pause,
  Play,
  Repeat2,
  Shuffle,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
} from 'lucide-react';
import Waveform from './Waveform.jsx';
import { formatTime } from '../lib/format.js';

export default function AudioPlayer({
  audio,
  durationHint = 0,
  title = 'Generate audio to preview your waveform.',
  voiceName = 'No voice selected',
  format = 'mp3',
}) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(durationHint || 0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

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
    if (!el || !audio?.url) return;
    if (playing) {
      el.pause();
    } else {
      el.play().catch(() => setPlaying(false));
    }
  };

  const handleSeek = (fraction) => {
    const el = audioRef.current;
    if (!el || !duration || !audio?.url) return;
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
  const hasAudio = Boolean(audio?.url);

  return (
    <div className="border-t border-white/10 bg-[linear-gradient(180deg,rgba(3,12,24,0.82)_0%,rgba(2,6,18,0.94)_100%)] px-5 py-4 backdrop-blur-2xl sm:px-6">
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

      <div className="grid items-center gap-4 xl:grid-cols-[minmax(260px,0.75fr)_minmax(360px,1.3fr)_minmax(220px,0.55fr)]">
        <div className="flex min-w-0 items-center gap-4">
          <div className="min-w-0">
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200/75">Now playing</p>
            <p className="truncate text-sm font-semibold text-slate-100">{title}</p>
            <p className="mt-1 truncate text-sm text-slate-400">
              {voiceName} - {format?.toUpperCase()}
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-center justify-center gap-4">
          <button
            type="button"
            className="hidden rounded-lg text-slate-400 transition-colors hover:text-slate-100 focus-ring md:grid"
            aria-label="Shuffle"
            disabled
          >
            <Shuffle size={18} />
          </button>
          <button
            type="button"
            className="hidden rounded-lg text-slate-400 transition-colors hover:text-slate-100 focus-ring md:grid"
            aria-label="Previous"
            disabled
          >
            <SkipBack size={21} />
          </button>
          <button
            type="button"
            onClick={togglePlay}
            disabled={!hasAudio}
            className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-[#7dd3fc]/60 bg-[#172554]/[0.65] text-white shadow-[0_0_32px_-8px_rgba(56,189,248,0.9)] transition-transform hover:scale-[1.03] focus-ring disabled:cursor-not-allowed disabled:opacity-45"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? (
              <Pause size={24} fill="currentColor" />
            ) : (
              <Play size={24} fill="currentColor" className="ml-1" />
            )}
          </button>
          <button
            type="button"
            className="hidden rounded-lg text-slate-400 transition-colors hover:text-slate-100 focus-ring md:grid"
            aria-label="Next"
            disabled
          >
            <SkipForward size={21} />
          </button>
          <button
            type="button"
            className="hidden rounded-lg text-slate-400 transition-colors hover:text-slate-100 focus-ring md:grid"
            aria-label="Repeat"
            disabled
          >
            <Repeat2 size={18} />
          </button>

          <div className="min-w-0 flex-1">
            <div className="mb-1 font-mono text-xs text-slate-300">
              {formatTime(currentTime)} / {formatTime(duration)}
            </div>
            <Waveform progress={progress} playing={playing} onSeek={hasAudio ? handleSeek : undefined} bars={92} height={42} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={toggleMute}
            className="rounded text-slate-300 transition-colors hover:text-slate-100 focus-ring"
            aria-label={muted ? 'Unmute' : 'Mute'}
          >
            {muted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={muted ? 0 : volume}
            onChange={handleVolume}
            style={{ '--_pct': volumePct }}
            className="w-28"
            aria-label="Volume"
          />
          <a
            href={audio?.url || '#'}
            download={audio?.fileName}
            onClick={(event) => {
              if (!hasAudio) event.preventDefault();
            }}
            className={`inline-flex items-center gap-2 rounded-xl border border-white/[0.15] bg-white/5 px-3 py-2 text-sm text-slate-200 transition-colors hover:bg-white/10 focus-ring ${
              hasAudio ? '' : 'pointer-events-none opacity-40'
            }`}
          >
            <Download size={16} />
            Download
          </a>
        </div>
      </div>
    </div>
  );
}
