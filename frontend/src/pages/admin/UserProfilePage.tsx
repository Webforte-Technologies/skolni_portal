import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Activity, Calendar, Clock } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import UserProfileCard from '../../components/admin/UserProfileCard';
import UserActivityChart from '../../components/admin/UserActivityChart';
import UserActivityLog from '../../components/admin/UserActivityLog';
import UserNotificationForm from '../../components/admin/UserNotificationForm';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'platform_admin' | 'school_admin' | 'teacher_school' | 'teacher_individual';
  is_active: boolean;
  status: string;
  school_id?: string;
  school_name?: string;
  credits_balance: number;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
  last_activity_at?: string;
  total_logins: number;
  total_activities: number;
  total_credits_used: number;
  total_credits_earned: number;
  preferences?: any;
  contact_info?: {
    phone?: string;
    address?: string;
  };
}

interface UserActivity {
  id: string;
  user_id: string;
  action_type: 'login' | 'logout' | 'page_view' | 'api_call' | 'file_generated' | 
               'conversation_started' | 'credits_used' | 'profile_updated' | 
               'password_changed' | 'email_verified' | 'subscription_changed';
  timestamp?: string;
  ip_address?: string;
  user_agent?: string;
  session_id?: string;
  activity_data?: Record<string, any>;
  user_name?: string;
  user_email?: string;
  details?: string;
  action?: string;
}

const UserProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNotificationForm, setShowNotificationForm] = useState(false);
  const [activityLoading, setActivityLoading] = useState(false);

  const fetchUserProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/users/${userId}/profile`);
      if (response.data.success) {
        // Type assertion for the response data
        const userData = response.data.data as UserProfile;
        setUserProfile(userData);
      }
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při načítání profilu uživatele' });
    } finally {
      setLoading(false);
    }
  }, [userId, showToast]);

  const fetchUserActivity = useCallback(async () => {
    try {
      setActivityLoading(true);
      const response = await api.get(`/admin/users/${userId}/activity`);
      if (response.data.success) {
        // Type assertion for the response data
        const responseData = response.data.data as { activities: any[] };
        // Map backend data to frontend format
        const mappedActivities = responseData.activities?.map((activity: any) => ({
          id: activity.id,
          user_id: activity.user_id,
          action_type: activity.activity_type,
          timestamp: activity.created_at,
          ip_address: activity.ip_address,
          user_agent: activity.user_agent,
          session_id: activity.session_id,
          activity_data: activity.activity_data,
          // Extract user info from activity_data if available
          user_name: activity.activity_data?.user_name || 'N/A',
          user_email: activity.activity_data?.user_email || 'N/A',
          details: activity.activity_data?.description || activity.activity_data?.message || 'N/A',
          action: activity.activity_data?.action || activity.activity_type
        })) || [];
        
        setUserActivity(mappedActivities);
      }
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při načítání aktivity uživatele' });
    } finally {
      setActivityLoading(false);
    }
  }, [userId, showToast]);

  useEffect(() => {
    if (userId) {
      fetchUserActivity();
      fetchUserProfile();
    }
  }, [userId, fetchUserActivity, fetchUserProfile]);

  const handleSendNotification = async (notificationData: any) => {
    try {
      await api.post(`/admin/users/${userId}/send-notification`, notificationData);
      showToast({ type: 'success', message: 'Oznámení bylo odesláno' });
      setShowNotificationForm(false);
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při odesílání oznámení' });
    }
  };

  const handleStatusChange = async (status: string) => {
    try {
      await api.put(`/admin/users/${userId}/status`, { status });
      showToast({ type: 'success', message: 'Stav uživatele byl aktualizován' });
      fetchUserProfile();
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při změně stavu uživatele' });
    }
  };

  const handleResetPassword = async () => {
    try {
      await api.post(`/admin/users/${userId}/reset-password`);
      showToast({ type: 'success', message: 'Heslo bylo resetováno a odesláno na email' });
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při resetování hesla' });
    }
  };

  const exportUserData = async () => {
    try {
      const response = await api.get(`/admin/users/${userId}/export`, {
        responseType: 'blob'
      });
      
      // Type assertion for blob response - first to unknown, then to Blob
      const blobData = response.data as unknown as Blob;
      const url = window.URL.createObjectURL(new Blob([blobData]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `user-${userId}-data.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showToast({ type: 'success', message: 'Data uživatele byla exportována' });
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při exportu dat' });
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Načítání profilu uživatele...</div>
        </div>
      </AdminLayout>
    );
  }

  if (!userProfile) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Uživatel nebyl nalezen</div>
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
              <h1 className="text-2xl font-bold text-gray-900">Profil uživatele</h1>
              <p className="text-gray-600">Detailní informace o uživateli a jeho aktivitě</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={exportUserData}>
              <Clock className="w-4 h-4 mr-2" />
              Export dat
            </Button>
            <Button variant="outline" onClick={() => setShowNotificationForm(true)}>
              <Activity className="w-4 h-4 mr-2" />
              Odeslat oznámení
            </Button>
            <Button onClick={() => navigate(`/admin/users/${userId}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Upravit
            </Button>
          </div>
        </div>

        {/* User Profile Card */}
        <UserProfileCard 
          user={userProfile}
          onEdit={() => navigate(`/admin/users/${userId}/edit`)}
          onSendNotification={() => setShowNotificationForm(true)}
          onStatusChange={handleStatusChange}
          onResetPassword={handleResetPassword}
        />

        {/* Activity Chart */}
        <Card title="Aktivita uživatele" icon={<Activity className="w-5 h-5" />}>
          <UserActivityChart userId={userId!} />
        </Card>

        {/* Activity Log */}
        <Card title="Historie aktivit" icon={<Calendar className="w-5 h-5" />}>
          <UserActivityLog 
            logs={userActivity}
            loading={activityLoading}
            onFilterChange={() => {}}
            onExport={() => {}}
          />
        </Card>

        {/* Notification Form Modal */}
        {showNotificationForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <UserNotificationForm
                selectedUsers={[{ 
                  id: userId!, 
                  name: `${userProfile.first_name} ${userProfile.last_name}`,
                  email: userProfile.email 
                }]}
                onSend={handleSendNotification}
              />
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserProfilePage;
