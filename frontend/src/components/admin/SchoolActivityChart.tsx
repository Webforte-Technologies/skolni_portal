import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { Activity, Users, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';

export interface SchoolActivityData {
  action_type: string;
  count: number;
  date: string;
}

export interface SchoolActivityChartProps {
  schoolId?: string;
  activityData?: SchoolActivityData[];
  schoolName?: string;
  totalActivities?: number;
  activeUsers?: number;
  lastActivity?: string;
}

export const SchoolActivityChart: React.FC<SchoolActivityChartProps> = ({
  schoolId,
  activityData: propActivityData,
  schoolName: propSchoolName,
  totalActivities: propTotalActivities,
  activeUsers: propActiveUsers,
  lastActivity: propLastActivity
}) => {
  const [activityData, setActivityData] = useState<SchoolActivityData[]>(propActivityData || []);
  const [schoolName, setSchoolName] = useState<string>(propSchoolName || '');
  const [totalActivities, setTotalActivities] = useState<number>(propTotalActivities || 0);
  const [activeUsers, setActiveUsers] = useState<number>(propActiveUsers || 0);
  const [lastActivity, setLastActivity] = useState<string | undefined>(propLastActivity);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (schoolId && !propActivityData) {
      fetchSchoolActivity();
    }
  }, [schoolId, propActivityData]);

  const fetchSchoolActivity = async () => {
    if (!schoolId) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/admin/schools/${schoolId}/activity`);
      const data = response.data.data as any;
      
      setActivityData(data?.activities || []);
      setSchoolName(data?.school_name || '');
      setTotalActivities(data?.total_activities || 0);
      setActiveUsers(data?.active_users || 0);
      setLastActivity(data?.last_activity);
    } catch (error: any) {
      showToast({ 
        type: 'error', 
        message: error.response?.data?.error || 'Chyba při načítání aktivity školy' 
      });
    } finally {
      setLoading(false);
    }
  };
  const getActionTypeLabel = (actionType: string): string => {
    const labels: Record<string, string> = {
      'admin_login': 'Přihlášení admina',
      'admin_config': 'Konfigurace admina',
      'teacher_login': 'Přihlášení učitele',
      'teacher_activity': 'Aktivita učitele',
      'material_created': 'Vytvoření materiálu',
      'material_shared': 'Sdílení materiálu',
      'chat_session': 'Chat session',
      'file_generated': 'Vygenerování souboru',
      'credit_used': 'Použití kreditů',
      'user_registered': 'Registrace uživatele'
    };
    return labels[actionType] || actionType;
  };

  const getActionTypeColor = (actionType: string): string => {
    const colors: Record<string, string> = {
      'admin_login': 'bg-blue-100 text-blue-800',
      'admin_config': 'bg-purple-100 text-purple-800',
      'teacher_login': 'bg-green-100 text-green-800',
      'teacher_activity': 'bg-emerald-100 text-emerald-800',
      'material_created': 'bg-orange-100 text-orange-800',
      'material_shared': 'bg-yellow-100 text-yellow-800',
      'chat_session': 'bg-indigo-100 text-indigo-800',
      'file_generated': 'bg-pink-100 text-pink-800',
      'credit_used': 'bg-red-100 text-red-800',
      'user_registered': 'bg-gray-100 text-gray-800'
    };
    return colors[actionType] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getActivityTrend = (): 'increasing' | 'decreasing' | 'stable' => {
    if (activityData.length < 2) return 'stable';
    
    const recent = activityData.slice(0, 3).reduce((sum, item) => sum + item.count, 0);
    const older = activityData.slice(-3).reduce((sum, item) => sum + item.count, 0);
    
    if (recent > older * 1.2) return 'increasing';
    if (recent < older * 0.8) return 'decreasing';
    return 'stable';
  };

  const activityTrend = getActivityTrend();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    );
  }

  // If no data is available, show empty state
  if (!activityData || activityData.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="text-gray-500">Žádná data o aktivitě nejsou k dispozici</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Aktivita školy</h3>
          <p className="text-gray-600">{schoolName}</p>
        </div>
        <Activity className="h-8 w-8 text-blue-600" />
      </div>

      {/* Activity Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Celkem aktivit</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-1">{totalActivities}</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">Aktivní uživatelé</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-1">{activeUsers}</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Poslední aktivita</span>
          </div>
          <p className="text-lg font-semibold text-purple-900 mt-1">
            {lastActivity ? formatDate(lastActivity) : 'N/A'}
          </p>
        </div>
      </div>

      {/* Activity Trend */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-medium text-gray-700">Trend aktivity:</span>
          {activityTrend === 'increasing' && (
            <div className="flex items-center gap-1 text-green-600">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm">Rostoucí</span>
            </div>
          )}
          {activityTrend === 'decreasing' && (
            <div className="flex items-center gap-1 text-red-600">
              <TrendingDown className="h-4 w-4" />
              <span className="text-sm">Klesající</span>
            </div>
          )}
          {activityTrend === 'stable' && (
            <div className="flex items-center gap-1 text-gray-600">
              <span className="text-sm">Stabilní</span>
            </div>
          )}
        </div>
      </div>

      {/* Activity Breakdown */}
      <div>
        <h4 className="text-lg font-medium text-gray-900 mb-4">Rozdělení aktivit podle typu</h4>
        <div className="space-y-3">
          {activityData.map((activity, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <Badge className={getActionTypeColor(activity.action_type)}>
                  {getActionTypeLabel(activity.action_type)}
                </Badge>
                <span className="text-sm text-gray-600">
                  {formatDate(activity.date)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold text-gray-900">
                  {activity.count}
                </span>
                <span className="text-sm text-gray-500">aktivit</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Activity Timeline */}
      {activityData.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Časová osa aktivit</h4>
          <div className="relative">
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
            {activityData.slice(0, 10).map((activity, index) => (
              <div key={index} className="relative flex items-center gap-4 mb-4">
                <div className="absolute left-3 w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="ml-8">
                  <p className="text-sm font-medium text-gray-900">
                    {getActionTypeLabel(activity.action_type)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDate(activity.date)} • {activity.count} aktivit
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default SchoolActivityChart;
