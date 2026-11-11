import React, { useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  BookOpen,
  LayoutDashboard,
  FolderKanban,
  FileText,
  Settings,
  Activity,
  X,
  PlusCircle,
  LogOut
} from 'lucide-react';
import { useUI } from '../../context/UIContext.jsx';
import { APP_NAME } from '../../utils/constants.js';

export const MobileNavigation = ({ isOpen, onClose, onUploadClick }) => {
  const { selectedDocument } = useUI();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const navItems = [
    { label: 'Overview', to: '/app', icon: LayoutDashboard, end: true },
    { label: 'Document Library', to: '/app/library', icon: FolderKanban },
    {
      label: 'Active Workspace',
      to: selectedDocument ? `/app/documents/${selectedDocument.id}` : '/app/documents/doc-1',
      icon: FileText
    },
    { label: 'Settings', to: '/app/settings', icon: Settings },
    { label: 'System Health', to: '/diagnostics', icon: Activity }
  ];

  return (
    <div className="fixed inset-0 z-50 md:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-navy-950/45 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out drawer */}
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white border-r border-surface-border shadow-editorial z-10">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-surface-border">
          <Link to="/" onClick={onClose} className="flex items-center gap-2.5 text-navy-900">
            <div className="w-8 h-8 rounded bg-navy-900 text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-warm-100" />
            </div>
            <span className="font-serif font-bold text-lg tracking-tight">{APP_NAME}</span>
          </Link>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-navy-500 hover:bg-warm-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Action */}
        <div className="p-4 border-b border-surface-border">
          <button
            type="button"
            onClick={() => {
              onClose();
              onUploadClick();
            }}
            className="w-full flex items-center justify-center gap-2 rounded-md bg-navy-900 text-white font-medium text-xs py-2.5 px-4 shadow-subtle hover:bg-navy-800"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload Document</span>
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-md text-xs font-medium ${
                  isActive
                    ? 'bg-warm-100 text-navy-900 font-semibold border border-warm-200'
                    : 'text-navy-600 hover:bg-warm-50 hover:text-navy-900'
                }`
              }
            >
              <item.icon className="w-4 h-4 text-navy-500 flex-shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User profile footer */}
        <div className="p-4 border-t border-surface-border bg-warm-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-navy-900 text-white flex items-center justify-center text-xs font-semibold">
              JD
            </div>
            <div>
              <p className="text-xs font-semibold text-navy-900">Jane Doe</p>
              <p className="text-[10px] text-navy-400 font-mono">jane@example.com</p>
            </div>
          </div>
          <Link
            to="/login"
            onClick={onClose}
            className="p-1.5 text-navy-400 hover:text-rose-600 rounded"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MobileNavigation;
