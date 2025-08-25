import React from 'react';
import { Search, Filter, SortAsc, SortDesc, Grid, List, Target } from 'lucide-react';
import { Button, Badge } from '../ui';
import { Teacher, TeacherFilters } from '../../services/teacherService';

interface TeacherSearchResultsProps {
  teachers: Teacher[];
  total: number;
  loading: boolean;
  currentFilters: TeacherFilters;
  searchQuery?: string;
  onSortChange: (field: string, direction: 'asc' | 'desc') => void;
  onViewModeChange: (mode: 'list' | 'grid') => void;
  viewMode: 'list' | 'grid';
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onShowPerformanceMetrics?: (teacherId: string) => void;
}

interface SortOption {
  field: string;
  label: string;
  defaultDirection: 'asc' | 'desc';
}

const TeacherSearchResults: React.FC<TeacherSearchResultsProps> = ({
  teachers,
  total,
  loading,
  currentFilters,
  searchQuery,
  onSortChange,
  onViewModeChange,
  viewMode,
  sortField,
  sortDirection,
  onShowPerformanceMetrics
}) => {
  const sortOptions: SortOption[] = [
    { field: 'first_name', label: 'Jméno', defaultDirection: 'asc' },
    { field: 'last_name', label: 'Příjmení', defaultDirection: 'asc' },
    { field: 'email', label: 'E-mail', defaultDirection: 'asc' },
    { field: 'created_at', label: 'Datum registrace', defaultDirection: 'desc' },
    { field: 'last_activity_at', label: 'Poslední aktivita', defaultDirection: 'desc' },
    { field: 'credits_balance', label: 'Kredity', defaultDirection: 'desc' },
    { field: 'login_count', label: 'Počet přihlášení', defaultDirection: 'desc' }
  ];

  const handleSortClick = (field: string, defaultDirection: 'asc' | 'desc') => {
    if (sortField === field) {
      // Toggle direction if same field
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      onSortChange(field, newDirection);
    } else {
      // Use default direction for new field
      onSortChange(field, defaultDirection);
    }
  };

  const highlightSearchTerm = (text: string, searchTerm?: string) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  const getStatusColor = (status: Teacher['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending_verification':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleColor = (role: Teacher['role']) => {
    switch (role) {
      case 'teacher_school':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'teacher_individual':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  const formatLastActive = (dateString?: string) => {
    if (!dateString) return 'Nikdy';
    
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `před ${minutes} min`;
    } else if (hours < 24) {
      return `před ${hours} hod`;
    } else {
      return `před ${days} dny`;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-lg text-gray-600">Vyhledávání učitelů...</div>
        </div>
      </div>
    );
  }

  if (teachers.length === 0) {
    return (
      <div className="text-center py-12">
        <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {searchQuery ? 'Žádné výsledky' : 'Žádní učitelé'}
        </h3>
        <p className="text-gray-600 mb-4">
          {searchQuery 
            ? `Pro vyhledávání "${searchQuery}" nebyly nalezeny žádné výsledky.`
            : 'Nebyly nalezeni žádní učitelé odpovídající zadaným kritériím.'
          }
        </p>
        <div className="text-sm text-gray-500">
          Zkuste upravit vyhledávací kritéria nebo filtry.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">{total}</span> učitelů
            {searchQuery && (
              <span> pro &quot;{searchQuery}&quot;</span>
            )}
          </div>
          
          {/* Active Filters Count */}
          {Object.keys(currentFilters).some(key => 
            key !== 'limit' && key !== 'offset' && currentFilters[key as keyof TeacherFilters]
          ) && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Filter className="w-3 h-3 mr-1" />
              {Object.keys(currentFilters).filter(key => 
                key !== 'limit' && key !== 'offset' && currentFilters[key as keyof TeacherFilters]
              ).length} filtrů
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Sort Dropdown */}
          <div className="relative">
            <select
              value={sortField || ''}
              onChange={(e) => {
                const option = sortOptions.find(opt => opt.field === e.target.value);
                if (option) {
                  handleSortClick(option.field, option.defaultDirection);
                }
              }}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seřadit podle</option>
              {sortOptions.map(option => (
                <option key={option.field} value={option.field}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Direction */}
          {sortField && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSortClick(sortField, sortDirection === 'asc' ? 'desc' : 'asc')}
              className="p-1"
            >
              {sortDirection === 'asc' ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
            </Button>
          )}

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded-md">
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('list')}
              className="rounded-r-none border-r"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('grid')}
              className="rounded-l-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Display */}
      {viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teachers.map((teacher) => (
            <div key={teacher.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-shrink-0 h-10 w-10">
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600">
                      {teacher.first_name[0]}{teacher.last_name[0]}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <Badge variant="outline" className={getStatusColor(teacher.status)}>
                    {teacher.status === 'active' ? 'Aktivní' :
                     teacher.status === 'inactive' ? 'Neaktivní' :
                     teacher.status === 'pending_verification' ? 'Čekající' : 'Pozastavený'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <div>
                  <div className="font-medium text-gray-900">
                    {highlightSearchTerm(`${teacher.first_name} ${teacher.last_name}`, searchQuery)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {highlightSearchTerm(teacher.email, searchQuery)}
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  {teacher.school_name ? (
                    <div>
                      {highlightSearchTerm(teacher.school_name, searchQuery)}
                      {teacher.school_city && (
                        <span className="text-gray-400"> • {teacher.school_city}</span>
                      )}
                    </div>
                  ) : (
                    'Individuální učitel'
                  )}
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="text-green-600 font-medium">
                    {teacher.credits_balance} kreditů
                  </div>
                  <div className="text-gray-500">
                    {teacher.login_count} přihlášení
                  </div>
                </div>

                <div className="text-xs text-gray-500">
                  Registrace: {formatDate(teacher.created_at)}
                </div>

                {onShowPerformanceMetrics && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onShowPerformanceMetrics(teacher.id)}
                      className="w-full text-blue-600 hover:text-blue-700"
                    >
                      <Target className="w-4 h-4 mr-1" />
                      Výkonnostní metriky
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0 h-10 w-10">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {teacher.first_name[0]}{teacher.last_name[0]}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <div className="font-medium text-gray-900">
                          {highlightSearchTerm(`${teacher.first_name} ${teacher.last_name}`, searchQuery)}
                        </div>
                        <Badge variant="outline" className={getRoleColor(teacher.role)}>
                          {teacher.role === 'teacher_school' ? 'Školní' : 'Individuální'}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        {highlightSearchTerm(teacher.email, searchQuery)}
                      </div>
                      
                      {teacher.school_name && (
                        <div className="text-sm text-gray-600">
                          {highlightSearchTerm(teacher.school_name, searchQuery)}
                          {teacher.school_city && (
                            <span className="text-gray-400"> • {teacher.school_city}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-6 text-sm">
                    <div className="text-center">
                      <div className="font-medium text-green-600">{teacher.credits_balance}</div>
                      <div className="text-gray-500">kredity</div>
                    </div>

                    <div className="text-center">
                      <div className="font-medium text-gray-900">{teacher.login_count}</div>
                      <div className="text-gray-500">přihlášení</div>
                    </div>

                    <div className="text-center min-w-0">
                      <div className="font-medium text-gray-900">
                        {formatLastActive(teacher.last_activity_at)}
                      </div>
                      <div className="text-gray-500">aktivita</div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {onShowPerformanceMetrics && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onShowPerformanceMetrics(teacher.id)}
                          className="text-blue-600 hover:text-blue-700"
                          title="Zobrazit výkonnostní metriky"
                        >
                          <Target className="w-4 h-4" />
                        </Button>
                      )}

                      <Badge variant="outline" className={getStatusColor(teacher.status)}>
                        {teacher.status === 'active' ? 'Aktivní' :
                         teacher.status === 'inactive' ? 'Neaktivní' :
                         teacher.status === 'pending_verification' ? 'Čekající' : 'Pozastavený'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherSearchResults;
