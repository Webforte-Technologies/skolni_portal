import React, { useState, useEffect } from 'react';
import { Activity, Server, Database, Cpu, HardDrive, Network, Clock, TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card, Button, Badge } from '../../components/ui';


interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  threshold: { warning: number; critical: number };
  description: string;
}

interface SystemPerformance {
  cpu: PerformanceMetric;
  memory: PerformanceMetric;
  disk: PerformanceMetric;
  network: PerformanceMetric;
  database: PerformanceMetric;
  api: PerformanceMetric;
  uptime: PerformanceMetric;
  responseTime: PerformanceMetric;
  throughput: PerformanceMetric;
  errorRate: PerformanceMetric;
  activeConnections: PerformanceMetric;
  queueLength: PerformanceMetric;
}

interface PerformanceHistory {
  timestamp: Date;
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  responseTime: number;
  throughput: number;
  errorRate: number;
}

const SystemPerformancePage: React.FC = () => {
  const [performanceData, setPerformanceData] = useState<SystemPerformance | null>(null);
  const [performanceHistory, setPerformanceHistory] = useState<PerformanceHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h');
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    // Simulate API call for performance data
    const fetchPerformanceData = async () => {
      setLoading(true);
      // In real implementation, this would be an API call
      setTimeout(() => {
        const mockPerformanceData: SystemPerformance = {
          cpu: {
            name: 'CPU využití',
            value: 45.2,
            unit: '%',
            status: 'healthy',
            trend: 'stable',
            threshold: { warning: 70, critical: 90 },
            description: 'Průměrné využití procesoru'
          },
          memory: {
            name: 'Využití paměti',
            value: 78.5,
            unit: '%',
            status: 'warning',
            trend: 'up',
            threshold: { warning: 75, critical: 90 },
            description: 'Využití RAM paměti'
          },
          disk: {
            name: 'Využití disku',
            value: 62.3,
            unit: '%',
            status: 'healthy',
            trend: 'stable',
            threshold: { warning: 80, critical: 95 },
            description: 'Využití pevného disku'
          },
          network: {
            name: 'Síťová aktivita',
            value: 23.7,
            unit: 'Mbps',
            status: 'healthy',
            trend: 'down',
            threshold: { warning: 50, critical: 100 },
            description: 'Aktuální síťový provoz'
          },
          database: {
            name: 'Databázové připojení',
            value: 12,
            unit: '',
            status: 'healthy',
            trend: 'stable',
            threshold: { warning: 20, critical: 30 },
            description: 'Aktivní databázová připojení'
          },
          api: {
            name: 'API odezva',
            value: 245,
            unit: 'ms',
            status: 'healthy',
            trend: 'down',
            threshold: { warning: 500, critical: 1000 },
            description: 'Průměrná odezva API'
          },
          uptime: {
            name: 'Uptime',
            value: 99.8,
            unit: '%',
            status: 'healthy',
            trend: 'stable',
            threshold: { warning: 99.5, critical: 99.0 },
            description: 'Dostupnost systému'
          },
          responseTime: {
            name: 'Odezva webu',
            value: 180,
            unit: 'ms',
            status: 'healthy',
            trend: 'down',
            threshold: { warning: 300, critical: 500 },
            description: 'Průměrná odezva webové aplikace'
          },
          throughput: {
            name: 'Propustnost',
            value: 1250,
            unit: 'req/s',
            status: 'healthy',
            trend: 'up',
            threshold: { warning: 1000, critical: 800 },
            description: 'Požadavků za sekundu'
          },
          errorRate: {
            name: 'Chybovost',
            value: 0.8,
            unit: '%',
            status: 'healthy',
            trend: 'down',
            threshold: { warning: 2.0, critical: 5.0 },
            description: 'Procento chybných požadavků'
          },
          activeConnections: {
            name: 'Aktivní připojení',
            value: 156,
            unit: '',
            status: 'healthy',
            trend: 'up',
            threshold: { warning: 200, critical: 300 },
            description: 'Aktivní uživatelská připojení'
          },
          queueLength: {
            name: 'Délka fronty',
            value: 3,
            unit: '',
            status: 'healthy',
            trend: 'stable',
            threshold: { warning: 10, critical: 25 },
            description: 'Požadavků ve frontě'
          }
        };

        const mockHistory: PerformanceHistory[] = [
          { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), cpu: 42, memory: 75, disk: 60, network: 25, responseTime: 250, throughput: 1200, errorRate: 1.2 },
          { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), cpu: 44, memory: 76, disk: 61, network: 28, responseTime: 235, throughput: 1250, errorRate: 1.0 },
          { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), cpu: 47, memory: 77, disk: 62, network: 30, responseTime: 220, throughput: 1280, errorRate: 0.9 },
          { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), cpu: 49, memory: 78, disk: 63, network: 32, responseTime: 210, throughput: 1300, errorRate: 0.8 },
          { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), cpu: 51, memory: 79, disk: 64, network: 35, responseTime: 200, throughput: 1320, errorRate: 0.7 },
          { timestamp: new Date(Date.now() - 1000 * 60 * 60 * 1), cpu: 48, memory: 78, disk: 63, network: 30, responseTime: 190, throughput: 1350, errorRate: 0.6 },
          { timestamp: new Date(), cpu: 45.2, memory: 78.5, disk: 62.3, network: 23.7, responseTime: 180, throughput: 1250, errorRate: 0.8 }
        ];

        setPerformanceData(mockPerformanceData);
        setPerformanceHistory(mockHistory);
        setLoading(false);
      }, 1000);
    };

    fetchPerformanceData();

    // Auto-refresh every 30 seconds if enabled
    if (autoRefresh) {
      const interval = setInterval(fetchPerformanceData, 30000);
      return () => clearInterval(interval);
    }
  }, [timeRange, autoRefresh]);

  const getStatusColor = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'healthy':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: PerformanceMetric['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <CheckCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: PerformanceMetric['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-600" />;
      case 'stable':
        return <div className="w-4 h-4 text-gray-600">—</div>;
      default:
        return <div className="w-4 h-4 text-gray-600">—</div>;
    }
  };

  const getMetricIcon = (name: string) => {
    if (name.includes('CPU')) return <Cpu className="w-6 h-6" />;
    if (name.includes('paměti')) return <HardDrive className="w-6 h-6" />;
    if (name.includes('disku')) return <HardDrive className="w-6 h-6" />;
    if (name.includes('síť')) return <Network className="w-6 h-6" />;
    if (name.includes('databáze')) return <Database className="w-6 h-6" />;
    if (name.includes('API')) return <Server className="w-6 h-6" />;
    if (name.includes('Uptime')) return <Clock className="w-6 h-6" />;
    if (name.includes('odezva')) return <Activity className="w-6 h-6" />;
    if (name.includes('propustnost')) return <TrendingUp className="w-6 h-6" />;
    if (name.includes('chybovost')) return <XCircle className="w-6 h-6" />;
    if (name.includes('připojení')) return <Network className="w-6 h-6" />;
    if (name.includes('fronty')) return <Activity className="w-6 h-6" />;
    return <Activity className="w-6 h-6" />;
  };

  const formatValue = (metric: PerformanceMetric) => {
    if (metric.unit === '%') {
      return `${metric.value.toFixed(1)}%`;
    } else if (metric.unit === 'ms') {
      return `${metric.value}ms`;
    } else if (metric.unit === 'Mbps') {
      return `${metric.value} Mbps`;
    } else if (metric.unit === 'req/s') {
      return `${metric.value.toLocaleString()} req/s`;
    } else {
      return `${metric.value}${metric.unit}`;
    }
  };

  const getProgressColor = (metric: PerformanceMetric) => {
    const percentage = metric.value / (metric.threshold.critical * 1.1) * 100;
    if (percentage > 80) return 'bg-red-500';
    if (percentage > 60) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressWidth = (metric: PerformanceMetric) => {
    const percentage = metric.value / (metric.threshold.critical * 1.1) * 100;
    return Math.min(percentage, 100);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Načítání výkonnostních dat...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Výkonnost systému</h1>
            <p className="text-gray-600">Monitoring a analýza výkonu platformy</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">Poslední hodina</option>
              <option value="6h">Posledních 6 hodin</option>
              <option value="24h">Posledních 24 hodin</option>
              <option value="7d">Posledních 7 dní</option>
            </select>
            <Button
              variant={autoRefresh ? 'primary' : 'outline'}
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="flex items-center space-x-2"
            >
              <Activity className="w-4 h-4" />
              <span>{autoRefresh ? 'Auto-refresh zapnuto' : 'Auto-refresh vypnuto'}</span>
            </Button>
          </div>
        </div>

        {/* System Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Celkový stav</p>
                <p className="text-2xl font-bold text-green-600">Výborný</p>
                <p className="text-sm text-gray-500">Všechny systémy funkční</p>
              </div>
              <div className="p-2 rounded-full bg-green-100">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Uptime</p>
                <p className="text-2xl font-bold text-blue-600">
                  {performanceData!.uptime.value}%
                </p>
                <p className="text-sm text-gray-500">Dostupnost systému</p>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <Clock className="w-8 h-8 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">API odezva</p>
                <p className="text-2xl font-bold text-green-600">
                  {performanceData!.api.value}ms
                </p>
                <p className="text-sm text-gray-500">Průměrná odezva</p>
              </div>
              <div className="p-2 rounded-full bg-green-100">
                <Server className="w-8 h-8 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Propustnost</p>
                <p className="text-2xl font-bold text-purple-600">
                  {performanceData!.throughput.value.toLocaleString()}
                </p>
                <p className="text-sm text-gray-500">req/s</p>
              </div>
              <div className="p-2 rounded-full bg-purple-100">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Object.entries(performanceData!).map(([key, metric]) => (
            <Card key={key} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-gray-100">
                    {getMetricIcon(metric.name)}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{metric.name}</h3>
                    <p className="text-xs text-gray-500">{metric.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getTrendIcon(metric.trend)}
                  {getStatusIcon(metric.status)}
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-gray-900">
                    {formatValue(metric)}
                  </span>
                  <Badge variant="outline" className={getStatusColor(metric.status)}>
                    {metric.status === 'healthy' ? 'Výborný' :
                     metric.status === 'warning' ? 'Varování' : 'Kritický'}
                  </Badge>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(metric)}`}
                    style={{ width: `${getProgressWidth(metric)}%` }}
                  />
                </div>
                
                {/* Thresholds */}
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Varování: {metric.threshold.warning}{metric.unit}</span>
                  <span>Kritické: {metric.threshold.critical}{metric.unit}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Performance History Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Historie výkonu</h3>
          <div className="h-64 flex items-end justify-between space-x-1">
            {performanceHistory.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="relative w-full">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t"
                    style={{ height: `${(data.cpu / 100) * 200}px` }}
                  />
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 text-center">
                    {data.cpu}%
                  </div>
                </div>
                <span className="text-xs text-gray-600 mt-2">
                  {data.timestamp.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
          <div className="text-center text-sm text-gray-500 mt-2">
            CPU využití v čase
          </div>
        </Card>

        {/* System Alerts */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Systémová upozornění</h3>
          <div className="space-y-3">
            {performanceData!.memory.status === 'warning' && (
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">
                    Vysoké využití paměti
                  </p>
                  <p className="text-sm text-yellow-700">
                    Paměť je využívána na {performanceData!.memory.value}% - zvažte optimalizaci
                  </p>
                </div>
              </div>
            )}
            
            {performanceData!.errorRate.value > 1 && (
              <div className="flex items-center space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <XCircle className="w-5 h-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Zvýšená chybovost
                  </p>
                  <p className="text-sm text-orange-700">
                    Chybovost je na {performanceData!.errorRate.value}% - sledujte trend
                  </p>
                </div>
              </div>
            )}

            {performanceData!.uptime.value < 99.9 && (
              <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-800">
                    Uptime pod 99.9%
                  </p>
                  <p className="text-sm text-blue-700">
                    Aktuální uptime: {performanceData!.uptime.value}% - v normě, ale sledujte
                  </p>
                </div>
              </div>
            )}

            {performanceData!.memory.status === 'healthy' && 
             performanceData!.errorRate.value <= 1 && 
             performanceData!.uptime.value >= 99.9 && (
              <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Všechny systémy jsou v normě
                  </p>
                  <p className="text-sm text-green-700">
                    Žádná kritická upozornění nejsou aktivní
                  </p>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default SystemPerformancePage;
