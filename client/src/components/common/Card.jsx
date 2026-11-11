import React from 'react';

/**
 * Editorial-Minimal Surface Card
 */
export const Card = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  bodyClassName = '',
  footer
}) => {
  return (
    <div className={`bg-white border border-surface-border rounded-card shadow-card ${className}`}>
      {(title || subtitle || action) && (
        <div className="px-6 py-4 border-b border-surface-border flex items-start justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-base font-semibold text-navy-900 tracking-tight">{title}</h3>
            )}
            {subtitle && <p className="text-xs text-navy-500 mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="flex-shrink-0">{action}</div>}
        </div>
      )}
      <div className={`p-6 ${bodyClassName}`}>{children}</div>
      {footer && (
        <div className="px-6 py-3 bg-warm-50 border-t border-surface-border rounded-b-card text-xs text-navy-500">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
