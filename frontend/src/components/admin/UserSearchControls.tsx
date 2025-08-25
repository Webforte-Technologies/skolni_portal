import React from 'react';
import { Search, Filter, Activity } from 'lucide-react';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import Card from '../ui/Card';

interface UserSearchControlsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearch: () => void;
  useEnhancedFilters: boolean;
  onToggleEnhancedFilters: () => void;
  showRecentActivity: boolean;
  onToggleRecentActivity: () => void;
  loading?: boolean;
}

const UserSearchControls: React.FC<UserSearchControlsProps> = ({
  searchQuery,
  onSearchChange,
  onSearch,
  useEnhancedFilters,
  onToggleEnhancedFilters,
  showRecentActivity,
  onToggleRecentActivity,
  loading = false
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <Card>
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <InputField
              label="Hledat uživatele"
              name="search"
              placeholder="Hledat uživatele..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading}
            />
          </div>
          <div className="flex gap-2">
            <Button 
              variant={useEnhancedFilters ? "primary" : "outline"} 
              onClick={onToggleEnhancedFilters}
              disabled={loading}
            >
              <Filter className="w-4 h-4 mr-2" />
              {useEnhancedFilters ? 'Rozšířené filtry' : 'Základní filtry'}
            </Button>
            <Button 
              variant={showRecentActivity ? "primary" : "outline"} 
              onClick={onToggleRecentActivity}
              disabled={loading}
            >
              <Activity className="w-4 h-4 mr-2" />
              {showRecentActivity ? 'Skrýt aktivitu' : 'Nedávná aktivita'}
            </Button>
            <Button onClick={onSearch} disabled={loading}>
              <Search className="w-4 h-4 mr-2" />
              Hledat
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default UserSearchControls;
