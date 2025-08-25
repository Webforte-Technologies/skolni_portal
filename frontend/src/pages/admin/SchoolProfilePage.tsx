import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Building2, ArrowLeft, Users, CreditCard, MapPin, Phone, 
  Mail, Globe, Calendar, Activity, TrendingUp, UserCheck,
  Shield, Settings, Bell, Download, Upload
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';
import SchoolProfileCard from '../../components/admin/SchoolProfileCard';
import SchoolActivityChart from '../../components/admin/SchoolActivityChart';
import SchoolAnalytics from '../../components/admin/SchoolAnalytics';
import SchoolTeacherActivityChart from '../../components/admin/SchoolTeacherActivityChart';
import SchoolTeacherSubtable from '../../components/admin/SchoolTeacherSubtable';

interface SchoolProfile {
  id: string;
  name: string;
  address?: string;
  city?: string;
  postal_code?: string;
  contact_phone?: string;
  contact_email?: string;
  phone?: string;          // For backward compatibility
  email?: string;          // For backward compatibility
  website?: string;
  teacher_count: number;
  student_count: number;
  subscription_plan: string;
  credits_balance: number;
  total_credits: number;
  created_at: string;
  is_active: boolean;
  last_activity_at?: string;
  admin_activity_at?: string;
  // New fields from migration
  status?: string;
  subscription_tier?: string;
  max_teachers?: number;
  max_students?: number;
  verification_required?: boolean;
  logo_url?: string;
}

const SchoolProfilePage: React.FC = () => {
  const { schoolId } = useParams<{ schoolId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [school, setSchool] = useState<SchoolProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'analytics' | 'teachers'>('overview');

  useEffect(() => {
    if (schoolId) {
      fetchSchoolProfile();
    }
  }, [schoolId]);

  const fetchSchoolProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/schools/${schoolId}/profile`);
      // The backend returns { school, recent_activity, notifications, preferences, status_history }
      // We need to extract the school data
      setSchool(response.data.data.school);
    } catch (error: any) {
      showToast({ 
        type: 'error', 
        message: error.response?.data?.error || 'Chyba při načítání profilu školy' 
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!school) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Škola nebyla nalezena</h2>
          <Button variant="secondary" onClick={() => navigate('/admin/schools')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zpět na seznam škol
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Přehled', icon: <Building2 className="w-4 h-4" /> },
    { id: 'activity', label: 'Aktivita', icon: <Activity className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytika', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'teachers', label: 'Učitelé', icon: <UserCheck className="w-4 h-4" /> }
  ];

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="secondary" 
              onClick={() => navigate('/admin/schools')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Zpět na školy</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{school.name}</h1>
              <p className="text-gray-600 mt-1">Detailní profil školy</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="secondary" onClick={() => navigate(`/admin/schools/${school.id}/edit`)}>
              <Settings className="w-4 h-4 mr-2" />
              Upravit
            </Button>
            <Button variant="primary" onClick={() => navigate(`/admin/schools/${school.id}/notifications`)}>
              <Bell className="w-4 h-4 mr-2" />
              Oznámení
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <Card>
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </Card>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'overview' && (
            <>
              <SchoolProfileCard school={school} />
              
              {/* Teacher Summary */}
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Přehled učitelů</h3>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => setActiveTab('teachers')}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Zobrazit všechny
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <Users className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                    <div className="text-2xl font-bold text-blue-900">{school.teacher_count || 0}</div>
                    <div className="text-sm text-blue-700">Celkem učitelů</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <UserCheck className="w-8 h-8 mx-auto text-green-600 mb-2" />
                    <div className="text-2xl font-bold text-green-900">
                      {school.teacher_count || 0}
                    </div>
                    <div className="text-sm text-green-700">Aktivních</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <CreditCard className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                    <div className="text-2xl font-bold text-purple-900">
                      {school.credits_balance || 0}
                    </div>
                    <div className="text-sm text-purple-700">Dostupné kredity</div>
                  </div>
                </div>
              </Card>
              
              {/* Quick Actions */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Rychlé akce</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate(`/admin/schools/${school.id}/export`)}
                    className="flex items-center justify-center space-x-2"
                  >
                    <Download className="w-4 h-4" />
                    <span>Exportovat data</span>
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate(`/admin/schools/${school.id}/activity`)}
                    className="flex items-center justify-center space-x-2"
                  >
                    <Activity className="w-4 h-4" />
                    <span>Zobrazit aktivitu</span>
                  </Button>
                  <Button 
                    variant="secondary" 
                    onClick={() => navigate(`/admin/schools/${school.id}/teachers`)}
                    className="flex items-center justify-center space-x-2"
                  >
                    <Users className="w-4 h-4" />
                    <span>Správa učitelů</span>
                  </Button>
                </div>
              </Card>
            </>
          )}

          {activeTab === 'activity' && (
            <div className="space-y-6">
              <SchoolActivityChart 
          schoolId={school.id}
          schoolName={school.name}
          totalActivities={0}
          activeUsers={school.teacher_count}
          lastActivity={school.last_activity_at}
        />
              <SchoolTeacherActivityChart schoolId={school.id} />
            </div>
          )}

          {activeTab === 'analytics' && (
            <SchoolAnalytics schoolId={school.id} />
          )}

          {activeTab === 'teachers' && (
            <div className="space-y-6">
              <SchoolTeacherSubtable 
                schoolId={school.id} 
                schoolName={school.name}
                showDeleteControls={true}
                onTeacherDeactivated={() => {
                  // Refresh school data after teacher deactivation
                  fetchSchoolProfile();
                }}
              />
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default SchoolProfilePage;
