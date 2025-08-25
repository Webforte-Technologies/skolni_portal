import React, { useState, useEffect } from 'react';
import { User, Mail, Building2, CreditCard, Shield, AlertCircle } from 'lucide-react';
import { Button, Input, Card } from '../ui';
import { Teacher, CreateTeacherRequest, UpdateTeacherRequest } from '../../services/teacherService';
import { School } from '../../types';
import { api } from '../../services/apiClient';

interface TeacherFormProps {
  teacher?: Teacher;
  onSubmit: (data: CreateTeacherRequest | UpdateTeacherRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

interface FormData {
  email: string;
  first_name: string;
  last_name: string;
  role: 'teacher_school' | 'teacher_individual';
  school_id: string;
  credits_balance: number;
  is_active: boolean;
  status: 'active' | 'suspended' | 'pending_verification' | 'inactive';
}

const TeacherForm: React.FC<TeacherFormProps> = ({
  teacher,
  onSubmit,
  onCancel,
  loading = false,
  error = null,
}) => {
  const [formData, setFormData] = useState<FormData>({
    email: teacher?.email || '',
    first_name: teacher?.first_name || '',
    last_name: teacher?.last_name || '',
    role: teacher?.role || 'teacher_individual',
    school_id: teacher?.school_id || '',
    credits_balance: teacher?.credits_balance || 1000,
    is_active: teacher?.is_active ?? true,
    status: teacher?.status || 'active',
  });

  const [schools, setSchools] = useState<School[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const isEditing = !!teacher;

  // Fetch schools for dropdown
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setSchoolsLoading(true);
        const response = await api.get<{ data: School[]; total: number }>('/schools?limit=1000');
        setSchools(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (err: any) {
        console.error('Failed to fetch schools:', err);
        // Show user-friendly error message
        if (err.response?.status === 403) {
          console.error('Access denied - user may not have permission to view schools');
        } else if (err.response?.status === 401) {
          console.error('Authentication required');
        } else {
          console.error('Network or server error:', err);
        }
      } finally {
        setSchoolsLoading(false);
      }
    };

    fetchSchools();
  }, []);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.email.trim()) {
      errors.email = 'Email je povinný';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Neplatný formát emailu';
    }

    if (!formData.first_name.trim()) {
      errors.first_name = 'Jméno je povinné';
    } else if (formData.first_name.trim().length < 2) {
      errors.first_name = 'Jméno musí mít alespoň 2 znaky';
    }

    if (!formData.last_name.trim()) {
      errors.last_name = 'Příjmení je povinné';
    } else if (formData.last_name.trim().length < 2) {
      errors.last_name = 'Příjmení musí mít alespoň 2 znaky';
    }

    if (formData.role === 'teacher_school' && !formData.school_id) {
      errors.school_id = 'Pro školního učitele je povinné vybrat školu';
    }

