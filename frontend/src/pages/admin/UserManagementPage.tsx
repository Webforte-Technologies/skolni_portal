import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, Plus, Trash2, Mail, CreditCard, CheckCircle, XCircle, Download, Edit, Eye, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import DeleteConfirmDialog from '../../components/admin/DeleteConfirmDialog';
import AdvancedUserFilters from '../../components/admin/AdvancedUserFilters';
import UserActivityLog from '../../components/admin/UserActivityLog';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  school_id?: string;
  credits_balance: number;
  created_at: string;
  school_name?: string;
}



interface UserFilters {
  status: string;
  role: string;
  school: string;
  dateRange: string;
  date_range_start?: string;
  date_range_end?: string;
  credit_range_min?: number;
  credit_range_max?: number;
  last_login_start?: string;
  last_login_end?: string;
  activity_threshold?: number;
}

interface UsersResponse {
  data: User[];
  total: number;
  limit: number;
  offset: number;
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [filters, setFilters] = useState<UserFilters>({
    status: 'all',
    role: 'all',
    school: 'all',
    dateRange: '30d'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [bulkAction, setBulkAction] = useState<string>('');
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    userId: string | null;
    userName: string;
  }>({
    isOpen: false,
    userId: null,
    userName: ''
  });
  const [deleting, setDeleting] = useState(false);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [showRecentActivity, setShowRecentActivity] = useState(false);
  const pageSize = 20;

  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Prepare params for API call
      const params: any = {
        page: currentPage,
        limit: pageSize,
        search: searchQuery,
        role: filters.role !== 'all' ? filters.role : undefined,
        school_id: filters.school !== 'all' ? filters.school : undefined,
        is_active: filters.status === 'active' ? 'true' : filters.status === 'inactive' ? 'false' : undefined,
        status: filters.status !== 'all' ? filters.status : undefined
      };

      // Add advanced filters if they exist
      if (filters.date_range_start && filters.date_range_end) {
        params.date_range_start = filters.date_range_start;
        params.date_range_end = filters.date_range_end;
      }

      if (filters.credit_range_min !== undefined && filters.credit_range_max !== undefined) {
        params.credit_range_min = filters.credit_range_min;
        params.credit_range_max = filters.credit_range_max;
      }

      if (filters.last_login_start && filters.last_login_end) {
        params.last_login_start = filters.last_login_start;
        params.last_login_end = filters.last_login_end;
      }

      if (filters.activity_threshold !== undefined) {
        params.activity_threshold = filters.activity_threshold;
      }

      const response = await api.get<UsersResponse>('/admin/users', { params });
      
      // The backend returns: { success: true, data: { data: rows, total, limit, offset } }
      const usersData = response.data.data;
      if (usersData?.data && Array.isArray(usersData.data)) {
        setUsers(usersData.data);
        setTotalUsers(usersData.total);
      } else {
        setUsers([]);
        setTotalUsers(0);
      }
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při načítání uživatelů' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, pageSize, searchQuery, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filters, fetchUsers]);

  const fetchRecentActivity = async () => {
    try {
      const response = await api.get('/admin/users/activity-logs', {
        params: { limit: 10, date_range: '24h' }
      });
      if (response.data.success) {
        setRecentActivity(response.data.data);
      }
    } catch (error) {
      // Silently fail for recent activity
    }
  };

  useEffect(() => {
    fetchRecentActivity();
    const interval = setInterval(fetchRecentActivity, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    setCurrentPage(0);
    fetchUsers();
  };

  const handleAdvancedSearch = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users/search/advanced', {
        params: {
          q: searchQuery,
          ...filters
        }
      });
      
      if (response.data.success) {
        setUsers(response.data.data.users);
        setTotalUsers(response.data.data.total);
      }
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při pokročilém vyhledávání' });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;

    try {
      const action = bulkAction;
      setBulkAction('');
      setSelectedUsers([]);

      switch (action) {
        case 'activate':
          await api.post('/admin/users/bulk/activate', { userIds: selectedUsers });
          showToast({ type: 'success', message: 'Uživatelé byli aktivováni' });
          break;
        case 'deactivate':
          await api.post('/admin/users/bulk/deactivate', { userIds: selectedUsers });
          showToast({ type: 'success', message: 'Uživatelé byli deaktivováni' });
          break;
        case 'addCredits': {
          const credits = prompt('Zadejte počet kreditů k přidání:');
          if (credits) {
            await api.post('/admin/users/bulk/credits', { 
              userIds: selectedUsers, 
              credits: parseInt(credits) 
            });
            showToast({ type: 'success', message: 'Kredity byly přidány' });
          }
          break;
        }
        case 'delete':
          if (confirm('Opravdu chcete smazat vybrané uživatele?')) {
            await api.delete('/admin/users/bulk', { data: { userIds: selectedUsers } });
            showToast({ type: 'success', message: 'Uživatelé byli smazáni' });
          }
          break;
      }
      
      fetchUsers();
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při provádění hromadné akce' });
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      switch (action) {
        case 'activate':
          await api.put(`/admin/users/${userId}`, { is_active: true });
          showToast({ type: 'success', message: 'Uživatel byl aktivován' });
          break;
        case 'deactivate':
          await api.put(`/admin/users/${userId}`, { is_active: false });
          showToast({ type: 'success', message: 'Uživatel byl deaktivován' });
          break;
        case 'edit':
          navigate(`/admin/users/${userId}/edit`);
          return;
        case 'view':
          navigate(`/admin/users/${userId}/profile`);
          return;
        case 'delete':
          const user = users.find(u => u.id === userId);
          if (user) {
            setDeleteDialog({
              isOpen: true,
              userId,
              userName: `${user.first_name} ${user.last_name}`
            });
          }
          return;
      }
      
      fetchUsers();
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při provádění akce' });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.userId) return;

    try {
      setDeleting(true);
      await api.delete(`/admin/users/${deleteDialog.userId}`);
      showToast({ type: 'success', message: 'Uživatel byl úspěšně smazán' });
      setDeleteDialog({ isOpen: false, userId: null, userName: '' });
      fetchUsers();
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Chyba při mazání uživatele';
      showToast({ type: 'error', message: errorMessage });
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, userId: null, userName: '' });
  };

