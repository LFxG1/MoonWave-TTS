import { useMemo } from 'react';
import { motion } from 'framer-motion';

function useStars(count, seedKey) {
  return useMemo(() => {
    return Array.from({ length: count }, (_, index) => ({
      id: `${seedKey}-${index}`,
      top: Math.random() * 100,
      left: Math.random() * 100,
      size: Math.random() * 2 + 0.6,
      delay: Math.random() * 5,
      duration: Math.random() * 3.5 + 2.5,
      opacity: Math.random() * 0.5 + 0.3,
    }));
  }, [count, seedKey]);
}

/**
 * Layered, CSS/SVG night-sky background: nebula glow, a floating moon,
 * a twinkling starfield, and distant mountain ridges.
 *
 * variant="hero" -> bold, full presence (landing page)
 * variant="app"  -> dimmed and quieter (studio, so UI panels stay readable)
 */
export default function NightSky({ variant = 'hero', className = '' }) {
  const isHero = variant === 'hero';
  const stars = useStars(isHero ? 120 : 60, variant);

  return (
    <div className={`pointer-events-none fixed inset-0 -z-10 overflow-hidden ${className}`}>
      {/* Base vertical gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950 via-ink-900 to-ink-850" />

      {/* Nebula / aurora color washes */}
      <div
        className="absolute -left-1/4 top-[-15%] h-[60vh] w-[60vh] rounded-full blur-[120px]"
        style={{
          background:
            'radial-gradient(circle, rgba(46,144,250,0.28) 0%, rgba(46,144,250,0) 70%)',
          opacity: isHero ? 1 : 0.5,
        }}
      />
      <div
        className="absolute right-[-10%] top-[10%] h-[55vh] w-[55vh] rounded-full blur-[130px]"
        style={{
          background:
            'radial-gradient(circle, rgba(65,214,238,0.22) 0%, rgba(65,214,238,0) 70%)',
          opacity: isHero ? 1 : 0.45,
        }}
      />
      <div
        className="absolute left-[20%] bottom-[-20%] h-[60vh] w-[70vh] rounded-full blur-[140px]"
        style={{
          background:
            'radial-gradient(circle, rgba(99,102,241,0.18) 0%, rgba(99,102,241,0) 70%)',
          opacity: isHero ? 1 : 0.4,
        }}
      />

      {/* Starfield */}
      <div className="absolute inset-0" style={{ opacity: isHero ? 1 : 0.6 }}>
        {stars.map((star) => (
          <span
            key={star.id}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDelay: `${star.delay}s`,
              animationDuration: `${star.duration}s`,
              boxShadow: '0 0 6px rgba(255,255,255,0.8)',
            }}
          />
        ))}
      </div>

      {/* The moon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.6, ease: 'easeOut' }}
        className={`absolute ${isHero ? 'right-[12%] top-[12%]' : 'right-[6%] top-[-6%]'}`}
      >
        <div className="animate-floaty">
          <div
            className={`relative rounded-full ${isHero ? 'h-28 w-28' : 'h-20 w-20'}`}
            style={{
              background:
                'radial-gradient(circle at 35% 30%, #f8fbff 0%, #cfe1ff 40%, #9bc0ff 70%, #6da4ff 100%)',
              boxShadow:
                '0 0 60px 12px rgba(141,194,255,0.55), inset -10px -8px 24px rgba(40,80,160,0.45)',
              opacity: isHero ? 1 : 0.55,
            }}
          >
            {/* craters */}
            <span className="absolute left-6 top-7 h-3 w-3 rounded-full bg-white/20" />
            <span className="absolute left-12 top-14 h-2 w-2 rounded-full bg-white/15" />
            <span className="absolute left-8 top-16 h-1.5 w-1.5 rounded-full bg-white/10" />
          </div>
        </div>
      </motion.div>

      {/* Mountain ridges (hero only) */}
      {isHero && (
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 420"
          preserveAspectRatio="xMidYMax slice"
          fill="none"
        >
          <path
            d="M0 320 L240 200 L420 290 L640 150 L820 280 L1040 180 L1240 300 L1440 220 L1440 420 L0 420 Z"
            fill="#0a1124"
            opacity="0.9"
          />
          <path
            d="M0 380 L180 280 L380 360 L560 250 L760 360 L980 270 L1180 370 L1440 300 L1440 420 L0 420 Z"
            fill="#070d1d"
          />
          <path
            d="M0 410 L260 350 L520 400 L760 340 L1020 400 L1280 350 L1440 390 L1440 420 L0 420 Z"
            fill="#04070f"
          />
        </svg>
      )}

      {/* Readability overlay (stronger in the app to calm the surface) */}
      <div
        className="absolute inset-0"
        style={{
          background: isHero
            ? 'linear-gradient(to bottom, rgba(4,6,15,0) 40%, rgba(4,6,15,0.55) 100%)'
            : 'linear-gradient(to bottom, rgba(4,6,15,0.55), rgba(4,6,15,0.78))',
        }}
      />
    </div>
  );
}
