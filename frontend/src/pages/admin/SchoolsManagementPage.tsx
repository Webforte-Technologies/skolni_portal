import React, { useState, useEffect, useCallback } from 'react';
import { 
  Building2, Search, Plus, Edit, Eye, Users, CreditCard, 
   MapPin, Phone, Mail, Trash2, TrendingUp, Activity, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import Badge from '../../components/ui/Badge';
import DeleteConfirmDialog from '../../components/admin/DeleteConfirmDialog';
import SchoolTeacherSubtable from '../../components/admin/SchoolTeacherSubtable';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';

interface School {
  id: string;
  name: string;
  address?: string;
  city?: string;
  postal_code?: string;
  contact_phone?: string;  // Map to phone display
  contact_email?: string;  // Map to email display
  phone?: string;          // For backward compatibility
  email?: string;          // For backward compatibility
  website?: string;
  teacher_count: number;
  student_count: number;
  subscription_plan: string;
  credits_balance: number;
  total_credits: number;   // From backend findAllWithStats
  created_at: string;
  is_active: boolean;
}

const SchoolsManagementPage: React.FC = () => {
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalSchools, setTotalSchools] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    schoolId: string | null;
    schoolName: string;
    showTeacherManagement: boolean;
  }>({
    isOpen: false,
    schoolId: null,
    schoolName: '',
    showTeacherManagement: false
  });
  const [deleting, setDeleting] = useState(false);
  const [selectedSchoolForTeachers, setSelectedSchoolForTeachers] = useState<School | null>(null);
  const pageSize = 20;

  const { showToast } = useToast();
  const navigate = useNavigate();

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        limit: pageSize.toString(),
        offset: (currentPage * pageSize).toString(),
        q: searchQuery
      });
      
      const res = await api.get<any>(`/admin/schools?${queryParams.toString()}`);
      setSchools(res.data.data.data || []);
      setTotalSchools(res.data.data.total || 0);
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při načítání škol' });
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, pageSize, showToast]);

  useEffect(() => {
    fetchSchools();
  }, [currentPage, searchQuery, fetchSchools]);

  const totalPages = Math.ceil(totalSchools / pageSize);

  const handleDeleteSchool = (schoolId: string, schoolName: string) => {
    setDeleteDialog({
      isOpen: true,
      schoolId,
      schoolName,
      showTeacherManagement: false
    });
  };

  const handleDeleteWithTeacherManagement = (school: School) => {
    setSelectedSchoolForTeachers(school);
    setDeleteDialog({
      isOpen: true,
      schoolId: school.id,
      schoolName: school.name,
      showTeacherManagement: true
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteDialog.schoolId) return;

    try {
      setDeleting(true);
      
      // Check if we need to auto-deactivate teachers
      const autoDeactivate = deleteDialog.showTeacherManagement;
      
      const response = await api.delete(`/admin/schools/${deleteDialog.schoolId}`, {
        data: {
          auto_deactivate_teachers: autoDeactivate,
          reason: 'School deletion by admin'
        }
      });

      const message = response.data?.message || 'Škola byla úspěšně smazána';
      showToast({ type: 'success', message });
      
      setDeleteDialog({ isOpen: false, schoolId: null, schoolName: '', showTeacherManagement: false });
      setSelectedSchoolForTeachers(null);
      fetchSchools();
    } catch (error: any) {
      const errorData = error.response?.data;
      
      if (errorData?.requires_teacher_deactivation) {
        // Show teacher management option
        setDeleteDialog(prev => ({ ...prev, showTeacherManagement: true }));
        showToast({ 
          type: 'warning', 
          message: `Škola má ${errorData.active_teachers} aktivních učitelů. Musíte je nejprve deaktivovat.` 
        });
      } else {
        const errorMessage = errorData?.error || 'Chyba při mazání školy';
        showToast({ type: 'error', message: errorMessage });
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, schoolId: null, schoolName: '', showTeacherManagement: false });
    setSelectedSchoolForTeachers(null);
  };

  const handleTeacherDeactivated = () => {
    // Refresh schools data after teacher deactivation
    fetchSchools();
    showToast({ type: 'success', message: 'Učitelé byli úspěšně deaktivováni' });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Správa škol</h1>
            <p className="text-gray-600 mt-1">Spravujte školy a jejich předplatná</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="secondary" onClick={() => navigate('/admin/schools/analytics')}>
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytika
            </Button>
            <Button variant="secondary" onClick={() => navigate('/admin/schools/activity')}>
              <Activity className="w-4 h-4 mr-2" />
              Aktivita
            </Button>
            <Button variant="secondary" onClick={() => navigate('/admin/schools/import-export')}>
              <Download className="w-4 h-4 mr-2" />
              Import/Export
            </Button>
            <Button variant="primary" onClick={() => navigate('/admin/schools/create')}>
              <Plus className="w-4 h-4 mr-2" />
              Nová škola
            </Button>
          </div>
        </div>

      {/* Search and Filters */}
      <Card>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <InputField
              name="search"
              label=""
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Hledat podle názvu školy nebo města..."
              className="w-full"
            />
          </div>
          <Button onClick={() => { setCurrentPage(0); fetchSchools(); }} isLoading={loading}>
            <Search className="w-4 h-4 mr-2" />
            Hledat
          </Button>
        </div>
      </Card>

      {/* Schools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {schools.map((school) => (
          <Card key={school.id} className="hover:shadow-lg transition-shadow">
            {/* School Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{school.name}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                <MapPin className="w-4 h-4" />
                {school.city || 'N/A'}{school.postal_code ? `, ${school.postal_code}` : ''}
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Badge 
                  variant={school.subscription_plan === 'premium' ? 'success' : 'secondary'}
                  className="text-xs"
                >
                  {school.subscription_plan === 'premium' ? 'Premium' : 'Základní'} plán
                </Badge>
              </div>
                </div>
              </div>
              {/* School Actions */}
              <div className="flex items-center gap-2 mb-4">
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => navigate(`/admin/schools/${school.id}`)}
                  title="Zobrazit profil školy"
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => navigate(`/admin/schools/${school.id}/edit`)}
                  title="Upravit školu"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => handleDeleteWithTeacherManagement(school)}
                  title="Smazat školu s možností správy učitelů"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* School Details - Enhanced Layout */}
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 font-medium">Telefon:</span>
                  <span className="text-gray-900">{school.contact_phone || school.phone || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600 font-medium">Email:</span>
                  <span className="text-gray-900">{school.contact_email || school.email || 'N/A'}</span>
                </div>
              </div>
              {school.website && (
                <div className="flex items-center gap-2 text-sm text-blue-600">
                  <span>🌐</span>
                  <span className="text-gray-600 font-medium">Web:</span>
                  <a href={school.website} target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-600">
                    {school.website}
                  </a>
                </div>
              )}
            </div>

            {/* Statistics - Enhanced */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">Učitelé</span>
                </div>
                <div className="text-2xl font-bold text-blue-900">{school.teacher_count || 0}</div>
                <div className="text-xs text-blue-600 mt-1">Registrováno</div>
              </div>
              <div className="text-center p-3 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-green-700">Studenti</span>
                </div>
                <div className="text-2xl font-bold text-green-900">{school.student_count || 0}</div>
                <div className="text-xs text-green-600 mt-1">Celkem</div>
              </div>
            </div>

            {/* Credits Information - Enhanced */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200 mb-4">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-blue-600" />
                Kreditový systém školy
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Celkové kredity školy</span>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    <span className="font-bold text-lg text-purple-700">
                      {(school.total_credits || school.credits_balance || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Dostupné kredity</span>
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span className="font-bold text-lg text-blue-700">
                      {(school.credits_balance || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 mt-2 p-2 bg-white rounded border-l-4 border-blue-400">
                  💡 Kredity jsou rozděleny mezi učitele školy a umožňují generování materiálů
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-200">
              <div className="text-xs text-gray-500">
                Registrováno: {new Date(school.created_at).toLocaleDateString('cs-CZ')}
              </div>
              <div className={`w-3 h-3 rounded-full ${school.is_active ? 'bg-green-500' : 'bg-red-500'}`} 
                   title={school.is_active ? 'Aktivní' : 'Neaktivní'} />
            </div>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Card>
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Zobrazeno {schools.length} z {totalSchools} škol
            </div>
            <div className="flex items-center gap-2">
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
        </Card>
      )}

      {/* Empty State */}
      {!loading && schools.length === 0 && (
        <Card className="text-center py-12">
          <Building2 className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné školy nenalezeny</h3>
          <p className="text-gray-500 mb-4">
            {searchQuery ? `Pro vyhledávání "${searchQuery}" nebyly nalezeny žádné výsledky.` : 'Zatím nejsou registrovány žádné školy.'}
          </p>
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Přidat první školu
          </Button>
        </Card>
      )}

      {/* Enhanced Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Smazat školu"
        entityName={deleteDialog.schoolName}
        impactMessage={
          deleteDialog.showTeacherManagement 
            ? "Škola bude smazána a všichni její učitelé budou automaticky deaktivováni."
            : "Škola bude deaktivována a všichni její uživatelé budou muset být přesunuti nebo deaktivováni."
        }
        loading={deleting}
      />

      {/* Teacher Management Modal */}
      {deleteDialog.showTeacherManagement && selectedSchoolForTeachers && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div 
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={handleDeleteCancel}
            />

            {/* Modal */}
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      Správa učitelů před smazáním školy: {selectedSchoolForTeachers.name}
                    </h3>
                    <div className="mt-2">
                      <SchoolTeacherSubtable
                        schoolId={selectedSchoolForTeachers.id}
                        schoolName={selectedSchoolForTeachers.name}
                        onTeacherDeactivated={handleTeacherDeactivated}
                        showDeleteControls={true}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  variant="danger"
                  onClick={handleDeleteConfirm}
                  disabled={deleting}
                  isLoading={deleting}
                  className="w-full sm:w-auto sm:ml-3"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Smazat školu s deaktivací učitelů
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDeleteCancel}
                  disabled={deleting}
                  className="mt-3 w-full sm:mt-0 sm:w-auto"
                >
                  Zrušit
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
};

export default SchoolsManagementPage;
