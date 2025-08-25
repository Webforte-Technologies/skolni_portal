import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Download, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import DeleteConfirmDialog from '../../components/admin/DeleteConfirmDialog';
import AdvancedUserFilters from '../../components/admin/AdvancedUserFilters';
import EnhancedUserFilters, { EnhancedUserFilters as EnhancedUserFiltersType } from '../../components/admin/EnhancedUserFilters';
import UserActivityLog from '../../components/admin/UserActivityLog';
import UserSearchControls from '../../components/admin/UserSearchControls';
import UserBulkActions from '../../components/admin/UserBulkActions';
import UserTable from '../../components/admin/UserTable';
import BulkActionConfirmDialog from '../../components/admin/BulkActionConfirmDialog';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminErrorBoundary from '../../components/admin/AdminErrorBoundary';
import filterPersistenceService, { SavedFilter } from '../../services/filterPersistenceService';
import { extractUsersFromResponse, transformUserToBackend, StandardUser } from '../../utils/dataTransform';

// Use StandardUser from dataTransform utility
type User = StandardUser;

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

interface ActivityLog {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  action?: string;
  action_type: 'login' | 'logout' | 'page_view' | 'api_call' | 'file_generated' | 
               'conversation_started' | 'credits_used' | 'profile_updated' | 
               'password_changed' | 'email_verified' | 'subscription_changed';
  details?: string;
  ip_address?: string;
  user_agent?: string;
  timestamp?: string;
  session_id?: string;
  credits_used?: number;
  school_id?: string;
  school_name?: string;
  activity_data?: Record<string, any>;
  created_at?: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
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
  
  // Enhanced filters state
  const [enhancedFilters, setEnhancedFilters] = useState<EnhancedUserFiltersType>(
    filterPersistenceService.getDefaultFilters()
  );
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [schools, setSchools] = useState<Array<{ id: string; name: string; city?: string }>>([]);
  const [useEnhancedFilters, setUseEnhancedFilters] = useState(false);
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
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [showRecentActivity, setShowRecentActivity] = useState(false);
  
  // Sorting state
  const [sortField, setSortField] = useState<string>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  // Bulk action confirmation state
  const [bulkConfirmDialog, setBulkConfirmDialog] = useState<{
    isOpen: boolean;
    action: string;
    selectedUsers: User[];
  }>({
    isOpen: false,
    action: '',
    selectedUsers: []
  });
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  
  const pageSize = 20;

  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Prepare params for API call
      let params: any;
      
      if (useEnhancedFilters) {
        // Use enhanced filters
        params = {
          page: currentPage,
          limit: pageSize,
          order_by: sortField,
          order_direction: sortDirection,
          ...filterPersistenceService.filtersToApiParams(enhancedFilters)
        };
      } else {
        // Use basic filters
        params = {
          page: currentPage,
          limit: pageSize,
          search: searchQuery,
          role: filters.role !== 'all' ? filters.role : undefined,
          school_id: filters.school !== 'all' ? filters.school : undefined,
          is_active: filters.status === 'active' ? 'true' : filters.status === 'inactive' ? 'false' : undefined,
          status: filters.status !== 'all' ? filters.status : undefined,
          order_by: sortField,
          order_direction: sortDirection
        };
      }

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

      const response = await api.get<ApiResponse<UsersResponse>>('/admin/users', { params });
      
      // Use data transformation utility to handle inconsistent data formats
      if (response.data.success) {
        const transformedUsers = extractUsersFromResponse(response);
        setUsers(transformedUsers);
        
        // Extract total from response data
        const responseData = response.data as any;
        const total = responseData.data?.total || transformedUsers.length;
        setTotalUsers(total);
      } else {
        setUsers([]);
        setTotalUsers(0);
      }
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při načítání uživatelů' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, filters, pageSize, searchQuery, sortField, sortDirection, useEnhancedFilters, enhancedFilters, showToast]);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filters, fetchUsers]);

  // Initialize enhanced filters and load saved filters
  useEffect(() => {
    // Load saved filters from localStorage
    setSavedFilters(filterPersistenceService.getSavedFilters());
    
    // Load filters from URL if present
    const urlFilters = filterPersistenceService.loadFiltersFromUrl();
    if (Object.keys(urlFilters).length > 0) {
      setEnhancedFilters(prev => ({ ...prev, ...urlFilters }));
      setUseEnhancedFilters(true);
    }
    
    // Load schools for filter dropdown
    fetchSchools();
  }, []);

  // Save filters to URL when they change
  useEffect(() => {
    if (useEnhancedFilters && filterPersistenceService.hasActiveFilters(enhancedFilters)) {
      filterPersistenceService.saveFiltersToUrl(enhancedFilters);
    }
  }, [enhancedFilters, useEnhancedFilters]);

