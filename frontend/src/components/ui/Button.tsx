import React from 'react';
import { cn } from '../../utils/cn';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'subtle';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  className,
  children,
  fullWidth,
  isLoading = false,
  disabled,
  ...rest
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed';
  
  const variantClasses: Record<string, string> = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 shadow-soft',
    secondary: 'bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700',
    outline: 'border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-neutral-700 dark:text-neutral-100 hover:bg-neutral-50 dark:hover:bg-neutral-800',
    ghost: 'text-neutral-700 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800',
    danger: 'bg-danger-600 text-white hover:bg-danger-700',
    subtle: 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/30',
  };
  
  const sizeClasses: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
    icon: 'h-9 w-9 p-0',
  };

  const isDisabled = disabled || isLoading;

  return (
    <button
      className={cn(baseClasses, variantClasses[variant], sizeClasses[size], fullWidth && 'w-full', className)}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
