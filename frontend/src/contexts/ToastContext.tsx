import React, { createContext, useContext, useState, ReactNode, useRef, useEffect, useCallback } from 'react';
import ToastContainer, { Toast } from '../components/ui/ToastContainer';
import { useResponsive } from '../hooks/useViewport';

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { isMobile, isTablet } = useResponsive();
  const timeoutRefs = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Responsive duration settings
  const getResponsiveDuration = (baseDuration?: number) => {
    const defaultDuration = baseDuration || 5000;
    
    if (isMobile) {
      // Shorter duration on mobile for better UX
      return Math.min(defaultDuration, 4000);
    } else if (isTablet) {
      // Slightly shorter on tablet
      return Math.min(defaultDuration, 4500);
    }
    
    return defaultDuration;
  };

  // Maximum number of toasts to show simultaneously
  const getMaxToasts = useCallback(() => {
    if (isMobile) return 2; // Fewer toasts on mobile
    if (isTablet) return 3; // Medium number on tablet
    return 4; // More toasts on desktop
  }, [isMobile, isTablet]);

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID();
    const duration = getResponsiveDuration(toast.duration);
    const newToast: Toast = { ...toast, id };

    setToasts(prev => {
      const maxToasts = getMaxToasts();
      let updatedToasts = [...prev, newToast];
      
      // Remove oldest toasts if we exceed the maximum
      if (updatedToasts.length > maxToasts) {
        const toastsToRemove = updatedToasts.slice(0, updatedToasts.length - maxToasts);
        toastsToRemove.forEach(t => {
          const timeoutId = timeoutRefs.current.get(t.id);
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutRefs.current.delete(t.id);
          }
        });
        updatedToasts = updatedToasts.slice(-maxToasts);
      }
      
      return updatedToasts;
    });

    // Auto-remove toast after responsive duration
    const timeoutId = setTimeout(() => {
      removeToast(id);
    }, duration);
    
    timeoutRefs.current.set(id, timeoutId);
  };

  const removeToast = (id: string) => {
    // Clear timeout if it exists
    const timeoutId = timeoutRefs.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutRefs.current.delete(id);
    }

    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    // Clear all timeouts
    timeoutRefs.current.forEach(timeoutId => clearTimeout(timeoutId));
    timeoutRefs.current.clear();
    
    setToasts([]);
  };

  // Clean up timeouts on unmount
  useEffect(() => {
    const currentTimeouts = timeoutRefs.current;
    return () => {
      currentTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
      currentTimeouts.clear();
    };
  }, []);

  // Adjust existing toasts when viewport changes
  useEffect(() => {
    const maxToasts = getMaxToasts();
    setToasts(prev => {
      if (prev.length > maxToasts) {
        // Remove excess toasts when switching to smaller viewport
        const toastsToRemove = prev.slice(0, prev.length - maxToasts);
        toastsToRemove.forEach(toast => {
          const timeoutId = timeoutRefs.current.get(toast.id);
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutRefs.current.delete(toast.id);
          }
        });
        return prev.slice(-maxToasts);
      }
      return prev;
    });
  }, [getMaxToasts]);

  return (
    <ToastContext.Provider value={{ showToast, removeToast, clearAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}; 