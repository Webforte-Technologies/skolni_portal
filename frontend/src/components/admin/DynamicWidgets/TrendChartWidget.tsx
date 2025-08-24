import React, { useState, useMemo } from 'react';
import { TrendingUp, Calendar, RefreshCw, Download } from 'lucide-react';
import Card from '../../ui/Card';
import { ResponsiveChart, ChartDataPoint } from '../../ui/ResponsiveChart';
import { useRealTimeData } from '../../../hooks/useRealTimeData';
import { cn } from '../../../utils/cn';
import Button from '../../ui/Button';

export interface TrendDataPoint {
  timestamp: string;
  value: number;
  label: string;
}

export interface TrendChartWidgetProps {
  title: string;
  endpoint: string;
  refreshInterval?: number;
  chartType?: 'line' | 'bar';
  timeRange?: '1h' | '6h' | '24h' | '7d' | '30d';
  showControls?: boolean;
  showDownload?: boolean;
  height?: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  className?: string;
  onDataPointClick?: (dataPoint: TrendDataPoint) => void;
  transformData?: (rawData: any) => TrendDataPoint[];
}

const TrendChartWidget: React.FC<TrendChartWidgetProps> = ({
  title,
  endpoint,
      refreshInterval = 180000, // Reduced from 30s to 180s to prevent API spam
  chartType = 'line',
  timeRange = '24h',
  showControls = true,
  showDownload = true,
  height = { mobile: 200, tablet: 300, desktop: 400 },
  className = '',
  onDataPointClick,
  transformData
}) => {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [selectedChartType, setSelectedChartType] = useState(chartType);

  const { data, loading, error, refresh, isAutoRefreshing, lastUpdated } = useRealTimeData({
    endpoint: endpoint,
    refreshInterval,
    autoRefresh: true,
    dependencies: [selectedTimeRange] // Pass timeRange as dependency instead of modifying endpoint
  });

  // Transform data for chart
  const chartData: ChartDataPoint[] = useMemo(() => {
    if (!data) return [];

    let transformedData: TrendDataPoint[];
    if (transformData) {
      transformedData = transformData(data);
    } else {
      // Default transformation
      transformedData = Array.isArray(data) ? data : data?.data || [];
    }

    return transformedData.map((point, index) => ({
      label: point.label,
      value: point.value,
      color: `hsl(${(index * 137.5) % 360}, 70%, 50%)` // Generate distinct colors
    }));
  }, [data, transformData]);

  const timeRangeOptions = [
    { value: '1h', label: '1 hodina' },
    { value: '6h', label: '6 hodin' },
    { value: '24h', label: '24 hodin' },
    { value: '7d', label: '7 dní' },
    { value: '30d', label: '30 dní' }
  ];

  const chartTypeOptions = [
    { value: 'line', label: 'Čára' },
    { value: 'bar', label: 'Sloupce' }
  ];

  const handleDownload = () => {
    if (!data) return;

    const csvContent = [
      'Timestamp,Value,Label',
      ...chartData.map(point => {
        const timestamp = point.timestamp || new Date().toISOString();
        const escapedLabel = point.label.includes(',') ? `"${point.label.replace(/"/g, '""')}"` : point.label;
        const escapedValue = point.value.toString().includes(',') ? `"${point.value.toString().replace(/"/g, '""')}"` : point.value.toString();
        return `${timestamp},${escapedValue},${escapedLabel}`;
      })
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${title.toLowerCase().replace(/\s+/g, '_')}_${selectedTimeRange}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDataPointClick = (index: number) => {
    if (onDataPointClick && data) {
      let transformedData: TrendDataPoint[];
      if (transformData) {
        transformedData = transformData(data);
      } else {
        transformedData = Array.isArray(data) ? data : data?.data || [];
      }
      
      if (transformedData[index]) {
        onDataPointClick(transformedData[index]);
      }
    }
  };

  if (error) {
    return (
      <Card title={title} className={cn('bg-red-50 border-red-200', className)}>
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">Chyba při načítání dat</div>
          <button
            onClick={refresh}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors"
          >
            Zkusit znovu
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card 
      title={title} 
      className={cn('relative', className)}
      icon={<TrendingUp className="w-5 h-5" />}
    >
      {/* Controls */}
      {showControls && (
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={selectedTimeRange}
              onChange={(e) => setSelectedTimeRange(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {timeRangeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-500" />
            <select
              value={selectedChartType}
              onChange={(e) => setSelectedChartType(e.target.value as any)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {chartTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Auto-refresh indicator */}
          <div className="flex items-center gap-2">
            <div className={cn(
              'w-2 h-2 rounded-full',
              isAutoRefreshing ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            )} />
            <span className="text-xs text-gray-500">
              {isAutoRefreshing ? 'Auto-aktualizace' : 'Manuální'}
            </span>
          </div>

          {/* Last updated */}
          {lastUpdated && (
            <div className="text-xs text-gray-500">
              Poslední aktualizace: {lastUpdated.toLocaleTimeString()}
            </div>
          )}
        </div>
      )}

      {/* Chart */}
      <div className="relative">
        <ResponsiveChart
          data={chartData}
          type={selectedChartType}
          height={height}
          showLegend={true}
          showValues={false}
          emptyMessage="Žádná data k zobrazení"
          className="cursor-pointer"
          onClick={handleDataPointClick}
        />

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
              <div className="text-sm text-gray-600">Načítání dat...</div>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <Button
            onClick={refresh}
            variant="secondary"
            size="sm"
            disabled={loading}
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
            Obnovit
          </Button>
        </div>

        {showDownload && (
          <Button
            onClick={handleDownload}
            variant="outline"
            size="sm"
            disabled={!data || chartData.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Stáhnout CSV
          </Button>
        )}
      </div>

      {/* Data summary */}
      {chartData.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Počet bodů</div>
              <div className="font-semibold">{chartData.length}</div>
            </div>
            <div>
              <div className="text-gray-500">Průměr</div>
              <div className="font-semibold">
                {(chartData.reduce((sum, point) => sum + point.value, 0) / chartData.length).toFixed(1)}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Maximum</div>
              <div className="font-semibold">
                {Math.max(...chartData.map(point => point.value))}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Minimum</div>
              <div className="font-semibold">
                {Math.min(...chartData.map(point => point.value))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TrendChartWidget;
