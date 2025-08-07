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
      <label htmlFor={name} className="block text-sm font-medium text-neutral-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
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
          'block w-full px-3 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 sm:text-sm',
          error && 'border-danger-300 focus:ring-danger-500 focus:border-danger-500',
          className
        )}
        {...props}
      />
      {error && (
        <p className="text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

export default InputField;
