import React, { useState, useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Card from '../ui/Card';
import Badge from '../ui/Badge';
import { X, Filter, Search, Calendar, Users, CreditCard } from 'lucide-react';

export interface SchoolFilters {
  search: string;
  is_active: string;
  status: string;
  subscription_tier: string;
  city: string;
  country: string;
  verification_required: string;
  date_range_start: string;
  date_range_end: string;
  teacher_count_min: string;
  teacher_count_max: string;
  credit_usage_min: string;
  credit_usage_max: string;
}

export interface AdvancedSchoolFiltersProps {
  onFiltersChange: (filters: SchoolFilters) => void;
  onReset: () => void;
  initialFilters?: Partial<SchoolFilters>;
}

export const AdvancedSchoolFilters: React.FC<AdvancedSchoolFiltersProps> = ({
  onFiltersChange,
  onReset,
  initialFilters = {}
}) => {
  const [filters, setFilters] = useState<SchoolFilters>({
    search: initialFilters.search || '',
    is_active: initialFilters.is_active || '',
    status: initialFilters.status || '',
    subscription_tier: initialFilters.subscription_tier || '',
    city: initialFilters.city || '',
    country: initialFilters.country || '',
    verification_required: initialFilters.verification_required || '',
    date_range_start: initialFilters.date_range_start || '',
    date_range_end: initialFilters.date_range_end || '',
    teacher_count_min: initialFilters.teacher_count_min || '',
    teacher_count_max: initialFilters.teacher_count_max || '',
    credit_usage_min: initialFilters.credit_usage_min || '',
    credit_usage_max: initialFilters.credit_usage_max || ''
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  useEffect(() => {
    const count = Object.values(filters).filter(value => value !== '' && value !== undefined).length;
    setActiveFiltersCount(count);
  }, [filters]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: SchoolFilters = {
      search: '',
      is_active: '',
      status: '',
      subscription_tier: '',
      city: '',
      country: '',
      verification_required: '',
      date_range_start: '',
      date_range_end: '',
      teacher_count_min: '',
      teacher_count_max: '',
      credit_usage_min: '',
      credit_usage_max: ''
    };
    setFilters(resetFilters);
    onReset();
  };

  const clearFilter = (key: string) => {
    const newFilters = { ...filters, [key]: '' };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const getActiveFilters = () => {
    return Object.entries(filters)
      .filter(([, value]) => value !== '' && value !== undefined)
      .map(([key, value]) => ({ key, value }));
  };

  return (
    <Card className="p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Pokročilé filtry</h3>
          {activeFiltersCount > 0 && (
            <Badge variant="default" className="ml-2">
              {activeFiltersCount} aktivní
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Skrýt' : 'Zobrazit'}
          </Button>
          {activeFiltersCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              Resetovat
            </Button>
          )}
        </div>
      </div>

      {/* Basic Filters - Always Visible */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Hledat školy..."
            value={filters.search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('search', e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select
          value={filters.is_active}
          onValueChange={(value: string) => handleFilterChange('is_active', value)}
        >
          <option value="">Všechny školy</option>
          <option value="true">Aktivní</option>
          <option value="false">Neaktivní</option>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value: string) => handleFilterChange('status', value)}
        >
          <option value="">Všechny stavy</option>
          <option value="active">Aktivní</option>
          <option value="suspended">Pozastavené</option>
          <option value="pending_verification">Čekající na ověření</option>
          <option value="inactive">Neaktivní</option>
        </Select>
      </div>

      {/* Advanced Filters - Expandable */}
      {isExpanded && (
        <div className="space-y-4 border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select
              value={filters.subscription_tier}
              onValueChange={(value: string) => handleFilterChange('subscription_tier', value)}
            >
              <option value="">Všechny předplatné</option>
              <option value="basic">Základní</option>
              <option value="premium">Premium</option>
              <option value="enterprise">Enterprise</option>
            </Select>

            <Input
              placeholder="Město"
              value={filters.city}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('city', e.target.value)}
            />

            <Select
              value={filters.country}
              onValueChange={(value: string) => handleFilterChange('country', value)}
            >
              <option value="">Všechny země</option>
              <option value="Czech Republic">Česká republika</option>
              <option value="Slovakia">Slovensko</option>
              <option value="Poland">Polsko</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Rozsah dat vytvoření
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="date"
                  value={filters.date_range_start}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('date_range_start', e.target.value)}
                  placeholder="Od"
                />
                <Input
                  type="date"
                  value={filters.date_range_end}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('date_range_end', e.target.value)}
                  placeholder="Do"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Počet učitelů
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.teacher_count_min}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('teacher_count_min', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.teacher_count_max}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('teacher_count_max', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Použití kreditů
              </label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.credit_usage_min}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('credit_usage_min', e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.credit_usage_max}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange('credit_usage_max', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Ověření vyžadováno
              </label>
              <Select
                value={filters.verification_required}
                onValueChange={(value: string) => handleFilterChange('verification_required', value)}
              >
                <option value="">Všechny</option>
                <option value="true">Ano</option>
                <option value="false">Ne</option>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="border-t pt-4 mt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Aktivní filtry:</h4>
          <div className="flex flex-wrap gap-2">
            {getActiveFilters().map(({ key, value }) => (
              <Badge
                key={key}
                variant="default"
                className="flex items-center gap-1"
              >
                {key === 'search' && 'Hledání'}
                {key === 'is_active' && 'Aktivita'}
                {key === 'status' && 'Stav'}
                {key === 'subscription_tier' && 'Předplatné'}
                {key === 'city' && 'Město'}
                {key === 'country' && 'Země'}
                {key === 'verification_required' && 'Ověření'}
                {key === 'date_range_start' && 'Datum od'}
                {key === 'date_range_end' && 'Datum do'}
                {key === 'teacher_count_min' && 'Učitelé min'}
                {key === 'teacher_count_max' && 'Učitelé max'}
                {key === 'credit_usage_min' && 'Kredity min'}
                {key === 'credit_usage_max' && 'Kredity max'}
                : {value}
                <button
                  onClick={() => clearFilter(key)}
                  className="ml-1 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};
