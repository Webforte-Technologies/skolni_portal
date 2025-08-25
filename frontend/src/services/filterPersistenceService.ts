import { EnhancedUserFilters } from '../components/admin/EnhancedUserFilters';

export interface SavedFilter {
  id: string;
  name: string;
  filters: EnhancedUserFilters;
  created_at: string;
}

class FilterPersistenceService {
  private readonly STORAGE_KEY = 'eduai_user_filters';
  private readonly URL_PARAM_PREFIX = 'filter_';

  // Default empty filters
  getDefaultFilters(): EnhancedUserFilters {
    return {
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
  }

  // URL persistence
  saveFiltersToUrl(filters: EnhancedUserFilters): void {
    const url = new URL(window.location.href);
    const defaultFilters = this.getDefaultFilters();

    // Clear existing filter parameters
    Array.from(url.searchParams.keys()).forEach(key => {
      if (key.startsWith(this.URL_PARAM_PREFIX)) {
        url.searchParams.delete(key);
      }
    });

    // Add non-default filter values to URL
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== defaultFilters[key as keyof EnhancedUserFilters]) {
        url.searchParams.set(`${this.URL_PARAM_PREFIX}${key}`, value);
      }
    });

    // Update URL without triggering page reload
    window.history.replaceState({}, '', url.toString());
  }

  loadFiltersFromUrl(): Partial<EnhancedUserFilters> {
    const url = new URL(window.location.href);
    const filters: Partial<EnhancedUserFilters> = {};

    url.searchParams.forEach((value, key) => {
      if (key.startsWith(this.URL_PARAM_PREFIX)) {
        const filterKey = key.replace(this.URL_PARAM_PREFIX, '') as keyof EnhancedUserFilters;
        filters[filterKey] = value;
      }
    });

    return filters;
  }

  // LocalStorage persistence for saved filters
  getSavedFilters(): SavedFilter[] {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading saved filters:', error);
      return [];
    }
  }

  saveFilter(name: string, filters: EnhancedUserFilters): SavedFilter {
    const savedFilters = this.getSavedFilters();
    const newFilter: SavedFilter = {
      id: this.generateId(),
      name,
      filters: { ...filters },
      created_at: new Date().toISOString()
    };

    savedFilters.push(newFilter);
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(savedFilters));
    } catch (error) {
      console.error('Error saving filter:', error);
      throw new Error('Nepodařilo se uložit filtr');
    }

    return newFilter;
  }

  deleteFilter(filterId: string): void {
    const savedFilters = this.getSavedFilters();
    const updatedFilters = savedFilters.filter(filter => filter.id !== filterId);
    
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedFilters));
    } catch (error) {
      console.error('Error deleting filter:', error);
      throw new Error('Nepodařilo se smazat filtr');
    }
  }

  // Session storage for temporary filter state
  saveTemporaryFilters(filters: EnhancedUserFilters): void {
    try {
      sessionStorage.setItem(`${this.STORAGE_KEY}_temp`, JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving temporary filters:', error);
    }
  }

  loadTemporaryFilters(): Partial<EnhancedUserFilters> | null {
    try {
      const saved = sessionStorage.getItem(`${this.STORAGE_KEY}_temp`);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading temporary filters:', error);
      return null;
    }
  }

  clearTemporaryFilters(): void {
    try {
      sessionStorage.removeItem(`${this.STORAGE_KEY}_temp`);
    } catch (error) {
      console.error('Error clearing temporary filters:', error);
    }
  }

  // Utility methods
  private generateId(): string {
    return `filter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Check if filters have meaningful values (not all defaults)
  hasActiveFilters(filters: EnhancedUserFilters): boolean {
    const defaultFilters = this.getDefaultFilters();
    
    return Object.entries(filters).some(([key, value]) => {
      const defaultValue = defaultFilters[key as keyof EnhancedUserFilters];
      return value && value !== defaultValue && value.trim() !== '';
    });
  }

  // Convert filters to API parameters
  filtersToApiParams(filters: EnhancedUserFilters): Record<string, string> {
    const params: Record<string, string> = {};

    // Basic filters
    if (filters.search && filters.search.trim()) params.q = filters.search.trim();
    if (filters.role !== 'all') params.role = filters.role;
    if (filters.school_id !== 'all') params.school_id = filters.school_id;
    if (filters.is_active !== 'all') params.is_active = filters.is_active;
    if (filters.status !== 'all') params.status = filters.status;
    if (filters.email_verified !== 'all') params.email_verified = filters.email_verified;

    // Enhanced filters
    if (filters.last_login !== 'all') {
      if (filters.last_login === 'custom') {
        if (filters.last_login_from) params.last_login_start = filters.last_login_from;
        if (filters.last_login_to) params.last_login_end = filters.last_login_to;
      } else {
        params.last_login = filters.last_login;
      }
    }

    if (filters.credit_range !== 'all') {
      if (filters.credit_range === 'custom') {
        if (filters.credit_min) params.credit_range_min = filters.credit_min;
        if (filters.credit_max) params.credit_range_max = filters.credit_max;
      } else {
        params.credit_range_type = filters.credit_range;
      }
    }

    if (filters.registration_date !== 'all') {
      if (filters.registration_date === 'custom') {
        if (filters.date_from) params.date_range_start = filters.date_from;
        if (filters.date_to) params.date_range_end = filters.date_to;
      } else {
        params.registration_date = filters.registration_date;
      }
    }

    if (filters.school_type !== 'all') params.school_type = filters.school_type;

    return params;
  }

  // Get filter summary for display
  getFilterSummary(filters: EnhancedUserFilters): string {
    const activeFilters: string[] = [];
    
    if (filters.search && filters.search.trim()) {
      activeFilters.push(`Hledání: "${filters.search}"`);
    }
    
    if (filters.role !== 'all') {
      const roleLabels: Record<string, string> = {
        'platform_admin': 'Platform Admin',
        'school_admin': 'Správce školy',
        'teacher_school': 'Učitel školy',
        'teacher_individual': 'Individuální učitel'
      };
      activeFilters.push(`Role: ${roleLabels[filters.role] || filters.role}`);
    }
    
    if (filters.status !== 'all') {
      const statusLabels: Record<string, string> = {
        'active': 'Aktivní',
        'inactive': 'Neaktivní',
        'suspended': 'Pozastaveno',
        'pending': 'Čekající'
      };
      activeFilters.push(`Status: ${statusLabels[filters.status] || filters.status}`);
    }

    return activeFilters.length > 0 
      ? activeFilters.join(', ') 
      : 'Žádné aktivní filtry';
  }
}

export const filterPersistenceService = new FilterPersistenceService();
export default filterPersistenceService;
