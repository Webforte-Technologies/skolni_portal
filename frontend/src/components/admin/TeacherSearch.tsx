import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Clock, User, Mail, Building2, Filter, Star, History } from 'lucide-react';
import { Button, Input } from '../ui';
import { teacherService, Teacher, TeacherFilters } from '../../services/teacherService';

interface SearchSuggestion {
  id: string;
  type: 'teacher' | 'school' | 'email' | 'recent';
  value: string;
  label: string;
  subtitle?: string;
  teacher?: Teacher;
}

interface SavedFilter {
  id: string;
  name: string;
  filters: TeacherFilters;
  created_at: string;
  is_favorite: boolean;
}

interface TeacherSearchProps {
  onSearch: (query: string, filters?: TeacherFilters) => void;
  currentFilters: TeacherFilters;
  placeholder?: string;
  className?: string;
}

const TeacherSearch: React.FC<TeacherSearchProps> = ({
  onSearch,
  currentFilters,
  placeholder = "Hledat učitele podle jména, e-mailu nebo školy...",
  className = ""
}) => {
  const [searchQuery, setSearchQuery] = useState(currentFilters.q || '');
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showSavedFilters, setShowSavedFilters] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load recent searches and saved filters from localStorage
  useEffect(() => {
    const recent = localStorage.getItem('teacher_recent_searches');
    if (recent) {
      setRecentSearches(JSON.parse(recent));
    }

    const saved = localStorage.getItem('teacher_saved_filters');
    if (saved) {
      setSavedFilters(JSON.parse(saved));
    }
  }, []);

  // Debounced search suggestions
  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      setLoading(true);
      
      // Fetch teachers matching the query
      const response = await teacherService.getTeachers({
        q: query,
        limit: 10,
        offset: 0
      });

      const newSuggestions: SearchSuggestion[] = [];

      // Add teacher suggestions
      response.data.forEach(teacher => {
        // Teacher name suggestion
        const fullName = `${teacher.first_name} ${teacher.last_name}`;
        if (fullName.toLowerCase().includes(query.toLowerCase())) {
          newSuggestions.push({
            id: `teacher-${teacher.id}`,
            type: 'teacher',
            value: fullName,
            label: fullName,
            subtitle: teacher.email,
            teacher
          });
        }

        // Email suggestion
        if (teacher.email.toLowerCase().includes(query.toLowerCase())) {
          newSuggestions.push({
            id: `email-${teacher.id}`,
            type: 'email',
            value: teacher.email,
            label: teacher.email,
            subtitle: fullName,
            teacher
          });
        }

        // School suggestion
        if (teacher.school_name && teacher.school_name.toLowerCase().includes(query.toLowerCase())) {
          const existingSchool = newSuggestions.find(s => s.type === 'school' && s.value === teacher.school_name);
          if (!existingSchool) {
            newSuggestions.push({
              id: `school-${teacher.school_id}`,
              type: 'school',
              value: teacher.school_name,
              label: teacher.school_name,
              subtitle: teacher.school_city || undefined
            });
          }
        }
      });

      // Add recent searches if they match
      const matchingRecent = recentSearches
        .filter(recent => recent.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 3)
        .map(recent => ({
          id: `recent-${recent}`,
          type: 'recent' as const,
          value: recent,
          label: recent,
          subtitle: 'Nedávné vyhledávání'
        }));

      setSuggestions([...newSuggestions.slice(0, 8), ...matchingRecent]);
    } catch (err) {
      console.error('Failed to fetch search suggestions:', err);
    } finally {
      setLoading(false);
    }
  }, [recentSearches]);

  // Handle search input change with debouncing
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce suggestions fetch
    debounceRef.current = setTimeout(() => {
      if (value.trim()) {
        fetchSuggestions(value.trim());
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);
  };

  // Handle search submission
  const handleSearch = (query?: string, additionalFilters?: TeacherFilters) => {
    const searchTerm = query || searchQuery.trim();
    
    if (searchTerm) {
      // Add to recent searches
      const newRecent = [searchTerm, ...recentSearches.filter(r => r !== searchTerm)].slice(0, 10);
      setRecentSearches(newRecent);
      localStorage.setItem('teacher_recent_searches', JSON.stringify(newRecent));
    }

    // Combine current filters with additional filters
    const combinedFilters = {
      ...currentFilters,
      ...additionalFilters,
      q: searchTerm || undefined,
      offset: 0 // Reset to first page
    };

    onSearch(searchTerm, combinedFilters);
    setShowSuggestions(false);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.value);
    
    const additionalFilters: TeacherFilters = {};
    
    // Apply specific filters based on suggestion type
    switch (suggestion.type) {
      case 'school':
        if (suggestion.teacher?.school_id) {
          additionalFilters.school_id = suggestion.teacher.school_id;
        }
        break;
      case 'teacher':
      case 'email':
        // For specific teacher, we can add more targeted search
        break;
    }

    handleSearch(suggestion.value, additionalFilters);
  };

  // Handle key navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    onSearch('', { ...currentFilters, q: undefined, offset: 0 });
  };

  // Save current filter as preset
  const saveCurrentFilter = () => {
    const name = prompt('Zadejte název pro uložený filtr:');
    if (!name) return;

    const newFilter: SavedFilter = {
      id: Date.now().toString(),
      name,
      filters: currentFilters,
      created_at: new Date().toISOString(),
      is_favorite: false
    };

    const newSavedFilters = [...savedFilters, newFilter];
    setSavedFilters(newSavedFilters);
    localStorage.setItem('teacher_saved_filters', JSON.stringify(newSavedFilters));
  };

  // Apply saved filter
  const applySavedFilter = (savedFilter: SavedFilter) => {
    const { q, ...filters } = savedFilter.filters;
    setSearchQuery(q || '');
    onSearch(q || '', filters);
    setShowSavedFilters(false);
  };

  // Delete saved filter
  const deleteSavedFilter = (filterId: string) => {
    const newSavedFilters = savedFilters.filter(f => f.id !== filterId);
    setSavedFilters(newSavedFilters);
    localStorage.setItem('teacher_saved_filters', JSON.stringify(newSavedFilters));
  };

  // Toggle favorite filter
  const toggleFavoriteFilter = (filterId: string) => {
    const newSavedFilters = savedFilters.map(f => 
      f.id === filterId ? { ...f, is_favorite: !f.is_favorite } : f
    );
    setSavedFilters(newSavedFilters);
    localStorage.setItem('teacher_saved_filters', JSON.stringify(newSavedFilters));
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setShowSavedFilters(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'teacher':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'email':
        return <Mail className="w-4 h-4 text-green-500" />;
      case 'school':
        return <Building2 className="w-4 h-4 text-purple-500" />;
      case 'recent':
        return <Clock className="w-4 h-4 text-gray-400" />;
      default:
        return <Search className="w-4 h-4 text-gray-400" />;
    }
  };

  const hasActiveFilters = Object.keys(currentFilters).some(key => 
    key !== 'limit' && key !== 'offset' && currentFilters[key as keyof TeacherFilters]
  );

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          ref={searchInputRef}
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          className="pl-10 pr-20"
        />
        
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {/* Saved Filters Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSavedFilters(!showSavedFilters)}
            className={`p-1 ${savedFilters.length > 0 ? 'text-blue-600' : 'text-gray-400'}`}
            title="Uložené filtry"
          >
            <Filter className="w-4 h-4" />
          </Button>

          {/* Save Current Filter Button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={saveCurrentFilter}
              className="p-1 text-gray-400 hover:text-blue-600"
              title="Uložit aktuální filtr"
            >
              <Star className="w-4 h-4" />
            </Button>
          )}

          {/* Clear Search Button */}
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="p-1 text-gray-400 hover:text-red-600"
              title="Vymazat vyhledávání"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Search Suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto"
        >
          {loading && (
            <div className="px-4 py-2 text-sm text-gray-500">
              Načítání návrhů...
            </div>
          )}
          
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.id}
              onClick={() => handleSuggestionSelect(suggestion)}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                {getSuggestionIcon(suggestion.type)}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {suggestion.label}
                  </div>
                  {suggestion.subtitle && (
                    <div className="text-xs text-gray-500 truncate">
                      {suggestion.subtitle}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Saved Filters Dropdown */}
      {showSavedFilters && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto"
        >
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-900">Uložené filtry</div>
          </div>
          
          {savedFilters.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              Žádné uložené filtry
            </div>
          ) : (
            savedFilters
              .sort((a, b) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0))
              .map((savedFilter) => (
                <div
                  key={savedFilter.id}
                  className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <button
                    onClick={() => applySavedFilter(savedFilter)}
                    className="flex-1 text-left"
                  >
                    <div className="flex items-center space-x-2">
                      {savedFilter.is_favorite && (
                        <Star className="w-3 h-3 text-yellow-500 fill-current" />
                      )}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {savedFilter.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(savedFilter.created_at).toLocaleDateString('cs-CZ')}
                        </div>
                      </div>
                    </div>
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleFavoriteFilter(savedFilter.id)}
                      className="p-1"
                    >
                      <Star className={`w-3 h-3 ${savedFilter.is_favorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteSavedFilter(savedFilter.id)}
                      className="p-1 text-red-400 hover:text-red-600"
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))
          )}
        </div>
      )}

      {/* Recent Searches (when no suggestions and input is focused) */}
      {showSuggestions && suggestions.length === 0 && !loading && searchQuery.length < 2 && recentSearches.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto"
        >
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-900">Nedávná vyhledávání</div>
          </div>
          
          {recentSearches.slice(0, 5).map((recent, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionSelect({
                id: `recent-${index}`,
                type: 'recent',
                value: recent,
                label: recent
              })}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                <History className="w-4 h-4 text-gray-400" />
                <div className="text-sm text-gray-900">{recent}</div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeacherSearch;
