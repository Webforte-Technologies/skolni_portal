import React, { useState, useCallback, useEffect } from 'react';
import { X, User, Mail, Building2, CreditCard, Calendar, Activity, Users } from 'lucide-react';
import { Button } from '../ui';
import { teacherService, Teacher } from '../../services/teacherService';
import { useToast } from '../../contexts/ToastContext';
import Badge from '../ui/Badge';

interface TeacherProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacherId: string;
}

const TeacherProfileModal: React.FC<TeacherProfileModalProps> = ({
  isOpen,
  onClose,
  teacherId,
}) => {
  const [profile, setProfile] = useState<Teacher | null>(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const fetchProfile = useCallback(async () => {
    if (!teacherId) return;
    
    try {
      setLoading(true);
      const teacherData = await teacherService.getTeacher(teacherId);
      setProfile(teacherData);
    } catch (error: any) {
      showToast({ 
        type: 'error', 
        message: error.response?.data?.error || 'Chyba při načítání profilu učitele' 
      });
    } finally {
      setLoading(false);
    }
  }, [teacherId, showToast]);

  useEffect(() => {
    if (isOpen && teacherId) {
      fetchProfile();
    }
  }, [isOpen, teacherId, fetchProfile]);

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: Teacher['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'pending_verification':
        return 'bg-yellow-100 text-yellow-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Teacher['status']) => {
    switch (status) {
      case 'active':
        return 'Aktivní';
      case 'inactive':
        return 'Neaktivní';
      case 'pending_verification':
        return 'Čekající na schválení';
      case 'suspended':
        return 'Pozastavený';
      default:
        return 'Neznámý stav';
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

            {profile && (
              <div className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Jméno</div>
                        <div className="font-medium text-gray-900">{profile.first_name} {profile.last_name}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Email</div>
                        <div className="font-medium text-gray-900">{profile.email}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Building2 className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Škola</div>
                        <div className="font-medium text-gray-900">
                          {profile.school_id ? 'Školní učitel' : 'Individuální učitel'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Kredity</div>
                        <div className="font-medium text-gray-900">{profile.credits_balance}</div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Registrován</div>
                        <div className="font-medium text-gray-900">
                          {formatDate(profile.created_at)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Activity className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Status</div>
                        <Badge className={getStatusColor(profile.status)}>
                          {getStatusLabel(profile.status)}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="text-sm text-gray-500">Role</div>
                        <div className="font-medium text-gray-900">
                          {profile.role === 'teacher_school' ? 'Školní učitel' : 'Individuální učitel'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Modal footer */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex justify-end">
              <Button onClick={onClose}>
                Zavřít
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfileModal;
