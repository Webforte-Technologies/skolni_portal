import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';

export interface UserAnalyticsData {
  total_users: number;
  active_users: number;
  new_users_this_month: number;
  total_schools: number;
  total_credits_used: number;
  total_credits_purchased: number;
  average_session_duration: number;
  most_active_school: string;
  user_growth_rate: number;
  retention_rate: number;
  role_distribution: {
    platform_admin: number;
    school_admin: number;
    teacher_school: number;
    teacher_individual: number;
  };
  activity_by_day: Array<{
    date: string;
    logins: number;
    actions: number;
    credits_used: number;
  }>;
  top_schools: Array<{
    name: string;
    user_count: number;
    total_credits_used: number;
  }>;
  user_engagement: {
    high: number;
    medium: number;
    low: number;
  };
}

interface UserAnalyticsProps {
  data?: UserAnalyticsData;
  timeRange: '7d' | '30d' | '90d' | '1y';
  onTimeRangeChange: (range: '7d' | '30d' | '90d' | '1y') => void;
  loading?: boolean;
}

const UserAnalytics: React.FC<UserAnalyticsProps> = ({
  data,
  timeRange,
  onTimeRangeChange,
  loading = false
}) => {
  const [selectedMetric, setSelectedMetric] = useState<'logins' | 'actions' | 'credits'>('logins');

  const timeRangeOptions = [
    { value: '7d', label: '7 dní' },
    { value: '30d', label: '30 dní' },
    { value: '90d', label: '90 dní' },
    { value: '1y', label: '1 rok' }
  ];

  const metricOptions = [
    { value: 'logins', label: 'Přihlášení', color: '#4A90E2' },
    { value: 'actions', label: 'Akce', color: '#28A745' },
    { value: 'credits', label: 'Kredity', color: '#FFC107' }
  ];

  const getGrowthColor = (rate: number) => {
    if (rate > 0) return 'text-green-600';
    if (rate < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (rate: number) => {
    if (rate > 0) return '↗️';
    if (rate < 0) return '↘️';
    return '→';
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('cs-CZ').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num > 0 ? '+' : ''}${num.toFixed(1)}%`;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const renderSimpleChart = (data: Array<{ date: string; [key: string]: any }>) => {
    if (!data.length) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          Žádná data k zobrazení
        </div>
      );
    }

    const maxValue = Math.max(...data.map(d => d[selectedMetric] || 0));

    return (
      <div className="space-y-2">
        {data.slice(-10).map((item, index) => {
          const value = item[selectedMetric] || 0;
          const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
          const metricColor = metricOptions.find(m => m.value === selectedMetric)?.color || '#4A90E2';
          
          return (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-16 text-xs text-gray-600">
                {new Date(item.date).toLocaleDateString('cs-CZ', { 
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
                {formatNumber(value)}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (!data) {
    return (
      <Card className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Načítání analytických dat...</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Analytika uživatelů</h3>
            <p className="text-sm text-gray-600">Přehled aktivit a trendů</p>
          </div>
          <div className="flex items-center space-x-2">
            {timeRangeOptions.map((option) => (
              <Button
                key={option.value}
                variant={timeRange === option.value ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => onTimeRangeChange(option.value as any)}
                disabled={loading}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Celkem uživatelů</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.total_users)}</p>
              <div className="flex items-center mt-1">
                <span className={`text-sm font-medium ${getGrowthColor(data.user_growth_rate)}`}>
                  {getGrowthIcon(data.user_growth_rate)} {formatPercentage(data.user_growth_rate)}
                </span>
                <span className="text-xs text-gray-500 ml-1">vs. minulé období</span>
              </div>
            </div>
            <div className="text-blue-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Aktivní uživatelé</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.active_users)}</p>
              <p className="text-sm text-gray-500">
                {((data.active_users / data.total_users) * 100).toFixed(1)}% z celkového počtu
              </p>
            </div>
            <div className="text-green-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Noví uživatelé</p>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(data.new_users_this_month)}</p>
              <p className="text-sm text-gray-500">Tento měsíc</p>
            </div>
            <div className="text-purple-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 font-medium">Retention rate</p>
              <p className="text-2xl font-bold text-gray-900">{data.retention_rate.toFixed(1)}%</p>
              <p className="text-sm text-gray-500">Míra udržení</p>
            </div>
            <div className="text-yellow-400">
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Chart */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-gray-900">Aktivita v čase</h4>
            <div className="flex space-x-2">
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
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              renderSimpleChart(data.activity_by_day)
            )}
          </div>
        </div>
      </Card>

      {/* Role Distribution and Engagement */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <h4 className="text-md font-medium text-gray-900 mb-4">Rozložení rolí</h4>
          <div className="space-y-3">
            {Object.entries(data.role_distribution).map(([role, count]) => {
              const percentage = ((count / data.total_users) * 100).toFixed(1);
              const roleLabels: Record<string, string> = {
                'platform_admin': 'Platform Admin',
                'school_admin': 'School Admin',
                'teacher_school': 'School Teacher',
                'teacher_individual': 'Individual Teacher'
              };
              
              return (
                <div key={role} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{roleLabels[role]}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {formatNumber(count)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <h4 className="text-md font-medium text-gray-900 mb-4">Engagement uživatelů</h4>
          <div className="space-y-3">
            {Object.entries(data.user_engagement).map(([level, count]) => {
              const percentage = ((count / data.total_users) * 100).toFixed(1);
              const levelLabels: Record<string, string> = {
                'high': 'Vysoký',
                'medium': 'Střední',
                'low': 'Nízký'
              };
              const levelColors: Record<string, string> = {
                'high': 'bg-green-500',
                'medium': 'bg-yellow-500',
                'low': 'bg-red-500'
              };
              
              return (
                <div key={level} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">{levelLabels[level]}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${levelColors[level]}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">
                      {formatNumber(count)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Top Schools */}
      <Card>
        <h4 className="text-md font-medium text-gray-900 mb-4">Nejaktivnější školy</h4>
        <div className="space-y-3">
          {data.top_schools.map((school, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">{school.name}</p>
                  <p className="text-sm text-gray-600">{formatNumber(school.user_count)} uživatelů</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">{formatNumber(school.total_credits_used)}</p>
                <p className="text-sm text-gray-600">kreditů</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 font-medium">Celkem škol</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(data.total_schools)}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 font-medium">Použité kredity</p>
            <p className="text-2xl font-bold text-gray-900">{formatNumber(data.total_credits_used)}</p>
          </div>
        </Card>

        <Card>
          <div className="text-center">
            <p className="text-sm text-gray-600 font-medium">Průměrná relace</p>
            <p className="text-2xl font-bold text-gray-900">{formatDuration(data.average_session_duration)}</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserAnalytics;
