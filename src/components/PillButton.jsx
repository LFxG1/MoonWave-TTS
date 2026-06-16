import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

/**
 * Pill-shaped gradient call-to-action.
 * Pass `icon={false}` to hide the trailing arrow, or a custom node to replace it.
 */
export default function PillButton({
  children,
  onClick,
  type = 'button',
  icon,
  className = '',
  disabled = false,
}) {
  const trailing =
    icon === false ? null : icon || <ArrowRight size={20} strokeWidth={2.5} />;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.035 }}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      className={`group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full
        bg-brand-gradient px-8 py-4 font-semibold text-ink-950 shadow-glow-lg
        focus-ring disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      {/* moving sheen on hover */}
      <span
        className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r
          from-transparent via-white/40 to-transparent transition-transform duration-700
          group-hover:translate-x-full"
      />
      <span className="relative z-10">{children}</span>
      {trailing && (
        <span className="relative z-10 transition-transform duration-300 group-hover:translate-x-1">
          {trailing}
        </span>
      )}
    </motion.button>
  );
}
