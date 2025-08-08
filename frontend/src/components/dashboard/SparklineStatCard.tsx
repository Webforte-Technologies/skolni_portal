import React from 'react';
import Card from '../ui/Card';
import { Sparklines, SparklinesLine } from 'react-sparklines';

interface SparklineStatCardProps {
  title: string;
  value: string | number;
  data?: number[];
  color?: string; // tailwind color hex or rgb
}

const SparklineStatCard: React.FC<SparklineStatCardProps> = ({ title, value, data = [5, 8, 7, 10, 9, 12, 14, 12, 15, 13], color = '#3b82f6' }) => {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm text-neutral-500 dark:text-neutral-300">{title}</div>
          <div className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">{value}</div>
        </div>
        <div className="h-10 w-24 overflow-hidden">
          <Sparklines data={data} width={96} height={40} margin={4}>
            <SparklinesLine style={{ stroke: color, fill: 'none' }} />
          </Sparklines>
        </div>
      </div>
    </Card>
  );
};

export default SparklineStatCard;


