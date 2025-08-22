import React, { useState, useEffect, useCallback } from 'react';
import { 
  Code, Flag, Database, TestTube, BookOpen, 
  Plus, Edit, Trash2, ToggleLeft, ToggleRight,
  Activity, Zap, Settings, Eye, Download
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';

interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  key: string;
  is_enabled: boolean;
  rollout_percentage: number;
  target_users: string[];
  target_schools: string[];
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface ApiEndpoint {
  method: string;
  path: string;
  description: string;
  response_time_avg: number;
  request_count: number;
  error_rate: number;
  last_used: string;
}

const DeveloperToolsPage: React.FC = () => {
  const [featureFlags, setFeatureFlags] = useState<FeatureFlag[]>([]);
  const [apiEndpoints, setApiEndpoints] = useState<ApiEndpoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateFlag, setShowCreateFlag] = useState(false);
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);

  const { showToast } = useToast();

  const fetchFeatureFlags = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get<any>('/admin/dev/feature-flags');
      setFeatureFlags(res.data.data || []);
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při načítání feature flagů' });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const fetchApiEndpoints = useCallback(async () => {
    try {
      const res = await api.get<any>('/admin/dev/api/endpoints');
      setApiEndpoints(res.data.data || []);
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při načítání API endpointů' });
    }
  }, [showToast]);

  useEffect(() => {
    fetchFeatureFlags();
    fetchApiEndpoints();
  }, [fetchFeatureFlags, fetchApiEndpoints]);

  const toggleFeatureFlag = async (flagId: string, enabled: boolean) => {
    try {
      await api.put(`/admin/dev/feature-flags/${flagId}`, {
        is_enabled: enabled
      });
      
      setFeatureFlags(prev => prev.map(flag => 
        flag.id === flagId ? { ...flag, is_enabled: enabled } : flag
      ));
      
      showToast({ 
        type: 'success', 
        message: `Feature flag ${enabled ? 'aktivován' : 'deaktivován'}` 
      });
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při změně feature flagu' });
    }
  };

  const deleteFeatureFlag = async (flagId: string) => {
    if (!confirm('Opravdu chcete smazat tento feature flag?')) return;
    
    try {
      await api.delete(`/admin/dev/feature-flags/${flagId}`);
      setFeatureFlags(prev => prev.filter(flag => flag.id !== flagId));
      showToast({ type: 'success', message: 'Feature flag byl smazán' });
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při mazání feature flagu' });
    }
  };

  const getMethodColor = (method: string) => {
    const colorMap: Record<string, string> = {
      'GET': 'bg-green-100 text-green-800',
      'POST': 'bg-blue-100 text-blue-800',
      'PUT': 'bg-yellow-100 text-yellow-800',
      'DELETE': 'bg-red-100 text-red-800',
      'PATCH': 'bg-purple-100 text-purple-800'
    };
    return colorMap[method] || 'bg-gray-100 text-gray-800';
  };

  const getPerformanceColor = (responseTime: number) => {
    if (responseTime < 100) return 'text-green-600';
    if (responseTime < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getErrorRateColor = (errorRate: number) => {
    if (errorRate < 1) return 'text-green-600';
    if (errorRate < 5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Vývojářské nástroje</h1>
          <p className="text-gray-600 mt-1">Správa feature flagů, API a vývojářských nástrojů</p>
        </div>
        <Button variant="primary" onClick={() => setShowCreateFlag(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nový feature flag
        </Button>
      </div>

      {/* Feature Flags Section */}
      <Card title="Feature Flagy" icon={<Flag className="w-5 h-5" />}>
        <div className="space-y-4">
          {loading && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Načítání feature flagů...</p>
            </div>
          )}
          
          {!loading && featureFlags.map((flag) => (
            <div key={flag.id} className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-gray-900">{flag.name}</h3>
                    <span className="text-sm text-gray-500">#{flag.key}</span>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      flag.is_enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {flag.is_enabled ? 'Aktivní' : 'Neaktivní'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{flag.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Rollout:</span>
                      <span className="ml-2 font-medium">{flag.rollout_percentage}%</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Vytvořil:</span>
                      <span className="ml-2 font-medium">{flag.created_by}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Aktualizováno:</span>
                      <span className="ml-2 font-medium">
                        {new Date(flag.updated_at).toLocaleDateString('cs-CZ')}
                      </span>
                    </div>
                  </div>
                  
                  {flag.target_users.length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm text-gray-500">Cíloví uživatelé:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {flag.target_users.map((user, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            {user}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {flag.target_schools.length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm text-gray-500">Cílové školy:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {flag.target_schools.map((school, index) => (
                          <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                            {school}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <Button
                    size="sm"
                    variant={flag.is_enabled ? "danger" : "primary"}
                    onClick={() => toggleFeatureFlag(flag.id, !flag.is_enabled)}
                  >
                    {flag.is_enabled ? (
                      <>
                        <ToggleLeft className="w-4 h-4 mr-1" />
                        Deaktivovat
                      </>
                    ) : (
                      <>
                        <ToggleRight className="w-4 h-4 mr-1" />
                        Aktivovat
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="secondary"
                    onClick={() => setSelectedFlag(flag)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  
                  <Button 
                    size="sm" 
                    variant="danger"
                    onClick={() => deleteFeatureFlag(flag.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          
          {!loading && featureFlags.length === 0 && (
            <div className="text-center py-8">
              <Flag className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné feature flagy</h3>
              <p className="text-gray-500">Zatím nejsou vytvořeny žádné feature flagy.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Create/Edit Feature Flag Modal */}
      {showCreateFlag && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {selectedFlag ? 'Upravit feature flag' : 'Nový feature flag'}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Název</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Název feature flagu"
                  defaultValue={selectedFlag?.name || ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Klíč</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="feature_flag_key"
                  defaultValue={selectedFlag?.key || ''}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Popis</label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Popis účelu feature flagu"
                  defaultValue={selectedFlag?.description || ''}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowCreateFlag(false);
                  setSelectedFlag(null);
                }}
              >
                Zrušit
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  // TODO: Implement create/edit functionality
                  showToast({ type: 'info', message: 'Funkce bude implementována' });
                  setShowCreateFlag(false);
                  setSelectedFlag(null);
                }}
              >
                {selectedFlag ? 'Uložit' : 'Vytvořit'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* API Management Section */}
      <Card title="API Management" icon={<Database className="w-5 h-5" />}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900">API Endpointy</h3>
            <p className="text-sm text-gray-500">Přehled a monitoring API endpointů</p>
          </div>
          <Button variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Export API docs
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Metoda</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Cesta</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Popis</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Odezva</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Požadavky</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Chybovost</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Poslední použití</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {apiEndpoints.map((endpoint, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getMethodColor(endpoint.method)}`}>
                      {endpoint.method}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono">
                      {endpoint.path}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">{endpoint.description}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${getPerformanceColor(endpoint.response_time_avg)}`}>
                      {endpoint.response_time_avg}ms
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {endpoint.request_count.toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-sm font-medium ${getErrorRateColor(endpoint.error_rate)}`}>
                      {endpoint.error_rate.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-500">
                      {new Date(endpoint.last_used).toLocaleDateString('cs-CZ')}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Testing Tools Section */}
      <Card title="Testovací nástroje" icon={<TestTube className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button 
            variant="secondary" 
            className="h-20 flex flex-col items-center justify-center gap-2"
            onClick={() => {
              // Implement API testing tool
              showToast({ type: 'info', message: 'API testovací nástroj bude implementován' });
            }}
          >
            <Database className="w-6 h-6" />
            <span>API Tester</span>
          </Button>
          
          <Button 
            variant="secondary" 
            className="h-20 flex flex-col items-center justify-center gap-2"
            onClick={() => {
              // Implement performance testing
              showToast({ type: 'info', message: 'Performance testy budou implementovány' });
            }}
          >
            <Activity className="w-6 h-6" />
            <span>Performance Testy</span>
          </Button>
          
          <Button 
            variant="secondary" 
            className="h-20 flex flex-col items-center justify-center gap-2"
            onClick={() => {
              // Implement load testing
              showToast({ type: 'info', message: 'Load testy budou implementovány' });
            }}
          >
            <Zap className="w-6 h-6" />
            <span>Load Testy</span>
          </Button>
          
          <Button 
            variant="secondary" 
            className="h-20 flex flex-col items-center justify-center gap-2"
            onClick={() => {
              // Implement database testing
              showToast({ type: 'info', message: 'Databázové testy budou implementovány' });
            }}
          >
            <Database className="w-6 h-6" />
            <span>DB Testy</span>
          </Button>
          
          <Button 
            variant="secondary" 
            className="h-20 flex flex-col items-center justify-center gap-2"
            onClick={() => {
              // Implement integration testing
              showToast({ type: 'info', message: 'Integrační testy budou implementovány' });
            }}
          >
            <TestTube className="w-6 h-6" />
            <span>Integrační testy</span>
          </Button>
          
          <Button 
            variant="secondary" 
            className="h-20 flex flex-col items-center justify-center gap-2"
            onClick={() => {
              // Implement E2E testing
              showToast({ type: 'info', message: 'E2E testy budou implementovány' });
            }}
          >
            <Eye className="w-6 h-6" />
            <span>E2E Testy</span>
          </Button>
        </div>
      </Card>

      {/* Documentation Section */}
      <Card title="Dokumentace" icon={<BookOpen className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">API Dokumentace</h3>
            <div className="space-y-3">
              <Button variant="secondary" className="w-full justify-start">
                <Database className="w-4 h-4 mr-2" />
                REST API Reference
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <Code className="w-4 h-4 mr-2" />
                SDK Dokumentace
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <TestTube className="w-4 h-4 mr-2" />
                Testovací příklady
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Vývojářské dokumenty</h3>
            <div className="space-y-3">
              <Button variant="secondary" className="w-full justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Konfigurace systému
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <Flag className="w-4 h-4 mr-2" />
                Feature Flag Guide
              </Button>
              <Button variant="secondary" className="w-full justify-start">
                <Activity className="w-4 h-4 mr-2" />
                Monitoring & Logs
              </Button>
            </div>
          </div>
        </div>
      </Card>
      </div>
    </AdminLayout>
  );
};

export default DeveloperToolsPage;
