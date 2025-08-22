import React, { useState } from 'react';
import { TrendingUp, Target, BarChart3, Calendar, Download, Eye, EyeOff, Zap, TrendingDown } from 'lucide-react';
import Card from '../../ui/Card';
import { useRealTimeData } from '../../../hooks/useRealTimeData';
import { cn } from '../../../utils/cn';
import Button from '../../ui/Button';

interface PredictionData {
  current_daily_average: number;
  projected_total: number;
  confidence: number;
  factors: string[];
}

interface ExportPayload {
  predictions: Record<string, PredictionData>;
  metadata?: Record<string, any>;
}

export interface PredictiveInsightsData {
  predictions: {
    user_growth: PredictionData;
    revenue: PredictionData;
    credit_usage: PredictionData;
  };
  confidence_levels: {
    user_growth: number;
    revenue: number;
    credit_usage: number;
  };
  timeRange: any;
  generated_at: string;
}

export interface PredictiveInsightsWidgetProps {
  title: string;
  endpoint: string;
  refreshInterval?: number;
  showFilters?: boolean;
  showActions?: boolean;
  className?: string;
  onPredictionClick?: (prediction: { type: string; data: PredictionData }) => void;
  onExport?: (data: ExportPayload, format: 'csv' | 'json') => void;
}

