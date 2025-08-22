import React, { useState, useMemo } from 'react';
import { AlertTriangle, AlertCircle, AlertOctagon, Info, Filter, Download, Eye, EyeOff, Zap } from 'lucide-react';
import Card from '../../ui/Card';
import { useRealTimeData } from '../../../hooks/useRealTimeData';
import { cn } from '../../../utils/cn';
import Button from '../../ui/Button';

export interface AnomalyData {
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  metric_value: number;
  threshold_value: number;
  detected_at: string;
}

export interface AnomalyDetectionData {
  anomalies: AnomalyData[];
  total_detected: number;
  severity_distribution: Record<string, number>;
  timeRange: any;
  generated_at: string;
}

export interface AnomalyDetectionWidgetProps {
  title: string;
  endpoint: string;
  refreshInterval?: number;
  maxAnomalies?: number;
  showFilters?: boolean;
  showActions?: boolean;
  className?: string;
  onAnomalyClick?: (anomaly: any) => void;
  onExport?: (data: any, format: string) => void;
}

const AnomalyDetectionWidget: React.FC<AnomalyDetectionWidgetProps> = ({
  title,
  endpoint,
      refreshInterval = 120000, // Reduced from 30s to 120s to prevent API spam
  maxAnomalies = 10,
  showFilters = true,
  showActions = true,
  className = '',
  onAnomalyClick,
  onExport
}) => {
  const [timeRange, setTimeRange] = useState<string>('7');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [showDetails, setShowDetails] = useState(false);

  const { data, loading, error, refresh, isAutoRefreshing, lastUpdated } = useRealTimeData({
    endpoint: `${endpoint}?timeRange=${JSON.stringify({ days: parseInt(timeRange) })}`,
    refreshInterval,
    autoRefresh: true
  });

  // Filter anomalies based on severity
  const filteredAnomalies = useMemo(() => {
    if (!data?.anomalies) return [];
    
    let anomalies = data.anomalies;
    
    if (severityFilter !== 'all') {
      anomalies = anomalies.filter((anomaly: AnomalyData) => anomaly.severity === severityFilter);
    }
    
    return anomalies.slice(0, maxAnomalies);
  }, [data, severityFilter, maxAnomalies]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertOctagon className="w-5 h-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'medium':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      case 'low':
        return <Info className="w-5 h-5 text-blue-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return 'border-red-200 bg-red-50';
      case 'high':
        return 'border-orange-200 bg-orange-50';
      case 'medium':
        return 'border-yellow-200 bg-yellow-50';
      case 'low':
        return 'border-blue-200 bg-blue-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getSeverityLabel = (severity: string): string => {
    switch (severity) {
      case 'critical':
        return 'Kritické';
      case 'high':
        return 'Vysoké';
      case 'medium':
        return 'Střední';
      case 'low':
        return 'Nízké';
      default:
        return 'Neznámé';
    }
  };

  const getAnomalyTypeLabel = (type: string): string => {
    const typeMap: Record<string, string> = {
      'user_registration_spike': 'Náhlý nárůst registrací',
      'credit_usage_spike': 'Náhlý nárůst použití kreditů',
      'content_creation_spike': 'Náhlý nárůst tvorby obsahu',
      'revenue_spike': 'Náhlý nárůst příjmů',
      'system_performance_degradation': 'Pokles výkonu systému',
      'database_connection_spike': 'Náhlý nárůst DB připojení',
      'memory_usage_spike': 'Náhlý nárůst použití paměti'
    };
    
    return typeMap[type] || type;
  };

  const formatMetricValue = (value: number, type: string): string => {
    if (type.includes('revenue')) {
      return `${value.toLocaleString('cs-CZ')} Kč`;
    }
    if (type.includes('credit') || type.includes('usage')) {
      return `${value.toLocaleString('cs-CZ')} kreditů`;
    }
    if (type.includes('memory')) {
      return `${value.toLocaleString('cs-CZ')}%`;
    }
    if (type.includes('connection')) {
      return `${value.toLocaleString('cs-CZ')} připojení`;
    }
    return value.toLocaleString('cs-CZ');
  };

  const handleExport = (format: string) => {
    if (onExport && data) {
      onExport(data, format);
    }
  };

  const handleAnomalyClick = (anomaly: any) => {
    if (onAnomalyClick) {
      onAnomalyClick(anomaly);
    }
  };

  if (error) {
    return (
      <Card title={title} className={cn('border-red-200', className)}>
        <div className="p-4 text-center text-red-600">
          <p>Chyba při načítání anomálií</p>
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
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">Poslední den</option>
                <option value="7">Posledních 7 dní</option>
                <option value="14">Posledních 14 dní</option>
                <option value="30">Posledních 30 dní</option>
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Závažnost:</span>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Všechny</option>
                <option value="critical">Kritické</option>
                <option value="high">Vysoké</option>
                <option value="medium">Střední</option>
                <option value="low">Nízké</option>
              </select>
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
            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-2xl font-bold text-gray-900">
                  {data?.total_detected || 0}
                </div>
                <div className="text-sm text-gray-600">Celkem detekováno</div>
              </div>
              
              {data?.severity_distribution && Object.entries(data.severity_distribution).map(([severity, count]) => (
                <div key={severity} className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className={cn('text-2xl font-bold', 
                    severity === 'critical' ? 'text-red-600' :
                    severity === 'high' ? 'text-orange-600' :
                    severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                  )}>
                    {count as number}
                  </div>
                  <div className="text-sm text-gray-600 capitalize">
                    {getSeverityLabel(severity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Anomalies List */}
            {filteredAnomalies.length > 0 ? (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span>Detekované anomálie ({filteredAnomalies.length})</span>
                </h4>
                
                {filteredAnomalies.map((anomaly: AnomalyData, index: number) => (
                  <div
                    key={`${anomaly.type}-${index}`}
                    className={cn(
                      'p-4 border rounded-lg cursor-pointer transition-colors hover:shadow-md',
                      getSeverityColor(anomaly.severity)
                    )}
                    onClick={() => handleAnomalyClick(anomaly)}
                  >
                    <div className="flex items-start space-x-3">
                      {getSeverityIcon(anomaly.severity)}
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h5 className="font-medium text-gray-900">
                            {getAnomalyTypeLabel(anomaly.type)}
                          </h5>
                          <span className={cn(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            severityFilter === 'all' ? 'bg-white' : 'bg-opacity-75'
                          )}>
                            {getSeverityLabel(anomaly.severity)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-gray-700">{anomaly.message}</p>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>
                            Hodnota: <span className="font-medium">{formatMetricValue(anomaly.metric_value, anomaly.type)}</span>
                          </span>
                          <span>
                            Práh: <span className="font-medium">{formatMetricValue(anomaly.threshold_value, anomaly.type)}</span>
                          </span>
                          <span>
                            Detekováno: {new Date(anomaly.detected_at).toLocaleString('cs-CZ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Info className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-lg font-medium">Žádné anomálie nebyly detekovány</p>
                <p className="text-sm">Systém funguje normálně v rámci definovaných limitů</p>
              </div>
            )}

            {/* Detailed Analysis */}
            {showDetails && data && (
              <div className="mt-6 space-y-4">
                <h4 className="font-medium text-gray-900">Detailní analýza anomálií</h4>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Statistiky podle závažnosti</h5>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.severity_distribution && Object.entries(data.severity_distribution).map(([severity, count]) => (
                      <div key={severity} className="flex items-center justify-between p-3 bg-white rounded-lg">
                        <div className="flex items-center space-x-2">
                          {getSeverityIcon(severity)}
                          <span className="font-medium capitalize">{getSeverityLabel(severity)}</span>
                        </div>
                        <div className="text-lg font-bold text-gray-900">{count as number}</div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <h5 className="font-medium text-gray-900 mb-3">Časové rozložení</h5>
                  <p className="text-sm text-gray-600">
                    Analýza pokrývá období posledních {timeRange} dní. 
                    Poslední aktualizace: {new Date(data.generated_at).toLocaleString('cs-CZ')}
                  </p>
                </div>
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

export default AnomalyDetectionWidget;
