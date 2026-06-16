import { Music4, Play, Trash2, Clock, FolderOpen } from 'lucide-react';
import { formatTimestamp, formatTime } from '../../lib/format.js';

export default function ProjectsPanel({ recent, onSelectRecent, onRemoveRecent, onClearRecent }) {
  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-800">Projects</h1>
          <p className="mt-1 text-sm text-slate-500">Every clip you have generated this session.</p>
        </div>
        {recent.length > 0 && (
          <button
            type="button"
            onClick={onClearRecent}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/70 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-white focus-ring"
          >
            <Trash2 size={15} />
            Clear all
          </button>
        )}
      </div>

      {recent.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white/60 px-6 py-20 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
            <FolderOpen size={26} />
          </span>
          <p className="text-base font-medium text-slate-700">No projects yet</p>
          <p className="max-w-sm text-sm text-slate-400">
            Head to Text to Speech and generate your first clip — it will show up here.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {recent.map((item) => (
            <li key={item.id} className="glass flex items-center gap-4 rounded-2xl p-3.5">
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#eef3ff] text-[#5b8def]">
                <Music4 size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium text-slate-800">{item.title}</p>
                <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock size={11} />
                    {formatTimestamp(item.createdAt)}
                  </span>
                  <span>{item.voiceName}</span>
                  <span>{item.format?.toUpperCase()}</span>
                  {item.durationSec ? <span>{formatTime(item.durationSec)}</span> : null}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onSelectRecent(item)}
                  disabled={!item.playable}
                  title={item.playable ? 'Play in studio' : 'Audio expired — regenerate to play'}
                  className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-[#eaf1ff] hover:text-[#3068d6] focus-ring disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Play size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveRecent(item.id)}
                  title="Remove"
                  className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 focus-ring"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
