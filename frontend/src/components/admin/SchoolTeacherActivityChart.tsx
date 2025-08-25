import React, { useState, useEffect, useCallback } from 'react';
import { Users, Activity, TrendingUp, Calendar } from 'lucide-react';
import Card from '../ui/Card';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';

interface TeacherActivity {
  teacher_id: string;
  teacher_name: string;
  activity_count: number;
  last_activity: string;
  credits_used: number;
  subjects: string[];
}

interface SchoolTeacherActivityChartProps {
  schoolId: string;
}

const SchoolTeacherActivityChart: React.FC<SchoolTeacherActivityChartProps> = ({ schoolId }) => {
  const { showToast } = useToast();
  const [teacherActivity, setTeacherActivity] = useState<TeacherActivity[]>([]);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  const fetchTeacherActivity = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/schools/${schoolId}/teachers/activity?range=${dateRange}`);
      setTeacherActivity((response.data.data as TeacherActivity[]) || []);
    } catch (error: any) {
      showToast({ 
        type: 'error', 
        message: error.response?.data?.error || 'Chyba při načítání aktivity učitelů' 
      });
    } finally {
      setLoading(false);
    }
  }, [schoolId, dateRange, showToast]);

  useEffect(() => {
    if (schoolId) {
      fetchTeacherActivity();
    }
  }, [schoolId, dateRange, fetchTeacherActivity]);

  if (loading) {
    return (
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Aktivita učitelů</h3>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Aktivita učitelů</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Období:</span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value as any)}
            className="border border-gray-300 rounded-md px-2 py-1 text-sm"
          >
            <option value="7d">7 dní</option>
            <option value="30d">30 dní</option>
            <option value="90d">90 dní</option>
          </select>
        </div>
      </div>

      {teacherActivity.length === 0 ? (
        <div className="text-center py-8">
          <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <p className="text-gray-500">Žádná aktivita učitelů nebyla nalezena</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-blue-600">Aktivní učitelé</span>
              </div>
              <div className="text-xl font-bold text-blue-900">
                {teacherActivity.filter(t => t.activity_count > 0).length}
              </div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Activity className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">Celkem aktivit</span>
              </div>
              <div className="text-xl font-bold text-green-900">
                {teacherActivity.reduce((sum, t) => sum + t.activity_count, 0)}
              </div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-purple-600">Použité kredity</span>
              </div>
              <div className="text-xl font-bold text-purple-900">
                {teacherActivity.reduce((sum, t) => sum + t.credits_used, 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* Teacher Activity List */}
          <div className="space-y-3">
            {teacherActivity
              .sort((a, b) => b.activity_count - a.activity_count)
              .slice(0, 10)
              .map((teacher) => (
                <div key={teacher.teacher_id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-gray-900">{teacher.teacher_name}</h4>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                          {teacher.activity_count} aktivit
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4" />
                          <span>Poslední aktivita: {new Date(teacher.last_activity).toLocaleDateString('cs-CZ')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>Kredity: {teacher.credits_used.toLocaleString()}</span>
                        </div>
                      </div>

                      {teacher.subjects.length > 0 && (
                        <div className="mt-2">
                          <span className="text-xs text-gray-500">Předměty: </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {teacher.subjects.map((subject, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                              >
                                {subject}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-800">
                          {teacher.activity_count}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {teacherActivity.length > 10 && (
            <div className="text-center pt-4">
              <p className="text-sm text-gray-500">
                Zobrazeno 10 z {teacherActivity.length} učitelů
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default SchoolTeacherActivityChart;
