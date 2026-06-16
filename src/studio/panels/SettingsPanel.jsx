import { useState } from 'react';
import {
  KeyRound,
  Eye,
  EyeOff,
  PlugZap,
  CheckCircle2,
  XCircle,
  Trash2,
  ShieldCheck,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { useSettings } from '../../lib/useSettings.jsx';
import { fetchAzureVoices } from '../../lib/azureTts.js';
import { getLocales, getVoicesByLocale, AZURE_REGIONS } from '../../lib/voices.js';

const labelClass = 'mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500';
const controlClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-700 focus-ring';

export default function SettingsPanel() {
  const { settings, updateSettings, resetSettings, isConfigured } = useSettings();
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const locales = getLocales();
  const voicesForDefaultLocale = getVoicesByLocale(settings.defaultLocale);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const voices = await fetchAzureVoices({
        key: settings.azureKey,
        region: settings.azureRegion,
      });
      setTestResult({ ok: true, message: `Connected successfully — ${voices.length} voices available.` });
    } catch (error) {
      setTestResult({ ok: false, message: error.message || String(error) });
    } finally {
      setTesting(false);
    }
  };

  const handleClear = () => {
    resetSettings();
    setTestResult(null);
  };

  const handleDefaultLocaleChange = (event) => {
    const newLocale = event.target.value;
    const voices = getVoicesByLocale(newLocale);
    updateSettings({
      defaultLocale: newLocale,
      defaultVoice: voices[0]?.id || settings.defaultVoice,
    });
  };

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold text-slate-800">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Connect your Azure Speech resource and set your studio defaults.
        </p>
      </div>

      {/* Credentials */}
      <section className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#eef3ff] text-[#5b8def]">
            <KeyRound size={18} />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-slate-800">Azure Speech credentials</h2>
            <p className="text-xs text-slate-500">From your Speech resource in the Azure portal.</p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className={labelClass} htmlFor="azure-key">
              Subscription key
            </label>
            <div className="relative">
              <input
                id="azure-key"
                type={showKey ? 'text' : 'password'}
                value={settings.azureKey}
                onChange={(e) => updateSettings({ azureKey: e.target.value })}
                placeholder="Paste your Speech key"
                autoComplete="off"
                spellCheck={false}
                className={`${controlClass} pr-11 font-mono`}
              />
              <button
                type="button"
                onClick={() => setShowKey((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded text-slate-400 hover:text-slate-700 focus-ring"
                aria-label={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="azure-region">
              Region
            </label>
            <div className="relative">
              <select
                id="azure-region"
                value={settings.azureRegion}
                onChange={(e) => updateSettings({ azureRegion: e.target.value })}
                className={`${controlClass} appearance-none pr-10`}
              >
                <option value="">Select a region…</option>
                {AZURE_REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleTest}
              disabled={!isConfigured || testing}
              className="inline-flex items-center gap-2 rounded-xl bg-moon-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-8px_rgba(91,141,239,0.75)] focus-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {testing ? <Loader2 size={16} className="animate-spin" /> : <PlugZap size={16} />}
              Test connection
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-white focus-ring"
            >
              <Trash2 size={16} />
              Clear
            </button>
          </div>

          {testResult && (
            <div
              className={`flex items-start gap-2.5 rounded-xl border p-3.5 text-sm ${
                testResult.ok
                  ? 'border-emerald-300/60 bg-emerald-50 text-emerald-700'
                  : 'border-red-300/60 bg-red-50 text-red-600'
              }`}
            >
              {testResult.ok ? (
                <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-500" />
              ) : (
                <XCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-white/60 p-3.5">
            <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#5b8def]" />
            <p className="text-xs leading-relaxed text-slate-500">
              Your key and region are stored only in this browser (localStorage) and are sent
              directly to Azure when you generate speech. Nothing is uploaded to any other server.
            </p>
          </div>
        </div>
      </section>

      {/* Defaults */}
      <section className="glass mt-5 rounded-2xl p-6">
        <h2 className="font-display text-base font-semibold text-slate-800">Studio defaults</h2>
        <p className="text-xs text-slate-500">Used when you open a new session.</p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass}>Default language</label>
            <div className="relative">
              <select
                value={settings.defaultLocale}
                onChange={handleDefaultLocaleChange}
                className={`${controlClass} appearance-none pr-10`}
              >
                {locales.map((item) => (
                  <option key={item.locale} value={item.locale}>
                    {item.localeName}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Default voice</label>
            <div className="relative">
              <select
                value={settings.defaultVoice}
                onChange={(e) => updateSettings({ defaultVoice: e.target.value })}
                className={`${controlClass} appearance-none pr-10`}
              >
                {voicesForDefaultLocale.map((voice) => (
                  <option key={voice.id} value={voice.id}>
                    {voice.name} · {voice.gender}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={16}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <label className={labelClass}>Default output format</label>
          <div className="flex gap-2">
            {['mp3', 'wav'].map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => updateSettings({ outputFormat: fmt })}
                className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition-colors focus-ring ${
                  settings.outputFormat === fmt
                    ? 'border-[#5b8def]/50 bg-[#eaf1ff] text-[#3068d6]'
                    : 'border-slate-200 bg-white/60 text-slate-500 hover:bg-slate-100/70'
                }`}
              >
                {fmt.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
