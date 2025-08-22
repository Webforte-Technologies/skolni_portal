import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Plus, 
  Eye, 
  EyeOff, 
  Copy, 
  Edit, 
  Trash2, 
  RefreshCw, 
  Code, 
  Download, 
  Upload, 
  Settings,
  Globe,
  Activity,
  Users
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  permissions: string[];
  rateLimit: number;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  lastUsed?: Date;
  usageCount: number;
}

interface ApiEndpoint {
  path: string;
  method: string;
  description: string;
  rateLimit: number;
  isPublic: boolean;
  version: string;
  status: 'active' | 'deprecated' | 'beta';
}

const ApiManagementPage: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [endpoints, setEndpoints] = useState<ApiEndpoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddKey, setShowAddKey] = useState(false);
  const [editingKey, setEditingKey] = useState<ApiKey | null>(null);
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Simulate API call for API management data
    const fetchApiData = async () => {
      setLoading(true);
      setTimeout(() => {
        const mockApiKeys: ApiKey[] = [
          {
            id: '1',
            name: 'Frontend App',
            key: 'sk_live_1234567890abcdef',
            permissions: ['read:materials', 'write:materials', 'read:users'],
            rateLimit: 1000,
            isActive: true,
            createdBy: 'admin1',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
            lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 2),
            usageCount: 15420
          },
          {
            id: '2',
            name: 'Mobile App',
            key: 'sk_live_0987654321fedcba',
            permissions: ['read:materials', 'read:users'],
            rateLimit: 500,
            isActive: true,
            createdBy: 'admin2',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 15),
            lastUsed: new Date(Date.now() - 1000 * 60 * 60 * 6),
            usageCount: 8920
          },
          {
            id: '3',
            name: 'Third Party Integration',
            key: 'sk_live_abcdef1234567890',
            permissions: ['read:materials'],
            rateLimit: 100,
            isActive: false,
            createdBy: 'admin1',
            createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60),
            usageCount: 0
          }
        ];

        const mockEndpoints: ApiEndpoint[] = [
          {
            path: '/api/materials',
            method: 'GET',
            description: 'Získání seznamu materiálů',
            rateLimit: 100,
            isPublic: true,
            version: 'v1',
            status: 'active'
          },
          {
            path: '/api/materials',
            method: 'POST',
            description: 'Vytvoření nového materiálu',
            rateLimit: 50,
            isPublic: false,
            version: 'v1',
            status: 'active'
          },
          {
            path: '/api/materials/:id',
            method: 'GET',
            description: 'Získání konkrétního materiálu',
            rateLimit: 200,
            isPublic: true,
            version: 'v1',
            status: 'active'
          },
          {
            path: '/api/ai/generate',
            method: 'POST',
            description: 'Generování AI obsahu',
            rateLimit: 20,
            isPublic: false,
            version: 'v1',
            status: 'beta'
          },
          {
            path: '/api/users/profile',
            method: 'GET',
            description: 'Získání profilu uživatele',
            rateLimit: 100,
            isPublic: false,
            version: 'v1',
            status: 'active'
          }
        ];

        setApiKeys(mockApiKeys);
        setEndpoints(mockEndpoints);
        setLoading(false);
      }, 1000);
    };

    fetchApiData();
  }, []);

  const toggleKeyVisibility = (id: string) => {
    setShowKeys(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const toggleKeyStatus = (id: string) => {
    setApiKeys(prev => prev.map(key => 
      key.id === id ? { ...key, isActive: !key.isActive } : key
    ));
  };

  const deleteKey = (id: string) => {
    setApiKeys(prev => prev.filter(key => key.id !== id));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'beta':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'deprecated':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktivní';
      case 'beta':
        return 'Beta';
      case 'deprecated':
        return 'Zastaralé';
      default:
        return status;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'POST':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PUT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'DELETE':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredKeys = apiKeys.filter(key =>
    searchQuery === '' || 
    key.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    key.createdBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg text-gray-600">Načítání API dat...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">API Management</h1>
          <p className="text-gray-600 mt-2">
            Správa API klíčů, endpointů a oprávnění
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Code className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Key className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold">API klíče</h3>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {apiKeys.length}
            </div>
            <p className="text-sm text-gray-600">Celkem vytvořených klíčů</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Activity className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold">Aktivní klíče</h3>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-2">
              {apiKeys.filter(k => k.isActive).length}
            </div>
            <p className="text-sm text-gray-600">Aktuálně aktivní</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold">Endpointy</h3>
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {endpoints.length}
            </div>
            <p className="text-sm text-gray-600">Dostupné API endpointy</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold">Celkem požadavků</h3>
            </div>
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {apiKeys.reduce((sum, key) => sum + key.usageCount, 0).toLocaleString()}
            </div>
            <p className="text-sm text-gray-600">Za celou dobu</p>
          </div>
        </Card>
      </div>

      {/* API Keys Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">API Klíče</h2>
          <Button onClick={() => setShowAddKey(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Nový API klíč
          </Button>
        </div>

        {/* Search */}
        <Card className="mb-6">
          <div className="p-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Hledat v API klíčích..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>
        </Card>

        {/* API Keys List */}
        <Card>
          <div className="border-b border-neutral-200 px-6 py-4">
            <h3 className="text-lg font-medium">Seznam API klíčů</h3>
          </div>
          <div className="p-6">
            {filteredKeys.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Key className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Žádné API klíče nenalezeny</p>
                <p className="text-sm">Zkuste upravit hledaný výraz</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredKeys.map((key) => (
                  <div key={key.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center space-x-3">
                          <h4 className="font-medium text-lg">{key.name}</h4>
                          <Badge 
                            variant="outline" 
                            className={key.isActive ? 'bg-green-100 text-green-800 border-green-200' : 'bg-gray-100 text-gray-800 border-gray-200'}
                          >
                            {key.isActive ? 'Aktivní' : 'Neaktivní'}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Rate Limit:</span> {key.rateLimit}/min
                          </div>
                          <div>
                            <span className="font-medium">Vytvořil:</span> {key.createdBy}
                          </div>
                          <div>
                            <span className="font-medium">Vytvořeno:</span> {key.createdAt.toLocaleDateString('cs-CZ')}
                          </div>
                          {key.lastUsed && (
                            <div>
                              <span className="font-medium">Poslední použití:</span> {key.lastUsed.toLocaleString('cs-CZ')}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Počet požadavků:</span> {key.usageCount.toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="font-medium text-sm">Oprávnění:</div>
                          <div className="flex flex-wrap gap-2">
                            {key.permissions.map((permission, index) => (
                              <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                {permission}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <div className="font-medium text-sm">API klíč:</div>
                          <div className="flex items-center space-x-2">
                            <Input
                              type={showKeys[key.id] ? 'text' : 'password'}
                              value={key.key}
                              readOnly
                              className="font-mono text-sm"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleKeyVisibility(key.id)}
                            >
                              {showKeys[key.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(key.key)}
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              Kopírovat
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleKeyStatus(key.id)}
                        >
                          {key.isActive ? 'Deaktivovat' : 'Aktivovat'}
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingKey(key)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Upravit
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteKey(key.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Smazat
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* API Endpoints Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">API Endpointy</h2>
        
        <Card>
          <div className="border-b border-neutral-200 px-6 py-4">
            <h3 className="text-lg font-medium">Dostupné endpointy</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {endpoints.map((endpoint, index) => (
                <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline" className={getMethodColor(endpoint.method)}>
                          {endpoint.method}
                        </Badge>
                        <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                          {endpoint.path}
                        </code>
                        <Badge variant="outline" className={getStatusColor(endpoint.status)}>
                          {getStatusLabel(endpoint.status)}
                        </Badge>
                        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200">
                          {endpoint.version}
                        </Badge>
                      </div>
                      
                      <p className="text-gray-600">{endpoint.description}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Rate Limit: {endpoint.rateLimit}/min</span>
                        <span>Veřejný: {endpoint.isPublic ? 'Ano' : 'Ne'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Documentation */}
      <Card>
        <div className="border-b border-neutral-200 px-6 py-4">
          <h3 className="text-lg font-medium">API Dokumentace</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Download className="w-5 h-5 text-blue-600" />
                <div>
                  <h4 className="font-medium">OpenAPI Specifikace</h4>
                  <p className="text-sm text-gray-600">Stáhněte si kompletní OpenAPI 3.0 specifikaci</p>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-1" />
                  Stáhnout
                </Button>
              </div>
              
              <div className="flex items-center space-x-3">
                <Upload className="w-5 h-5 text-green-600" />
                <div>
                  <h4 className="font-medium">Postman Collection</h4>
                  <p className="text-sm text-gray-600">Importujte si Postman kolekci pro testování</p>
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="w-4 h-4 mr-1" />
                  Import
                </Button>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Settings className="w-5 h-5 text-purple-600" />
                <div>
                  <h4 className="font-medium">SDK a knihovny</h4>
                  <p className="text-sm text-gray-600">Dostupné SDK pro různé programovací jazyky</p>
                </div>
                <Button variant="outline" size="sm">
                  Zobrazit
                </Button>
              </div>
              
              <div className="flex items-center space-x-3">
                <Code className="w-5 h-5 text-orange-600" />
                <div>
                  <h4 className="font-medium">Příklady kódu</h4>
                  <p className="text-sm text-gray-600">Ukázky implementace v různých jazycích</p>
                </div>
                <Button variant="outline" size="sm">
                  Zobrazit
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Add API Key Modal */}
      <Modal 
        isOpen={showAddKey} 
        onClose={() => setShowAddKey(false)} 
        title="Nový API klíč"
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Název klíče
            </label>
            <Input
              type="text"
              placeholder="Např. Frontend App"
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Oprávnění
            </label>
            <div className="space-y-2">
              {['read:materials', 'write:materials', 'read:users', 'write:users'].map((permission) => (
                <label key={permission} className="flex items-center space-x-2">
                  <input type="checkbox" className="rounded border-gray-300" />
                  <span className="text-sm text-gray-700">{permission}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rate Limit (požadavků/min)
            </label>
            <Input
              type="number"
              placeholder="1000"
              className="w-full"
            />
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowAddKey(false)}>
              Zrušit
            </Button>
            <Button onClick={() => {
              // TODO: Implement API key creation
              setShowAddKey(false);
            }}>
              Vytvořit klíč
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit API Key Modal */}
      <Modal 
        isOpen={!!editingKey} 
        onClose={() => setEditingKey(null)} 
        title="Upravit API klíč"
        size="lg"
      >
        {editingKey && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Název klíče
              </label>
              <Input
                type="text"
                defaultValue={editingKey.name}
                className="w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Oprávnění
              </label>
              <div className="space-y-2">
                {['read:materials', 'write:materials', 'read:users', 'write:users'].map((permission) => (
                  <label key={permission} className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      className="rounded border-gray-300"
                      defaultChecked={editingKey.permissions.includes(permission)}
                    />
                    <span className="text-sm text-gray-700">{permission}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rate Limit (požadavků/min)
              </label>
              <Input
                type="number"
                defaultValue={editingKey.rateLimit}
                className="w-full"
              />
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setEditingKey(null)}>
                Zrušit
              </Button>
              <Button onClick={() => {
                // TODO: Implement API key update
                setEditingKey(null);
              }}>
                Uložit změny
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ApiManagementPage;
