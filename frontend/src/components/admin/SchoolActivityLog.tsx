import React, { useState, useEffect } from 'react';
import { Activity, Filter } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import InputField from '../ui/InputField';

interface ActivityLogEntry {
  id: string;
  school_id: string;
  school_name: string;
  action_type: string;
  description: string;
  user_id?: string;
  user_name?: string;
  metadata: any;
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

interface SchoolActivityLogProps {
  schoolId?: string;
  limit?: number;
  showFilters?: boolean;
}

const SchoolActivityLog: React.FC<SchoolActivityLogProps> = ({ 
  schoolId, 
  limit = 50, 
  showFilters = true 
}) => {
  const [activityLogs, setActivityLogs] = useState<ActivityLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action_type: '',
    date_from: '',
    date_to: '',
    user_id: '',
    search: ''
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    // This would typically fetch from API
    // For now, we'll use mock data
    setLoading(false);
    setActivityLogs([
      {
        id: '1',
        school_id: schoolId || '1',
        school_name: 'Základní škola Praha',
        action_type: 'teacher_added',
        description: 'Přidán nový učitel: Jan Novák',
        user_id: 'user1',
        user_name: 'Admin User',
        metadata: { teacher_name: 'Jan Novák', subject: 'Matematika' },
        created_at: new Date().toISOString(),
        ip_address: '192.168.1.1'
      },
      {
        id: '2',
        school_id: schoolId || '1',
        school_name: 'Základní škola Praha',
        action_type: 'credits_used',
        description: 'Použito 50 kreditů pro generování cvičení',
        user_id: 'user2',
        user_name: 'Jan Novák',
        metadata: { credits_used: 50, content_type: 'exercise' },
        created_at: new Date(Date.now() - 86400000).toISOString(),
        ip_address: '192.168.1.2'
      }
    ]);
  }, [schoolId]);

  const getActionTypeLabel = (actionType: string) => {
    const labels: Record<string, string> = {
      'school_created': 'Vytvoření školy',
      'school_updated': 'Aktualizace školy',
      'school_deleted': 'Smazání školy',
      'teacher_added': 'Přidání učitele',
      'teacher_removed': 'Odebrání učitele',
      'credits_added': 'Přidání kreditů',
      'credits_used': 'Použití kreditů',
      'admin_login': 'Přihlášení administrátora',
      'settings_changed': 'Změna nastavení',
      'notification_sent': 'Odeslání oznámení'
    };
    return labels[actionType] || actionType;
  };

  const getActionTypeColor = (actionType: string) => {
    const colors: Record<string, string> = {
      'school_created': 'bg-green-100 text-green-800',
      'school_updated': 'bg-blue-100 text-blue-800',
      'school_deleted': 'bg-red-100 text-red-800',
      'teacher_added': 'bg-purple-100 text-purple-800',
      'teacher_removed': 'bg-orange-100 text-orange-800',
      'credits_added': 'bg-emerald-100 text-emerald-800',
      'credits_used': 'bg-amber-100 text-amber-800',
      'admin_login': 'bg-indigo-100 text-indigo-800',
      'settings_changed': 'bg-gray-100 text-gray-800',
      'notification_sent': 'bg-pink-100 text-pink-800'
    };
    return colors[actionType] || 'bg-gray-100 text-gray-800';
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      action_type: '',
      date_from: '',
      date_to: '',
      user_id: '',
      search: ''
    });
  };

  const filteredLogs = activityLogs.filter(log => {
    if (filters.action_type && log.action_type !== filters.action_type) return false;
    if (filters.search && !log.description.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.user_id && log.user_id !== filters.user_id) return false;
    if (filters.date_from && new Date(log.created_at) < new Date(filters.date_from)) return false;
    if (filters.date_to && new Date(log.created_at) > new Date(filters.date_to)) return false;
    return true;
  });

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Aktivita školy</h3>
        {showFilters && (
          <Button 
            variant="secondary" 
            size="sm"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtry
          </Button>
        )}
      </div>

      {showFilters && showAdvancedFilters && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Typ akce</label>
              <select
                value={filters.action_type}
                onChange={(e) => handleFilterChange('action_type', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">Všechny akce</option>
                <option value="teacher_added">Přidání učitele</option>
                <option value="teacher_removed">Odebrání učitele</option>
                <option value="credits_used">Použití kreditů</option>
                <option value="credits_added">Přidání kreditů</option>
                <option value="settings_changed">Změna nastavení</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Od data</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => handleFilterChange('date_from', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Do data</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => handleFilterChange('date_to', e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hledat</label>
              <InputField
                label="Hledat"
                name="search"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Hledat v popisu..."
                className="w-full"
              />
            </div>
          </div>

          <div className="mt-3 flex justify-end">
            <Button variant="secondary" size="sm" onClick={clearFilters}>
              Vymazat filtry
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.slice(0, limit).map((log) => (
            <div key={log.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionTypeColor(log.action_type)}`}>
                      {getActionTypeLabel(log.action_type)}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(log.created_at).toLocaleString('cs-CZ')}
                    </span>
                  </div>
                  
                  <div className="mb-2">
                    <span className="font-medium text-gray-900">{log.school_name}</span>
                    {log.user_name && (
                      <span className="text-gray-600 ml-2">• {log.user_name}</span>
                    )}
                  </div>
                  
                  <p className="text-gray-700">{log.description}</p>
                  
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-2 text-xs text-gray-500">
                      <details>
                        <summary className="cursor-pointer hover:text-gray-700">
                          Zobrazit metadata
                        </summary>
                        <pre className="mt-1 bg-gray-100 p-2 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.metadata, null, 2)}
                        </pre>
                      </details>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {filteredLogs.length === 0 && (
            <div className="text-center py-8">
              <Activity className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">Žádné aktivity nebyly nalezeny</p>
            </div>
          )}

          {filteredLogs.length > limit && (
            <div className="text-center pt-4">
              <p className="text-sm text-gray-500">
                Zobrazeno {limit} z {filteredLogs.length} aktivit
              </p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

export default SchoolActivityLog;
