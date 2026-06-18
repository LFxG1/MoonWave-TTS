import { useEffect, useState } from 'react';
import {
  PlugZap,
  CheckCircle2,
  XCircle,
  Trash2,
  ShieldCheck,
  Loader2,
  ChevronDown,
  ServerCog,
} from 'lucide-react';
import { useSettings } from '../../lib/useSettings.jsx';
import { fetchAzureVoices, getTtsApiBaseUrl } from '../../lib/azureTts.js';
import {
  getLocales,
  getRecommendedVoicesByLocale,
  getStandardVoicesByLocale,
  getVoicesByLocale,
} from '../../lib/voices.js';

const labelClass = 'mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500';
const controlClass =
  'w-full rounded-xl border border-slate-200 bg-white/80 px-3.5 py-2.5 text-sm text-slate-700 focus-ring';

export default function SettingsPanel() {
  const { settings, updateSettings, resetSettings, backendStatus, checkBackend } = useSettings();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(() =>
    backendStatus.state === 'checking'
      ? null
      : { ok: backendStatus.state === 'ready', message: backendStatus.message }
  );

  const locales = getLocales();
  const recommendedDefaultVoices = getRecommendedVoicesByLocale(settings.defaultLocale);
  const standardDefaultVoices = getStandardVoicesByLocale(settings.defaultLocale);
  const voicesForDefaultLocale = getVoicesByLocale(settings.defaultLocale);
  const apiBaseUrl = getTtsApiBaseUrl();

  useEffect(() => {
    if (testing || backendStatus.state === 'checking') return;
    setTestResult({
      ok: backendStatus.state === 'ready',
      message: backendStatus.message,
    });
  }, [backendStatus, testing]);

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const health = await checkBackend();
      if (health.state !== 'ready') {
        setTestResult({
          ok: false,
          message: health.message,
        });
        return;
      }
      const voices = await fetchAzureVoices();
      setTestResult({
        ok: true,
        message: `Backend connected successfully. ${voices.length} voices available.`,
      });
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
          Check the backend connection and set your studio defaults.
        </p>
      </div>

      <section className="glass rounded-2xl p-6">
        <div className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[#eef3ff] text-[#5b8def]">
            <ServerCog size={18} />
          </span>
          <div>
            <h2 className="font-display text-base font-semibold text-slate-800">
              Azure Function backend
            </h2>
            <p className="text-xs text-slate-500">Speech requests are proxied through the API.</p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label className={labelClass} htmlFor="tts-api-base-url">
              API base URL
            </label>
            <input
              id="tts-api-base-url"
              value={apiBaseUrl}
              readOnly
              className={`${controlClass} font-mono text-xs`}
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="button"
              onClick={handleTest}
              disabled={testing}
              className="inline-flex items-center gap-2 rounded-xl bg-moon-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-8px_rgba(91,141,239,0.75)] focus-ring disabled:cursor-not-allowed disabled:opacity-50"
            >
              {testing ? <Loader2 size={16} className="animate-spin" /> : <PlugZap size={16} />}
              Test backend
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-4 py-2.5 text-sm text-slate-600 transition-colors hover:bg-white focus-ring"
            >
              <Trash2 size={16} />
              Reset preferences
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
              Azure keys are read only by the Function from app settings. The browser stores voice
              and output preferences, never Speech credentials.
            </p>
          </div>
        </div>
      </section>

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
                {recommendedDefaultVoices.length > 0 && (
                  <optgroup label="Recommended U.S.">
                    {recommendedDefaultVoices.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name} - {voice.gender}
                      </option>
                    ))}
                  </optgroup>
                )}
                {standardDefaultVoices.length > 0 && (
                  <optgroup label={recommendedDefaultVoices.length ? 'Other voices' : 'Voices'}>
                    {standardDefaultVoices.map((voice) => (
                      <option key={voice.id} value={voice.id}>
                        {voice.name} - {voice.gender}
                      </option>
                    ))}
                  </optgroup>
                )}
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
