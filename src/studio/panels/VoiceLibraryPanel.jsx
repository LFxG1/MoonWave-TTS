import { useMemo, useState } from 'react';
import { Search, Mic, Wand2 } from 'lucide-react';
import { VOICES, humanizeStyle } from '../../lib/voices.js';

export default function VoiceLibraryPanel({ onUseVoice, currentVoiceId }) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return VOICES;
    return VOICES.filter(
      (voice) =>
        voice.name.toLowerCase().includes(q) ||
        voice.localeName.toLowerCase().includes(q) ||
        voice.locale.toLowerCase().includes(q) ||
        voice.badge?.toLowerCase().includes(q) ||
        voice.styles.some((style) => style.includes(q))
    );
  }, [query]);

  return (
    <div className="mx-auto w-full max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-slate-800">Voice Library</h1>
        <p className="mt-1 text-sm text-slate-500">
          {VOICES.length} neural voices across {new Set(VOICES.map((v) => v.locale)).size} languages.
        </p>
      </div>

      <div className="relative mb-5">
        <Search size={17} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, language, HD, or style..."
          className="w-full rounded-xl border border-slate-200 bg-white/80 py-2.5 pl-11 pr-4 text-sm text-slate-700 placeholder:text-slate-400 focus-ring"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {filtered.map((voice) => {
          const active = voice.id === currentVoiceId;
          return (
            <div
              key={voice.id}
              className={`glass rounded-2xl p-4 transition-colors ${
                active ? 'border-[#5b8def]/60 ring-1 ring-[#5b8def]/30' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eef3ff] text-[#5b8def]">
                    <Mic size={18} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-slate-800">{voice.name}</p>
                      {voice.badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                            voice.badge === 'HD'
                              ? 'bg-[#eaf1ff] text-[#3068d6]'
                              : 'bg-emerald-50 text-emerald-600'
                          }`}
                        >
                          {voice.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {voice.localeName} - {voice.gender}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onUseVoice(voice)}
                  className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-ring ${
                    active
                      ? 'bg-moon-gradient text-white shadow-[0_6px_16px_-6px_rgba(91,141,239,0.8)]'
                      : 'bg-slate-100 text-slate-600 hover:bg-[#eaf1ff] hover:text-[#3068d6]'
                  }`}
                >
                  <Wand2 size={14} />
                  {active ? 'Selected' : 'Use'}
                </button>
              </div>

              {voice.styles.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {voice.styles.slice(0, 6).map((style) => (
                    <span
                      key={style}
                      className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-500"
                    >
                      {humanizeStyle(style)}
                    </span>
                  ))}
                  {voice.styles.length > 6 && (
                    <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] text-slate-400">
                      +{voice.styles.length - 6}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="py-10 text-center text-sm text-slate-400">No voices match "{query}".</p>
      )}
    </div>
  );
}
