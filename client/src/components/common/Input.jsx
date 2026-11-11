import React from 'react';

/**
 * Editorial-Minimal Input Component
 */
export const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  endAdornment,
  id,
  className = '',
  required = false,
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-navy-800 tracking-tight">
          {label} {required && <span className="text-rose-600">*</span>}
        </label>
      )}

      <div className="relative rounded-md shadow-subtle">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-navy-400">
            <Icon className="h-4 w-4" />
          </div>
        )}

        <input
          id={inputId}
          className={`block w-full rounded-md border bg-white py-2 text-sm text-navy-900 placeholder:text-navy-400 transition-colors duration-150 focus:border-navy-900 focus:outline-none focus:ring-1 focus:ring-navy-900 disabled:cursor-not-allowed disabled:bg-warm-50 disabled:text-navy-400 ${
            Icon ? 'pl-9' : 'pl-3'
          } ${endAdornment ? 'pr-10' : 'pr-3'} ${
            error
              ? 'border-rose-400 focus:border-rose-600 focus:ring-rose-600'
              : 'border-surface-border hover:border-navy-300'
          } ${className}`}
          {...props}
        />

        {endAdornment && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-2.5">{endAdornment}</div>
        )}
      </div>

      {error ? (
        <p className="text-[11px] text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-navy-400">{helperText}</p>
      ) : null}
    </div>
  );
};

export default Input;
