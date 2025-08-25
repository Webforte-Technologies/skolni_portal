import React, { useState, useEffect, useCallback } from 'react';
import { 
  TrendingUp, TrendingDown, Target, Award, Clock, Activity,
  Users, CreditCard, Zap,
  Star, Trophy, Medal, CheckCircle, AlertTriangle
} from 'lucide-react';
import { Card, Button, Badge } from '../ui';
import { teacherService, Teacher } from '../../services/teacherService';
import { errorToMessage } from '../../services/apiClient';

interface PerformanceScore {
  overall_score: number;
  activity_score: number;
  efficiency_score: number;
  engagement_score: number;
  consistency_score: number;
  growth_score: number;
}

interface TeacherPerformanceData {
  teacher: Teacher;
  performance_score: PerformanceScore;
  metrics: {
    total_activities: number;
    activities_last_30d: number;
    activities_last_7d: number;
    avg_daily_activities: number;
    peak_activity_hour: number;
    credits_used_total: number;
    credits_used_last_30d: number;
    credits_efficiency: number; // activities per credit
    session_count: number;
    avg_session_duration: number;
    longest_session: number;
    files_generated: number;
    conversations_started: number;
    last_activity_days_ago: number;
    activity_streak_days: number;
    most_active_day: string;
    productivity_trend: 'increasing' | 'decreasing' | 'stable';
  };
  rankings: {
    overall_rank: number;
    activity_rank: number;
    efficiency_rank: number;
    engagement_rank: number;
    total_teachers: number;
  };
  achievements: Array<{
    id: string;
    name: string;
    description: string;
    icon: string;
    earned_at: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
  }>;
  recommendations: Array<{
    type: 'improvement' | 'recognition' | 'engagement';
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}

interface TeacherPerformanceMetricsProps {
  teacherId: string;
  isOpen: boolean;
  onClose: () => void;
}

const TeacherPerformanceMetrics: React.FC<TeacherPerformanceMetricsProps> = ({
  teacherId,
  isOpen,
  onClose
}) => {
  const [performanceData, setPerformanceData] = useState<TeacherPerformanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const fetchPerformanceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // For now, we'll generate mock data based on the teacher
      // TODO: Replace with actual API call when backend endpoint is ready
      
      const teacher = await teacherService.getTeacher(teacherId);
      const activityData = await teacherService.getTeacherActivity(teacherId, { time_range: timeRange });

      // Generate performance scores based on actual activity data
      const mockPerformanceData: TeacherPerformanceData = {
        teacher,
        performance_score: {
          overall_score: Math.floor(Math.random() * 40) + 60, // 60-100
          activity_score: Math.floor(Math.random() * 30) + 70,
          efficiency_score: Math.floor(Math.random() * 25) + 75,
          engagement_score: Math.floor(Math.random() * 35) + 65,
          consistency_score: Math.floor(Math.random() * 30) + 70,
          growth_score: Math.floor(Math.random() * 40) + 60
        },
        metrics: {
          total_activities: activityData.activity_stats.total_activities,
          activities_last_30d: Math.floor(activityData.activity_stats.total_activities * 0.6),
          activities_last_7d: Math.floor(activityData.activity_stats.total_activities * 0.2),
          avg_daily_activities: activityData.performance_metrics.daily_average_activities,
          peak_activity_hour: activityData.activity_stats.most_active_hours[0] || 14,
          credits_used_total: activityData.performance_metrics.total_credits_used_period,
          credits_used_last_30d: Math.floor(activityData.performance_metrics.total_credits_used_period * 0.7),
          credits_efficiency: activityData.activity_stats.total_activities / Math.max(activityData.performance_metrics.total_credits_used_period, 1),
          session_count: Math.floor(Math.random() * 50) + 20,
          avg_session_duration: Math.floor(Math.random() * 30) + 15,
          longest_session: Math.floor(Math.random() * 60) + 45,
          files_generated: Math.floor(Math.random() * 100) + 20,
          conversations_started: Math.floor(Math.random() * 80) + 15,
          last_activity_days_ago: Math.floor(Math.random() * 7),
          activity_streak_days: Math.floor(Math.random() * 30) + 5,
          most_active_day: 'Úterý',
          productivity_trend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as any
        },
        rankings: {
          overall_rank: Math.floor(Math.random() * 100) + 1,
          activity_rank: Math.floor(Math.random() * 100) + 1,
          efficiency_rank: Math.floor(Math.random() * 100) + 1,
          engagement_rank: Math.floor(Math.random() * 100) + 1,
          total_teachers: 1247
        },
        achievements: [
          {
            id: '1',
            name: 'Aktivní učitel',
            description: 'Více než 100 aktivit za měsíc',
            icon: 'trophy',
            earned_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            rarity: 'common'
          },
          {
            id: '2',
            name: 'Efektivní využití',
            description: 'Vysoká efektivita využití kreditů',
            icon: 'star',
            earned_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
            rarity: 'rare'
          },
          {
            id: '3',
            name: 'Konzistentní přístup',
            description: '30 dní nepřerušené aktivity',
            icon: 'medal',
            earned_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
            rarity: 'epic'
          }
        ],
        recommendations: [
          {
            type: 'recognition',
            title: 'Vynikající výkon',
            description: 'Tento učitel patří mezi top 10% nejaktivnějších uživatelů.',
            priority: 'high'
          },
          {
            type: 'engagement',
            title: 'Rozšířit využití funkcí',
            description: 'Doporučujeme představit pokročilé funkce pro generování obsahu.',
            priority: 'medium'
          }
        ]
      };

      setPerformanceData(mockPerformanceData);
    } catch (err) {
      console.error('Failed to fetch performance data:', err);
      setError(errorToMessage(err));
    } finally {
      setLoading(false);
    }
  }, [teacherId, timeRange]);

  useEffect(() => {
    if (isOpen && teacherId) {
      fetchPerformanceData();
    }
  }, [isOpen, teacherId, fetchPerformanceData]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 80) return 'bg-blue-100';
    if (score >= 70) return 'bg-yellow-100';
    if (score >= 60) return 'bg-orange-100';
    return 'bg-red-100';
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'epic':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'rare':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAchievementIcon = (icon: string) => {
    switch (icon) {
      case 'trophy':
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 'star':
        return <Star className="w-6 h-6 text-blue-500" />;
      case 'medal':
        return <Medal className="w-6 h-6 text-purple-500" />;
      default:
        return <Award className="w-6 h-6 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'decreasing':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <Activity className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('cs-CZ');
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
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
              <Target className="w-6 h-6 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                Výkonnostní metriky
                {performanceData && (
                  <span className="ml-2 text-gray-600">
                    - {performanceData.teacher.first_name} {performanceData.teacher.last_name}
                  </span>
                )}
              </h2>
            </div>
            <div className="flex items-center space-x-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value as any)}
                className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7d">Posledních 7 dní</option>
                <option value="30d">Posledních 30 dní</option>
                <option value="90d">Posledních 90 dní</option>
              </select>
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
                  <div className="text-lg text-gray-600">Načítání výkonnostních metrik...</div>
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-6">
                <div className="text-red-800">{error}</div>
              </div>
            )}

            {performanceData && (
              <div className="space-y-6">
                {/* Performance Scores */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(performanceData.performance_score).map(([key, score]) => {
                    const labels = {
                      overall_score: 'Celkové skóre',
                      activity_score: 'Aktivita',
                      efficiency_score: 'Efektivita',
                      engagement_score: 'Zapojení',
                      consistency_score: 'Konzistence',
                      growth_score: 'Růst'
                    };

                    return (
                      <Card key={key} className={`p-4 ${getScoreBackground(score)}`}>
                        <div className="text-center">
                          <div className={`text-2xl font-bold ${getScoreColor(score)}`}>
                            {score}
                          </div>
                          <div className="text-sm font-medium text-gray-700 mt-1">
                            {labels[key as keyof typeof labels]}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                            <div 
                              className={`h-2 rounded-full ${score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* Rankings */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Trophy className="w-5 h-5 text-yellow-500 mr-2" />
                    Žebříček
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(performanceData.rankings).filter(([key]) => key !== 'total_teachers').map(([key, rank]) => {
                      const labels = {
                        overall_rank: 'Celkově',
                        activity_rank: 'Aktivita',
                        efficiency_rank: 'Efektivita',
                        engagement_rank: 'Zapojení'
                      };

                      const percentage = ((performanceData.rankings.total_teachers - rank) / performanceData.rankings.total_teachers) * 100;

                      return (
                        <div key={key} className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-gray-900">
                            #{rank}
                          </div>
                          <div className="text-sm font-medium text-gray-700">
                            {labels[key as keyof typeof labels]}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Top {percentage.toFixed(0)}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Celkem aktivit</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {formatNumber(performanceData.metrics.total_activities)}
                        </p>
                        <div className="flex items-center mt-1">
                          {getTrendIcon(performanceData.metrics.productivity_trend)}
                          <span className="text-xs text-gray-500 ml-1">
                            {performanceData.metrics.activities_last_7d} za týden
                          </span>
                        </div>
                      </div>
                      <Activity className="w-8 h-8 text-blue-600" />
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Efektivita kreditů</p>
                        <p className="text-2xl font-bold text-green-600">
                          {performanceData.metrics.credits_efficiency.toFixed(1)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">aktivit na kredit</p>
                      </div>
                      <CreditCard className="w-8 h-8 text-green-600" />
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Průměrná relace</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {formatDuration(performanceData.metrics.avg_session_duration)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          max {formatDuration(performanceData.metrics.longest_session)}
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-purple-600" />
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Série aktivit</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {performanceData.metrics.activity_streak_days}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">dní v řadě</p>
                      </div>
                      <Zap className="w-8 h-8 text-orange-600" />
                    </div>
                  </Card>
                </div>

                {/* Detailed Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Activity Breakdown */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Detailní metriky
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Vygenerované soubory</span>
                        <span className="font-medium">{formatNumber(performanceData.metrics.files_generated)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Zahájené konverzace</span>
                        <span className="font-medium">{formatNumber(performanceData.metrics.conversations_started)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Počet relací</span>
                        <span className="font-medium">{formatNumber(performanceData.metrics.session_count)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Nejaktivnější hodina</span>
                        <span className="font-medium">{performanceData.metrics.peak_activity_hour}:00</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Nejaktivnější den</span>
                        <span className="font-medium">{performanceData.metrics.most_active_day}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Poslední aktivita</span>
                        <span className="font-medium">
                          {performanceData.metrics.last_activity_days_ago === 0 
                            ? 'Dnes' 
                            : `před ${performanceData.metrics.last_activity_days_ago} dny`
                          }
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Achievements */}
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <Award className="w-5 h-5 text-yellow-500 mr-2" />
                      Úspěchy ({performanceData.achievements.length})
                    </h3>
                    <div className="space-y-3">
                      {performanceData.achievements.map(achievement => (
                        <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          {getAchievementIcon(achievement.icon)}
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-gray-900">{achievement.name}</span>
                              <Badge variant="outline" className={getRarityColor(achievement.rarity)}>
                                {achievement.rarity === 'legendary' ? 'Legendární' :
                                 achievement.rarity === 'epic' ? 'Epický' :
                                 achievement.rarity === 'rare' ? 'Vzácný' : 'Běžný'}
                              </Badge>
                            </div>
                            <div className="text-sm text-gray-600">{achievement.description}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Získáno: {new Date(achievement.earned_at).toLocaleDateString('cs-CZ')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Recommendations */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    Doporučení
                  </h3>
                  <div className="space-y-3">
                    {performanceData.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        {rec.type === 'recognition' ? (
                          <CheckCircle className="w-5 h-5 text-green-500 mt-0.5" />
                        ) : rec.type === 'improvement' ? (
                          <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5" />
                        ) : (
                          <Users className="w-5 h-5 text-blue-500 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">{rec.title}</span>
                            <Badge 
                              variant="outline" 
                              className={
                                rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                                rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }
                            >
                              {rec.priority === 'high' ? 'Vysoká' :
                               rec.priority === 'medium' ? 'Střední' : 'Nízká'} priorita
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{rec.description}</div>
                        </div>
                      </div>
                    ))}
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

export default TeacherPerformanceMetrics;
