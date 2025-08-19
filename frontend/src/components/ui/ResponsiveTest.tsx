import React from 'react';
import { useViewport } from '../../hooks/useViewport';
import { useResponsive } from '../../hooks/useViewport';

/**
 * Test component to verify responsive utilities are working
 * This component can be temporarily added to any page for testing
 */
export const ResponsiveTest: React.FC = () => {
  const viewport = useViewport();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg text-xs max-w-xs z-50">
      <h3 className="font-bold mb-2">Responsive Debug</h3>
      
      <div className="space-y-1">
        <div><strong>Viewport:</strong> {viewport.width}x{viewport.height}</div>
        <div><strong>Breakpoint:</strong> {viewport.breakpoint}</div>
        <div><strong>Orientation:</strong> {viewport.orientation}</div>
        <div><strong>Touch Device:</strong> {viewport.touchDevice ? 'Yes' : 'No'}</div>
        
        <div className="border-t pt-2 mt-2">
          <div><strong>Is Mobile:</strong> {isMobile ? 'Yes' : 'No'}</div>
          <div><strong>Is Tablet:</strong> {isTablet ? 'Yes' : 'No'}</div>
          <div><strong>Is Desktop:</strong> {isDesktop ? 'Yes' : 'No'}</div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveTest;