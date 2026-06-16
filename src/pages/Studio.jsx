import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import TopBar from '../studio/TopBar.jsx';
import Sidebar from '../studio/Sidebar.jsx';
import DetailsPanel from '../studio/DetailsPanel.jsx';
import TextToSpeechPanel from '../studio/panels/TextToSpeechPanel.jsx';
import VoiceLibraryPanel from '../studio/panels/VoiceLibraryPanel.jsx';
import DocumentsPanel from '../studio/panels/DocumentsPanel.jsx';
import ProjectsPanel from '../studio/panels/ProjectsPanel.jsx';
import SettingsPanel from '../studio/panels/SettingsPanel.jsx';
import { useSettings } from '../lib/useSettings.jsx';
import { useRecent } from '../lib/useRecent.js';
import { synthesizeSpeech } from '../lib/azureTts.js';
import { getVoiceById, getVoicesByLocale } from '../lib/voices.js';
import { formatTime, estimateDurationSeconds, snippet } from '../lib/format.js';

function resolveInitialVoice(locale, preferredId) {
  const voices = getVoicesByLocale(locale);
  if (voices.some((voice) => voice.id === preferredId)) return preferredId;
  return voices[0]?.id || preferredId;
}

/**
 * Soft, light watercolor wash behind the studio — gentle moonlight/water
 * color blooms on a pale base, calm enough to keep panels readable.
 */
function StudioBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ background: 'linear-gradient(160deg, #eef2fc 0%, #e9f1fb 45%, #e8f4f3 100%)' }}
      />
      <div
        className="absolute -left-[10%] top-[-12%] h-[55vh] w-[55vh] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(132,179,255,0.35) 0%, rgba(132,179,255,0) 70%)' }}
      />
      <div
        className="absolute right-[-8%] top-[4%] h-[48vh] w-[48vh] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(150,222,234,0.32) 0%, rgba(150,222,234,0) 70%)' }}
      />
      <div
        className="absolute left-[28%] bottom-[-20%] h-[55vh] w-[62vh] rounded-full blur-[130px]"
        style={{ background: 'radial-gradient(circle, rgba(178,168,255,0.22) 0%, rgba(178,168,255,0) 70%)' }}
      />
      {/* Faint moon glow, upper-right */}
      <div
        className="absolute right-[9%] top-[7%] h-44 w-44 rounded-full blur-2xl"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.9) 0%, rgba(214,228,255,0.45) 45%, rgba(214,228,255,0) 72%)',
        }}
      />
    </div>
  );
}

