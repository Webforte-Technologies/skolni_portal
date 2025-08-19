import React from 'react';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../hooks/useViewport';

interface ResponsiveFormGroupProps {
  children: React.ReactNode;
  className?: string;
  columns?: 1 | 2 | 3;
  stackOnMobile?: boolean;
  title?: string;
  description?: string;
}

const ResponsiveFormGroup: React.FC<ResponsiveFormGroupProps> = ({
  children,
  className,
  columns = 2,
  stackOnMobile = true,
  title,
  description,
}) => {
  const { isMobile } = useResponsive();

  const shouldStack = stackOnMobile && isMobile;
  const effectiveColumns = shouldStack ? 1 : columns;

  const gridClasses = cn(
    'grid gap-4',
    // Responsive grid columns
    effectiveColumns === 1 && 'grid-cols-1',
    effectiveColumns === 2 && 'grid-cols-1 sm:grid-cols-2',
    effectiveColumns === 3 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    className
  );

  return (
    <div className="space-y-4">
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h3 className={cn(
              'font-medium text-neutral-900 dark:text-neutral-100',
              isMobile ? 'text-lg' : 'text-base'
            )}>
              {title}
            </h3>
          )}
          {description && (
            <p className={cn(
              'text-neutral-600 dark:text-neutral-400',
              isMobile ? 'text-base' : 'text-sm'
            )}>
              {description}
            </p>
          )}
        </div>
      )}
      <div className={gridClasses}>
        {children}
      </div>
    </div>
  );
};

export default ResponsiveFormGroup;