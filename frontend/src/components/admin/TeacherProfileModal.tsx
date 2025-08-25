import React, { useState, useEffect } from 'react';
import { X, User, Mail, Building2, CreditCard, Calendar, Activity, FileText, MessageSquare, Clock, TrendingUp } from 'lucide-react';
import { Button, Card, Badge } from '../ui';
import { teacherService, Teacher, TeacherProfile } from '../../services/teacherService';
import { errorToMessage } from '../../services/apiClient';
import TeacherActivityLog from './TeacherActivityLog';

interface TeacherProfileModalProps {
  isOpen: boolean;
  teacherId: string | null;
  onClose: () => void;
}

const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({
  isOpen,
  teacherId,
  onClose,
}) => {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showActivityLog, setShowActivityLog] = useState(false);

  useEffect(() => {
    if (isOpen && teacherId) {
      fetchProfile();
    }
  }, [isOpen, teacherId]);

  const fetchProfile = async () => {
    if (!teacherId) return;

    try {
      setLoading(true);
      setError(null);
      
      const profileData = await teacherService.getTeacherProfile(teacherId);
      setProfile(profileData);
    } catch (err) {
      console.error('Failed to fetch teacher profile:', err);
      setError(errorToMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nikdy';
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatLastActive = (dateString?: string) => {
    if (!dateString) return 'Nikdy';
    
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `před ${minutes} min`;
    } else if (hours < 24) {
      return `před ${hours} hod`;
    } else {
      return `před ${days} dny`;
    }
  };

  const getStatusColor = (status: Teacher['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending_verification':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleColor = (role: Teacher['role']) => {
    switch (role) {
      case 'teacher_school':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'teacher_individual':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block w-full max-w-4xl my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          {/* Modal header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Profil učitele
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Modal content */}
          <div className="px-6 py-4 max-h-[80vh] overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-8">
                <div className="text-lg text-gray-600">Načítání profilu...</div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-md mb-4">
                <div className="text-red-800">{error}</div>
              </div>
            )}

            {profile && (
              <div className="space-y-6">
                {/* Basic Information */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Základní informace</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <User className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {profile.first_name} {profile.last_name}
                          </div>
                          <div className="text-sm text-gray-500">Jméno a příjmení</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Mail className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">{profile.email}</div>
                          <div className="text-sm text-gray-500">
                            E-mail {profile.email_verified ? '(ověřený)' : '(neověřený)'}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Building2 className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {profile.school_info?.name || 'Individuální učitel'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {profile.school_info?.city || 'Bez školy'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">Stav účtu</div>
                        <Badge variant="outline" className={getStatusColor(profile.status)}>
                          {profile.status === 'active' ? 'Aktivní' :
                           profile.status === 'inactive' ? 'Neaktivní' :
                           profile.status === 'pending_verification' ? 'Čekající na schválení' : 'Pozastavený'}
                        </Badge>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500 mb-1">Typ učitele</div>
                        <Badge variant="outline" className={getRoleColor(profile.role)}>
                          {profile.role === 'teacher_school' ? 'Školní učitel' : 'Individuální učitel'}
                        </Badge>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-900">
                            {formatDate(profile.created_at)}
                          </div>
                          <div className="text-sm text-gray-500">Datum registrace</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Usage Statistics */}
                <Card className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiky používání</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <CreditCard className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-600">{profile.credits_balance}</div>
                      <div className="text-sm text-gray-600">Zbývající kredity</div>
                    </div>

                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <Activity className="w-8 h-8 text-green-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-600">{profile.usage_statistics.total_activities}</div>
                      <div className="text-sm text-gray-600">Celkem aktivit</div>
                    </div>

                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <MessageSquare className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-purple-600">{profile.usage_statistics.conversations_count}</div>
                      <div className="text-sm text-gray-600">Konverzace</div>
                    </div>

                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                      <FileText className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-orange-600">{profile.usage_statistics.files_generated}</div>
                      <div className="text-sm text-gray-600">Vygenerované soubory</div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Celkem přihlášení</div>
                      <div className="font-medium text-gray-900">{profile.usage_statistics.total_logins}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 mb-1">Použité kredity</div>
                      <div className="font-medium text-gray-900">{profile.usage_statistics.credits_used}</div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 mb-1">Poslední přihlášení</div>
                      <div className="font-medium text-gray-900">
                        {formatLastActive(profile.usage_statistics.last_login)}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-gray-500 mb-1">Poslední aktivita</div>
                      <div className="font-medium text-gray-900">
                        {formatLastActive(profile.usage_statistics.last_activity)}
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Recent Activities */}
                {profile.recent_activities && profile.recent_activities.length > 0 && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Nedávné aktivity</h3>
                    
                    <div className="space-y-3">
                      {profile.recent_activities.slice(0, 5).map((activity) => (
                        <div key={activity.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {activity.activity_type}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(activity.created_at)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Notifications */}
                {profile.unread_notifications_count > 0 && (
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Oznámení</h3>
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-orange-500" />
                      <span className="text-gray-900">
                        {profile.unread_notifications_count} nepřečtených oznámení
                      </span>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>

          {/* Modal footer */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-between">
              <Button
                variant="secondary"
                onClick={() => setShowActivityLog(true)}
                disabled={!profile}
              >
                <Activity className="w-4 h-4 mr-1" />
                Zobrazit log aktivit
              </Button>
              <Button onClick={onClose}>
                Zavřít
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log Modal */}
      {teacherId && (
        <TeacherActivityLog
          teacherId={teacherId}
          isOpen={showActivityLog}
          onClose={() => setShowActivityLog(false)}
        />
      )}
    </div>
  );
};

export default TeacherProfileModal;