export default function Studio() {
  const { settings, updateSettings, isConfigured } = useSettings();
  const { recent, addRecent, removeRecent, clearRecent } = useRecent();

  const [activeTab, setActiveTab] = useState('tts');

  // Text-to-speech controls
  const [text, setText] = useState('');
  const [locale, setLocale] = useState(settings.defaultLocale);
  const [voiceId, setVoiceId] = useState(() =>
    resolveInitialVoice(settings.defaultLocale, settings.defaultVoice)
  );
  const [style, setStyle] = useState('default');
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(0);

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle');
  const [audio, setAudio] = useState(null);

  // Session-only playable clips (object URLs cannot be persisted) + cleanup tracking
  const playableRef = useRef(new Map());
  const createdUrlsRef = useRef([]);

  useEffect(() => {
    const urls = createdUrlsRef.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  // The studio is a light surface; tint the shared <html>/<body> (and its
  // scrollbar) light while mounted, then restore the dark landing theme on exit.
  useEffect(() => {
    const { documentElement, body } = document;
    const prevScheme = documentElement.style.colorScheme;
    const prevBg = body.style.backgroundColor;
    documentElement.style.colorScheme = 'light';
    body.style.backgroundColor = '#eef2fc';
    return () => {
      documentElement.style.colorScheme = prevScheme;
      body.style.backgroundColor = prevBg;
    };
  }, []);

  const currentVoice = getVoiceById(voiceId);

  const handleGenerate = async () => {
    if (!isConfigured) {
      setActiveTab('settings');
      return;
    }
    setError('');
    setStatus('generating');
    setIsGenerating(true);
    try {
      const result = await synthesizeSpeech({
        key: settings.azureKey,
        region: settings.azureRegion,
        text,
        voice: voiceId,
        locale,
        style,
        ratePercent: Math.round((speed - 1) * 100),
        pitchPercent: pitch,
        format: settings.outputFormat,
      });

      createdUrlsRef.current.push(result.url);
      const voice = getVoiceById(voiceId);
      const fileName = `moonwave-${voice?.name || 'audio'}-${Date.now()}.${result.ext}`;
      const audioObj = { ...result, fileName, voiceName: voice?.name };
      setAudio(audioObj);
      setStatus('ready');

      const id = `gen-${Date.now()}`;
      playableRef.current.set(id, audioObj);
      addRecent({
        id,
        title: snippet(text),
        voiceName: voice?.name || '—',
        locale,
        format: result.format,
        durationSec: result.durationSec,
        createdAt: Date.now(),
      });
    } catch (err) {
      console.error('Speech synthesis failed:', err);
      setError(err.message || String(err));
      setStatus('error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectRecent = (item) => {
    const audioObj = playableRef.current.get(item.id);
    if (!audioObj) return;
    setAudio(audioObj);
    setStatus('ready');
    setActiveTab('tts');
  };

  const handleRemoveRecent = (id) => {
    removeRecent(id);
    playableRef.current.delete(id);
  };

  const handleClearRecent = () => {
    clearRecent();
    playableRef.current.clear();
  };

  const handleExportSSML = () => {
    if (!audio?.ssml) return;
    const blob = new Blob([audio.ssml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `moonwave-${Date.now()}.xml`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleUseVoice = (voice) => {
    setLocale(voice.locale);
    setVoiceId(voice.id);
    setStyle('default');
    setActiveTab('tts');
  };

  const handleLoadText = (loaded) => {
    setText(loaded);
    setActiveTab('tts');
  };

  // Annotate recent items with their current playability for this session.
  const recentWithPlayable = recent.map((item) => ({
    ...item,
    playable: playableRef.current.has(item.id),
  }));

  const durationLabel = audio?.durationSec
    ? formatTime(audio.durationSec)
    : formatTime(estimateDurationSeconds(text));

  const renderPanel = () => {
    switch (activeTab) {
      case 'voices':
        return <VoiceLibraryPanel onUseVoice={handleUseVoice} currentVoiceId={voiceId} />;
      case 'documents':
        return <DocumentsPanel onLoadText={handleLoadText} />;
      case 'projects':
        return (
          <ProjectsPanel
            recent={recentWithPlayable}
            onSelectRecent={handleSelectRecent}
            onRemoveRecent={handleRemoveRecent}
            onClearRecent={handleClearRecent}
          />
        );
      case 'settings':
        return <SettingsPanel />;
      default:
        return (
          <TextToSpeechPanel
            text={text}
            setText={setText}
            locale={locale}
            setLocale={setLocale}
            voiceId={voiceId}
            setVoiceId={setVoiceId}
            style={style}
            setStyle={setStyle}
            speed={speed}
            setSpeed={setSpeed}
            pitch={pitch}
            setPitch={setPitch}
            isGenerating={isGenerating}
            error={error}
            isConfigured={isConfigured}
            onGenerate={handleGenerate}
            onGoToSettings={() => setActiveTab('settings')}
            audio={audio}
          />
        );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="relative min-h-screen w-full bg-[#eef2fc] text-slate-700"
      style={{ colorScheme: 'light' }}
    >
      <StudioBackdrop />

      <div className="relative z-10 flex min-h-screen flex-col">
        <TopBar activeTab={activeTab} onChange={setActiveTab} isConfigured={isConfigured} />

        <div className="flex flex-1">
          <Sidebar activeTab={activeTab} onChange={setActiveTab} isConfigured={isConfigured} />

          <main className="min-w-0 flex-1">
            {activeTab === 'tts' ? (
              <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-8 sm:px-6">
                <div className="min-w-0 flex-1">{renderPanel()}</div>
                <aside className="hidden w-80 shrink-0 xl:block">
                  <DetailsPanel
                    status={status}
                    charCount={text.length}
                    durationLabel={durationLabel}
                    languageName={currentVoice?.localeName || locale}
                    voiceName={currentVoice ? `${currentVoice.name} (Neural)` : '—'}
                    format={settings.outputFormat}
                    onSetFormat={(fmt) => updateSettings({ outputFormat: fmt })}
                    onExportSSML={handleExportSSML}
                    hasAudio={!!audio}
                    recent={recentWithPlayable}
                    onSelectRecent={handleSelectRecent}
                    onViewAllRecent={() => setActiveTab('projects')}
                  />
                </aside>
              </div>
            ) : (
              <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">{renderPanel()}</div>
            )}
          </main>
        </div>
      </div>
    </motion.div>
  );
}