    if (formData.credits_balance < 0) {
      errors.credits_balance = 'Počet kreditů nemůže být záporný';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Additional check for school teachers without available schools
    if (formData.role === 'teacher_school' && schools.length === 0) {
      setValidationErrors({
        school_id: 'Nelze vytvořit školního učitele, protože nejsou k dispozici žádné školy. Nejprve vytvořte školu pomocí odkazu níže nebo vyberte "Individuální učitel".'
      });
      return;
    }

    try {
      const submitData = { ...formData };
      
      // Remove school_id for individual teachers
      if (submitData.role === 'teacher_individual') {
        delete (submitData as any).school_id;
      }

      await onSubmit(submitData);
    } catch (err) {
      // Error handling is done in parent component
    }
  };

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleRoleChange = (newRole: 'teacher_school' | 'teacher_individual') => {
    setFormData(prev => ({
      ...prev,
      role: newRole,
      // Clear school_id when switching to individual teacher
      school_id: newRole === 'teacher_individual' ? '' : prev.school_id
    }));
    
    // Clear validation errors when changing role
    if (validationErrors.school_id) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.school_id;
        return newErrors;
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {isEditing ? 'Upravit učitele' : 'Přidat nového učitele'}
        </h3>
        <p className="text-sm text-gray-600">
          {isEditing 
            ? 'Upravte informace o učiteli' 
            : 'Vyplňte informace o novém učiteli'
          }
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center space-x-2 text-red-800">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              Jméno *
            </label>
            <Input
              type="text"
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              placeholder="Jan"
              error={validationErrors.first_name}
              disabled={loading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 inline mr-1" />
              Příjmení *
            </label>
            <Input
              type="text"
              value={formData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              placeholder="Novák"
              error={validationErrors.last_name}
              disabled={loading}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            <Mail className="w-4 h-4 inline mr-1" />
            E-mail *
          </label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="jan.novak@skola.cz"
            error={validationErrors.email}
            disabled={loading}
          />
        </div>

        {/* Role Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Shield className="w-4 h-4 inline mr-1" />
            Typ učitele *
          </label>
          <p className="text-sm text-gray-600 mb-3">
            Vyberte typ učitele podle toho, zda bude pracovat samostatně nebo v rámci školy.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="role"
                value="teacher_individual"
                checked={formData.role === 'teacher_individual'}
                onChange={() => handleRoleChange('teacher_individual')}
                className="mr-3"
                disabled={loading}
              />
              <div>
                <div className="font-medium text-gray-900">Individuální učitel</div>
                <div className="text-sm text-gray-500">Nezávislý učitel bez školy</div>
                <div className="text-xs text-gray-400 mt-1">
                  Může používat všechny funkce platformy samostatně
                </div>
              </div>
            </label>

            <label className="flex items-center p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
              <input
                type="radio"
                name="role"
                value="teacher_school"
                checked={formData.role === 'teacher_school'}
                onChange={() => handleRoleChange('teacher_school')}
                className="mr-3"
                disabled={loading}
              />
              <div>
                <div className="font-medium text-gray-900">Školní učitel</div>
                <div className="text-sm text-gray-500">Učitel přiřazený ke škole</div>
                <div className="text-xs text-gray-400 mt-1">
                  Může sdílet materiály s ostatními učiteli ve škole
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* School Selection (only for school teachers) */}
        {formData.role === 'teacher_school' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Building2 className="w-4 h-4 inline mr-1" />
              Škola *
            </label>
            <p className="text-sm text-gray-600 mb-2">
              Vyberte školu, ke které bude učitel přiřazen. Učitel bude mít přístup k materiálům a funkcím školy.
            </p>
            <select
              value={formData.school_id}
              onChange={(e) => handleInputChange('school_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading || schoolsLoading}
            >
              <option value="">
                {schoolsLoading ? 'Načítání škol...' : 'Vyberte školu'}
              </option>
              {schools && schools.length > 0 && schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name} {school.city && `(${school.city})`}
                </option>
              ))}
            </select>
            {schoolsLoading && (
              <p className="mt-1 text-sm text-gray-500 flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                Načítání seznamu škol...
              </p>
            )}
            {!schoolsLoading && schools.length > 0 && !formData.school_id && (
              <p className="mt-1 text-sm text-blue-600">
                Vyberte školu ze seznamu výše pro přiřazení učitele ke škole.
              </p>
            )}
            {!schoolsLoading && schools.length === 0 && (
              <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-800">
                  <strong>Žádné školy nebyly nalezeny.</strong> Pro vytvoření školního učitele je potřeba nejprve vytvořit školu.
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  Alternativně můžete vybrat &ldquo;Individuální učitel&rdquo; pro učitele bez školy.
                </p>
                <div className="mt-2">
                  <a 
                    href="/auth/register-school" 
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Vytvořit novou školu →
                  </a>
                </div>
              </div>
            )}
            {validationErrors.school_id && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.school_id}</p>
            )}
          </div>
        )}

        {/* Credits and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <CreditCard className="w-4 h-4 inline mr-1" />
              Počáteční kredity
            </label>
            <Input
              type="number"
              value={formData.credits_balance}
              onChange={(e) => handleInputChange('credits_balance', parseInt(e.target.value) || 0)}
              min="0"
              placeholder="1000"
              error={validationErrors.credits_balance}
              disabled={loading}
            />
          </div>

          {isEditing && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Stav účtu
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="active">Aktivní</option>
                <option value="inactive">Neaktivní</option>
                <option value="pending_verification">Čekající na schválení</option>
                <option value="suspended">Pozastavený</option>
              </select>
            </div>
          )}
        </div>

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => handleInputChange('is_active', e.target.checked)}
            className="mr-2"
            disabled={loading}
          />
          <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
            Účet je aktivní
          </label>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Zrušit
          </Button>
          <Button
            type="submit"
            disabled={loading}
            isLoading={loading}
          >
            {isEditing ? 'Uložit změny' : 'Přidat učitele'}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default TeacherForm;
