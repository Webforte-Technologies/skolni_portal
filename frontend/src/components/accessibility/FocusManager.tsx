import React, { useEffect, useRef } from 'react';
import { useFocusManagement } from '../../hooks/useAccessibility';
import { useAccessibilityContext } from './AccessibilityProvider';

interface FocusManagerProps {
  children: React.ReactNode;
  trapFocus?: boolean;
  restoreFocus?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export const FocusManager: React.FC<FocusManagerProps> = ({
  children,
  trapFocus = false,
  restoreFocus = false,
  autoFocus = false,
  className = '',
}) => {
  const { containerRef, storeFocus, restoreFocus: restore } = useFocusManagement({
    trapFocus,
    restoreFocus,
    autoFocus,
  });
  const { isMobile, announce } = useAccessibilityContext();

  useEffect(() => {
    if (trapFocus) {
      storeFocus();
      if (isMobile) {
        announce('Dialog otevřen. Použijte gesta pro navigaci.', 'assertive');
      } else {
        announce('Dialog otevřen. Použijte Tab pro navigaci, Escape pro zavření.', 'assertive');
      }
    }

    return () => {
      if (restoreFocus) {
        restore();
      }
    };
  }, [trapFocus, restoreFocus, storeFocus, restore, isMobile, announce]);

  return (
    <div
      ref={containerRef as React.RefObject<HTMLDivElement>}
      className={className}
      role={trapFocus ? 'dialog' : undefined}
      aria-modal={trapFocus ? 'true' : undefined}
    >
      {children}
    </div>
  );
};

interface FocusableProps {
  children: React.ReactNode;
  onFocus?: () => void;
  onBlur?: () => void;
  className?: string;
  role?: string;
  tabIndex?: number;
}

export const Focusable: React.FC<FocusableProps> = ({
  children,
  onFocus,
  onBlur,
  className = '',
  role,
  tabIndex = 0,
}) => {
  const { keyboardNavigation, isMobile } = useAccessibilityContext();
  const elementRef = useRef<HTMLDivElement>(null);

  const handleFocus = () => {
    onFocus?.();
  };

  const handleBlur = () => {
    onBlur?.();
  };

  const focusClasses = keyboardNavigation
    ? 'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
    : 'focus:outline-none';

  const mobileClasses = isMobile
    ? 'touch-manipulation select-none'
    : '';

  return (
    <div
      ref={elementRef}
      className={`${focusClasses} ${mobileClasses} ${className}`}
      role={role}
      tabIndex={tabIndex}
      onFocus={handleFocus}
      onBlur={handleBlur}
    >
      {children}
    </div>
  );
};