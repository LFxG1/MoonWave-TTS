import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  AudioLines,
  LibraryBig,
  FileText,
  FolderOpen,
  Settings2,
  ChevronLeft,
  CircleDot,
  KeyRound,
  UploadCloud,
  FileAudio,
  Code2,
} from 'lucide-react';
import Logo from '../components/Logo.jsx';

// Soft periwinkle moonlight accent used for the headline + highlights.
const MOONLIGHT = '#A6C3FF';

const container = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.15 },
  },
};

const rise = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } },
};

/**
 * Painterly, full-bleed watercolor backdrop: the generated moon-over-waves
 * artwork plus soft overlays for text contrast and a gentle pulsing moon glow.
 */
function MoonscapeBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <img
        src="/moonwave-hero.png"
        alt=""
        aria-hidden="true"
        className="h-full w-full object-cover object-center"
      />

      {/* Contrast + blend: darken the upper-center for the headline, melt the
          bottom into deep navy so content scrolling past the art stays on-theme. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(7,13,38,0.55) 0%, rgba(7,13,38,0.18) 30%, rgba(7,13,38,0.05) 52%, rgba(7,13,38,0.45) 100%)',
        }}
      />

      {/* Gentle radial glow over the painted moon (upper-left) */}
      <motion.div
        className="absolute left-[6%] top-[4%] h-[34vh] w-[34vh] rounded-full blur-[90px]"
        style={{
          background:
            'radial-gradient(circle, rgba(214,228,255,0.45) 0%, rgba(214,228,255,0) 70%)',
        }}
        animate={{ opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 7, ease: 'easeInOut', repeat: Infinity }}
      />
    </div>
  );
}

const labelClass = 'mb-1 block text-[9px] font-medium uppercase tracking-wider text-slate-500';

/**
 * Static snapshot of the Voice Studio — mirrors the real layout at desktop
 * width (top bar, sidebar, TTS panel, details column). Non-interactive.
 */
