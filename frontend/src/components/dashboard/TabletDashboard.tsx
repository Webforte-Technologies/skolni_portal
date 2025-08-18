import React from 'react';
import { useResponsive } from '../../hooks/useViewport';
import { LoadingSkeleton } from '../performance/LoadingSkeleton';

interface TabletDashboardProps {
  className?: string;
}

const TabletDashboard: React.FC<TabletDashboardProps> = ({ className = '' }) => {
  const { isTablet } = useResponsive();

  if (!isTablet) {
    return <LoadingSkeleton variant="dashboard" />;
  }

  return (
    <div className={`p-6 space-y-6 ${className}`}>
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Tablet Dashboard</h1>
        <p className="text-gray-600 mt-1">Optimalizováno pro tablety</p>
      </div>
      
      {/* Tablet-optimized content would go here */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-lg border">
          <h2 className="font-medium text-gray-900">Levý panel</h2>
          <p className="text-sm text-gray-600 mt-1">Tablet verze levého panelu</p>
        </div>
        <div className="p-4 bg-white rounded-lg border">
          <h2 className="font-medium text-gray-900">Pravý panel</h2>
          <p className="text-sm text-gray-600 mt-1">Tablet verze pravého panelu</p>
        </div>
      </div>
    </div>
  );
};

export default TabletDashboard;