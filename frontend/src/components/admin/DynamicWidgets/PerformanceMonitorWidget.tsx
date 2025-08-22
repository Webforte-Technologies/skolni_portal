import React, { useState, useMemo } from 'react';
import { Activity, Cpu, HardDrive, Network, Zap, AlertTriangle, CheckCircle, Clock, TrendingUp, Database } from 'lucide-react';
import Card from '../../ui/Card';
import { useRealTimeData } from '../../../hooks/useRealTimeData';
import { cn } from '../../../utils/cn';
import { ResponsiveChart, ChartDataPoint } from '../../ui/ResponsiveChart';

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  threshold: {
    warning: number;
    critical: number;
  };
  trend: 'up' | 'down' | 'stable';
  status: 'healthy' | 'warning' | 'critical';
  history: Array<{ timestamp: string; value: number }>;
}

export interface SystemPerformance {
  cpu: PerformanceMetric;
  memory: PerformanceMetric;
  disk: PerformanceMetric;
  network: PerformanceMetric;
  responseTime: PerformanceMetric;
  errorRate: PerformanceMetric;
  uptime: number;
  lastCheck: string;
  overallStatus: 'healthy' | 'warning' | 'critical';
}

export interface PerformanceMonitorWidgetProps {
  title: string;
  endpoint: string;
  refreshInterval?: number;
  showCharts?: boolean;
  showThresholds?: boolean;
  showTrends?: boolean;
  className?: string;
  onMetricClick?: (metric: PerformanceMetric) => void;
  onAlert?: (message: string, severity: 'warning' | 'critical') => void;
}

