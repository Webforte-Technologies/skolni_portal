import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Database, Server, Shield, Bell, Users, Key, Eye, EyeOff } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card, Button, Badge, Input } from '../../components/ui';


interface SystemConfig {
  id: string;
  category: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  description: string;
  defaultValue: string;
  isSensitive: boolean;
  isRequired: boolean;
  options?: string[];
  lastModified: Date;
  modifiedBy: string;
}

const SystemConfigPage: React.FC = () => {
  const [configs, setConfigs] = useState<SystemConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingConfigs, setEditingConfigs] = useState<Record<string, string>>({});
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Simulate API call for system configuration data
    const fetchConfigData = async () => {
      setLoading(true);
      setTimeout(() => {
        const mockConfigs: SystemConfig[] = [
          {
            id: '1',
            category: 'Database',
            key: 'DB_CONNECTION_STRING',
            value: 'postgresql://user:pass@localhost:5432/eduaidb',
            type: 'string',
            description: 'Databázové připojení pro PostgreSQL',
            defaultValue: 'postgresql://user:pass@localhost:5432/eduaidb',
            isSensitive: true,
            isRequired: true,
            lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24),
            modifiedBy: 'admin1'
          },
          {
            id: '2',
            category: 'Database',
            key: 'DB_POOL_SIZE',
            value: '20',
            type: 'number',
            description: 'Velikost poolu databázových připojení',
            defaultValue: '10',
            isSensitive: false,
            isRequired: true,
            lastModified: new Date(Date.now() - 1000 * 60 * 60 * 48),
            modifiedBy: 'admin2'
          },
          {
            id: '3',
            category: 'API',
            key: 'OPENAI_API_KEY',
            value: 'sk-...',
            type: 'string',
            description: 'API klíč pro OpenAI služby',
            defaultValue: '',
            isSensitive: true,
            isRequired: true,
            lastModified: new Date(Date.now() - 1000 * 60 * 60 * 72),
            modifiedBy: 'admin1'
          },
          {
            id: '4',
            category: 'API',
            key: 'GEMINI_API_KEY',
            value: 'AIza...',
            type: 'string',
            description: 'API klíč pro Google Gemini služby',
            defaultValue: '',
            isSensitive: true,
            isRequired: false,
            lastModified: new Date(Date.now() - 1000 * 60 * 60 * 96),
            modifiedBy: 'admin1'
          },
          {
            id: '5',
            category: 'Security',
            key: 'JWT_SECRET',
            value: 'super-secret-jwt-key-2024',
            type: 'string',
            description: 'Tajný klíč pro JWT tokeny',
            defaultValue: 'default-jwt-secret',
            isSensitive: true,
            isRequired: true,
            lastModified: new Date(Date.now() - 1000 * 60 * 60 * 120),
            modifiedBy: 'admin1'
          },
          {
            id: '6',
            category: 'Security',
            key: 'PASSWORD_MIN_LENGTH',
            value: '8',
            type: 'number',
            description: 'Minimální délka hesla',
            defaultValue: '6',
            isSensitive: false,
            isRequired: true,
            lastModified: new Date(Date.now() - 1000 * 60 * 60 * 144),
            modifiedBy: 'admin2'
          },
          {
            id: '7',
            category: 'Security',
            key: 'ENABLE_2FA',
            value: 'true',
            type: 'boolean',
            description: 'Povolit dvoufaktorovou autentifikaci',
            defaultValue: 'false',
            isSensitive: false,
            isRequired: false,
            lastModified: new Date(Date.now() - 1000 * 60 * 60 * 168),
            modifiedBy: 'admin1'
          },
          {
            id: '8',
            category: 'Email',
            key: 'SMTP_HOST',
            value: 'smtp.gmail.com',
            type: 'string',
            description: 'SMTP server pro odesílání emailů',
            defaultValue: 'localhost',
            isSensitive: false,
            isRequired: true,
            lastModified: new Date(Date.now() - 1000 * 60 * 60 * 192),
            modifiedBy: 'admin2'
          },
          {
            id: '9',
            category: 'Email',
            key: 'SMTP_PORT',
            value: '587',
            type: 'number',
            description: 'Port SMTP serveru',
            defaultValue: '25',
            isSensitive: false,
            isRequired: true,
            lastModified: new Date(Date.now() - 1000 * 60 * 60 * 216),
            modifiedBy: 'admin2'
          },
          {
            id: '10',
            category: 'Email',
            key: 'SMTP_USERNAME',
            value: 'noreply@eduaiportal.cz',
            type: 'string',
            description: 'Uživatelské jméno pro SMTP',
            defaultValue: '',
            isSensitive: true,
            isRequired: true,
            lastModified: new Date(Date.now() - 1000 * 60 * 60 * 240),
            modifiedBy: 'admin1'
          },
          {
            id: '11',
            category: 'System',
            key: 'MAX_FILE_SIZE',
            value: '10485760',
            type: 'number',
            description: 'Maximální velikost souboru v bytech (10MB)',
            defaultValue: '5242880',
            isSensitive: false,
            isRequired: true,
            lastModified: new Date(Date.now() - 1000 * 60 * 60 * 264),
            modifiedBy: 'admin2'
          },
          {
            id: '12',
            category: 'System',
            key: 'ENVIRONMENT',
            value: 'production',
            type: 'select',
            description: 'Prostředí aplikace',
            defaultValue: 'development',
            isSensitive: false,
            isRequired: true,
            options: ['development', 'staging', 'production'],
            lastModified: new Date(Date.now() - 1000 * 60 * 60 * 288),
            modifiedBy: 'admin1'
          },
          {
            id: '13',
            category: 'System',
            key: 'LOG_LEVEL',
            value: 'info',
            type: 'select',
            description: 'Úroveň logování',
            defaultValue: 'warn',
            isSensitive: false,
            isRequired: true,
            options: ['debug', 'info', 'warn', 'error'],
            lastModified: new Date(Date.now() - 1000 * 60 * 60 * 312),
            modifiedBy: 'admin2'
          },
          {
            id: '14',
            category: 'Limits',
            key: 'MAX_CREDITS_PER_MONTH',
            value: '1000',
            type: 'number',
            description: 'Maximální počet kreditů na měsíc pro školy',
            defaultValue: '500',
            isSensitive: false,
            isRequired: true,
            lastModified: new Date(Date.now() - 1000 * 60 * 60 * 336),
            modifiedBy: 'admin1'
          },
          {
            id: '15',
            category: 'Limits',
            key: 'MAX_MATERIALS_PER_USER',
            value: '100',
            type: 'number',
            description: 'Maximální počet materiálů na uživatele',
            defaultValue: '50',
            isSensitive: false,
            isRequired: true,
            lastModified: new Date(Date.now() - 1000 * 60 * 60 * 360),
            modifiedBy: 'admin2'
          }
        ];
        setConfigs(mockConfigs);
        setLoading(false);
      }, 1000);
    };

    fetchConfigData();
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Database':
        return <Database className="w-5 h-5" />;
      case 'API':
        return <Key className="w-5 h-5" />;
      case 'Security':
        return <Shield className="w-5 h-5" />;
      case 'Email':
        return <Bell className="w-5 h-5" />;
      case 'System':
        return <Server className="w-5 h-5" />;
      case 'Limits':
        return <Users className="w-5 h-5" />;
      default:
        return <Settings className="w-5 h-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Database':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'API':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'Security':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Email':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'System':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'Limits':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('cs-CZ');
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' });
  };

  const handleConfigChange = (id: string, value: string) => {
    setEditingConfigs(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const toggleSensitiveVisibility = (id: string) => {
    setShowSensitive(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const saveConfig = async (id: string) => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setConfigs(prev => 
        prev.map(config => 
          config.id === id 
            ? { 
                ...config, 
                value: editingConfigs[id], 
                lastModified: new Date(), 
                modifiedBy: 'current_admin' 
              }
            : config
        )
      );
      setEditingConfigs(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      setSaving(false);
    }, 1000);
  };

  const resetConfig = (id: string) => {
    const config = configs.find(c => c.id === id);
    if (config) {
      setEditingConfigs(prev => ({
        ...prev,
        [id]: config.defaultValue
      }));
    }
  };

  const saveAllChanges = async () => {
    setSaving(true);
    // Simulate API call for all changes
    setTimeout(() => {
      setConfigs(prev => 
        prev.map(config => 
          editingConfigs[config.id] 
            ? { 
                ...config, 
                value: editingConfigs[config.id], 
                lastModified: new Date(), 
                modifiedBy: 'current_admin' 
              }
            : config
        )
      );
      setEditingConfigs({});
      setSaving(false);
    }, 2000);
  };

  const filteredConfigs = configs.filter(config => {
    const matchesSearch = searchQuery === '' || 
      config.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      config.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || config.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const hasUnsavedChanges = Object.keys(editingConfigs).length > 0;
  const categories = Array.from(new Set(configs.map(config => config.category)));

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Načítání konfigurace...</div>
        </div>
      </AdminLayout>
      );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Konfigurace systému</h1>
            <p className="text-gray-600">Správa systémových nastavení a konfiguračních hodnot</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            {hasUnsavedChanges && (
              <Button
                onClick={saveAllChanges}
                disabled={saving}
                className="flex items-center space-x-2"
              >
                {saving ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Uložit všechny změny</span>
              </Button>
            )}
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Celkem nastavení</p>
                <p className="text-2xl font-bold text-blue-600">{configs.length}</p>
              </div>
              <Settings className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kategorie</p>
                <p className="text-2xl font-bold text-green-600">{categories.length}</p>
              </div>
              <Database className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Citlivá nastavení</p>
                <p className="text-2xl font-bold text-red-600">
                  {configs.filter(config => config.isSensitive).length}
                </p>
              </div>
              <Shield className="w-8 h-8 text-red-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nezachycené změny</p>
                <p className="text-2xl font-bold text-orange-600">
                  {Object.keys(editingConfigs).length}
                </p>
              </div>
              <RefreshCw className="w-8 h-8 text-orange-600" />
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-wrap items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Settings className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filtry:</span>
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Všechny kategorie</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            <div className="relative">
              <Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Hledat v konfiguraci..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full lg:w-80"
              />
            </div>
          </div>
        </Card>

        {/* Configuration Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kategorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Klíč
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hodnota
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Popis
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Poslední změna
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredConfigs.map((config) => (
                  <tr key={config.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${getCategoryColor(config.category)}`}>
                            {getCategoryIcon(config.category)}
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">
                            {config.category}
                          </div>
                          <div className="text-xs text-gray-500">
                            {config.isRequired ? 'Povinné' : 'Volitelné'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 font-mono">
                        {config.key}
                      </div>
                      <div className="text-xs text-gray-500">
                        Typ: {config.type}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="max-w-xs">
                        {editingConfigs[config.id] !== undefined ? (
                          <div className="space-y-2">
                            {config.type === 'boolean' ? (
                              <select
                                value={editingConfigs[config.id]}
                                onChange={(e) => handleConfigChange(config.id, e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                <option value="true">true</option>
                                <option value="false">false</option>
                              </select>
                            ) : config.type === 'select' && config.options ? (
                              <select
                                value={editingConfigs[config.id]}
                                onChange={(e) => handleConfigChange(config.id, e.target.value)}
                                className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              >
                                {config.options.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            ) : (
                              <Input
                                type={config.type === 'number' ? 'number' : 'text'}
                                value={editingConfigs[config.id]}
                                onChange={(e) => handleConfigChange(config.id, e.target.value)}
                                className="w-full text-sm"
                                placeholder={config.defaultValue}
                              />
                            )}
                            <div className="text-xs text-gray-500">
                              Výchozí: {config.defaultValue}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm font-mono text-gray-900">
                                {config.isSensitive && !showSensitive[config.id] 
                                  ? '••••••••••••••••' 
                                  : config.value}
                              </span>
                              {config.isSensitive && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleSensitiveVisibility(config.id)}
                                  className="p-1 h-6 w-6"
                                >
                                  {showSensitive[config.id] ? (
                                    <EyeOff className="w-3 h-3" />
                                  ) : (
                                    <Eye className="w-3 h-3" />
                                  )}
                                </Button>
                              )}
                            </div>
                            <div className="text-xs text-gray-500">
                              Výchozí: {config.defaultValue}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {config.description}
                      </div>
                      {config.isSensitive && (
                        <Badge variant="outline" className="mt-1 text-xs bg-red-50 text-red-700 border-red-200">
                          Citlivé
                        </Badge>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(config.lastModified)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatTime(config.lastModified)}
                      </div>
                      <div className="text-xs text-gray-400">
                        {config.modifiedBy}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {editingConfigs[config.id] !== undefined ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => saveConfig(config.id)}
                              disabled={saving}
                              className="text-green-600 hover:text-green-700"
                            >
                              {saving ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => resetConfig(config.id)}
                              className="text-orange-600 hover:text-orange-700"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingConfigs(prev => {
                                  const newState = { ...prev };
                                  delete newState[config.id];
                                  return newState;
                                });
                              }}
                              className="text-gray-600 hover:text-gray-700"
                            >
                              Zrušit
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleConfigChange(config.id, config.value)}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            Upravit
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Configuration Tips */}
        <Card className="p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Bezpečnostní tipy pro konfiguraci
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Citlivé hodnoty (API klíče, hesla) jsou automaticky maskovány</li>
                <li>• Vždy používejte silná hesla pro databáze a API klíče</li>
                <li>• Pravidelně rotujte JWT tajné klíče</li>
                <li>• V produkci nastavte ENVIRONMENT na "production"</li>
                <li>• Omezte přístup k citlivým nastavením pouze na potřebné uživatele</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default SystemConfigPage;
