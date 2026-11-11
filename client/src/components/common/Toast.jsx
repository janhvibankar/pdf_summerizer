import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useUI } from '../../context/UIContext.jsx';

export const ToastContainer = () => {
  const { toasts, removeToast } = useUI();

  if (!toasts || toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />,
    warning: <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" />,
    error: <AlertCircle className="h-4 w-4 text-rose-600 flex-shrink-0" />,
    info: <Info className="h-4 w-4 text-accent-600 flex-shrink-0" />,
    neutral: <Info className="h-4 w-4 text-navy-500 flex-shrink-0" />
  };

  const borders = {
    success: 'border-emerald-200 bg-white',
    warning: 'border-amber-200 bg-white',
    error: 'border-rose-200 bg-white',
    info: 'border-accent-200 bg-white',
    neutral: 'border-surface-border bg-white'
  };

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-md border shadow-card text-xs text-navy-800 transition-all transform translate-y-0 opacity-100 ${
            borders[toast.type] || borders.neutral
          }`}
          role="status"
        >
          {icons[toast.type] || icons.info}
          <div className="flex-1 font-sans">{toast.message}</div>
          <button
            type="button"
            onClick={() => removeToast(toast.id)}
            className="text-navy-400 hover:text-navy-700 p-0.5 rounded transition-colors"
            aria-label="Dismiss notification"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;

