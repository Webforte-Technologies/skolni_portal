import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, Info, XCircle, Bell, RefreshCw, Filter, Eye } from 'lucide-react';
import Card from '../../ui/Card';
import { useRealTimeData } from '../../../hooks/useRealTimeData';
import { cn } from '../../../utils/cn';
import Button from '../../ui/Button';

export interface SystemAlert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  description?: string;
  metricValue?: number;
  thresholdValue?: number;
  timestamp: string;
  acknowledged?: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
  resolved?: boolean;
  resolvedAt?: string;
  metadata?: Record<string, any>;
}

export interface AlertPanelWidgetProps {
  title: string;
  endpoint: string;
  refreshInterval?: number;
  maxAlerts?: number;
  showFilters?: boolean;
  showActions?: boolean;
  className?: string;
  onAlertClick?: (alert: SystemAlert) => void;
  onAcknowledge?: (alertId: string) => void;
  onResolve?: (alertId: string) => void;
}

const AlertPanelWidget: React.FC<AlertPanelWidgetProps> = ({
  title,
  endpoint,
  refreshInterval = 15000, // More frequent updates for alerts
  maxAlerts = 10,
  showFilters = true,
  showActions = true,
  className = '',
  onAlertClick,
  onAcknowledge,
  onResolve
}) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [showResolved, setShowResolved] = useState(false);
  const [showAcknowledged, setShowAcknowledged] = useState(true);

  const { data, loading, error, refresh, isAutoRefreshing, lastUpdated } = useRealTimeData({
    endpoint,
    refreshInterval,
    autoRefresh: true
  });

  // Filter alerts based on current filters
  const filteredAlerts = React.useMemo(() => {
    if (!data) return [];

    let alerts: SystemAlert[] = Array.isArray(data) ? data : data?.alerts || [];
    
    // Apply severity filter
    if (filterSeverity !== 'all') {
      alerts = alerts.filter(alert => alert.severity === filterSeverity);
    }

    // Apply resolved filter
    if (!showResolved) {
      alerts = alerts.filter(alert => !alert.resolved);
    }

    // Apply acknowledged filter
    if (!showAcknowledged) {
      alerts = alerts.filter(alert => !alert.acknowledged);
    }

    // Sort by severity and timestamp with safe fallbacks
    alerts.sort((a, b) => {
      const severityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityA = severityOrder[a.severity?.toLowerCase()] || 0;
      const severityB = severityOrder[b.severity?.toLowerCase()] || 0;
      const severityDiff = severityB - severityA;
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return alerts.slice(0, maxAlerts);
  }, [data, filterSeverity, showResolved, showAcknowledged, maxAlerts]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'high':
        return <AlertTriangle className="w-5 h-5 text-orange-600" />;
      case 'medium':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'low':
        return <Info className="w-4 h-4 text-blue-600" />;
      default:
        return <Info className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'high':
        return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'medium':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Právě teď';
    if (diffMins < 60) {
      if (diffMins === 1) return 'Před 1 minutou';
      return `Před ${diffMins} minutami`;
    }
    if (diffHours < 24) {
      if (diffHours === 1) return 'Před 1 hodinou';
      return `Před ${diffHours} hodinami`;
    }
    if (diffDays < 7) {
      if (diffDays === 1) return 'Před 1 dnem';
      return `Před ${diffDays} dny`;
    }
    return date.toLocaleDateString();
  };

  const handleAcknowledge = (alertId: string) => {
    if (onAcknowledge) {
      onAcknowledge(alertId);
    }
  };

  const handleResolve = (alertId: string) => {
    if (onResolve) {
      onResolve(alertId);
    }
  };

  if (error) {
    return (
      <Card title={title} className={cn('bg-red-50 border-red-200', className)}>
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">Chyba při načítání upozornění</div>
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

  const criticalAlerts = filteredAlerts.filter(alert => alert.severity === 'critical');
  const highAlerts = filteredAlerts.filter(alert => alert.severity === 'high');

  return (
    <Card 
      title={title} 
      className={cn('relative', className)}
      icon={<Bell className="w-5 h-5" />}
    >
      {/* Alert summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600">{criticalAlerts.length}</div>
          <div className="text-sm text-red-700">Kritická</div>
        </div>
        <div className="text-center p-3 bg-orange-50 rounded-lg">
          <div className="text-2xl font-bold text-orange-600">{highAlerts.length}</div>
          <div className="text-sm text-orange-700">Vysoká</div>
        </div>
        <div className="text-center p-3 bg-yellow-50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-600">
            {filteredAlerts.filter(alert => alert.severity === 'medium').length}
          </div>
          <div className="text-sm text-yellow-700">Střední</div>
        </div>
        <div className="text-center p-3 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-blue-600">
            {filteredAlerts.filter(alert => alert.severity === 'low').length}
          </div>
          <div className="text-sm text-blue-700">Nízká</div>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
          {/* Severity filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Všechny úrovně</option>
              <option value="critical">Kritická</option>
              <option value="high">Vysoká</option>
              <option value="medium">Střední</option>
              <option value="low">Nízká</option>
            </select>
          </div>

          {/* Show resolved toggle */}
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-gray-500" />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showResolved}
                onChange={(e) => setShowResolved(e.target.checked)}
                className="rounded border-gray-300"
              />
              Zobrazit vyřešené
            </label>
          </div>

          {/* Show acknowledged toggle */}
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-gray-500" />
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={showAcknowledged}
                onChange={(e) => setShowAcknowledged(e.target.checked)}
                className="rounded border-gray-300"
              />
              Zobrazit potvrzené
            </label>
          </div>

          {/* Auto-refresh indicator */}
          <div className="flex items-center gap-2 ml-auto">
            <div className={cn(
              'w-2 h-2 rounded-full',
              isAutoRefreshing ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
            )} />
            <span className="text-xs text-gray-500">
              {isAutoRefreshing ? 'Auto-aktualizace' : 'Manuální'}
            </span>
          </div>
        </div>
      )}

      {/* Alerts list */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <p>Žádná upozornění</p>
            {lastUpdated && (
              <p className="text-xs mt-1">
                Poslední kontrola: {lastUpdated.toLocaleTimeString()}
              </p>
            )}
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={cn(
                'p-4 rounded-lg border cursor-pointer transition-all hover:shadow-md',
                getSeverityColor(alert.severity),
                alert.resolved && 'opacity-60',
                onAlertClick && 'hover:scale-[1.02]'
              )}
              onClick={() => onAlertClick?.(alert)}
            >
              <div className="flex items-start gap-3">
                {getSeverityIcon(alert.severity)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{alert.message}</span>
                    <span className={cn(
                      'px-2 py-1 rounded-full text-xs font-medium',
                      getSeverityBadgeColor(alert.severity)
                    )}>
                      {alert.severity}
                    </span>
                    {alert.acknowledged && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        Potvrzeno
                      </span>
                    )}
                    {alert.resolved && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        Vyřešeno
                      </span>
                    )}
                  </div>
                  
                  {alert.description && (
                    <p className="text-sm opacity-80 mb-2">{alert.description}</p>
                  )}
                  
                  {alert.metricValue !== undefined && alert.thresholdValue !== undefined && (
                    <div className="text-sm opacity-80 mb-2">
                      Hodnota: {alert.metricValue} (limit: {alert.thresholdValue})
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs opacity-70">
                    <span>{formatTimestamp(alert.timestamp)}</span>
                    {alert.acknowledgedBy && (
                      <span>Potvrdil: {alert.acknowledgedBy}</span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {showActions && !alert.resolved && (
                  <div className="flex items-center gap-2">
                    {!alert.acknowledged && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcknowledge(alert.id);
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Potvrdit
                      </Button>
                    )}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleResolve(alert.id);
                      }}
                      variant="outline"
                      size="sm"
                    >
                      Vyřešit
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          {filteredAlerts.length} upozornění zobrazeno
        </div>
        
        <Button
          onClick={refresh}
          variant="secondary"
          size="sm"
          disabled={loading}
        >
          <RefreshCw className={cn('w-4 h-4 mr-2', loading && 'animate-spin')} />
          Obnovit
        </Button>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <div className="text-sm text-gray-600">Kontrola upozornění...</div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AlertPanelWidget;
