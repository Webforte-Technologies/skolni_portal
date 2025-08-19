import React from 'react';
import Button from './Button';
import { useResponsive } from '../../hooks/useViewport';

/**
 * Demo component showcasing responsive Button variants
 * This component demonstrates all the responsive features of the Button component
 */
const ResponsiveButtonDemo: React.FC = () => {
  const { isMobile, isTablet, isDesktop, touchDevice, width, height } = useResponsive();

  return (
    <div className="p-6 space-y-8 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
          Responsive Button Component Demo
        </h1>
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
          Current viewport: {width}x{height} | 
          Device: {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'} | 
          Touch: {touchDevice ? 'Yes' : 'No'}
        </p>
      </div>

      {/* Size Variants */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Size Variants (Responsive)
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button size="sm" variant="primary">
            Small Button
          </Button>
          <Button size="md" variant="primary">
            Medium Button
          </Button>
          <Button size="lg" variant="primary">
            Large Button
          </Button>
          <Button size="icon" variant="primary" aria-label="Search">
            🔍
          </Button>
        </div>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          These buttons automatically adjust their size based on screen size and touch capability.
          On mobile, they maintain minimum 44px touch targets.
        </p>
      </section>

      {/* Variant Styles */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Style Variants
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="subtle">Subtle</Button>
        </div>
      </section>

      {/* Touch Optimization */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Touch Optimization
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
              Auto Touch Optimization
            </h3>
            <Button size="md" variant="primary">
              Auto-optimized for {touchDevice ? 'Touch' : 'Mouse'}
            </Button>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Automatically optimized based on device capabilities
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
              Force Touch Optimization
            </h3>
            <Button size="md" variant="secondary" touchOptimized>
              Always Touch-Optimized
            </Button>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Forced touch optimization regardless of device
            </p>
          </div>
        </div>
      </section>

      {/* Full Width */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Full Width Buttons
        </h2>
        <div className="space-y-2">
          <Button fullWidth variant="primary">
            Full Width Primary Button
          </Button>
          <Button fullWidth variant="outline">
            Full Width Outline Button
          </Button>
        </div>
      </section>

      {/* Loading States */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Loading States
        </h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Button isLoading variant="primary">
            Loading...
          </Button>
          <Button isLoading variant="secondary" size="lg">
            Processing...
          </Button>
          <Button disabled variant="outline">
            Disabled
          </Button>
        </div>
      </section>

      {/* Responsive vs Non-Responsive */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Responsive vs Non-Responsive
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
              Responsive (Default)
            </h3>
            <Button size="md" variant="primary">
              Responsive Button
            </Button>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Adapts size based on screen size
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
              Non-Responsive
            </h3>
            <Button size="md" variant="primary" responsive={false}>
              Fixed Size Button
            </Button>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Maintains consistent size across devices
            </p>
          </div>
        </div>
      </section>

      {/* Accessibility Features */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Accessibility Features
        </h2>
        <div className="space-y-2">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            All buttons include:
          </p>
          <ul className="text-sm text-neutral-600 dark:text-neutral-400 list-disc list-inside space-y-1">
            <li>Proper focus indicators (try tabbing through)</li>
            <li>Minimum 44px touch targets on mobile devices</li>
            <li>Enhanced focus-visible states for keyboard navigation</li>
            <li>Proper ARIA attributes for screen readers</li>
            <li>Touch feedback animations on touch devices</li>
            <li>High-density display optimization</li>
          </ul>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Tab to focus me</Button>
          <Button variant="secondary">Then tab to me</Button>
          <Button variant="outline">And finally me</Button>
        </div>
      </section>

      {/* Device-Specific Information */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
          Current Device Information
        </h2>
        <div className="bg-neutral-50 dark:bg-neutral-800 p-4 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="font-medium">Width:</span> {width}px
            </div>
            <div>
              <span className="font-medium">Height:</span> {height}px
            </div>
            <div>
              <span className="font-medium">Breakpoint:</span> {isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop'}
            </div>
            <div>
              <span className="font-medium">Orientation:</span> {width > height ? 'landscape' : 'portrait'}
            </div>
            <div>
              <span className="font-medium">Touch Device:</span> {touchDevice ? 'Yes' : 'No'}
            </div>
            <div>
              <span className="font-medium">Mobile:</span> {isMobile ? 'Yes' : 'No'}
            </div>
            <div>
              <span className="font-medium">Tablet:</span> {isTablet ? 'Yes' : 'No'}
            </div>
            <div>
              <span className="font-medium">Desktop:</span> {isDesktop ? 'Yes' : 'No'}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ResponsiveButtonDemo;