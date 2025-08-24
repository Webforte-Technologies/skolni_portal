import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, Plus, Edit, Trash2, Users, Settings, 
  CheckCircle, XCircle, Eye, Lock, X
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  is_granted: boolean;
}

interface Role {
  id: string;
  name: string;
  display_name: string;
  description: string;
  user_count: number;
  permissions: Permission[];
  is_system: boolean;
  created_at: string;
}

const RolesPermissionsPage: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const { showToast } = useToast();

  const fetchRoles = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<any>('/admin/roles');
      setRoles(res.data.data || []);
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při načítání rolí' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchPermissions = useCallback(async () => {
    try {
      const res = await api.get<any>('/admin/permissions');
      setPermissions(res.data.data || []);
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při načítání oprávnění' });
    }
  }, [showToast]);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, [fetchRoles, fetchPermissions]);

  const getRoleColor = (roleName: string) => {
    const colorMap: Record<string, string> = {
      'platform_admin': 'bg-red-100 text-red-800',
      'school_admin': 'bg-orange-100 text-orange-800',
      'teacher_school': 'bg-blue-100 text-blue-800',
      'teacher_individual': 'bg-green-100 text-green-800'
    };
    return colorMap[roleName] || 'bg-gray-100 text-gray-800';
  };

  const getRoleIcon = (roleName: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'platform_admin': <Shield className="w-5 h-5" />,
      'school_admin': <Settings className="w-5 h-5" />,
      'teacher_school': <Users className="w-5 h-5" />,
      'teacher_individual': <Users className="w-5 h-5" />
    };
    return iconMap[roleName] || <Shield className="w-5 h-5" />;
  };

  const handlePermissionToggle = async (roleId: string, permissionId: string, granted: boolean) => {
    try {
      await api.put(`/admin/roles/${roleId}/permissions/${permissionId}`, {
        is_granted: granted
      });
      
      // Update local state
      setRoles(prev => prev.map(role => {
        if (role.id === roleId) {
          return {
            ...role,
            permissions: role.permissions.map(perm => 
              perm.id === permissionId ? { ...perm, is_granted: granted } : perm
            )
          };
        }
        return role;
      }));

      showToast({ 
        type: 'success', 
        message: `Oprávnění ${granted ? 'uděleno' : 'odebráno'}` 
      });
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při změně oprávnění' });
    }
  };

  const groupedPermissions = permissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, Permission[]>);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Role a oprávnění</h1>
          <p className="text-gray-600 mt-1">Spravujte role uživatelů a jejich oprávnění</p>
        </div>
        <Button variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Nová role
        </Button>
      </div>

      {/* Roles Overview */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, index) => (
            <Card key={index} className="animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded mb-4"></div>
              <div className="flex items-center justify-between">
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="flex gap-2">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role) => (
            <Card key={role.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedRole(role)}>
              <div className="flex items-center gap-3 mb-4">
                <div className={`p-3 rounded-lg ${getRoleColor(role.name)}`}>
                  {getRoleIcon(role.name)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{role.display_name}</h3>
                  <p className="text-sm text-gray-500">{role.user_count} uživatelů</p>
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">{role.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {role.is_system ? 'Systémová role' : 'Vlastní role'}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="secondary">
                    <Eye className="w-4 h-4" />
                  </Button>
                  {!role.is_system && (
                    <>
                      <Button 
                        size="sm" 
                        variant="secondary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingRole(role);
                          setShowEditModal(true);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="danger">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
      {/* Permissions Matrix */}
      {selectedRole && (
        <Card>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Oprávnění pro roli: {selectedRole.display_name}
              </h2>
              <p className="text-gray-600 mt-1">
                {selectedRole.user_count} uživatelů má tuto roli
              </p>
            </div>
            <Button variant="secondary" onClick={() => setSelectedRole(null)}>
              Zavřít
            </Button>
          </div>

          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
              <div key={category}>
                <h3 className="font-medium text-gray-900 mb-3 text-lg">
                  {(() => {
                    if (category === 'user_management') return 'Správa uživatelů';
                    if (category === 'content_management') return 'Správa obsahu';
                    if (category === 'system_administration') return 'Správa systému';
                    if (category === 'financial_management') return 'Finanční správa';
                    return category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ');
                  })()}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categoryPermissions.map((permission) => {
                    const isGranted = selectedRole.permissions.find(p => p.id === permission.id)?.is_granted || false;
                    
                    return (
                      <div key={permission.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">{permission.name}</div>
                          <div className="text-xs text-gray-500">{permission.description}</div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isGranted ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {isGranted ? 'Uděleno' : 'Odebráno'}
                          </span>
                          
                          <Button
                            size="sm"
                            variant={isGranted ? "secondary" : "primary"}
                            onClick={() => handlePermissionToggle(selectedRole.id, permission.id, !isGranted)}
                            disabled={selectedRole.is_system}
                          >
                            {isGranted ? (
                              <>
                                <XCircle className="w-4 h-4 mr-1" />
                                Odebrat
                              </>
                            ) : (
                              <>
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Udělit
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {selectedRole.is_system && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                <span className="text-sm text-blue-800">
                  Tato role je systémová a nelze upravovat její oprávnění
                </span>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* All Permissions List */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Všechna oprávnění</h2>
          <Button variant="secondary">
            <Plus className="w-4 h-4 mr-2" />
            Nové oprávnění
          </Button>
        </div>

        <div className="space-y-4">
          {Object.entries(groupedPermissions).map(([category, categoryPermissions]) => (
            <div key={category} className="border border-gray-200 rounded-lg">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">
                  {(() => {
                    if (category === 'user_management') return 'Správa uživatelů';
                    if (category === 'content_management') return 'Správa obsahu';
                    if (category === 'system_administration') return 'Správa systému';
                    if (category === 'financial_management') return 'Finanční správa';
                    return category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' ');
                  })()}
                </h3>
              </div>
              
              <div className="divide-y divide-gray-200">
                {categoryPermissions.map((permission) => (
                  <div key={permission.id} className="px-4 py-3 flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900">{permission.name}</div>
                      <div className="text-sm text-gray-500">{permission.description}</div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">{permission.id}</span>
                      <Button size="sm" variant="secondary">
                        <Edit className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Edit Role Modal */}
      {showEditModal && editingRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upravit roli</h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingRole(null);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Název role
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={editingRole.display_name}
                  onChange={(e) => setEditingRole({
                    ...editingRole,
                    display_name: e.target.value
                  })}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Popis
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  value={editingRole.description}
                  onChange={(e) => setEditingRole({
                    ...editingRole,
                    description: e.target.value
                  })}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowEditModal(false);
                  setEditingRole(null);
                }}
              >
                Zrušit
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  // TODO: Implement role update API call
                  showToast({ type: 'success', message: 'Role byla aktualizována' });
                  setShowEditModal(false);
                  setEditingRole(null);
                }}
              >
                Uložit
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  );
};

export default RolesPermissionsPage;
