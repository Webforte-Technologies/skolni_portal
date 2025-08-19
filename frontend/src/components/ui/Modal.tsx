import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../hooks/useViewport';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  fullScreenOnMobile?: boolean;
  swipeToDismiss?: boolean;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  fullScreenOnMobile = true,
  swipeToDismiss = true
}) => {
  const { isMobile, touchDevice } = useResponsive();
  const modalRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const [startY, setStartY] = useState(0);

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

  // Handle swipe to dismiss on touch devices
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!swipeToDismiss || !touchDevice) return;
    
    const touch = e.touches[0];
    setStartY(touch.clientY);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || !swipeToDismiss || !touchDevice) return;
    
    const touch = e.touches[0];
    const currentY = touch.clientY;
    const deltaY = currentY - startY;
    
    // Only allow downward swipes
    if (deltaY > 0) {
      setDragOffset(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging || !swipeToDismiss || !touchDevice) return;
    
    setIsDragging(false);
    
    // If dragged more than 100px down, close the modal
    if (dragOffset > 100) {
      onClose();
    }
    
    setDragOffset(0);
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'sm:max-w-md',
    md: 'sm:max-w-lg',
    lg: 'sm:max-w-2xl',
  };

  // Determine if modal should be full screen
  const shouldBeFullScreen = fullScreenOnMobile && isMobile;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className={cn(
        "flex items-center justify-center min-h-screen text-center",
        shouldBeFullScreen ? "p-0" : "px-4 pt-4 pb-20 sm:block sm:p-0"
      )}>
        {/* Background overlay */}
        <div
          className={cn(
            "fixed inset-0 bg-neutral-900/60 transition-opacity animate-fade-in",
            isDragging && "opacity-50"
          )}
          onClick={onClose}
        />

        {/* Modal panel */}
        <div 
          ref={modalRef}
          className={cn(
            'inline-block align-bottom bg-white dark:bg-neutral-950 text-left overflow-hidden shadow-floating transform transition-all animate-scale-in',
            shouldBeFullScreen 
              ? 'w-full h-full rounded-none' 
              : 'rounded-xl sm:my-8 sm:align-middle sm:w-full w-full max-w-full sm:max-w-none',
            !shouldBeFullScreen && sizeClasses[size],
            isDragging && 'transition-none'
          )}
          style={{
            transform: isDragging ? `translateY(${dragOffset}px)` : undefined,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Header */}
          <div className={cn(
            "bg-white dark:bg-neutral-950",
            shouldBeFullScreen 
              ? "px-4 pt-6 pb-4 border-b border-neutral-200 dark:border-neutral-800" 
              : "px-4 pt-5 pb-4 sm:p-6 sm:pb-4"
          )}>
            <div className="flex items-center justify-between mb-4">
              {/* Swipe indicator for mobile */}
              {shouldBeFullScreen && swipeToDismiss && (
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2">
                  <div className="w-8 h-1 bg-neutral-300 dark:bg-neutral-600 rounded-full" />
                </div>
              )}
              
              <h3 className={cn(
                "font-medium text-neutral-900 dark:text-neutral-100",
                shouldBeFullScreen ? "text-xl" : "text-lg"
              )}>
                {title}
              </h3>
              
              <button
                onClick={onClose}
                className={cn(
                  "rounded-md text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-neutral-900 transition-colors",
                  shouldBeFullScreen ? "p-2" : "p-1",
                  touchDevice && "min-w-[44px] min-h-[44px] flex items-center justify-center"
                )}
                aria-label="Zavřít modal"
              >
                <X className={cn(
                  shouldBeFullScreen ? "h-7 w-7" : "h-6 w-6"
                )} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className={cn(
            "bg-white dark:bg-neutral-950",
            shouldBeFullScreen 
              ? "flex-1 overflow-y-auto px-4 pb-6" 
              : "px-4 pb-4 sm:px-6 sm:pb-6 max-h-[80vh] overflow-y-auto"
          )}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
