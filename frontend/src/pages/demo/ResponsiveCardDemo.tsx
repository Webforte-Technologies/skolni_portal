import React from 'react';
import Header from '../../components/layout/Header';
import ResponsiveCardShowcase from '../../components/ui/ResponsiveCardShowcase';

/**
 * Demo page showcasing responsive card functionality
 * This page can be used for testing and demonstrating the responsive card features
 */
const ResponsiveCardDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
            Responsive Card Demo
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            This page demonstrates the responsive card components and their various features across different screen sizes.
          </p>
        </div>
        
        <ResponsiveCardShowcase />
      </main>
    </div>
  );
};

export default ResponsiveCardDemo;