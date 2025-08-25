import React, { useState, useEffect } from 'react';
import { School } from '../../types';
import Button from '../ui/Button';
import InputField from '../ui/InputField';

interface SchoolFormProps {
  school?: School;
  onSubmit: (schoolData: any) => void;
  onCancel: () => void;
  loading?: boolean;
}

interface SchoolFormData {
  name: string;
  address?: string;
  city?: string;
  postal_code?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  logo_url?: string;
  is_active: boolean;
}

const SchoolForm: React.FC<SchoolFormProps> = ({
  school,
  onSubmit,
  onCancel,
  loading = false
}) => {
  const [formData, setFormData] = useState<SchoolFormData>({
    name: '',
    address: '',
    city: '',
    postal_code: '',
    contact_email: '',
    contact_phone: '',
    logo_url: '',
    is_active: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (school) {
      setFormData({
        name: school.name,
        address: school.address || '',
        city: school.city || '',
        postal_code: school.postal_code || '',
        contact_email: school.contact_email || school.email || '',
        contact_phone: school.contact_phone || school.phone || '',
        website: school.website || '',
        logo_url: school.logo_url || '',
        is_active: school.is_active !== undefined ? school.is_active : true
      });
    }
  }, [school]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Název školy je povinný';
    }

    if (formData.contact_email && !/\S+@\S+\.\S+/.test(formData.contact_email)) {
      newErrors.contact_email = 'Neplatný formát emailu';
    }

    if (formData.postal_code && !/^\d{3}\s?\d{2}$/.test(formData.postal_code.replace(/\s/g, ''))) {
      newErrors.postal_code = 'Neplatný formát PSČ (např. 120 00)';
    }

    if (formData.contact_phone && !/^(\+420\s?)?\d{3}\s?\d{3}\s?\d{3}$/.test(formData.contact_phone.replace(/\s/g, ''))) {
      newErrors.contact_phone = 'Neplatný formát telefonu (např. +420 123 456 789)';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'URL musí začínat s http:// nebo https://';
    }

    if (formData.logo_url && !/^https?:\/\/.+/.test(formData.logo_url)) {
      newErrors.logo_url = 'URL musí začínat s http:// nebo https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare data for submission - remove empty strings
    const submitData = Object.fromEntries(
      Object.entries(formData).map(([key, value]) => [
        key, 
        typeof value === 'string' && value.trim() === '' ? undefined : value
      ])
    );

    onSubmit(submitData);
  };

  const handleInputChange = (field: keyof SchoolFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* School Name */}
        <div className="md:col-span-2">
          <InputField
            label="Název školy"
            name="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            error={errors.name}
            required
            disabled={loading}
            placeholder="Základní škola EduAI"
          />
        </div>

        {/* Address */}
        <div className="md:col-span-2">
          <InputField
            label="Adresa"
            name="address"
            value={formData.address}
            onChange={(e) => handleInputChange('address', e.target.value)}
            error={errors.address}
            disabled={loading}
            placeholder="Václavská 123"
          />
        </div>

        {/* City */}
        <InputField
          label="Město"
          name="city"
          value={formData.city}
          onChange={(e) => handleInputChange('city', e.target.value)}
          error={errors.city}
          disabled={loading}
          placeholder="Praha"
        />

        {/* Postal Code */}
        <InputField
          label="PSČ"
          name="postal_code"
          value={formData.postal_code}
          onChange={(e) => handleInputChange('postal_code', e.target.value)}
          error={errors.postal_code}
          disabled={loading}
          placeholder="120 00"
        />

        {/* Contact Email */}
        <InputField
          label="Kontaktní email"
          name="contact_email"
          type="email"
          value={formData.contact_email}
          onChange={(e) => handleInputChange('contact_email', e.target.value)}
          error={errors.contact_email}
          disabled={loading}
          placeholder="info@skola.cz"
        />

        {/* Contact Phone */}
        <InputField
          label="Kontaktní telefon"
          name="contact_phone"
          value={formData.contact_phone}
          onChange={(e) => handleInputChange('contact_phone', e.target.value)}
          error={errors.contact_phone}
          disabled={loading}
          placeholder="+420 123 456 789"
        />

        {/* Website */}
        <InputField
          label="Webové stránky"
          name="website"
          type="url"
          value={formData.website}
          onChange={(e) => handleInputChange('website', e.target.value)}
          error={errors.website}
          disabled={loading}
          placeholder="https://www.skola.cz"
        />

        {/* Logo URL */}
        <div className="md:col-span-2">
          <InputField
            label="URL loga školy"
            name="logo_url"
            value={formData.logo_url}
            onChange={(e) => handleInputChange('logo_url', e.target.value)}
            error={errors.logo_url}
            disabled={loading}
            placeholder="https://example.com/logo.png"
          />
        </div>

        {/* Active Status */}
        <div className="md:col-span-2">
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
              Aktivní škola
            </label>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Neaktivní školy se nezobrazují v seznamu a nemohou registrovat nové uživatele
          </p>
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
          {school ? 'Aktualizovat školu' : 'Vytvořit školu'}
        </Button>
      </div>
    </form>
  );
};

export default SchoolForm;
