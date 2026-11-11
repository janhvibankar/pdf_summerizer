import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../components/common/Header.jsx';
import useHealthCheck from '../hooks/useHealthCheck.js';

export const RootLayout = () => {
  const { data } = useHealthCheck(true);
  const isOnline = Boolean(data && data.status === 'ok');

  return (
    <div className="min-h-screen flex flex-col bg-surface-canvas text-navy-900">
      <Header isOnline={isOnline} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-surface-border bg-white py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-navy-400">
          <div>
            <span className="font-medium text-navy-600">PRANPAN</span> &mdash; AI-Powered PDF
            Summarizer & Document Assistant
          </div>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span>Phase 0: Architecture</span>
            <span>&bull;</span>
            <span>MERN + Gemini Stack</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default RootLayout;
