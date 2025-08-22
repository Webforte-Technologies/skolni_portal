import { forwardRef, useEffect, useRef } from 'react';
import { InputFieldProps } from '../../types';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../hooks/useViewport';

interface ResponsiveInputFieldProps extends InputFieldProps {
  mobileLayout?: 'stacked' | 'inline';
  touchOptimized?: boolean;
  preventZoom?: boolean;
}

const InputField = forwardRef<HTMLInputElement, ResponsiveInputFieldProps>(({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  error,
  value,
  onChange,
  className,
  mobileLayout = 'stacked',
  preventZoom = true,
  ...props
}, ref) => {
  const { isMobile, touchDevice } = useResponsive();
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Combine refs
  const combinedRef = (node: HTMLInputElement | null) => {
    if (inputRef.current !== node) {
      (inputRef as React.MutableRefObject<HTMLInputElement | null>).current = node;
    }
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
    }
  };

  // Prevent zoom on iOS when focusing inputs
  useEffect(() => {
    if (!preventZoom || !isMobile) return;

    const input = inputRef.current;
    if (!input) return;

    const handleFocus = () => {
      // Set font-size to 16px to prevent zoom on iOS
      if (input.style.fontSize !== '16px') {
        input.style.fontSize = '16px';
      }
    };

    const handleBlur = () => {
      // Reset font-size after blur
      input.style.fontSize = '';
    };

    input.addEventListener('focus', handleFocus);
    input.addEventListener('blur', handleBlur);

    return () => {
      input.removeEventListener('focus', handleFocus);
      input.removeEventListener('blur', handleBlur);
    };
  }, [preventZoom, isMobile]);

  // Calculate responsive classes
  const containerClasses = cn(
    'space-y-1',
    isMobile && mobileLayout === 'stacked' && 'w-full',
    isMobile && 'mb-4' // Extra spacing on mobile
  );

  const labelClasses = cn(
    'block font-medium text-neutral-700 dark:text-neutral-200',
    // Responsive text sizing
    isMobile ? 'text-base' : 'text-sm',
    // Touch-friendly spacing
    touchDevice && 'mb-2'
  );

  const inputClasses = cn(
    'block w-full border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm placeholder-neutral-400 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200',
    // Responsive padding and sizing
    isMobile 
      ? 'px-4 py-3 text-base' // Larger touch targets on mobile (minimum 44px height)
      : 'px-3 py-2 text-sm',
    // Touch device optimizations
    touchDevice && 'min-h-[44px]', // Ensure minimum touch target size
    // Icon spacing
    props.leadingIcon && (isMobile ? 'pl-12' : 'pl-9'),
    props.trailingIcon && (isMobile ? 'pr-12' : 'pr-9'),
    // Error states
    error && 'border-danger-300 focus:ring-danger-500 focus:border-danger-500',
    // Custom classes
    className
  );

  const iconClasses = cn(
    'absolute inset-y-0 flex items-center text-neutral-400 dark:text-neutral-500',
    // Responsive icon sizing and positioning
    isMobile ? 'w-6 h-6' : 'w-4 h-4'
  );

  const leadingIconClasses = cn(
    iconClasses,
    isMobile ? 'left-3' : 'left-2'
  );

  const trailingIconClasses = cn(
    iconClasses,
    isMobile ? 'right-3' : 'right-2'
  );

  return (
    <div className={containerClasses}>
      <label htmlFor={name} className={labelClasses}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {props.leadingIcon && (
          <span className={leadingIconClasses}>
            {props.leadingIcon}
          </span>
        )}
        <input
          ref={combinedRef}
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          className={inputClasses}
          // Mobile-specific attributes
          autoComplete={props.autoComplete || 'off'}
          autoCapitalize={type === 'email' ? 'none' : 'sentences'}
          autoCorrect={type === 'email' || type === 'password' ? 'off' : 'on'}
          spellCheck={type === 'email' || type === 'password' ? false : true}
          // Prevent zoom on iOS
          style={isMobile && preventZoom ? { fontSize: '16px' } : undefined}
          {...props}
        />
        {props.trailingIcon && (
          <span className={trailingIconClasses}>
            {props.trailingIcon}
          </span>
        )}
      </div>
      {error && (
        <p className={cn(
          'text-danger-600',
          isMobile ? 'text-sm' : 'text-xs'
        )}>
          {error}
        </p>
      )}
      {props.helpText && !error && (
        <p className={cn(
          'text-neutral-500 dark:text-neutral-400',
          isMobile ? 'text-sm' : 'text-xs'
        )}>
          {props.helpText}
        </p>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField;
