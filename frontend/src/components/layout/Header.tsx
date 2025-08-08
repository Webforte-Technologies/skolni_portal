import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../ui/Button';
import ConfirmModal from '../ui/ConfirmModal';
import { LogOut, User, Sun, Moon, Building2 } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

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
              <h1 className="text-xl font-semibold text-gray-900 dark:text-neutral-100">
                EduAI-Asistent
              </h1>
            </div>

            {/* User info and logout */}
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleTheme}
                className="rounded-md p-2 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <div className="flex items-center space-x-3">
                {user.role === 'school_admin' && (
                  <Link to="/school" className="inline-flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    <Building2 className="h-4 w-4 mr-1" /> Správa školy
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
    </>
  );
};

export default Header; 