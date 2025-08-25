import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Filter, Download, RefreshCw, Eye, AlertTriangle, Clock } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import UserActivityChart from '../../components/admin/UserActivityChart';
import UserActivityLog, { ActivityLogEntry } from '../../components/admin/UserActivityLog';
import AdvancedUserFilters, { AdvancedUserFilters as AdvancedUserFiltersType } from '../../components/admin/AdvancedUserFilters';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';

interface UserActivityData {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  action_type: string;
  description: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  session_duration?: number;
  resource_accessed?: string;
  success: boolean;
  error_message?: string;
}

interface ActivityFilters {
  date_range: string;
  user_filter: string;
  action_type: string;
  success_filter: string;
  ip_filter: string;
  limit: number;
}

interface ActivityStats {
  total_activities: number;
  unique_users: number;
  failed_activities: number;
  average_session_duration: number;
  most_common_actions: Array<{ action: string; count: number }>;
  peak_activity_hours: Array<{ hour: number; count: number }>;
}

const UserActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [activities, setActivities] = useState<UserActivityData[]>([]);
  const [activityStats, setActivityStats] = useState<ActivityStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ActivityFilters>({
    date_range: '24h',
    user_filter: 'all',
    action_type: 'all',
    success_filter: 'all',
    ip_filter: '',
    limit: 100
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<UserActivityData | null>(null);

  const fetchActivityLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<UserActivityData[]>('/admin/users/activity-logs', {
        params: filters
      });
      if (response.data.success && response.data.data) {
        setActivities(response.data.data);
      }
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při načítání aktivit' });
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  const fetchActivityStats = useCallback(async () => {
    try {
      const response = await api.get<ActivityStats>('/admin/users/activity-logs/stats', {
        params: { date_range: filters.date_range }
      });
      if (response.data.success && response.data.data) {
        setActivityStats(response.data.data);
      }
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při načítání statistik' });
    }
  }, [filters.date_range, showToast]);

  useEffect(() => {
    if (filters.user_filter === 'all') {
      fetchActivityLogs();
      fetchActivityStats();
    }
  }, [filters.user_filter, filters.date_range, filters.action_type, filters.success_filter, filters.ip_filter, filters.limit, fetchActivityLogs, fetchActivityStats]);

  // Removed unused handleFilterChange function

  const exportActivityLogs = async () => {
    try {
      const response = await api.get('/admin/users/activity-logs/export', {
        params: filters,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data as unknown as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `activity-logs-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showToast({ type: 'success', message: 'Aktivity byly exportovány' });
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při exportu aktivit' });
    }
  };

  const getActionTypeColor = (actionType: string) => {
    switch (actionType.toLowerCase()) {
      case 'login':
        return 'bg-green-100 text-green-800';
      case 'logout':
        return 'bg-gray-100 text-gray-800';
      case 'create':
        return 'bg-blue-100 text-blue-800';
      case 'update':
        return 'bg-yellow-100 text-yellow-800';
      case 'delete':
        return 'bg-red-100 text-red-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSuccessIcon = (success: boolean) => {
    return success ? (
      <div className="w-2 h-2 bg-green-500 rounded-full" />
    ) : (
      <div className="w-2 h-2 bg-red-500 rounded-full" />
    );
  };

  // Convert UserActivityData to ActivityLogEntry for UserActivityLog component
  const convertToActivityLogEntries = (activities: UserActivityData[]): ActivityLogEntry[] => {
    return activities.map(activity => ({
      id: activity.id,
      user_id: activity.user_id,
      user_name: activity.user_name,
      user_email: activity.user_email,
      action_type: activity.action_type as ActivityLogEntry['action_type'],
      details: activity.description,
      ip_address: activity.ip_address,
      user_agent: activity.user_agent,
      timestamp: activity.created_at,
      created_at: activity.created_at
    }));
  };

  // Create filters for AdvancedUserFilters component
  const createAdvancedFilters = (): AdvancedUserFiltersType => ({
    search: '',
    role: 'all',
    school_id: 'all',
    is_active: 'all',
    date_from: '',
    date_to: '',
    credit_min: '',
    credit_max: '',
    last_login_from: '',
    last_login_to: '',
    status: 'all'
  });

  const handleAdvancedFilterChange = (newFilters: AdvancedUserFiltersType) => {
    // Map advanced filters to activity filters if needed
    setFilters(prev => ({
      ...prev,
      // Map date filters if provided
      date_range: newFilters.date_from && newFilters.date_to ? 'custom' : prev.date_range,
      // Add more mapping logic here if needed
    }));
  };

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
              <h1 className="text-2xl font-bold text-gray-900">Aktivita uživatelů</h1>
              <p className="text-gray-600">Monitorování uživatelských aktivit a chování</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 mr-2" />
              Filtry
            </Button>
            <Button variant="outline" onClick={fetchActivityLogs} disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Obnovit
            </Button>
            <Button variant="outline" onClick={exportActivityLogs}>
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card>
            <AdvancedUserFilters
              filters={createAdvancedFilters()}
              onFiltersChange={handleAdvancedFilterChange}
              schools={[]}
            />
          </Card>
        )}

        {/* Activity Stats */}
        {activityStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Celkem aktivit</p>
                  <p className="text-2xl font-bold text-gray-900">{activityStats.total_activities.toLocaleString()}</p>
                </div>
                <Activity className="w-6 h-6 text-blue-500" />
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Unikátní uživatelé</p>
                  <p className="text-2xl font-bold text-gray-900">{activityStats.unique_users}</p>
                </div>
                <Eye className="w-6 h-6 text-green-500" />
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Neúspěšné aktivity</p>
                  <p className="text-2xl font-bold text-gray-900">{activityStats.failed_activities}</p>
                </div>
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
            </Card>
            <Card>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Průměrná session</p>
                  <p className="text-2xl font-bold text-gray-900">{Math.round(activityStats.average_session_duration)} min</p>
                </div>
                <Clock className="w-6 h-6 text-yellow-500" />
              </div>
            </Card>
          </div>
        )}

        {/* Activity Chart */}
        <Card title="Aktivita v čase" icon={<Activity className="w-5 h-5" />}>
          <UserActivityChart 
            userId="all"
          />
        </Card>

        {/* Activity Log */}
        <Card title="Historie aktivit" icon={<Activity className="w-5 h-5" />}>
          <UserActivityLog 
            logs={convertToActivityLogEntries(activities)}
            loading={loading}
            onFilterChange={() => {
              // Handle filter changes if needed
            }}
            onExport={exportActivityLogs}
          />
        </Card>

        {/* Activity Detail Modal */}
        {selectedActivity && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Detail aktivity</h3>
                <Button variant="outline" onClick={() => setSelectedActivity(null)}>
                  Zavřít
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Uživatel</label>
                  <p className="text-sm text-gray-900">{selectedActivity.user_name} ({selectedActivity.user_email})</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Typ akce</label>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getActionTypeColor(selectedActivity.action_type)}`}>
                    {selectedActivity.action_type}
                  </span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Popis</label>
                  <p className="text-sm text-gray-900">{selectedActivity.description}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Čas</label>
                  <p className="text-sm text-gray-900">{new Date(selectedActivity.created_at).toLocaleString('cs-CZ')}</p>
                </div>
                
                {selectedActivity.ip_address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">IP adresa</label>
                    <p className="text-sm text-gray-900">{selectedActivity.ip_address}</p>
                  </div>
                )}
                
                {selectedActivity.user_agent && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">User Agent</label>
                    <p className="text-sm text-gray-900 break-all">{selectedActivity.user_agent}</p>
                  </div>
                )}
                
                {selectedActivity.session_duration && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Délka session</label>
                    <p className="text-sm text-gray-900">{selectedActivity.session_duration} minut</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Stav</label>
                  <div className="flex items-center gap-2">
                    {getSuccessIcon(selectedActivity.success)}
                    <span className="text-sm text-gray-900">
                      {selectedActivity.success ? 'Úspěšné' : 'Neúspěšné'}
                    </span>
                  </div>
                </div>
                
                {selectedActivity.error_message && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Chybová zpráva</label>
                    <p className="text-sm text-red-600">{selectedActivity.error_message}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserActivityPage;
