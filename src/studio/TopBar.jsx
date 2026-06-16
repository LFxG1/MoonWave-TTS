import { useNavigate } from 'react-router-dom';
import { ChevronLeft, CircleDot } from 'lucide-react';
import Logo from '../components/Logo.jsx';

const TAB_LABELS = {
  tts: 'Text to Speech',
  voices: 'Voice Library',
  documents: 'Documents',
  projects: 'Projects',
  settings: 'Settings',
};

export default function TopBar({ activeTab, onChange, isConfigured }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-4 border-b border-slate-200/70 bg-white/70 px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="rounded-lg focus-ring"
          aria-label="Back to MoonWave home"
        >
          <Logo size="sm" subtitle="Studio" tone="dark" />
        </button>

        <span className="hidden h-6 w-px bg-slate-200 md:block" />

        <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-white/70 px-3 py-1 text-xs text-slate-500 md:flex">
          <CircleDot size={13} className="text-[#5b8def]" />
          Project · Untitled
        </div>
      </div>

      {/* Mobile tab switcher (sidebar is hidden below lg) */}
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

      <div className="flex items-center gap-3">
        <span
          className={`hidden items-center gap-2 rounded-full px-3 py-1 text-xs font-medium sm:flex ${
            isConfigured ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              isConfigured ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-amber-500'
            }`}
          />
          {isConfigured ? 'Live' : 'Offline'}
        </span>

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
