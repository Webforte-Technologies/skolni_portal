import React, { useEffect, useRef } from 'react';
import { useAccessibilityContext } from './AccessibilityProvider';

interface ResponsiveAriaLiveProps {
  message: string;
  priority?: 'polite' | 'assertive';
  clearAfter?: number;
  className?: string;
}

export const ResponsiveAriaLive: React.FC<ResponsiveAriaLiveProps> = ({
  message,
  priority = 'polite',
  clearAfter = 5000,
  className = 'sr-only',
}) => {
  const { isMobile, isScreenReaderActive } = useAccessibilityContext();
  const messageRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (message && messageRef.current) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Set the message
      messageRef.current.textContent = message;

      // Clear the message after specified time
      if (clearAfter > 0) {
        timeoutRef.current = setTimeout(() => {
          if (messageRef.current) {
            messageRef.current.textContent = '';
          }
        }, clearAfter);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [message, clearAfter]);

  // Don't render if screen reader is not active and we're on mobile
  if (isMobile && !isScreenReaderActive && priority === 'polite') {
    return null;
  }

  return (
    <div
      ref={messageRef}
      className={className}
      aria-live={priority}
      aria-atomic="true"
      role="status"
    />
  );
};

interface StatusAnnouncerProps {
  children: React.ReactNode;
}

export const StatusAnnouncer: React.FC<StatusAnnouncerProps> = ({ children }) => {
  return (
    <>
      {children}
      <div className="sr-only" aria-live="polite" aria-atomic="true" />
      <div className="sr-only" aria-live="assertive" aria-atomic="true" />
    </>
  );
};