import React from 'react';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../hooks/useViewport';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  fullWidth?: boolean;
  touchOptimized?: boolean;
  responsive?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  fullWidth,
  isLoading = false,
  disabled,
  touchOptimized = false,
  responsive = true,
  style,
  ...rest
}) => {
  const { isMobile, touchDevice } = useResponsive();
  
  // Auto-enable touch optimization on touch devices when responsive is true
  const shouldOptimizeForTouch = touchOptimized || (responsive && touchDevice);
  
  // Base classes with enhanced focus states for accessibility
  const baseClasses = cn(
    'inline-flex items-center justify-center font-medium rounded-md',
    'transition-all duration-200 ease-in-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
    'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
    'dark:focus:ring-offset-neutral-900 dark:focus-visible:ring-offset-neutral-900',
    'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
    // Touch optimization classes
    shouldOptimizeForTouch && [
      'touch-manipulation select-none',
      'active:scale-[0.98] active:transition-transform active:duration-75',
      // Enhanced touch feedback
      'transform-gpu will-change-transform',
    ]
  );
  
  const variantClasses: Record<string, string> = {
    primary: cn(
      'bg-primary-600 text-white shadow-sm',
      'hover:bg-primary-700 hover:shadow-md',
      'active:bg-primary-800 active:shadow-sm',
      shouldOptimizeForTouch && 'active:bg-primary-800'
    ),
    secondary: cn(
      'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 shadow-sm',
      'hover:bg-neutral-200 dark:hover:bg-neutral-700 hover:shadow-md',
      'active:bg-neutral-300 dark:active:bg-neutral-600 active:shadow-sm',
      shouldOptimizeForTouch && 'active:bg-neutral-300 dark:active:bg-neutral-600'
    ),
    outline: cn(
      'border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900',
      'text-neutral-700 dark:text-neutral-100',
      'hover:bg-neutral-50 dark:hover:bg-neutral-800 hover:border-neutral-400 dark:hover:border-neutral-600',
      'active:bg-neutral-100 dark:active:bg-neutral-700',
      shouldOptimizeForTouch && 'active:bg-neutral-100 dark:active:bg-neutral-700'
    ),
    ghost: cn(
      'text-neutral-700 dark:text-neutral-200',
      'hover:bg-neutral-100 dark:hover:bg-neutral-800',
      'active:bg-neutral-200 dark:active:bg-neutral-700',
      shouldOptimizeForTouch && 'active:bg-neutral-200 dark:active:bg-neutral-700'
    ),
    danger: cn(
      'bg-danger-600 text-white shadow-sm',
      'hover:bg-danger-700 hover:shadow-md',
      'active:bg-danger-800 active:shadow-sm',
      shouldOptimizeForTouch && 'active:bg-danger-800'
    ),
    subtle: cn(
      'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300',
      'hover:bg-primary-100 dark:hover:bg-primary-900/30',
      'active:bg-primary-200 dark:active:bg-primary-900/40',
      shouldOptimizeForTouch && 'active:bg-primary-200 dark:active:bg-primary-900/40'
    ),
  };
  
  // Responsive size classes with mobile-first approach
  const getSizeClasses = (size: string) => {
    if (!responsive) {
      // Non-responsive mode - use original logic
      const nonResponsiveSizes = {
        sm: shouldOptimizeForTouch ? 'px-4 py-3 text-sm min-h-[44px]' : 'px-3 py-1.5 text-sm h-8',
        md: shouldOptimizeForTouch ? 'px-5 py-3 text-sm min-h-[44px]' : 'px-4 py-2 text-sm h-9',
        lg: shouldOptimizeForTouch ? 'px-6 py-4 text-base min-h-[48px]' : 'px-6 py-3 text-base h-11',
        icon: shouldOptimizeForTouch ? 'h-11 w-11 p-0 min-h-[44px] min-w-[44px]' : 'h-9 w-9 p-0',
      };
      return nonResponsiveSizes[size as keyof typeof nonResponsiveSizes];
    }

    // Responsive mode - mobile-first with proper Tailwind classes
    const responsiveSizes = {
      sm: cn(
        // Mobile first (default) - always touch-friendly on mobile
        'px-4 py-3 text-sm min-h-[44px]',
        // Tablet and up - slightly larger
        'md:px-4 md:py-2 md:h-9',
        // Desktop and up - compact
        'lg:px-3 lg:py-1.5 lg:h-8',
        // Override for touch devices
        shouldOptimizeForTouch && 'md:px-4 md:py-3 md:min-h-[44px] lg:px-4 lg:py-3 lg:min-h-[44px]'
      ),
      md: cn(
        // Mobile first (default) - touch-friendly
        'px-5 py-3 text-sm min-h-[44px]',
        // Tablet and up
        'md:px-5 md:py-2.5 md:h-10',
        // Desktop and up
        'lg:px-4 lg:py-2 lg:h-9',
        // Override for touch devices
        shouldOptimizeForTouch && 'md:px-5 md:py-3 md:min-h-[44px] lg:px-5 lg:py-3 lg:min-h-[44px]'
      ),
      lg: cn(
        // Mobile first (default) - touch-friendly
        'px-6 py-4 text-base min-h-[48px]',
        // Tablet and up
        'md:px-6 md:py-3.5 md:h-12',
        // Desktop and up
        'lg:px-6 lg:py-3 lg:h-11',
        // Override for touch devices
        shouldOptimizeForTouch && 'md:px-6 md:py-4 md:min-h-[48px] lg:px-6 lg:py-4 lg:min-h-[48px]'
      ),
      icon: cn(
        // Mobile first (default) - touch-friendly
        'h-11 w-11 p-0 min-h-[44px] min-w-[44px]',
        // Tablet and up
        'md:h-10 md:w-10',
        // Desktop and up
        'lg:h-9 lg:w-9',
        // Override for touch devices
        shouldOptimizeForTouch && 'md:h-11 md:w-11 md:min-h-[44px] md:min-w-[44px] lg:h-11 lg:w-11 lg:min-h-[44px] lg:min-w-[44px]'
      ),
    };

    return responsiveSizes[size as keyof typeof responsiveSizes];
  };

  const sizeClasses = getSizeClasses(size);

  const isDisabled = disabled || isLoading;

  // Enhanced styles for high-density displays and touch devices
  const combinedStyle: React.CSSProperties = {
    ...style,
    // Ensure crisp rendering on high-density displays
    WebkitFontSmoothing: 'antialiased' as const,
    MozOsxFontSmoothing: 'grayscale' as const,
    // Prevent text selection on touch devices
    ...(shouldOptimizeForTouch && {
      WebkitUserSelect: 'none' as const,
      userSelect: 'none' as const,
      WebkitTapHighlightColor: 'transparent',
    }),
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses,
        fullWidth && 'w-full',
        // Additional responsive classes
        responsive && [
          // Ensure proper spacing on different screen sizes
          'font-medium',
          // High-density display optimization
          'subpixel-antialiased',
          // Mobile-specific optimizations
          isMobile && 'text-base', // Slightly larger text on mobile for readability
        ],
        className
      )}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      style={combinedStyle}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
