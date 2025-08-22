import React, { useMemo, useRef } from 'react';
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

// Utility functions moved outside component to prevent recreation
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
  if (!seconds || isNaN(seconds)) return '0m';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

// Generate chart data for metrics
const generateChartData = (metric: PerformanceMetric): ChartDataPoint[] => {
  if (!metric || !metric.history || metric.history.length === 0) {
    // Generate completely stable mock data to prevent unnecessary re-renders
    const mockLabels = ['09:00', '09:01', '09:02', '09:03', '09:04', '09:05', '09:06', '09:07', '09:08', '09:09'];
    return mockLabels.map((label, i) => ({
      label,
      value: (metric?.value || 0) + (i * 0.5), // Use stable increment
      color: getStatusColor(metric?.status || 'healthy')
    }));
  }

  return metric.history.slice(-10).map((point) => ({
    label: new Date(point.timestamp).toLocaleTimeString('cs-CZ', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }),
    value: point.value,
    color: getStatusColor(metric.status)
  }));
};

// Transform backend data structure to frontend expected structure
const transformMetric = (value: number, name: string, unit: string, warningThreshold = 80, criticalThreshold = 95): PerformanceMetric => {
  let status: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (value >= criticalThreshold) status = 'critical';
  else if (value >= warningThreshold) status = 'warning';

  return {
    name,
    value,
    unit,
    threshold: { warning: warningThreshold, critical: criticalThreshold },
    trend: 'stable',
    status,
    history: []
  };
};

