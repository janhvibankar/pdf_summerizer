import React from 'react';

/**
 * Editorial-Minimal Tab Component
 */
export const Tabs = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className={`border-b border-surface-border ${className}`} role="tablist">
      <nav className="-mb-px flex space-x-6 overflow-x-auto scrollbar-none" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={() => onChange(tab.id)}
              className={`group inline-flex items-center gap-2 py-3 px-1 border-b-2 text-xs font-medium tracking-tight whitespace-nowrap transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 rounded-t ${
                isActive
                  ? 'border-navy-900 text-navy-900 font-semibold'
                  : 'border-transparent text-navy-500 hover:text-navy-800 hover:border-warm-300'
              }`}
            >
              {Icon && (
                <Icon
                  className={`h-3.5 w-3.5 transition-colors ${
                    isActive ? 'text-accent-600' : 'text-navy-400 group-hover:text-navy-600'
                  }`}
                />
              )}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono font-normal ${
                    isActive
                      ? 'bg-navy-900 text-white'
                      : 'bg-warm-200 text-navy-600 group-hover:bg-warm-300'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Tabs;
