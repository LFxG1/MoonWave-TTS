const SIZES = {
  sm: { chip: 'h-7 w-7', svg: 18, text: 'text-base' },
  md: { chip: 'h-9 w-9', svg: 22, text: 'text-lg' },
  lg: { chip: 'h-12 w-12', svg: 30, text: 'text-2xl' },
};

/**
 * Custom MoonWave mark: a crescent moon cradling two rolling waves.
 * Drawn in white so it sits on the periwinkle "moon-gradient" chip.
 */
function MoonWaveMark({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      {/* Crescent moon */}
      <path
        d="M19 3.5a9 9 0 1 0 7.5 14 7 7 0 1 1-7.5-14Z"
        fill="#ffffff"
      />
      {/* Rolling waves beneath the moon */}
      <path
        d="M4 23.5c2-2.4 4-2.4 6 0s4 2.4 6 0 4-2.4 6 0 4 2.4 6 0"
        stroke="#ffffff"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M6 28c1.7-2 3.4-2 5.2 0s3.4 2 5.2 0 3.4-2 5.2 0"
        stroke="#ffffff"
        strokeWidth="1.9"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />
    </svg>
  );
}

export default function Logo({ subtitle, size = 'md', tone = 'light', className = '' }) {
  const dims = SIZES[size] || SIZES.md;
  const wordColor = tone === 'dark' ? 'text-slate-800' : 'text-white';
  const subColor = tone === 'dark' ? 'text-slate-400' : 'text-slate-300';

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span
        className={`grid place-items-center rounded-xl bg-moon-gradient shadow-[0_6px_16px_-4px_rgba(91,141,239,0.7)] ${dims.chip}`}
      >
        <MoonWaveMark size={dims.svg} />
      </span>
      <span className={`font-display font-semibold tracking-tight ${wordColor} ${dims.text}`}>
        MoonWave
        {subtitle && <span className={`ml-1.5 font-normal ${subColor}`}>{subtitle}</span>}
      </span>
    </div>
  );
}
