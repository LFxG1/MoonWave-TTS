import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  AudioLines,
  Check,
  ChevronDown,
  ChevronLeft,
  Clock,
  FileText,
  FolderOpen,
  HardDrive,
  LibraryBig,
  MoreHorizontal,
  Pencil,
  Play,
  Settings2,
  Trash2,
  Wand2,
  X,
} from 'lucide-react';
import Logo from '../components/Logo.jsx';
import AudioPlayer from '../components/AudioPlayer.jsx';
import TextToSpeechPanel from '../studio/panels/TextToSpeechPanel.jsx';
import VoiceLibraryPanel from '../studio/panels/VoiceLibraryPanel.jsx';
import DocumentsPanel from '../studio/panels/DocumentsPanel.jsx';
import ProjectsPanel from '../studio/panels/ProjectsPanel.jsx';
import SettingsPanel from '../studio/panels/SettingsPanel.jsx';
import { useSettings } from '../lib/useSettings.jsx';
import { useProjects } from '../lib/useProjects.js';
import { DEFAULT_HD_PARAMETERS, redactSensitiveText, synthesizeSpeech } from '../lib/azureTts.js';
import {
  getVoiceById,
  getVoicesByLocale,
  supportsHdParameters,
  supportsStylePrompt,
} from '../lib/voices.js';
import { estimateDurationSeconds, formatTimestamp, snippet } from '../lib/format.js';

const NAV_ITEMS = [
  { id: 'tts', label: 'Studio', icon: AudioLines },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'voices', label: 'Voice Library', icon: LibraryBig },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings2 },
];
const MAX_STYLE_PROMPT_CHARS = 220;

function resolveInitialVoice(locale, preferredId) {
  const voices = getVoicesByLocale(locale);
  if (voices.some((voice) => voice.id === preferredId)) return preferredId;
  return voices[0]?.id || preferredId;
}

function StudioBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <img
        src="/moonwave-hero.png"
        alt=""
        aria-hidden="true"
        className="h-full w-full object-cover object-[50%_76%] opacity-100"
      />
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(2,6,18,0.58)_0%,rgba(3,12,24,0.28)_42%,rgba(3,7,18,0.56)_100%)]" />
      <div className="absolute bottom-[-10%] left-0 right-0 h-[42vh] bg-[radial-gradient(ellipse_at_center,rgba(34,211,238,0.22),transparent_64%)] blur-3xl" />
    </div>
  );
}

function StudioWorkspaceBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 scale-[1.42] opacity-90"
        style={{
          backgroundImage: "url('/moonwave-hero.png')",
          backgroundPosition: 'center 88%',
          backgroundSize: 'cover',
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,18,0.76)_0%,rgba(2,10,22,0.30)_42%,rgba(2,6,18,0.56)_100%)]" />
      <div className="absolute inset-x-0 top-0 h-[30%] bg-[linear-gradient(180deg,rgba(2,6,18,0.90)_0%,rgba(2,6,18,0.50)_68%,transparent_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-[56%] bg-[linear-gradient(180deg,transparent_0%,rgba(22,88,108,0.18)_42%,rgba(2,6,18,0.36)_100%)]" />
      <div className="absolute bottom-[8%] left-[6%] h-[30%] w-[48%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(226,246,255,0.18),transparent_66%)] blur-3xl" />
    </div>
  );
}

