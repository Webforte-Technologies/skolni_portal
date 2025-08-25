import React, { useState, useEffect, useCallback } from 'react';
import { Filter, X, Save, RotateCcw, Calendar, Users, CreditCard, Activity } from 'lucide-react';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

export interface EnhancedUserFilters {
  search: string;
  role: string;
  school_id: string;
  is_active: string;
  status: string;
  email_verified: string;
  
  // Activity filters
  last_login: string; // 7d, 30d, 90d, never, custom
  last_login_from: string;
  last_login_to: string;
  
  // Credit range filters
  credit_range: string; // low, medium, high, custom
  credit_min: string;
  credit_max: string;
  
  // Registration date filters
  registration_date: string; // this_week, this_month, last_3_months, custom
  date_from: string;
  date_to: string;
  
  // School-based filters
  school_type: string; // specific_schools, individual_only, school_only
}

interface SavedFilter {
  id: string;
  name: string;
  filters: EnhancedUserFilters;
  created_at: string;
}

interface EnhancedUserFiltersProps {
  filters: EnhancedUserFilters;
  onFiltersChange: (filters: EnhancedUserFilters) => void;
  schools: Array<{ id: string; name: string; city?: string }>;
  loading?: boolean;
  onSaveFilter?: (name: string, filters: EnhancedUserFilters) => void;
  savedFilters?: SavedFilter[];
  onLoadFilter?: (filters: EnhancedUserFilters) => void;
  onDeleteFilter?: (filterId: string) => void;
}

