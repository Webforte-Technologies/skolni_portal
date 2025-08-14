import React, { useState, useEffect } from 'react';
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

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
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

  if (!user) return null;

  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const handleLogoutConfirm = () => {
    logout();
  };

  return (
    <>
      <header className="bg-white/90 dark:bg-neutral-900/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur border-b border-gray-200 dark:border-neutral-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and title */}
            <div className="flex items-center">
              <Link to="/dashboard" className="hover:opacity-80 transition-opacity">
                <h1 className="text-xl font-semibold text-gray-900 dark:text-neutral-100 cursor-pointer">
                  EduAI-Asistent
                </h1>
              </Link>
            </div>

            {/* User info and logout */}
            <div className="flex items-center space-x-4">
              {/* Accessibility and Settings Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowNotifications(v => !v)}
                  className="relative rounded-md p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  aria-label="Notifikace"
                  title="Notifikace"
                  data-testid="notifications-bell"
                >
                  <Bell className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowShortcuts(true)}
                  className="relative rounded-md p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  aria-label="Klávesové zkratky"
                  title={`Klávesové zkratky (Ctrl+/)${activeShortcuts.length > 0 ? ` - ${activeShortcuts.length} vlastní` : ''}`}
                >
                  <Keyboard className="h-4 w-4" />
                  {/* Active indicator - green for default, blue for custom */}
                  <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${
                    activeShortcuts.length > 0 ? 'bg-blue-500' : 'bg-green-500'
                  }`}></div>
                </button>
                <button
                  onClick={() => setShowHelp(true)}
                  className="rounded-md p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  aria-label="Nápověda"
                  title="Nápověda (F1)"
                >
                  <HelpCircle className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setShowPreferences(true)}
                  className="rounded-md p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  aria-label="Nastavení"
                  title="Nastavení"
                >
                  <Settings className="h-4 w-4" />
                </button>
                <Link
                  to="/materials/create"
                  className="rounded-md px-3 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700"
                  aria-label="Vytvořit materiál"
                  title="Vytvořit materiál"
                >
                  Vytvořit materiál
                </Link>
                <Link
                  to="/tools"
                  className="rounded-md px-3 py-2 text-sm font-medium border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-100 dark:hover:bg-neutral-800 flex items-center gap-2"
                  aria-label="Nástroje a cvičení"
                  title="Nástroje a cvičení"
                >
                  <Calculator className="h-4 w-4" />
                  Nástroje
                </Link>
                <button
                  onClick={toggleTheme}
                  className="rounded-md p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  aria-label="Toggle theme"
                  title="Přepnout téma (Ctrl+T)"
                >
                  {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </button>
                <Link
                  to="/dashboard"
                  className="rounded-md p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                  aria-label="Dashboard"
                  title="Dashboard (Ctrl+D)"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </Link>
              </div>
              <div className="flex items-center space-x-3">
                {user.role === 'school_admin' && (
                  <Link to="/school" className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    <Building2 className="h-4 w-4 mr-1" /> Správa školy
                  </Link>
                )}
                {user.role === 'platform_admin' && (
                  <Link to="/dev-admin" className="inline-flex items-center text-sm text-purple-600 dark:text-purple-400 hover:underline">
                    <Settings className="h-4 w-4 mr-1" /> Dev Admin
                  </Link>
                )}
                <User className="h-5 w-5 text-gray-400 dark:text-neutral-400" />
                <span className="text-sm text-gray-700 dark:text-neutral-100">
                  {user.first_name} {user.last_name}
                </span>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleLogoutClick}
                className="flex items-center space-x-1"
              >
                <LogOut className="h-4 w-4" />
                <span>Odhlásit se</span>
              </Button>
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