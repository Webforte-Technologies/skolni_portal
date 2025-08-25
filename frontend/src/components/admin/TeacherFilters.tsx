import React, { useState, useEffect } from 'react';
import { Filter, Search, Calendar, CreditCard, User, X, RotateCcw } from 'lucide-react';
import { Button, Card, Input } from '../ui';
import { TeacherFilters as TeacherFiltersType } from '../../services/teacherService';
import { School } from '../../types';
import { api } from '../../services/apiClient';

interface TeacherFiltersProps {
  filters: TeacherFiltersType;
  onFiltersChange: (filters: TeacherFiltersType) => void;
  loading?: boolean;
}

interface AdvancedFiltersState {
  showAdvanced: boolean;
  dateRangeStart: string;
  dateRangeEnd: string;
  lastActivityStart: string;
  lastActivityEnd: string;
  creditRangeMin: string;
  creditRangeMax: string;
  verificationStatus: string;
}

const TeacherFilters: React.FC<TeacherFiltersProps> = ({
  filters,
  onFiltersChange,
  loading = false
}) => {
  const [schools, setSchools] = useState<School[]>([]);
  const [schoolsLoading, setSchoolsLoading] = useState(false);
  const [advancedState, setAdvancedState] = useState<AdvancedFiltersState>({
    showAdvanced: false,
    dateRangeStart: '',
    dateRangeEnd: '',
    lastActivityStart: '',
    lastActivityEnd: '',
    creditRangeMin: '',
    creditRangeMax: '',
    verificationStatus: 'all'
  });

  // Fetch schools for dropdown
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        setSchoolsLoading(true);
        const response = await api.get<{ data: School[]; total: number }>('/schools?limit=1000');
        setSchools(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (err) {
        console.error('Failed to fetch schools:', err);
      } finally {
        setSchoolsLoading(false);
      }
    };

    fetchSchools();
  }, []);

  // Initialize advanced state from filters
  useEffect(() => {
    setAdvancedState(prev => ({
      ...prev,
      dateRangeStart: filters.date_range_start || '',
      dateRangeEnd: filters.date_range_end || '',
      lastActivityStart: filters.last_activity_start || '',
      lastActivityEnd: filters.last_activity_end || '',
      creditRangeMin: filters.credit_range_min?.toString() || '',
      creditRangeMax: filters.credit_range_max?.toString() || '',
      verificationStatus: filters.verification_status || 'all'
    }));
  }, [filters]);

  const handleBasicFilterChange = (key: keyof TeacherFiltersType, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value === 'all' || value === '' ? undefined : value,
      offset: 0 // Reset to first page when filtering
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onFiltersChange({
      ...filters,
      q: value.trim() || undefined,
      offset: 0
    });
  };

  const handleAdvancedFilterChange = (key: keyof AdvancedFiltersState, value: string) => {
    setAdvancedState(prev => ({ ...prev, [key]: value }));
  };

  const applyAdvancedFilters = () => {
    const newFilters: TeacherFiltersType = { ...filters };

    // Date range filters
    if (advancedState.dateRangeStart && advancedState.dateRangeEnd) {
      newFilters.date_range_start = advancedState.dateRangeStart;
      newFilters.date_range_end = advancedState.dateRangeEnd;
    } else {
      delete newFilters.date_range_start;
      delete newFilters.date_range_end;
    }

    // Last activity filters
    if (advancedState.lastActivityStart && advancedState.lastActivityEnd) {
      newFilters.last_activity_start = advancedState.lastActivityStart;
      newFilters.last_activity_end = advancedState.lastActivityEnd;
    } else {
      delete newFilters.last_activity_start;
      delete newFilters.last_activity_end;
    }

    // Credit range filters
    if (advancedState.creditRangeMin && advancedState.creditRangeMax) {
      newFilters.credit_range_min = parseInt(advancedState.creditRangeMin);
      newFilters.credit_range_max = parseInt(advancedState.creditRangeMax);
    } else {
      delete newFilters.credit_range_min;
      delete newFilters.credit_range_max;
    }

    // Verification status
    if (advancedState.verificationStatus !== 'all') {
      newFilters.verification_status = advancedState.verificationStatus as 'verified' | 'unverified';
    } else {
      delete newFilters.verification_status;
    }

    newFilters.offset = 0; // Reset to first page
    onFiltersChange(newFilters);
  };

  const clearAdvancedFilters = () => {
    setAdvancedState({
      ...advancedState,
      dateRangeStart: '',
      dateRangeEnd: '',
      lastActivityStart: '',
      lastActivityEnd: '',
      creditRangeMin: '',
      creditRangeMax: '',
      verificationStatus: 'all'
    });

    const newFilters: TeacherFiltersType = { ...filters };
    delete newFilters.date_range_start;
    delete newFilters.date_range_end;
    delete newFilters.last_activity_start;
    delete newFilters.last_activity_end;
    delete newFilters.credit_range_min;
    delete newFilters.credit_range_max;
    delete newFilters.verification_status;
    newFilters.offset = 0;

    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    setAdvancedState({
      showAdvanced: false,
      dateRangeStart: '',
      dateRangeEnd: '',
      lastActivityStart: '',
      lastActivityEnd: '',
      creditRangeMin: '',
      creditRangeMax: '',
      verificationStatus: 'all'
    });

    onFiltersChange({
      limit: filters.limit,
      offset: 0
    });
  };

  const hasActiveFilters = () => {
    return !!(
      filters.status ||
      filters.role ||
      filters.school_id ||
      filters.q ||
      filters.date_range_start ||
      filters.last_activity_start ||
      filters.credit_range_min ||
      filters.verification_status
    );
  };

  const hasActiveAdvancedFilters = () => {
    return !!(
      filters.date_range_start ||
      filters.last_activity_start ||
      filters.credit_range_min ||
      filters.verification_status
    );
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {/* Basic Filters Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex flex-wrap items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filtry:</span>
            </div>

            {/* Status Filter */}
            <select
              value={filters.status || 'all'}
              onChange={(e) => handleBasicFilterChange('status', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="all">Všechny stavy</option>
              <option value="active">Aktivní</option>
              <option value="inactive">Neaktivní</option>
              <option value="pending_verification">Čekající na schválení</option>
              <option value="suspended">Pozastavení</option>
            </select>

            {/* Role Filter */}
            <select
              value={filters.role || 'all'}
              onChange={(e) => handleBasicFilterChange('role', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="all">Všichni typy</option>
              <option value="teacher_individual">Individuální učitelé</option>
              <option value="teacher_school">Školní učitelé</option>
            </select>

            {/* School Filter */}
            <select
              value={filters.school_id || 'all'}
              onChange={(e) => handleBasicFilterChange('school_id', e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading || schoolsLoading}
            >
              <option value="all">Všechny školy</option>
              {schools && schools.length > 0 && schools.map((school) => (
                <option key={school.id} value={school.id}>
                  {school.name} {school.city && `(${school.city})`}
                </option>
              ))}
            </select>

            {/* Advanced Filters Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setAdvancedState(prev => ({ ...prev, showAdvanced: !prev.showAdvanced }))}
              className={`${hasActiveAdvancedFilters() ? 'text-blue-600 bg-blue-50' : 'text-gray-600'}`}
            >
              <Filter className="w-4 h-4 mr-1" />
              Pokročilé filtry
              {hasActiveAdvancedFilters() && (
                <span className="ml-1 px-1.5 py-0.5 text-xs bg-blue-600 text-white rounded-full">
                  !
                </span>
              )}
            </Button>

            {/* Clear All Filters */}
            {hasActiveFilters() && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-gray-600 hover:text-gray-800"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Vymazat vše
              </Button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Hledat učitele..."
              value={filters.q || ''}
              onChange={handleSearchChange}
              className="pl-10 w-full lg:w-80"
              disabled={loading}
            />
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {advancedState.showAdvanced && (
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Registration Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Datum registrace
                </label>
                <div className="space-y-2">
                  <Input
                    type="date"
                    placeholder="Od"
                    value={advancedState.dateRangeStart}
                    onChange={(e) => handleAdvancedFilterChange('dateRangeStart', e.target.value)}
                    disabled={loading}
                  />
                  <Input
                    type="date"
                    placeholder="Do"
                    value={advancedState.dateRangeEnd}
                    onChange={(e) => handleAdvancedFilterChange('dateRangeEnd', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Last Activity Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Poslední aktivita
                </label>
                <div className="space-y-2">
                  <Input
                    type="date"
                    placeholder="Od"
                    value={advancedState.lastActivityStart}
                    onChange={(e) => handleAdvancedFilterChange('lastActivityStart', e.target.value)}
                    disabled={loading}
                  />
                  <Input
                    type="date"
                    placeholder="Do"
                    value={advancedState.lastActivityEnd}
                    onChange={(e) => handleAdvancedFilterChange('lastActivityEnd', e.target.value)}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Credit Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <CreditCard className="w-4 h-4 inline mr-1" />
                  Rozsah kreditů
                </label>
                <div className="space-y-2">
                  <Input
                    type="number"
                    placeholder="Min kredity"
                    value={advancedState.creditRangeMin}
                    onChange={(e) => handleAdvancedFilterChange('creditRangeMin', e.target.value)}
                    disabled={loading}
                    min="0"
                  />
                  <Input
                    type="number"
                    placeholder="Max kredity"
                    value={advancedState.creditRangeMax}
                    onChange={(e) => handleAdvancedFilterChange('creditRangeMax', e.target.value)}
                    disabled={loading}
                    min="0"
                  />
                </div>
              </div>

              {/* Verification Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stav ověření
                </label>
                <select
                  value={advancedState.verificationStatus}
                  onChange={(e) => handleAdvancedFilterChange('verificationStatus', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  <option value="all">Všechny</option>
                  <option value="verified">Ověření</option>
                  <option value="unverified">Neověření</option>
                </select>
              </div>
            </div>

            {/* Advanced Filter Actions */}
            <div className="flex justify-end space-x-3 mt-4 pt-4 border-t">
              <Button
                variant="secondary"
                size="sm"
                onClick={clearAdvancedFilters}
                disabled={loading}
              >
                <X className="w-4 h-4 mr-1" />
                Vymazat pokročilé
              </Button>
              <Button
                size="sm"
                onClick={applyAdvancedFilters}
                disabled={loading}
              >
                Použít filtry
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TeacherFilters;