const PerformanceMonitorWidget: React.FC<PerformanceMonitorWidgetProps> = ({
  title,
  endpoint,
  refreshInterval = 10000, // Very frequent updates for performance monitoring
  showCharts = true,
  showThresholds = true,
  showTrends = true,
  className = '',
  onMetricClick,
  onAlert
}) => {
  const { data, loading, error, refresh, isAutoRefreshing, lastUpdated } = useRealTimeData({
    endpoint,
    refreshInterval,
    autoRefresh: true
  });

  // Process performance data
  const performanceData = useMemo(() => {
    if (!data) return null;

    const rawData = Array.isArray(data) ? data : data?.performance || data;
    
    // Transform raw data to our interface
    const transformMetric = (rawMetric: any): PerformanceMetric => {
      const value = rawMetric.value || 0;
      const warning = rawMetric.threshold?.warning || 80;
      const critical = rawMetric.threshold?.critical || 95;
      
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (value >= critical) status = 'critical';
      else if (value >= warning) status = 'warning';

      return {
        name: rawMetric.name || 'Unknown',
        value,
        unit: rawMetric.unit || '',
        threshold: { warning, critical },
        trend: rawMetric.trend || 'stable',
        status,
        history: rawMetric.history || []
      };
    };

    return {
      cpu: transformMetric(rawData.cpu),
      memory: transformMetric(rawData.memory),
      disk: transformMetric(rawData.disk),
      network: transformMetric(rawData.network),
      responseTime: transformMetric(rawData.responseTime),
      errorRate: transformMetric(rawData.errorRate),
      uptime: rawData.uptime || 0,
      lastCheck: rawData.lastCheck || new Date().toISOString(),
      overallStatus: rawData.overallStatus || 'healthy'
    };
  }, [data]);

  // Generate chart data for metrics
  const generateChartData = (metric: PerformanceMetric): ChartDataPoint[] => {
    if (!metric.history || metric.history.length === 0) {
      // Generate mock data if no history
      const now = new Date();
      return Array.from({ length: 10 }, (_, i) => ({
        label: new Date(now.getTime() - (9 - i) * 60000).toLocaleTimeString('cs-CZ', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        value: metric.value + (Math.random() - 0.5) * 10,
        color: getStatusColor(metric.status)
      }));
    }

    return metric.history.slice(-10).map((point, index) => ({
      label: new Date(point.timestamp).toLocaleTimeString('cs-CZ', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      value: point.value,
      color: getStatusColor(metric.status)
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return '#EF4444';
      case 'warning':
        return '#F59E0B';
      case 'healthy':
        return '#10B981';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'healthy':
        return 'bg-green-50 border-green-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'down':
        return <TrendingUp className="w-4 h-4 text-green-600 transform rotate-180" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  // Check for alerts
  React.useEffect(() => {
    if (performanceData && onAlert) {
      Object.values(performanceData).forEach((metric: any) => {
        if (metric.status === 'critical') {
          onAlert(`${metric.name} je v kritickém stavu: ${metric.value}${metric.unit}`, 'critical');
        } else if (metric.status === 'warning') {
          onAlert(`${metric.name} je ve varovném stavu: ${metric.value}${metric.unit}`, 'warning');
        }
      });
    }
  }, [performanceData, onAlert]);

  if (error) {
    return (
      <Card title={title} className={cn('bg-red-50 border-red-200', className)}>
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">Chyba při načítání výkonnostních dat</div>
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

  if (!performanceData) {
    return (
      <Card title={title} className={className}>
        <div className="text-center py-8 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>Čekám na data...</p>
        </div>
      </Card>
    );
  }

  const metrics = [
    { key: 'cpu', icon: <Cpu className="w-5 h-5" />, label: 'CPU' },
    { key: 'memory', icon: <Database className="w-5 h-5" />, label: 'Paměť' },
    { key: 'disk', icon: <HardDrive className="w-5 h-5" />, label: 'Disk' },
    { key: 'network', icon: <Network className="w-5 h-5" />, label: 'Síť' },
    { key: 'responseTime', icon: <Zap className="w-5 h-5" />, label: 'Odezva' },
    { key: 'errorRate', icon: <AlertTriangle className="w-5 h-5" />, label: 'Chyby' }
  ];

  return (
    <Card 
      title={title} 
      className={cn('relative', className)}
      icon={<Activity className="w-5 h-5" />}
    >
      {/* Overall Status */}
      <div className={cn(
        'p-4 rounded-lg border mb-6',
        getStatusBgColor(performanceData.overallStatus)
      )}>
        <div className="flex items-center gap-3">
          {getStatusIcon(performanceData.overallStatus)}
          <div>
            <div className="font-semibold">Celkový stav systému</div>
            <div className="text-sm opacity-80">
              Doba běhu: {formatUptime(performanceData.uptime)}
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-sm opacity-80">Poslední kontrola</div>
            <div className="font-medium">
              {new Date(performanceData.lastCheck).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {metrics.map(({ key, icon, label }) => {
          const metric = performanceData[key as keyof SystemPerformance] as PerformanceMetric;
          if (!metric) return null;

          return (
            <div
              key={key}
              className={cn(
                'p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md',
                getStatusBgColor(metric.status),
                onMetricClick && 'hover:scale-105'
              )}
              onClick={() => onMetricClick?.(metric)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/50 rounded-lg">
                  {icon}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{label}</div>
                  <div className="text-sm opacity-80">{metric.name}</div>
                </div>
                {getStatusIcon(metric.status)}
              </div>

              <div className="text-2xl font-bold mb-2">
                {metric.value.toFixed(1)}{metric.unit}
              </div>

              {showThresholds && (
                <div className="text-sm opacity-70 mb-2">
                  <div>Varování: {metric.threshold.warning}{metric.unit}</div>
                  <div>Kritické: {metric.threshold.critical}{metric.unit}</div>
                </div>
              )}

              {showTrends && (
                <div className="flex items-center gap-2 text-sm">
                  {getTrendIcon(metric.trend)}
                  <span className="opacity-70">
                    {metric.trend === 'up' ? 'Roste' : 
                     metric.trend === 'down' ? 'Klesá' : 'Stabilní'}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Performance Charts */}
      {showCharts && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Výkonnostní trendy</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CPU & Memory Chart */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">CPU & Paměť</h4>
              <ResponsiveChart
                data={[
                  ...generateChartData(performanceData.cpu),
                  ...generateChartData(performanceData.memory)
                ]}
                type="line"
                height={{ mobile: 200, tablet: 250, desktop: 300 }}
                showLegend={true}
                showValues={false}
                emptyMessage="Žádná data k zobrazení"
              />
            </div>

            {/* Response Time & Error Rate Chart */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">Odezva & Chyby</h4>
              <ResponsiveChart
                data={[
                  ...generateChartData(performanceData.responseTime),
                  ...generateChartData(performanceData.errorRate)
                ]}
                type="line"
                height={{ mobile: 200, tablet: 250, desktop: 300 }}
                showLegend={true}
                showValues={false}
                emptyMessage="Žádná data k zobrazení"
              />
            </div>
          </div>
        </div>
      )}

      {/* Auto-refresh indicator */}
      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <div className={cn(
            'w-2 h-2 rounded-full',
            isAutoRefreshing ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
          )} />
          {isAutoRefreshing ? 'Auto-aktualizace každých 10s' : 'Manuální aktualizace'}
        </div>
        
        <button
          onClick={refresh}
          disabled={loading}
          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors disabled:opacity-50"
        >
          Obnovit
        </button>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <div className="text-sm text-gray-600">Kontrola výkonnosti...</div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default PerformanceMonitorWidget;
