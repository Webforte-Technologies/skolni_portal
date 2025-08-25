import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Activity, Filter, Calendar, Search, 
  Building2, Users, Clock, TrendingUp, BarChart3
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';
import SchoolActivityChart from '../../components/admin/SchoolActivityChart';
import SchoolActivityLog from '../../components/admin/SchoolActivityLog';

interface ActivityLog {
  id: string;
  school_id: string;
  school_name: string;
  action_type: string;
  description: string;
  user_id?: string;
  user_name?: string;
  metadata: any;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

interface ActivityFilters {
  school_id?: string;
  action_type?: string;
  date_from?: string;
  date_to?: string;
  user_id?: string;
  search?: string;
}

const SchoolActivityPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalLogs, setTotalLogs] = useState(0);
  const [filters, setFilters] = useState<ActivityFilters>({});
  const [showFilters, setShowFilters] = useState(false);
  const [schools, setSchools] = useState<Array<{ id: string; name: string }>>([]);
  const [actionTypes, setActionTypes] = useState<string[]>([]);
  
  const pageSize = 20;

  useEffect(() => {
    fetchActivityLogs();
    fetchSchools();
    fetchActionTypes();
  }, [currentPage, filters]);

  const fetchActivityLogs = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        limit: pageSize.toString(),
        offset: (currentPage * pageSize).toString(),
        ...filters
      });
      
      const response = await api.get(`/admin/schools/activity-logs?${queryParams.toString()}`);
      setActivityLogs(response.data.data.data || []);
      setTotalLogs(response.data.data.total || 0);
    } catch (error: any) {
      showToast({ 
        type: 'error', 
        message: error.response?.data?.error || 'Chyba při načítání aktivit' 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const response = await api.get('/admin/schools?limit=1000');
      setSchools(response.data.data.data || []);
    } catch (error) {
      console.error('Failed to fetch schools:', error);
    }
  };

  const fetchActionTypes = async () => {
    try {
      const response = await api.get('/admin/schools/activity-logs/action-types');
      setActionTypes(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch action types:', error);
    }
  };

  const handleFilterChange = (key: keyof ActivityFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(0);
  };

  const clearFilters = () => {
    setFilters({});
    setCurrentPage(0);
  };

  const totalPages = Math.ceil(totalLogs / pageSize);

  const getActionTypeLabel = (actionType: string) => {
    const labels: Record<string, string> = {
      'school_created': 'Vytvoření školy',
      'school_updated': 'Aktualizace školy',
      'school_deleted': 'Smazání školy',
      'teacher_added': 'Přidání učitele',
      'teacher_removed': 'Odebrání učitele',
      'credits_added': 'Přidání kreditů',
      'credits_used': 'Použití kreditů',
      'admin_login': 'Přihlášení administrátora',
      'settings_changed': 'Změna nastavení',
      'notification_sent': 'Odeslání oznámení'
    };
    return labels[actionType] || actionType;
  };

  const getActionTypeColor = (actionType: string) => {
    const colors: Record<string, string> = {
      'school_created': 'bg-green-100 text-green-800',
      'school_updated': 'bg-blue-100 text-blue-800',
      'school_deleted': 'bg-red-100 text-red-800',
      'teacher_added': 'bg-purple-100 text-purple-800',
      'teacher_removed': 'bg-orange-100 text-orange-800',
      'credits_added': 'bg-emerald-100 text-emerald-800',
      'credits_used': 'bg-amber-100 text-amber-800',
      'admin_login': 'bg-indigo-100 text-indigo-800',
      'settings_changed': 'bg-gray-100 text-gray-800',
      'notification_sent': 'bg-pink-100 text-pink-800'
    };
    return colors[actionType] || 'bg-gray-100 text-gray-800';
  };

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
              <h1 className="text-3xl font-bold text-gray-900">Aktivita škol</h1>
              <p className="text-gray-600 mt-1">Monitoring a sledování aktivit škol</p>
            </div>
          </div>
          <Button 
            variant="secondary" 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filtry</span>
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtry aktivit</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Škola</label>
                <select
                  value={filters.school_id || ''}
                  onChange={(e) => handleFilterChange('school_id', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Všechny školy</option>
                  {schools.map((school) => (
                    <option key={school.id} value={school.id}>
                      {school.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Typ akce</label>
                <select
                  value={filters.action_type || ''}
                  onChange={(e) => handleFilterChange('action_type', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="">Všechny akce</option>
                  {actionTypes.map((type) => (
                    <option key={type} value={type}>
                      {getActionTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Od data</label>
                <input
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Do data</label>
                <input
                  type="date"
                  value={filters.date_to || ''}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>

            <div className="mt-4 flex items-center space-x-3">
              <InputField
                name="search"
                label=""
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Hledat v popisu..."
                className="flex-1"
              />
              <Button variant="secondary" onClick={clearFilters}>
                Vymazat filtry
              </Button>
            </div>
          </Card>
        )}

        {/* Activity Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Celkem aktivit</p>
                <p className="text-2xl font-bold text-gray-900">{totalLogs}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktivní školy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(activityLogs.map(log => log.school_id)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktivní uživatelé</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(activityLogs.filter(log => log.user_id).map(log => log.user_id)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Activity Chart */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Přehled aktivity</h3>
          <SchoolActivityChart />
        </Card>

        {/* Activity Logs */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Seznam aktivit</h3>
          
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="space-y-4">
              {activityLogs.map((log) => (
                <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionTypeColor(log.action_type)}`}>
                          {getActionTypeLabel(log.action_type)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(log.created_at).toLocaleString('cs-CZ')}
                        </span>
                      </div>
                      
                      <div className="mb-2">
                        <span className="font-medium text-gray-900">{log.school_name}</span>
                        {log.user_name && (
                          <span className="text-gray-600 ml-2">• {log.user_name}</span>
                        )}
                      </div>
                      
                      <p className="text-gray-700">{log.description}</p>
                      
                      {log.metadata && Object.keys(log.metadata).length > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          <details>
                            <summary className="cursor-pointer hover:text-gray-700">
                              Zobrazit metadata
                            </summary>
                            <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                              {JSON.stringify(log.metadata, null, 2)}
                            </pre>
                          </details>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Zobrazeno {activityLogs.length} z {totalLogs} aktivit
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="secondary" 
                  disabled={currentPage <= 0} 
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                >
                  Předchozí
                </Button>
                <span className="text-sm text-gray-600">
                  {currentPage + 1} / {Math.max(1, totalPages)}
                </span>
                <Button 
                  variant="secondary" 
                  disabled={(currentPage + 1) >= totalPages} 
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Další
                </Button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && activityLogs.length === 0 && (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné aktivity nenalezeny</h3>
              <p className="text-gray-500">
                Pro zadané filtry nebyly nalezeny žádné aktivity.
              </p>
            </div>
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default SchoolActivityPage;
