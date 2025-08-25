import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import UserTableHeader from './UserTableHeader';
import UserTableRow from './UserTableRow';
import { StandardUser } from '../../utils/dataTransform';

interface UserTableProps {
  users: StandardUser[];
  loading: boolean;
  selectedUsers: string[];
  onSelectAll: (selected: boolean) => void;
  onSelectUser: (userId: string, selected: boolean) => void;
  onUserAction: (userId: string, action: string) => void;
  currentSortField?: string;
  currentSortDirection?: 'asc' | 'desc';
  onSort: (field: string, direction: 'asc' | 'desc') => void;
  // Pagination props
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const UserTable: React.FC<UserTableProps> = ({
  users,
  loading,
  selectedUsers,
  onSelectAll,
  onSelectUser,
  onUserAction,
  currentSortField,
  currentSortDirection,
  onSort,
  currentPage,
  totalPages,
  totalUsers,
  pageSize,
  onPageChange
}) => {
  return (
    <Card>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <UserTableHeader
            selectedUsers={selectedUsers}
            users={users}
            onSelectAll={onSelectAll}
            currentSortField={currentSortField}
            currentSortDirection={currentSortDirection}
            onSort={onSort}
          />
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  Načítání...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-4 text-center text-gray-500">
                  Žádní uživatelé nebyli nalezeni
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <UserTableRow
                  key={user.id}
                  user={user}
                  isSelected={selectedUsers.includes(user.id)}
                  onSelect={(selected) => onSelectUser(user.id, selected)}
                  onAction={onUserAction}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            Zobrazeno {currentPage * pageSize + 1} až {Math.min((currentPage + 1) * pageSize, totalUsers)} z {totalUsers} výsledků
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 0}
            >
              Předchozí
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages - 1}
            >
              Další
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default UserTable;
