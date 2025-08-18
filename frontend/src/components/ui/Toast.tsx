import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../hooks/useViewport';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
  actionLabel?: string;
  onAction?: () => void;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const { isMobile, isTablet, touchDevice } = useResponsive();
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Animate in on mount
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  // Truncate message for small screens
  const getTruncatedMessage = (message: string, maxLength: number) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength - 3) + '...';
  };

  const getResponsiveMessage = () => {
    if (isMobile) {
      return getTruncatedMessage(toast.message, 60); // Shorter for mobile
    } else if (isTablet) {
      return getTruncatedMessage(toast.message, 80); // Medium for tablet
    }
    return toast.message; // Full message for desktop
  };

  const getToastStyles = () => {
    const baseStyles = 'border rounded-md shadow-soft transition-all duration-300 ease-out';
    const responsiveStyles = isMobile 
      ? 'p-3 text-xs' // Smaller padding and text on mobile
      : isTablet 
        ? 'p-3.5 text-sm' // Medium padding and text on tablet
        : 'p-4 text-sm'; // Standard padding and text on desktop

    const colorStyles = (() => {
      switch (toast.type) {
        case 'success':
          return 'bg-success-50 border-success-200 text-success-800';
        case 'error':
          return 'bg-danger-50 border-danger-200 text-danger-800';
        case 'warning':
          return 'bg-warning-50 border-warning-200 text-warning-800';
        case 'info':
          return 'bg-info-50 border-info-200 text-info-800';
        default:
          return 'bg-neutral-50 border-neutral-200 text-neutral-800';
      }
    })();

    // Animation classes
    const animationStyles = isRemoving
      ? 'opacity-0 transform translate-y-2 scale-95'
      : isVisible
        ? 'opacity-100 transform translate-y-0 scale-100'
        : 'opacity-0 transform -translate-y-2 scale-95';

    return cn(baseStyles, responsiveStyles, colorStyles, animationStyles);
  };

  const getIconSize = () => {
    return isMobile ? 'h-3.5 w-3.5' : 'h-4 w-4';
  };

  const handleRemove = () => {
    setIsRemoving(true);
    // Delay removal to allow exit animation
    setTimeout(() => {
      onRemove(toast.id);
    }, isMobile ? 200 : 300); // Faster animation on mobile
  };

  const handleAction = () => {
    if (toast.onAction) {
      toast.onAction();
    }
  };

  // Touch-friendly dismiss with swipe gesture on mobile
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!touchDevice) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchDevice) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchDevice || !touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe || isRightSwipe) {
      handleRemove();
    }
  };

  return (
    <div 
      className={getToastStyles()}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className={cn(
        'flex items-center',
        isMobile ? 'space-x-1.5' : 'space-x-2'
      )}>
        {toast.type === 'success' && <CheckCircle2 className={getIconSize()} />}
        {toast.type === 'error' && <AlertCircle className={getIconSize()} />}
        {toast.type === 'warning' && <AlertTriangle className={getIconSize()} />}
        {toast.type === 'info' && <Info className={getIconSize()} />}
        <span className={cn(
          'font-medium flex-1',
          isMobile ? 'text-xs' : 'text-sm'
        )}>
          {getResponsiveMessage()}
        </span>
      </div>
      
      <div className={cn(
        'flex items-center',
        isMobile ? 'ml-2 gap-1' : 'ml-4 gap-2'
      )}>
        {toast.onAction && toast.actionLabel && (
          <button 
            onClick={handleAction}
            className={cn(
              'text-primary-600 hover:underline font-medium',
              touchDevice ? 'active:bg-primary-100 rounded px-1 py-0.5' : '',
              isMobile ? 'text-xs min-h-[32px] px-2' : 'text-sm min-h-[36px] px-2'
            )}
          >
            {isMobile ? getTruncatedMessage(toast.actionLabel, 10) : toast.actionLabel}
          </button>
        )}
        <button 
          onClick={handleRemove}
          className={cn(
            'text-neutral-400 hover:text-neutral-600 transition-colors',
            touchDevice ? 'active:bg-neutral-100 rounded p-1' : '',
            isMobile ? 'min-h-[32px] min-w-[32px] flex items-center justify-center' : 'min-h-[36px] min-w-[36px] flex items-center justify-center'
          )}
          aria-label="Zavřít oznámení"
        >
          <X className={getIconSize()} />
        </button>
      </div>
    </div>
  );
};

export default Toast;