const PerformanceMonitorWidget: React.FC<PerformanceMonitorWidgetProps> = ({
  title,
  endpoint,
      refreshInterval = 60000, // Reduced from 10s to 60s to prevent API spam
  showCharts = true,
  showThresholds = true,
  showTrends = true,
  className = '',
  onMetricClick,
  onAlert
}) => {
  const { data, loading, error, refresh, isAutoRefreshing } = useRealTimeData({
    endpoint,
    refreshInterval,
    autoRefresh: true
  });

  // Track sent alerts to prevent duplicates
  const sentAlertsRef = useRef<Set<string>>(new Set());
  const alertTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Process performance data
  const performanceData = useMemo(() => {
    if (!data) return null;

    // Handle the actual backend data structure
    if (data.performance) {
      const perf = data.performance;
      
      // Create metrics
      const cpu = transformMetric(perf.cpu_usage || 0, 'CPU', 'ms', 70, 90);
      const memory = transformMetric(perf.memory_usage || 0, 'Paměť', 'MB', 80, 95);
      const disk = transformMetric(0, 'Disk', 'GB', 80, 95); // Not provided by backend
      const network = transformMetric(0, 'Síť', 'Mbps', 80, 95); // Not provided by backend
      const responseTime = transformMetric(perf.response_time || 0, 'Odezva', 'ms', 100, 500);
      const errorRate = transformMetric(perf.error_rate || 0, 'Chyby', '%', 5, 10);
      
      // Calculate overall status based on critical metrics
      let overallStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (cpu.status === 'critical' || memory.status === 'critical' || errorRate.status === 'critical') {
        overallStatus = 'critical';
      } else if (cpu.status === 'warning' || memory.status === 'warning' || errorRate.status === 'warning') {
        overallStatus = 'warning';
      }
      
      return {
        cpu,
        memory,
        disk,
        network,
        responseTime,
        errorRate,
        uptime: perf.uptime || 0,
        lastCheck: perf.timestamp || data.timestamp || 'N/A',
        overallStatus
      };
    }

    // Fallback for other data structures
    return {
      cpu: transformMetric(0, 'CPU', 'ms'),
      memory: transformMetric(0, 'Paměť', 'MB'),
      disk: transformMetric(0, 'Disk', 'GB'),
      network: transformMetric(0, 'Síť', 'Mbps'),
      responseTime: transformMetric(0, 'Odezva', 'ms'),
      errorRate: transformMetric(0, 'Chyby', '%'),
      uptime: 0,
      lastCheck: data.timestamp || 'N/A',
      overallStatus: 'healthy'
    };
  }, [data]);

  // Memoize chart data to prevent unnecessary recalculations
  const chartData = useMemo(() => {
    if (!performanceData) return { cpuMemory: [], responseError: [] };

    return {
      cpuMemory: [
        ...generateChartData(performanceData.cpu),
        ...generateChartData(performanceData.memory)
      ].filter(Boolean),
      responseError: [
        ...generateChartData(performanceData.responseTime),
        ...generateChartData(performanceData.errorRate)
      ].filter(Boolean)
    };
  }, [performanceData]);

  // Memoize formatted values to prevent unnecessary recalculations
  const formattedValues = useMemo(() => {
    if (!performanceData) return { uptime: '0m', lastCheck: 'N/A' };

    return {
      uptime: formatUptime(performanceData.uptime),
      lastCheck: performanceData.lastCheck && performanceData.lastCheck !== 'N/A' ? new Date(performanceData.lastCheck).toLocaleTimeString() : 'N/A'
    };
  }, [performanceData]);

  // Memoize metrics array to prevent recreation on every render
  const metrics = useMemo(() => [
    { key: 'cpu', icon: <Cpu className="w-5 h-5" />, label: 'CPU' },
    { key: 'memory', icon: <Database className="w-5 h-5" />, label: 'Paměť' },
    { key: 'disk', icon: <HardDrive className="w-5 h-5" />, label: 'Disk' },
    { key: 'network', icon: <Network className="w-5 h-5" />, label: 'Síť' },
    { key: 'responseTime', icon: <Zap className="w-5 h-5" />, label: 'Odezva' },
    { key: 'errorRate', icon: <AlertTriangle className="w-5 h-5" />, label: 'Chyby' }
  ], []);

  // Memoize real chart data to prevent unnecessary recalculations
  const realChartData = useMemo(() => {
    if (!performanceData) return { cpuMemory: [], responseError: [] };

    const cpuMemoryData = performanceData.cpu.history && performanceData.cpu.history.length > 0
      ? performanceData.cpu.history.slice(-10).map((point) => ({
          label: new Date(point.timestamp).toLocaleTimeString('cs-CZ', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          value: point.value,
          color: getStatusColor(performanceData.cpu.status)
        }))
      : [];

    const memoryData = performanceData.memory.history && performanceData.memory.history.length > 0
      ? performanceData.memory.history.slice(-10).map((point) => ({
          label: new Date(point.timestamp).toLocaleTimeString('cs-CZ', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          value: point.value,
          color: getStatusColor(performanceData.memory.status)
        }))
      : [];

    const responseTimeData = performanceData.responseTime.history && performanceData.responseTime.history.length > 0
      ? performanceData.responseTime.history.slice(-10).map((point) => ({
          label: new Date(point.timestamp).toLocaleTimeString('cs-CZ', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          value: point.value,
          color: getStatusColor(performanceData.responseTime.status)
        }))
      : [];

    const errorRateData = performanceData.errorRate.history && performanceData.errorRate.history.length > 0
      ? performanceData.errorRate.history.slice(-10).map((point) => ({
          label: new Date(point.timestamp).toLocaleTimeString('cs-CZ', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          value: point.value,
          color: getStatusColor(performanceData.errorRate.status)
        }))
      : [];

    return {
      cpuMemory: [...cpuMemoryData, ...memoryData],
      responseError: [...responseTimeData, ...errorRateData]
    };
  }, [performanceData]);

  // Check for alerts
  React.useEffect(() => {
    if (performanceData && onAlert) {
      // Only check actual metrics, not the overall status properties
      const metricKeys = ['cpu', 'memory', 'disk', 'network', 'responseTime', 'errorRate'];
      metricKeys.forEach((key) => {
        const metric = performanceData[key as keyof SystemPerformance] as PerformanceMetric;
        if (metric && metric.status === 'critical') {
          const alertKey = `${key}-critical-${metric.value}`;
          if (!sentAlertsRef.current.has(alertKey)) {
            onAlert(`${metric.name} je v kritickém stavu: ${metric.value}${metric.unit}`, 'critical');
            sentAlertsRef.current.add(alertKey);
          }
        } else if (metric && metric.status === 'warning') {
          const alertKey = `${key}-warning-${metric.value}`;
          if (!sentAlertsRef.current.has(alertKey)) {
            onAlert(`${metric.name} je ve varovném stavu: ${metric.value}${metric.unit}`, 'warning');
            sentAlertsRef.current.add(alertKey);
          }
        }
      });

      // Clear old alerts after some time to allow new alerts for the same metric
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
      alertTimeoutRef.current = setTimeout(() => {
        sentAlertsRef.current.clear();
      }, 60000); // Clear after 1 minute
    }

    // Cleanup function
    return () => {
      if (alertTimeoutRef.current) {
        clearTimeout(alertTimeoutRef.current);
      }
    };
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

  return (
    <Card 
      title={title} 
      className={cn('relative', className)}
      icon={<Activity className="w-5 h-5" />}
    >
      {/* Overall Status */}
      <div className={cn(
        'p-4 rounded-lg border mb-6',
        getStatusBgColor(performanceData.overallStatus || 'healthy')
      )}>
        <div className="flex items-center gap-3">
          {getStatusIcon(performanceData.overallStatus || 'healthy')}
          <div>
            <div className="font-semibold">Celkový stav systému</div>
            <div className="text-sm opacity-80">
              Doba běhu: {formattedValues.uptime}
            </div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-sm opacity-80">Poslední kontrola</div>
            <div className="font-medium">
              {formattedValues.lastCheck}
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
                {metric.value?.toFixed(1) || '0.0'}{metric.unit}
              </div>

              {showThresholds && (
                <div className="text-sm opacity-70 mb-2">
                  <div>Varování: {metric.threshold?.warning || 0}{metric.unit}</div>
                  <div>Kritické: {metric.threshold?.critical || 0}{metric.unit}</div>
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
                data={realChartData.cpuMemory.length > 0 ? realChartData.cpuMemory : chartData.cpuMemory}
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
                data={realChartData.responseError.length > 0 ? realChartData.responseError : chartData.responseError}
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
