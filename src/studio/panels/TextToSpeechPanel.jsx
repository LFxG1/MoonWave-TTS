import { useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  Code2,
  FileAudio,
  Languages,
  Loader2,
  Mic2,
  Pause,
  Search,
  SlidersHorizontal,
  Sparkles,
  UploadCloud,
} from 'lucide-react';
import { DEFAULT_HD_PARAMETERS } from '../../lib/azureTts.js';
import {
  getLocales,
  getVoiceById,
  getVoiceLanguageLabel,
  getVoiceStyles,
  getVoicesByLocale,
  humanizeStyle,
  isDragonHdVoice,
  supportsHdParameters,
  supportsStylePrompt,
} from '../../lib/voices.js';
import { countCharacters } from '../../lib/format.js';

const MAX_CHARS = 5000;
const PAUSE_MARKERS = [
  { label: '250 ms', value: '[pause:250ms]' },
  { label: '500 ms', value: '[pause:500ms]' },
  { label: '1 sec', value: '[pause:1s]' },
];
const HD_PARAMETER_CONTROLS = [
  {
    key: 'temperature',
    label: 'Temperature',
    min: 0.3,
    max: 1,
    step: 0.05,
    format: (value) => Number(value).toFixed(2),
  },
  {
    key: 'topP',
    label: 'Top P',
    min: 0.3,
    max: 1,
    step: 0.05,
    format: (value) => Number(value).toFixed(2),
  },
  {
    key: 'topK',
    label: 'Top K',
    min: 1,
    max: 50,
    step: 1,
    format: (value) => String(Math.round(Number(value))),
  },
  {
    key: 'cfgScale',
    label: 'CFG',
    min: 1,
    max: 2,
    step: 0.05,
    format: (value) => Number(value).toFixed(2),
  },
];

const labelClass = 'mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500';
const controlClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-700 focus-ring';

function Select({ value, onChange, children, ariaLabel, disabled = false }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        aria-label={ariaLabel}
        disabled={disabled}
        className={`${controlClass} appearance-none pr-10 disabled:cursor-not-allowed disabled:opacity-50`}
      >
        {children}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
      />
    </div>
  );
}

function CapabilityPill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/45 px-2 py-0.5 text-[11px] font-medium text-slate-500">
      {children}
    </span>
  );
}

