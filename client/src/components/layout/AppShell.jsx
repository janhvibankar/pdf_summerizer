import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar.jsx';
import AppHeader from './AppHeader.jsx';
import MobileNavigation from './MobileNavigation.jsx';
import ToastContainer from '../common/Toast.jsx';
import UploadModal from '../documents/UploadModal.jsx';
import { useUI } from '../../context/UIContext.jsx';

export const AppShell = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setIsUploadModalOpen } = useUI();

  return (
    <div className="min-h-screen flex bg-surface-canvas text-navy-900 overflow-x-hidden">
      {/* Desktop Sidebar */}
      <AppSidebar onUploadClick={() => setIsUploadModalOpen(true)} />

      {/* Mobile Drawer */}
      <MobileNavigation
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onUploadClick={() => setIsUploadModalOpen(true)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0">
        <AppHeader
          onMobileMenuClick={() => setMobileMenuOpen(true)}
          onUploadClick={() => setIsUploadModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Modals & Toast notifications */}
      <UploadModal />
      <ToastContainer />
    </div>
  );
};

export default AppShell;
