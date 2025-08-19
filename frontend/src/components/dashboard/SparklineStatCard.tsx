import React from 'react';
import Card from '../ui/Card';
import { useResponsive } from '../../contexts/ResponsiveContext';
import { cn } from '../../utils/cn';

interface SparklineStatCardProps {
  title: string;
  value: string | number;
  data?: number[]; // Kept for backward compatibility but not used
  color?: string; // Kept for backward compatibility but not used
}

const SparklineStatCard: React.FC<SparklineStatCardProps> = ({ title, value }) => {
  const { state } = useResponsive();
  const { isMobile } = state;

  const containerClasses = cn(
    'text-center',
    isMobile ? 'py-2' : 'py-3'
  );

  const titleClasses = cn(
    'text-neutral-500 dark:text-neutral-300',
    isMobile ? 'text-xs' : 'text-sm'
  );

  const valueClasses = cn(
    'font-semibold text-neutral-900 dark:text-neutral-100',
    isMobile ? 'text-xl' : 'text-2xl'
  );

  return (
    <Card mobileLayout={isMobile ? 'compact' : 'expanded'}>
      <div className={containerClasses}>
        <div className={titleClasses}>{title}</div>
        <div className={valueClasses}>{value}</div>
      </div>
    </Card>
  );
};

export default SparklineStatCard;


