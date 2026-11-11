import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  BookOpen,
  LayoutDashboard,
  FolderKanban,
  FileText,
  Settings,
  Activity,
  PlusCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useUI } from '../../context/UIContext.jsx';
import { APP_NAME } from '../../utils/constants.js';

export const AppSidebar = ({ onUploadClick }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { selectedDocument } = useUI();

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
    <aside
      className={`hidden md:flex flex-col bg-white border-r border-surface-border transition-all duration-200 z-20 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Brand & Collapse Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-surface-border">
        <Link
          to="/"
          className={`flex items-center gap-2.5 overflow-hidden text-navy-900 group ${
            collapsed ? 'justify-center w-full' : ''
          }`}
          title={APP_NAME}
        >
          <div className="w-8 h-8 rounded bg-navy-900 text-white flex items-center justify-center shadow-subtle group-hover:bg-navy-800 transition-colors flex-shrink-0">
            <BookOpen className="w-4 h-4 text-warm-100" />
          </div>
          {!collapsed && (
            <span className="font-serif font-bold text-lg tracking-tight">{APP_NAME}</span>
          )}
        </Link>
        {!collapsed && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="p-1 rounded text-navy-400 hover:text-navy-700 hover:bg-warm-100 transition-colors focus:outline-none"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Primary Action Button */}
      <div className="p-3">
        <button
          type="button"
          onClick={onUploadClick}
          className={`w-full flex items-center justify-center gap-2 rounded-md bg-navy-900 text-white font-medium text-xs py-2 px-3 shadow-subtle hover:bg-navy-800 active:bg-navy-950 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-600 ${
            collapsed ? 'px-0' : ''
          }`}
          title="Upload new document"
        >
          <PlusCircle className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Upload Document</span>}
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2.5 py-2 space-y-1 overflow-y-auto" aria-label="Sidebar navigation">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-warm-100 text-navy-900 font-semibold border border-warm-200'
                  : 'text-navy-600 hover:bg-warm-50 hover:text-navy-900 border border-transparent'
              } ${collapsed ? 'justify-center px-0' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="w-4 h-4 text-navy-500 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Expand Button if collapsed */}
      {collapsed && (
        <div className="p-3 border-t border-surface-border flex justify-center">
          <button
            type="button"
            onClick={() => setCollapsed(false)}
            className="p-1.5 rounded text-navy-400 hover:text-navy-700 hover:bg-warm-100 transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* User profile footer */}
      <div className="p-3 border-t border-surface-border bg-warm-50/50">
        <div className={`flex items-center gap-3 ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-navy-800 text-white flex items-center justify-center font-medium text-xs flex-shrink-0">
            JD
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-navy-900 truncate">Jane Doe</p>
              <p className="text-[10px] text-navy-400 font-mono truncate">jane@example.com</p>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
