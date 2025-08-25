import React, { useState, useEffect, useCallback } from 'react';
import { User, School } from '../../types';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';

interface UserFormProps {
  user?: User;
  schools?: School[];
  onSubmit: (userData: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

interface UserFormData {
  email: string;
  first_name: string;
  last_name: string;
  role: 'platform_admin' | 'school_admin' | 'teacher_school' | 'teacher_individual';
  school_id?: string;
  credits_balance: number;
  is_active: boolean;
}

const UserForm: React.FC<UserFormProps> = ({
  user,
  schools = [],
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<UserFormData>({
    email: '',
    first_name: '',
    last_name: '',
    role: 'teacher_individual',
    school_id: '',
    credits_balance: 0,
    is_active: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [availableSchools, setAvailableSchools] = useState<School[]>(schools);

  const { showToast } = useToast();

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        school_id: user.school_id || '',
        credits_balance: user.credits_balance,
        is_active: user.is_active
      });
    }
  }, [user]);

  const fetchSchools = useCallback(async () => {
    try {
      const response = await api.get('/schools?limit=100');
      setAvailableSchools((response.data.data as School[]) || []);
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při načítání škol' });
    }
  }, [showToast]);

  useEffect(() => {
    // Fetch schools if not provided
    if (schools.length === 0) {
      fetchSchools();
    } else {
      setAvailableSchools(schools);
    }
  }, [schools, fetchSchools]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email je povinný';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Neplatný formát emailu';
    }

    if (!formData.first_name) {
      newErrors.first_name = 'Jméno je povinné';
    }

    if (!formData.last_name) {
      newErrors.last_name = 'Příjmení je povinné';
    }

    if (formData.role === 'teacher_school' || formData.role === 'school_admin') {
      if (!formData.school_id) {
        newErrors.school_id = 'Škola je povinná pro tento typ role';
      }
    }

    if (formData.credits_balance < 0) {
      newErrors.credits_balance = 'Počet kreditů nemůže být záporný';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare data for submission
    const submitData = {
      ...formData,
      school_id: formData.school_id || undefined
    };

    onSubmit(submitData);
  };

  const handleInputChange = (field: keyof UserFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Handle role change - clear school_id if switching to individual role
    if (field === 'role') {
      if (value === 'teacher_individual' || value === 'platform_admin') {
        setFormData(prev => ({ ...prev, school_id: '' }));
      }
    }
  };



  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Email */}
        <div className="md:col-span-2">
          <InputField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            error={errors.email}
            required
            disabled={loading}
          />
        </div>

        {/* First Name */}
        <InputField
          label="Jméno"
          name="first_name"
          value={formData.first_name}
          onChange={(e) => handleInputChange('first_name', e.target.value)}
          error={errors.first_name}
          required
          disabled={loading}
        />

        {/* Last Name */}
        <InputField
          label="Příjmení"
          name="last_name"
          value={formData.last_name}
          onChange={(e) => handleInputChange('last_name', e.target.value)}
          error={errors.last_name}
          required
          disabled={loading}
        />

        {/* Role */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Role *
          </label>
          <select
            value={formData.role}
            onChange={(e) => handleInputChange('role', e.target.value)}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.role ? 'border-red-500' : 'border-gray-300'
            }`}
            disabled={loading}
          >
            <option value="teacher_individual">Individuální učitel</option>
            <option value="teacher_school">Učitel školy</option>
            <option value="school_admin">Správce školy</option>
            <option value="platform_admin">Platforma Admin</option>
          </select>
          {errors.role && (
            <p className="mt-1 text-sm text-red-600">{errors.role}</p>
          )}
        </div>

        {/* School (conditional) */}
        {(formData.role === 'teacher_school' || formData.role === 'school_admin') && (
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Škola *
            </label>
            <select
              value={formData.school_id}
              onChange={(e) => handleInputChange('school_id', e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.school_id ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading}
            >
              <option value="">Vyberte školu...</option>
              {availableSchools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name} {school.city ? `(${school.city})` : ''}
                </option>
              ))}
            </select>
            {errors.school_id && (
              <p className="mt-1 text-sm text-red-600">{errors.school_id}</p>
            )}
          </div>
        )}

        {/* Credits Balance */}
        <InputField
          label="Počet kreditů"
          name="credits_balance"
          type="number"
          min="0"
          value={formData.credits_balance.toString()}
          onChange={(e) => handleInputChange('credits_balance', parseInt(e.target.value) || 0)}
          error={errors.credits_balance}
          disabled={loading}
        />

        {/* Active Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active}
            onChange={(e) => handleInputChange('is_active', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={loading}
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
            Aktivní účet
          </label>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
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
          {user ? 'Aktualizovat uživatele' : 'Vytvořit uživatele'}
        </Button>
      </div>
    </form>
  );
};

export default UserForm;
