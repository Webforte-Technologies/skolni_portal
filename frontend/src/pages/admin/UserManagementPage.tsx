import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, Search, Plus, Trash2, Download, Filter,
  CheckCircle, XCircle, Edit, MoreHorizontal, Eye
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
  credits: number;
  school_id?: string;
  school_name?: string;
  created_at: string;
  last_login?: string;
}

const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    school: ''
  });
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  const { showToast } = useToast();

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        limit: pageSize.toString(),
        offset: (currentPage * pageSize).toString(),
        q: searchQuery
      });
      
      if (filters.role) queryParams.append('role', filters.role);
      if (filters.status) queryParams.append('is_active', filters.status === 'active' ? 'true' : 'false');
      if (filters.school) queryParams.append('school_id', filters.school);
      
      const res = await api.get<any>(`/admin/users?${queryParams.toString()}`);
      setUsers(res.data.data.data);
      setUsersTotal(res.data.data.total);
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při načítání uživatelů' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filters]);

  const totalPages = useMemo(() => Math.ceil(usersTotal / pageSize), [usersTotal]);

  const toggleUserSelection = (userId: string) => {
    const newSelection = new Set(selectedUsers);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedUsers(newSelection);
  };

  const selectAllUsers = () => {
    if (selectedUsers.size === users.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(users.map(u => u.id)));
    }
  };

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'addCredits' | 'delete') => {
    if (selectedUsers.size === 0) return;

    const affectedIds = Array.from(selectedUsers);

    try {
      if (action === 'delete') {
        if (!confirm(`Opravdu chcete smazat ${affectedIds.length} uživatelů?`)) return;
        
        await api.post('/admin/users/bulk', { 
          action: 'delete', 
          user_ids: affectedIds 
        });
        
        showToast({ 
          type: 'success', 
          message: `Smazáno ${affectedIds.length} uživatelů` 
        });
      } else if (action === 'addCredits') {
        const amountStr = prompt('Zadejte počet kreditů k přidání:');
        const amount = Number(amountStr);
        if (!amountStr || isNaN(amount) || amount <= 0) return;
        
        await api.post('/admin/users/bulk', { 
          action: 'addCredits', 
          user_ids: affectedIds, 
          amount 
        });
        
        showToast({ 
          type: 'success', 
          message: `Přidáno ${amount} kreditů ${affectedIds.length} uživatelům` 
        });
      } else {
        const newState = action === 'activate';
        await api.post('/admin/users/bulk', { 
          action: newState ? 'activate' : 'deactivate', 
          user_ids: affectedIds 
        });
        
        showToast({ 
          type: 'success', 
          message: `${newState ? 'Aktivováno' : 'Deaktivováno'} ${affectedIds.length} uživatelů` 
        });
      }

      setSelectedUsers(new Set());
      fetchUsers();
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při hromadné operaci' });
    }
  };

  const exportUsers = async () => {
    try {
      const res = await api.get('/admin/users/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showToast({ type: 'success', message: 'Export uživatelů byl stažen' });
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při exportu uživatelů' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Správa uživatelů</h1>
          <p className="text-gray-600 mt-1">Spravujte uživatele, role a oprávnění</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={exportUsers} variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => {/* Navigate to new user form */}} variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Nový uživatel
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <InputField
            name="search"
            label="Vyhledávání"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Jméno nebo email"
            icon={<Search className="w-4 h-4" />}
          />
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Role</label>
            <select 
              className="w-full border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.role}
              onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
            >
              <option value="">Všechny role</option>
              <option value="platform_admin">Platform Admin</option>
              <option value="school_admin">School Admin</option>
              <option value="teacher_school">Školní učitel</option>
              <option value="teacher_individual">Individuální učitel</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Stav</label>
            <select 
              className="w-full border border-gray-300 rounded-md p-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">Všechny stavy</option>
              <option value="active">Aktivní</option>
              <option value="inactive">Neaktivní</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button 
              onClick={() => { setCurrentPage(0); fetchUsers(); }} 
              isLoading={loading} 
              className="w-full"
            >
              <Search className="w-4 h-4 mr-2" />
              Hledat
            </Button>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedUsers.size > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-800">
              Vybráno {selectedUsers.size} uživatelů
            </span>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" onClick={() => handleBulkAction('activate')}>
                <CheckCircle className="w-4 h-4 mr-1" />
                Aktivovat
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleBulkAction('deactivate')}>
                <XCircle className="w-4 h-4 mr-1" />
                Deaktivovat
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleBulkAction('addCredits')}>
                <Plus className="w-4 h-4 mr-1" />
                Přidat kredity
              </Button>
              <Button size="sm" variant="danger" onClick={() => handleBulkAction('delete')}>
                <Trash2 className="w-4 h-4 mr-1" />
                Smazat
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Users Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input 
                    type="checkbox" 
                    checked={selectedUsers.size === users.length && users.length > 0}
                    onChange={selectAllUsers}
                    className="rounded border-gray-300 focus:ring-blue-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Jméno</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Email</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Role</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Škola</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Stav</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Kredity</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Poslední přihlášení</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Akce</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input 
                      type="checkbox" 
                      checked={selectedUsers.has(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                      className="rounded border-gray-300 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-700 text-sm font-medium">
                          {user.first_name[0]}{user.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{user.email}</td>
                  <td className="px-4 py-3">
                    <select 
                      className="bg-transparent border border-gray-300 rounded p-1 text-xs focus:ring-2 focus:ring-blue-500" 
                      value={user.role} 
                      onChange={async (e) => {
                        try {
                          await api.put(`/admin/users/${user.id}`, { role: e.target.value });
                          fetchUsers();
                          showToast({ type: 'success', message: 'Role byla změněna' });
                        } catch (error) {
                          showToast({ type: 'error', message: 'Chyba při změně role' });
                        }
                      }}
                    >
                      <option value="platform_admin">Platform Admin</option>
                      <option value="school_admin">School Admin</option>
                      <option value="teacher_school">Školní učitel</option>
                      <option value="teacher_individual">Individuální učitel</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {user.school_name || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <label className="inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only" 
                        checked={user.is_active} 
                        onChange={async () => {
                          try {
                            await api.put(`/admin/users/${user.id}`, { is_active: !user.is_active });
                            fetchUsers();
                            showToast({ 
                              type: 'success', 
                              message: `Uživatel ${!user.is_active ? 'aktivován' : 'deaktivován'}` 
                            });
                          } catch (error) {
                            showToast({ type: 'error', message: 'Chyba při změně stavu' });
                          }
                        }} 
                      />
                      <div className={`w-10 h-5 rounded-full transition ${user.is_active ? 'bg-green-500' : 'bg-gray-300'}`}>
                        <div className={`h-5 w-5 bg-white rounded-full shadow transform transition ${user.is_active ? 'translate-x-5' : ''}`}></div>
                      </div>
                    </label>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{user.credits}</span>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={async () => { 
                          const amount = Number(prompt('Přidat kredity:')); 
                          if (amount > 0) { 
                            try {
                              await api.post(`/admin/users/${user.id}/credits`, { type: 'add', amount }); 
                              fetchUsers();
                              showToast({ type: 'success', message: `Přidáno ${amount} kreditů` });
                            } catch (error) {
                              showToast({ type: 'error', message: 'Chyba při přidávání kreditů' });
                            }
                          }
                        }}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {user.last_login ? new Date(user.last_login).toLocaleDateString('cs-CZ') : 'Nikdy'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button size="sm" variant="secondary">
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="secondary">
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600">
            Zobrazeno {users.length} z {usersTotal} uživatelů
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="secondary" 
              disabled={currentPage <= 0} 
              onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            >
              Předchozí
            </Button>
            <span className="text-sm text-gray-600">
              {currentPage + 1} / {Math.max(1, totalPages)}
            </span>
            <Button 
              variant="secondary" 
              disabled={(currentPage + 1) >= totalPages} 
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Další
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default UserManagementPage;