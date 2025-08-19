import React from 'react';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../hooks/useViewport';
import Modal from './Modal';
import ResponsiveOverlay from './ResponsiveOverlay';

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  variant?: 'modal' | 'sheet' | 'drawer';
  position?: 'center' | 'bottom' | 'top' | 'right' | 'left';
  size?: 'sm' | 'md' | 'lg';
  showHeader?: boolean;
  swipeToDismiss?: boolean;
  className?: string;
}

const MobileModal: React.FC<MobileModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  variant = 'modal',
  position = 'center',
  size = 'md',
  showHeader = true,
  swipeToDismiss = true,
  className,
}) => {
  const { isMobile, isTablet } = useResponsive();

  // Use different components based on device and variant
  if (variant === 'modal' || (!isMobile && !isTablet)) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title || ''}
        size={size}
        fullScreenOnMobile={true}
        swipeToDismiss={swipeToDismiss}
      >
        {children}
      </Modal>
    );
  }

  // Use overlay for sheet/drawer variants on mobile/tablet
  return (
    <ResponsiveOverlay
      isOpen={isOpen}
      onClose={onClose}
      position={position}
      size={size}
      swipeToDismiss={swipeToDismiss}
      fullScreenOnMobile={false}
      className={className}
    >
      {showHeader && title && (
        <div className="px-4 py-3 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
            {title}
          </h3>
        </div>
      )}
      
      <div className={cn(
        "p-4",
        !showHeader && "pt-6"
      )}>
        {children}
      </div>
    </ResponsiveOverlay>
  );
};

export default MobileModal;