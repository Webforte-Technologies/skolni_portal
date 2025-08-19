import React from 'react';
import Toast, { Toast as ToastType } from './Toast';
import { useResponsive } from '../../hooks/useViewport';
import { cn } from '../../utils/cn';

export type { Toast } from './Toast';

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  const { isMobile, isTablet } = useResponsive();

  const getContainerStyles = () => {
    const baseStyles = 'fixed z-50 pointer-events-none';
    
    // Responsive positioning
    if (isMobile) {
      // On mobile, position at top to avoid keyboard interference
      return cn(
        baseStyles,
        'top-4',
        'left-4 right-4',
        'space-y-2'
      );
    } else if (isTablet) {
      // On tablet, position at bottom-right but with more spacing
      return cn(
        baseStyles,
        'bottom-6 right-6 left-6 sm:left-auto sm:w-96',
        'space-y-3'
      );
    } else {
      // Desktop positioning - bottom right
      return cn(
        baseStyles,
        'bottom-4 right-4 w-96',
        'space-y-2'
      );
    }
  };

  const getToastWrapperStyles = () => {
    return 'pointer-events-auto';
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className={getContainerStyles()}>
      {toasts.map((toast, index) => (
        <div 
          key={toast.id} 
          className={getToastWrapperStyles()}
          style={{
            // Stagger animation delays for multiple toasts
            animationDelay: `${index * (isMobile ? 50 : 100)}ms`
          }}
        >
          <Toast toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;
