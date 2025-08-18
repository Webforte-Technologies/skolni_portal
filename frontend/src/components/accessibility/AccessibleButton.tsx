import React, { forwardRef } from 'react';
import { useAccessibilityContext } from './AccessibilityProvider';

interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  responsiveAriaLabel?: {
    mobile: string;
    tablet?: string;
    desktop?: string;
  };
}

export const AccessibleButton = forwardRef<HTMLButtonElement, AccessibleButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      loadingText = 'Načítání...',
      children,
      responsiveAriaLabel,
      className = '',
      disabled,
      onClick,
      ...props
    },
    ref
  ) => {
    const { 
      isMobile, 
      isTablet, 
      keyboardNavigation, 
      prefersReducedMotion,
      getResponsiveAriaLabel,
      announce 
    } = useAccessibilityContext();

    const getVariantClasses = () => {
      const baseClasses = 'font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
      
      switch (variant) {
        case 'primary':
          return `${baseClasses} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-gray-300`;
        case 'secondary':
          return `${baseClasses} bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 disabled:bg-gray-300`;
        case 'outline':
          return `${baseClasses} border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-blue-500 disabled:bg-gray-100`;
        case 'ghost':
          return `${baseClasses} text-gray-700 hover:bg-gray-100 focus:ring-blue-500 disabled:text-gray-400`;
        default:
          return baseClasses;
      }
    };

    const getSizeClasses = () => {
      if (isMobile) {
        // Mobile-first sizing with minimum touch targets
        switch (size) {
          case 'sm':
            return 'px-4 py-3 text-sm min-h-[44px]';
          case 'md':
            return 'px-6 py-3 text-base min-h-[48px]';
          case 'lg':
            return 'px-8 py-4 text-lg min-h-[52px]';
          default:
            return 'px-6 py-3 text-base min-h-[48px]';
        }
      } else if (isTablet) {
        // Tablet sizing
        switch (size) {
          case 'sm':
            return 'px-3 py-2 text-sm min-h-[40px]';
          case 'md':
            return 'px-4 py-2 text-base min-h-[44px]';
          case 'lg':
            return 'px-6 py-3 text-lg min-h-[48px]';
          default:
            return 'px-4 py-2 text-base min-h-[44px]';
        }
      } else {
        // Desktop sizing
        switch (size) {
          case 'sm':
            return 'px-3 py-1.5 text-sm min-h-[32px]';
          case 'md':
            return 'px-4 py-2 text-base min-h-[36px]';
          case 'lg':
            return 'px-6 py-3 text-lg min-h-[40px]';
          default:
            return 'px-4 py-2 text-base min-h-[36px]';
        }
      }
    };

    const getAccessibilityClasses = () => {
      let classes = '';
      
      if (keyboardNavigation) {
        classes += ' ring-2 ring-blue-500';
      }
      
      if (isMobile) {
        classes += ' touch-manipulation select-none';
      }
      
      if (prefersReducedMotion) {
        classes += ' transition-none';
      }
      
      return classes;
    };

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (loading || disabled) {
        e.preventDefault();
        return;
      }

      // Announce button activation for screen readers
      if (responsiveAriaLabel) {
        const label = getResponsiveAriaLabel(
          responsiveAriaLabel.mobile,
          responsiveAriaLabel.tablet,
          responsiveAriaLabel.desktop
        );
        announce(`${label} aktivováno`, 'polite');
      }

      onClick?.(e);
    };

    const ariaLabel = responsiveAriaLabel
      ? getResponsiveAriaLabel(
          responsiveAriaLabel.mobile,
          responsiveAriaLabel.tablet,
          responsiveAriaLabel.desktop
        )
      : undefined;

    const buttonClasses = `
      ${getVariantClasses()}
      ${getSizeClasses()}
      ${getAccessibilityClasses()}
      ${className}
    `.trim();

    return (
      <button
        ref={ref}
        className={buttonClasses}
        disabled={disabled || loading}
        aria-label={ariaLabel}
        aria-busy={loading}
        aria-describedby={loading ? 'loading-description' : undefined}
        onClick={handleClick}
        {...props}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg
              className={`animate-spin -ml-1 mr-2 h-4 w-4 text-current ${prefersReducedMotion ? 'animate-none' : ''}`}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            {loadingText}
          </span>
        ) : (
          children
        )}
        
        {loading && (
          <span id="loading-description" className="sr-only">
            Tlačítko je momentálně nedostupné, probíhá načítání
          </span>
        )}
      </button>
    );
  }
);