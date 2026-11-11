import React from 'react';
import { BookOpen, ShieldCheck } from 'lucide-react';
import { APP_NAME, APP_PHASE } from '../../utils/constants.js';

export const Header = ({ isOnline = false }) => {
  return (
    <header className="border-b border-surface-border bg-white sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-md bg-navy-900 text-white flex items-center justify-center shadow-subtle">
            <BookOpen className="w-5 h-5 text-warm-100" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-semibold text-lg text-navy-900 tracking-tight">
                {APP_NAME}
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest px-2 py-0.5 rounded bg-warm-100 border border-warm-200 text-navy-600 font-semibold">
                Foundation
              </span>
            </div>
            <p className="text-[11px] text-navy-400 font-sans hidden sm:block">
              AI-Powered Document Architecture
            </p>
          </div>
        </div>

        {/* Phase tag and connectivity */}
        <div className="flex items-center gap-4 text-xs">
          <span className="hidden md:inline-flex items-center gap-1.5 text-navy-500 font-mono text-[11px]">
            <ShieldCheck className="w-3.5 h-3.5 text-accent-600" />
            {APP_PHASE}
          </span>
          <div className="h-4 w-px bg-surface-border hidden md:block" />
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-pill text-xs font-medium border ${
              isOnline
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : 'bg-warm-100 text-navy-600 border-surface-border'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-emerald-600 animate-pulse' : 'bg-navy-300'
              }`}
            />
            {isOnline ? 'Backend Connected' : 'Checking Backend'}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
