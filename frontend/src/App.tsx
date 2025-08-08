import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ThemeProvider } from './contexts/ThemeContext';

import PrivateRoute from './components/auth/PrivateRoute';
const LoginPage = React.lazy(() => import('./pages/auth/LoginPage'));
const RegistrationPage = React.lazy(() => import('./pages/auth/RegistrationPage'));
const DashboardPage = React.lazy(() => import('./pages/dashboard/DashboardPage'));
const ChatPage = React.lazy(() => import('./pages/chat/ChatPage'));
const MyMaterialsPage = React.lazy(() => import('./pages/materials/MyMaterialsPage'));
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
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <Router>
              <div className="min-h-screen bg-gray-50 dark:bg-neutral-900 font-sans">
                <ErrorBoundary>
                  <Suspense fallback={<div className="p-8 text-neutral-600">Načítání…</div>}>
                    <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegistrationPage />} />
                
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
                <Route path="/materials" element={
                  <PrivateRoute>
                    <MyMaterialsPage />
                  </PrivateRoute>
                } />
                
                {/* Redirect root to dashboard if authenticated, otherwise to login */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Catch all route */}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </div>
            </Router>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App; 