import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import { LogOut, User, Sun, Moon, Building2, Settings, HelpCircle, Keyboard, Bell, Calculator } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Link } from 'react-router-dom';
// import { useAccessibility } from '../../contexts/AccessibilityContext';
import UserPreferences from '../ui/UserPreferences';
import HelpSystem from '../ui/HelpSystem';
import KeyboardShortcuts from '../ui/KeyboardShortcuts';
import NotificationsDropdown from '../ui/NotificationsDropdown';
import MobileNavigation from './MobileNavigation';
import { useResponsive } from '../../contexts/ResponsiveContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { viewport, state, setMenuOpen } = useResponsive();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [activeShortcuts, setActiveShortcuts] = useState<string[]>([]);

  // Load active shortcuts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('keyboardShortcuts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const active = parsed.filter((s: any) => s.currentKey !== s.defaultKey);
        setActiveShortcuts(active.map((s: any) => s.name));
      } catch (error) {
        console.error('Failed to parse saved shortcuts:', error);
      }
    }
  }, []);

  const refreshActiveShortcuts = () => {
    const saved = localStorage.getItem('keyboardShortcuts');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const active = parsed.filter((s: any) => s.currentKey !== s.defaultKey);
        setActiveShortcuts(active.map((s: any) => s.name));
      } catch (error) {
        console.error('Failed to parse saved shortcuts:', error);
      }
    }
  };

  const handleLogoutClick = useCallback(() => {
    setShowLogoutConfirm(true);
  }, []);

  const handleLogoutConfirm = useCallback(() => {
    logout();
  }, [logout]);

  const handleMobileMenuToggle = useCallback(() => {
    setMenuOpen(!state.menuOpen);
  }, [state.menuOpen, setMenuOpen]);

  const handleMobileMenuClose = useCallback(() => {
    setMenuOpen(false);
  }, [setMenuOpen]);

  const handleShowPreferences = useCallback(() => {
    setShowPreferences(true);
  }, []);

  const handleShowHelp = useCallback(() => {
    setShowHelp(true);
  }, []);

  const handleShowShortcuts = useCallback(() => {
    setShowShortcuts(true);
  }, []);

  const handleShowNotifications = useCallback(() => {
    setShowNotifications(true);
  }, []);

  const handleToggleNotifications = useCallback(() => {
    setShowNotifications(v => !v);
  }, []);

  if (!user) return null;

  return (
    <>
      <header id="navigation" className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur border-b border-gray-200 dark:border-neutral-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex justify-between items-center h-14 sm:h-16 md:h-16">
            {/* Mobile menu button and logo */}
            <div className="flex items-center min-w-0 flex-1 sm:flex-initial">
              {/* Mobile Navigation - show on mobile and tablet */}
              {(viewport.breakpoint === 'mobile' || viewport.breakpoint === 'tablet') && (
                <div className="mr-2 sm:mr-3 flex-shrink-0">
                  <MobileNavigation
                    isOpen={state.menuOpen}
                    onToggle={handleMobileMenuToggle}
                    onClose={handleMobileMenuClose}
                    onShowPreferences={handleShowPreferences}
                    onShowHelp={handleShowHelp}
                    onShowShortcuts={handleShowShortcuts}
                    onShowNotifications={handleShowNotifications}
                    onLogout={handleLogoutClick}
                  />
                </div>
              )}
              
              <Link 
                to="/dashboard" 
                className="hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm flex items-center"
                style={{ minHeight: '44px', minWidth: '44px' }}
              >
                <h1 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 dark:text-neutral-100 cursor-pointer truncate leading-tight">
                  EduAI-Asistent
                </h1>
              </Link>
            </div>

            {/* User info and actions */}
            <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
              {/* Desktop Navigation - hide on mobile and tablet */}
              {viewport.breakpoint === 'desktop' && (
                <div className="flex items-center gap-1 lg:gap-2">
                  <button
                    onClick={handleToggleNotifications}
                    className="relative rounded-md p-2.5 lg:p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
                    aria-label="Notifikace"
                    title="Notifikace"
                    data-testid="notifications-bell"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    <Bell className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleShowShortcuts}
                    className="relative rounded-md p-2.5 lg:p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
                    aria-label="Klávesové zkratky"
                    title={`Klávesové zkratky (Ctrl+/)${activeShortcuts.length > 0 ? ` - ${activeShortcuts.length} vlastní` : ''}`}
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    <Keyboard className="h-4 w-4" />
                    {/* Active indicator - green for default, blue for custom */}
                    <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                      activeShortcuts.length > 0 ? 'bg-blue-500' : 'bg-green-500'
                    }`}></div>
                  </button>
                  <button
                    onClick={handleShowHelp}
                    className="rounded-md p-2.5 lg:p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
                    aria-label="Nápověda"
                    title="Nápověda (F1)"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    <HelpCircle className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleShowPreferences}
                    className="rounded-md p-2.5 lg:p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
                    aria-label="Nastavení"
                    title="Nastavení"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    <Settings className="h-4 w-4" />
                  </button>
                  <Link
                    to="/materials/create"
                    className="hidden lg:inline-flex rounded-md px-3 py-2.5 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors items-center"
                    aria-label="Vytvořit materiál"
                    title="Vytvořit materiál"
                    style={{ minHeight: '44px' }}
                  >
                    Vytvořit materiál
                  </Link>
                  <Link
                    to="/tools"
                    className="hidden xl:inline-flex rounded-md px-3 py-2.5 text-sm font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 items-center gap-2 transition-colors"
                    aria-label="Nástroje a cvičení"
                    title="Nástroje a cvičení"
                    style={{ minHeight: '44px' }}
                  >
                    <Calculator className="h-4 w-4" />
                    Nástroje
                  </Link>
                  <button
                    onClick={toggleTheme}
                    className="rounded-md p-2.5 lg:p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
                    aria-label="Toggle theme"
                    title="Přepnout téma (Ctrl+T)"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  </button>
                  <Link
                    to="/dashboard"
                    className="rounded-md p-2.5 lg:p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors flex items-center justify-center"
                    aria-label="Dashboard"
                    title="Dashboard (Ctrl+D)"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </Link>
                </div>
              )}
              
              {/* Mobile and Tablet elements */}
              {(viewport.breakpoint === 'mobile' || viewport.breakpoint === 'tablet') && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={toggleTheme}
                    className="rounded-md p-2.5 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors active:bg-neutral-200 dark:active:bg-neutral-700 flex items-center justify-center"
                    aria-label="Přepnout téma"
                    title="Přepnout téma"
                    style={{ minWidth: '44px', minHeight: '44px' }}
                  >
                    {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </button>
                </div>
              )}
              
              {/* Desktop user info and logout */}
              {viewport.breakpoint === 'desktop' && (
                <>
                  <div className="hidden lg:flex items-center space-x-3 ml-2">
                    {user.role === 'school_admin' && (
                      <Link 
                        to="/school" 
                        className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-sm px-2 py-2.5"
                        style={{ minHeight: '44px' }}
                      >
                        <Building2 className="h-4 w-4 mr-1" /> Správa školy
                      </Link>
                    )}
                    {user.role === 'platform_admin' && (
                      <Link 
                        to="/dev-admin" 
                        className="inline-flex items-center text-sm text-purple-600 dark:text-purple-400 hover:underline focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-sm px-2 py-2.5"
                        style={{ minHeight: '44px' }}
                      >
                        <Settings className="h-4 w-4 mr-1" /> Dev Admin
                      </Link>
                    )}
                    <div className="flex items-center space-x-2 px-2" style={{ minHeight: '44px' }}>
                      <User className="h-5 w-5 text-gray-400 dark:text-neutral-400" />
                      <span className="text-sm text-gray-700 dark:text-neutral-100 truncate max-w-32">
                        {user.first_name} {user.last_name}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleLogoutClick}
                    className="ml-2 flex items-center space-x-1 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 px-3 py-2.5"
                    style={{ minHeight: '44px' }}
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="hidden lg:inline">Odhlásit se</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogoutConfirm}
        title="Odhlásit se"
        message="Opravdu se chcete odhlásit? Budete přesměrováni na přihlašovací stránku."
        confirmText="Odhlásit se"
        cancelText="Zrušit"
        variant="warning"
      />

      {/* User Preferences Modal */}
      <UserPreferences
        isOpen={showPreferences}
        onClose={() => setShowPreferences(false)}
      />

      {/* Help System Modal */}
      <HelpSystem
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcuts
        isOpen={showShortcuts}
        onClose={() => {
          setShowShortcuts(false);
          refreshActiveShortcuts();
        }}
      />

      {/* Notifications dropdown */}
      {showNotifications && (
        <div className="relative">
          <NotificationsDropdown onClose={() => setShowNotifications(false)} />
        </div>
      )}
    </>
  );
};

export default Header; 