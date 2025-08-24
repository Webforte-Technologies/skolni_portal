import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, TrendingUp, TrendingDown, Activity, Calendar, Download, Filter } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import UserAnalytics from '../../components/admin/UserAnalytics';
import AdvancedUserFilters from '../../components/admin/AdvancedUserFilters';
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

  useEffect(() => {
    fetchAnalytics();
  }, [filters]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users/analytics', {
        params: filters
      });
      if (response.data.success) {
        setAnalyticsData(response.data.data);
      }
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při načítání analytických dat' });
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: Partial<AnalyticsFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const exportAnalytics = async () => {
    try {
      const response = await api.get('/admin/users/analytics/export', {
        params: filters,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `user-analytics-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
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
              filters={filters}
              onFilterChange={handleFilterChange}
              onApplyFilters={() => setShowFilters(false)}
              onResetFilters={() => {
                setFilters({
                  date_range: '30d',
                  role_filter: 'all',
                  school_filter: 'all',
                  activity_threshold: 0
                });
              }}
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
              data={analyticsData}
              filters={filters}
              onRefresh={fetchAnalytics}
            />
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserAnalyticsPage;