function StudioPreview() {
  const navItems = [
    { label: 'Text to Speech', icon: AudioLines, active: true },
    { label: 'Voice Library', icon: LibraryBig },
    { label: 'Documents', icon: FileText },
    { label: 'Projects', icon: FolderOpen },
    { label: 'Settings', icon: Settings2 },
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none overflow-hidden rounded-2xl border border-slate-200/70 bg-[#eef2fc] text-left text-slate-700 shadow-[0_40px_90px_-30px_rgba(5,12,40,0.75)]"
    >
      {/* Top bar — matches TopBar.jsx */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-200/70 bg-white/70 px-4 py-2.5 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Logo size="sm" subtitle="Studio" tone="dark" />
          <span className="hidden h-5 w-px bg-slate-200 sm:block" />
          <div className="hidden items-center gap-1.5 rounded-full border border-slate-200 bg-white/70 px-2.5 py-0.5 text-[10px] text-slate-500 sm:flex">
            <CircleDot size={11} className="text-[#5b8def]" />
            Project · Untitled
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-600">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Offline
          </span>
          <span className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white/70 px-2 py-1 text-[10px] text-slate-600">
            <ChevronLeft size={12} />
            Exit
          </span>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar — matches Sidebar.jsx */}
        <aside className="hidden w-[148px] shrink-0 flex-col justify-between border-r border-slate-200/70 bg-white/55 p-3 backdrop-blur-xl md:flex">
          <nav className="flex flex-col gap-0.5">
            {navItems.map(({ label, icon: Icon, active }) => (
              <div
                key={label}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-[10px] font-medium ${
                  active ? 'bg-[#eaf1ff] text-[#3068d6]' : 'text-slate-500'
                }`}
              >
                <span
                  className={`grid h-6 w-6 place-items-center rounded-md ${
                    active
                      ? 'bg-moon-gradient text-white shadow-[0_4px_12px_-4px_rgba(91,141,239,0.7)]'
                      : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  <Icon size={12} strokeWidth={2.1} />
                </span>
                <span className="truncate">{label}</span>
              </div>
            ))}
          </nav>
          <div className="mt-3 rounded-lg border border-slate-200 bg-white/70 p-2">
            <p className="text-[9px] font-medium text-slate-700">Workspace</p>
            <p className="text-[10px] text-slate-500">Personal Studio</p>
            <div className="mt-2 flex items-center gap-1.5 border-t border-slate-200 pt-2">
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              <span className="text-[9px] text-slate-500">Azure Speech · Not connected</span>
            </div>
          </div>
        </aside>

        {/* Main + details — matches Studio.jsx TTS layout */}
        <div className="flex min-w-0 flex-1 gap-4 p-4">
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-sm font-semibold text-slate-800">Voice Studio</h3>
            <p className="mt-0.5 text-[10px] text-slate-500">
              Type or upload text to generate lifelike speech with Azure AI.
            </p>

            <div className="glass mt-3 rounded-xl p-3">
              <p className={labelClass}>Text Editor</p>
              <div className="rounded-lg border border-slate-200 bg-white/80 p-2.5 text-[10px] leading-relaxed text-slate-400">
                The night is calm, the stars are bright, and the journey ahead is filled with
                endless possibilities…
              </div>
              <p className="mt-1 text-right text-[9px] text-slate-400">0 / 5,000</p>
              <div className="mt-2 flex flex-col items-center gap-1 rounded-lg border border-dashed border-slate-300 bg-white/50 px-3 py-3">
                <UploadCloud size={14} className="text-[#5b8def]" />
                <span className="text-[9px] text-slate-500">Drag &amp; drop a .txt file or click to browse</span>
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <p className={labelClass}>Voice</p>
                <div className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1.5 text-[10px] text-slate-700">
                  Aria · Female
                </div>
              </div>
              <div>
                <p className={labelClass}>Language</p>
                <div className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1.5 text-[10px] text-slate-700">
                  English (US)
                </div>
              </div>
            </div>

            <div className="mt-2">
              <p className={labelClass}>Speaking Style</p>
              <div className="rounded-lg border border-slate-200 bg-white/80 px-2 py-1.5 text-[10px] text-slate-700">
                Default
              </div>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <p className={`${labelClass} mb-0`}>Speed</p>
                  <span className="rounded bg-[#eaf1ff] px-1.5 py-0.5 font-mono text-[9px] font-medium text-[#3068d6]">
                    1.00x
                  </span>
                </div>
                <div className="h-2 rounded-full border border-slate-200/70 bg-[linear-gradient(to_right,#5b8def_0%,#84b3ff_33%,#d7e0f0_33%,#d7e0f0_100%)]" />
              </div>
              <div>
                <div className="mb-1 flex items-center justify-between">
                  <p className={`${labelClass} mb-0`}>Pitch</p>
                  <span className="rounded bg-[#eaf1ff] px-1.5 py-0.5 font-mono text-[9px] font-medium text-[#3068d6]">
                    +0%
                  </span>
                </div>
                <div className="h-2 rounded-full border border-slate-200/70 bg-[linear-gradient(to_right,#5b8def_0%,#84b3ff_50%,#d7e0f0_50%,#d7e0f0_100%)]" />
              </div>
            </div>

            <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-300/70 bg-amber-50 p-2.5">
              <KeyRound size={12} className="mt-0.5 shrink-0 text-amber-500" />
              <p className="text-[9px] leading-snug text-amber-700">
                <span className="font-semibold text-amber-800">Connect Azure Speech to generate audio</span>
                {' — '}
                Add your Speech key and region in Settings.
              </p>
            </div>

            <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 py-2 text-[10px] font-semibold text-amber-700">
              <KeyRound size={12} />
              Add Azure keys to generate
            </div>
          </div>

          {/* Details column — matches DetailsPanel.jsx */}
          <aside className="hidden w-[132px] shrink-0 flex-col gap-2 lg:flex">
            <section className="glass rounded-xl p-2.5">
              <p className="font-display text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                Details
              </p>
              <div className="mt-1.5 space-y-1.5 border-t border-slate-200/70 pt-1.5">
                {[
                  ['Status', 'Idle'],
                  ['Character Count', '0'],
                  ['Duration', '00:00'],
                  ['Language', 'English (US)'],
                  ['Voice Model', 'Aria (Neural)'],
                  ['Output Format', 'MP3'],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-1 text-[9px]">
                    <span className="text-slate-500">{k}</span>
                    <span className="truncate font-medium text-slate-700">{v}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="glass rounded-xl p-2.5">
              <p className="font-display text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                Export Options
              </p>
              <div className="mt-1.5 grid grid-cols-3 gap-1">
                {[
                  { label: 'MP3', icon: FileAudio, active: true },
                  { label: 'WAV', icon: FileAudio },
                  { label: 'SSML', icon: Code2 },
                ].map(({ label, icon: Icon, active }) => (
                  <div
                    key={label}
                    className={`flex flex-col items-center gap-0.5 rounded-md border px-1 py-1.5 text-[8px] font-medium ${
                      active
                        ? 'border-[#5b8def]/50 bg-[#eaf1ff] text-[#3068d6]'
                        : 'border-slate-200 bg-white/60 text-slate-500'
                    }`}
                  >
                    <Icon size={10} />
                    {label}
                  </div>
                ))}
              </div>
            </section>

            <section className="glass rounded-xl p-2.5">
              <p className="font-display text-[9px] font-semibold uppercase tracking-wider text-slate-600">
                Recent Audio
              </p>
              <p className="mt-1.5 text-[9px] text-slate-400">Your generated clips will appear here.</p>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function Landing() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="relative min-h-screen w-full"
    >
      <MoonscapeBackdrop />

      {/* Brand only — no nav, per the brief */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center px-6 py-6 sm:px-10">
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Logo size="md" />
          </motion.div>
        </div>
      </header>

      {/* Hero + preview */}
      <main className="relative z-10 mx-auto max-w-6xl px-6 pb-28 pt-32 text-center sm:pt-36">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mx-auto flex max-w-3xl flex-col items-center"
        >
          <motion.h1
            variants={rise}
            className="font-serif text-5xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl md:text-7xl"
            style={{ textShadow: '0 2px 30px rgba(6,12,34,0.5)' }}
          >
            Transform Text into Speech with{' '}
            <span className="block sm:inline" style={{ color: MOONLIGHT }}>
              Azure AI
            </span>
          </motion.h1>

          <motion.p
            variants={rise}
            className="mt-7 max-w-xl text-lg leading-relaxed text-slate-100/85"
            style={{ textShadow: '0 1px 16px rgba(6,12,34,0.5)' }}
          >
            Type or paste your words and let the moonlight carry them — natural, expressive
            audio in dozens of voices and languages, powered by Microsoft Azure Speech.
          </motion.p>

          <motion.div variants={rise} className="mt-9">
            <motion.button
              type="button"
              onClick={() => navigate('/studio')}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 400, damping: 22 }}
              className="group inline-flex items-center gap-2.5 rounded-full border border-white/70 bg-white/90 px-8 py-4 font-medium text-[#0c1430] shadow-[0_16px_50px_-12px_rgba(150,180,255,0.7)] backdrop-blur-md focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            >
              Open Voice Studio
              <ArrowRight
                size={19}
                strokeWidth={2.4}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </motion.button>
          </motion.div>
        </motion.div>

        {/* App preview — static snapshot of the studio */}
        <div className="mx-auto mt-16 max-w-5xl">
          <StudioPreview />
        </div>
      </main>
    </motion.div>
  );
}
