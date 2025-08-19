import React from 'react';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../hooks/useViewport';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  icon?: React.ReactNode;
  mobileLayout?: 'compact' | 'expanded';
  stackOnMobile?: boolean;
  touchActions?: boolean;
  variant?: 'default' | 'interactive' | 'elevated';
}

const Card: React.FC<CardProps> = ({ 
  children, 
  title, 
  icon, 
  className, 
  mobileLayout = 'expanded',
  stackOnMobile = true,
  touchActions = false,
  variant = 'default',
  ...props 
}) => {
  const { isMobile, touchDevice } = useResponsive();
  const isTouchDevice = touchDevice;

  // Base responsive classes
  const baseClasses = cn(
    'bg-white dark:bg-neutral-950 rounded-card border border-neutral-200 dark:border-neutral-800 shadow-soft',
    'transition-all duration-200 ease-in-out',
    
    // Mobile-first responsive spacing
    'w-full', // Full width on mobile by default
    
    // Responsive padding based on screen size
    isMobile ? 'mx-2 sm:mx-0' : '', // Add horizontal margin on mobile for better touch targets
    
    // Variant-specific styles
    {
      'hover:shadow-md focus-within:shadow-md': variant === 'interactive' && !isMobile,
      'hover:shadow-lg hover:-translate-y-0.5 focus-within:shadow-lg focus-within:-translate-y-0.5': variant === 'elevated' && !isMobile,
      'shadow-lg': variant === 'elevated',
    },
    
    // Touch-friendly enhancements
    touchActions && isTouchDevice && [
      'active:scale-[0.98] active:shadow-sm',
      'touch-manipulation', // Optimize for touch
      'select-none', // Prevent text selection on touch
    ],
    
    // Mobile layout adjustments
    isMobile && mobileLayout === 'compact' && 'text-sm',
    
    className
  );

  // Header responsive classes
  const headerClasses = cn(
    'border-b border-neutral-200 dark:border-neutral-800',
    // Responsive padding for header
    isMobile ? 'px-4 py-3' : 'px-6 py-4',
    // Compact layout adjustments
    isMobile && mobileLayout === 'compact' && 'px-3 py-2'
  );

  // Content responsive classes  
  const contentClasses = cn(
    // Responsive padding for content
    isMobile ? 'p-4' : 'p-6',
    // Compact layout adjustments
    isMobile && mobileLayout === 'compact' && 'p-3',
    // Stack content on mobile if specified
    stackOnMobile && isMobile && 'space-y-3'
  );

  // Title responsive classes
  const titleClasses = cn(
    'font-medium text-neutral-900 dark:text-neutral-100',
    // Responsive title sizing
    isMobile && mobileLayout === 'compact' ? 'text-base' : 'text-lg',
    // Ensure proper line height for touch targets
    isTouchDevice && 'leading-relaxed'
  );

  // Icon responsive classes
  const iconClasses = cn(
    'text-neutral-500',
    // Responsive icon sizing
    isMobile && mobileLayout === 'compact' && 'text-sm'
  );

  return (
    <div
      className={baseClasses}
      {...props}
    >
      {(title || icon) && (
        <div className={headerClasses}>
          <div className={cn(
            'flex items-center gap-2',
            // Stack header elements on very small screens if needed
            isMobile && mobileLayout === 'compact' && 'flex-wrap'
          )}>
            {icon && <span className={iconClasses}>{icon}</span>}
            {title && <h3 className={titleClasses}>{title}</h3>}
          </div>
        </div>
      )}
      <div className={contentClasses}>
        {children}
      </div>
    </div>
  );
};

export default Card;
