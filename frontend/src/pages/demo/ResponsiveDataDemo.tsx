import React from 'react';
import Header from '../../components/layout/Header';
import { ResponsiveDataShowcase } from '../../components/ui/ResponsiveDataShowcase';

/**
 * Demo page showcasing responsive data display functionality
 * This page can be used for testing and demonstrating the responsive data display features
 */
const ResponsiveDataDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Responsive Data Display Demo
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            This page demonstrates the responsive data display components including tables, grids, and charts across different screen sizes.
          </p>
        </div>
        
        <ResponsiveDataShowcase />
      </main>
    </div>
  );
};

export default ResponsiveDataDemo;