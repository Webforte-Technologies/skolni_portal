import React from 'react';
import { cn } from '../../utils/cn';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
}

const Card: React.FC<CardProps> = ({ children, title, className, ...props }) => {
  return (
    <div
      className={cn('bg-white dark:bg-neutral-950 rounded-card border border-neutral-200 dark:border-neutral-800 shadow-soft', className)}
      {...props}
    >
      {title && (
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-800">
          <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">{title}</h3>
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
};

export default Card;
