import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import Badge from '../ui/Badge';

export interface UserStatus {
  id: string;
  name: string;
  email: string;
  current_status: 'active' | 'suspended' | 'pending' | 'inactive';
  status_reason?: string;
  status_changed_at?: string;
  status_changed_by?: string;
  verification_required: boolean;
  last_login?: string;
  credits_balance: number;
  school_name?: string;
}

interface UserStatusManagerProps {
  users: UserStatus[];
  onStatusChange: (userId: string, status: string, reason?: string) => Promise<void>;
  onBulkStatusChange: (userIds: string[], status: string, reason?: string) => Promise<void>;
  onVerifyUser: (userId: string) => Promise<void>;
  loading?: boolean;
}

const UserStatusManager: React.FC<UserStatusManagerProps> = ({
  users,
  onStatusChange,
  onBulkStatusChange,
  onVerifyUser,
  loading = false
}) => {
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkStatus, setBulkStatus] = useState<string>('active');
  const [bulkReason, setBulkReason] = useState<string>('');
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [statusReasons, setStatusReasons] = useState<Record<string, string>>({});

  const statusLabels: Record<string, string> = {
    'active': 'Aktivní',
    'suspended': 'Pozastaveno',
    'pending': 'Čekající',
    'inactive': 'Neaktivní'
  };

  const statusColors: Record<string, string> = {
    'active': 'bg-green-100 text-green-800',
    'suspended': 'bg-red-100 text-red-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'inactive': 'bg-gray-100 text-gray-800'
  };

  const statusOptions = [
    { value: 'active', label: 'Aktivní' },
    { value: 'suspended', label: 'Pozastaveno' },
    { value: 'pending', label: 'Čekající' },
    { value: 'inactive', label: 'Neaktivní' }
  ];

  const reasonOptions = [
    { value: 'violation', label: 'Porušení pravidel' },
    { value: 'inactivity', label: 'Neaktivita' },
    { value: 'payment', label: 'Problém s platbou' },
    { value: 'security', label: 'Bezpečnostní důvody' },
    { value: 'verification', label: 'Čeká na ověření' },
    { value: 'other', label: 'Jiné' }
  ];

  const handleSelectAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(user => user.id));
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleStatusChange = async (userId: string, status: string) => {
    const reason = statusReasons[userId] || '';
    try {
      await onStatusChange(userId, status, reason);
      // Clear the reason after successful status change
      setStatusReasons(prev => {
        const newReasons = { ...prev };
        delete newReasons[userId];
        return newReasons;
      });
    } catch (error) {
      console.error('Failed to change user status:', error);
    }
  };

  const handleBulkStatusChange = async () => {
    if (selectedUsers.length === 0) return;
    
    try {
      await onBulkStatusChange(selectedUsers, bulkStatus, bulkReason);
      setSelectedUsers([]);
      setBulkReason('');
      setShowBulkActions(false);
    } catch (error) {
      console.error('Failed to change bulk status:', error);
    }
  };

  const handleVerifyUser = async (userId: string) => {
    try {
      await onVerifyUser(userId);
    } catch (error) {
      console.error('Failed to verify user:', error);
    }
  };

  const getStatusCounts = () => {
    const counts = { active: 0, suspended: 0, pending: 0, inactive: 0 };
    users.forEach(user => {
      counts[user.current_status]++;
    });
    return counts;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('cs-CZ');
  };

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return '-';
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffDays === 0) return 'Dnes';
    if (diffDays === 1) return 'Včera';
    if (diffDays < 7) return `Před ${diffDays} dny`;
    return formatDate(dateString);
  };

  const statusCounts = getStatusCounts();

  return (
    <Card className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Správa statusů uživatelů</h3>
          <p className="text-sm text-gray-600">
            {users.length} uživatelů celkem
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {selectedUsers.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowBulkActions(!showBulkActions)}
              disabled={loading}
            >
              Hromadné akce ({selectedUsers.length})
            </Button>
          )}
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className="bg-gray-50 p-4 rounded-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <Badge className={statusColors[status]}>
                {statusLabels[status]}
              </Badge>
            </div>
            <p className="text-2xl font-bold text-gray-900">{count}</p>
            <p className="text-sm text-gray-600">uživatelů</p>
          </div>
        ))}
      </div>

      {/* Bulk Actions */}
      {showBulkActions && selectedUsers.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg space-y-4">
          <h4 className="text-md font-medium text-blue-900">
            Hromadné změny pro {selectedUsers.length} uživatelů
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-1">
                Nový status
              </label>
              <select
                value={bulkStatus}
                onChange={(e) => setBulkStatus(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-blue-900 mb-1">
                Důvod (volitelně)
              </label>
              <select
                value={bulkReason}
                onChange={(e) => setBulkReason(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Bez důvodu</option>
                {reasonOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <Button
                variant="primary"
                onClick={handleBulkStatusChange}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Měním...' : 'Aplikovat změny'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedUsers.length === users.length && users.length > 0}
                  onChange={handleSelectAll}
                  disabled={loading}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uživatel
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Poslední přihlášení
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kredity
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akce
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                    Načítání...
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-3 py-4 text-center text-gray-500">
                  Žádní uživatelé k zobrazení
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleSelectUser(user.id)}
                      disabled={loading}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.email}
                      </div>
                      {user.school_name && (
                        <div className="text-xs text-gray-400">
                          {user.school_name}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Badge className={statusColors[user.current_status]}>
                        {statusLabels[user.current_status]}
                      </Badge>
                      {user.verification_required && (
                        <Badge className="bg-orange-100 text-orange-800">
                          Ověření
                        </Badge>
                      )}
                    </div>
                    {user.status_reason && (
                      <div className="text-xs text-gray-500 mt-1">
                        Důvod: {user.status_reason}
                      </div>
                    )}
                    {user.status_changed_at && (
                      <div className="text-xs text-gray-400">
                        Změněno: {formatRelativeTime(user.status_changed_at)}
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatRelativeTime(user.last_login)}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.credits_balance}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <select
                        value={user.current_status}
                        onChange={(e) => handleStatusChange(user.id, e.target.value)}
                        disabled={loading}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {statusOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      
                      {user.verification_required && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleVerifyUser(user.id)}
                          disabled={loading}
                        >
                          Ověřit
                        </Button>
                      )}
                    </div>
                    
                    {/* Status Reason Input */}
                    <div className="mt-2">
                      <select
                        value={statusReasons[user.id] || ''}
                        onChange={(e) => setStatusReasons(prev => ({
                          ...prev,
                          [user.id]: e.target.value
                        }))}
                        disabled={loading}
                        className="text-xs border border-gray-300 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Bez důvodu</option>
                        {reasonOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {users.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-700">
          <div>
            Zobrazeno {users.length} uživatelů
            {selectedUsers.length > 0 && (
              <span className="ml-2 text-blue-600">
                ({selectedUsers.length} vybráno)
              </span>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span>Statusy: </span>
            {Object.entries(statusCounts).map(([status, count]) => (
              <span key={status} className="flex items-center space-x-1">
                <Badge className={statusColors[status]}>{statusLabels[status]}</Badge>
                <span className="text-gray-600">({count})</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
};

export default UserStatusManager;
