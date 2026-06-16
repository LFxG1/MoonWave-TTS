import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  AudioLines,
  LibraryBig,
  FileText,
  FolderOpen,
  Settings2,
  Sparkles,
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

/**
 * Static, non-interactive snapshot of the Voice Studio shown under the hero
 * description (the "screenshot under the description"). Light frosted glass so
 * it lifts off the dark painting. No handlers — purely visual.
 */
function StudioPreview() {
  const navItems = [
    { label: 'Text to Speech', icon: AudioLines, active: true },
    { label: 'Voice Library', icon: LibraryBig },
    { label: 'Documents', icon: FileText },
    { label: 'Projects', icon: FolderOpen },
    { label: 'Settings', icon: Settings2 },
  ];

  // Deterministic waveform heights (no randomness on render).
  const bars = [28, 46, 62, 40, 72, 54, 84, 60, 38, 70, 50, 80, 44, 66, 34, 76, 52, 64, 30, 58];

  const details = [
    ['Status', 'Idle'],
    ['Characters', '0'],
    ['Duration', '00:00'],
    ['Voice', 'Aria · Neural'],
    ['Format', 'MP3'],
  ];

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-white/60 bg-white/85 text-slate-700 shadow-[0_40px_90px_-30px_rgba(5,12,40,0.75)] backdrop-blur-xl">
      {/* Window top bar */}
      <div className="flex items-center justify-between border-b border-slate-200/70 bg-white/60 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-moon-gradient text-white shadow-sm">
            <svg width="15" height="15" viewBox="0 0 32 32" fill="none" aria-hidden="true">
              <path d="M19 3.5a9 9 0 1 0 7.5 14 7 7 0 1 1-7.5-14Z" fill="#ffffff" />
              <path
                d="M4 23.5c2-2.4 4-2.4 6 0s4 2.4 6 0 4-2.4 6 0 4 2.4 6 0"
                stroke="#ffffff"
                strokeWidth="2.2"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </span>
          <span className="font-display text-sm font-semibold text-slate-800">
            MoonWave <span className="font-normal text-slate-400">Studio</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Idle
        </div>
      </div>

      {/* Body: sidebar · editor · details */}
      <div className="grid grid-cols-[1fr] md:grid-cols-[150px_1fr] lg:grid-cols-[160px_1fr_168px]">
        {/* Sidebar */}
        <nav className="hidden flex-col gap-1 border-r border-slate-200/70 bg-white/40 p-3 md:flex">
          {navItems.map(({ label, icon: Icon, active }) => (
            <div
              key={label}
              className={`flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[12.5px] font-medium ${
                active ? 'bg-[#eaf1ff] text-[#3068d6]' : 'text-slate-500'
              }`}
            >
              <span
                className={`grid h-6 w-6 place-items-center rounded-lg ${
                  active
                    ? 'bg-gradient-to-br from-[#6f9bf0] to-[#9bc0ff] text-white'
                    : 'bg-slate-100 text-slate-400'
                }`}
              >
                <Icon size={13} strokeWidth={2.1} />
              </span>
              {label}
            </div>
          ))}
        </nav>

        {/* Main editor */}
        <div className="p-5">
          <h3 className="font-display text-base font-semibold text-slate-800">Voice Studio</h3>
          <p className="mt-0.5 text-[12px] text-slate-400">
            Type or upload text to generate lifelike speech.
          </p>

          <div className="mt-4 rounded-xl border border-slate-200 bg-white/70 p-3.5">
            <p className="text-[12.5px] leading-relaxed text-slate-400">
              The night is calm, the stars are bright, and the journey ahead is filled with
              endless possibilities…
            </p>
            <div className="mt-3 flex items-end gap-[3px]" aria-hidden="true">
              {bars.map((h, i) => (
                <span
                  key={i}
                  className="w-[3px] rounded-full bg-gradient-to-t from-[#7aa8ff] to-[#9fe0ea]"
                  style={{ height: `${h * 0.42}px` }}
                />
              ))}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2.5">
            <div className="rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-[11.5px] text-slate-500">
              <span className="block text-[10px] uppercase tracking-wide text-slate-400">Voice</span>
              Aria · Female
            </div>
            <div className="rounded-lg border border-slate-200 bg-white/70 px-3 py-2 text-[11.5px] text-slate-500">
              <span className="block text-[10px] uppercase tracking-wide text-slate-400">Language</span>
              English (US)
            </div>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5b8def] to-[#84b3ff] py-2.5 text-[13px] font-semibold text-white shadow-[0_10px_24px_-8px_rgba(91,141,239,0.8)]">
            <Sparkles size={15} />
            Generate Voice
          </div>
        </div>

        {/* Details panel */}
        <aside className="hidden flex-col gap-2.5 border-l border-slate-200/70 bg-white/40 p-4 lg:flex">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Details</p>
          {details.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between text-[11.5px]">
              <span className="text-slate-400">{k}</span>
              <span className="font-medium text-slate-600">{v}</span>
            </div>
          ))}
          <div className="mt-1 rounded-lg bg-[#f3f7ff] px-3 py-2 text-[10.5px] leading-snug text-[#5b7fc4]">
            Clips render locally and stay on your device.
          </div>
        </aside>
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

        {/* App preview — the "screenshot under the description" */}
        <motion.div
          initial={{ opacity: 0, y: 48 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto mt-16 max-w-5xl"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 9, ease: 'easeInOut', repeat: Infinity }}
          >
            <StudioPreview />
          </motion.div>
        </motion.div>
      </main>
    </motion.div>
  );
}
