import React from 'react';
import { cn } from '../../utils/cn';
import { useResponsive } from '../../contexts/ResponsiveContext';

export interface ResponsiveCardLayoutProps {
  children: React.ReactNode;
  className?: string;
  layout?: 'auto' | 'masonry' | 'uniform';
  breakpoints?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  gap?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  minCardWidth?: number;
  maxColumns?: number;
}

/**
 * Responsive layout container that automatically arranges cards
 * based on screen size and content requirements
 */
const ResponsiveCardLayout: React.FC<ResponsiveCardLayoutProps> = ({
  children,
  className,
  layout = 'auto',
  breakpoints = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 'md',
  minCardWidth = 280,
  maxColumns = 4
}) => {
  const { viewport, state } = useResponsive();
  const { isMobile, isTablet } = state;

  // Calculate optimal columns based on viewport width and min card width
  const calculateColumns = () => {
    if (layout === 'auto') {
      const availableWidth = viewport.width - 32; // Account for padding
      const gapWidth = getGapSize(gap);
      const maxPossibleColumns = Math.floor((availableWidth + gapWidth) / (minCardWidth + gapWidth));
      
      if (isMobile) return Math.min(maxPossibleColumns, breakpoints.mobile);
      if (isTablet) return Math.min(maxPossibleColumns, breakpoints.tablet);
      return Math.min(maxPossibleColumns, breakpoints.desktop, maxColumns);
    }
    
    if (isMobile) return breakpoints.mobile;
    if (isTablet) return breakpoints.tablet;
    return breakpoints.desktop;
  };

  // Get gap size in pixels
  const getGapSize = (gapSize: string) => {
    const gapMap = { xs: 8, sm: 12, md: 16, lg: 24, xl: 32 };
    return gapMap[gapSize as keyof typeof gapMap] || 16;
  };

  // Get gap classes
  const getGapClasses = (gapSize: string) => {
    const gapClasses = {
      xs: 'gap-2',
      sm: 'gap-3',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8'
    };
    return gapClasses[gapSize as keyof typeof gapClasses] || 'gap-4';
  };

  const columns = calculateColumns();

  // Layout-specific classes
  const layoutClasses = cn(
    'w-full',
    
    // Grid layout
    layout !== 'masonry' && [
      'grid',
      getGapClasses(gap),
      `grid-cols-${Math.min(columns, breakpoints.mobile)}`,
      `sm:grid-cols-${Math.min(columns, breakpoints.tablet)}`,
      `lg:grid-cols-${columns}`,
      
      // Auto-fit for responsive behavior
      layout === 'auto' && 'auto-rows-fr'
    ],
    
    // Masonry layout (using CSS columns)
    layout === 'masonry' && [
      `columns-${Math.min(columns, breakpoints.mobile)}`,
      `sm:columns-${Math.min(columns, breakpoints.tablet)}`,
      `lg:columns-${columns}`,
      getGapClasses(gap),
      'column-fill-balance'
    ],
    
    // Uniform height for uniform layout
    layout === 'uniform' && 'auto-rows-fr',
    
    className
  );

  // For masonry layout, we need to handle break-inside
  const childrenWithMasonryProps = layout === 'masonry' 
    ? React.Children.map(children, (child, index) => 
        React.isValidElement(child) 
          ? React.cloneElement(child, { 
              className: cn(child.props.className, 'break-inside-avoid mb-4'),
              key: child.key || index
            })
          : child
      )
    : children;

  return (
    <div 
      className={layoutClasses}
      style={layout === 'auto' ? {
        gridTemplateColumns: `repeat(auto-fit, minmax(${minCardWidth}px, 1fr))`
      } : undefined}
    >
      {childrenWithMasonryProps}
    </div>
  );
};

export default ResponsiveCardLayout;