  const fetchSchools = async () => {
    try {
      const response = await api.get('/schools?limit=100');
      if (response.data.success && response.data.data) {
        setSchools(response.data.data as Array<{ id: string; name: string; city?: string }>);
      }
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  // Enhanced filter handlers
  const handleEnhancedFiltersChange = (newFilters: EnhancedUserFiltersType) => {
    setEnhancedFilters(newFilters);
    setCurrentPage(0); // Reset to first page when filters change
  };

  const handleSaveFilter = (name: string, filters: EnhancedUserFiltersType) => {
    try {
      const savedFilter = filterPersistenceService.saveFilter(name, filters);
      setSavedFilters(prev => [...prev, savedFilter]);
      showToast({ type: 'success', message: `Filtr "${name}" byl uložen` });
    } catch (error) {
      showToast({ type: 'error', message: 'Nepodařilo se uložit filtr' });
    }
  };

  const handleLoadFilter = (filters: EnhancedUserFiltersType) => {
    setEnhancedFilters(filters);
    setUseEnhancedFilters(true);
    setCurrentPage(0);
    showToast({ type: 'success', message: 'Filtr byl načten' });
  };

  const handleDeleteFilter = (filterId: string) => {
    try {
      filterPersistenceService.deleteFilter(filterId);
      setSavedFilters(prev => prev.filter(f => f.id !== filterId));
      showToast({ type: 'success', message: 'Filtr byl smazán' });
    } catch (error) {
      showToast({ type: 'error', message: 'Nepodařilo se smazat filtr' });
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const response = await api.get<ApiResponse<ActivityLog[]>>('/admin/users/activity-logs', {
        params: { limit: 10, date_range: '24h' }
      });
      if (response.data.success && Array.isArray(response.data.data)) {
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

  // Handle sorting
  const handleSort = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
    setCurrentPage(0); // Reset to first page when sorting changes
  };

  // Handle bulk action initiation (show confirmation dialog)
  const handleBulkAction = async () => {
    if (!bulkAction || selectedUsers.length === 0) return;

    const selectedUserObjects = users.filter(user => selectedUsers.includes(user.id));
    
    setBulkConfirmDialog({
      isOpen: true,
      action: bulkAction,
      selectedUsers: selectedUserObjects
    });
  };

  // Handle confirmed bulk action
  const handleBulkActionConfirm = async (data?: any) => {
    if (!bulkConfirmDialog.action || bulkConfirmDialog.selectedUsers.length === 0) return;

    try {
      setBulkActionLoading(true);
      const userIds = bulkConfirmDialog.selectedUsers.map(user => user.id);
      
      switch (bulkConfirmDialog.action) {
        case 'activate':
        case 'deactivate':
          await api.post('/admin/users/bulk', {
            action: bulkConfirmDialog.action,
            user_ids: userIds
          });
          showToast({ 
            type: 'success', 
            message: `${userIds.length} uživatelů bylo ${bulkConfirmDialog.action === 'activate' ? 'aktivováno' : 'deaktivováno'}` 
          });
          break;
        
        case 'addCredits':
          if (!data?.amount || data.amount <= 0) {
            showToast({ type: 'error', message: 'Neplatné množství kreditů' });
            return;
          }
          await api.post('/admin/users/bulk', {
            action: 'addCredits',
            user_ids: userIds,
            amount: data.amount
          });
          showToast({ 
            type: 'success', 
            message: `${data.amount} kreditů bylo přidáno ${userIds.length} uživatelům` 
          });
          break;
        
        case 'delete':
          await api.post('/admin/users/bulk', {
            action: 'delete',
            user_ids: userIds
          });
          showToast({ 
            type: 'success', 
            message: `${userIds.length} uživatelů bylo smazáno` 
          });
          break;
      }
      
      setSelectedUsers([]);
      setBulkAction('');
      setBulkConfirmDialog({ isOpen: false, action: '', selectedUsers: [] });
      fetchUsers();
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při provádění hromadné akce' });
    } finally {
      setBulkActionLoading(false);
    }
  };

  // Handle bulk action cancellation
  const handleBulkActionCancel = () => {
    setBulkConfirmDialog({ isOpen: false, action: '', selectedUsers: [] });
  };

  const handleUserAction = async (userId: string, action: string) => {
    try {
      switch (action) {
        case 'activate':
          await api.put(`/admin/users/${userId}`, transformUserToBackend({ isActive: true }));
          showToast({ type: 'success', message: 'Uživatel byl aktivován' });
          break;
        case 'deactivate':
          await api.put(`/admin/users/${userId}`, transformUserToBackend({ isActive: false }));
          showToast({ type: 'success', message: 'Uživatel byl deaktivován' });
          break;
        case 'edit':
          navigate(`/admin/users/${userId}/edit`);
          return;
        case 'view':
          navigate(`/admin/users/${userId}/profile`);
          return;
        case 'delete':
          {
            const user = users.find(u => u.id === userId);
            if (user) {
              setDeleteDialog({
                isOpen: true,
                userId,
                userName: `${user.firstName} ${user.lastName}`
              });
            }
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

  const resetFilters = () => {
    setFilters({
      status: 'all',
      role: 'all',
      school: 'all',
      dateRange: '30d'
    });
    setSearchQuery('');
    setCurrentPage(0);
  };

  return (
    <AdminLayout>
      <AdminErrorBoundary>
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
      <UserSearchControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        useEnhancedFilters={useEnhancedFilters}
        onToggleEnhancedFilters={() => setUseEnhancedFilters(!useEnhancedFilters)}
        showRecentActivity={showRecentActivity}
        onToggleRecentActivity={() => setShowRecentActivity(!showRecentActivity)}
        loading={loading}
      />

      {/* Enhanced Filters */}
      {useEnhancedFilters && (
        <EnhancedUserFilters
          filters={enhancedFilters}
          onFiltersChange={handleEnhancedFiltersChange}
          schools={schools}
          loading={loading}
          onSaveFilter={handleSaveFilter}
          savedFilters={savedFilters}
          onLoadFilter={handleLoadFilter}
          onDeleteFilter={handleDeleteFilter}
        />
      )}

      {/* Basic Filters (legacy) */}
      {!useEnhancedFilters && showFilters && (
        <Card>
          <div className="pt-4 border-t">
            <AdvancedUserFilters
              filters={{
                search: searchQuery,
                role: filters.role,
                school_id: filters.school,
                is_active: filters.status === 'active' ? 'true' : filters.status === 'inactive' ? 'false' : 'all',
                date_from: filters.date_range_start || '',
                date_to: filters.date_range_end || '',
                credit_min: filters.credit_range_min?.toString() || '',
                credit_max: filters.credit_range_max?.toString() || '',
                last_login_from: filters.last_login_start || '',
                last_login_to: filters.last_login_end || '',
                status: filters.status
              }}
              onFiltersChange={(newFilters) => {
                setFilters({
                  ...filters,
                  role: newFilters.role,
                  school: newFilters.school_id,
                  status: newFilters.is_active === 'true' ? 'active' : newFilters.is_active === 'false' ? 'inactive' : 'all',
                  date_range_start: newFilters.date_from || undefined,
                  date_range_end: newFilters.date_to || undefined,
                  credit_range_min: newFilters.credit_min ? parseInt(newFilters.credit_min) : undefined,
                  credit_range_max: newFilters.credit_max ? parseInt(newFilters.credit_max) : undefined,
                  last_login_start: newFilters.last_login_from || undefined,
                  last_login_end: newFilters.last_login_to || undefined
                });
              }}
              schools={schools}
              loading={loading}
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={() => setShowFilters(false)}>
                Použít filtry
              </Button>
              <Button variant="outline" onClick={resetFilters}>
                Resetovat filtry
              </Button>
            </div>
          </div>
        </Card>
      )}

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
      <UserBulkActions
        selectedCount={selectedUsers.length}
        bulkAction={bulkAction}
        onBulkActionChange={setBulkAction}
        onExecuteBulkAction={handleBulkAction}
        onClearSelection={() => setSelectedUsers([])}
        loading={bulkActionLoading}
      />

      {/* Users Table */}
      <UserTable
        users={users}
        loading={loading}
        selectedUsers={selectedUsers}
        onSelectAll={(selected) => {
          if (selected) {
            setSelectedUsers(users.map(u => u.id));
          } else {
            setSelectedUsers([]);
          }
        }}
        onSelectUser={(userId, selected) => {
          if (selected) {
            setSelectedUsers([...selectedUsers, userId]);
          } else {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
          }
        }}
        onUserAction={handleUserAction}
        currentSortField={sortField}
        currentSortDirection={sortDirection}
        onSort={handleSort}
        currentPage={currentPage}
        totalPages={totalPages}
        totalUsers={totalUsers}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Smazat uživatele"
        entityName={deleteDialog.userName}
        impactMessage="Uživatel bude deaktivován a nebude moci se přihlásit do systému."
        loading={deleting}
      />

      {/* Bulk Action Confirmation Dialog */}
      <BulkActionConfirmDialog
        isOpen={bulkConfirmDialog.isOpen}
        action={bulkConfirmDialog.action}
        selectedUsers={bulkConfirmDialog.selectedUsers}
        onConfirm={handleBulkActionConfirm}
        onCancel={handleBulkActionCancel}
        loading={bulkActionLoading}
      />
        </div>
      </AdminErrorBoundary>
    </AdminLayout>
  );
};

export default UserManagementPage;
