import React, { useState, useEffect, useCallback } from 'react';
import { Activity, Clock, Filter, Calendar, TrendingUp, BarChart3, Download } from 'lucide-react';
import { Button, Card, Badge } from '../ui';
import { teacherService, TeacherActivityResponse } from '../../services/teacherService';
import { errorToMessage } from '../../services/apiClient';

interface TeacherActivityLogProps {
  teacherId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface ActivityFilters {
  limit: number;
  offset: number;
  activity_type?: string;
  start_date?: string;
  end_date?: string;
  time_range?: '7d' | '30d' | '90d';
}

const TeacherActivityLog: React.FC<TeacherActivityLogProps> = ({
  teacherId,
  isOpen,
  onClose
}) => {
  const [activityData, setActivityData] = useState<TeacherActivityResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ActivityFilters>({
    limit: 50,
    offset: 0,
    time_range: '30d'
  });

  const fetchActivity = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await teacherService.getTeacherActivity(teacherId, filters);
      setActivityData(response);
    } catch (err) {
      console.error('Failed to fetch teacher activity:', err);
      setError(errorToMessage(err));
    } finally {
      setLoading(false);
    }
  }, [teacherId, filters]);

  useEffect(() => {
    if (isOpen && teacherId) {
      fetchActivity();
    }
  }, [isOpen, teacherId, fetchActivity]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityTypeColor = (type: string) => {
    switch (type) {
      case 'login':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'logout':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'api_call':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'file_generated':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'conversation_started':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'credits_used':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case 'login':
        return 'Přihlášení';
      case 'logout':
        return 'Odhlášení';
      case 'api_call':
        return 'API volání';
      case 'file_generated':
        return 'Soubor vygenerován';
      case 'conversation_started':
        return 'Konverzace zahájena';
      case 'credits_used':
        return 'Kredity použity';
      case 'email_verified':
        return 'E-mail ověřen';
      case 'page_view':
        return 'Zobrazení stránky';
      case 'profile_updated':
        return 'Profil aktualizován';
      case 'password_changed':
        return 'Heslo změněno';
      case 'subscription_changed':
        return 'Předplatné změněno';
      default:
        return type;
    }
  };

  const handleFilterChange = (key: keyof ActivityFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      offset: key !== 'offset' ? 0 : value // Reset to first page when changing filters
    }));
  };

  const exportActivity = () => {
    if (!activityData) return;

    const csvContent = [
      ['Datum', 'Typ aktivity', 'IP adresa', 'User Agent'].join(','),
      ...activityData.activities.map(activity => [
        formatDate(activity.created_at),
        getActivityTypeLabel(activity.activity_type),
        activity.ip_address || '',
        activity.user_agent || ''
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `teacher_activity_${teacherId}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-6xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <Activity className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Log aktivit učitele</h2>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={exportActivity}
                disabled={!activityData || loading}
              >
                <Download className="w-4 h-4 mr-1" />
                Export CSV
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[80vh] overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="text-lg text-gray-600">Načítání aktivit...</div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
                <div className="text-red-800">{error}</div>
              </div>
            )}

            {activityData && (
              <div className="space-y-6">
                {/* Filters */}
                <Card className="p-4">
                  <div className="flex flex-wrap items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Filter className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">Filtry:</span>
                    </div>

                    <select
                      value={filters.time_range || ''}
                      onChange={(e) => handleFilterChange('time_range', e.target.value || undefined)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Vlastní rozsah</option>
                      <option value="7d">Posledních 7 dní</option>
                      <option value="30d">Posledních 30 dní</option>
                      <option value="90d">Posledních 90 dní</option>
                    </select>

                    <select
                      value={filters.activity_type || 'all'}
                      onChange={(e) => handleFilterChange('activity_type', e.target.value === 'all' ? undefined : e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Všechny aktivity</option>
                      <option value="login">Přihlášení</option>
                      <option value="api_call">API volání</option>
                      <option value="file_generated">Generování souborů</option>
                      <option value="conversation_started">Konverzace</option>
                      <option value="credits_used">Použití kreditů</option>
                    </select>

                    {!filters.time_range && (
                      <>
                        <input
                          type="date"
                          value={filters.start_date || ''}
                          onChange={(e) => handleFilterChange('start_date', e.target.value || undefined)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="date"
                          value={filters.end_date || ''}
                          onChange={(e) => handleFilterChange('end_date', e.target.value || undefined)}
                          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </>
                    )}
                  </div>
                </Card>

                {/* Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card className="p-4 text-center">
                    <Activity className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      {activityData.activity_stats.total_activities}
                    </div>
                    <div className="text-sm text-gray-600">Celkem aktivit</div>
                  </Card>

                  <Card className="p-4 text-center">
                    <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      {activityData.performance_metrics.daily_average_activities.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Průměr denně</div>
                  </Card>

                  <Card className="p-4 text-center">
                    <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-purple-600">
                      {activityData.performance_metrics.total_credits_used_period}
                    </div>
                    <div className="text-sm text-gray-600">Kredity použity</div>
                  </Card>

                  <Card className="p-4 text-center">
                    <Calendar className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-orange-600">
                      {activityData.performance_metrics.activity_consistency.toFixed(0)}%
                    </div>
                    <div className="text-sm text-gray-600">Konzistence</div>
                  </Card>
                </div>

                {/* Activity Types Breakdown */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Rozložení aktivit podle typu</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(activityData.activity_stats.activities_by_type).map(([type, count]) => (
                      <div key={type} className="text-center">
                        <Badge variant="outline" className={getActivityTypeColor(type)}>
                          {getActivityTypeLabel(type)}
                        </Badge>
                        <div className="text-lg font-semibold text-gray-900 mt-1">{count}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Activity Timeline */}
                <Card className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline aktivit</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {activityData.activities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Clock className="w-4 h-4 text-gray-400 mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="outline" className={getActivityTypeColor(activity.activity_type)}>
                              {getActivityTypeLabel(activity.activity_type)}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {formatDate(activity.created_at)}
                            </span>
                          </div>
                          
                          {activity.activity_data && (
                            <div className="text-sm text-gray-600 mt-1">
                              {typeof activity.activity_data === 'object' ? (
                                <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                                  {JSON.stringify(activity.activity_data, null, 2)}
                                </pre>
                              ) : (
                                <span>{activity.activity_data}</span>
                              )}
                            </div>
                          )}
                          
                          {(activity.ip_address || activity.user_agent) && (
                            <div className="text-xs text-gray-500 mt-1">
                              {activity.ip_address && <span>IP: {activity.ip_address}</span>}
                              {activity.ip_address && activity.user_agent && <span> • </span>}
                              {activity.user_agent && (
                                <span title={activity.user_agent}>
                                  {activity.user_agent.length > 50 
                                    ? `${activity.user_agent.substring(0, 50)}...` 
                                    : activity.user_agent
                                  }
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {activityData.total > activityData.activities.length && (
                    <div className="text-center mt-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleFilterChange('limit', filters.limit + 50)}
                        disabled={loading}
                      >
                        Načíst další aktivity
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherActivityLog;
