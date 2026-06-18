import { useNavigate } from 'react-router-dom';
import { ChevronLeft, FolderOpen, Plus } from 'lucide-react';
import Logo from '../components/Logo.jsx';

const TAB_LABELS = {
  tts: 'Text to Speech',
  voices: 'Voice Library',
  documents: 'Documents',
  projects: 'Projects',
  settings: 'Settings',
};

export default function TopBar({
  activeTab,
  onChange,
  isConfigured,
  projects = [],
  currentProjectId = '',
  onProjectChange,
}) {
  const navigate = useNavigate();
  const hasProjects = projects.length > 0;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200/70 bg-white/70 px-4 py-3 shadow-[0_20px_60px_-38px_rgba(0,0,0,0.9)] backdrop-blur-xl sm:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="shrink-0 rounded-lg focus-ring"
          aria-label="Back to MoonWave home"
        >
          <Logo size="sm" subtitle="Studio" tone="light" />
        </button>

        <span className="hidden h-6 w-px shrink-0 bg-slate-200 md:block" />

        <div className="hidden min-w-0 items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs text-slate-500 md:flex">
          {hasProjects ? (
            <>
              <FolderOpen size={13} className="shrink-0 text-[#5b8def]" />
              <span className="shrink-0 text-slate-400">Project</span>
              <select
                value={currentProjectId}
                onChange={(event) => onProjectChange?.(event.target.value)}
                className="max-w-48 truncate bg-transparent text-xs font-medium text-slate-700 outline-none"
                aria-label="Current project"
              >
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onChange('projects')}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-[#3068d6] focus-ring"
            >
              <Plus size={13} />
              Create project
            </button>
          )}
        </div>
      </div>

      <select
        value={activeTab}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus-ring lg:hidden"
        aria-label="Switch section"
      >
        {Object.entries(TAB_LABELS).map(([id, label]) => (
          <option key={id} value={id}>
            {label}
          </option>
        ))}
      </select>

      <div className="flex shrink-0 items-center gap-3">
        {isConfigured && (
          <span className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-600 sm:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            Backend ready
          </span>
        )}

        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white/70 px-3 py-1.5 text-sm text-slate-600 transition-colors hover:bg-white hover:text-slate-800 focus-ring"
        >
          <ChevronLeft size={16} />
          <span className="hidden sm:inline">Exit</span>
        </button>
      </div>
    </header>
  );
}
