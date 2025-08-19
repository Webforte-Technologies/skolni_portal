import React from 'react';
import { useResponsive } from '../../hooks/useViewport';
import Button from './Button';
import { cn } from '../../utils/cn';

/**
 * Example component demonstrating responsive utilities usage
 * Shows how to use viewport detection and responsive context
 */
export const ResponsiveExample: React.FC = () => {
  const { isMobile, isTablet, isDesktop, touchDevice, width, height } = useResponsive();

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">Responsive Utilities Example</h2>
      
      {/* Responsive layout example */}
      <div className={cn(
        "grid gap-4",
        isMobile && "grid-cols-1",
        isTablet && "grid-cols-2", 
        isDesktop && "grid-cols-3"
      )}>
        <div className="bg-blue-100 p-4 rounded">
          <h3 className="font-semibold">Device Info</h3>
          <p>Breakpoint: {isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}</p>
          <p>Touch Device: {touchDevice ? 'Yes' : 'No'}</p>
          <p>Orientation: {width > height ? 'landscape' : 'portrait'}</p>
        </div>
        
        <div className="bg-green-100 p-4 rounded">
          <h3 className="font-semibold">Viewport</h3>
          <p>Width: {width}px</p>
          <p>Height: {height}px</p>
        </div>
        
        <div className="bg-purple-100 p-4 rounded">
          <h3 className="font-semibold">Device Features</h3>
          <p>Touch Support: {touchDevice ? 'Yes' : 'No'}</p>
          <p>Screen Type: {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}</p>
        </div>
      </div>

      {/* Responsive button sizing */}
      <div className="space-y-2">
        <h3 className="font-semibold">Responsive Buttons</h3>
        <div className="flex flex-wrap gap-2">
          <Button 
            size={isMobile ? 'lg' : 'md'}
            className={cn(
              touchDevice && "min-h-[44px]" // Ensure touch-friendly size
            )}
          >
            {isMobile ? 'Mobile Button' : 'Desktop Button'}
          </Button>
          
          <Button 
            variant="secondary"
            onClick={() => console.log('Button clicked')}
            size={isMobile ? 'lg' : 'md'}
            className={cn(
              touchDevice && "min-h-[44px]"
            )}
          >
            Toggle Menu
          </Button>
        </div>
      </div>

      {/* Conditional rendering based on breakpoint */}
      {isMobile && (
        <div className="bg-yellow-100 p-4 rounded">
          <p>This content only shows on mobile devices!</p>
        </div>
      )}

      {isTablet && (
        <div className="bg-orange-100 p-4 rounded">
          <p>This content only shows on tablet devices!</p>
        </div>
      )}

      {isDesktop && (
        <div className="bg-cyan-100 p-4 rounded">
          <p>This content only shows on desktop devices!</p>
        </div>
      )}

      {/* Responsive text sizing */}
      <div className="space-y-2">
        <h3 className="font-semibold">Responsive Typography</h3>
        <p className={cn(
          "transition-all duration-300",
          isMobile && "text-sm",
          isTablet && "text-base",
          isDesktop && "text-lg"
        )}>
          This text scales with the viewport size. Current size: {isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}
        </p>
      </div>
    </div>
  );
};

export default ResponsiveExample;