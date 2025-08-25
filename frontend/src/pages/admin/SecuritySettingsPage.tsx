import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { 
  Shield, 
  Lock, 
  Key, 
  Eye, 
  EyeOff, 
  Save, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Settings,
  Users,
  Database
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

interface SecuritySetting {
  id: string;
  category: string;
  name: string;
  description: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  isEnabled: boolean;
  isRequired: boolean;
  lastModified: Date;
  modifiedBy: string;
}

const SecuritySettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SecuritySetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Simulate API call for security settings data
    const fetchSecuritySettings = async () => {
      setLoading(true);
      setTimeout(() => {
        const mockSettings: SecuritySetting[] = [
          {
            id: '1',
            category: 'Authentication',
            name: 'JWT Secret Key',
            description: 'Tajný klíč pro generování JWT tokenů',
            value: 'super-secret-jwt-key-2024',
            type: 'string',
            isEnabled: true,
            isRequired: true,
            lastModified: new Date(Date.now() - 1000 * 60 * 60 * 24),
            modifiedBy: 'admin1'
          },
          {
            id: '2',
            category: 'Authentication',
            name: 'Session Timeout',
            description: 'Čas v minutách, po kterém vyprší session',
            value: '480',
            type: 'number',
            isEnabled: true,
            isRequired: true,
            lastModified: new Date(Date.now() - 1000 * 60 * 60 * 48),
            modifiedBy: 'admin2'
          },
          {
            id: '3',
            category: 'Password Policy',
            name: 'Minimální délka hesla',
            description: 'Minimální počet znaků pro heslo',
            value: '8',
            type: 'number',
            isEnabled: true,
            isRequired: true,
            lastModified: new Date(Date.now() - 1000 * 60 * 60 * 72),
            modifiedBy: 'admin1'
          },
          {
            id: '4',
            category: 'Password Policy',
            name: 'Požadovat velká písmena',
            description: 'Heslo musí obsahovat alespoň jedno velké písmeno',
            value: 'true',
            type: 'boolean',
            isEnabled: true,
            isRequired: false,
            lastModified: new Date(Date.now() - 1000 * 60 * 60 * 96),
            modifiedBy: 'admin1'
          },
          {
            id: '5',
            category: 'Rate Limiting',
            name: 'Max požadavků za minutu',
            description: 'Maximální počet požadavků na IP adresu za minutu',
            value: '100',
            type: 'number',
            isEnabled: true,
            isRequired: true,
            lastModified: new Date(Date.now() - 1000 * 60 * 60 * 120),
            modifiedBy: 'admin2'
          },
          {
            id: '6',
            category: 'API Security',
            name: 'API Rate Limit',
            description: 'Maximální počet API požadavků za hodinu',
            value: '1000',
            type: 'number',
            isEnabled: true,
            isRequired: true,
            lastModified: new Date(Date.now() - 1000 * 60 * 60 * 144),
            modifiedBy: 'admin1'
          }
        ];
        setSettings(mockSettings);
        setLoading(false);
      }, 1000);
    };

    fetchSecuritySettings();
  }, []);

  const handleValueChange = (id: string, value: string) => {
    setEditingValues(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const saveSetting = async (id: string) => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSettings(prev => prev.map(setting => 
        setting.id === id 
          ? { ...setting, value: editingValues[id], lastModified: new Date(), modifiedBy: 'current_admin' }
          : setting
      ));
      setEditingValues(prev => {
        const newValues = { ...prev };
        delete newValues[id];
        return newValues;
      });
      setSaving(false);
    }, 500);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Authentication':
        return <Key className="w-4 h-4" />;
      case 'Password Policy':
        return <Lock className="w-4 h-4" />;
      case 'Rate Limiting':
        return <Shield className="w-4 h-4" />;
      case 'API Security':
        return <Database className="w-4 h-4" />;
      default:
        return <Settings className="w-4 h-4" />;
    }
  };

  const getValueDisplay = (setting: SecuritySetting) => {
    if (setting.type === 'boolean') {
      return setting.value === 'true' ? 'Zapnuto' : 'Vypnuto';
    }
    
    if (setting.type === 'string' && setting.name.toLowerCase().includes('heslo') || setting.name.toLowerCase().includes('key')) {
      return showPasswords[setting.id] ? setting.value : '••••••••••••••••';
    }
    
    return setting.value;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg text-gray-600">Načítání bezpečnostních nastavení...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bezpečnostní nastavení</h1>
          <p className="text-gray-600 mt-2">
            Konfigurace bezpečnostních parametrů systému
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold">Bezpečnostní stav</h3>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-2">Výborný</div>
            <p className="text-sm text-gray-600">Všechna kritická nastavení jsou správně nakonfigurována</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-yellow-600" />
              <h3 className="text-lg font-semibold">Aktivní upozornění</h3>
            </div>
            <div className="text-2xl font-bold text-yellow-600 mb-2">2</div>
            <p className="text-sm text-gray-600">Doporučené bezpečnostní vylepšení</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Users className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold">Poslední audit</h3>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-2">2 dny</div>
            <p className="text-sm text-gray-600">Od poslední kontroly bezpečnosti</p>
          </div>
        </Card>
      </div>

      {/* Settings by Category */}
      <div className="space-y-8">
        {Array.from(new Set(settings.map(s => s.category))).map(category => (
          <Card key={category}>
            <div className="border-b border-neutral-200 px-6 py-4">
              <div className="flex items-center space-x-3">
                {getCategoryIcon(category)}
                <h2 className="text-xl font-semibold">{category}</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {settings
                  .filter(s => s.category === category)
                  .map(setting => (
                    <div key={setting.id} className="flex items-start justify-between p-4 border rounded-lg">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{setting.name}</h3>
                          {setting.isRequired && (
                            <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                              Povinné
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{setting.description}</p>
                        <div className="text-xs text-gray-500">
                          Poslední úprava: {setting.lastModified.toLocaleDateString('cs-CZ')} 
                          od {setting.modifiedBy}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 ml-4">
                        {Object.prototype.hasOwnProperty.call(editingValues, setting.id) ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              type={setting.type === 'boolean' ? 'text' : setting.type}
                              value={editingValues[setting.id]}
                              onChange={(e) => handleValueChange(setting.id, e.target.value)}
                              className="w-32"
                            />
                            <Button
                              onClick={() => saveSetting(setting.id)}
                              disabled={saving}
                              size="sm"
                            >
                              <Save className="w-4 h-4 mr-1" />
                              Uložit
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="text-right">
                              <div className="font-medium">
                                {getValueDisplay(setting)}
                              </div>
                              <div className="text-xs text-gray-500">
                                {setting.type === 'boolean' ? 'Boolean' : setting.type}
                              </div>
                            </div>
                            
                            {(setting.name.toLowerCase().includes('heslo') || setting.name.toLowerCase().includes('key')) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => togglePasswordVisibility(setting.id)}
                              >
                                {showPasswords[setting.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </Button>
                            )}
                            
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingValues(prev => ({ ...prev, [setting.id]: setting.value }))}
                            >
                              Upravit
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </AdminLayout>
  );
};

export default SecuritySettingsPage;
