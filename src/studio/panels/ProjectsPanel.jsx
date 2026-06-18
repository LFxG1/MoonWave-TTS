import { useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertCircle,
  Check,
  Clock,
  FolderOpen,
  FolderPlus,
  HardDrive,
  Loader2,
  MoreHorizontal,
  Pause,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Trash2,
  X,
} from 'lucide-react';
import { formatTimestamp, formatTime } from '../../lib/format.js';

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white/90 px-3.5 py-2.5 text-sm text-slate-700 focus-ring';

function ProjectStatus({ supported, workspaceName, workspacePermission }) {
  if (!supported) {
    return {
      tone: 'amber',
      icon: AlertCircle,
      message: 'Folder projects work in Chrome or Edge. You can still generate and download audio manually.',
    };
  }

  if (!workspaceName) {
    return {
      tone: 'slate',
      icon: HardDrive,
      message: 'Choose a folder where MoonWave can create project folders and save generated audio.',
    };
  }

  if (workspacePermission !== 'granted') {
    return {
      tone: 'amber',
      icon: AlertCircle,
      message: `Reconnect "${workspaceName}" so MoonWave can read and save project files.`,
    };
  }

  return null;
}

export default function ProjectsPanel({
  supported,
  workspaceName,
  workspacePermission,
  workspaceReady,
  projects,
  currentProjectId,
  currentProject,
  loading,
  error,
  onChooseWorkspace,
  onReconnectWorkspace,
  onRefreshProjects,
  onCreateProject,
  onSelectProject,
  onPlayClip,
  onDeleteClip,
  onRenameClip,
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [createError, setCreateError] = useState('');
  const [openClipMenuId, setOpenClipMenuId] = useState('');
  const [renamingClipId, setRenamingClipId] = useState('');
  const [renameValue, setRenameValue] = useState('');
  const [renameError, setRenameError] = useState('');
  const audioRef = useRef(null);
  const audioUrlRef = useRef('');
  const [loadedClipId, setLoadedClipId] = useState('');
  const [playingClipId, setPlayingClipId] = useState('');
  const [loadingClipId, setLoadingClipId] = useState('');

  const status = ProjectStatus({ supported, workspaceName, workspacePermission });
  const StatusIcon = status?.icon;
  const clips = useMemo(
    () => [...(currentProject?.clips || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [currentProject]
  );

  useEffect(() => {
    setOpenClipMenuId('');
    setRenamingClipId('');
    setRenameValue('');
    setRenameError('');
  }, [currentProjectId]);

  const handleCreate = async (event) => {
    event.preventDefault();
    setCreateError('');
    try {
      await onCreateProject(projectName);
      setProjectName('');
      setIsCreating(false);
    } catch (err) {
      setCreateError(err.message || String(err));
    }
  };

  const startRename = (clip) => {
    setOpenClipMenuId('');
    setRenameError('');
    setRenamingClipId(clip.id);
    setRenameValue(clip.title || '');
  };

  const cancelRename = () => {
    setRenamingClipId('');
    setRenameValue('');
    setRenameError('');
  };

  const handleRename = async (event, clip) => {
    event.preventDefault();
    if (!currentProject || !onRenameClip) return;
    setRenameError('');
    try {
      await onRenameClip(currentProject.id, clip.id, renameValue);
      cancelRename();
    } catch (err) {
      setRenameError(err.message || String(err));
    }
  };

  useEffect(() => {
    return () => {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  const stopInlineAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
    }
    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = '';
    }
    setPlayingClipId('');
    setLoadedClipId('');
    setLoadingClipId('');
  };

  const handleInlinePlay = async (projectId, clip) => {
    const el = audioRef.current;
    if (!el || loadingClipId) return;

    if (playingClipId === clip.id) {
      el.pause();
      setPlayingClipId('');
      return;
    }

    if (loadedClipId === clip.id && el.src) {
      try {
        await el.play();
        setPlayingClipId(clip.id);
      } catch (err) {
        setPlayingClipId('');
      }
      return;
    }

    setLoadingClipId(clip.id);
    try {
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
        audioUrlRef.current = '';
      }
      const { blob } = await onPlayClip(projectId, clip.id);
      const url = URL.createObjectURL(blob);
      audioUrlRef.current = url;
      el.src = url;
      el.currentTime = 0;
      setLoadedClipId(clip.id);
      await el.play();
      setPlayingClipId(clip.id);
    } catch (err) {
      setPlayingClipId('');
      setLoadedClipId('');
    } finally {
      setLoadingClipId('');
    }
  };

  return (
    <div className="mx-auto flex h-full min-h-0 w-full max-w-[1180px] flex-col">
      <audio
        ref={audioRef}
        preload="none"
        onEnded={() => {
          setPlayingClipId('');
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
          }
        }}
      />

      <div className="mb-5 flex shrink-0 flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-slate-800">Projects</h1>
          <p className="mt-1 text-sm text-slate-500">
            Save generated audio into normal folders on this computer.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={workspaceName && workspacePermission !== 'granted' ? onReconnectWorkspace : onChooseWorkspace}
            disabled={!supported || loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white/75 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-white focus-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <HardDrive size={16} />}
            {workspaceName && workspacePermission !== 'granted'
              ? 'Reconnect folder'
              : workspaceName
                ? 'Change folder'
                : 'Choose folder'}
          </button>
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            disabled={!supported || !workspaceReady || loading}
            className="inline-flex items-center gap-2 rounded-xl bg-moon-gradient px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-8px_rgba(91,141,239,0.75)] focus-ring disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} />
            Create a project
          </button>
        </div>
      </div>

      {status && (
        <div
          className={`mb-5 flex items-start gap-3 rounded-2xl border p-4 ${
            status.tone === 'amber'
              ? 'border-amber-300/70 bg-amber-50 text-amber-700'
              : 'border-slate-200 bg-white/60 text-slate-600'
          }`}
        >
          <StatusIcon size={18} className="mt-0.5 shrink-0" />
          <p className="text-sm">{status.message}</p>
        </div>
      )}

      {(error || createError) && (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-red-300/70 bg-red-50 p-4 text-red-600">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p className="text-sm">{createError || error}</p>
        </div>
      )}

      {isCreating && (
        <form onSubmit={handleCreate} className="glass mb-5 rounded-2xl p-5">
          <label htmlFor="project-name" className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-500">
            Project name
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              id="project-name"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
              placeholder="Podcast intro, client demo, language practice..."
              className={inputClass}
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-moon-gradient px-4 py-2.5 text-sm font-semibold text-white focus-ring disabled:opacity-50"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <FolderPlus size={16} />}
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setProjectName('');
                  setCreateError('');
                }}
                className="rounded-xl border border-slate-200 bg-white/70 px-4 py-2.5 text-sm text-slate-600 hover:bg-white focus-ring"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}

      <div className="grid min-h-0 flex-1 gap-5 overflow-hidden lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)]">
        <section className="glass flex min-h-0 flex-col rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-slate-600">
              Project folders
            </h2>
            {workspaceReady && (
              <button
                type="button"
                onClick={onRefreshProjects}
                disabled={loading}
                title="Refresh projects"
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-ring disabled:opacity-50"
              >
                <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
              </button>
            )}
          </div>

          {projects.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center gap-3 px-4 py-12 text-center">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-slate-100 text-slate-400">
                <FolderOpen size={26} />
              </span>
              <p className="text-base font-medium text-slate-700">No projects yet</p>
              <p className="max-w-sm text-sm text-slate-400">
                Choose a folder, then create a project to start saving generated audio.
              </p>
            </div>
          ) : (
            <ul className="mt-4 flex min-h-0 flex-col gap-2 overflow-y-auto pr-1">
              {projects.map((project) => {
                const selected = project.id === currentProjectId;
                return (
                  <li key={project.id}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!selected) stopInlineAudio();
                        setOpenClipMenuId('');
                        setRenamingClipId('');
                        onSelectProject(project.id);
                      }}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors focus-ring ${
                        selected ? 'bg-[#eaf1ff] text-[#3068d6]' : 'hover:bg-slate-100/70'
                      }`}
                    >
                      <span
                        className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${
                          selected ? 'bg-moon-gradient text-white' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        <FolderOpen size={18} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-slate-800">
                          {project.name}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-400">
                          {project.clips.length} clip{project.clips.length === 1 ? '' : 's'}
                        </span>
                      </span>
                      {selected && (
                        <span className="shrink-0 rounded-full bg-white/75 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#3068d6] shadow-sm ring-1 ring-white/70">
                          Selected
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="glass flex min-h-0 flex-col rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-slate-600">
                Saved clips
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {currentProject ? currentProject.name : 'Select a project to view files.'}
              </p>
            </div>
          </div>

          {renameError && (
            <p className="mt-4 rounded-lg border border-red-300/60 bg-red-50 px-3 py-2 text-xs text-red-600">
              {renameError}
            </p>
          )}

          {!currentProject ? (
            <div className="mt-8 flex flex-col items-center justify-center px-4 py-12 text-center">
              <p className="text-sm text-slate-400">Create or select a project first.</p>
            </div>
          ) : clips.length === 0 ? (
            <div className="mt-8 flex flex-col items-center justify-center gap-2 px-4 py-12 text-center">
              <p className="text-base font-medium text-slate-700">No saved clips</p>
              <p className="max-w-sm text-sm text-slate-400">
                Generate audio in Voice Studio and it will land in this project folder.
              </p>
            </div>
          ) : (
            <ul className="mt-4 flex min-h-0 flex-col gap-2.5 overflow-y-auto pr-1">
              {clips.map((clip) => (
                <li key={clip.id} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white/65 p-3.5">
                  {renamingClipId === clip.id ? (
                    <form onSubmit={(event) => handleRename(event, clip)} className="min-w-0 flex-1">
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
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-slate-800">{clip.title}</p>
                      <p className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {formatTimestamp(clip.createdAt)}
                        </span>
                        <span>{clip.voiceName}</span>
                        <span>{clip.format?.toUpperCase()}</span>
                        {clip.durationSec ? <span>{formatTime(clip.durationSec)}</span> : null}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleInlinePlay(currentProject.id, clip)}
                      disabled={renamingClipId === clip.id}
                      title={playingClipId === clip.id ? 'Pause' : 'Play'}
                      className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-[#eaf1ff] hover:text-[#3068d6] focus-ring disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {loadingClipId === clip.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : playingClipId === clip.id ? (
                        <Pause size={16} fill="currentColor" />
                      ) : (
                        <Play size={16} fill="currentColor" className="ml-0.5" />
                      )}
                    </button>
                    {openClipMenuId === clip.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => startRename(clip)}
                          title="Rename clip"
                          className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-600 transition-colors hover:bg-[#eaf1ff] hover:text-[#3068d6] focus-ring"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (playingClipId === clip.id || loadingClipId === clip.id || loadedClipId === clip.id) {
                              stopInlineAudio();
                            }
                            setOpenClipMenuId('');
                            onDeleteClip(currentProject.id, clip.id);
                          }}
                          title="Delete clip"
                          className="grid h-9 w-9 place-items-center rounded-lg bg-red-50 text-red-500 transition-colors hover:bg-red-100 focus-ring"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setOpenClipMenuId(clip.id)}
                        title="Clip actions"
                        className="grid h-9 w-9 place-items-center rounded-lg bg-slate-100 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-700 focus-ring"
                      >
                        <MoreHorizontal size={17} />
                      </button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
