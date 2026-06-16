import { FileAudio, Code2, Music4, Clock } from 'lucide-react';
import { formatTimestamp } from '../lib/format.js';

const STATUS_STYLES = {
  idle: { dot: 'bg-slate-400', text: 'text-slate-500', label: 'Idle' },
  generating: { dot: 'bg-amber-500 animate-pulse', text: 'text-amber-600', label: 'Generating…' },
  ready: { dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]', text: 'text-emerald-600', label: 'Ready' },
  error: { dot: 'bg-red-500', text: 'text-red-600', label: 'Error' },
};

function DetailRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2.5">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="truncate text-right text-sm font-medium text-slate-700">{value}</span>
    </div>
  );
}

export default function DetailsPanel({
  status = 'idle',
  charCount = 0,
  durationLabel = '00:00',
  languageName = '—',
  voiceName = '—',
  format = 'mp3',
  onSetFormat,
  onExportSSML,
  hasAudio = false,
  recent = [],
  onSelectRecent,
  onViewAllRecent,
}) {
  const statusStyle = STATUS_STYLES[status] || STATUS_STYLES.idle;

  return (
    <div className="flex w-full flex-col gap-5">
      {/* Details */}
      <section className="glass rounded-2xl p-5">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-slate-600">
          Details
        </h3>
        <div className="mt-2 divide-y divide-slate-200/70">
          <div className="flex items-center justify-between gap-3 py-2.5">
            <span className="text-sm text-slate-500">Status</span>
            <span className={`flex items-center gap-2 text-sm font-medium ${statusStyle.text}`}>
              <span className={`h-2 w-2 rounded-full ${statusStyle.dot}`} />
              {statusStyle.label}
            </span>
          </div>
          <DetailRow label="Character Count" value={charCount.toLocaleString()} />
          <DetailRow label="Duration" value={durationLabel} />
          <DetailRow label="Language" value={languageName} />
          <DetailRow label="Voice Model" value={voiceName} />
          <DetailRow label="Output Format" value={format.toUpperCase()} />
        </div>
      </section>

      {/* Export options */}
      <section className="glass rounded-2xl p-5">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-slate-600">
          Export Options
        </h3>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {['mp3', 'wav'].map((fmt) => (
            <button
              key={fmt}
              type="button"
              onClick={() => onSetFormat?.(fmt)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs font-medium transition-colors focus-ring ${
                format === fmt
                  ? 'border-[#5b8def]/50 bg-[#eaf1ff] text-[#3068d6]'
                  : 'border-slate-200 bg-white/60 text-slate-500 hover:bg-slate-100/70'
              }`}
            >
              <FileAudio size={18} />
              {fmt.toUpperCase()}
            </button>
          ))}
          <button
            type="button"
            onClick={onExportSSML}
            disabled={!hasAudio}
            className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white/60 px-2 py-3 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100/70 focus-ring disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Code2 size={18} />
            SSML
          </button>
        </div>
        <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
          MP3 / WAV set the format for your next render. SSML exports the markup of the last render.
        </p>
      </section>

      {/* Recent audio */}
      <section className="glass rounded-2xl p-5">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-slate-600">
            Recent Audio
          </h3>
          {recent.length > 0 && (
            <button
              type="button"
              onClick={onViewAllRecent}
              className="rounded text-xs font-medium text-[#3068d6] hover:text-[#5b8def] focus-ring"
            >
              View all
            </button>
          )}
        </div>

        {recent.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">
            Your generated clips will appear here.
          </p>
        ) : (
          <ul className="mt-3 flex flex-col gap-1">
            {recent.slice(0, 5).map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onSelectRecent?.(item)}
                  disabled={!item.playable}
                  className="group flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition-colors hover:bg-slate-100/70 focus-ring disabled:cursor-not-allowed"
                  title={item.playable ? 'Play' : 'Audio expired — regenerate to play'}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#eef3ff] text-[#5b8def] group-hover:bg-[#e0e9ff]">
                    <Music4 size={16} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-slate-700">
                      {item.title}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-400">
                      <Clock size={11} />
                      {formatTimestamp(item.createdAt)}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
