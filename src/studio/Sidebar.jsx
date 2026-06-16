import { AudioLines, LibraryBig, FileText, FolderOpen, Settings2 } from 'lucide-react';

const NAV_ITEMS = [
  { id: 'tts', label: 'Text to Speech', icon: AudioLines },
  { id: 'voices', label: 'Voice Library', icon: LibraryBig },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'settings', label: 'Settings', icon: Settings2 },
];

export default function Sidebar({ activeTab, onChange, isConfigured }) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col justify-between border-r border-slate-200/70 bg-white/55 px-4 py-6 backdrop-blur-xl lg:flex">
      <nav className="flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors focus-ring ${
                active
                  ? 'bg-[#eaf1ff] text-[#3068d6]'
                  : 'text-slate-500 hover:bg-slate-100/70 hover:text-slate-800'
              }`}
            >
              <span
                className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
                  active
                    ? 'bg-moon-gradient text-white shadow-[0_4px_12px_-4px_rgba(91,141,239,0.7)]'
                    : 'bg-slate-100 text-slate-400 group-hover:text-slate-600'
                }`}
              >
                <Icon size={17} strokeWidth={2.1} />
              </span>
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="rounded-xl border border-slate-200 bg-white/70 p-3">
        <p className="text-xs font-medium text-slate-700">Workspace</p>
        <p className="mt-0.5 text-sm text-slate-500">Personal Studio</p>
        <div className="mt-3 flex items-center gap-2 border-t border-slate-200 pt-3">
          <span
            className={`h-2 w-2 rounded-full ${
              isConfigured ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)]' : 'bg-amber-500'
            }`}
          />
          <span className="text-xs text-slate-500">
            Azure Speech · {isConfigured ? 'Connected' : 'Not connected'}
          </span>
        </div>
      </div>
    </aside>
  );
}
