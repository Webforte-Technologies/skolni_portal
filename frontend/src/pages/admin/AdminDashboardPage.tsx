import React, { useEffect, useState, useCallback } from 'react';
import { 
  Users, CreditCard, Activity, TrendingUp, 
  AlertTriangle, CheckCircle, Server, Database, Zap, Bell, BarChart3
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';

import {
  RealTimeMetricsWidget,
  TrendChartWidget,
  AlertPanelWidget,
  PerformanceMonitorWidget
} from '../../components/admin/DynamicWidgets';
import ErrorBoundary from '../../components/ui/ErrorBoundary';

interface SystemHealth {
  status: string;
  db: { ok: boolean; roundtrip_ms: number };
  process: { uptime_s: number; node: string; memory: any };
}

interface SystemMetrics {
  total_requests: number;
  avg_response_ms: number;
  error_count_by_status: Record<string, number>;
}

interface CreditAnalytics {
  totals: { balance: number; purchased: number; used: number };
  monthly: { usage: any[]; purchases: any[] };
}

interface QuickAction {
  id: string;
  title: string;
  description: string;
  action: () => void;
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
}

const AdminDashboardPage: React.FC = () => {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [credits, setCredits] = useState<CreditAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [criticalAlerts, setCriticalAlerts] = useState<any[]>([]);
  const { showToast } = useToast();

  // Memoize callback functions to prevent infinite re-renders
  const handleMetricClick = useCallback((metric: any) => {
    // Show detailed performance view
    console.log('Metric clicked:', metric);
    // TODO: Implement detailed performance view
  }, []);

  const handleAlert = useCallback((message: string, severity: 'warning' | 'critical') => {
    showToast({ 
      type: severity === 'critical' ? 'error' : 'warning', 
      message 
    });
  }, [showToast]);

  const handleRealTimeMetricClick = useCallback((metricId: string) => {
    // Navigate to detailed view or show modal
    console.log('Real-time metric clicked:', metricId);
    // TODO: Implement navigation to detailed view
  }, []);

  // Removed duplicate useRealTimeData calls to prevent API spam
  // The widgets handle their own data fetching now
  // TODO: Consider implementing a shared analytics context to reduce multiple API calls
  // and implement smart caching for better performance

  // Quick Actions
  const quickActions: QuickAction[] = [
    {
      id: 'system-backup',
      title: 'Záloha systému',
      description: 'Spustit manuální zálohu databáze',
      action: async () => {
        try {
          await api.post('/admin/system/backup');
          showToast({ type: 'success', message: 'Záloha byla spuštěna úspěšně' });
        } catch (error) {
          showToast({ type: 'error', message: 'Chyba při spouštění zálohy' });
        }
      },
      icon: <Database className="w-5 h-5" />,
      variant: 'primary'
    },
    {
      id: 'clear-cache',
      title: 'Vymazat cache',
      description: 'Vymazat aplikační cache pro lepší výkon',
      action: async () => {
        try {
          await api.post('/admin/system/clear-cache');
          showToast({ type: 'success', message: 'Cache byla vymazána' });
        } catch (error) {
          showToast({ type: 'error', message: 'Chyba při mazání cache' });
        }
      },
      icon: <Zap className="w-5 h-5" />,
      variant: 'secondary'
    },
    {
      id: 'restart-services',
      title: 'Restart služeb',
      description: 'Restartovat aplikační služby',
      action: async () => {
        if (confirm('Opravdu chcete restartovat služby? Může to způsobit krátký výpadek.')) {
          try {
            await api.post('/admin/system/restart');
            showToast({ type: 'success', message: 'Služby byly restartovány' });
          } catch (error) {
            showToast({ type: 'error', message: 'Chyba při restartu služeb' });
          }
        }
      },
      icon: <Server className="w-5 h-5" />,
      variant: 'danger'
    }
  ];

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [healthRes, metricsRes, creditsRes] = await Promise.all([
        api.get<any>('/admin/system/health'),
        api.get<any>('/admin/system/metrics'),
        api.get<any>('/admin/credits/analytics')
      ]);

      setHealth(healthRes.data.data);
      setMetrics(metricsRes.data.data);
      setCredits(creditsRes.data.data);

      // Simulate critical alerts (in real app, this would come from monitoring)
      const alerts = [];
      if (healthRes.data.data?.status !== 'OK') {
        alerts.push({
          id: 'system-health',
          type: 'error',
          message: 'Systém není v pořádku',
          timestamp: new Date().toISOString()
        });
      }
      if (metricsRes.data.data?.avg_response_ms > 1000) {
        alerts.push({
          id: 'slow-response',
          type: 'warning',
          message: 'Pomalé odezvy API',
          timestamp: new Date().toISOString()
        });
      }
      setCriticalAlerts(alerts);

    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      showToast({ type: 'error', message: 'Chyba při načítání dashboard dat' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 5 minutes instead of 30 seconds to reduce API spam
    const interval = setInterval(fetchDashboardData, 300000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const systemStatusColor = health?.status === 'OK' ? 'text-green-600' : 'text-red-600';
  const systemStatusIcon = health?.status === 'OK' ? 
    <CheckCircle className="w-6 h-6" /> : 
    <AlertTriangle className="w-6 h-6" />;

  const activeUsers = metrics?.total_requests ? Math.floor(metrics.total_requests / 100) : 0;
  const newUsersToday = 12; // This would come from analytics endpoint
  const creditsUsedToday = credits?.totals?.used || 0;
  const revenueToday = 2840; // This would come from revenue analytics

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mission Control</h1>
            <p className="text-gray-600 mt-1">Přehled systému a klíčové metriky</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Auto-refresh Status */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Real-time aktualizace</span>
            </div>
            
            {/* Refresh Controls */}
            <Button onClick={fetchDashboardData} variant="secondary">
              <Activity className="w-4 h-4 mr-2" />
              Obnovit vše
            </Button>
          </div>
        </div>

        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h3 className="font-semibold text-red-800">Kritická upozornění</h3>
          </div>
          <div className="space-y-2">
            {criticalAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between">
                <span className="text-red-700">{alert.message}</span>
                <span className="text-xs text-red-600">
                  {new Date(alert.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* System Status Card */}
        <Card title="Stav systému" icon={<Activity className="w-5 h-5" />} className="bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="flex items-center justify-between">
          <div>
            <div className={`text-3xl font-bold ${systemStatusColor} flex items-center gap-3 mt-2`}>
              {systemStatusIcon}
              {health?.status === 'OK' ? 'V pořádku' : 'Problém'}
            </div>
            <div className="text-sm text-blue-700 mt-2">
              Poslední kontrola: {new Date().toLocaleTimeString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-blue-700">Doba běhu</div>
            <div className="text-2xl font-semibold text-blue-900">
              {Math.floor((health?.process?.uptime_s || 0) / 3600)}h {Math.floor(((health?.process?.uptime_s || 0) % 3600) / 60)}m
            </div>
            <div className="text-xs text-blue-600 mt-1">
              Node.js {health?.process?.node}
            </div>
          </div>
        </div>
        </Card>

        {/* KPI Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-green-700">Aktivní uživatelé</div>
                <div className="text-2xl font-bold text-green-900">{activeUsers}</div>
                <div className="text-xs text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  +{newUsersToday} dnes
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <CreditCard className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <div className="text-sm text-purple-700">Kredity použité dnes</div>
              <div className="text-2xl font-bold text-purple-900">
                {creditsUsedToday.toLocaleString()}
              </div>
              <div className="text-xs text-purple-600">
                z {credits?.totals?.balance?.toLocaleString()} celkem
              </div>
            </div>
          </div>
        </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <div className="text-sm text-orange-700">Příjmy dnes</div>
              <div className="text-2xl font-bold text-orange-900">
                {revenueToday.toLocaleString()} Kč
              </div>
              <div className="text-xs text-orange-600 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +15% vs včera
              </div>
            </div>
          </div>
        </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-100">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <div className="text-sm text-blue-700">Průměrná odezva</div>
              <div className="text-2xl font-bold text-blue-900">
                {metrics?.avg_response_ms || 0} ms
              </div>
              <div className="text-xs text-blue-600">
                {metrics?.total_requests?.toLocaleString() || 0} požadavků
              </div>
            </div>
          </div>
          </Card>
        </div>

        {/* Real-time Metrics Widget */}
        <ErrorBoundary>
          <RealTimeMetricsWidget
            title="Real-time Metriky"
            endpoint="/admin/analytics/dashboard"
            refreshInterval={300000} // 5 minutes to reduce API spam
            showTrend={true}
            showLastUpdated={true}
            metrics={[
              {
                id: 'active-users',
                title: 'Aktivní uživatelé',
                value: {
                  current: 0,
                  previous: 0,
                  change: 0,
                  changePercent: 0,
                  trend: 'stable' as const
                },
                format: 'number',
                icon: <Users className="w-5 h-5" />,
                color: 'green'
              },
              {
                id: 'credits-usage',
                title: 'Využití kreditů',
                value: {
                  current: 0,
                  previous: 0,
                  change: 0,
                  changePercent: 0,
                  trend: 'stable' as const
                },
                format: 'number',
                icon: <CreditCard className="w-5 h-5" />,
                color: 'purple'
              },
              {
                id: 'revenue',
                title: 'Příjmy dnes',
                value: {
                  current: 0,
                  previous: 0,
                  change: 0,
                  changePercent: 0,
                  trend: 'stable' as const
                },
                format: 'currency',
                currency: 'Kč',
                icon: <TrendingUp className="w-5 h-5" />,
                color: 'orange'
              },
              {
                id: 'response-time',
                title: 'Odezva API',
                value: {
                  current: 0,
                  previous: 0,
                  change: 0,
                  changePercent: 0,
                  trend: 'stable' as const
                },
                format: 'duration',
                icon: <Activity className="w-5 h-5" />,
                color: 'blue'
              }
            ]}
            onMetricClick={handleRealTimeMetricClick}
          />
        </ErrorBoundary>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - System Health & Performance */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* System Health Details */}
            <Card title="Podrobnosti systému" icon={<Server className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Databáze</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Připojení</span>
                    <span className={`text-sm font-medium ${health?.db?.ok ? 'text-green-600' : 'text-red-600'}`}>
                      {health?.db?.ok ? 'Připojeno' : 'Chyba'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Odezva</span>
                    <span className="text-sm font-medium">{health?.db?.roundtrip_ms || 0} ms</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Aplikace</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Node.js verze</span>
                    <span className="text-sm font-medium">{health?.process?.node || '...'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Paměť</span>
                    <span className="text-sm font-medium">
                      {Math.round((health?.process?.memory?.heapUsed || 0) / 1024 / 1024)} MB
                    </span>
                  </div>
                </div>
              </div>
            </div>
            </Card>

            {/* Performance Metrics */}
            <Card title="Výkonnostní metriky" icon={<Activity className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">
                  {metrics?.total_requests?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-blue-700">Celkem požadavků</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">
                  {metrics?.avg_response_ms || 0} ms
                </div>
                <div className="text-sm text-green-700">Průměrná odezva</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600">
                  {metrics?.error_count_by_status && metrics.total_requests ? 
                    Math.round((Object.values(metrics.error_count_by_status).reduce((a, b) => a + b, 0) / metrics.total_requests) * 100) : 0}%
                </div>
                <div className="text-sm text-red-700">Chybovost</div>
              </div>
            </div>
            </Card>

            {/* Enhanced Performance Monitor */}
            <PerformanceMonitorWidget
              title="Monitorování výkonnosti"
              endpoint="/admin/analytics/system/performance"
              refreshInterval={300000} // 5 minutes to reduce API spam
              showCharts={true}
              showThresholds={true}
              showTrends={true}
              onMetricClick={handleMetricClick}
              onAlert={handleAlert}
            />

                    {/* Credits Overview */}
        <Card title="Přehled kreditů" icon={<CreditCard className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {credits?.totals?.balance?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-blue-700">Aktuální zůstatek</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {credits?.totals?.purchased?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-green-700">Celkem zakoupeno</div>
          </div>
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">
              {credits?.totals?.used?.toLocaleString() || 0}
            </div>
            <div className="text-sm text-red-700">Celkem použito</div>
          </div>
        </div>
        
        {/* Enhanced Credits Chart with Real-time Data */}
        <TrendChartWidget
          title="Využití kreditů v čase"
          endpoint="/admin/analytics/credits/real-time"
          refreshInterval={300000} // 5 minutes to reduce API spam
          chartType="line"
          timeRange="7d"
          showControls={true}
          showDownload={true}
          height={{ mobile: 200, tablet: 250, desktop: 300 }}
        />
        </Card>
          </div>

          {/* Right Column - Quick Actions & Alerts */}
          <div className="space-y-6">
            
            {/* Quick Actions */}
            <Card title="Rychlé akce" icon={<Zap className="w-5 h-5" />}>
            <div className="space-y-3">
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.action}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    action.variant === 'danger' 
                      ? 'bg-red-50 hover:bg-red-100 text-red-700' 
                      : action.variant === 'primary'
                      ? 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className={`p-2 rounded ${
                    action.variant === 'danger' 
                      ? 'bg-red-100' 
                      : action.variant === 'primary'
                      ? 'bg-blue-100'
                      : 'bg-gray-100'
                  }`}>
                    {action.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{action.title}</div>
                    <div className="text-xs opacity-75">{action.description}</div>
                  </div>
                </button>
              ))}
            </div>
            </Card>

            {/* Recent Activity */}
            <Card title="Nedávná aktivita" icon={<Bell className="w-5 h-5" />}>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-blue-900">Nový uživatel se zaregistroval</div>
                  <div className="text-xs text-blue-700">Před 5 minutami</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-green-900">Záloha byla dokončena</div>
                  <div className="text-xs text-green-700">Před 15 minutami</div>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-orange-50 rounded-lg">
                <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-orange-900">Vysoké využití API</div>
                  <div className="text-xs text-orange-700">Před 30 minutami</div>
                </div>
              </div>
            </div>
            </Card>

            {/* Real-time Alerts Panel */}
            <ErrorBoundary>
              <AlertPanelWidget
                title="Systémová upozornění"
                endpoint="/admin/analytics/alerts"
                refreshInterval={120000}
                maxAlerts={8}
                showFilters={true}
                showActions={true}
                onAlertClick={(alert) => {
                  // Show alert details or navigate to issue
                  console.log('Alert clicked:', alert);
                  // TODO: Implement alert details view
                }}
                onAcknowledge={(alertId) => {
                  // API call to acknowledge alert
                  console.log('Acknowledging alert:', alertId);
                  // TODO: Implement API call to acknowledge alert
                }}
                onResolve={(alertId) => {
                  // API call to resolve alert
                  console.log('Resolving alert:', alertId);
                  // TODO: Implement API call to resolve alert
                }}
              />
            </ErrorBoundary>

            {/* System Quick Stats */}
            <Card title="Rychlé statistiky" icon={<BarChart3 className="w-5 h-5" />}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Celkem škol</span>
                <span className="text-lg font-semibold">—</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Aktivní učitelé</span>
                <span className="text-lg font-semibold text-green-600">—</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Materiálů k moderování</span>
                <span className="text-lg font-semibold text-orange-600">{criticalAlerts?.length || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Využití systému</span>
                <span className="text-lg font-semibold text-blue-600">
                  {health?.process?.uptime_s ? `${Math.round((health.process.uptime_s / 86400) * 100) / 100}d` : 'N/A'}
                </span>
              </div>
            </div>
            </Card>
          </div>
        </div>

        {/* User Growth Trends */}
        <div className="mt-8">
          <ErrorBoundary>
            <TrendChartWidget
              title="Růst uživatelů"
              endpoint="/admin/analytics/users/real-time"
              refreshInterval={300000} // 5 minutes to reduce API spam
              chartType="line"
              timeRange="30d"
              showControls={true}
              showDownload={true}
              height={{ mobile: 250, tablet: 300, desktop: 400 }}
              transformData={(rawData) => {
                // Transform raw data to chart format
                if (Array.isArray(rawData)) {
                  return rawData.map((item: any) => ({
                    timestamp: item.date,
                    value: item.userCount,
                    label: new Date(item.date).toLocaleDateString('cs-CZ')
                  }));
                }
                return [];
              }}
              onDataPointClick={(dataPoint) => {
                // Navigate to user management or show details
                console.log('Data point clicked:', dataPoint);
                // TODO: Implement navigation to user management
              }}
            />
          </ErrorBoundary>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboardPage;
