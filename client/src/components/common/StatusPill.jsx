import React from 'react';

/**
 * Editorial Status Pill Indicator
 */
export const StatusPill = ({
  status = 'neutral', // 'success' | 'warning' | 'error' | 'neutral'
  label,
  pulse = false,
  className = ''
}) => {
  const styles = {
    success: {
      bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dot: 'bg-emerald-600'
    },
    warning: {
      bg: 'bg-amber-50 text-amber-800 border-amber-200',
      dot: 'bg-amber-600'
    },
    error: {
      bg: 'bg-rose-50 text-rose-800 border-rose-200',
      dot: 'bg-rose-600'
    },
    neutral: {
      bg: 'bg-warm-100 text-navy-700 border-warm-200',
      dot: 'bg-navy-400'
    }
  };

  const current = styles[status] || styles.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-pill text-xs font-medium border ${current.bg} ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {pulse && (
          <span
            className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${current.dot}`}
          />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${current.dot}`} />
      </span>
      <span>{label}</span>
    </span>
  );
};

export default StatusPill;
