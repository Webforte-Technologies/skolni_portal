import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, TrendingDown, Users, Activity, CreditCard, Clock, 
  Calendar, BarChart3, PieChart, LineChart, Target, Award,
  AlertCircle, CheckCircle, XCircle, Zap
} from 'lucide-react';
import { Card, Button, Badge } from '../ui';
import { teacherService } from '../../services/teacherService';
import { errorToMessage } from '../../services/apiClient';

interface TeacherAnalytics {
  overview: {
    total_teachers: number;
    active_teachers: number;
    new_teachers_this_month: number;
    average_credits_per_teacher: number;
    total_activities_today: number;
    total_activities_this_week: number;
    total_activities_this_month: number;
  };
  performance_metrics: {
    most_active_teachers: Array<{
      id: string;
      name: string;
      email: string;
      activity_count: number;
      credits_used: number;
      last_activity: string;
    }>;
    top_credit_users: Array<{
      id: string;
      name: string;
      email: string;
      credits_used: number;
      efficiency_score: number;
    }>;
    engagement_levels: {
      high: number;
      medium: number;
      low: number;
      inactive: number;
    };
  };
  activity_trends: Array<{
    date: string;
    total_activities: number;
    unique_teachers: number;
    credits_used: number;
    avg_session_duration: number;
  }>;
  usage_patterns: {
    hourly_distribution: Array<{ hour: number; activity_count: number }>;
    daily_distribution: Array<{ day: string; activity_count: number }>;
    activity_types: Array<{ type: string; count: number; percentage: number }>;
  };
  teacher_segments: {
    by_role: Array<{ role: string; count: number; percentage: number }>;
    by_status: Array<{ status: string; count: number; percentage: number }>;
    by_school: Array<{ school_name: string; teacher_count: number; avg_activity: number }>;
  };
}

interface TeacherAnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