  const exportUsers = async () => {
    try {
      const response = await api.get('/admin/users/export', {
        params: { ...filters, search: searchQuery },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data as unknown as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users-export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showToast({ type: 'success', message: 'Export byl stažen' });
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při exportu' });
    }
  };

  const totalPages = Math.ceil(totalUsers / pageSize);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Správa uživatelů</h1>
          <p className="text-gray-600">Spravujte uživatele, role a oprávnění</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/admin/users/analytics')}>
            <Activity className="w-4 h-4 mr-2" />
            Analýza
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/users/activity')}>
            <Activity className="w-4 h-4 mr-2" />
            Aktivita
          </Button>
          <Button variant="outline" onClick={() => navigate('/admin/users/import-export')}>
            <Download className="w-4 h-4 mr-2" />
            Import/Export
          </Button>
          <Button variant="outline" onClick={exportUsers}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => navigate('/admin/users/create')}>
            <Plus className="w-4 h-4 mr-2" />
            Nový uživatel
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <InputField
                label="Hledat uživatele"
                name="search"
                placeholder="Hledat uživatele..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
                      <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <Filter className="w-4 h-4 mr-2" />
            Filtry
          </Button>
          <Button variant="outline" onClick={() => setShowRecentActivity(!showRecentActivity)}>
            <Activity className="w-4 h-4 mr-2" />
            Nedávná aktivita
          </Button>
          <Button onClick={handleSearch}>
            <Search className="w-4 h-4 mr-2" />
            Hledat
          </Button>
          <Button variant="outline" onClick={handleAdvancedSearch}>
            <Search className="w-4 h-4 mr-2" />
            Pokročilé
          </Button>
          </div>

          {showFilters && (
            <div className="pt-4 border-t">
              <AdvancedUserFilters
                filters={filters}
                onFilterChange={(newFilters) => setFilters({ ...filters, ...newFilters })}
                onApplyFilters={() => setShowFilters(false)}
                onResetFilters={() => {
                  setFilters({
                    status: 'all',
                    role: 'all',
                    school: 'all',
                    dateRange: '30d'
                  });
                }}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Recent Activity */}
      {showRecentActivity && (
        <Card title="Nedávná aktivita uživatelů" icon={<Activity className="w-5 h-5" />}>
          <UserActivityLog 
            logs={recentActivity}
            loading={false}
            onFilterChange={() => {}}
            onExport={() => {}}
          />
        </Card>
      )}

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <Card>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <span className="text-sm text-gray-600">
              {selectedUsers.length} uživatelů vybráno
            </span>
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Vyberte akci...</option>
              <option value="activate">Aktivovat</option>
              <option value="deactivate">Deaktivovat</option>
              <option value="addCredits">Přidat kredity</option>
              <option value="delete">Smazat</option>
            </select>
            <Button onClick={handleBulkAction} disabled={!bulkAction}>
              Provést akci
            </Button>
            <Button variant="outline" onClick={() => setSelectedUsers([])}>
              Zrušit výběr
            </Button>
          </div>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  <input
                    type="checkbox"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUsers(users.map(u => u.id));
                      } else {
                        setSelectedUsers([]);
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uživatel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stav
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Škola
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kredity
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Poslední přihlášení
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Akce
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    Načítání...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                    Žádní uživatelé nebyli nalezeni
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-800">
                              {user.first_name[0]}{user.last_name[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {user.email}
                            {/* Note: emailVerified field not available in backend response */}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'platform_admin' ? 'bg-red-100 text-red-800' :
                        user.role === 'school_admin' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'platform_admin' ? 'Platforma Admin' :
                         user.role === 'school_admin' ? 'Správce školy' : 'Učitel'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        user.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.is_active ? 'Aktivní' : 'Neaktivní'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.school_name || 'Bez školy'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center">
                        <CreditCard className="w-4 h-4 mr-1 text-blue-500" />
                        {user.credits_balance}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('cs-CZ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUserAction(user.id, 'view')}
                          title="Zobrazit"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUserAction(user.id, 'edit')}
                          title="Upravit"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUserAction(user.id, 'activate')}
                          disabled={user.is_active}
                          title="Aktivovat"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUserAction(user.id, 'deactivate')}
                          disabled={!user.is_active}
                          title="Deaktivovat"
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleUserAction(user.id, 'delete')}
                          title="Smazat"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Zobrazeno {currentPage * pageSize + 1} až {Math.min((currentPage + 1) * pageSize, totalUsers)} z {totalUsers} výsledků
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 0}
              >
                Předchozí
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= totalPages - 1}
              >
                Další
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Smazat uživatele"
        message="Opravdu chcete smazat tohoto uživatele? Tato akce je nevratná."
        entityName={deleteDialog.userName}
        impactMessage="Uživatel bude deaktivován a nebude moci se přihlásit do systému."
        loading={deleting}
      />
      </div>
    </AdminLayout>
  );
};

export default UserManagementPage;
