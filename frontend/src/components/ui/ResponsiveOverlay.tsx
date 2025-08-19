import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../hooks/useViewport';

interface ResponsiveOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'center' | 'bottom' | 'top' | 'right' | 'left';
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  swipeToDismiss?: boolean;
  fullScreenOnMobile?: boolean;
  className?: string;
  backdropClassName?: string;
}

const ResponsiveOverlay: React.FC<ResponsiveOverlayProps> = ({
  isOpen,
  onClose,
  children,
  position = 'center',
  size = 'md',
  showCloseButton = true,
  closeOnBackdropClick = true,
  swipeToDismiss = true,
  fullScreenOnMobile = false,
  className,
  backdropClassName,
}) => {
  const { isMobile, isTablet, touchDevice } = useResponsive();
  const overlayRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  // Handle keyboard events
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Handle swipe to dismiss
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!swipeToDismiss || !touchDevice) return;
    
    const touch = e.touches[0];
    setStartPos({ x: touch.clientX, y: touch.clientY });
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !swipeToDismiss || !touchDevice) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPos.x;
    const deltaY = touch.clientY - startPos.y;
    
    // Determine swipe direction based on position
    if (position === 'bottom' && deltaY > 0) {
      setDragOffset({ x: 0, y: deltaY });
    } else if (position === 'top' && deltaY < 0) {
      setDragOffset({ x: 0, y: deltaY });
    } else if (position === 'right' && deltaX > 0) {
      setDragOffset({ x: deltaX, y: 0 });
    } else if (position === 'left' && deltaX < 0) {
      setDragOffset({ x: deltaX, y: 0 });
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || !swipeToDismiss || !touchDevice) return;
    
    setIsDragging(false);
    
    // Determine if swipe threshold is met
    const threshold = 100;
    const shouldClose = 
      (position === 'bottom' && dragOffset.y > threshold) ||
      (position === 'top' && dragOffset.y < -threshold) ||
      (position === 'right' && dragOffset.x > threshold) ||
      (position === 'left' && dragOffset.x < -threshold);
    
    if (shouldClose) {
      onClose();
    }
    
    setDragOffset({ x: 0, y: 0 });
  };

  if (!isOpen) return null;

  // Size classes for different breakpoints
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md sm:max-w-lg',
    lg: 'max-w-lg sm:max-w-xl md:max-w-2xl',
    xl: 'max-w-xl sm:max-w-2xl md:max-w-4xl',
    full: 'max-w-full',
  };

  // Position classes
  const positionClasses = {
    center: 'items-center justify-center',
    bottom: 'items-end justify-center',
    top: 'items-start justify-center',
    right: 'items-center justify-end',
    left: 'items-center justify-start',
  };

  // Panel classes based on position
  const panelClasses = {
    center: 'rounded-xl',
    bottom: 'rounded-t-xl sm:rounded-xl sm:mb-4',
    top: 'rounded-b-xl sm:rounded-xl sm:mt-4',
    right: 'rounded-l-xl sm:rounded-xl sm:mr-4',
    left: 'rounded-r-xl sm:rounded-xl sm:ml-4',
  };

  const shouldBeFullScreen = fullScreenOnMobile && isMobile;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className={cn(
        "flex min-h-screen",
        positionClasses[position],
        shouldBeFullScreen ? "p-0" : "p-4"
      )}>
        {/* Background overlay */}
        <div
          className={cn(
            "fixed inset-0 bg-neutral-900/60 transition-opacity animate-fade-in",
            isDragging && "opacity-50",
            backdropClassName
          )}
          onClick={closeOnBackdropClick ? onClose : undefined}
        />

        {/* Overlay panel */}
        <div
          ref={overlayRef}
          className={cn(
            'relative bg-white dark:bg-neutral-950 shadow-floating transform transition-all animate-scale-in',
            shouldBeFullScreen 
              ? 'w-full h-full rounded-none' 
              : cn(panelClasses[position], sizeClasses[size]),
            isDragging && 'transition-none',
            className
          )}
          style={{
            transform: isDragging 
              ? `translate(${dragOffset.x}px, ${dragOffset.y}px)` 
              : undefined,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Swipe indicator */}
          {swipeToDismiss && touchDevice && (isMobile || isTablet) && (
            <div className={cn(
              "flex justify-center py-2",
              position === 'bottom' && "order-first",
              position === 'top' && "order-last"
            )}>
              <div className="w-8 h-1 bg-neutral-300 dark:bg-neutral-600 rounded-full" />
            </div>
          )}

          {/* Close button */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className={cn(
                "absolute z-10 rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 transition-colors",
                touchDevice ? "p-2 min-w-[44px] min-h-[44px]" : "p-1",
                position === 'center' && "top-4 right-4",
                position === 'bottom' && "top-4 right-4",
                position === 'top' && "bottom-4 right-4",
                position === 'right' && "top-4 left-4",
                position === 'left' && "top-4 right-4"
              )}
              aria-label="Zavřít overlay"
            >
              <X className="h-6 w-6" />
            </button>
          )}

          {/* Content */}
          <div className={cn(
            "overflow-y-auto",
            shouldBeFullScreen ? "h-full" : "max-h-[90vh]",
            showCloseButton && "pr-12"
          )}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveOverlay;