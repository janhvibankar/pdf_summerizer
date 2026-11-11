import React from 'react';

/**
 * Editorial-Minimal Textarea Component
 */
export const Textarea = ({
  label,
  error,
  helperText,
  id,
  className = '',
  rows = 4,
  required = false,
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="block text-xs font-medium text-navy-800 tracking-tight"
        >
          {label} {required && <span className="text-rose-600">*</span>}
        </label>
      )}

      <textarea
        id={textareaId}
        rows={rows}
        className={`block w-full rounded-md border bg-white px-3 py-2 text-sm text-navy-900 placeholder:text-navy-400 shadow-subtle transition-colors duration-150 focus:border-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900 disabled:cursor-not-allowed disabled:bg-warm-50 ${
          error
            ? 'border-rose-400 focus:border-rose-600 focus:ring-rose-600'
            : 'border-surface-border hover:border-navy-300'
        } ${className}`}
        {...props}
      />

      {error ? (
        <p className="text-[11px] text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-navy-400">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Textarea;