function voiceMatchesQuery(voice, query) {
  if (!query) return true;
  const haystack = [
    voice.name,
    voice.locale,
    voice.localeName,
    voice.gender,
    voice.badge,
    ...(voice.styles || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return haystack.includes(query);
}

function VoicePicker({ locale, voiceId, onSelect }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selectedVoice = getVoiceById(voiceId);
  const normalizedQuery = query.trim().toLowerCase();

  const groups = useMemo(() => {
    const voices = getVoicesByLocale(locale).filter((voice) =>
      voiceMatchesQuery(voice, normalizedQuery)
    );
    const hdVoices = voices.filter((voice) => isDragonHdVoice(voice) || voice.badge === 'HD');
    const hdIds = new Set(hdVoices.map((voice) => voice.id));
    const recommended = voices.filter((voice) => voice.recommended && !hdIds.has(voice.id));
    const recommendedIds = new Set(recommended.map((voice) => voice.id));
    const standard = voices.filter(
      (voice) => !hdIds.has(voice.id) && !recommendedIds.has(voice.id)
    );

    return [
      { label: 'Recommended', voices: recommended },
      { label: 'HD & Omni', voices: hdVoices },
      { label: 'Standard', voices: standard },
    ].filter((group) => group.voices.length > 0);
  }, [locale, normalizedQuery]);

  const handleSelect = (voice) => {
    onSelect(voice.id);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/55 px-3.5 py-3 text-left transition-colors hover:bg-white/70 focus-ring"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#eaf1ff] text-[#5b8def]">
            <Mic2 size={18} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-slate-800">
              {selectedVoice?.name || 'Choose a voice'}
            </span>
            <span className="mt-0.5 block truncate text-xs text-slate-500">
              {selectedVoice
                ? `${selectedVoice.gender} - ${selectedVoice.localeName}`
                : 'Search by voice, language, style, or HD'}
            </span>
          </span>
        </span>
        <span className="hidden shrink-0 items-center gap-1.5 md:flex">
          {selectedVoice?.badge && <CapabilityPill>{selectedVoice.badge}</CapabilityPill>}
          <CapabilityPill>
            {getVoiceStyles(selectedVoice).length
              ? `${getVoiceStyles(selectedVoice).length} emotions`
              : 'Default only'}
          </CapabilityPill>
          <CapabilityPill>{getVoiceLanguageLabel(selectedVoice)}</CapabilityPill>
          <ChevronDown size={16} className="text-slate-400" />
        </span>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-slate-950/95 p-3 shadow-[0_28px_80px_-30px_rgba(0,0,0,0.95)] backdrop-blur-xl">
          <div className="relative mb-3">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search voices, styles, languages..."
              className="w-full rounded-xl border border-white/10 bg-white/10 py-2.5 pl-10 pr-3 text-sm text-slate-100 placeholder:text-slate-400 focus-ring"
              autoFocus
            />
          </div>

          <div className="max-h-[320px] space-y-3 overflow-y-auto pr-1" role="listbox">
            {groups.length === 0 ? (
              <p className="px-2 py-8 text-center text-sm text-slate-400">No voices found.</p>
            ) : (
              groups.map((group) => (
                <div key={group.label}>
                  <p className="mb-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    {group.label}
                  </p>
                  <div className="space-y-1">
                    {group.voices.map((voice) => {
                      const active = voice.id === voiceId;
                      const styleCount = getVoiceStyles(voice).length;
                      return (
                        <button
                          key={voice.id}
                          type="button"
                          onClick={() => handleSelect(voice)}
                          className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors focus-ring ${
                            active
                              ? 'bg-cyan-300/15 text-white ring-1 ring-cyan-200/30'
                              : 'text-slate-200 hover:bg-white/10'
                          }`}
                          role="option"
                          aria-selected={active}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">{voice.name}</span>
                            <span className="mt-0.5 block truncate text-xs text-slate-400">
                              {voice.gender} - {voice.localeName}
                            </span>
                          </span>
                          <span className="flex shrink-0 items-center gap-1.5">
                            {voice.badge && (
                              <span className="rounded-full bg-cyan-300/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-100">
                                {voice.badge}
                              </span>
                            )}
                            <span className="text-xs text-slate-400">
                              {styleCount || '0'} styles
                            </span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function RangeControl({ label, value, valueLabel, min, max, step, onChange, percent }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <label className={`${labelClass} mb-0`}>{label}</label>
        <span className="rounded-md bg-[#eaf1ff] px-2 py-0.5 font-mono text-xs font-medium text-[#3068d6]">
          {valueLabel}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        style={{ '--_pct': percent }}
        aria-label={label}
      />
    </div>
  );
}

export default function TextToSpeechPanel({
  text,
  setText,
  locale,
  setLocale,
  voiceId,
  setVoiceId,
  style,
  setStyle,
  styleDegree = 1,
  setStyleDegree,
  stylePrompt = '',
  setStylePrompt,
  hdParameters = DEFAULT_HD_PARAMETERS,
  setHdParameters,
  speed,
  setSpeed,
  pitch,
  setPitch,
  isGenerating,
  error,
  onGenerate,
  audio,
  outputFormat = 'mp3',
  onSetFormat,
  onExportSSML,
  hasAudio = false,
  projectSaveNotice,
}) {
  const fileInputRef = useRef(null);
  const textAreaRef = useRef(null);
  const [fileError, setFileError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const locales = getLocales();
  const currentVoice = getVoiceById(voiceId);
  const voiceStyles = getVoiceStyles(currentVoice);
  const styleOptions = ['default', ...voiceStyles];
  const charCount = countCharacters(text);
  const canUseStylePrompt = supportsStylePrompt(currentVoice);
  const canTuneOmni = supportsHdParameters(currentVoice);
  const emotionCountLabel = voiceStyles.length
    ? `${voiceStyles.length} emotion${voiceStyles.length === 1 ? '' : 's'}`
    : 'Default only';
  const promptValue = canUseStylePrompt ? stylePrompt : '';

  const handleLocaleChange = (event) => {
    const newLocale = event.target.value;
    setLocale(newLocale);
    const voices = getVoicesByLocale(newLocale);
    if (voices.length) {
      setVoiceId(voices[0].id);
      setStyle('default');
      setStylePrompt?.('');
      setStyleDegree?.(1);
    }
  };

  const handleVoiceChange = (newId) => {
    setVoiceId(newId);
    setStyle('default');
    setStylePrompt?.('');
    setStyleDegree?.(1);
  };

  const handleStyleChange = (event) => {
    const nextStyle = event.target.value;
    setStyle(nextStyle);
    if (nextStyle !== 'default') {
      setStylePrompt?.('');
    }
  };

  const updateHdParameter = (key, value) => {
    setHdParameters?.({
      ...DEFAULT_HD_PARAMETERS,
      ...hdParameters,
      [key]: value,
    });
  };

  const setLimitedText = (value) => setText(value.slice(0, MAX_CHARS));

  const insertPauseMarker = (marker) => {
    const textarea = textAreaRef.current;
    const selectionStart = textarea?.selectionStart ?? text.length;
    const selectionEnd = textarea?.selectionEnd ?? selectionStart;
    const prefix = text.slice(0, selectionStart);
    const suffix = text.slice(selectionEnd);
    const before = prefix && !/\s$/.test(prefix) ? ' ' : '';
    const after = suffix && !/^\s/.test(suffix) ? ' ' : '';
    const nextText = `${prefix}${before}${marker}${after}${suffix}`.slice(0, MAX_CHARS);
    setText(nextText);
    requestAnimationFrame(() => {
      const nextPosition = Math.min(
        MAX_CHARS,
        selectionStart + before.length + marker.length + after.length
      );
      textarea?.focus();
      textarea?.setSelectionRange(nextPosition, nextPosition);
    });
  };

  const readFile = (file) => {
    setFileError('');
    if (!file) return;
    const isText = /\.(txt|md|text)$/i.test(file.name) || file.type.startsWith('text/');
    if (!isText) {
      setFileError('Please upload a plain-text file (.txt or .md).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '').slice(0, MAX_CHARS);
      setText(content);
    };
    reader.onerror = () => setFileError('Could not read that file. Please try again.');
    reader.readAsText(file);
  };

  const speedLabel = `${speed.toFixed(2)}x`;
  const pitchLabel = `${pitch >= 0 ? '+' : ''}${pitch}%`;
  const depthLabel = `${Number(styleDegree || 1).toFixed(1)}x`;
  const speedPct = `${((speed - 0.5) / 1.5) * 100}%`;
  const pitchPct = `${((pitch + 50) / 100) * 100}%`;
  const depthPct = `${(((styleDegree || 1) - 0.5) / 1.5) * 100}%`;

  return (
    <div className="w-full">
      <div className="mb-4">
        <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-800">
          Text to Speech Studio
        </h1>
        <p className="mt-2 text-base text-slate-500">
          Convert your text into natural, lifelike speech.
        </p>
      </div>

      <section className="glass rounded-2xl p-4">
        <div className="mb-3 flex items-center justify-between gap-4">
          <h2 className="font-display text-base font-semibold text-slate-800">Your Text</h2>
          <span className="shrink-0 font-mono text-sm text-slate-400">
            {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
          </span>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white/50">
          <textarea
            ref={textAreaRef}
            id="tts-text"
            value={text}
            onChange={(event) => setLimitedText(event.target.value)}
            placeholder="The night is calm, the stars are bright, and the ocean whispers under the light of the moon."
            rows={5}
            className="min-h-[170px] w-full resize-y border-0 bg-transparent p-4 text-[16px] leading-relaxed text-slate-700 placeholder:text-slate-400 focus-ring"
          />
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragOver(false);
              readFile(event.dataTransfer.files?.[0]);
            }}
            className={`flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-3.5 py-2.5 transition-colors ${
              dragOver ? 'bg-[#eaf1ff]' : ''
            }`}
          >
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setText('')}
                disabled={!text}
                className="rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:text-slate-200 focus-ring disabled:cursor-not-allowed disabled:opacity-40"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:text-slate-200 focus-ring"
              >
                <UploadCloud size={15} />
                Upload
              </button>
              <span className="hidden h-5 w-px bg-slate-200 sm:block" />
              {PAUSE_MARKERS.map((marker) => (
                <button
                  key={marker.value}
                  type="button"
                  onClick={() => insertPauseMarker(marker.value)}
                  className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:text-slate-200 focus-ring"
                >
                  <Pause size={13} />
                  {marker.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={onExportSSML}
              disabled={!hasAudio}
              className="inline-flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-500 transition-colors hover:text-slate-200 focus-ring disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Code2 size={15} />
              SSML
            </button>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.text,text/plain"
          className="hidden"
          onChange={(event) => readFile(event.target.files?.[0])}
        />
        {fileError && <p className="mt-2 text-xs text-red-500">{fileError}</p>}
      </section>

      <section className="glass mt-4 rounded-2xl p-4">
        <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-semibold text-slate-800">
              Voice &amp; Settings
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {currentVoice
                ? `${emotionCountLabel} - ${getVoiceLanguageLabel(currentVoice)}`
                : 'Choose a voice to see its controls.'}
            </p>
          </div>
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(190px,0.32fr)]">
          <div>
            <label className={labelClass}>Voice</label>
            <VoicePicker locale={locale} voiceId={voiceId} onSelect={handleVoiceChange} />
          </div>
          <div>
            <label className={labelClass}>Language</label>
            <Select value={locale} onChange={handleLocaleChange} ariaLabel="Language">
              {locales.map((item) => (
                <option key={item.locale} value={item.locale}>
                  {item.localeName}
                </option>
              ))}
            </Select>
            <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500">
              <Languages size={13} />
              {locales.length} languages in library
            </div>
          </div>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <RangeControl
            label="Speed"
            value={speed}
            valueLabel={speedLabel}
            min="0.5"
            max="2"
            step="0.05"
            onChange={setSpeed}
            percent={speedPct}
          />

          <RangeControl
            label="Pitch"
            value={pitch}
            valueLabel={pitchLabel}
            min="-50"
            max="50"
            step="1"
            onChange={setPitch}
            percent={pitchPct}
          />

          <div>
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <label className={`${labelClass} mb-0`}>Emotion</label>
              <span className="text-xs font-medium text-slate-400">{emotionCountLabel}</span>
            </div>
            <Select
              value={style}
              onChange={handleStyleChange}
              ariaLabel="Speaking emotion"
              disabled={Boolean(promptValue.trim())}
            >
              {styleOptions.map((option) => (
                <option key={option} value={option}>
                  {humanizeStyle(option)}
                </option>
              ))}
            </Select>
          </div>

          {style !== 'default' && !promptValue.trim() && (
            <RangeControl
              label="Depth"
              value={styleDegree}
              valueLabel={depthLabel}
              min="0.5"
              max="2"
              step="0.1"
              onChange={(value) => setStyleDegree?.(value)}
              percent={depthPct}
            />
          )}
        </div>

        <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,0.55fr)_minmax(220px,0.45fr)]">
          <div>
            <label className={labelClass}>Output Format</label>
            <div className="grid grid-cols-2 gap-2">
              {['mp3', 'wav'].map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => onSetFormat?.(fmt)}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium transition-colors focus-ring ${
                    outputFormat === fmt
                      ? 'border-[#5b8def]/50 bg-[#eaf1ff] text-[#3068d6]'
                      : 'border-slate-200 bg-white/40 text-slate-500 hover:bg-slate-100/70'
                  }`}
                >
                  <FileAudio size={16} />
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end">
            <motion.button
              type="button"
              onClick={onGenerate}
              disabled={isGenerating || !text.trim()}
              whileHover={isGenerating || !text.trim() ? undefined : { scale: 1.01 }}
              whileTap={isGenerating || !text.trim() ? undefined : { scale: 0.99 }}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-moon-gradient py-3 font-semibold text-white shadow-[0_14px_30px_-10px_rgba(91,141,239,0.85)] focus-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Generate
                </>
              )}
            </motion.button>
          </div>
        </div>

        {canTuneOmni && (
          <div className="mt-3 rounded-xl border border-slate-200 bg-white/30">
            <button
              type="button"
              onClick={() => setShowAdvanced((value) => !value)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left focus-ring"
              aria-expanded={showAdvanced}
            >
              <span className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                <SlidersHorizontal size={16} />
                Advanced Omni tuning
              </span>
              <ChevronDown
                size={16}
                className={`text-slate-400 transition-transform ${showAdvanced ? 'rotate-180' : ''}`}
              />
            </button>
            {showAdvanced && (
              <div className="grid gap-3 border-t border-slate-200 p-4 md:grid-cols-2 xl:grid-cols-4">
                {HD_PARAMETER_CONTROLS.map((control) => {
                  const value = hdParameters?.[control.key] ?? DEFAULT_HD_PARAMETERS[control.key];
                  const pct = `${((value - control.min) / (control.max - control.min)) * 100}%`;
                  return (
                    <RangeControl
                      key={control.key}
                      label={control.label}
                      value={value}
                      valueLabel={control.format(value)}
                      min={control.min}
                      max={control.max}
                      step={control.step}
                      onChange={(nextValue) => updateHdParameter(control.key, nextValue)}
                      percent={pct}
                    />
                  );
                })}
              </div>
            )}
          </div>
        )}
      </section>

      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-300/70 bg-red-50 p-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {projectSaveNotice && (
        <div
          className={`mt-5 flex items-start gap-3 rounded-xl border p-4 ${
            projectSaveNotice.type === 'success'
              ? 'border-emerald-300/70 bg-emerald-50 text-emerald-700'
              : 'border-amber-300/70 bg-amber-50 text-amber-700'
          }`}
        >
          {projectSaveNotice.type === 'success' ? (
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
          ) : (
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-500" />
          )}
          <p className="text-sm">{projectSaveNotice.message}</p>
        </div>
      )}
    </div>
  );
}
