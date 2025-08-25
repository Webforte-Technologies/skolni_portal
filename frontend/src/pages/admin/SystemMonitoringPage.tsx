import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import AdminLayout from '../../components/admin/AdminLayout';
import { 
  Activity, 
  Server, 
  Cpu, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Users
} from 'lucide-react';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: Date;
}

interface ServiceStatus {
  name: string;
  status: 'online' | 'offline' | 'degraded';
  responseTime: number;
  uptime: number;
  lastCheck: Date;
}

const SystemMonitoringPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [activeTab, setActiveTab] = useState('metrics');
  const [systemMetrics] = useState<SystemMetric[]>([
    {
      name: 'CPU Usage',
      value: 45,
      unit: '%',
      status: 'healthy',
      trend: 'stable',
      lastUpdated: new Date()
    },
    {
      name: 'Memory Usage',
      value: 78,
      unit: '%',
      status: 'warning',
      trend: 'up',
      lastUpdated: new Date()
    },
    {
      name: 'Disk Usage',
      value: 62,
      unit: '%',
      status: 'healthy',
      trend: 'stable',
      lastUpdated: new Date()
    },
    {
      name: 'Network I/O',
      value: 23,
      unit: 'MB/s',
      status: 'healthy',
      trend: 'down',
      lastUpdated: new Date()
    }
  ]);

  const [serviceStatuses] = useState<ServiceStatus[]>([
    {
      name: 'Web Server',
      status: 'online',
      responseTime: 45,
      uptime: 99.8,
      lastCheck: new Date()
    },
    {
      name: 'Database',
      status: 'online',
      responseTime: 12,
      uptime: 99.9,
      lastCheck: new Date()
    },
    {
      name: 'AI Services',
      status: 'online',
      responseTime: 156,
      uptime: 98.5,
      lastCheck: new Date()
    },
    {
      name: 'File Storage',
      status: 'degraded',
      responseTime: 89,
      uptime: 97.2,
      lastCheck: new Date()
    }
  ]);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const refreshData = () => {
    setIsLoading(true);
    setLastRefresh(new Date());
    
    // Simulate refresh
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
      case 'degraded':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical':
      case 'offline':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'online':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="w-4 h-4" />;
      case 'critical':
      case 'offline':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <TrendingUp className="w-4 h-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg text-gray-600">Načítání systémových metrik...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Systémové monitorování</h1>
            <p className="text-gray-600 mt-2">
              Přehled výkonu a stavu systému v reálném čase
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              Poslední aktualizace: {lastRefresh.toLocaleTimeString('cs-CZ')}
            </div>
            <Button onClick={refreshData} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Obnovit
            </Button>
          </div>
        </div>

        {/* System Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-neutral-200 px-6 py-4">
              <h3 className="text-sm font-medium">Celkový stav</h3>
              <Server className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="p-6">
              <div className="text-2xl font-bold text-green-600">Operační</div>
              <p className="text-xs text-muted-foreground">
                Všechny služby běží normálně
              </p>
            </div>
          </Card>

          <Card>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-neutral-200 px-6 py-4">
              <h3 className="text-sm font-medium">Dostupnost</h3>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="p-6">
              <div className="text-2xl font-bold text-blue-600">99.7%</div>
              <p className="text-xs text-muted-foreground">
                Za posledních 30 dní
              </p>
            </div>
          </Card>

          <Card>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-neutral-200 px-6 py-4">
              <h3 className="text-sm font-medium">Aktivní uživatelé</h3>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="p-6">
              <div className="text-2xl font-bold text-purple-600">1,247</div>
              <p className="text-xs text-muted-foreground">
                V současné době online
              </p>
            </div>
          </Card>

          <Card>
            <div className="flex flex-row items-center justify-between space-y-0 pb-2 border-b border-neutral-200 px-6 py-4">
              <h3 className="text-sm font-medium">AI požadavky</h3>
              <Cpu className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="p-6">
              <div className="text-2xl font-bold text-orange-600">89/min</div>
              <p className="text-xs text-muted-foreground">
                Průměr za poslední hodinu
              </p>
            </div>
          </Card>
        </div>

        {/* Simple Tab Navigation */}
        <div className="mb-6">
          <div className="flex space-x-1 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'metrics'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Systémové metriky
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'services'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Stav služeb
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'alerts'
                  ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-700'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              Upozornění
            </button>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'metrics' && (
          <Card>
            <div className="border-b border-neutral-200 px-6 py-4">
              <h3 className="text-lg font-medium">Výkon systému</h3>
            </div>
            <div className="p-6 space-y-6">
              {systemMetrics.map((metric, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{metric.name}</span>
                      {getTrendIcon(metric.trend)}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-semibold">
                        {metric.value}{metric.unit}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={getStatusColor(metric.status)}
                      >
                        {getStatusIcon(metric.status)}
                        <span className="ml-1">
                          {metric.status === 'healthy' ? 'V pořádku' : 
                           metric.status === 'warning' ? 'Varování' : 'Kritické'}
                        </span>
                      </Badge>
                    </div>
                  </div>
                  {/* Simple progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        metric.status === 'healthy' ? 'bg-green-500' :
                        metric.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${metric.value}%` }}
                    ></div>
                  </div>
                  <div className="text-xs text-gray-500">
                    Poslední aktualizace: {metric.lastUpdated.toLocaleTimeString('cs-CZ')}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {activeTab === 'services' && (
          <Card>
            <div className="border-b border-neutral-200 px-6 py-4">
              <h3 className="text-lg font-medium">Stav služeb</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {serviceStatuses.map((service, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(service.status)}
                      <div>
                        <div className="font-medium">{service.name}</div>
                        <div className="text-sm text-gray-500">
                          Uptime: {service.uptime}%
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {service.responseTime}ms
                      </div>
                      <div className="text-xs text-gray-500">
                        {service.lastCheck.toLocaleTimeString('cs-CZ')}
                      </div>
                    </div>
                    <Badge 
                      variant="outline" 
                      className={getStatusColor(service.status)}
                    >
                      {service.status === 'online' ? 'Online' : 
                       service.status === 'degraded' ? 'Degradovaný' : 'Offline'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'alerts' && (
          <Card>
            <div className="border-b border-neutral-200 px-6 py-4">
              <h3 className="text-lg font-medium">Systémová upozornění</h3>
            </div>
            <div className="p-6">
              <div className="text-center py-8 text-gray-500">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Žádná aktivní upozornění</p>
                <p className="text-sm">Všechny systémy běží normálně</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default SystemMonitoringPage;
