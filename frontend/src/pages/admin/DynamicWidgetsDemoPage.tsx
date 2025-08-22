import React from 'react';
import { Users, CreditCard, TrendingUp, Activity } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import {
  RealTimeMetricsWidget,
  TrendChartWidget,
  AlertPanelWidget,
  PerformanceMonitorWidget
} from '../../components/admin/DynamicWidgets';

const DynamicWidgetsDemoPage: React.FC = () => {
  // Sample data for demonstration
  const sampleMetrics = [
    {
      id: 'active-users',
      title: 'Aktivní uživatelé',
      value: {
        current: 284,
        previous: 265,
        change: 19,
        changePercent: 7.2,
        trend: 'up' as const
      },
      format: 'number' as const,
      icon: <Users className="w-5 h-5" />,
      color: 'green' as const
    },
    {
      id: 'credits-usage',
      title: 'Využití kreditů',
      value: {
        current: 15420,
        previous: 13850,
        change: 1570,
        changePercent: 11.3,
        trend: 'up' as const
      },
      format: 'number' as const,
      icon: <CreditCard className="w-5 h-5" />,
      color: 'purple' as const
    },
    {
      id: 'revenue',
      title: 'Příjmy dnes',
      value: {
        current: 2840,
        previous: 2410,
        change: 430,
        changePercent: 17.8,
        trend: 'up' as const
      },
      format: 'currency' as const,
      currency: 'Kč',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'orange' as const
    },
    {
      id: 'response-time',
      title: 'Odezva API',
      value: {
        current: 245,
        previous: 312,
        change: -67,
        changePercent: -21.5,
        trend: 'down' as const
      },
      format: 'duration' as const,
      icon: <Activity className="w-5 h-5" />,
      color: 'blue' as const
    }
  ];

  const samplePerformanceData = {
    cpu: {
      name: 'CPU Utilization',
      value: 67,
      unit: '%',
      threshold: { warning: 80, critical: 95 },
      trend: 'up' as const,
      status: 'healthy',
      history: []
    },
    memory: {
      name: 'Memory Usage',
      value: 78,
      unit: '%',
      threshold: { warning: 85, critical: 95 },
      trend: 'stable' as const,
      status: 'healthy',
      history: []
    },
    disk: {
      name: 'Disk Space',
      value: 45,
      unit: '%',
      threshold: { warning: 80, critical: 90 },
      trend: 'down' as const,
      status: 'healthy',
      history: []
    },
    network: {
      name: 'Network I/O',
      value: 23,
      unit: 'MB/s',
      threshold: { warning: 50, critical: 80 },
      trend: 'stable' as const,
      status: 'healthy',
      history: []
    },
    responseTime: {
      name: 'API Response Time',
      value: 245,
      unit: 'ms',
      threshold: { warning: 1000, critical: 2000 },
      trend: 'down' as const,
      status: 'healthy',
      history: []
    },
    errorRate: {
      name: 'Error Rate',
      value: 0.8,
      unit: '%',
      threshold: { warning: 2, critical: 5 },
      trend: 'down' as const,
      status: 'healthy',
      history: []
    },
    uptime: 86400 * 7 + 3600 * 12, // 7 days 12 hours
    lastCheck: new Date().toISOString(),
    overallStatus: 'healthy'
  };

  const handleMetricClick = (metricId: string) => {
    console.log('Metric clicked:', metricId);
    // In real app, navigate to detailed view
  };

  const handleAlertClick = (alert: any) => {
    console.log('Alert clicked:', alert);
    // In real app, show alert details
  };

  const handleAlertAcknowledge = (alertId: string) => {
    console.log('Acknowledging alert:', alertId);
    // In real app, make API call
  };

  const handleAlertResolve = (alertId: string) => {
    console.log('Resolving alert:', alertId);
    // In real app, make API call
  };

  const handlePerformanceAlert = (message: string, severity: 'warning' | 'critical') => {
    console.log('Performance alert:', message, severity);
    // In real app, show toast notification
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Page Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dynamic Widgets Demo</h1>
          <p className="text-gray-600 mt-2">
            Ukázka všech dynamických widgetů s reálnými daty
          </p>
        </div>

        {/* Real-time Metrics Widget */}
        <RealTimeMetricsWidget
          title="Real-time Metriky (Demo)"
          endpoint="/admin/analytics/dashboard/real-time"
          refreshInterval={30000}
          showTrend={true}
          showLastUpdated={true}
          metrics={sampleMetrics}
          onMetricClick={handleMetricClick}
        />

        {/* Performance Monitor Widget */}
        <PerformanceMonitorWidget
          title="Monitorování výkonnosti (Demo)"
          endpoint="/admin/analytics/system/performance"
          refreshInterval={10000}
          showCharts={true}
          showThresholds={true}
          showTrends={true}
          onMetricClick={(metric) => console.log('Performance metric:', metric)}
          onAlert={handlePerformanceAlert}
        />

        {/* Alert Panel Widget */}
        <AlertPanelWidget
          title="Systémová upozornění (Demo)"
          endpoint="/admin/analytics/alerts"
          refreshInterval={15000}
          maxAlerts={10}
          showFilters={true}
          showActions={true}
          onAlertClick={handleAlertClick}
          onAcknowledge={handleAlertAcknowledge}
          onResolve={handleAlertResolve}
        />

        {/* Trend Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Growth Chart */}
          <TrendChartWidget
            title="Růst uživatelů (Demo)"
            endpoint="/admin/analytics/users/real-time"
            refreshInterval={60000}
            chartType="line"
            timeRange="30d"
            showControls={true}
            showDownload={true}
            height={{ mobile: 250, tablet: 300, desktop: 350 }}
            transformData={(rawData) => {
              // Generate sample data for demo
              const now = new Date();
              return Array.from({ length: 30 }, (_, i) => ({
                timestamp: new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
                value: 200 + Math.floor(Math.random() * 100) + i * 3,
                label: new Date(now.getTime() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('cs-CZ')
              }));
            }}
            onDataPointClick={(dataPoint) => console.log('User growth point:', dataPoint)}
          />

          {/* Credit Usage Chart */}
          <TrendChartWidget
            title="Využití kreditů (Demo)"
            endpoint="/admin/analytics/credits/real-time"
            refreshInterval={60000}
            chartType="bar"
            timeRange="7d"
            showControls={true}
            showDownload={true}
            height={{ mobile: 250, tablet: 300, desktop: 350 }}
            transformData={(rawData) => {
              // Generate sample data for demo
              const now = new Date();
              return Array.from({ length: 7 }, (_, i) => ({
                timestamp: new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000).toISOString(),
                value: 1000 + Math.floor(Math.random() * 2000) + i * 500,
                label: new Date(now.getTime() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString('cs-CZ', { weekday: 'short' })
              }));
            }}
            onDataPointClick={(dataPoint) => console.log('Credit usage point:', dataPoint)}
          />
        </div>

        {/* Widget Information */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            Informace o dynamických widgetech
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">Real-time Metriky</h4>
              <ul className="space-y-1">
                <li>• Automatické obnovování každých 30s</li>
                <li>• Zobrazení trendů a změn</li>
                <li>• Interaktivní klikání na metriky</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Monitorování výkonnosti</h4>
              <ul className="space-y-1">
                <li>• Kontrola každých 10s</li>
                <li>• Automatické upozornění při překročení limitů</li>
                <li>• Grafy trendů v reálném čase</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Systémová upozornění</h4>
              <ul className="space-y-1">
                <li>• Kontrola každých 15s</li>
                <li>• Filtrování podle závažnosti</li>
                <li>• Možnost potvrdit a vyřešit</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Trendové grafy</h4>
              <ul className="space-y-1">
                <li>• Výběr časového rozsahu</li>
                <li>• Přepínání typu grafu</li>
                <li>• Export dat do CSV</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DynamicWidgetsDemoPage;
