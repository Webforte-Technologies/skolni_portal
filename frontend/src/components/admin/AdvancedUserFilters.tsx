import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

export interface AdvancedUserFilters {
  search: string;
  role: string;
  school_id: string;
  is_active: string;
  date_from: string;
  date_to: string;
  credit_min: string;
  credit_max: string;
  last_login_from: string;
  last_login_to: string;
  status: string;
}

interface AdvancedUserFiltersProps {
  filters: AdvancedUserFilters;
  onFiltersChange: (filters: AdvancedUserFilters) => void;
  schools: Array<{ id: string; name: string }>;
  loading?: boolean;
}

const AdvancedUserFilters: React.FC<AdvancedUserFiltersProps> = ({
  filters,
  onFiltersChange,
  schools = [],
  loading = false
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    // Count active filters
    const count = Object.values(filters).filter(value => 
      value !== '' && value !== 'all'
    ).length;
    setActiveFiltersCount(count);
  }, [filters]);

  const handleFilterChange = (key: keyof AdvancedUserFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const clearAllFilters = () => {
    const clearedFilters: AdvancedUserFilters = {
      search: '',
      role: 'all',
      school_id: 'all',
      is_active: 'all',
      date_from: '',
      date_to: '',
      credit_min: '',
      credit_max: '',
      last_login_from: '',
      last_login_to: '',
      status: 'all'
    };
    onFiltersChange(clearedFilters);
  };

  const getActiveFiltersDisplay = () => {
    const activeFilters: string[] = [];
    
    if (filters.role !== 'all') {
      const roleLabels: Record<string, string> = {
        'platform_admin': 'Platform Admin',
        'school_admin': 'School Admin',
        'teacher_school': 'School Teacher',
        'teacher_individual': 'Individual Teacher'
      };
      activeFilters.push(roleLabels[filters.role] || filters.role);
    }
    
    if (filters.school_id !== 'all') {
      const school = schools.find(s => s.id === filters.school_id);
      if (school) activeFilters.push(school.name);
    }
    
    if (filters.is_active !== 'all') {
      activeFilters.push(filters.is_active === 'true' ? 'Aktivní' : 'Neaktivní');
    }
    
    if (filters.status !== 'all') {
      const statusLabels: Record<string, string> = {
        'active': 'Aktivní',
        'suspended': 'Pozastaveno',
        'pending': 'Čekající'
      };
      activeFilters.push(statusLabels[filters.status] || filters.status);
    }
    
    if (filters.credit_min || filters.credit_max) {
      const creditRange = [];
      if (filters.credit_min) creditRange.push(`Min: ${filters.credit_min}`);
      if (filters.credit_max) creditRange.push(`Max: ${filters.credit_max}`);
      activeFilters.push(`Kredity: ${creditRange.join(' - ')}`);
    }
    
    if (filters.date_from || filters.date_to) {
      const dateRange = [];
      if (filters.date_from) dateRange.push(`Od: ${new Date(filters.date_from).toLocaleDateString('cs-CZ')}`);
      if (filters.date_to) dateRange.push(`Do: ${new Date(filters.date_to).toLocaleDateString('cs-CZ')}`);
      activeFilters.push(`Datum: ${dateRange.join(' - ')}`);
    }
    
    return activeFilters;
  };

  return (
    <Card className="mb-6">
      <div className="space-y-4">
        {/* Header with toggle and active filters count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <h3 className="text-lg font-semibold text-gray-900">Filtry uživatelů</h3>
            {activeFiltersCount > 0 && (
              <Badge variant="primary" className="text-sm">
                {activeFiltersCount} aktivní
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <Button
                variant="secondary"
                size="sm"
                onClick={clearAllFilters}
                disabled={loading}
              >
                Vymazat vše
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              disabled={loading}
            >
              {isExpanded ? 'Skrýt' : 'Rozšířené'}
            </Button>
          </div>
        </div>

        {/* Active filters display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2">
            {getActiveFiltersDisplay().map((filter, index) => (
              <Badge key={index} variant="outline" className="text-sm">
                {filter}
              </Badge>
            ))}
          </div>
        )}

        {/* Basic filters (always visible) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <InputField
            label="Vyhledávání"
            name="search"
            type="text"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Jméno, email, škola..."
            disabled={loading}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              value={filters.role}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Všechny role</option>
              <option value="platform_admin">Platform Admin</option>
              <option value="school_admin">School Admin</option>
              <option value="teacher_school">School Teacher</option>
              <option value="teacher_individual">Individual Teacher</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Škola
            </label>
            <select
              value={filters.school_id}
              onChange={(e) => handleFilterChange('school_id', e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Všechny školy</option>
              {schools && schools.length > 0 && schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Všechny stavy</option>
              <option value="active">Aktivní</option>
              <option value="suspended">Pozastaveno</option>
              <option value="pending">Čekající</option>
            </select>
          </div>
        </div>

        {/* Advanced filters (expandable) */}
        {isExpanded && (
          <div className="border-t pt-4 space-y-4">
            <h4 className="text-md font-medium text-gray-900">Rozšířené filtry</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Date range filters */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Datum registrace
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <InputField
                    label="Od"
                    name="date_from"
                    type="date"
                    value={filters.date_from}
                    onChange={(e) => handleFilterChange('date_from', e.target.value)}
                    placeholder="Od"
                    disabled={loading}
                    className="text-sm"
                  />
                  <InputField
                    label="Do"
                    name="date_to"
                    type="date"
                    value={filters.date_to}
                    onChange={(e) => handleFilterChange('date_to', e.target.value)}
                    placeholder="Do"
                    disabled={loading}
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Credit balance range */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Rozsah kreditů
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <InputField
                    label="Min"
                    name="credit_min"
                    type="number"
                    value={filters.credit_min}
                    onChange={(e) => handleFilterChange('credit_min', e.target.value)}
                    placeholder="Min"
                    disabled={loading}
                    className="text-sm"
                  />
                  <InputField
                    label="Max"
                    name="credit_max"
                    type="number"
                    value={filters.credit_max}
                    onChange={(e) => handleFilterChange('credit_max', e.target.value)}
                    placeholder="Max"
                    disabled={loading}
                    className="text-sm"
                  />
                </div>
              </div>

              {/* Last login range */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Poslední přihlášení
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <InputField
                    label="Od"
                    name="last_login_from"
                    type="date"
                    value={filters.last_login_from}
                    onChange={(e) => handleFilterChange('last_login_from', e.target.value)}
                    placeholder="Od"
                    disabled={loading}
                    className="text-sm"
                  />
                  <InputField
                    label="Do"
                    name="last_login_to"
                    type="date"
                    value={filters.last_login_to}
                    onChange={(e) => handleFilterChange('last_login_to', e.target.value)}
                    placeholder="Do"
                    disabled={loading}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Active status filter */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aktivní status
                </label>
                <select
                  value={filters.is_active}
                  onChange={(e) => handleFilterChange('is_active', e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="all">Všechny</option>
                  <option value="true">Aktivní</option>
                  <option value="false">Neaktivní</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default AdvancedUserFilters;
