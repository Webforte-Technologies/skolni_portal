import React from 'react';
import ResponsiveImageShowcase from '../../components/ui/ResponsiveImageShowcase';

const ResponsiveImageDemo: React.FC = () => {
  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="container mx-auto px-4 py-8">
        <ResponsiveImageShowcase />
      </div>
    </div>
  );
};

export default ResponsiveImageDemo;