const EnhancedUserFilters: React.FC<EnhancedUserFiltersProps> = ({
  filters,
  onFiltersChange,
  schools = [],
  loading = false,
  onSaveFilter,
  savedFilters = [],
  onLoadFilter,
  onDeleteFilter
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState('');

  // Count active filters
  useEffect(() => {
    const count = Object.entries(filters).filter(([key, value]) => {
      if (key === 'search') return value.trim() !== '';
      return value !== '' && value !== 'all' && value !== 'custom';
    }).length;
    setActiveFiltersCount(count);
  }, [filters]);

  const handleFilterChange = useCallback((key: keyof EnhancedUserFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    
    // Handle dependent filters
    if (key === 'credit_range') {
      if (value !== 'custom') {
        newFilters.credit_min = '';
        newFilters.credit_max = '';
      }
    }
    
    if (key === 'last_login') {
      if (value !== 'custom') {
        newFilters.last_login_from = '';
        newFilters.last_login_to = '';
      }
    }
    
    if (key === 'registration_date') {
      if (value !== 'custom') {
        newFilters.date_from = '';
        newFilters.date_to = '';
      }
    }
    
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  const clearAllFilters = () => {
    const clearedFilters: EnhancedUserFilters = {
      search: '',
      role: 'all',
      school_id: 'all',
      is_active: 'all',
      status: 'all',
      email_verified: 'all',
      last_login: 'all',
      last_login_from: '',
      last_login_to: '',
      credit_range: 'all',
      credit_min: '',
      credit_max: '',
      registration_date: 'all',
      date_from: '',
      date_to: '',
      school_type: 'all'
    };
    onFiltersChange(clearedFilters);
  };

  const handleSaveFilter = () => {
    if (filterName.trim() && onSaveFilter) {
      onSaveFilter(filterName.trim(), filters);
      setFilterName('');
      setShowSaveDialog(false);
    }
  };

  const getActiveFiltersDisplay = () => {
    const activeFilters: string[] = [];
    
    if (filters.role !== 'all') {
      const roleLabels: Record<string, string> = {
        'platform_admin': 'Platform Admin',
        'school_admin': 'Správce školy',
        'teacher_school': 'Učitel školy',
        'teacher_individual': 'Individuální učitel'
      };
      activeFilters.push(roleLabels[filters.role] || filters.role);
    }
    
    if (filters.school_id !== 'all') {
      const school = schools.find(s => s.id === filters.school_id);
      if (school) activeFilters.push(`Škola: ${school.name}`);
    }
    
    if (filters.status !== 'all') {
      const statusLabels: Record<string, string> = {
        'active': 'Aktivní',
        'inactive': 'Neaktivní',
        'suspended': 'Pozastaveno',
        'pending': 'Čekající ověření'
      };
      activeFilters.push(statusLabels[filters.status] || filters.status);
    }
    
    if (filters.last_login !== 'all') {
      const loginLabels: Record<string, string> = {
        '7d': 'Přihlášení za 7 dní',
        '30d': 'Přihlášení za 30 dní',
        '90d': 'Přihlášení za 90 dní',
        'never': 'Nikdy nepřihlášeni'
      };
      activeFilters.push(loginLabels[filters.last_login] || 'Vlastní období');
    }
    
    if (filters.credit_range !== 'all') {
      const creditLabels: Record<string, string> = {
        'low': 'Nízké kredity (<10)',
        'medium': 'Střední kredity (10-100)',
        'high': 'Vysoké kredity (>100)'
      };
      activeFilters.push(creditLabels[filters.credit_range] || 'Vlastní rozsah');
    }
    
    if (filters.registration_date !== 'all') {
      const dateLabels: Record<string, string> = {
        'this_week': 'Tento týden',
        'this_month': 'Tento měsíc',
        'last_3_months': 'Posledních 3 měsíce'
      };
      activeFilters.push(`Registrace: ${dateLabels[filters.registration_date] || 'Vlastní období'}`);
    }
    
    if (filters.school_type !== 'all') {
      const schoolTypeLabels: Record<string, string> = {
        'individual_only': 'Pouze individuální učitelé',
        'school_only': 'Pouze učitelé škol'
      };
      activeFilters.push(schoolTypeLabels[filters.school_type] || filters.school_type);
    }
    
    return activeFilters;
  };

  return (
    <Card className="mb-6">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Filter className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Rozšířené filtry</h3>
            {activeFiltersCount > 0 && (
              <Badge variant="primary" className="text-sm">
                {activeFiltersCount} aktivní
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {activeFiltersCount > 0 && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveDialog(true)}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Uložit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="w-4 h-4" />
                  Resetovat
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              disabled={loading}
            >
              {isExpanded ? 'Skrýt filtry' : 'Zobrazit filtry'}
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

        {/* Saved filters */}
        {savedFilters.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Uložené filtry:</h4>
            <div className="flex flex-wrap gap-2">
              {savedFilters.map((savedFilter) => (
                <div key={savedFilter.id} className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onLoadFilter?.(savedFilter.filters)}
                    disabled={loading}
                    className="text-xs"
                  >
                    {savedFilter.name}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteFilter?.(savedFilter.id)}
                    disabled={loading}
                    className="p-1 h-auto text-red-500 hover:text-red-700"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter sections */}
        {isExpanded && (
          <div className="border-t pt-4 space-y-6">
            {/* Basic filters */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Základní filtry
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <InputField
                  label="Vyhledávání"
                  name="search"
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Jméno, email..."
                  disabled={loading}
                />
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={filters.role}
                    onChange={(e) => handleFilterChange('role', e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Všechny role</option>
                    <option value="platform_admin">Platform Admin</option>
                    <option value="school_admin">Správce školy</option>
                    <option value="teacher_school">Učitel školy</option>
                    <option value="teacher_individual">Individuální učitel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Všechny stavy</option>
                    <option value="active">Aktivní</option>
                    <option value="inactive">Neaktivní</option>
                    <option value="suspended">Pozastaveno</option>
                    <option value="pending">Čekající ověření</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email ověřen</label>
                  <select
                    value={filters.email_verified}
                    onChange={(e) => handleFilterChange('email_verified', e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Všechny</option>
                    <option value="true">Ověřené</option>
                    <option value="false">Neověřené</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Activity filters */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Aktivita uživatelů
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Poslední přihlášení</label>
                  <select
                    value={filters.last_login}
                    onChange={(e) => handleFilterChange('last_login', e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Všechny</option>
                    <option value="7d">Posledních 7 dní</option>
                    <option value="30d">Posledních 30 dní</option>
                    <option value="90d">Posledních 90 dní</option>
                    <option value="never">Nikdy nepřihlášeni</option>
                    <option value="custom">Vlastní období</option>
                  </select>
                </div>

                {filters.last_login === 'custom' && (
                  <>
                    <InputField
                      label="Přihlášení od"
                      name="last_login_from"
                      type="date"
                      value={filters.last_login_from}
                      onChange={(e) => handleFilterChange('last_login_from', e.target.value)}
                      disabled={loading}
                    />
                    <InputField
                      label="Přihlášení do"
                      name="last_login_to"
                      type="date"
                      value={filters.last_login_to}
                      onChange={(e) => handleFilterChange('last_login_to', e.target.value)}
                      disabled={loading}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Credit filters */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Kredity
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rozsah kreditů</label>
                  <select
                    value={filters.credit_range}
                    onChange={(e) => handleFilterChange('credit_range', e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Všechny</option>
                    <option value="low">Nízké kredity (&lt;10)</option>
                    <option value="medium">Střední kredity (10-100)</option>
                    <option value="high">Vysoké kredity (&gt;100)</option>
                    <option value="custom">Vlastní rozsah</option>
                  </select>
                </div>

                {filters.credit_range === 'custom' && (
                  <>
                    <InputField
                      label="Min kredity"
                      name="credit_min"
                      type="number"
                      min="0"
                      value={filters.credit_min}
                      onChange={(e) => handleFilterChange('credit_min', e.target.value)}
                      placeholder="0"
                      disabled={loading}
                    />
                    <InputField
                      label="Max kredity"
                      name="credit_max"
                      type="number"
                      min="0"
                      value={filters.credit_max}
                      onChange={(e) => handleFilterChange('credit_max', e.target.value)}
                      placeholder="1000"
                      disabled={loading}
                    />
                  </>
                )}
              </div>
            </div>

            {/* School filters */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Školy
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Typ uživatele</label>
                  <select
                    value={filters.school_type}
                    onChange={(e) => handleFilterChange('school_type', e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Všechny typy</option>
                    <option value="individual_only">Pouze individuální učitelé</option>
                    <option value="school_only">Pouze učitelé škol</option>
                  </select>
                </div>

                {filters.school_type !== 'individual_only' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Konkrétní škola</label>
                    <select
                      value={filters.school_id}
                      onChange={(e) => handleFilterChange('school_id', e.target.value)}
                      disabled={loading}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Všechny školy</option>
                      {schools.map((school) => (
                        <option key={school.id} value={school.id}>
                          {school.name} {school.city ? `(${school.city})` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>

            {/* Registration date filters */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Datum registrace
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Období registrace</label>
                  <select
                    value={filters.registration_date}
                    onChange={(e) => handleFilterChange('registration_date', e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Všechna období</option>
                    <option value="this_week">Tento týden</option>
                    <option value="this_month">Tento měsíc</option>
                    <option value="last_3_months">Posledních 3 měsíce</option>
                    <option value="custom">Vlastní období</option>
                  </select>
                </div>

                {filters.registration_date === 'custom' && (
                  <>
                    <InputField
                      label="Registrace od"
                      name="date_from"
                      type="date"
                      value={filters.date_from}
                      onChange={(e) => handleFilterChange('date_from', e.target.value)}
                      disabled={loading}
                    />
                    <InputField
                      label="Registrace do"
                      name="date_to"
                      type="date"
                      value={filters.date_to}
                      onChange={(e) => handleFilterChange('date_to', e.target.value)}
                      disabled={loading}
                    />
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Save filter dialog */}
        {showSaveDialog && (
          <div className="border-t pt-4">
            <div className="flex items-center gap-3">
              <InputField
                label="Název filtru"
                name="filterName"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Zadejte název filtru..."
                className="flex-1"
              />
              <div className="flex gap-2 mt-6">
                <Button
                  size="sm"
                  onClick={handleSaveFilter}
                  disabled={!filterName.trim() || loading}
                >
                  Uložit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setShowSaveDialog(false);
                    setFilterName('');
                  }}
                >
                  Zrušit
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default EnhancedUserFilters;
