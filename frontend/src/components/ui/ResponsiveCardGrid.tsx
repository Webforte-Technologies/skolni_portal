import React from 'react';
import { cn } from '../../utils/cn';

export interface ResponsiveCardGridProps extends React.HTMLAttributes<HTMLDivElement> {
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: 'sm' | 'md' | 'lg';
  minCardWidth?: string;
  adaptiveStacking?: boolean;
}

/**
 * Responsive grid container for Card components that handles:
 * - Mobile-first responsive columns
 * - Adaptive spacing based on screen size
 * - Touch-friendly gaps and sizing
 * - Automatic stacking on small screens
 */
const ResponsiveCardGrid: React.FC<ResponsiveCardGridProps> = ({
  children,
  className,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  minCardWidth = '280px',
  adaptiveStacking = true,
  ...props
}) => {
  // Responsive context available for future enhancements
  // const { state } = useResponsive();



  // Gap size mapping
  const gapClasses = {
    sm: 'gap-3 sm:gap-4',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8'
  };

  // Grid classes with responsive behavior
  const gridClasses = cn(
    'grid w-full',
    
    // Responsive grid columns
    `grid-cols-${columns.mobile || 1}`,
    `sm:grid-cols-${columns.tablet || 2}`,
    `lg:grid-cols-${columns.desktop || 3}`,
    
    // Responsive gaps
    gapClasses[gap],
    
    // Auto-fit for very flexible layouts
    adaptiveStacking && `auto-rows-fr`,
    
    className
  );

  return (
    <div
      className={gridClasses}
      style={{
        // Ensure minimum card width is respected
        gridTemplateColumns: adaptiveStacking 
          ? `repeat(auto-fit, minmax(${minCardWidth}, 1fr))`
          : undefined
      }}
      {...props}
    >
      {children}
    </div>
  );
};

export default ResponsiveCardGrid;