import React from 'react';
import { TrendingUp, TrendingDown, Minus, Activity, RefreshCw } from 'lucide-react';
import Card from '../../ui/Card';
import { useRealTimeData } from '../../../hooks/useRealTimeData';
import { cn } from '../../../utils/cn';

export interface MetricValue {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface RealTimeMetric {
  id: string;
  title: string;
  value: MetricValue;
  format?: 'number' | 'currency' | 'percentage' | 'duration';
  currency?: string;
  icon?: React.ReactNode;
  color?: 'green' | 'blue' | 'purple' | 'orange' | 'red';
  description?: string;
}

export interface RealTimeMetricsWidgetProps {
  title: string;
  metrics: RealTimeMetric[];
  endpoint: string;
  refreshInterval?: number;
  showTrend?: boolean;
  showLastUpdated?: boolean;
  className?: string;
  onMetricClick?: (metricId: string) => void;
}

const RealTimeMetricsWidget: React.FC<RealTimeMetricsWidgetProps> = ({
  title,
  metrics,
  endpoint,
  refreshInterval = 30000,
  showTrend = true,
  showLastUpdated = true,
  className = '',
  onMetricClick
}) => {
  const { data, loading, error, refresh, isAutoRefreshing, lastUpdated } = useRealTimeData({
    endpoint,
    refreshInterval,
    autoRefresh: true
  });

  const formatValue = (value: number, format: string, currency?: string): string => {
    switch (format) {
      case 'currency':
        return `${value.toLocaleString()} ${currency || 'Kč'}`;
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'duration':
        const hours = Math.floor(value / 3600);
        const minutes = Math.floor((value % 3600) / 60);
        return `${hours}h ${minutes}m`;
      default:
        return value.toLocaleString();
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      green: 'from-green-50 to-emerald-100',
      blue: 'from-blue-50 to-cyan-100',
      purple: 'from-purple-50 to-violet-100',
      orange: 'from-orange-50 to-amber-100',
      red: 'from-red-50 to-rose-100'
    };
    return colorMap[color as keyof typeof colorMap] || 'from-gray-50 to-gray-100';
  };

  const formatLastUpdated = (lastUpdated: string | Date | null): string => {
    if (!lastUpdated) return '-';
    
    try {
      const date = lastUpdated instanceof Date ? lastUpdated : new Date(lastUpdated);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleTimeString('cs-CZ');
    } catch {
      return '-';
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
      icon={<Activity className="w-5 h-5" />}
    >
      {/* Auto-refresh indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <div className={cn(
          'w-2 h-2 rounded-full',
          isAutoRefreshing ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
        )} />
        <button
          onClick={refresh}
          disabled={loading}
          className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
          title="Obnovit data"
        >
          <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin')} />
        </button>
      </div>

      {/* Last updated timestamp */}
      {showLastUpdated && lastUpdated && (
        <div className="text-xs text-gray-500 mb-4 text-right">
          Poslední aktualizace: {formatLastUpdated(lastUpdated)}
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className={cn(
              'p-4 rounded-lg bg-gradient-to-br cursor-pointer transition-all hover:shadow-md',
              getColorClasses(metric.color || 'blue'),
              onMetricClick && 'hover:scale-105'
            )}
            onClick={() => onMetricClick?.(metric.id)}
          >
            <div className="flex items-center gap-3 mb-2">
              {metric.icon && (
                <div className="p-2 bg-white/50 rounded-lg">
                  {metric.icon}
                </div>
              )}
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-700">{metric.title}</div>
                {metric.description && (
                  <div className="text-xs text-gray-600">{metric.description}</div>
                )}
              </div>
            </div>

            <div className="text-2xl font-bold text-gray-900 mb-2">
              {formatValue(metric.value.current, metric.format || 'number', metric.currency)}
            </div>

            {showTrend && (
              <div className="flex items-center gap-2 text-sm">
                {getTrendIcon(metric.value.trend)}
                <span className={getTrendColor(metric.value.trend)}>
                  {metric.value.changePercent > 0 ? '+' : ''}
                  {metric.value.changePercent.toFixed(1)}%
                </span>
                <span className="text-gray-500">
                  vs předchozí období
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <div className="text-sm text-gray-600">Načítání dat...</div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default RealTimeMetricsWidget;
