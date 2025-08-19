import { forwardRef, useEffect, useRef } from 'react';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../hooks/useViewport';

interface ResponsiveTextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
  preventZoom?: boolean;
  autoResize?: boolean;
}

const ResponsiveTextArea = forwardRef<HTMLTextAreaElement, ResponsiveTextAreaProps>(({
  label,
  name,
  placeholder,
  required = false,
  error,
  value,
  onChange,
  className,
  helpText,
  preventZoom = true,
  autoResize = false,
  rows = 4,
  ...props
}, ref) => {
  const { isMobile, touchDevice } = useResponsive();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Combine refs
  const combinedRef = (node: HTMLTextAreaElement | null) => {
    if (textareaRef.current !== node) {
      (textareaRef as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
    }
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      (ref as React.MutableRefObject<HTMLTextAreaElement | null>).current = node;
    }
  };

  // Auto-resize functionality
  useEffect(() => {
    if (!autoResize) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    };

    // Adjust height on value change
    adjustHeight();

    textarea.addEventListener('input', adjustHeight);
    return () => textarea.removeEventListener('input', adjustHeight);
  }, [autoResize, value]);

  // Prevent zoom on iOS when focusing
  useEffect(() => {
    if (!preventZoom || !isMobile) return;

    const textarea = textareaRef.current;
    if (!textarea) return;

    const handleFocus = () => {
      if (textarea.style.fontSize !== '16px') {
        textarea.style.fontSize = '16px';
      }
    };

    const handleBlur = () => {
      textarea.style.fontSize = '';
    };

    textarea.addEventListener('focus', handleFocus);
    textarea.addEventListener('blur', handleBlur);

    return () => {
      textarea.removeEventListener('focus', handleFocus);
      textarea.removeEventListener('blur', handleBlur);
    };
  }, [preventZoom, isMobile]);

  const containerClasses = cn(
    'space-y-1',
    isMobile && 'w-full mb-4'
  );

  const labelClasses = cn(
    'block font-medium text-neutral-700 dark:text-neutral-200',
    isMobile ? 'text-base' : 'text-sm',
    touchDevice && 'mb-2'
  );

  const textareaClasses = cn(
    'block w-full border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm placeholder-neutral-400 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200 resize-vertical',
    // Responsive padding and sizing
    isMobile 
      ? 'px-4 py-3 text-base' 
      : 'px-3 py-2 text-sm',
    // Touch device optimizations
    touchDevice && 'min-h-[44px]',
    // Error states
    error && 'border-danger-300 focus:ring-danger-500 focus:border-danger-500',
    // Auto-resize
    autoResize && 'resize-none overflow-hidden',
    className
  );

  return (
    <div className={containerClasses}>
      <label htmlFor={name} className={labelClasses}>
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        ref={combinedRef}
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        rows={rows}
        className={textareaClasses}
        // Mobile-specific attributes
        autoCapitalize="sentences"
        autoCorrect="on"
        spellCheck={true}
        // Prevent zoom on iOS
        style={isMobile && preventZoom ? { fontSize: '16px' } : undefined}
        {...props}
      />
      {error && (
        <p className={cn(
          'text-danger-600',
          isMobile ? 'text-sm' : 'text-xs'
        )}>
          {error}
        </p>
      )}
      {helpText && !error && (
        <p className={cn(
          'text-neutral-500 dark:text-neutral-400',
          isMobile ? 'text-sm' : 'text-xs'
        )}>
          {helpText}
        </p>
      )}
    </div>
  );
});

ResponsiveTextArea.displayName = 'ResponsiveTextArea';

export default ResponsiveTextArea;