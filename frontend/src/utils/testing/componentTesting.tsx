/**
 * Component testing utilities for responsive behavior
 * Provides helpers for testing React components across different viewports
 */

import React from 'react';
import { render } from '@testing-library/react';
import { ResponsiveProvider } from '../../contexts/ResponsiveContext';
import { EnhancedThemeProvider } from '../../contexts/EnhancedThemeContext';
import { AccessibilityProvider } from '../../contexts/AccessibilityContext';

// Helper function to render components with all necessary providers
export const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <ResponsiveProvider>
      <EnhancedThemeProvider>
        <AccessibilityProvider>
          {component}
        </AccessibilityProvider>
      </EnhancedThemeProvider>
    </ResponsiveProvider>
  );
};
