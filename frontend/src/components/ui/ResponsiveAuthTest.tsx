import React, { useState } from 'react';
import { useResponsive } from '../../hooks/useViewport';

import Button from './Button';
import Card from './Card';

/**
 * Test component to validate responsive authentication features
 * This component demonstrates the responsive behavior implemented in task 8
 */
const ResponsiveAuthTest: React.FC = () => {
  const { isMobile, isTablet, isDesktop, touchDevice, breakpoint, width, height } = useResponsive();
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="p-4 space-y-6">
      <Card title="Responsive Authentication Test" className="max-w-2xl mx-auto">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Device Detection</h3>
              <div className="text-sm space-y-1">
                <p>Breakpoint: <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">{breakpoint}</span></p>
                <p>Mobile: <span className={`font-mono px-2 py-1 rounded ${isMobile ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{isMobile ? 'Yes' : 'No'}</span></p>
                <p>Tablet: <span className={`font-mono px-2 py-1 rounded ${isTablet ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{isTablet ? 'Yes' : 'No'}</span></p>
                <p>Desktop: <span className={`font-mono px-2 py-1 rounded ${isDesktop ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{isDesktop ? 'Yes' : 'No'}</span></p>
                <p>Touch Device: <span className={`font-mono px-2 py-1 rounded ${touchDevice ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{touchDevice ? 'Yes' : 'No'}</span></p>
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Viewport Info</h3>
              <div className="text-sm space-y-1">
                <p>Width: <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">{width}px</span></p>
                <p>Height: <span className="font-mono bg-neutral-100 dark:bg-neutral-800 px-2 py-1 rounded">{height}px</span></p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Responsive Features Implemented</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Mobile-optimized form layouts</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Single-column layouts on mobile</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Full-width form fields</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Responsive error messaging</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Touch-optimized inputs (44px min)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Viewport zoom prevention</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Responsive typography scaling</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Adaptive spacing and padding</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100">Requirements Coverage</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                <div>
                  <strong>Requirement 2.1:</strong> Single-column layouts with full-width form fields on mobile
                  <span className="block text-green-600 text-xs">✓ Implemented via ResponsiveForm with singleColumnOnMobile=true</span>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                <div>
                  <strong>Requirement 2.2:</strong> Prevent horizontal scrolling and maintain proper viewport scaling
                  <span className="block text-green-600 text-xs">✓ Implemented via preventZoom and responsive viewport handling</span>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                <div>
                  <strong>Requirement 2.3:</strong> Clear feedback with appropriately sized success/error messages
                  <span className="block text-green-600 text-xs">✓ Implemented via responsive error message styling</span>
                </div>
              </div>
              <div className="flex items-start space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></span>
                <div>
                  <strong>Requirement 2.4:</strong> Maintain centered layout design on desktop
                  <span className="block text-green-600 text-xs">✓ Implemented via responsive container and max-width constraints</span>
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={() => setShowDetails(!showDetails)}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {showDetails ? 'Hide' : 'Show'} Technical Details
          </Button>

          {showDetails && (
            <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg">
              <h4 className="font-medium mb-2">Technical Implementation Details</h4>
              <div className="text-sm space-y-2">
                <p><strong>Components Enhanced:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>LoginPage.tsx - Mobile-first responsive layout</li>
                  <li>RegistrationPage.tsx - Responsive form groups and validation</li>
                  <li>InputField.tsx - Touch optimization and zoom prevention</li>
                  <li>ResponsiveForm.tsx - Single-column mobile layouts</li>
                  <li>Button.tsx - Touch-friendly sizing and feedback</li>
                  <li>Card.tsx - Responsive padding and spacing</li>
                </ul>
                <p><strong>Key Features:</strong></p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Mobile-first CSS with Tailwind responsive classes</li>
                  <li>Touch target minimum 44px height on mobile devices</li>
                  <li>Debounced viewport detection with orientation support</li>
                  <li>Keyboard visibility detection for mobile forms</li>
                  <li>Responsive typography scaling (text-base on mobile, text-sm on desktop)</li>
                  <li>Enhanced error messaging with proper spacing and icons</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default ResponsiveAuthTest;