import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import KeyboardNavigation from './components/ui/KeyboardNavigation';
import { ShortcutsProvider } from './contexts/ShortcutsContext';
import { SettingsProvider } from './contexts/SettingsContext';

import PrivateRoute, { RequireRole } from './components/auth/PrivateRoute';
import PublicRoute from './components/auth/PublicRoute';
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegistrationPage = React.lazy(() => import('./pages/auth/RegistrationPage'));
const SchoolRegistrationPage = React.lazy(() => import('./pages/auth/SchoolRegistrationPage'));
const DashboardPage = React.lazy(() => import('./pages/dashboard/DashboardPage'));
const ChatPage = React.lazy(() => import('./pages/chat/ChatPage'));
const MaterialsIndexPage = React.lazy(() => import('./pages/materials/MaterialsIndexPage'));
const MaterialCreatorPage = React.lazy(() => import('./pages/materials/MaterialCreatorPage'));
const MyMaterialsPage = React.lazy(() => import('./pages/materials/MyMaterialsPage'));
const MaterialViewPage = React.lazy(() => import('./pages/materials/MaterialViewPage'));
const AIGeneratorPage = React.lazy(() => import('./pages/ai/GeneratorPage'));
const SharedMaterialsPage = React.lazy(() => import('./pages/materials/SharedMaterialsPage'));
const SchoolAdminPage = React.lazy(() => import('./pages/dashboard/SchoolAdminPage'));
const DeveloperAdminPage = React.lazy(() => import('./pages/dashboard/DeveloperAdminPage'));
const UserProfilePage = React.lazy(() => import('./pages/dashboard/UserProfilePage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
import ErrorBoundary from './components/layout/ErrorBoundary';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <AccessibilityProvider>
                <SettingsProvider>
                  <ShortcutsProvider>
                <Router>
                  <KeyboardNavigation>
                    <div className="relative min-h-screen bg-surface-bg text-surface-text font-sans">
                      {/* Subtle background (reduced effects to minimize bundle and purge unused CSS) */}
                      <div className="pointer-events-none fixed inset-0 -z-10" />
                      <ErrorBoundary>
                        <Suspense fallback={<div className="p-8 text-neutral-600">Načítání…</div>}>
                          <Routes>
                {/* Public routes */}
                <Route path="/" element={
                  <PublicRoute>
                    <LandingPage />
                  </PublicRoute>
                } />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegistrationPage />} />
                <Route path="/register-school" element={<SchoolRegistrationPage />} />
                
                {/* Protected routes */}
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <DashboardPage />
                  </PrivateRoute>
                } />
                <Route path="/chat" element={
                  <PrivateRoute>
                    <ChatPage />
                  </PrivateRoute>
                } />
                
                {/* Materials routes */}
                <Route path="/materials" element={
                  <PrivateRoute>
                    <MaterialsIndexPage />
                  </PrivateRoute>
                } />
                <Route path="/materials/create" element={
                  <PrivateRoute>
                    <MaterialCreatorPage />
                  </PrivateRoute>
                } />
                <Route path="/materials/my-materials" element={
                  <PrivateRoute>
                    <MyMaterialsPage />
                  </PrivateRoute>
                } />
                <Route path="/materials/:id" element={
                  <PrivateRoute>
                    <MaterialViewPage />
                  </PrivateRoute>
                } />
                <Route path="/materials/shared" element={
                  <PrivateRoute>
                    <SharedMaterialsPage />
                  </PrivateRoute>
                } />

                {/* Tools (Math practice & helpers) - moved from chat */}
                <Route path="/tools" element={
                  <PrivateRoute>
                    <Suspense fallback={<div className="p-8 text-neutral-600">Načítání…</div>}>
                      {React.createElement((React.lazy(() => import('./pages/tools/ToolsPage')) as any))}
                    </Suspense>
                  </PrivateRoute>
                } />

                {/* AI Generator */}
                <Route path="/ai-generator" element={
                  <PrivateRoute>
                    <AIGeneratorPage />
                  </PrivateRoute>
                } />
                
                {/* Legacy routes for backward compatibility */}
                <Route path="/shared-materials" element={
                  <PrivateRoute>
                    <SharedMaterialsPage />
                  </PrivateRoute>
                } />
                <Route path="/profile" element={
                  <PrivateRoute>
                    <ProfilePage />
                  </PrivateRoute>
                } />
                <Route path="/school" element={
                  <PrivateRoute>
                    <RequireRole roles={['school_admin']}>
                      <SchoolAdminPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                <Route path="/dev-admin" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <DeveloperAdminPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                <Route path="/me" element={
                  <PrivateRoute>
                    <UserProfilePage />
                  </PrivateRoute>
                } />
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </div>
                  </KeyboardNavigation>
                </Router>
                  </ShortcutsProvider>
                </SettingsProvider>
              </AccessibilityProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
</HelmetProvider>
</QueryClientProvider>
  );
}

export default App; 