const TeacherAnalyticsDashboard: React.FC<TeacherAnalyticsDashboardProps> = ({
  isOpen,
  onClose
}) => {
  const [analytics, setAnalytics] = useState<TeacherAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAnalytics();
    }
  }, [isOpen, timeRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Since we don't have a dedicated analytics endpoint yet, 
      // we'll simulate the data structure for now
      // TODO: Replace with actual API call when backend endpoint is ready
      
      const mockAnalytics: TeacherAnalytics = {
        overview: {
          total_teachers: 1247,
          active_teachers: 892,
          new_teachers_this_month: 45,
          average_credits_per_teacher: 750,
          total_activities_today: 234,
          total_activities_this_week: 1456,
          total_activities_this_month: 5678
        },
        performance_metrics: {
          most_active_teachers: [
            {
              id: '1',
              name: 'Marie Svobodová',
              email: 'marie.svobodova@skola.cz',
              activity_count: 156,
              credits_used: 890,
              last_activity: new Date(Date.now() - 1000 * 60 * 30).toISOString()
            },
            {
              id: '2', 
              name: 'Jan Novák',
              email: 'jan.novak@gymnazium.cz',
              activity_count: 142,
              credits_used: 756,
              last_activity: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
            }
          ],
          top_credit_users: [
            {
              id: '1',
              name: 'Petr Černý',
              email: 'petr.cerny@technicka.cz',
              credits_used: 1200,
              efficiency_score: 95
            }
          ],
          engagement_levels: {
            high: 234,
            medium: 456,
            low: 178,
            inactive: 89
          }
        },
        activity_trends: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          total_activities: Math.floor(Math.random() * 200) + 50,
          unique_teachers: Math.floor(Math.random() * 50) + 20,
          credits_used: Math.floor(Math.random() * 1000) + 200,
          avg_session_duration: Math.floor(Math.random() * 30) + 10
        })).reverse(),
        usage_patterns: {
          hourly_distribution: Array.from({ length: 24 }, (_, i) => ({
            hour: i,
            activity_count: Math.floor(Math.random() * 100) + 10
          })),
          daily_distribution: [
            { day: 'Pondělí', activity_count: 456 },
            { day: 'Úterý', activity_count: 523 },
            { day: 'Středa', activity_count: 489 },
            { day: 'Čtvrtek', activity_count: 567 },
            { day: 'Pátek', activity_count: 445 },
            { day: 'Sobota', activity_count: 234 },
            { day: 'Neděle', activity_count: 178 }
          ],
          activity_types: [
            { type: 'Přihlášení', count: 1234, percentage: 35 },
            { type: 'Generování souborů', count: 890, percentage: 25 },
            { type: 'API volání', count: 756, percentage: 22 },
            { type: 'Konverzace', count: 456, percentage: 13 },
            { type: 'Ostatní', count: 178, percentage: 5 }
          ]
        },
        teacher_segments: {
          by_role: [
            { role: 'Školní učitel', count: 892, percentage: 72 },
            { role: 'Individuální učitel', count: 355, percentage: 28 }
          ],
          by_status: [
            { status: 'Aktivní', count: 892, percentage: 72 },
            { status: 'Neaktivní', count: 234, percentage: 19 },
            { status: 'Čekající', count: 89, percentage: 7 },
            { status: 'Pozastavený', count: 32, percentage: 2 }
          ],
          by_school: [
            { school_name: 'Gymnázium Jana Nerudy', teacher_count: 45, avg_activity: 156 },
            { school_name: 'ZŠ TGM', teacher_count: 38, avg_activity: 142 },
            { school_name: 'SŠ technická', teacher_count: 32, avg_activity: 128 }
          ]
        }
      };

      setAnalytics(mockAnalytics);
    } catch (err) {
      console.error('Failed to fetch teacher analytics:', err);
      setError(errorToMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const refreshAnalytics = async () => {
    setRefreshing(true);
    await fetchAnalytics();
    setRefreshing(false);
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('cs-CZ');
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`;
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-green-600';
      case 'medium':
        return 'text-blue-600';
      case 'low':
        return 'text-yellow-600';
      case 'inactive':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getEngagementIcon = (level: string) => {
    switch (level) {
      case 'high':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'medium':
        return <Activity className="w-5 h-5 text-blue-600" />;
      case 'low':
        return <TrendingDown className="w-5 h-5 text-yellow-600" />;
      case 'inactive':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Activity className="w-5 h-5 text-gray-600" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-7xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">Analytika učitelů</h2>
            </div>
            <div className="flex items-center space-x-3">
              {/* Time Range Selector */}
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Posledních 7 dní</option>
                <option value="30d">Posledních 30 dní</option>
                <option value="90d">Posledních 90 dní</option>
              </select>

              <Button
                variant="secondary"
                size="sm"
                onClick={refreshAnalytics}
                disabled={refreshing}
                isLoading={refreshing}
              >
                Aktualizovat
              </Button>

              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4 max-h-[85vh] overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <div className="text-lg text-gray-600">Načítání analytiky...</div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-6">
                <div className="flex items-center space-x-2 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  <span>{error}</span>
                </div>
              </div>
            )}

            {analytics && (
              <div className="space-y-6">
                {/* Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Celkem učitelů</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatNumber(analytics.overview.total_teachers)}
                        </p>
                        <p className="text-xs text-green-600 flex items-center mt-1">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          +{analytics.overview.new_teachers_this_month} tento měsíc
                        </p>
                      </div>
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Aktivní učitelé</p>
                        <p className="text-2xl font-bold text-green-600">
                          {formatNumber(analytics.overview.active_teachers)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatPercentage((analytics.overview.active_teachers / analytics.overview.total_teachers) * 100)} z celku
                        </p>
                      </div>
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Průměr kreditů</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {formatNumber(analytics.overview.average_credits_per_teacher)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">na učitele</p>
                      </div>
                      <CreditCard className="w-8 h-8 text-purple-600" />
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Aktivity dnes</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {formatNumber(analytics.overview.total_activities_today)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatNumber(analytics.overview.total_activities_this_week)} tento týden
                        </p>
                      </div>
                      <Zap className="w-8 h-8 text-orange-600" />
                    </div>
                  </Card>
                </div>

                {/* Performance Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Most Active Teachers */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Award className="w-5 h-5 text-yellow-500 mr-2" />
                      Nejaktivnější učitelé
                    </h3>
                    <div className="space-y-3">
                      {analytics.performance_metrics.most_active_teachers.map((teacher, index) => (
                        <div key={teacher.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                                #{index + 1}
                              </Badge>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{teacher.name}</div>
                              <div className="text-sm text-gray-500">{teacher.email}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              {formatNumber(teacher.activity_count)} aktivit
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatNumber(teacher.credits_used)} kreditů
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Engagement Levels */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Target className="w-5 h-5 text-blue-500 mr-2" />
                      Úrovně zapojení
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(analytics.performance_metrics.engagement_levels).map(([level, count]) => {
                        const percentage = (count / analytics.overview.total_teachers) * 100;
                        return (
                          <div key={level} className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {getEngagementIcon(level)}
                              <span className="font-medium text-gray-900 capitalize">
                                {level === 'high' ? 'Vysoké' :
                                 level === 'medium' ? 'Střední' :
                                 level === 'low' ? 'Nízké' : 'Neaktivní'}
                              </span>
                            </div>
                            <div className="text-right">
                              <div className={`font-medium ${getEngagementColor(level)}`}>
                                {formatNumber(count)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {formatPercentage(percentage)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>
                </div>

                {/* Activity Types Distribution */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <PieChart className="w-5 h-5 text-green-500 mr-2" />
                    Rozložení typů aktivit
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {analytics.usage_patterns.activity_types.map((activity) => (
                      <div key={activity.type} className="text-center p-3 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900 mb-1">
                          {formatNumber(activity.count)}
                        </div>
                        <div className="text-sm font-medium text-gray-700 mb-1">
                          {activity.type}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatPercentage(activity.percentage)}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                {/* Teacher Segments */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* By Role */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Segmentace podle role
                    </h3>
                    <div className="space-y-3">
                      {analytics.teacher_segments.by_role.map((segment) => (
                        <div key={segment.role} className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{segment.role}</span>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              {formatNumber(segment.count)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatPercentage(segment.percentage)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* By Status */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Segmentace podle stavu
                    </h3>
                    <div className="space-y-3">
                      {analytics.teacher_segments.by_status.map((segment) => (
                        <div key={segment.status} className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{segment.status}</span>
                          <div className="text-right">
                            <div className="font-medium text-gray-900">
                              {formatNumber(segment.count)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {formatPercentage(segment.percentage)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Top Schools */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <LineChart className="w-5 h-5 text-indigo-500 mr-2" />
                    Nejaktivnější školy
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-gray-200">
                          <th className="text-left py-2 font-medium text-gray-700">Škola</th>
                          <th className="text-right py-2 font-medium text-gray-700">Učitelé</th>
                          <th className="text-right py-2 font-medium text-gray-700">Průměr aktivit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.teacher_segments.by_school.map((school, index) => (
                          <tr key={index} className="border-b border-gray-100">
                            <td className="py-3 font-medium text-gray-900">{school.school_name}</td>
                            <td className="py-3 text-right text-gray-900">
                              {formatNumber(school.teacher_count)}
                            </td>
                            <td className="py-3 text-right text-gray-900">
                              {formatNumber(school.avg_activity)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherAnalyticsDashboard;
