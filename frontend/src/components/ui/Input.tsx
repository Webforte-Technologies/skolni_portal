import React from 'react';
import { cn } from '../../utils/cn';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

const Input: React.FC<InputProps> = ({ className, ...props }) => {
  return (
    <input
      className={cn(
        'block w-full border border-gray-300 rounded-md shadow-sm',
        'px-3 py-2 text-sm text-gray-900 placeholder-gray-400',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
        'transition-colors duration-200',
        className
      )}
      {...props}
    />
  );
};

export default Input;
