import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ShieldCheck } from 'lucide-react';
import Card from '../common/Card.jsx';
import { APP_NAME } from '../../utils/constants.js';

export const AuthLayout = ({ title, subtitle, children, footerLink }) => {
  return (
    <div className="min-h-screen bg-surface-canvas flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 text-navy-900">
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-2.5 text-navy-900 group focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-600 rounded"
        >
          <div className="w-9 h-9 rounded bg-navy-900 text-white flex items-center justify-center shadow-subtle group-hover:bg-navy-800 transition-colors">
            <BookOpen className="w-5 h-5 text-warm-100" />
          </div>
          <span className="font-serif font-bold text-2xl tracking-tight">{APP_NAME}</span>
        </Link>
        <h1 className="mt-4 text-xl font-serif font-bold text-navy-900 tracking-tight sm:text-2xl">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-1 text-xs text-navy-500 font-sans max-w-sm mx-auto">{subtitle}</p>
        )}
      </div>

      {/* Main Form Card */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card className="!p-6 sm:!p-8">
          {/* Phase 1 Notice Banner */}
          <div className="mb-5 p-3 rounded bg-warm-100 border border-warm-200 text-[11px] text-navy-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-accent-600 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-navy-800">Phase 1 Design Preview:</span>
              <p className="text-[11px] text-navy-500 mt-0.5 leading-relaxed">
                Forms validate client-side for UX testing. Full authentication and JWT sessions will
                connect in Phase 2.
              </p>
            </div>
          </div>

          {children}

          {footerLink && (
            <div className="mt-6 pt-5 border-t border-surface-border text-center text-xs text-navy-500">
              {footerLink}
            </div>
          )}
        </Card>

        {/* Footer info */}
        <p className="mt-6 text-center text-[11px] text-navy-400">
          PRANPAN &bull; An intelligent editorial document workspace
        </p>
      </div>
    </div>
  );
};

export default AuthLayout;
