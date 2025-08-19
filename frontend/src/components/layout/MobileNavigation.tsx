import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  X, 
  Home, 
  Calculator, 
  FileText, 
  Settings, 
  HelpCircle, 
  LogOut,
  User,
  Building2,
  Bell,
  Keyboard
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useResponsive } from '../../contexts/ResponsiveContext';

interface MobileNavigationProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  onShowPreferences: () => void;
  onShowHelp: () => void;
  onShowShortcuts: () => void;
  onShowNotifications: () => void;
  onLogout: () => void;
}

const MobileNavigation: React.FC<MobileNavigationProps> = ({
  isOpen,
  onToggle,
  onClose,
  onShowPreferences,
  onShowHelp,
  onShowShortcuts,
  onShowNotifications,
  onLogout,
}) => {
  const { user } = useAuth();
  const { viewport } = useResponsive();
  const location = useLocation();
  const drawerRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  // Close menu when route changes
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isOpen &&
        drawerRef.current &&
        !drawerRef.current.contains(event.target as Node) &&
        backdropRef.current &&
        backdropRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when menu is open
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Handle swipe gestures for closing
  useEffect(() => {
    if (!viewport.touchDevice || !isOpen) return;

    let startX = 0;
    let currentX = 0;
    let isDragging = false;

    const handleTouchStart = (event: TouchEvent) => {
      if (drawerRef.current?.contains(event.target as Node)) {
        startX = event.touches[0].clientX;
        isDragging = true;
      }
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (!isDragging) return;
      currentX = event.touches[0].clientX;
      const deltaX = currentX - startX;

      // Only allow swiping left (negative delta) to close
      if (deltaX < 0 && drawerRef.current) {
        const translateX = Math.max(deltaX, -280); // Max drawer width
        drawerRef.current.style.transform = `translateX(${translateX}px)`;
      }
    };

    const handleTouchEnd = () => {
      if (!isDragging) return;
      isDragging = false;

      const deltaX = currentX - startX;
      const threshold = -50; // Swipe threshold

      if (deltaX < threshold) {
        onClose();
      } else if (drawerRef.current) {
        // Snap back to original position
        drawerRef.current.style.transform = 'translateX(0)';
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [viewport.touchDevice, isOpen, onClose]);

  if (!user) return null;

  const navigationItems = [
    {
      label: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      testId: 'nav-dashboard',
    },
    {
      label: 'Nástroje a cvičení',
      href: '/tools',
      icon: Calculator,
      testId: 'nav-tools',
    },
    {
      label: 'Vytvořit materiál',
      href: '/materials/create',
      icon: FileText,
      testId: 'nav-create-material',
    },
    {
      label: 'Moje materiály',
      href: '/materials/my-materials',
      icon: FileText,
      testId: 'nav-my-materials',
    },
  ];

  const actionItems = [
    {
      label: 'Notifikace',
      onClick: () => {
        onShowNotifications();
        onClose();
      },
      icon: Bell,
      testId: 'nav-notifications',
    },
    {
      label: 'Klávesové zkratky',
      onClick: () => {
        onShowShortcuts();
        onClose();
      },
      icon: Keyboard,
      testId: 'nav-shortcuts',
    },
    {
      label: 'Nápověda',
      onClick: () => {
        onShowHelp();
        onClose();
      },
      icon: HelpCircle,
      testId: 'nav-help',
    },
    {
      label: 'Nastavení',
      onClick: () => {
        onShowPreferences();
        onClose();
      },
      icon: Settings,
      testId: 'nav-settings',
    },
  ];

  return (
    <>
      {/* Hamburger Menu Button */}
      <button
        onClick={onToggle}
        className="inline-flex items-center justify-center p-2 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-label={isOpen ? 'Zavřít menu' : 'Otevřít menu'}
        data-testid="mobile-menu-button"
        style={{ minWidth: '44px', minHeight: '44px' }} // Touch-friendly size
      >
        <span className="sr-only">{isOpen ? 'Zavřít menu' : 'Otevřít menu'}</span>
        {/* Hamburger icon with animation */}
        <div className="w-6 h-6 relative">
          <span
            className={`absolute block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out ${
              isOpen ? 'rotate-45 translate-y-2' : 'translate-y-0'
            }`}
          />
          <span
            className={`absolute block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out translate-y-2 ${
              isOpen ? 'opacity-0' : 'opacity-100'
            }`}
          />
          <span
            className={`absolute block h-0.5 w-6 bg-current transform transition duration-300 ease-in-out translate-y-4 ${
              isOpen ? '-rotate-45 -translate-y-2' : 'translate-y-0'
            }`}
          />
        </div>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          ref={backdropRef}
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Slide-out Drawer */}
      <div
        ref={drawerRef}
        id="mobile-menu"
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white dark:bg-neutral-900 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-menu-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700">
          <h2 id="mobile-menu-title" className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Menu
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-md text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Zavřít menu"
            data-testid="mobile-menu-close"
            style={{ minWidth: '44px', minHeight: '44px' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                {user.first_name} {user.last_name}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                {user.email}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center px-3 py-3 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                  }`}
                  data-testid={item.testId}
                  style={{ minHeight: '44px' }}
                >
                  <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Admin Links */}
          {(user.role === 'school_admin' || user.role === 'platform_admin') && (
            <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
              <div className="space-y-1">
                {user.role === 'school_admin' && (
                  <Link
                    to="/school"
                    className="flex items-center px-3 py-3 rounded-md text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    data-testid="nav-school-admin"
                    style={{ minHeight: '44px' }}
                  >
                    <Building2 className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="truncate">Správa školy</span>
                  </Link>
                )}
                {user.role === 'platform_admin' && (
                  <Link
                    to="/dev-admin"
                    className="flex items-center px-3 py-3 rounded-md text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    data-testid="nav-dev-admin"
                    style={{ minHeight: '44px' }}
                  >
                    <Settings className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="truncate">Dev Admin</span>
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Action Items */}
          <div className="pt-4 border-t border-neutral-200 dark:border-neutral-700">
            <div className="space-y-1">
              {actionItems.map((item) => {
                const Icon = item.icon;
                
                return (
                  <button
                    key={item.label}
                    onClick={item.onClick}
                    className="w-full flex items-center px-3 py-3 rounded-md text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors text-left"
                    data-testid={item.testId}
                    style={{ minHeight: '44px' }}
                  >
                    <Icon className="w-5 h-5 mr-3 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Footer with Logout */}
        <div className="p-4 border-t border-neutral-200 dark:border-neutral-700">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full flex items-center px-3 py-3 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            data-testid="nav-logout"
            style={{ minHeight: '44px' }}
          >
            <LogOut className="w-5 h-5 mr-3 flex-shrink-0" />
            <span className="truncate">Odhlásit se</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MobileNavigation;