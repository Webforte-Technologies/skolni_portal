import React, { useState, useEffect, useCallback } from 'react';
import { 
  Server, Activity, Database,  HardDrive, 
   AlertTriangle, CheckCircle, Clock, 
  TrendingUp, TrendingDown, Zap, RefreshCw
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';

interface SystemMetric {
  name: string;
  value: number;
  unit: string;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  threshold_warning: number;
  threshold_critical: number;
}

interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'error';
  uptime: number;
  memory_usage: number;
  cpu_usage: number;
  last_check: string;
}

interface SystemAlert {
  id: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  service?: string;
}

const SystemHealthPage: React.FC = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetric[]>([]);
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const { showToast } = useToast();

  const fetchSystemHealth = useCallback(async () => {
    setLoading(true);
    try {
      const [metricsRes, servicesRes, alertsRes] = await Promise.all([
        api.get<any>('/admin/system/health/metrics'),
        api.get<any>('/admin/system/health/services'),
        api.get<any>('/admin/system/health/alerts')
      ]);

      setSystemMetrics(metricsRes.data.data || []);
      setServices(servicesRes.data.data || []);
      setAlerts(alertsRes.data.data || []);
      setLastUpdate(new Date());
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při načítání systémových dat' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchSystemHealth();
    
    // Auto-refresh every 2 minutes instead of 30 seconds to reduce API spam
    const interval = setInterval(fetchSystemHealth, 120000);
    return () => clearInterval(interval);
  }, [fetchSystemHealth]);

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      'healthy': 'text-green-600',
      'warning': 'text-yellow-600',
      'critical': 'text-red-600',
      'running': 'text-green-600',
      'stopped': 'text-red-600',
      'error': 'text-red-600'
    };
    return colorMap[status] || 'text-gray-600';
  };

  const getStatusIcon = (status: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'healthy': <CheckCircle className="w-5 h-5" />,
      'warning': <AlertTriangle className="w-5 h-5" />,
      'critical': <AlertTriangle className="w-5 h-5" />,
      'running': <CheckCircle className="w-5 h-5" />,
      'stopped': <AlertTriangle className="w-5 h-5" />,
      'error': <AlertTriangle className="w-5 h-5" />
    };
    return iconMap[status] || <Clock className="w-5 h-5" />;
  };

  const getSeverityColor = (severity: string) => {
    const colorMap: Record<string, string> = {
      'info': 'bg-blue-100 text-blue-800',
      'warning': 'bg-yellow-100 text-yellow-800',
      'error': 'bg-red-100 text-red-800',
      'critical': 'bg-red-100 text-red-800'
    };
    return colorMap[severity] || 'bg-gray-100 text-gray-800';
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      await api.put(`/admin/system/health/alerts/${alertId}/acknowledge`);
      setAlerts(prev => prev.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      ));
      showToast({ type: 'success', message: 'Alert byl potvrzen' });
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při potvrzování alertu' });
    }
  };

  const restartService = async (serviceName: string) => {
    if (!confirm(`Opravdu chcete restartovat službu ${serviceName}?`)) return;
    
    try {
      await api.post(`/admin/system/health/services/${serviceName}/restart`);
      showToast({ type: 'success', message: `Služba ${serviceName} byla restartována` });
      fetchSystemHealth();
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při restartu služby' });
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Zdraví systému</h1>
          <p className="text-gray-600 mt-1">Real-time monitoring a správa systémových služeb</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">
            Poslední aktualizace: {lastUpdate.toLocaleTimeString('cs-CZ')}
          </div>
          <Button onClick={fetchSystemHealth} isLoading={loading} variant="secondary">
            <RefreshCw className="w-4 h-4 mr-2" />
            Obnovit
          </Button>
        </div>
      </div>

      {/* System Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {systemMetrics.map((metric) => (
          <Card key={metric.name} className="hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${getStatusColor(metric.status)}`}>
                {getStatusIcon(metric.status)}
              </div>
              <div className={`text-xs px-2 py-1 rounded-full ${
                metric.trend === 'up' ? 'bg-green-100 text-green-800' :
                metric.trend === 'down' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {metric.trend === 'up' ? <TrendingUp className="w-3 h-3" /> :
                 metric.trend === 'down' ? <TrendingDown className="w-3 h-3" /> :
                 '—'}
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {metric.value.toLocaleString()}{metric.unit}
              </div>
              <div className="text-sm text-gray-600 capitalize">
                {metric.name.replace('_', ' ')}
              </div>
            </div>

            {/* Threshold indicators */}
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-yellow-600">Warning: {metric.threshold_warning}{metric.unit}</span>
                <span className="text-red-600">Critical: {metric.threshold_critical}{metric.unit}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Services Status */}
      <Card title="Stav služeb" icon={<Server className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div key={service.name} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">{service.name}</h3>
                <div className={`flex items-center gap-1 ${getStatusColor(service.status)}`}>
                  {getStatusIcon(service.status)}
                  <span className="text-sm capitalize">{service.status}</span>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Uptime:</span>
                  <span className="font-medium">{formatUptime(service.uptime)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">CPU:</span>
                  <span className={`font-medium ${
                    service.cpu_usage > 80 ? 'text-red-600' :
                    service.cpu_usage > 60 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {service.cpu_usage.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Memory:</span>
                  <span className={`font-medium ${
                    service.memory_usage > 80 ? 'text-red-600' :
                    service.memory_usage > 60 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {service.memory_usage.toFixed(1)}%
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-600">Poslední kontrola:</span>
                  <span className="text-xs text-gray-500">
                    {new Date(service.last_check).toLocaleTimeString('cs-CZ')}
                  </span>
                </div>
              </div>
              
              <div className="mt-3 flex gap-2">
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => restartService(service.name)}
                  disabled={service.status === 'stopped'}
                >
                  <Zap className="w-4 h-4 mr-1" />
                  Restart
                </Button>
                
                <Button size="sm" variant="secondary">
                  <Activity className="w-4 h-4 mr-1" />
                  Logy
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* System Alerts */}
      <Card title="Systémové alerty" icon={<AlertTriangle className="w-5 h-5" />}>
        <div className="space-y-3">
          {alerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné aktivní alerty</h3>
              <p className="text-gray-500">Všechny systémy fungují správně</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div key={alert.id} className={`p-4 rounded-lg border ${
                alert.acknowledged ? 'bg-gray-50 border-gray-200' : 'bg-white border-red-200'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      {alert.service && (
                        <span className="text-sm text-gray-500">Služba: {alert.service}</span>
                      )}
                      <span className="text-xs text-gray-400">
                        {new Date(alert.timestamp).toLocaleString('cs-CZ')}
                      </span>
                    </div>
                    
                    <p className="text-gray-900">{alert.message}</p>
                  </div>
                  
                  {!alert.acknowledged && (
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Potvrdit
                    </Button>
                  )}
                </div>
                
                {alert.acknowledged && (
                  <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    Alert byl potvrzen
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card title="Rychlé akce" icon={<Zap className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="secondary" 
            className="h-20 flex flex-col items-center justify-center gap-2"
            onClick={() => {
              if (confirm('Opravdu chcete restartovat všechny služby?')) {
                // Implement restart all services
                showToast({ type: 'info', message: 'Restart všech služeb byl spuštěn' });
              }
            }}
          >
            <Server className="w-6 h-6" />
            <span>Restart všech služeb</span>
          </Button>
          
          <Button 
            variant="secondary" 
            className="h-20 flex flex-col items-center justify-center gap-2"
            onClick={() => {
              if (confirm('Opravdu chcete vymazat cache?')) {
                // Implement clear cache
                showToast({ type: 'info', message: 'Cache byla vymazána' });
              }
            }}
          >
            <HardDrive className="w-6 h-6" />
            <span>Vymazat cache</span>
          </Button>
          
          <Button 
            variant="secondary" 
            className="h-20 flex flex-col items-center justify-center gap-2"
            onClick={() => {
              // Implement system backup
              showToast({ type: 'info', message: 'Záloha systému byla spuštěna' });
            }}
          >
            <Database className="w-6 h-6" />
            <span>Spustit zálohu</span>
          </Button>
        </div>
      </Card>
      </div>
    </AdminLayout>
  );
};

export default SystemHealthPage;
