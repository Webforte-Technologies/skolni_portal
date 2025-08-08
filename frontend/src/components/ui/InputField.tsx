import React, { forwardRef } from 'react';
import { InputFieldProps } from '../../types';
import { cn } from '../../utils/cn';

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(({
  label,
  name,
  type = 'text',
  placeholder,
  required = false,
  error,
  value,
  onChange,
  className,
  ...props
}, ref) => {
  return (
    <div className="space-y-1">
      <label htmlFor={name} className="block text-sm font-medium text-neutral-700 dark:text-neutral-200">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        {props.leadingIcon && (
          <span className="absolute inset-y-0 left-2 flex items-center text-neutral-400 dark:text-neutral-500">
            {props.leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          value={value}
          onChange={onChange}
          className={cn(
            'block w-full px-3 py-2 border border-neutral-300 dark:border-neutral-700 rounded-md shadow-sm placeholder-neutral-400 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm',
            props.leadingIcon && 'pl-9',
            props.trailingIcon && 'pr-9',
            error && 'border-danger-300 focus:ring-danger-500 focus:border-danger-500',
            className
          )}
          {...props}
        />
        {props.trailingIcon && (
          <span className="absolute inset-y-0 right-2 flex items-center text-neutral-400 dark:text-neutral-500">
            {props.trailingIcon}
          </span>
        )}
      </div>
      {error && (
        <p className="text-sm text-danger-600">{error}</p>
      )}
      {props.helpText && !error && (
        <p className="text-xs text-neutral-500 dark:text-neutral-400">{props.helpText}</p>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField;
