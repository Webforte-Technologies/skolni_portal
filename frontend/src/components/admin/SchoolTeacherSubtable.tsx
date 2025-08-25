import React, { useState, useEffect } from 'react';
import { Users, UserX, AlertTriangle } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';

interface Teacher {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
  subjects?: string[];
}

interface SchoolTeacherSubtableProps {
  schoolId: string;
  schoolName: string;
  onTeacherDeactivated?: () => void;
  showDeleteControls?: boolean;
}

const SchoolTeacherSubtable: React.FC<SchoolTeacherSubtableProps> = ({
  schoolId,
  schoolName,
  onTeacherDeactivated,
  showDeleteControls = false
}) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeachers, setSelectedTeachers] = useState<Set<string>>(new Set());
  const [deactivating, setDeactivating] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    if (schoolId) {
      fetchTeachers();
    }
  }, [schoolId]);

  const fetchTeachers = async () => {
    if (!schoolId) return;
    
    try {
      setLoading(true);
      const response = await api.get(`/admin/schools/${schoolId}/teachers`);
      
      // The API returns { teachers: [...], total: number, school_id: string, school_name: string }
      const teachersData = (response.data as any)?.teachers;
      if (Array.isArray(teachersData)) {
        setTeachers(teachersData);
      } else {
        // Fallback to empty array if the response structure is unexpected
        console.warn('Unexpected API response structure for teachers:', response.data);
        setTeachers([]);
      }
    } catch (error: any) {
      console.error('Error fetching teachers:', error);
      showToast({ 
        type: 'error', 
        message: error.response?.data?.error || 'Chyba při načítání učitelů školy' 
      });
      setTeachers([]); // Ensure we always have an array
    } finally {
      setLoading(false);
    }
  };

  const handleTeacherSelection = (teacherId: string) => {
    if (!teacherId) return;
    
    const newSelection = new Set(selectedTeachers);
    if (newSelection.has(teacherId)) {
      newSelection.delete(teacherId);
    } else {
      newSelection.add(teacherId);
    }
    setSelectedTeachers(newSelection);
  };

  const handleSelectAll = () => {
    if (!Array.isArray(teachers) || teachers.length === 0) return;
    
    if (selectedTeachers.size === teachers.length) {
      setSelectedTeachers(new Set());
    } else {
      const allTeacherIds = teachers.map(t => t.id).filter(Boolean);
      setSelectedTeachers(new Set(allTeacherIds));
    }
  };

  const handleBulkDeactivate = async () => {
    if (selectedTeachers.size === 0) return;

    try {
      setDeactivating(true);
      await api.post(`/admin/schools/${schoolId}/teachers/bulk-deactivate`, {
        teacher_ids: Array.from(selectedTeachers)
      });

      showToast({ 
        type: 'success', 
        message: `Úspěšně deaktivováno ${selectedTeachers.size} učitelů` 
      });

      setSelectedTeachers(new Set());
      fetchTeachers();
      onTeacherDeactivated?.();
    } catch (error: any) {
      showToast({ 
        type: 'error', 
        message: error.response?.data?.error || 'Chyba při deaktivaci učitelů' 
      });
    } finally {
      setDeactivating(false);
    }
  };

  const handleIndividualDeactivate = async (teacherId: string) => {
    try {
      await api.post(`/admin/schools/${schoolId}/teachers/bulk-deactivate`, {
        teacher_ids: [teacherId]
      });

      showToast({ 
        type: 'success', 
        message: 'Učitel byl úspěšně deaktivován' 
      });

      fetchTeachers();
      onTeacherDeactivated?.();
    } catch (error: any) {
      showToast({ 
        type: 'error', 
        message: error.response?.data?.error || 'Chyba při deaktivaci učitele' 
      });
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('cs-CZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const getRelativeTime = (dateString: string): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Méně než hodinu';
      if (diffInHours < 24) return `Před ${diffInHours} hodinami`;
      if (diffInHours < 48) return 'Včera';
      return formatDate(dateString);
    } catch (error) {
      return 'N/A';
    }
  };

  // Don't render if schoolId is not provided
  if (!schoolId) {
    return (
      <Card>
        <div className="text-center py-8 text-gray-500">
          <p>Chybí ID školy</p>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    );
  }

  // Ensure teachers is always an array
  const safeTeachers = Array.isArray(teachers) ? teachers : [];

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Users className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            Učitelé školy: {schoolName}
          </h3>
          <Badge variant="default" className="ml-2">
            {safeTeachers.length} učitelů
          </Badge>
        </div>
        
        {safeTeachers.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSelectAll}
              disabled={deactivating}
            >
              {selectedTeachers.size === safeTeachers.length ? 'Odznačit vše' : 'Označit vše'}
            </Button>
            
            {selectedTeachers.size > 0 && (
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkDeactivate}
                disabled={deactivating}
                isLoading={deactivating}
              >
                <UserX className="w-4 h-4 mr-2" />
                Deaktivovat vybrané ({selectedTeachers.size})
              </Button>
            )}
          </div>
        )}
      </div>

      {safeTeachers.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Tato škola zatím nemá žádné registrované učitele.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {safeTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className={`flex items-center justify-between p-3 rounded-lg border ${
                selectedTeachers.has(teacher.id) 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-200 hover:bg-gray-50'
              } transition-colors`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={selectedTeachers.has(teacher.id) || false}
                  onChange={() => handleTeacherSelection(teacher.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  disabled={deactivating}
                />
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-600" />
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900">
                        {teacher.first_name || ''} {teacher.last_name || ''}
                      </span>
                      <Badge 
                        variant={teacher.is_active ? 'success' : 'default'}
                        className="text-xs"
                      >
                        {teacher.is_active ? 'Aktivní' : 'Neaktivní'}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">{teacher.email || 'N/A'}</div>
                    {teacher.subjects && Array.isArray(teacher.subjects) && teacher.subjects.length > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Předměty: {teacher.subjects.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right text-sm text-gray-500">
                  <div>Registrován: {formatDate(teacher.created_at)}</div>
                  {teacher.last_login_at && (
                    <div>Poslední přihlášení: {getRelativeTime(teacher.last_login_at)}</div>
                  )}
                </div>

                {showDeleteControls && teacher.is_active && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleIndividualDeactivate(teacher.id)}
                    disabled={deactivating}
                    title="Deaktivovat učitele"
                  >
                    <UserX className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {showDeleteControls && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-800">
              <p className="font-medium">Důležité upozornění:</p>
              <p>Deaktivace učitelů je nutná před smazáním školy. Deaktivovaní učitelé ztratí přístup k systému, ale jejich data zůstanou zachována.</p>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default SchoolTeacherSubtable;
