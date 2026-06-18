import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Logo from '../components/Logo.jsx';

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

function MoonscapeBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <img
        src="/moonwave-hero.png"
        alt=""
        aria-hidden="true"
        className="h-full w-full object-cover object-center"
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(7,13,38,0.55) 0%, rgba(7,13,38,0.18) 30%, rgba(7,13,38,0.05) 52%, rgba(7,13,38,0.45) 100%)',
        }}
      />
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

function StudioPreview() {
  return (
    <motion.div
      variants={rise}
      aria-label="MoonWave Studio interface preview"
      className="overflow-hidden rounded-[1.6rem] border border-white/20 bg-[#04101f]/75 p-2 shadow-[0_42px_100px_-36px_rgba(0,0,0,0.95)] backdrop-blur-md"
    >
      <img
        src="/moonwave-studio-preview.png"
        alt="MoonWave Studio interface preview"
        className="block h-auto w-full rounded-[1.15rem] border border-white/10"
      />
    </motion.div>
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
            Type or paste your words and let the moonlight carry them - natural, expressive
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

        <div className="mx-auto mt-16 max-w-5xl">
          <StudioPreview />
        </div>
      </main>
    </motion.div>
  );
}
