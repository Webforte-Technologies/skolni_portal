import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import LineChart from '../charts/LineChart';
import { api, errorToMessage } from '../../services/apiClient';

interface ChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    borderColor: string;
    backgroundColor: string;
    fill: boolean;
  }>;
}

interface AnalyticsChartProps {
  type: 'user-growth' | 'credit-usage';
  title: string;
  icon: React.ReactNode;
  timeRange: '7d' | '30d' | '90d' | '1y';
  className?: string;
}

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({
  type,
  title,
  icon,
  timeRange,
  className = ''
}) => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [granularity, setGranularity] = useState<'daily' | 'weekly'>('daily');

  useEffect(() => {
    const fetchChartData = async () => {
      setLoading(true);
      setError(null);

      try {
        const endpoint = type === 'user-growth' 
          ? '/admin/analytics/user-growth-chart'
          : '/admin/analytics/credit-usage-chart';
        
        const response = await api.get<ChartData>(
          `${endpoint}?timeRange=${timeRange}&granularity=${granularity}`
        );

        if (response.data.success && response.data.data) {
          setChartData(response.data.data);
        } else {
          setError(response.data.error || 'Nepodařilo se načíst data grafu');
        }
      } catch (err) {
        console.error(`Failed to fetch ${type} chart data:`, err);
        setError(errorToMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [type, timeRange, granularity]);

  const handleGranularityChange = (newGranularity: 'daily' | 'weekly') => {
    if (newGranularity !== granularity) {
      setGranularity(newGranularity);
    }
  };

  return (
    <Card className={`p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => handleGranularityChange('daily')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                granularity === 'daily'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Denně
            </button>
            <button
              onClick={() => handleGranularityChange('weekly')}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                granularity === 'weekly'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Týdně
            </button>
          </div>
        </div>
      </div>

      <LineChart
        data={chartData || { labels: [], datasets: [] }}
        height={300}
        loading={loading}
        error={error || undefined}
      />

      {chartData && !loading && !error && (
        <div className="mt-4 text-sm text-gray-600">
          <div className="flex items-center justify-between">
            <span>
              Zobrazuje data za {timeRange === '7d' ? 'posledních 7 dní' : 
                               timeRange === '30d' ? 'posledních 30 dní' : 
                               timeRange === '90d' ? 'posledních 90 dní' : 
                               'poslední rok'}
            </span>
            <span>
              Granularita: {granularity === 'daily' ? 'denní' : 'týdenní'}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AnalyticsChart;
