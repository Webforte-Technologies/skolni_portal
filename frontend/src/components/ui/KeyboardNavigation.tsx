import React, { useEffect, useRef } from 'react';
import { useAccessibility } from '../../contexts/AccessibilityContext';

interface KeyboardNavigationProps {
  children: React.ReactNode;
}

const KeyboardNavigation: React.FC<KeyboardNavigationProps> = ({ children }) => {
  const { settings } = useAccessibility();
  const mainContentRef = useRef<HTMLElement>(null);
  const navigationRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!settings.keyboardNavigation) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Skip to main content
      if (event.key === 'Tab' && event.shiftKey && event.altKey) {
        event.preventDefault();
        mainContentRef.current?.focus();
      }

      // Skip to navigation
      if (event.key === 'Tab' && event.altKey) {
        event.preventDefault();
        navigationRef.current?.focus();
      }

      // Escape key to close modals
      if (event.key === 'Escape') {
        const activeModal = document.querySelector('[role="dialog"][aria-modal="true"]');
        if (activeModal) {
          const closeButton = activeModal.querySelector('[aria-label*="close"], [aria-label*="zavřít"]');
          if (closeButton instanceof HTMLElement) {
            closeButton.click();
          }
        }
      }

      // Enter key to activate buttons
      if (event.key === 'Enter' || event.key === ' ') {
        const target = event.target as HTMLElement;
        if (target.tagName === 'BUTTON' || target.getAttribute('role') === 'button') {
          event.preventDefault();
          target.click();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [settings.keyboardNavigation]);

  if (!settings.keyboardNavigation) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Skip Links */}
      <nav aria-label="Přeskočit navigaci">
        <a
          href="#main-content"
          className="skip-link sr-only focus:not-sr-only"
          ref={navigationRef}
          tabIndex={0}
        >
          Přeskočit na hlavní obsah
        </a>
        <a
          href="#navigation"
          className="skip-link sr-only focus:not-sr-only"
          tabIndex={0}
        >
          Přeskočit na navigaci
        </a>
      </nav>

      {/* Main Content */}
      <main
        id="main-content"
        ref={mainContentRef}
        tabIndex={-1}
        className="focus-trap"
        role="main"
        aria-label="Hlavní obsah"
      >
        {children}
      </main>

      {/* Focus Trap for Modals */}
      <div
        id="focus-trap-start"
        tabIndex={0}
        className="sr-only"
        onFocus={() => {
          const modals = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
          if (modals.length > 0) {
            const lastModal = modals[modals.length - 1];
            const focusableElements = lastModal.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length > 0) {
              (focusableElements[focusableElements.length - 1] as HTMLElement).focus();
            }
          }
        }}
      />
      <div
        id="focus-trap-end"
        tabIndex={0}
        className="sr-only"
        onFocus={() => {
          const modals = document.querySelectorAll('[role="dialog"][aria-modal="true"]');
          if (modals.length > 0) {
            const lastModal = modals[modals.length - 1];
            const focusableElements = lastModal.querySelectorAll(
              'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusableElements.length > 0) {
              (focusableElements[0] as HTMLElement).focus();
            }
          }
        }}
      />
    </>
  );
};

export default KeyboardNavigation;
