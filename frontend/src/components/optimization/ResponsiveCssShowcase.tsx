/**
 * Responsive CSS Optimization Showcase Component
 * Demonstrates critical CSS inlining, font loading, and adaptive properties
 */

import React, { useState, useEffect } from 'react';
import { useResponsiveCssOptimization, useAdaptiveProperties } from '../../hooks/useResponsiveCssOptimization';

interface OptimizationMetrics {
  criticalCssSize: number;
  fontsLoadTime: number;
  adaptivePropertiesCount: number;
  performanceScore: number;
}

export const ResponsiveCssShowcase: React.FC = () => {
  const {
    isLoading,
    fontsLoaded,
    currentBreakpoint,
    prefersReducedMotion,
    prefersDarkMode,
    criticalCssLoaded,
    isMobile,
    isTablet,
    isDesktop,
    isTouchDevice,
    loadFont,
    // getAdaptiveValue, // Commented out as it's not used in this component
  } = useResponsiveCssOptimization();

  const {
    getSpacing,
    getRadius,
    getShadow,
    getDuration,
    updateAdaptiveProperty,
  } = useAdaptiveProperties();

  const [metrics, setMetrics] = useState<OptimizationMetrics>({
    criticalCssSize: 0,
    fontsLoadTime: 0,
    adaptivePropertiesCount: 0,
    performanceScore: 0,
  });

  const [customProperty, setCustomProperty] = useState('--space-4');
  const [propertyValue, setPropertyValue] = useState('');

  // Calculate optimization metrics
  useEffect(() => {
    const calculateMetrics = () => {
      const criticalCssElement = document.getElementById('critical-css');
      const criticalCssSize = criticalCssElement?.textContent?.length || 0;
      
      const adaptivePropertiesCount = Array.from(document.documentElement.style)
        .filter(prop => prop.startsWith('--')).length;
      
      const performanceScore = Math.min(100, 
        (criticalCssLoaded ? 25 : 0) +
        (fontsLoaded ? 25 : 0) +
        (adaptivePropertiesCount > 0 ? 25 : 0) +
        (currentBreakpoint ? 25 : 0)
      );

      setMetrics({
        criticalCssSize,
        fontsLoadTime: fontsLoaded ? 150 : 0, // Simulated load time
        adaptivePropertiesCount,
        performanceScore,
      });
    };

    calculateMetrics();
  }, [criticalCssLoaded, fontsLoaded, currentBreakpoint]);

  // Update property value when custom property changes
  useEffect(() => {
    if (customProperty) {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(customProperty)
        .trim();
      setPropertyValue(value);
    }
  }, [customProperty, currentBreakpoint]);

  const handleLoadCustomFont = async () => {
    try {
      await loadFont('Inter', { weight: '800' });
      alert('Custom font loaded successfully!');
    } catch (error) {
      alert('Failed to load custom font');
    }
  };

  const handleUpdateProperty = () => {
    const mobileValue = '0.5rem';
    const tabletValue = '1rem';
    const desktopValue = '1.5rem';
    
    updateAdaptiveProperty('--demo-spacing', mobileValue, tabletValue, desktopValue);
    alert(`Updated --demo-spacing for ${currentBreakpoint}`);
  };

  return (
    <div className="adaptive-container space-y-adaptive">
      <div className="adaptive-card">
        <h2 className="heading-responsive mb-6">
          Responsive CSS Optimizations
        </h2>
        
        {/* Loading Status */}
        <div className="mb-8">
          <h3 className="subheading-responsive mb-4">Loading Status</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`p-4 rounded-lg border-2 ${
              criticalCssLoaded ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'
            }`}>
              <div className="text-sm font-medium text-gray-600">Critical CSS</div>
              <div className={`text-lg font-semibold ${
                criticalCssLoaded ? 'text-green-600' : 'text-gray-400'
              }`}>
                {criticalCssLoaded ? 'Loaded' : 'Loading...'}
              </div>
            </div>
            
            <div className={`p-4 rounded-lg border-2 ${
              fontsLoaded ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'
            }`}>
              <div className="text-sm font-medium text-gray-600">Fonts</div>
              <div className={`text-lg font-semibold ${
                fontsLoaded ? 'text-green-600' : 'text-gray-400'
              }`}>
                {fontsLoaded ? 'Loaded' : 'Loading...'}
              </div>
            </div>
            
            <div className={`p-4 rounded-lg border-2 ${
              !isLoading ? 'border-green-500 bg-green-50' : 'border-gray-300 bg-gray-50'
            }`}>
              <div className="text-sm font-medium text-gray-600">Optimization</div>
              <div className={`text-lg font-semibold ${
                !isLoading ? 'text-green-600' : 'text-gray-400'
              }`}>
                {!isLoading ? 'Complete' : 'In Progress'}
              </div>
            </div>
            
            <div className="p-4 rounded-lg border-2 border-blue-500 bg-blue-50">
              <div className="text-sm font-medium text-gray-600">Performance</div>
              <div className="text-lg font-semibold text-blue-600">
                {metrics.performanceScore}%
              </div>
            </div>
          </div>
        </div>

        {/* Device Detection */}
        <div className="mb-8">
          <h3 className="subheading-responsive mb-4">Device Detection</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-600">Current Breakpoint</div>
              <div className="text-lg font-semibold text-gray-900 capitalize">
                {currentBreakpoint}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-600">Device Type</div>
              <div className="text-lg font-semibold text-gray-900">
                {isTouchDevice ? 'Touch Device' : 'Desktop'}
              </div>
            </div>
            
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-600">Preferences</div>
              <div className="text-sm space-y-1">
                <div className={prefersReducedMotion ? 'text-orange-600' : 'text-gray-600'}>
                  Reduced Motion: {prefersReducedMotion ? 'Yes' : 'No'}
                </div>
                <div className={prefersDarkMode ? 'text-blue-600' : 'text-gray-600'}>
                  Dark Mode: {prefersDarkMode ? 'Yes' : 'No'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Adaptive Values Demo */}
        <div className="mb-8">
          <h3 className="subheading-responsive mb-4">Adaptive Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Responsive Spacing</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Small (--space-2):</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {getSpacing('2')}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span>Medium (--space-4):</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {getSpacing('4')}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span>Large (--space-8):</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {getSpacing('8')}
                  </code>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Responsive Styling</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Border Radius:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {getRadius('lg')}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span>Shadow:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {getShadow('base')}
                  </code>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                    {getDuration('base')}
                  </code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interactive Demo */}
        <div className="mb-8">
          <h3 className="subheading-responsive mb-4">Interactive Demo</h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={customProperty}
                onChange={(e) => setCustomProperty(e.target.value)}
                className="adaptive-form-field"
              >
                <option value="--space-1">--space-1</option>
                <option value="--space-2">--space-2</option>
                <option value="--space-4">--space-4</option>
                <option value="--space-8">--space-8</option>
                <option value="--radius-base">--radius-base</option>
                <option value="--radius-lg">--radius-lg</option>
                <option value="--shadow-base">--shadow-base</option>
                <option value="--duration-base">--duration-base</option>
              </select>
              
              <div className="adaptive-form-field bg-gray-50">
                Current Value: <code>{propertyValue}</code>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleLoadCustomFont}
                className="btn btn-primary adaptive-transition"
              >
                Load Custom Font Weight
              </button>
              
              <button
                onClick={handleUpdateProperty}
                className="btn btn-secondary adaptive-transition"
              >
                Update Demo Property
              </button>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="mb-8">
          <h3 className="subheading-responsive mb-4">Performance Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-600">Critical CSS Size</div>
              <div className="text-2xl font-bold text-blue-900">
                {(metrics.criticalCssSize / 1024).toFixed(1)}KB
              </div>
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm font-medium text-green-600">Font Load Time</div>
              <div className="text-2xl font-bold text-green-900">
                {metrics.fontsLoadTime}ms
              </div>
            </div>
            
            <div className="p-4 bg-purple-50 rounded-lg">
              <div className="text-sm font-medium text-purple-600">Adaptive Properties</div>
              <div className="text-2xl font-bold text-purple-900">
                {metrics.adaptivePropertiesCount}
              </div>
            </div>
          </div>
        </div>

        {/* Visual Examples */}
        <div className="mb-8">
          <h3 className="subheading-responsive mb-4">Visual Examples</h3>
          <div className="space-y-6">
            {/* Adaptive Spacing Example */}
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <h4 className="font-medium mb-4">Adaptive Spacing</h4>
              <div className="adaptive-grid">
                <div className="adaptive-card bg-blue-100">
                  <div className="body-responsive">Card with adaptive padding</div>
                </div>
                <div className="adaptive-card bg-green-100">
                  <div className="body-responsive">Responsive grid gap</div>
                </div>
                <div className="adaptive-card bg-purple-100">
                  <div className="body-responsive">Breakpoint-aware sizing</div>
                </div>
              </div>
            </div>

            {/* Touch Target Example */}
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <h4 className="font-medium mb-4">Touch Targets</h4>
              <div className="flex flex-wrap gap-4">
                <button className="touch-target bg-blue-500 text-white rounded adaptive-transition hover:bg-blue-600">
                  Minimum (44px)
                </button>
                <button className="touch-target-comfortable bg-green-500 text-white rounded adaptive-transition hover:bg-green-600">
                  Comfortable (48px)
                </button>
                <button className="touch-target-large bg-purple-500 text-white rounded adaptive-transition hover:bg-purple-600">
                  Large (56px)
                </button>
              </div>
            </div>

            {/* Typography Example */}
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <h4 className="font-medium mb-4">Responsive Typography</h4>
              <div className="space-y-4">
                <div className="heading-responsive">Responsive Heading</div>
                <div className="subheading-responsive">Responsive Subheading</div>
                <div className="body-responsive">
                  Responsive body text that adapts to different screen sizes and maintains 
                  optimal readability across all devices.
                </div>
                <div className="caption-responsive text-gray-600">
                  Responsive caption text for additional information
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Breakpoint Indicators */}
        <div className="border-t pt-6">
          <h3 className="subheading-responsive mb-4">Breakpoint Indicators</h3>
          <div className="flex flex-wrap gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isMobile ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}>
              Mobile (≤640px)
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isTablet ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}>
              Tablet (641px-1024px)
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isDesktop ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}>
              Desktop (≥1025px)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveCssShowcase;