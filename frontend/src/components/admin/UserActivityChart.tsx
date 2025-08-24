import React, { useState, useEffect, useCallback } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { api } from '../../services/apiClient';

export interface UserActivityData {
  date: string;
  logins: number;
  actions: number;
  credits_used: number;
  sessions: number;
}

export interface UserActivityStats {
  total_logins: number;
  total_actions: number;
  total_credits_used: number;
  average_session_duration: number;
  most_active_day: string;
  most_active_hour: number;
  last_activity: string;
  activity_trend: 'increasing' | 'decreasing' | 'stable';
}

interface UserActivityChartProps {
  userId: string;
}

const UserActivityChart: React.FC<UserActivityChartProps> = ({
  userId
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'logins' | 'actions' | 'credits' | 'sessions'>('logins');
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [activityData, setActivityData] = useState<UserActivityData[]>([]);
  const [activityStats, setActivityStats] = useState<UserActivityStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchActivityChartData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users/${userId}/activity-chart`, {
        params: { timeRange }
      });
      
      if (response.data.success) {
        const responseData = response.data.data as {
          activityData: UserActivityData[];
          activityStats: UserActivityStats;
        };
        setActivityData(responseData.activityData || []);
        setActivityStats(responseData.activityStats || null);
      }
    } catch (error) {
      console.error('Failed to fetch activity chart data:', error);
      setActivityData([]);
      setActivityStats(null);
    } finally {
      setLoading(false);
    }
  }, [userId, timeRange]);

  useEffect(() => {
    fetchActivityChartData();
  }, [fetchActivityChartData]);

  const handleTimeRangeChange = (range: '7d' | '30d' | '90d') => {
    setTimeRange(range);
  };

  const timeRangeOptions = [
    { value: '7d', label: '7 dní' },
    { value: '30d', label: '30 dní' },
    { value: '90d', label: '90 dní' }
  ];

  const metricOptions = [
    { value: 'logins', label: 'Přihlášení', color: '#4A90E2' },
    { value: 'actions', label: 'Akce', color: '#28A745' },
    { value: 'credits', label: 'Kredity', color: '#FFC107' },
    { value: 'sessions', label: 'Relace', color: '#17A2B8' }
  ];

  const getActivityTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return '↗️';
      case 'decreasing':
        return '↘️';
      case 'stable':
        return '→';
      default:
        return '→';
    }
  };

  const getActivityTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return 'text-green-600';
      case 'decreasing':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatTime = (hour: number) => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const renderSimpleChart = () => {
    if (!activityData.length) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          Žádná data k zobrazení
        </div>
      );
    }

    const maxValue = Math.max(...activityData.map(d => d[selectedMetric as keyof UserActivityData] as number));

    return (
      <div className="space-y-2">
        {activityData.map((data, index) => {
          const value = data[selectedMetric as keyof UserActivityData] as number;
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const metricColor = metricOptions.find(m => m.value === selectedMetric)?.color || '#4A90E2';
          
          return (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-16 text-xs text-gray-600">
                {new Date(data.date).toLocaleDateString('cs-CZ', { 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-4">
                <div
                  className="h-4 rounded-full transition-all duration-300"
                  style={{
                    width: `${percentage}%`,
                    backgroundColor: metricColor
                  }}
                />
              </div>
              <div className="w-12 text-xs text-gray-700 text-right">
                {value}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Card className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Aktivita uživatele</h3>
          {userId && (
            <p className="text-sm text-gray-600">ID: {userId}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {timeRangeOptions.map((option) => (
            <Button
              key={option.value}
              variant={timeRange === option.value ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => handleTimeRangeChange(option.value as '7d' | '30d' | '90d')}
              disabled={loading}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Metric selector */}
      <div className="flex flex-wrap gap-2">
        {metricOptions.map((option) => (
          <Button
            key={option.value}
            variant={selectedMetric === option.value ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedMetric(option.value as any)}
            disabled={loading}
          >
            {option.label}
          </Button>
        ))}
      </div>

      {/* Activity statistics */}
      {activityStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">Celkem přihlášení</p>
                <p className="text-2xl font-bold text-blue-900">{activityStats.total_logins}</p>
              </div>
              <div className="text-blue-400">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Celkem akcí</p>
                <p className="text-2xl font-bold text-green-900">{activityStats.total_actions}</p>
              </div>
              <div className="text-green-400">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600 font-medium">Použité kredity</p>
                <p className="text-2xl font-bold text-yellow-900">{activityStats.total_credits_used}</p>
              </div>
              <div className="text-yellow-400">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-cyan-50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-cyan-600 font-medium">Průměrná relace</p>
                <p className="text-2xl font-bold text-cyan-900">
                  {formatDuration(activityStats.average_session_duration)}
                </p>
              </div>
              <div className="text-cyan-400">
                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity insights */}
      {activityStats && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-md font-medium text-gray-900 mb-3">Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Nejaktivnější den:</span>
              <Badge variant="outline">{activityStats.most_active_day}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Nejaktivnější hodina:</span>
              <Badge variant="outline">{formatTime(activityStats.most_active_hour)}</Badge>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Trend:</span>
              <span className={`text-sm font-medium ${getActivityTrendColor(activityStats.activity_trend)}`}>
                {getActivityTrendIcon(activityStats.activity_trend)} {activityStats.activity_trend}
              </span>
            </div>
          </div>
          {activityStats.last_activity && (
            <div className="mt-3 pt-3 border-t border-gray-200">
              <span className="text-sm text-gray-600">
                Poslední aktivita: {new Date(activityStats.last_activity).toLocaleString('cs-CZ')}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Activity chart */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-3">
          {metricOptions.find(m => m.value === selectedMetric)?.label} v čase
        </h4>
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            renderSimpleChart()
          )}
        </div>
      </div>

      {/* Summary */}
      {activityData.length > 0 && (
        <div className="text-sm text-gray-600">
          <p>
            Zobrazeno {activityData.length} dní aktivit za poslední {timeRange === '7d' ? '7 dní' : timeRange === '30d' ? '30 dní' : '90 dní'}
          </p>
        </div>
      )}
    </Card>
  );
};

export default UserActivityChart;
