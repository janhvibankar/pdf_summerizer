import React from 'react';
import { FileQuestion } from 'lucide-react';
import Button from './Button.jsx';

export const EmptyState = ({
  icon: Icon = FileQuestion,
  title = 'No records found',
  description = 'There are no items matching your criteria at this moment.',
  actionLabel,
  onAction,
  actionIcon,
  className = ''
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-card border border-dashed border-surface-border bg-white ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-warm-100 border border-warm-200 text-navy-600 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-navy-700" />
      </div>
      <h3 className="text-sm font-semibold text-navy-900 tracking-tight font-serif sm:text-base">
        {title}
      </h3>
      <p className="text-xs text-navy-500 mt-1 max-w-sm font-sans leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <div className="mt-5">
          <Button variant="primary" size="sm" onClick={onAction} icon={actionIcon}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
