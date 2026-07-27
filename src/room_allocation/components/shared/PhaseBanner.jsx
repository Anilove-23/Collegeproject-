/**
 * PhaseBanner — shows the current allocation phase in a sticky bar.
 *
 * Props:
 *   phase   — e.g. "PHASE 2 ACTIVE"
 *   sub     — e.g. "Soft Lock Enabled"
 *   variant — 'info' | 'warning' | 'critical'
 */
export default function PhaseBanner({ phase, sub, variant = 'info', right }) {
  const variantClasses = {
    info:     'bg-card border-border     border-l-crimson       text-text-primary',
    warning:  'bg-amber-50 border-amber-200 border-l-amber-500  text-amber-900',
    critical: 'bg-crimson  border-crimson                       text-white',
  };

  return (
    <div className={`flex items-center justify-between px-5 py-3.5 rounded border border-l-4 shadow-sm gap-4 ${variantClasses[variant]}`}>
      <div>
        <p className={`text-[13px] font-extrabold tracking-[0.06em] ${variant === 'critical' ? 'text-white' : 'text-text-primary'}`}>
          {phase}
        </p>
        {sub && (
          <p className={`text-[11.5px] mt-0.5 ${variant === 'critical' ? 'text-white/80' : 'text-text-secondary'}`}>
            {sub}
          </p>
        )}
      </div>
      {right && <div className="shrink-0">{right}</div>}
    </div>
  );
}
