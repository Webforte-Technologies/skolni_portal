import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface SortableHeaderProps {
  label: string;
  field: string;
  currentSortField?: string;
  currentSortDirection?: 'asc' | 'desc';
  onSort: (field: string, direction: 'asc' | 'desc') => void;
  className?: string;
}

const SortableHeader: React.FC<SortableHeaderProps> = ({
  label,
  field,
  currentSortField,
  currentSortDirection,
  onSort,
  className = ''
}) => {
  const isActive = currentSortField === field;
  
  const handleClick = () => {
    if (isActive) {
      // If already sorting by this field, toggle direction
      const newDirection = currentSortDirection === 'asc' ? 'desc' : 'asc';
      onSort(field, newDirection);
    } else {
      // If not sorting by this field, start with ascending
      onSort(field, 'asc');
    }
  };

  const getSortIcon = () => {
    if (!isActive) {
      return <ChevronsUpDown className="w-4 h-4 text-gray-400" />;
    }
    
    if (currentSortDirection === 'asc') {
      return <ChevronUp className="w-4 h-4 text-blue-600" />;
    } else {
      return <ChevronDown className="w-4 h-4 text-blue-600" />;
    }
  };

  return (
    <th 
      className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between group">
        <span className={isActive ? 'text-blue-600' : ''}>{label}</span>
        <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {getSortIcon()}
        </div>
      </div>
    </th>
  );
};

interface UserTableHeaderProps {
  selectedUsers: string[];
  users: any[];
  onSelectAll: (selected: boolean) => void;
  currentSortField?: string;
  currentSortDirection?: 'asc' | 'desc';
  onSort: (field: string, direction: 'asc' | 'desc') => void;
}

const UserTableHeader: React.FC<UserTableHeaderProps> = ({
  selectedUsers,
  users,
  onSelectAll,
  currentSortField,
  currentSortDirection,
  onSort
}) => {
  return (
    <thead className="bg-gray-50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          <input
            type="checkbox"
            checked={selectedUsers.length === users.length && users.length > 0}
            onChange={(e) => onSelectAll(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </th>
        <SortableHeader
          label="Uživatel"
          field="first_name"
          currentSortField={currentSortField}
          currentSortDirection={currentSortDirection}
          onSort={onSort}
        />
        <SortableHeader
          label="Role"
          field="role"
          currentSortField={currentSortField}
          currentSortDirection={currentSortDirection}
          onSort={onSort}
        />
        <SortableHeader
          label="Stav"
          field="is_active"
          currentSortField={currentSortField}
          currentSortDirection={currentSortDirection}
          onSort={onSort}
        />
        <SortableHeader
          label="Škola"
          field="school_name"
          currentSortField={currentSortField}
          currentSortDirection={currentSortDirection}
          onSort={onSort}
        />
        <SortableHeader
          label="Kredity"
          field="credits_balance"
          currentSortField={currentSortField}
          currentSortDirection={currentSortDirection}
          onSort={onSort}
        />
        <SortableHeader
          label="Poslední přihlášení"
          field="last_login_at"
          currentSortField={currentSortField}
          currentSortDirection={currentSortDirection}
          onSort={onSort}
        />
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Akce
        </th>
      </tr>
    </thead>
  );
};

export default UserTableHeader;