function StudioShellSidebar({
  activeTab,
  onChange,
  isConfigured,
  projects,
  currentProjectId,
  onProjectChange,
  onChooseWorkspace,
}) {
  const currentProject = projects.find((project) => project.id === currentProjectId);

  return (
    <aside className="relative hidden w-[300px] shrink-0 overflow-hidden border-r border-white/10 lg:flex lg:flex-col">
      <img
        src="/moonwave-hero.png"
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover object-[18%_center] opacity-100"
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(2,6,23,0.08)_0%,rgba(2,6,23,0.34)_42%,rgba(2,6,23,0.76)_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.02)_0%,rgba(2,6,23,0.62)_100%)]" />
      <div className="absolute left-8 top-10 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.18),transparent_68%)] blur-2xl" />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col p-4">
        <Logo size="md" subtitle="Studio" tone="light" />

        <nav className="mt-6 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChange(item.id)}
                className={`group flex items-center gap-3 rounded-xl border px-3.5 py-2.5 text-left text-sm font-medium transition-all focus-ring ${
                  active
                    ? 'border-cyan-200/[0.45] bg-[#061a2d]/80 text-white shadow-[0_18px_42px_-18px_rgba(56,189,248,0.95),inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-md'
                    : 'border-transparent text-slate-300/90 hover:border-white/10 hover:bg-white/[0.08] hover:text-white'
                }`}
              >
                <span
                  className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
                    active
                      ? 'bg-cyan-300/25 text-white shadow-[0_0_22px_-8px_rgba(103,232,249,0.95)]'
                      : 'bg-white/[0.08] text-slate-300 group-hover:text-cyan-200'
                  }`}
                >
                  <Icon size={16} />
                </span>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto space-y-2.5 pt-4">
          <div>
            <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-slate-300/80">Project</p>
            {projects.length > 0 ? (
              <div className="relative">
                <select
                  value={currentProjectId}
                  onChange={(event) => onProjectChange?.(event.target.value)}
                  className="w-full appearance-none rounded-xl border border-white/[0.15] bg-black/[0.28] px-3.5 py-2.5 pr-10 text-sm font-medium text-white outline-none backdrop-blur-md focus-ring"
                  aria-label="Current project"
                >
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300"
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onChange('projects')}
                className="w-full rounded-xl border border-white/[0.15] bg-black/[0.28] px-3.5 py-2.5 text-left text-sm text-slate-200 backdrop-blur-md focus-ring"
              >
                Create a project
              </button>
            )}
            <button
              type="button"
              onClick={onChooseWorkspace}
              className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.15] bg-black/20 px-3.5 py-2 text-sm text-slate-200 transition-colors hover:bg-white/10 focus-ring"
            >
              <HardDrive size={15} />
              {currentProject ? 'Change folder' : 'Choose folder'}
            </button>
          </div>

          {isConfigured && (
            <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-400/10 px-3 py-2 backdrop-blur-md">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
              <span className="text-xs font-medium text-emerald-100">Backend - Ready</span>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function MobileStudioNav({ activeTab, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-black/20 px-4 py-3 backdrop-blur-xl lg:hidden">
      <Logo size="sm" subtitle="Studio" tone="light" />
      <select
        value={activeTab}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-xl border border-white/[0.15] bg-black/30 px-3 py-2 text-sm text-white outline-none focus-ring"
        aria-label="Switch section"
      >
        {NAV_ITEMS.map((item) => (
          <option key={item.id} value={item.id}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function StudioTopActions({ onExit }) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3">
      <button
        type="button"
        onClick={onExit}
        className="inline-flex items-center gap-2 rounded-xl border border-white/[0.15] bg-black/20 px-4 py-3 text-sm text-slate-200 transition-colors hover:bg-white/10 focus-ring"
      >
        <ChevronLeft size={16} />
        Exit
      </button>
    </div>
  );
}

function PerformanceDirectionPanel({
  voice,
  stylePrompt,
  setStylePrompt,
  setStyle,
}) {
  const supported = supportsStylePrompt(voice);
  const promptValue = supported ? stylePrompt : '';

  const handlePromptChange = (event) => {
    const nextValue = event.target.value.slice(0, MAX_STYLE_PROMPT_CHARS);
    setStylePrompt(nextValue);
    if (nextValue.trim()) {
      setStyle('default');
    }
  };

  return (
    <section className="glass rounded-2xl p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base font-semibold text-slate-800">
            Performance Direction
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {supported ? 'Omni prompt control' : 'Available with Ava or Andrew Omni HD'}
          </p>
        </div>
        {supported && (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-cyan-200/30 bg-cyan-300/10 px-2.5 py-1 text-xs font-medium text-cyan-100">
            <Wand2 size={13} />
            Omni
          </span>
        )}
      </div>

      <textarea
        value={promptValue}
        onChange={handlePromptChange}
        disabled={!supported}
        placeholder={
          supported
            ? 'Read like a tense midnight campfire story, quiet and suspenseful.'
            : 'Select Ava Omni HD or Andrew Omni HD to direct the performance.'
        }
        rows={3}
        className="w-full resize-none rounded-xl border border-slate-200 bg-white/55 px-3.5 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus-ring disabled:cursor-not-allowed disabled:opacity-55"
      />
      <div className="mt-2 flex items-center justify-between gap-3 text-xs text-slate-500">
        <span>Typing here clears fixed Emotion.</span>
        <span className="font-mono">
          {promptValue.length} / {MAX_STYLE_PROMPT_CHARS}
        </span>
      </div>
    </section>
  );
}

function SavedClipsPanel({
  projects,
  currentProjectId,
  currentProject,
  clips,
  onProjectChange,
  onSelectClip,
  onViewAll,
  onDeleteClip,
  onRenameClip,
}) {
  const clipCount = currentProject?.clips?.length || 0;
  const [openClipMenuId, setOpenClipMenuId] = useState('');
  const [renamingClipId, setRenamingClipId] = useState('');
  const [renameValue, setRenameValue] = useState('');
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    setOpenClipMenuId('');
    setRenamingClipId('');
    setRenameValue('');
    setActionError('');
  }, [currentProjectId]);

  const startRename = (clip) => {
    setOpenClipMenuId('');
    setActionError('');
    setRenamingClipId(clip.id);
    setRenameValue(clip.title || '');
  };

  const cancelRename = () => {
    setRenamingClipId('');
    setRenameValue('');
    setActionError('');
  };

  const handleRenameSubmit = async (event, clip) => {
    event.preventDefault();
    const projectId = clip.projectId || currentProjectId;
    if (!projectId || !onRenameClip) return;

    setActionError('');
    try {
      await onRenameClip(projectId, clip.id, renameValue);
      cancelRename();
    } catch (err) {
      setActionError(err.message || String(err));
    }
  };

  const handleDelete = async (clip) => {
    const projectId = clip.projectId || currentProjectId;
    if (!projectId || !onDeleteClip) return;

    setOpenClipMenuId('');
    setActionError('');
    try {
      await onDeleteClip(projectId, clip.id);
    } catch (err) {
      setActionError(err.message || String(err));
    }
  };

  return (
    <aside className="glass flex min-h-[300px] flex-col rounded-2xl p-4">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="font-display text-base font-semibold text-slate-800">Saved Clips</h2>
        <button
          type="button"
          onClick={onViewAll}
          className="rounded text-sm font-medium text-[#5b8def] hover:text-cyan-200 focus-ring"
        >
          View all
        </button>
      </div>

      <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white/50 px-4 py-3">
        {projects.length > 0 ? (
          <>
            <select
              value={currentProjectId}
              onChange={(event) => onProjectChange?.(event.target.value)}
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold text-slate-800 outline-none"
              aria-label="Saved clips project"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <span className="shrink-0 text-sm text-slate-500">
              {clipCount} clip{clipCount === 1 ? '' : 's'}
            </span>
          </>
        ) : (
          <span className="text-sm text-slate-500">Create a project to save clips.</span>
        )}
      </div>

      {clips.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="max-w-xs text-sm text-slate-400">
            Generated clips from the active project will appear here.
          </p>
        </div>
      ) : (
        <>
          {actionError && (
            <p className="mb-2 rounded-lg border border-red-300/60 bg-red-50 px-3 py-2 text-xs text-red-600">
              {actionError}
            </p>
          )}
          <ul className="flex flex-col divide-y divide-slate-200/70">
            {clips.slice(0, 3).map((clip) => {
              const isRenaming = renamingClipId === clip.id;
              const menuOpen = openClipMenuId === clip.id;
              return (
                <li key={clip.id} className="flex items-center gap-3 py-3">
                  {isRenaming ? (
                    <form
                      onSubmit={(event) => handleRenameSubmit(event, clip)}
                      className="min-w-0 flex-1"
                    >
                      <input
                        value={renameValue}
                        onChange={(event) => setRenameValue(event.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-sm text-slate-800 focus-ring"
                        aria-label="Rename clip"
                        autoFocus
                      />
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="submit"
                          className="grid h-8 w-8 place-items-center rounded-lg bg-[#eaf1ff] text-[#5b8def] hover:bg-[#dce8ff] focus-ring"
                          title="Save name"
                        >
                          <Check size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={cancelRename}
                          className="grid h-8 w-8 place-items-center rounded-lg bg-slate-100 text-slate-500 hover:bg-slate-200 focus-ring"
                          title="Cancel rename"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSelectClip?.(clip)}
                      className="min-w-0 flex-1 rounded-lg px-1 py-1 text-left focus-ring"
                      title="Load clip in studio"
                    >
                      <span className="block truncate text-sm font-medium text-slate-800">{clip.title}</span>
                      <span className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                        <Clock size={11} />
                        {formatTimestamp(clip.createdAt)}
                      </span>
                      <span className="mt-1 block truncate text-xs text-slate-400">
                        {clip.voiceName} - {clip.format?.toUpperCase()}
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onSelectClip?.(clip)}
                    disabled={isRenaming}
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-slate-200 bg-white/50 text-slate-200 transition-colors hover:bg-[#eaf1ff] hover:text-[#5b8def] focus-ring disabled:cursor-not-allowed disabled:opacity-40"
                    title="Load clip"
                  >
                    <Play size={16} fill="currentColor" />
                  </button>
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setOpenClipMenuId(menuOpen ? '' : clip.id)}
                      className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white/50 text-slate-400 transition-colors hover:bg-slate-100/70 hover:text-slate-200 focus-ring"
                      title="Clip actions"
                      aria-expanded={menuOpen}
                    >
                      <MoreHorizontal size={17} />
                    </button>
                    {menuOpen && (
                      <div className="absolute right-0 top-11 z-30 w-36 overflow-hidden rounded-xl border border-slate-200 bg-slate-950/95 p-1 shadow-[0_20px_50px_-24px_rgba(0,0,0,0.95)]">
                        <button
                          type="button"
                          onClick={() => startRename(clip)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-slate-100 hover:bg-white/10 focus-ring"
                        >
                          <Pencil size={14} />
                          Rename
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(clip)}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-red-300 hover:bg-red-500/15 focus-ring"
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </aside>
  );
}

export default function Studio() {
  const navigate = useNavigate();
  const { settings, updateSettings, isConfigured } = useSettings();
  const projectsState = useProjects();

  const [activeTab, setActiveTab] = useState('tts');
  const [text, setText] = useState('');
  const [locale, setLocale] = useState(settings.defaultLocale);
  const [voiceId, setVoiceId] = useState(() =>
    resolveInitialVoice(settings.defaultLocale, settings.defaultVoice)
  );
  const [style, setStyle] = useState('default');
  const [styleDegree, setStyleDegree] = useState(1);
  const [stylePrompt, setStylePrompt] = useState('');
  const [hdParameters, setHdParameters] = useState(DEFAULT_HD_PARAMETERS);
  const [speed, setSpeed] = useState(1);
  const [pitch, setPitch] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle');
  const [audio, setAudio] = useState(null);
  const [activeClipId, setActiveClipId] = useState('');
  const [projectSaveNotice, setProjectSaveNotice] = useState(null);

  const createdUrlsRef = useRef([]);

  useEffect(() => {
    const urls = createdUrlsRef.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  useEffect(() => {
    const { documentElement, body } = document;
    const prevScheme = documentElement.style.colorScheme;
    const prevBg = body.style.backgroundColor;
    documentElement.style.colorScheme = 'dark';
    body.style.backgroundColor = '#030712';
    return () => {
      documentElement.style.colorScheme = prevScheme;
      body.style.backgroundColor = prevBg;
    };
  }, []);

  const currentVoice = getVoiceById(voiceId);
  const projectClipItems = projectsState.currentProjectClips.map((clip) => ({
    ...clip,
    projectId: clip.projectId || projectsState.currentProject?.id,
    playable: true,
  }));

  const handleGenerate = async () => {
    setError('');
    setProjectSaveNotice(null);
    setActiveClipId('');
    setStatus('generating');
    setIsGenerating(true);

    try {
      const ratePercent = Math.round((speed - 1) * 100);
      const voice = getVoiceById(voiceId);
      const activeHdParameters = supportsHdParameters(voice)
        ? { ...DEFAULT_HD_PARAMETERS, ...hdParameters }
        : undefined;
      const result = await synthesizeSpeech({
        text,
        voice: voiceId,
        locale,
        style,
        styleDegree,
        stylePrompt,
        pauseMarkers: true,
        hdParameters: activeHdParameters,
        ratePercent,
        pitchPercent: pitch,
        format: settings.outputFormat,
      });

      createdUrlsRef.current.push(result.url);
      const title = snippet(text);
      let fileName = `moonwave-${voice?.name || 'audio'}-${Date.now()}.${result.ext}`;

      if (projectsState.currentProject) {
        try {
          const saveResult = await projectsState.saveGeneratedClip({
            audioBlob: result.blob,
            ssml: result.ssml,
            title,
            text,
            textSnippet: title,
            voiceId,
            voiceName: voice?.name || 'Unknown voice',
            locale,
            style,
            styleDegree,
            stylePrompt,
            hdParameters: activeHdParameters,
            ratePercent,
            pitchPercent: pitch,
            format: result.format,
            ext: result.ext,
            mime: result.mime,
            durationSec: result.durationSec,
          });

          if (saveResult.saved) {
            fileName = saveResult.clip.audioFileName;
            setActiveClipId(saveResult.clip.id);
            setProjectSaveNotice({
              type: 'success',
              message: `Saved to ${projectsState.currentProject.name}.`,
            });
          }
        } catch (saveError) {
          setProjectSaveNotice({
            type: 'warning',
            message: saveError.message || String(saveError),
          });
        }
      } else {
        setProjectSaveNotice({
          type: 'warning',
          message: 'Generated audio is ready, but it was not saved to a project.',
        });
      }

      setAudio({ ...result, fileName, voiceName: voice?.name, title });
      setStatus('ready');
    } catch (err) {
      const safeMessage = redactSensitiveText(err.message || String(err));
      console.error('Speech synthesis failed:', safeMessage);
      setError(safeMessage);
      setStatus('error');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectClip = async (projectId, clipId) => {
    setError('');
    setProjectSaveNotice(null);

    try {
      const { clip, blob, ssml } = await projectsState.loadClipAudio(projectId, clipId);
      const url = URL.createObjectURL(blob);
      createdUrlsRef.current.push(url);

      setAudio({
        blob,
        url,
        mime: clip.mime || blob.type || 'audio/mpeg',
        ext: clip.ext || clip.format || 'mp3',
        format: clip.format || 'mp3',
        durationSec: clip.durationSec,
        ssml,
        fileName: clip.audioFileName,
        voiceName: clip.voiceName,
        title: clip.title,
      });
      setActiveClipId(clip.id);

      if (clip.text) setText(clip.text);
      if (clip.locale) setLocale(clip.locale);
      if (clip.voiceId && getVoiceById(clip.voiceId)) setVoiceId(clip.voiceId);
      setStyle(clip.style || 'default');
      setStyleDegree(Number(clip.styleDegree) || 1);
      setStylePrompt(clip.stylePrompt || '');
      setHdParameters({ ...DEFAULT_HD_PARAMETERS, ...(clip.hdParameters || {}) });
      setSpeed(Math.min(2, Math.max(0.5, 1 + (Number(clip.ratePercent) || 0) / 100)));
      setPitch(Number(clip.pitchPercent) || 0);
      setStatus('ready');
      setActiveTab('tts');
      setProjectSaveNotice({
        type: 'success',
        message: `Loaded ${clip.title} from project files.`,
      });
    } catch (err) {
      setError(err.message || String(err));
      setStatus('error');
    }
  };

  const handlePlayClipInline = async (projectId, clipId) => {
    setError('');
    try {
      return await projectsState.loadClipAudio(projectId, clipId);
    } catch (err) {
      setError(err.message || String(err));
      throw err;
    }
  };

  const handleDeleteClip = async (projectId, clipId) => {
    setError('');
    try {
      await projectsState.deleteClip(projectId, clipId);
      if (clipId === activeClipId) {
        setAudio(null);
        setActiveClipId('');
        setStatus('idle');
      }
      setProjectSaveNotice({
        type: 'success',
        message: 'Clip deleted from project files.',
      });
    } catch (err) {
      setError(err.message || String(err));
      setStatus('error');
    }
  };

  const handleRenameClip = async (projectId, clipId, title) => {
    setError('');
    try {
      const result = await projectsState.renameClip(projectId, clipId, title);
      if (clipId === activeClipId) {
        setAudio((previous) =>
          previous ? { ...previous, title: result.clip.title } : previous
        );
      }
      setProjectSaveNotice({
        type: 'success',
        message: 'Clip renamed.',
      });
      return result;
    } catch (err) {
      setError(err.message || String(err));
      setStatus('error');
      throw err;
    }
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
    setStyleDegree(1);
    setStylePrompt('');
    setActiveTab('tts');
  };

  const handleLoadText = (loaded) => {
    setText(loaded);
    setActiveTab('tts');
  };

  const renderPanel = () => {
    switch (activeTab) {
      case 'voices':
        return <VoiceLibraryPanel onUseVoice={handleUseVoice} currentVoiceId={voiceId} />;
      case 'documents':
        return <DocumentsPanel onLoadText={handleLoadText} />;
      case 'projects':
        return (
          <ProjectsPanel
            supported={projectsState.supported}
            workspaceName={projectsState.workspaceName}
            workspacePermission={projectsState.workspacePermission}
            workspaceReady={projectsState.workspaceReady}
            projects={projectsState.projects}
            currentProjectId={projectsState.currentProjectId}
            currentProject={projectsState.currentProject}
            loading={projectsState.loading}
            error={projectsState.error}
            onChooseWorkspace={projectsState.chooseWorkspace}
            onReconnectWorkspace={projectsState.reconnectWorkspace}
            onRefreshProjects={() => projectsState.refreshProjects()}
            onCreateProject={projectsState.createProject}
            onSelectProject={projectsState.setCurrentProjectId}
            onPlayClip={handlePlayClipInline}
            onDeleteClip={handleDeleteClip}
            onRenameClip={handleRenameClip}
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
            styleDegree={styleDegree}
            setStyleDegree={setStyleDegree}
            stylePrompt={stylePrompt}
            setStylePrompt={setStylePrompt}
            hdParameters={hdParameters}
            setHdParameters={setHdParameters}
            speed={speed}
            setSpeed={setSpeed}
            pitch={pitch}
            setPitch={setPitch}
            isGenerating={isGenerating}
            error={error}
            onGenerate={handleGenerate}
            audio={audio}
            outputFormat={settings.outputFormat}
            onSetFormat={(fmt) => updateSettings({ outputFormat: fmt })}
            onExportSSML={handleExportSSML}
            hasAudio={!!audio}
            projectSaveNotice={projectSaveNotice}
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
      className="studio-dark relative min-h-screen w-full"
      style={{ colorScheme: 'dark' }}
    >
      <StudioBackdrop />

      <div className="relative z-10 min-h-screen p-2 sm:p-4">
        <div className="mx-auto flex h-[calc(100vh-1rem)] max-w-[1860px] flex-col overflow-hidden rounded-[1.75rem] border border-white/[0.15] bg-black/[0.16] shadow-[0_35px_120px_-54px_rgba(0,0,0,0.95)] backdrop-blur-md sm:h-[calc(100vh-2rem)]">
          <div className="flex min-h-0 flex-1">
            <StudioShellSidebar
              activeTab={activeTab}
              onChange={setActiveTab}
              isConfigured={isConfigured}
              projects={projectsState.projects}
              currentProjectId={projectsState.currentProjectId}
              onProjectChange={projectsState.setCurrentProjectId}
              onChooseWorkspace={projectsState.chooseWorkspace}
            />

            <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
              <StudioWorkspaceBackdrop />

              <div className="relative z-10 flex min-h-0 flex-1 flex-col">
                <MobileStudioNav activeTab={activeTab} onChange={setActiveTab} />

                {activeTab === 'tts' ? (
                  <main className="flex min-h-0 flex-1 flex-col">
                    <div className="px-5 pt-5 sm:px-8">
                      <StudioTopActions
                        onExit={() => navigate('/')}
                      />
                    </div>
                    <div className="grid min-h-0 flex-1 gap-6 overflow-y-auto px-5 pb-6 pt-5 sm:px-8 xl:grid-cols-[minmax(0,1fr)_minmax(360px,440px)]">
                      <div className="min-w-0">{renderPanel()}</div>
                      <div className="min-w-0 xl:pt-[94px]">
                        <div className="flex min-h-0 flex-col gap-4">
                          <PerformanceDirectionPanel
                            voice={currentVoice}
                            stylePrompt={stylePrompt}
                            setStylePrompt={setStylePrompt}
                            setStyle={setStyle}
                          />
                          <SavedClipsPanel
                            projects={projectsState.projects}
                            currentProjectId={projectsState.currentProjectId}
                            currentProject={projectsState.currentProject}
                            clips={projectClipItems}
                            onProjectChange={projectsState.setCurrentProjectId}
                            onSelectClip={(item) => handleSelectClip(item.projectId, item.id)}
                            onViewAll={() => setActiveTab('projects')}
                            onDeleteClip={handleDeleteClip}
                            onRenameClip={handleRenameClip}
                          />
                        </div>
                      </div>
                    </div>
                  </main>
                ) : (
                  <main className="flex min-h-0 flex-1 flex-col overflow-hidden px-5 py-5 sm:px-8">
                    <div className="mb-5 flex shrink-0 justify-end">
                      <StudioTopActions
                        onExit={() => navigate('/')}
                      />
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto pr-1">
                      {renderPanel()}
                    </div>
                  </main>
                )}
              </div>
            </div>
          </div>

          {activeTab === 'tts' && (
            <AudioPlayer
              audio={audio}
              durationHint={audio?.durationSec || estimateDurationSeconds(text)}
              title={audio?.title || snippet(text) || 'Generate audio to preview your waveform.'}
              voiceName={audio?.voiceName || currentVoice?.name || 'No voice selected'}
              format={audio?.format || settings.outputFormat}
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}
