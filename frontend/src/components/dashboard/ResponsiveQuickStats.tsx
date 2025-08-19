import React from 'react';
import { useResponsive } from '../../contexts/ResponsiveContext';
import { BarChart3, Activity } from 'lucide-react';
import Card from '../ui/Card';
import SparklineStatCard from './SparklineStatCard';

interface ResponsiveQuickStatsProps {
  creditsBalance: number;
  featuresCount: number;
}

/**
 * Responsive quick statistics component that adapts layout and content based on screen size
 * - Mobile: Stacked layout with compact text
 * - Desktop: Grid layout with full-size elements
 */
const ResponsiveQuickStats: React.FC<ResponsiveQuickStatsProps> = ({
  creditsBalance,
  featuresCount,
}) => {
  const { viewport, state } = useResponsive();
  const { isMobile } = state;

  return (
    <Card 
      title="Rychlé statistiky"
      mobileLayout={isMobile ? "compact" : "expanded"}
      touchActions={viewport.touchDevice}
    >
      <div className="flex items-center mb-4">
        <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-gray-500 dark:text-neutral-400" />
        <h3 className={`font-semibold dark:text-neutral-100 ${isMobile ? 'text-sm' : 'text-lg'}`}>
          Rychlé statistiky
        </h3>
      </div>
      
      <div className="space-y-3 sm:space-y-4">
        {/* Basic Stats */}
        <div className="flex justify-between items-center">
          <span className={`text-gray-500 dark:text-neutral-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Dostupné kredity
          </span>
          <span className={`px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 rounded ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {creditsBalance}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className={`text-gray-500 dark:text-neutral-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Dostupné asistenty
          </span>
          <span className={`px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded ${isMobile ? 'text-xs' : 'text-sm'}`}>
            {featuresCount}
          </span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className={`text-gray-500 dark:text-neutral-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>
            Status účtu
          </span>
          <span className={`px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300 rounded flex items-center ${isMobile ? 'text-xs' : 'text-sm'}`}>
            <Activity className="h-3 w-3 mr-1" />
            Aktivní
          </span>
        </div>
        
        {/* Sparkline Cards - Responsive Layout */}
        <div className={`pt-2 ${
          isMobile 
            ? 'space-y-2' 
            : 'grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-stretch'
        }`}>
          <SparklineStatCard 
            title="Týdenní aktivita" 
            value={42} 
          />
          <SparklineStatCard 
            title="Počet zpráv" 
            value={128} 
            color="#10b981" 
          />
          <SparklineStatCard 
            title="Vytvořená cvičení" 
            value={8} 
            color="#a78bfa" 
          />
        </div>
      </div>
    </Card>
  );
};

export default ResponsiveQuickStats;