const PredictiveInsightsWidget: React.FC<PredictiveInsightsWidgetProps> = ({
  title,
  endpoint,
  refreshInterval = 60000, // Longer interval for predictions
  showFilters = true,
  showActions = true,
  className = '',
  onPredictionClick,
  onExport
}) => {
  const [timeRange, setTimeRange] = useState<string>('3');
  const [showDetails, setShowDetails] = useState(false);

  const { data, loading, error, refresh, isAutoRefreshing, lastUpdated } = useRealTimeData({
    endpoint: `${endpoint}?timeRange=${JSON.stringify({ months: parseInt(timeRange) })}`,
    refreshInterval,
    autoRefresh: true
  });

  const getConfidenceColor = (confidence: number): string => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceIcon = (confidence: number) => {
    if (confidence >= 0.8) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (confidence >= 0.6) return <BarChart3 className="w-4 h-4 text-yellow-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const getConfidenceLabel = (confidence: number): string => {
    if (confidence >= 0.8) return 'Vysoká';
    if (confidence >= 0.6) return 'Střední';
    return 'Nízká';
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

  const formatFactors = (factors: string[]): string => {
    const factorMap: Record<string, string> = {
      'current_growth_rate': 'Aktuální míra růstu',
      'seasonal_patterns': 'Sezónní vzory',
      'marketing_efforts': 'Marketingové aktivity',
      'current_revenue_trend': 'Aktuální trend příjmů',
      'user_growth': 'Růst uživatelů',
      'pricing_strategy': 'Cenová strategie',
      'current_usage_patterns': 'Aktuální vzory používání',
      'user_activity': 'Aktivita uživatelů',
      'content_creation': 'Tvorba obsahu'
    };
    
    return factors.map(factor => factorMap[factor] || factor).join(', ');
  };

  // Type guard to check if an object is PredictionData
  const isPredictionData = (obj: unknown): obj is PredictionData => {
    return obj !== null && 
           typeof obj === 'object' && 
           'current_daily_average' in obj &&
           'projected_total' in obj &&
           'confidence' in obj &&
           'factors' in obj;
  };

  // Type guard to check if a value is a number
  const isNumber = (value: unknown): value is number => {
    return typeof value === 'number' && !isNaN(value);
  };

  // Format time range for display
  const formatTimeRange = (timeRange: string | number): string => {
    const months = Number(timeRange) || 0;
    if (months === 1) return '1 měsíc';
    if (months < 5) return `${months} měsíce`;
    return `${months} měsíců`;
  };

  const handleExport = (format: 'csv' | 'json') => {
    if (onExport && data) {
      onExport(data, format);
    }
  };

  const handlePredictionClick = (prediction: any) => {
    if (onPredictionClick) {
      onPredictionClick(prediction);
    }
  };

  if (error) {
    return (
      <Card title={title} className={cn('border-red-200', className)}>
        <div className="p-4 text-center text-red-600">
          <p>Chyba při načítání predikcí</p>
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
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1">1 měsíc</option>
              <option value="3">3 měsíce</option>
              <option value="6">6 měsíců</option>
              <option value="12">1 rok</option>
            </select>
            <span className="text-sm text-gray-600">prognóza</span>
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
          <div className="space-y-6">
            {/* Predictions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data?.predictions && Object.entries(data.predictions).map(([key, prediction]) => {
                // Type guard to ensure prediction is PredictionData
                if (!isPredictionData(prediction)) {
                  return null;
                }
                
                return (
                  <div
                    key={key}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors cursor-pointer bg-gradient-to-br from-blue-50 to-indigo-50"
                    onClick={() => handlePredictionClick({ type: key, data: prediction })}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-gray-900 capitalize">
                        {key === 'user_growth' ? 'Růst uživatelů' : 
                         key === 'revenue' ? 'Příjmy' : 'Použití kreditů'}
                      </h4>
                      <div className="flex items-center space-x-1">
                        {getConfidenceIcon(prediction.confidence)}
                        <span className={cn('text-xs font-medium', getConfidenceColor(prediction.confidence))}>
                          {getConfidenceLabel(prediction.confidence)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Aktuální průměr:</span>
                        <span className="font-medium text-gray-900">
                          {formatMetricValue(prediction.current_daily_average, key)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Prognóza:</span>
                        <span className="text-lg font-bold text-blue-600">
                          {formatMetricValue(prediction.projected_total, key)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Jistota:</span>
                        <span className="text-sm font-medium text-gray-700">
                          {Math.round(prediction.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Confidence Overview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center space-x-2">
                <Target className="w-4 h-4 text-blue-600" />
                <span>Přehled jistoty predikcí</span>
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {data?.confidence_levels && Object.entries(data.confidence_levels).map(([key, confidence]) => {
                  // Type guard to ensure confidence is a number
                  if (!isNumber(confidence)) {
                    return null;
                  }
                  
                  return (
                    <div key={key} className="text-center">
                      <div className="text-2xl font-bold text-gray-900">
                        {Math.round(confidence * 100)}%
                      </div>
                      <div className="text-sm text-gray-600 capitalize">
                        {key === 'user_growth' ? 'uživatelé' : 
                         key === 'revenue' ? 'příjmy' : 'kredity'}
                      </div>
                      <div className={cn('text-xs font-medium mt-1', getConfidenceColor(confidence))}>
                        {getConfidenceLabel(confidence)} jistota
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Predictions */}
            {showDetails && data?.predictions && (
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-blue-600" />
                  <span>Detailní predikce</span>
                </h4>
                
                {Object.entries(data.predictions).map(([key, prediction]) => {
                  // Type guard to ensure prediction is PredictionData
                  if (!isPredictionData(prediction)) {
                    return null;
                  }
                  
                  return (
                    <div key={key} className="border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900 mb-3 capitalize">
                        {key === 'user_growth' ? 'Predikce růstu uživatelů' : 
                         key === 'revenue' ? 'Predikce příjmů' : 'Predikce použití kreditů'}
                      </h5>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Aktuální denní průměr:</span>
                            <span className="font-medium text-gray-900">
                              {formatMetricValue(prediction.current_daily_average, key)}
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Prognóza za {formatTimeRange(timeRange)} měsíců:</span>
                            <span className="font-bold text-blue-600">
                              {formatMetricValue(prediction.projected_total, key)}
                            </span>
                          </div>
                          
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Úroveň jistoty:</span>
                            <span className={cn('font-medium', getConfidenceColor(prediction.confidence))}>
                              {Math.round(prediction.confidence * 100)}%
                            </span>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="text-sm text-gray-600">
                            <span className="font-medium">Faktory ovlivňující predikci:</span>
                          </div>
                          <div className="text-sm text-gray-700">
                            {formatFactors(prediction.factors)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
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

export default PredictiveInsightsWidget;
