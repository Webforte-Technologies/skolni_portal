import React, { Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { ResponsiveProvider } from './contexts/ResponsiveContext';
import KeyboardNavigation from './components/ui/KeyboardNavigation';
import { ShortcutsProvider } from './contexts/ShortcutsContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { optimizeCssLoading } from './utils/criticalCss';

import PrivateRoute, { RequireRole } from './components/auth/PrivateRoute';
import PublicRoute from './components/auth/PublicRoute';
const LandingPage = React.lazy(() => import('./pages/LandingPage'));
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegistrationPage = React.lazy(() => import('./pages/auth/RegistrationPage'));
const SchoolRegistrationPage = React.lazy(() => import('./pages/auth/SchoolRegistrationPage'));
const DashboardPage = React.lazy(() => import('./pages/dashboard/DashboardPage'));
const ChatPage = React.lazy(() => import('./pages/chat/ChatPage'));
const MaterialsIndexPage = React.lazy(() => import('./pages/materials/MaterialsIndexPage'));

const MyMaterialsPage = React.lazy(() => import('./pages/materials/MyMaterialsPage'));
const MaterialViewPage = React.lazy(() => import('./pages/materials/MaterialViewPage'));

const SharedMaterialsPage = React.lazy(() => import('./pages/materials/SharedMaterialsPage'));
const SchoolAdminPage = React.lazy(() => import('./pages/dashboard/SchoolAdminPage'));
// Admin pages
const AdminDashboardPage = React.lazy(() => import('./pages/admin/AdminDashboardPage'));
const UserManagementPage = React.lazy(() => import('./pages/admin/UserManagementPage'));
const SchoolsManagementPage = React.lazy(() => import('./pages/admin/SchoolsManagementPage'));
const RolesPermissionsPage = React.lazy(() => import('./pages/admin/RolesPermissionsPage'));
const CreditsManagementPage = React.lazy(() => import('./pages/admin/CreditsManagementPage'));
const SystemHealthPage = React.lazy(() => import('./pages/admin/SystemHealthPage'));
const ContentManagementPage = React.lazy(() => import('./pages/admin/ContentManagementPage'));
const DeveloperToolsPage = React.lazy(() => import('./pages/admin/DeveloperToolsPage'));

// New admin pages
const AnalyticsPage = React.lazy(() => import('./pages/admin/AnalyticsPage'));
const NotificationsPage = React.lazy(() => import('./pages/admin/NotificationsPage'));
const TeachersPage = React.lazy(() => import('./pages/admin/TeachersPage'));
const SubscriptionsPage = React.lazy(() => import('./pages/admin/SubscriptionsPage'));
const RevenuePage = React.lazy(() => import('./pages/admin/RevenuePage'));
const BillingPage = React.lazy(() => import('./pages/admin/BillingPage'));
const SystemPerformancePage = React.lazy(() => import('./pages/admin/SystemPerformancePage'));
const SystemConfigPage = React.lazy(() => import('./pages/admin/SystemConfigPage'));
const SystemMonitoringPage = React.lazy(() => import('./pages/admin/SystemMonitoringPage'));
const ContentModerationPage = React.lazy(() => import('./pages/admin/ContentModerationPage'));
const ContentCategoriesPage = React.lazy(() => import('./pages/admin/ContentCategoriesPage'));
const ContentAnalyticsPage = React.lazy(() => import('./pages/admin/ContentAnalyticsPage'));
const SecuritySettingsPage = React.lazy(() => import('./pages/admin/SecuritySettingsPage'));
const SecurityAuditPage = React.lazy(() => import('./pages/admin/SecurityAuditPage'));
const SecurityBannedPage = React.lazy(() => import('./pages/admin/SecurityBannedPage'));
const SecurityAnalyticsPage = React.lazy(() => import('./pages/admin/SecurityAnalyticsPage'));
const ApiManagementPage = React.lazy(() => import('./pages/admin/ApiManagementPage'));
const TestingToolsPage = React.lazy(() => import('./pages/admin/TestingToolsPage'));
const DocumentationPage = React.lazy(() => import('./pages/admin/DocumentationPage'));
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
  // Initialize CSS optimizations on app start
  useEffect(() => {
    optimizeCssLoading({
      inlineThreshold: 14000,
      mobileFirst: true,
      preloadFonts: true,
      deferNonCritical: true,
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              <AccessibilityProvider>
                <ResponsiveProvider>
                  <SettingsProvider>
                    <ShortcutsProvider>
                <Router>
                  <KeyboardNavigation>
                    <div className="relative min-h-screen bg-surface-bg text-surface-text font-sans">
                      {/* Skip Links for accessibility */}
                      <Suspense fallback={null}>
                        {React.createElement(React.lazy(() => import('./components/accessibility/SkipLinks')))}
                      </Suspense>
                      
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
                    <Suspense fallback={<div className="p-8 text-neutral-600">Načítání…</div>}>
                      {React.createElement(React.lazy(() => import('./pages/ai/SimplifiedGeneratorPage')))}
                    </Suspense>
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

                {/* AI Generator - Simplified Material Creation */}
                <Route path="/ai-generator" element={
                  <PrivateRoute>
                    <Suspense fallback={<div className="p-8 text-neutral-600">Načítání…</div>}>
                      {React.createElement(React.lazy(() => import('./pages/ai/SimplifiedGeneratorPage')))}
                    </Suspense>
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
                {/* Admin routes */}
                <Route path="/admin" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <AdminDashboardPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                
                {/* Dashboard section */}
                <Route path="/admin/analytics" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <AnalyticsPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                <Route path="/admin/notifications" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <NotificationsPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                
                {/* User Management section */}
                <Route path="/admin/users" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <UserManagementPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                <Route path="/admin/schools" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <SchoolsManagementPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                <Route path="/admin/teachers" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <TeachersPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                <Route path="/admin/roles" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <RolesPermissionsPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                
                {/* Business & Finance section */}
                <Route path="/admin/credits" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <CreditsManagementPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                <Route path="/admin/subscriptions" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <SubscriptionsPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                <Route path="/admin/revenue" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <RevenuePage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                <Route path="/admin/billing" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <BillingPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                
                {/* System Administration section */}
                <Route path="/admin/system" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <SystemHealthPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                <Route path="/admin/system/performance" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <SystemPerformancePage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                <Route path="/admin/system/config" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <SystemConfigPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                <Route path="/admin/system/monitoring" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <SystemMonitoringPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                
                {/* Content Management section */}
                <Route path="/admin/content" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <ContentManagementPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                <Route path="/admin/content/moderation" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <ContentModerationPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                <Route path="/admin/content/categories" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <ContentCategoriesPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                <Route path="/admin/content/analytics" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <ContentAnalyticsPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                
                {/* Security & Compliance section */}
                <Route path="/admin/security/settings" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <SecuritySettingsPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                <Route path="/admin/security/audit" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <SecurityAuditPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                <Route path="/admin/security/banned" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <SecurityBannedPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                <Route path="/admin/security/analytics" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <SecurityAnalyticsPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                
                {/* Developer Tools section */}
                <Route path="/admin/dev" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <DeveloperToolsPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                <Route path="/admin/dev/api" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <ApiManagementPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                <Route path="/admin/dev/testing" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <TestingToolsPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                <Route path="/admin/dev/docs" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <DocumentationPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                
                {/* Legacy admin route for backward compatibility */}
                <Route path="/dev-admin" element={
                  <PrivateRoute>
                    <RequireRole roles={['platform_admin']}>
                      <AdminDashboardPage />
                    </RequireRole>
                  </PrivateRoute>
                } />
                <Route path="/me" element={
                  <PrivateRoute>
                    <UserProfilePage />
                  </PrivateRoute>
                } />
                
                {/* Development/Test routes */}
                {import.meta.env.DEV && (
                  <>
                    <Route path="/test/responsive-math" element={
                      <PrivateRoute>
                        <Suspense fallback={<div className="p-8 text-neutral-600">Načítání…</div>}>
                          {React.createElement((React.lazy(() => import('./components/math/ResponsiveMathTest')) as any))}
                        </Suspense>
                      </PrivateRoute>
                    } />
                    <Route path="/test/responsive-data" element={
                      <PrivateRoute>
                        <Suspense fallback={<div className="p-8 text-neutral-600">Načítání…</div>}>
                          {React.createElement((React.lazy(() => import('./pages/demo/ResponsiveDataDemo')) as any))}
                        </Suspense>
                      </PrivateRoute>
                    } />
                    <Route path="/test/accessibility" element={
                      <PrivateRoute>
                        <Suspense fallback={<div className="p-8 text-neutral-600">Načítání…</div>}>
                          {React.createElement(React.lazy(() => import('./components/accessibility/AccessibilityShowcase')))}
                        </Suspense>
                      </PrivateRoute>
                    } />
                    <Route path="/test/css-optimization" element={
                      <PrivateRoute>
                        <Suspense fallback={<div className="p-8 text-neutral-600">Načítání…</div>}>
                          {React.createElement(React.lazy(() => import('./components/optimization/ResponsiveCssShowcase')))}
                        </Suspense>
                      </PrivateRoute>
                    } />
                  </>
                )}
                
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
                </ResponsiveProvider>
              </AccessibilityProvider>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
</HelmetProvider>
</QueryClientProvider>
  );
}

export default App; 