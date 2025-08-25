import React, { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Calendar, CheckCircle, XCircle, AlertCircle, BarChart3, Bell } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card, Button } from '../../components/ui';
import { teacherService, Teacher, TeacherFilters as TeacherFiltersType } from '../../services/teacherService';
import { errorToMessage } from '../../services/apiClient';
import TeacherCreateModal from '../../components/admin/TeacherCreateModal';
import TeacherEditModal from '../../components/admin/TeacherEditModal';
import TeacherProfileModal from '../../components/admin/TeacherProfileModal';
import TeacherBulkActions from '../../components/admin/TeacherBulkActions';
import TeacherFilters from '../../components/admin/TeacherFilters';
import TeacherSearch from '../../components/admin/TeacherSearch';
import TeacherQuickFilters from '../../components/admin/TeacherQuickFilters';
import TeacherSearchResults from '../../components/admin/TeacherSearchResults';
import TeacherAnalyticsDashboard from '../../components/admin/TeacherAnalyticsDashboard';
import TeacherNotificationSystem from '../../components/admin/TeacherNotificationSystem';
import TeacherPerformanceMetrics from '../../components/admin/TeacherPerformanceMetrics';

const TeachersPage: React.FC = () => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentFilters, setCurrentFilters] = useState<TeacherFiltersType>({
    limit: 50,
    offset: 0,
  });
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortField, setSortField] = useState<string>();
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [teacherStats, setTeacherStats] = useState<any>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [profileTeacherId, setProfileTeacherId] = useState<string | null>(null);
  
  // Phase 5 modal states
  const [showAnalyticsDashboard, setShowAnalyticsDashboard] = useState(false);
  const [showNotificationSystem, setShowNotificationSystem] = useState(false);
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(false);
  const [performanceTeacherId, setPerformanceTeacherId] = useState<string | null>(null);

    const fetchTeachers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await teacherService.getTeachers(currentFilters);
      setTeachers(response.data);
      setTotal(response.total);
      
      // Update current page based on offset (for potential future use)
      // const newPage = Math.floor((currentFilters.offset || 0) / 50) + 1;
    } catch (err) {
      console.error('Failed to fetch teachers:', err);
      setError(errorToMessage(err));
    } finally {
      setLoading(false);
    }
  }, [currentFilters]);

  const fetchTeacherStats = useCallback(async () => {
    try {
      // Use current filters for statistics (excluding pagination)
      const statsFilters = { ...currentFilters };
      delete statsFilters.limit;
      delete statsFilters.offset;
      
      const stats = await teacherService.getTeacherStats(statsFilters);
      setTeacherStats(stats);
    } catch (err) {
      console.error('Failed to fetch teacher stats:', err);
    }
  }, [currentFilters]);

  useEffect(() => {
    fetchTeachers();
    fetchTeacherStats(); // Update stats when filters change
  }, [fetchTeachers, fetchTeacherStats]);

  // Since filtering is now done on the server side, we don't need client-side filtering
  const filteredTeachers = teachers;

  // Handle filter changes
  const handleFiltersChange = (newFilters: TeacherFiltersType) => {
    setCurrentFilters(newFilters);
  };

  // Handle search
  const handleSearch = (query: string, additionalFilters?: TeacherFiltersType) => {
    const newFilters = {
      ...currentFilters,
      ...additionalFilters,
      q: query || undefined,
      offset: 0
    };
    setCurrentFilters(newFilters);
  };

  // Handle sort change
  const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
    setSortField(field);
    setSortDirection(direction);
    
    // Update filters to trigger server-side sorting
    const newFilters = {
      ...currentFilters,
      sort_field: field,
      sort_direction: direction,
      offset: 0 // Reset to first page when sorting
    };
    setCurrentFilters(newFilters);
  };

  // Handle view mode change
  const handleViewModeChange = (mode: 'list' | 'grid') => {
    setViewMode(mode);
    localStorage.setItem('teacher_view_mode', mode);
  };

  // Load view mode from localStorage
  useEffect(() => {
    const savedViewMode = localStorage.getItem('teacher_view_mode') as 'list' | 'grid';
    if (savedViewMode) {
      setViewMode(savedViewMode);
    }
  }, []);

  // Modal handlers
  const handleCreateSuccess = () => {
    fetchTeachers();
  };

  const handleEditSuccess = () => {
    fetchTeachers();
    setSelectedTeacher(null);
  };

  const handleCloseModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setShowProfileModal(false);
    setSelectedTeacher(null);
    setProfileTeacherId(null);
    
    // Phase 5 modals
    setShowAnalyticsDashboard(false);
    setShowNotificationSystem(false);
    setShowPerformanceMetrics(false);
    setPerformanceTeacherId(null);
  };

  const handleBulkActionSuccess = () => {
    fetchTeachers();
  };

  const handleClearSelection = () => {
    setSelectedTeachers([]);
  };

  if (loading && teachers.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Načítání učitelů...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Error Display */}
        {error && (
          <Card className="p-4 border-red-200 bg-red-50">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setError(null)}
                className="ml-auto text-red-600 hover:text-red-700"
              >
                ×
              </Button>
            </div>
          </Card>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Správa učitelů</h1>
            <p className="text-gray-600">Přehled a správa všech učitelů na platformě</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button
              variant="secondary"
              onClick={() => setShowAnalyticsDashboard(true)}
              className="flex items-center space-x-2"
              disabled={loading}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Analytika</span>
            </Button>
            
            <Button
              variant="secondary"
              onClick={() => setShowNotificationSystem(true)}
              className="flex items-center space-x-2"
              disabled={loading}
            >
              <Bell className="w-4 h-4" />
              <span>Oznámení</span>
            </Button>
            
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2"
              disabled={loading}
            >
              <Plus className="w-4 h-4" />
              <span>Přidat učitele</span>
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Celkem učitelů</p>
                <p className="text-2xl font-bold text-gray-900">{teacherStats?.total || total}</p>
              </div>
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktivní</p>
                <p className="text-2xl font-bold text-green-600">
                  {teacherStats?.active || teachers.filter(t => t.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Čekající na schválení</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {teacherStats?.pending || teachers.filter(t => t.status === 'pending_verification').length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nepotvrzení</p>
                <p className="text-2xl font-bold text-red-600">
                  {teacherStats?.unverified || teachers.filter(t => !t.email_verified).length}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </Card>
        </div>

        {/* Bulk Actions */}
        <TeacherBulkActions
          selectedTeacherIds={selectedTeachers}
          onSuccess={handleBulkActionSuccess}
          onClearSelection={handleClearSelection}
        />

        {/* Enhanced Search */}
        <TeacherSearch
          onSearch={handleSearch}
          currentFilters={currentFilters}
          className="mb-6"
        />

        {/* Quick Filters */}
        <TeacherQuickFilters
          onFilterSelect={handleFiltersChange}
          currentFilters={currentFilters}
          teacherStats={teacherStats}
        />

        {/* Advanced Filters (Collapsible) */}
        <TeacherFilters
          filters={currentFilters}
          onFiltersChange={handleFiltersChange}
          loading={loading}
        />

        {/* Search Results */}
        <TeacherSearchResults
          teachers={filteredTeachers}
          total={total}
          loading={loading}
          currentFilters={currentFilters}
          searchQuery={currentFilters.q}
          onSortChange={handleSortChange}
          onViewModeChange={handleViewModeChange}
          viewMode={viewMode}
          sortField={sortField}
          sortDirection={sortDirection}
          onShowPerformanceMetrics={(teacherId) => {
            setPerformanceTeacherId(teacherId);
            setShowPerformanceMetrics(true);
          }}
        />

        {/* Modals */}
        <TeacherCreateModal
          isOpen={showCreateModal}
          onClose={handleCloseModals}
          onSuccess={handleCreateSuccess}
        />

        <TeacherEditModal
          isOpen={showEditModal}
          teacher={selectedTeacher}
          onClose={handleCloseModals}
          onSuccess={handleEditSuccess}
        />

        <TeacherProfileModal
          isOpen={showProfileModal}
          teacherId={profileTeacherId || ''}
          onClose={handleCloseModals}
        />

        {/* Phase 5 Modals */}
        <TeacherAnalyticsDashboard
          isOpen={showAnalyticsDashboard}
          onClose={handleCloseModals}
        />

        <TeacherNotificationSystem
          isOpen={showNotificationSystem}
          onClose={handleCloseModals}
        />

        <TeacherPerformanceMetrics
          teacherId={performanceTeacherId || ''}
          isOpen={showPerformanceMetrics}
          onClose={handleCloseModals}
        />
      </div>
    </AdminLayout>
  );
};

export default TeachersPage;
