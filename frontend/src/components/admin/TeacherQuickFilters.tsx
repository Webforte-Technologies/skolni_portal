import React from 'react';
import { Users, CheckCircle, Clock, AlertTriangle, Building2, UserCheck, CreditCard, Calendar } from 'lucide-react';
import { Button, Badge } from '../ui';
import { TeacherFilters } from '../../services/teacherService';

interface QuickFilter {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  filters: TeacherFilters;
  color: string;
  count?: number;
}

interface TeacherQuickFiltersProps {
  onFilterSelect: (filters: TeacherFilters) => void;
  currentFilters: TeacherFilters;
  teacherStats?: {
    total: number;
    active: number;
    pending: number;
    suspended: number;
    unverified: number;
    individual: number;
    school: number;
    recent: number;
    lowCredits: number;
  };
}

const TeacherQuickFilters: React.FC<TeacherQuickFiltersProps> = ({
  onFilterSelect,
  currentFilters,
  teacherStats
}) => {
  const quickFilters: QuickFilter[] = [
    {
      id: 'all',
      name: 'Všichni učitelé',
      description: 'Zobrazit všechny učitele',
      icon: Users,
      filters: { limit: 50, offset: 0 },
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      count: teacherStats?.total
    },
    {
      id: 'active',
      name: 'Aktivní',
      description: 'Aktivní učitelé',
      icon: CheckCircle,
      filters: { status: 'active', limit: 50, offset: 0 },
      color: 'bg-green-100 text-green-800 border-green-200',
      count: teacherStats?.active
    },
    {
      id: 'pending',
      name: 'Čekající na schválení',
      description: 'Učitelé čekající na schválení',
      icon: Clock,
      filters: { status: 'pending_verification', limit: 50, offset: 0 },
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      count: teacherStats?.pending
    },
    {
      id: 'suspended',
      name: 'Pozastavení',
      description: 'Pozastavení učitelé',
      icon: AlertTriangle,
      filters: { status: 'suspended', limit: 50, offset: 0 },
      color: 'bg-red-100 text-red-800 border-red-200',
      count: teacherStats?.suspended
    },
    {
      id: 'unverified',
      name: 'Neověření',
      description: 'Učitelé s neověřeným e-mailem',
      icon: UserCheck,
      filters: { verification_status: 'unverified', limit: 50, offset: 0 },
      color: 'bg-orange-100 text-orange-800 border-orange-200',
      count: teacherStats?.unverified
    },
    {
      id: 'individual',
      name: 'Individuální',
      description: 'Individuální učitelé (bez školy)',
      icon: Users,
      filters: { role: 'teacher_individual', limit: 50, offset: 0 },
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      count: teacherStats?.individual
    },
    {
      id: 'school',
      name: 'Školní',
      description: 'Učitelé přiřazení ke školám',
      icon: Building2,
      filters: { role: 'teacher_school', limit: 50, offset: 0 },
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      count: teacherStats?.school
    },
    {
      id: 'recent',
      name: 'Nově registrovaní',
      description: 'Učitelé registrovaní za posledních 30 dní',
      icon: Calendar,
      filters: {
        date_range_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        date_range_end: new Date().toISOString().split('T')[0],
        limit: 50,
        offset: 0
      },
      color: 'bg-teal-100 text-teal-800 border-teal-200',
      count: teacherStats?.recent
    },
    {
      id: 'low_credits',
      name: 'Málo kreditů',
      description: 'Učitelé s méně než 100 kredity',
      icon: CreditCard,
      filters: {
        credit_range_min: 0,
        credit_range_max: 100,
        limit: 50,
        offset: 0
      },
      color: 'bg-pink-100 text-pink-800 border-pink-200',
      count: teacherStats?.lowCredits
    }
  ];

  const isFilterActive = (filter: QuickFilter) => {
    const { limit, offset, ...filterCriteria } = filter.filters;
    const { limit: currentLimit, offset: currentOffset, ...currentCriteria } = currentFilters;

    // Special handling for individual/school filters
    if (filter.id === 'individual') {
      return currentCriteria.role === 'teacher_individual';
    }
    if (filter.id === 'school') {
      return currentCriteria.role === 'teacher_school';
    }

    // Check if all filter criteria match
    return Object.keys(filterCriteria).every(key => {
      const filterValue = filterCriteria[key as keyof typeof filterCriteria];
      const currentValue = currentCriteria[key as keyof typeof currentCriteria];
      return filterValue === currentValue;
    });
  };

  const handleFilterClick = (filter: QuickFilter) => {
    // Always reset to first page when applying filters
    const finalFilters = { 
      ...filter.filters, 
      offset: 0 
    };

    onFilterSelect(finalFilters);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Rychlé filtry</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onFilterSelect({ limit: 50, offset: 0 })}
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Vymazat vše
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {quickFilters.map((filter) => {
          const Icon = filter.icon;
          const isActive = isFilterActive(filter);

          return (
            <Button
              key={filter.id}
              variant={isActive ? "primary" : "ghost"}
              onClick={() => handleFilterClick(filter)}
              className={`h-auto p-3 justify-start ${
                isActive 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'hover:bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="flex items-center space-x-3 w-full">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <div className="flex-1 text-left">
                  <div className={`text-sm font-medium ${isActive ? 'text-white' : 'text-gray-900'}`}>
                    {filter.name}
                  </div>
                  <div className={`text-xs ${isActive ? 'text-blue-100' : 'text-gray-500'}`}>
                    {filter.description}
                  </div>
                </div>
                {filter.count !== undefined && (
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      isActive 
                        ? 'bg-white/20 text-white border-white/30' 
                        : filter.color
                    }`}
                  >
                    {filter.count}
                  </Badge>
                )}
              </div>
            </Button>
          );
        })}
      </div>

      {/* Active Filters Summary */}
      {Object.keys(currentFilters).some(key => 
        key !== 'limit' && key !== 'offset' && currentFilters[key as keyof TeacherFilters]
      ) && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-blue-900">
              Aktivní filtry:
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFilterSelect({ limit: 50, offset: 0 })}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Vymazat
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.entries(currentFilters).map(([key, value]) => {
              if (key === 'limit' || key === 'offset' || !value) return null;
              
              let displayValue = String(value);
              let displayKey = key;

              // Translate filter keys and values to Czech
              switch (key) {
                case 'status':
                  displayKey = 'Stav';
                  switch (value) {
                    case 'active': displayValue = 'Aktivní'; break;
                    case 'inactive': displayValue = 'Neaktivní'; break;
                    case 'pending_verification': displayValue = 'Čekající'; break;
                    case 'suspended': displayValue = 'Pozastavený'; break;
                  }
                  break;
                case 'verification_status':
                  displayKey = 'Ověření';
                  displayValue = value === 'verified' ? 'Ověřený' : 'Neověřený';
                  break;
                case 'role':
                  displayKey = 'Typ';
                  displayValue = value === 'teacher_individual' ? 'Individuální' : 'Školní';
                  break;
                case 'q':
                  displayKey = 'Hledání';
                  break;
                case 'school_id':
                  displayKey = 'Škola';
                  displayValue = 'Vybraná škola';
                  break;
                case 'date_range_start':
                  displayKey = 'Od';
                  displayValue = new Date(value as string).toLocaleDateString('cs-CZ');
                  break;
                case 'date_range_end':
                  displayKey = 'Do';
                  displayValue = new Date(value as string).toLocaleDateString('cs-CZ');
                  break;
                case 'credit_range_min':
                  displayKey = 'Min kredity';
                  break;
                case 'credit_range_max':
                  displayKey = 'Max kredity';
                  break;
              }

              return (
                <Badge
                  key={key}
                  variant="outline"
                  className="bg-blue-100 text-blue-800 border-blue-300"
                >
                  {displayKey}: {displayValue}
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherQuickFilters;
