import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, TrendingUp, TrendingDown, Activity, Calendar, Download, Filter } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import UserAnalytics from '../../components/admin/UserAnalytics';
import AdvancedUserFilters, { AdvancedUserFilters as AdvancedUserFiltersType } from '../../components/admin/AdvancedUserFilters';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';

interface UserAnalyticsData {
  total_users: number;
  active_users: number;
  new_users_this_month: number;
  new_users_this_week: number;
  total_logins_today: number;
  total_logins_this_week: number;
  total_logins_this_month: number;
  average_session_duration: number;
  most_active_hours: Array<{ hour: number; count: number }>;
  user_growth_data: Array<{ date: string; count: number }>;
  role_distribution: Array<{ role: string; count: number }>;
  school_distribution: Array<{ school_name: string; count: number }>;
  credit_usage_stats: {
    total_credits_used: number;
    total_credits_earned: number;
    average_credits_per_user: number;
  };
  top_active_users: Array<{
    id: string;
    name: string;
    email: string;
    activity_count: number;
    last_login: string;
  }>;
  user_engagement_metrics: {
    daily_active_users: number;
    weekly_active_users: number;
    monthly_active_users: number;
    retention_rate: number;
  };
  // Additional properties required by UserAnalytics component
  total_schools: number;
  total_credits_purchased: number;
  most_active_school: string;
  user_growth_rate: number;
  role_distribution_detailed: {
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

interface AnalyticsFilters {
  date_range: string;
  role_filter: string;
  school_filter: string;
  activity_threshold: number;
}

const UserAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [analyticsData, setAnalyticsData] = useState<UserAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<AnalyticsFilters>({
    date_range: '30d',
    role_filter: 'all',
    school_filter: 'all',
    activity_threshold: 0
  });
  const [showFilters, setShowFilters] = useState(false);

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<UserAnalyticsData>('/admin/users/analytics', {
        params: filters
      });
      if (response.data.success && response.data.data) {
        setAnalyticsData(response.data.data);
      }
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při načítání analytických dat' });
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const exportAnalytics = async () => {
    try {
      const response = await api.get('/admin/users/analytics/export', {
        params: filters,
        responseType: 'blob'
      });
      
      // Handle blob response properly
      const blob = new Blob([response.data as unknown as BlobPart]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `user-analytics-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showToast({ type: 'success', message: 'Analytická data byla exportována' });
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při exportu dat' });
    }
  };

  const getMetricCard = (title: string, value: string | number, icon: React.ReactNode, trend?: { value: number; isPositive: boolean }) => (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="flex items-center mt-1">
              {trend.isPositive ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
            </div>
          )}
        </div>
        <div className="text-blue-500">
          {icon}
        </div>
      </div>
    </Card>
  );

  if (loading && !analyticsData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Načítání analytických dat...</div>
        </div>
      </AdminLayout>
    );
  }

  // Convert AnalyticsFilters to AdvancedUserFilters format
  const advancedFilters: AdvancedUserFiltersType = {
    search: '',
    role: filters.role_filter === 'all' ? 'all' : filters.role_filter,
    school_id: filters.school_filter === 'all' ? 'all' : filters.school_filter,
    is_active: 'all',
    date_from: '',
    date_to: '',
    credit_min: '',
    credit_max: '',
    last_login_from: '',
    last_login_to: '',
    status: 'all'
  };

  // Convert UserAnalyticsData to match UserAnalytics component interface
  const userAnalyticsData = analyticsData ? {
    total_users: analyticsData.total_users,
    active_users: analyticsData.active_users,
    new_users_this_month: analyticsData.new_users_this_month,
    total_schools: analyticsData.total_schools,
    total_credits_used: analyticsData.credit_usage_stats.total_credits_used,
    total_credits_purchased: analyticsData.total_credits_purchased,
    average_session_duration: analyticsData.average_session_duration,
    most_active_school: analyticsData.most_active_school,
    user_growth_rate: analyticsData.user_growth_rate,
    retention_rate: analyticsData.user_engagement_metrics.retention_rate,
    role_distribution: {
      platform_admin: analyticsData.role_distribution.find(r => r.role === 'platform_admin')?.count || 0,
      school_admin: analyticsData.role_distribution.find(r => r.role === 'school_admin')?.count || 0,
      teacher_school: analyticsData.role_distribution.find(r => r.role === 'teacher_school')?.count || 0,
      teacher_individual: analyticsData.role_distribution.find(r => r.role === 'teacher_individual')?.count || 0
    },
    activity_by_day: analyticsData.user_growth_data.map(item => ({
      date: item.date,
      logins: item.count,
      actions: 0,
      credits_used: 0
    })),
    top_schools: analyticsData.school_distribution.map(item => ({
      name: item.school_name,
      user_count: item.count,
      total_credits_used: 0
    })),
    user_engagement: {
      high: Math.round(analyticsData.user_engagement_metrics.retention_rate),
      medium: Math.round((100 - analyticsData.user_engagement_metrics.retention_rate) / 2),
      low: Math.round((100 - analyticsData.user_engagement_metrics.retention_rate) / 2)
    }
  } : undefined;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/admin/users')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zpět na seznam
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analýza uživatelů</h1>
              <p className="text-gray-600">Komplexní přehled uživatelské aktivity a statistik</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 mr-2" />
              Filtry
            </Button>
            <Button variant="outline" onClick={exportAnalytics}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card>
            <AdvancedUserFilters
              filters={advancedFilters}
              onFiltersChange={(newFilters) => {
                setFilters(prev => ({
                  ...prev,
                  role_filter: newFilters.role === 'all' ? 'all' : newFilters.role,
                  school_filter: newFilters.school_id === 'all' ? 'all' : newFilters.school_id
                }));
              }}
              schools={[]}
            />
          </Card>
        )}

        {analyticsData && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {getMetricCard(
                'Celkem uživatelů',
                analyticsData.total_users.toLocaleString(),
                <Users className="w-6 h-6" />
              )}
              {getMetricCard(
                'Aktivní uživatelé',
                analyticsData.active_users.toLocaleString(),
                <Activity className="w-6 h-6" />,
                { value: Math.round((analyticsData.active_users / analyticsData.total_users) * 100), isPositive: true }
              )}
              {getMetricCard(
                'Noví uživatelé (měsíc)',
                analyticsData.new_users_this_month,
                <TrendingUp className="w-6 h-6" />
              )}
              {getMetricCard(
                'Přihlášení dnes',
                analyticsData.total_logins_today,
                <Calendar className="w-6 h-6" />
              )}
            </div>

            {/* Detailed Analytics */}
            <UserAnalytics 
              data={userAnalyticsData}
              timeRange="30d"
              onTimeRangeChange={() => {}}
            />
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserAnalyticsPage;
