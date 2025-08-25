import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import Badge from '../ui/Badge';

export interface ActivityLogEntry {
  id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  action?: string;
  action_type: 'login' | 'logout' | 'page_view' | 'api_call' | 'file_generated' | 
               'conversation_started' | 'credits_used' | 'profile_updated' | 
               'password_changed' | 'email_verified' | 'subscription_changed';
  details?: string;
  ip_address?: string;
  user_agent?: string;
  timestamp?: string;
  session_id?: string;
  credits_used?: number;
  school_id?: string;
  school_name?: string;
  // Backend fields
  activity_data?: Record<string, any>;
  created_at?: string;
}

interface UserActivityLogProps {
  logs?: ActivityLogEntry[];
  onFilterChange: (filters: ActivityLogFilters) => void;
  onExport: () => void;
  loading?: boolean;
  totalCount?: number;
}

export interface ActivityLogFilters {
  search: string;
  user_id: string;
  action_type: string;
  date_from: string;
  date_to: string;
  school_id: string;
}

const UserActivityLog: React.FC<UserActivityLogProps> = ({
  logs = [],
  onFilterChange,
  onExport,
  loading = false,
  totalCount = 0
}) => {
  const [filters, setFilters] = useState<ActivityLogFilters>({
    search: '',
    user_id: '',
    action_type: '',
    date_from: '',
    date_to: '',
    school_id: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLogs, setSelectedLogs] = useState<string[]>([]);

  const actionTypeLabels: Record<string, string> = {
    'login': 'Přihlášení',
    'logout': 'Odhlášení',
    'api_call': 'API volání',
    'page_view': 'Zobrazení stránky',
    'file_generated': 'Vygenerován soubor',
    'conversation_started': 'Zahájena konverzace',
    'credits_used': 'Použití kreditů',
    'profile_updated': 'Aktualizován profil',
    'password_changed': 'Změněno heslo',
    'email_verified': 'Ověřen email',
    'subscription_changed': 'Změna předplatného'
  };

  const actionTypeColors: Record<string, string> = {
    'login': 'bg-green-100 text-green-800',
    'logout': 'bg-gray-100 text-gray-800',
    'api_call': 'bg-blue-100 text-blue-800',
    'page_view': 'bg-purple-100 text-purple-800',
    'file_generated': 'bg-yellow-100 text-yellow-800',
    'conversation_started': 'bg-indigo-100 text-indigo-800',
    'credits_used': 'bg-orange-100 text-orange-800',
    'profile_updated': 'bg-teal-100 text-teal-800',
    'password_changed': 'bg-red-100 text-red-800',
    'email_verified': 'bg-emerald-100 text-emerald-800',
    'subscription_changed': 'bg-violet-100 text-violet-800'
  };

  const handleFilterChange = (key: keyof ActivityLogFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters: ActivityLogFilters = {
      search: '',
      user_id: '',
      action_type: '',
      date_from: '',
      date_to: '',
      school_id: ''
    };
    setFilters(clearedFilters);
    onFilterChange(clearedFilters);
  };

  const handleSelectAll = () => {
    if (safeLogs.length === 0) return;
    
    if (selectedLogs.length === safeLogs.length) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs(safeLogs.map(log => log.id));
    }
  };

  const handleSelectLog = (logId: string) => {
    setSelectedLogs(prev => 
      prev.includes(logId) 
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    );
  };

  const formatTimestamp = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return 'Neplatné datum';
      
      return date.toLocaleString('cs-CZ', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch (error) {
      return 'Chyba formátování';
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    if (!timestamp) return 'N/A';
    
    try {
      const now = new Date();
      const logTime = new Date(timestamp);
      
      if (isNaN(logTime.getTime())) return 'Neplatné datum';
      
      const diffMs = now.getTime() - logTime.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return 'Právě teď';
      if (diffMins < 60) return `Před ${diffMins} min`;
      if (diffHours < 24) return `Před ${diffHours} hod`;
      if (diffDays < 7) return `Před ${diffDays} dny`;
      return formatTimestamp(timestamp);
    } catch (error) {
      return 'Chyba výpočtu';
    }
  };

  // Helper function to get display values from backend data
  const getDisplayValue = (log: ActivityLogEntry, field: string): string => {
    if (!log) return 'N/A';
    
    if (field === 'timestamp') {
      return log.timestamp || log.created_at || '';
    }
    
    if (field === 'details') {
      if (log.details) return log.details;
      if (log.activity_data) {
        // Try to extract meaningful details from activity_data
        const data = log.activity_data;
        if (typeof data === 'object') {
          if (data.description) return data.description;
          if (data.message) return data.message;
          if (data.action) return data.action;
          return JSON.stringify(data);
        }
      }
      return 'N/A';
    }
    
    if (field === 'action') {
      if (log.action) return log.action;
      if (log.activity_data?.action) return log.activity_data.action;
      return 'N/A';
    }
    
    const value = log[field as keyof ActivityLogEntry];
    return value !== undefined && value !== null ? String(value) : 'N/A';
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value !== '').length;
  };

  // Ensure logs is always an array and filter out invalid entries
  const safeLogs = (logs || []).filter(log => log && typeof log === 'object' && log.id);

  return (
    <Card className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Aktivita uživatelů</h3>
          <p className="text-sm text-gray-600">
            {totalCount} záznamů celkem
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            disabled={loading}
          >
            {showFilters ? 'Skrýt' : 'Zobrazit'} filtry
            {getActiveFiltersCount() > 0 && (
              <Badge variant="primary" className="ml-2 text-xs">
                {getActiveFiltersCount()}
              </Badge>
            )}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onExport}
            disabled={loading}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-md font-medium text-gray-900">Filtry</h4>
            <Button
              variant="outline"
              size="sm"
              onClick={clearFilters}
              disabled={loading}
            >
              Vymazat vše
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <InputField
              label="Vyhledávání"
              name="search"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Uživatel, akce, detaily..."
              disabled={loading}
            />

            <InputField
              label="ID uživatele"
              name="user_id"
              value={filters.user_id}
              onChange={(e) => handleFilterChange('user_id', e.target.value)}
              placeholder="Zadejte ID uživatele"
              disabled={loading}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Typ akce
              </label>
              <select
                value={filters.action_type}
                onChange={(e) => handleFilterChange('action_type', e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Všechny typy</option>
                {Object.entries(actionTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <InputField
              label="Datum od"
              name="date_from"
              type="date"
              value={filters.date_from}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              disabled={loading}
            />

            <InputField
              label="Datum do"
              name="date_to"
              type="date"
              value={filters.date_to}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              disabled={loading}
            />

            <InputField
              label="ID školy"
              name="school_id"
              value={filters.school_id}
              onChange={(e) => handleFilterChange('school_id', e.target.value)}
              placeholder="Zadejte ID školy"
              disabled={loading}
            />
          </div>
        </div>
      )}

      {/* Logs Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedLogs.length === safeLogs.length && safeLogs.length > 0}
                  onChange={handleSelectAll}
                  disabled={loading || safeLogs.length === 0}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Uživatel
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akce
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Detaily
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Čas
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP adresa
              </th>
              <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kredity
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                    Načítání...
                  </div>
                </td>
              </tr>
            ) : safeLogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-4 text-center text-gray-500">
                  Žádné záznamy k zobrazení
                </td>
              </tr>
            ) : (
              safeLogs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-3 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedLogs.includes(log.id)}
                      onChange={() => handleSelectLog(log.id)}
                      disabled={loading}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {getDisplayValue(log, 'user_name')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getDisplayValue(log, 'user_email')}
                      </div>
                      {log.school_name && (
                        <div className="text-xs text-gray-400">
                          {log.school_name}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      <Badge className={actionTypeColors[log.action_type] || 'bg-gray-100 text-gray-800'}>
                        {actionTypeLabels[log.action_type] || log.action_type || 'Neznámý typ'}
                      </Badge>
                      <span className="text-sm text-gray-900">{getDisplayValue(log, 'action')}</span>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate" title={getDisplayValue(log, 'details')}>
                      {getDisplayValue(log, 'details')}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">
                        {formatTimestamp(getDisplayValue(log, 'timestamp'))}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatRelativeTime(getDisplayValue(log, 'timestamp'))}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    {log.ip_address || '-'}
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                    {log.credits_used ? `${log.credits_used}` : '-'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Info */}
      {safeLogs.length > 0 && (
        <div className="flex items-center justify-between text-sm text-gray-700">
          <div>
            Zobrazeno {safeLogs.length} z {totalCount} záznamů
            {selectedLogs.length > 0 && (
              <span className="ml-2 text-blue-600">
                ({selectedLogs.length} vybráno)
              </span>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default UserActivityLog;
