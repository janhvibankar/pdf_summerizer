import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { UIProvider } from './context/UIContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';

// Route Guards
import ProtectedRoute from './components/auth/ProtectedRoute.jsx';
import PublicRoute from './components/auth/PublicRoute.jsx';

// Layouts
import AppShell from './components/layout/AppShell.jsx';
import RootLayout from './layouts/RootLayout.jsx';

// Public Pages
import LandingPage from './pages/LandingPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import OverviewPage from './pages/OverviewPage.jsx'; // Phase 0 Diagnostics
import NotFoundPage from './pages/NotFoundPage.jsx';

// Application Pages (Protected Workspace)
import DashboardPage from './pages/DashboardPage.jsx';
import LibraryPage from './pages/LibraryPage.jsx';
import DocumentWorkspacePage from './pages/DocumentWorkspacePage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';

export const App = () => {
  return (
    <AuthProvider>
      <UIProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Landing Route */}
            <Route path="/" element={<LandingPage />} />

            {/* Public Auth Routes (Accessible only to unauthenticated visitors) */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            {/* Phase 0 Telemetry & Diagnostics (Preserved) */}
            <Route path="/diagnostics" element={<RootLayout />}>
              <Route index element={<OverviewPage />} />
            </Route>

            {/* Authenticated & Protected Application Shell */}
            <Route element={<ProtectedRoute />}>
              <Route path="/app" element={<AppShell />}>
                <Route index element={<DashboardPage />} />
                <Route path="library" element={<LibraryPage />} />
                <Route path="documents/:id" element={<DocumentWorkspacePage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>
            </Route>

            {/* 404 Not Found Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </BrowserRouter>
      </UIProvider>
    </AuthProvider>
  );
};

export default App;
