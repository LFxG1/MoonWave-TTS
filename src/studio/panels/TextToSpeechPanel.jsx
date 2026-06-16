import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronDown,
  UploadCloud,
  Sparkles,
  Loader2,
  AlertCircle,
  KeyRound,
  AudioLines,
} from 'lucide-react';
import AudioPlayer from '../../components/AudioPlayer.jsx';
import Waveform from '../../components/Waveform.jsx';
import {
  getLocales,
  getVoicesByLocale,
  getVoiceById,
  humanizeStyle,
} from '../../lib/voices.js';
import { countCharacters } from '../../lib/format.js';

const MAX_CHARS = 5000;
const labelClass = 'mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500';
const controlClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-700 focus-ring';

function Select({ value, onChange, children, ariaLabel }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        aria-label={ariaLabel}
        className={`${controlClass} appearance-none pr-10`}
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

export default function TextToSpeechPanel({
  text,
  setText,
  locale,
  setLocale,
  voiceId,
  setVoiceId,
  style,
  setStyle,
  speed,
  setSpeed,
  pitch,
  setPitch,
  isGenerating,
  error,
  isConfigured,
  onGenerate,
  onGoToSettings,
  audio,
}) {
  const fileInputRef = useRef(null);
  const [fileError, setFileError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const locales = getLocales();
  const voicesForLocale = getVoicesByLocale(locale);
  const currentVoice = getVoiceById(voiceId);
  const styleOptions = ['default', ...(currentVoice?.styles || [])];
  const charCount = countCharacters(text);

  const handleLocaleChange = (event) => {
    const newLocale = event.target.value;
    setLocale(newLocale);
    const voices = getVoicesByLocale(newLocale);
    if (voices.length) {
      setVoiceId(voices[0].id);
      setStyle('default');
    }
  };

  const handleVoiceChange = (event) => {
    const newId = event.target.value;
    setVoiceId(newId);
    const voice = getVoiceById(newId);
    if (!voice || !voice.styles.includes(style)) {
      setStyle('default');
    }
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

  // Filled-track percentages for the range sliders (see index.css --_pct).
  const speedPct = `${((speed - 0.5) / 1.5) * 100}%`;
  const pitchPct = `${((pitch + 50) / 100) * 100}%`;

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-slate-800">Voice Studio</h1>
        <p className="mt-1 text-sm text-slate-500">
          Type or upload text to generate lifelike speech with Azure AI.
        </p>
      </div>

      {/* Text editor */}
      <div className="glass rounded-2xl p-5">
        <label className={labelClass} htmlFor="tts-text">
          Text Editor
        </label>
        <textarea
          id="tts-text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          placeholder="The night is calm, the stars are bright, and the journey ahead is filled with endless possibilities…"
          rows={6}
          className="w-full resize-y rounded-xl border border-slate-200 bg-white/80 p-4 text-[15px] leading-relaxed text-slate-700 placeholder:text-slate-400 focus-ring"
        />
        <div className="mt-1.5 flex justify-end text-xs text-slate-400">
          {charCount.toLocaleString()} / {MAX_CHARS.toLocaleString()}
        </div>

        {/* Upload */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            readFile(e.dataTransfer.files?.[0]);
          }}
          className={`mt-3 flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-4 py-5 text-center transition-colors focus-ring ${
            dragOver
              ? 'border-[#5b8def] bg-[#eaf1ff]'
              : 'border-slate-300 bg-white/50 hover:bg-white/80'
          }`}
        >
          <UploadCloud size={20} className="text-[#5b8def]" />
          <span className="text-sm text-slate-500">Drag &amp; drop a .txt file or click to browse</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.md,.text,text/plain"
          className="hidden"
          onChange={(e) => readFile(e.target.files?.[0])}
        />
        {fileError && <p className="mt-2 text-xs text-red-500">{fileError}</p>}
      </div>

      {/* Voice + Language */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Voice</label>
          <Select value={voiceId} onChange={handleVoiceChange} ariaLabel="Voice">
            {voicesForLocale.map((voice) => (
              <option key={voice.id} value={voice.id}>
                {voice.name} · {voice.gender}
              </option>
            ))}
          </Select>
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
        </div>
      </div>

      {/* Speaking style */}
      <div className="mt-4">
        <label className={labelClass}>Speaking Style</label>
        <Select value={style} onChange={(e) => setStyle(e.target.value)} ariaLabel="Speaking style">
          {styleOptions.map((option) => (
            <option key={option} value={option}>
              {humanizeStyle(option)}
            </option>
          ))}
        </Select>
        {styleOptions.length === 1 && (
          <p className="mt-1.5 text-[11px] text-slate-400">
            This voice supports a single neutral style.
          </p>
        )}
      </div>

      {/* Speed + Pitch */}
      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <label className={`${labelClass} mb-0`}>Speed</label>
            <span className="rounded-md bg-[#eaf1ff] px-2 py-0.5 font-mono text-xs font-medium text-[#3068d6]">
              {speedLabel}
            </span>
          </div>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.05"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ '--_pct': speedPct }}
            aria-label="Speed"
          />
        </div>
        <div>
          <div className="mb-2.5 flex items-center justify-between">
            <label className={`${labelClass} mb-0`}>Pitch</label>
            <span className="rounded-md bg-[#eaf1ff] px-2 py-0.5 font-mono text-xs font-medium text-[#3068d6]">
              {pitchLabel}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="50"
            step="1"
            value={pitch}
            onChange={(e) => setPitch(Number(e.target.value))}
            style={{ '--_pct': pitchPct }}
            aria-label="Pitch"
          />
        </div>
      </div>

      {/* Not-configured notice */}
      {!isConfigured && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-300/70 bg-amber-50 p-4">
          <KeyRound size={18} className="mt-0.5 shrink-0 text-amber-500" />
          <div className="text-sm text-amber-700">
            <p className="font-semibold text-amber-800">Connect Azure Speech to generate audio</p>
            <p className="mt-0.5 text-amber-600">
              Add your Speech key and region in{' '}
              <button
                type="button"
                onClick={onGoToSettings}
                className="font-semibold text-amber-700 underline underline-offset-2"
              >
                Settings
              </button>
              . They are stored only on this device.
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-300/70 bg-red-50 p-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Generate */}
      <div className="mt-6">
        {isConfigured ? (
          <motion.button
            type="button"
            onClick={onGenerate}
            disabled={isGenerating || !text.trim()}
            whileHover={isGenerating || !text.trim() ? undefined : { scale: 1.01 }}
            whileTap={isGenerating || !text.trim() ? undefined : { scale: 0.99 }}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-moon-gradient py-3.5 font-semibold text-white shadow-[0_14px_30px_-10px_rgba(91,141,239,0.85)] focus-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Generating…
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Generate Voice
              </>
            )}
          </motion.button>
        ) : (
          <button
            type="button"
            onClick={onGoToSettings}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-amber-300 bg-amber-50 py-3.5 font-semibold text-amber-700 focus-ring"
          >
            <KeyRound size={20} />
            Add Azure keys to generate
          </button>
        )}
      </div>

      {/* Audio preview */}
      <div className="mt-6">
        <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wider text-slate-600">
          Audio Preview
        </h2>
        {audio ? (
          <AudioPlayer audio={audio} durationHint={audio.durationSec || 0} />
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white/60 p-6">
            <div className="flex items-center gap-3 text-slate-400">
              <AudioLines size={20} />
              <span className="text-sm">Generate audio to preview the waveform here.</span>
            </div>
            <div className="mt-4 opacity-50">
              <Waveform progress={0} bars={72} height={40} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
