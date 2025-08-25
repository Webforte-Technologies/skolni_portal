import React, { useState, useEffect, useCallback } from 'react';
import { 
  BarChart3, 
  Activity, 
  Clock, 
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Zap,
  Database,
  Cpu
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';

interface MCPAnalyticsData {
  totalRequests: number;
  successRate: number;
  averageResponseTime: number;
  totalTokensUsed: number;
  totalCost: number;
  cacheHitRate: number;
  
  requestsOverTime: { date: string; requests: number; success: number; errors: number }[];
  tokensOverTime: { date: string; tokens: number; cost: number }[];
  responseTimeOverTime: { date: string; avg_response_time: number }[];
  
  modelStats: {
    model: string;
    requests: number;
    success_rate: number;
    avg_response_time: number;
    total_tokens: number;
    total_cost: number;
  }[];
  
  providerHealth: {
    provider: string;
    status: string;
    requests: number;
    error_rate: number;
    avg_response_time: number;
  }[];
  
  requestTypeBreakdown: {
    type: string;
    count: number;
    percentage: number;
  }[];
  
  recentErrors: {
    timestamp: string;
    model: string;
    error_code: string;
    error_message: string;
    user_id: string;
  }[];
  
  cacheStats: {
    total_cached_responses: number;
    cache_hit_count: number;
    cache_miss_count: number;
    cache_efficiency: number;
    avg_cache_ttl: number;
  };
}

interface RealTimeData {
  time_series: {
    timestamp: string;
    requests: number;
    successful_requests: number;
    avg_response_time: number;
    tokens_used: number;
    total_cost: number;
  }[];
  active_requests: number;
}

const MCPAnalyticsDashboard: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<MCPAnalyticsData | null>(null);
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<number>(30);
  const { showToast } = useToast();

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      
      const response = await api.get('/admin/analytics/mcp/overview');
      
      if (response.data.success && response.data.data) {
        // Type assertion with runtime check
        const analyticsData = response.data.data as MCPAnalyticsData;
        setAnalyticsData(analyticsData);
      } else {
        throw new Error('Invalid response format from analytics API');
      }
    } catch (err) {
      console.error('Failed to fetch analytics data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRealTimeData = async () => {
    try {
      const response = await api.get('/admin/analytics/mcp/real-time');
      
      if (response.data.success && response.data.data) {
        // Type assertion with runtime check
        const realTimeData = response.data.data as RealTimeData;
        setRealTimeData(realTimeData);
      }
    } catch (error) {
      console.error('Failed to fetch real-time data:', error);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  useEffect(() => {
    // Fetch real-time data every 30 seconds
    fetchRealTimeData();
    const interval = setInterval(fetchRealTimeData, 30000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4
    }).format(amount);
  };

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

  if (!analyticsData) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Žádná data k zobrazení</h3>
        <p className="text-gray-600 mb-4">Analytická data MCP serveru nejsou k dispozici.</p>
        <div className="space-y-3">
          <Button onClick={fetchAnalyticsData}>
            Zkusit znovu
          </Button>
          <Button 
            variant="outline" 
            onClick={async () => {
              try {
                await api.post('/admin/analytics/mcp/setup-sample-data');
                showToast({ type: 'success', message: 'Ukázková data byla přidána' });
                fetchAnalyticsData();
              } catch (error) {
                showToast({ type: 'error', message: 'Nepodařilo se přidat ukázková data' });
              }
            }}
          >
            Přidat ukázková data
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">MCP Analytics Dashboard</h2>
          <p className="text-gray-600">Model Context Protocol - výkon a statistiky AI systému</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(Number(e.target.value))}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={7}>Posledních 7 dní</option>
            <option value={30}>Posledních 30 dní</option>
            <option value={90}>Posledních 90 dní</option>
          </select>
          <Button
            variant="outline"
            onClick={fetchAnalyticsData}
            disabled={loading}
          >
            <Activity className="w-4 h-4 mr-2" />
            Obnovit
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Celkem požadavků</p>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(analyticsData.totalRequests)}
              </p>
            </div>
            <div className="p-2 rounded-full bg-blue-100">
              <BarChart3 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Úspěšnost</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData.successRate.toFixed(1)}%
              </p>
            </div>
            <div className="p-2 rounded-full bg-green-100">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Průměrná odezva</p>
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(analyticsData.averageResponseTime)}ms
              </p>
            </div>
            <div className="p-2 rounded-full bg-yellow-100">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cache Hit Rate</p>
              <p className="text-2xl font-bold text-gray-900">
                {analyticsData.cacheHitRate.toFixed(1)}%
              </p>
            </div>
            <div className="p-2 rounded-full bg-purple-100">
              <Database className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Real-time Metrics */}
      {realTimeData && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Aktuální aktivita (poslední hodina)</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Real-time</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Aktivní požadavky</p>
              <p className="text-xl font-bold text-blue-600">{realTimeData.active_requests}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Požadavky za hodinu</p>
              <p className="text-xl font-bold text-green-600">
                {realTimeData.time_series.reduce((sum, item) => sum + item.requests, 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Tokeny za hodinu</p>
              <p className="text-xl font-bold text-purple-600">
                {formatNumber(realTimeData.time_series.reduce((sum, item) => sum + item.tokens_used, 0))}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Model Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Výkon modelů</h3>
          <div className="space-y-3">
            {analyticsData.modelStats.slice(0, 5).map((model, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{model.model}</p>
                  <p className="text-sm text-gray-600">
                    {formatNumber(model.requests)} požadavků • {model.success_rate.toFixed(1)}% úspěšnost
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{model.avg_response_time.toFixed(0)}ms</p>
                  <p className="text-xs text-gray-600">{formatCurrency(model.total_cost)}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Typy požadavků</h3>
          <div className="space-y-3">
            {analyticsData.requestTypeBreakdown.map((type, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-4 h-4 rounded mr-3"
                    style={{ 
                      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'][index % 4]
                    }}
                  />
                  <span className="text-gray-900 capitalize">{type.type}</span>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{formatNumber(type.count)}</p>
                  <p className="text-sm text-gray-600">{type.percentage.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Provider Health */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Stav poskytovatelů AI</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {analyticsData.providerHealth.map((provider, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900">{provider.provider}</h4>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                  provider.status === 'healthy' ? 'bg-green-100 text-green-800' :
                  provider.status === 'degraded' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {provider.status === 'healthy' ? 'Zdravý' :
                   provider.status === 'degraded' ? 'Snížený výkon' : 'Nedostupný'}
                </div>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>Požadavky: {formatNumber(provider.requests)}</p>
                <p>Chybovost: {provider.error_rate.toFixed(1)}%</p>
                <p>Odezva: {provider.avg_response_time.toFixed(0)}ms</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent Errors */}
      {analyticsData.recentErrors.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nedávné chyby</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Čas
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kód chyby
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Zpráva
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analyticsData.recentErrors.slice(0, 5).map((error, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(error.timestamp).toLocaleString('cs-CZ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {error.model}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {error.error_code}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {error.error_message}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Cost and Token Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Náklady a tokeny</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Celkové tokeny</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatNumber(analyticsData.totalTokensUsed)}
                </p>
              </div>
              <Cpu className="w-8 h-8 text-blue-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Celkové náklady</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(analyticsData.totalCost)}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Cache výkon</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Cache efektivita</p>
                <p className="text-xl font-bold text-purple-600">
                  {analyticsData.cacheStats.cache_efficiency.toFixed(1)}%
                </p>
              </div>
              <Database className="w-8 h-8 text-purple-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Cache odpovědi</p>
                <p className="text-xl font-bold text-indigo-600">
                  {formatNumber(analyticsData.cacheStats.total_cached_responses)}
                </p>
              </div>
              <Zap className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MCPAnalyticsDashboard;
