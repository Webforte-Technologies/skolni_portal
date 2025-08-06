import React from 'react';
import { CardProps } from '../../types';
import { cn } from '../../utils/cn';

const Card: React.FC<CardProps> = ({
  children,
  title,
  className,
  onClick,
}) => {
  return (
    <div
      className={cn(
        'bg-white border border-gray-200 rounded-lg shadow-sm p-6',
        onClick && 'cursor-pointer hover:shadow-md transition-shadow duration-200',
        className
      )}
      onClick={onClick}
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      {children}
    </div>
  );
};

export default Card; 