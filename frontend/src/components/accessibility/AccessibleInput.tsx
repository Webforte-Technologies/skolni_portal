import React, { forwardRef, useState } from 'react';
import { useAccessibilityContext } from './AccessibilityProvider';

interface AccessibleInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  helperText?: string;
  showLabel?: boolean;
  responsiveLabel?: {
    mobile: string;
    tablet?: string;
    desktop?: string;
  };
}

export const AccessibleInput = forwardRef<HTMLInputElement, AccessibleInputProps>(
  (
    {
      label,
      error,
      helperText,
      showLabel = true,
      responsiveLabel,
      className = '',
      id,
      onFocus,
      onBlur,
      onChange,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const { 
      isMobile, 
      isTablet, 
      keyboardNavigation,
      getResponsiveAriaLabel,
      announce 
    } = useAccessibilityContext();

    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const errorId = error ? `${inputId}-error` : undefined;
    const helperId = helperText ? `${inputId}-helper` : undefined;

    const displayLabel = responsiveLabel
      ? getResponsiveAriaLabel(
          responsiveLabel.mobile,
          responsiveLabel.tablet,
          responsiveLabel.desktop
        )
      : label;

    const getInputClasses = () => {
      const baseClasses = `
        block w-full rounded-md border transition-colors
        focus:outline-none focus:ring-2 focus:ring-offset-2
        disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
      `;

      const sizeClasses = isMobile
        ? 'px-4 py-3 text-base min-h-[48px]' // Mobile: larger touch targets
        : isTablet
        ? 'px-3 py-2.5 text-base min-h-[44px]' // Tablet: medium size
        : 'px-3 py-2 text-sm min-h-[36px]'; // Desktop: compact

      const stateClasses = error
        ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
        : isFocused || keyboardNavigation
        ? 'border-blue-300 focus:ring-blue-500 focus:border-blue-500'
        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';

      const mobileClasses = isMobile ? 'touch-manipulation' : '';

      return `${baseClasses} ${sizeClasses} ${stateClasses} ${mobileClasses} ${className}`.trim();
    };

    const getLabelClasses = () => {
      const baseClasses = 'block font-medium';
      const sizeClasses = isMobile ? 'text-base mb-2' : 'text-sm mb-1';
      const colorClasses = error ? 'text-red-700' : 'text-gray-700';
      
      return `${baseClasses} ${sizeClasses} ${colorClasses}`;
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      
      // Announce field information for screen readers
      let announcement = `${displayLabel} pole`;
      if (props.required) announcement += ', povinné';
      if (helperText) announcement += `, ${helperText}`;
      if (error) announcement += `, chyba: ${error}`;
      
      announce(announcement, 'polite');
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Clear error announcement when user starts typing
      if (error && e.target.value) {
        announce('Chyba odstraněna', 'polite');
      }
      onChange?.(e);
    };

    return (
      <div className="w-full">
        {showLabel && (
          <label htmlFor={inputId} className={getLabelClasses()}>
            {displayLabel}
            {props.required && (
              <span className="text-red-500 ml-1" aria-label="povinné pole">
                *
              </span>
            )}
          </label>
        )}
        
        <input
          ref={ref}
          id={inputId}
          className={getInputClasses()}
          aria-describedby={[errorId, helperId].filter(Boolean).join(' ') || undefined}
          aria-invalid={error ? 'true' : 'false'}
          aria-required={props.required}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          {...props}
        />
        
        {helperText && !error && (
          <p id={helperId} className={`mt-1 ${isMobile ? 'text-sm' : 'text-xs'} text-gray-600`}>
            {helperText}
          </p>
        )}
        
        {error && (
          <p
            id={errorId}
            className={`mt-1 ${isMobile ? 'text-sm' : 'text-xs'} text-red-600 flex items-center`}
            role="alert"
            aria-live="polite"
          >
            <svg
              className="w-4 h-4 mr-1 flex-shrink-0"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);