import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, BarChart3, Calendar, Filter, Download, Eye, EyeOff } from 'lucide-react';
import Card from '../../ui/Card';
import { useRealTimeData } from '../../../hooks/useRealTimeData';
import { cn } from '../../../utils/cn';
import Button from '../../ui/Button';

export interface TrendData {
  daily_growth?: Array<{ date: string; new_users: number }>;
  daily_transactions?: Array<{ date: string; purchased: number; used: number }>;
  daily_creation?: Array<{ date: string; new_content: number }>;
  daily_revenue?: Array<{ date: string; daily_revenue: number }>;
  total_growth?: number;
  total_purchased?: number;
  total_used?: number;
  total_created?: number;
  total_revenue?: number;
  average_daily?: number;
}

export interface TrendAnalysisWidgetProps {
  title: string;
  endpoint: string;
  refreshInterval?: number;
  maxTrends?: number;
  showFilters?: boolean;
  showActions?: boolean;
  className?: string;
  onTrendClick?: (trend: any) => void;
  onExport?: (data: any, format: string) => void;
}

const TrendAnalysisWidget: React.FC<TrendAnalysisWidgetProps> = ({
  title,
  endpoint,
  refreshInterval = 30000,
  maxTrends = 5,
  showFilters = true,
  showActions = true,
  className = '',
  onTrendClick,
  onExport
}) => {
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>(['users', 'credits', 'content']);
  const [timeRange, setTimeRange] = useState<string>('30');
  const [showDetails, setShowDetails] = useState(false);

  const { data, loading, error, refresh, isAutoRefreshing, lastUpdated } = useRealTimeData({
    endpoint: `${endpoint}?timeRange=${JSON.stringify({ days: parseInt(timeRange) })}&metrics=${selectedMetrics.join(',')}`,
    refreshInterval,
    autoRefresh: true
  });

  // Process trend data
  const processedTrends = useMemo(() => {
    if (!data?.trends) return [];
    
    const trends: Array<{ type: string; data: TrendData; growth: number; trend: 'up' | 'down' | 'stable' }> = [];
    
    Object.entries(data.trends).forEach(([type, trendData]) => {
      if (trendData && typeof trendData === 'object') {
        const data = trendData as TrendData;
        let growth = 0;
        let trend: 'up' | 'down' | 'stable' = 'stable';
        
        if (data.average_daily && data.total_growth) {
          growth = data.average_daily;
          trend = growth > 0 ? 'up' : growth < 0 ? 'down' : 'stable';
        }
        
        trends.push({ type, data, growth, trend });
      }
    });
    
    return trends.slice(0, maxTrends);
  }, [data, maxTrends]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <BarChart3 className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatMetricValue = (value: number, type: string): string => {
    if (type === 'revenue') {
      return `${value.toLocaleString('cs-CZ')} Kč`;
    }
    if (type === 'credits') {
      return `${value.toLocaleString('cs-CZ')} kreditů`;
    }
    return value.toLocaleString('cs-CZ');
  };

  const handleExport = (format: string) => {
    if (onExport && data) {
      onExport(data, format);
    }
  };

  const handleTrendClick = (trend: any) => {
    if (onTrendClick) {
      onTrendClick(trend);
    }
  };

  if (error) {
    return (
      <Card title={title} className={cn('border-red-200', className)}>
        <div className="p-4 text-center text-red-600">
          <p>Chyba při načítání trendů</p>
          <Button onClick={refresh} variant="secondary" size="sm" className="mt-2">
            Zkusit znovu
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card title={title} className={className}>
      {/* Filters and Controls */}
      {showFilters && (
        <div className="p-4 border-b border-gray-200 space-y-3">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">Posledních 7 dní</option>
                <option value="30">Posledních 30 dní</option>
                <option value="90">Posledních 90 dní</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <div className="flex flex-wrap gap-2">
                {['users', 'credits', 'content', 'revenue'].map((metric) => (
                  <label key={metric} className="flex items-center space-x-1">
                    <input
                      type="checkbox"
                      checked={selectedMetrics.includes(metric)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedMetrics([...selectedMetrics, metric]);
                        } else {
                          setSelectedMetrics(selectedMetrics.filter(m => m !== metric));
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 capitalize">
                      {metric === 'users' ? 'uživatelé' : 
                       metric === 'credits' ? 'kredity' : 
                       metric === 'content' ? 'obsah' : 'příjmy'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Trend Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {processedTrends.map((trend) => (
                <div
                  key={trend.type}
                  className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer"
                  onClick={() => handleTrendClick(trend)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-gray-900 capitalize">
                      {trend.type === 'users' ? 'Uživatelé' : 
                       trend.type === 'credits' ? 'Kredity' : 
                       trend.type === 'content' ? 'Obsah' : 'Příjmy'}
                    </h4>
                    {getTrendIcon(trend.trend)}
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatMetricValue(trend.data.total_growth || trend.data.total_purchased || trend.data.total_created || trend.data.total_revenue || 0, trend.type)}
                    </p>
                    <p className="text-sm text-gray-600">
                      Průměrně {trend.data.average_daily || 0} denně
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Trends */}
            {showDetails && processedTrends.length > 0 && (
              <div className="mt-6 space-y-4">
                <h4 className="font-medium text-gray-900">Detailní trendy</h4>
                {processedTrends.map((trend) => (
                  <div key={trend.type} className="border border-gray-200 rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-3 capitalize">
                      {trend.type === 'users' ? 'Registrace uživatelů' : 
                       trend.type === 'credits' ? 'Transakce kreditů' : 
                       trend.type === 'content' ? 'Vytvořený obsah' : 'Denní příjmy'}
                    </h5>
                    
                    <div className="space-y-2">
                      {trend.data.daily_growth && (
                        <div className="text-sm text-gray-600">
                          <p>Celkový růst: {trend.data.total_growth} za {timeRange} dní</p>
                          <p>Průměrný denní růst: {trend.data.average_daily}</p>
                        </div>
                      )}
                      
                      {trend.data.daily_transactions && (
                        <div className="text-sm text-gray-600">
                          <p>Celkem zakoupeno: {trend.data.total_purchased} kreditů</p>
                          <p>Celkem použito: {trend.data.total_used} kreditů</p>
                        </div>
                      )}
                      
                      {trend.data.daily_creation && (
                        <div className="text-sm text-gray-600">
                          <p>Celkem vytvořeno: {trend.data.total_created} souborů</p>
                          <p>Průměrně denně: {trend.data.average_daily} souborů</p>
                        </div>
                      )}
                      
                      {trend.data.daily_revenue && (
                        <div className="text-sm text-gray-600">
                          <p>Celkové příjmy: {formatMetricValue(trend.data.total_revenue || 0, 'revenue')}</p>
                          <p>Průměrně denně: {formatMetricValue(trend.data.average_daily || 0, 'revenue')}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions */}
      {showActions && (
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => setShowDetails(!showDetails)}
              variant="secondary"
              size="sm"
              className="flex items-center space-x-1"
            >
              {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              <span>{showDetails ? 'Skrýt detaily' : 'Zobrazit detaily'}</span>
            </Button>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>Poslední aktualizace: {lastUpdated ? new Date(lastUpdated).toLocaleTimeString('cs-CZ') : 'N/A'}</span>
            {isAutoRefreshing && (
              <div className="flex items-center space-x-1">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
                <span>Auto-aktualizace</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              onClick={() => handleExport('json')}
              variant="secondary"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>JSON</span>
            </Button>
            <Button
              onClick={() => handleExport('csv')}
              variant="secondary"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Download className="w-4 h-4" />
              <span>CSV</span>
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default TrendAnalysisWidget;
