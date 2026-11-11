import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Menu,
  Upload,
  User,
  LogOut,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import Button from '../common/Button.jsx';
import StatusPill from '../common/StatusPill.jsx';
import useHealthCheck from '../../hooks/useHealthCheck.js';

export const AppHeader = ({ onMobileMenuClick, onUploadClick }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const { data } = useHealthCheck(false); // background check if loaded
  const isOnline = Boolean(data?.status === 'ok');

  const getBreadcrumbTitle = () => {
    const path = location.pathname;
    if (path === '/app') return 'Workspace Overview';
    if (path.startsWith('/app/library')) return 'Document Library';
    if (path.startsWith('/app/documents')) return 'Document Workspace';
    if (path.startsWith('/app/settings')) return 'Settings & Preferences';
    if (path === '/diagnostics') return 'System Diagnostics';
    return 'PRANPAN';
  };

  return (
    <header className="h-16 bg-white border-b border-surface-border px-4 sm:px-6 flex items-center justify-between z-10 sticky top-0">
      {/* Left: Mobile trigger & Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMobileMenuClick}
          className="md:hidden p-1.5 rounded text-navy-600 hover:bg-warm-100 transition-colors focus:outline-none"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <span className="font-serif font-bold text-sm sm:text-base text-navy-900 tracking-tight">
            {getBreadcrumbTitle()}
          </span>
          <span className="hidden sm:inline-block text-[10px] font-mono uppercase bg-warm-100 border border-warm-200 text-navy-600 px-2 py-0.5 rounded font-semibold tracking-wider">
            Prototype
          </span>
        </div>
      </div>

      {/* Right: Quick actions & User menu */}
      <div className="flex items-center gap-3">
        {/* Upload Button */}
        <Button
          variant="primary"
          size="sm"
          onClick={onUploadClick}
          icon={Upload}
          className="hidden sm:inline-flex"
        >
          Upload PDF
        </Button>

        {/* Backend Connectivity Status */}
        <div className="hidden lg:block">
          <StatusPill
            status={isOnline ? 'success' : 'neutral'}
            label={isOnline ? 'API Ready' : 'API Standby'}
            pulse={isOnline}
          />
        </div>

        {/* User Account Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className="flex items-center gap-2 p-1.5 rounded-md hover:bg-warm-100 text-navy-800 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-600"
            aria-expanded={userMenuOpen}
            aria-label="User account menu"
          >
            <div className="w-7 h-7 rounded-full bg-navy-900 text-white flex items-center justify-center text-xs font-semibold">
              JD
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-navy-400" />
          </button>

          {userMenuOpen && (
            <>
              <div
                className="fixed inset-0 z-20"
                onClick={() => setUserMenuOpen(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 mt-2 w-52 rounded-card bg-white border border-surface-border shadow-editorial py-1 z-30 text-xs">
                <div className="px-3.5 py-2.5 border-b border-surface-border">
                  <p className="font-semibold text-navy-900">Jane Doe</p>
                  <p className="text-[10px] font-mono text-navy-400 truncate">jane@example.com</p>
                </div>
                <Link
                  to="/app/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-navy-700 hover:bg-warm-100 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-navy-400" />
                  <span>Profile & Preferences</span>
                </Link>
                <Link
                  to="/diagnostics"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-navy-700 hover:bg-warm-100 transition-colors"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-navy-400" />
                  <span>System Diagnostics</span>
                </Link>
                <div className="border-t border-surface-border my-1" />
                <Link
                  to="/login"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2 px-3.5 py-2 text-rose-700 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600" />
                  <span>Sign out</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default AppHeader;
