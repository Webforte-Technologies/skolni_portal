import React from 'react';
import { useResponsive } from '../../hooks/useViewport';
import { LoadingSkeleton } from '../performance/LoadingSkeleton';

interface MobileDashboardProps {
  className?: string;
}

const MobileDashboard: React.FC<MobileDashboardProps> = ({ className = '' }) => {
  const { isMobile } = useResponsive();

  if (!isMobile) {
    return <LoadingSkeleton variant="dashboard" />;
  }

  return (
    <div className={`p-4 space-y-4 ${className}`}>
      <div className="text-center">
        <h1 className="text-xl font-bold text-gray-900">Mobilní Dashboard</h1>
        <p className="text-sm text-gray-600 mt-1">Optimalizováno pro mobilní zařízení</p>
      </div>
      
      {/* Mobile-optimized content would go here */}
      <div className="grid grid-cols-1 gap-4">
        <div className="p-4 bg-white rounded-lg border">
          <h2 className="font-medium text-gray-900">Rychlé akce</h2>
          <p className="text-sm text-gray-600 mt-1">Mobilní verze rychlých akcí</p>
        </div>
      </div>
    </div>
  );
};

export default MobileDashboard;