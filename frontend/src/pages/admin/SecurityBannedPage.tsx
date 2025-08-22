import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { 
  Ban, 
  User, 
  Globe, 
  
  AlertTriangle,
  CheckCircle,
  Search,
  RefreshCw,
  Plus,
  Edit,
  Trash2
} from 'lucide-react';

interface BannedEntity {
  id: string;
  type: 'user' | 'ip' | 'email';
  value: string;
  reason: string;
  bannedBy: string;
  bannedAt: Date;
  expiresAt?: Date;
  isActive: boolean;
  notes?: string;
}

const SecurityBannedPage: React.FC = () => {
  const [bannedEntities, setBannedEntities] = useState<BannedEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingEntity, setEditingEntity] = useState<BannedEntity | null>(null);

  useEffect(() => {
    // Simulate API call for banned entities data
    const fetchBannedEntities = async () => {
      setLoading(true);
      setTimeout(() => {
        const mockBannedEntities: BannedEntity[] = [
          {
            id: '1',
            type: 'ip',
            value: '192.168.1.100',
            reason: 'Více neúspěšných pokusů o přihlášení',
            bannedBy: 'admin1',
            bannedAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
            isActive: true,
            notes: 'IP adresa blokována na 7 dní'
          },
          {
            id: '2',
            type: 'user',
            value: 'user@spammer.com',
            reason: 'Spam a nevhodný obsah',
            bannedBy: 'admin2',
            bannedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30),
            isActive: true,
            notes: 'Trvalé zablokování'
          },
          {
            id: '3',
            type: 'email',
            value: 'bot@malware.com',
            reason: 'Automatizované útoky',
            bannedBy: 'admin1',
            bannedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
            expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
            isActive: true,
            notes: 'Blokováno na 30 dní'
          },
          {
            id: '4',
            type: 'ip',
            value: '10.0.0.50',
            reason: 'Testovací blokování',
            bannedBy: 'admin1',
            bannedAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
            expiresAt: new Date(Date.now() - 1000 * 60 * 60 * 1),
            isActive: false,
            notes: 'Blokování vypršelo'
          }
        ];
        setBannedEntities(mockBannedEntities);
        setLoading(false);
      }, 1000);
    };

    fetchBannedEntities();
  }, []);

  const filteredEntities = bannedEntities.filter(entity => {
    const matchesType = filterType === 'all' || entity.type === filterType;
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && entity.isActive) || 
      (filterStatus === 'inactive' && !entity.isActive);
    const matchesSearch = searchQuery === '' || 
      entity.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entity.reason.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesStatus && matchesSearch;
  });

  const toggleBanStatus = (id: string) => {
    setBannedEntities(prev => prev.map(entity => 
      entity.id === id ? { ...entity, isActive: !entity.isActive } : entity
    ));
  };

  const removeBan = (id: string) => {
    setBannedEntities(prev => prev.filter(entity => entity.id !== id));
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="w-4 h-4" />;
      case 'ip':
        return <Globe className="w-4 h-4" />;
      case 'email':
        return <User className="w-4 h-4" />;
      default:
        return <Ban className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'user':
        return 'Uživatel';
      case 'ip':
        return 'IP adresa';
      case 'email':
        return 'Email';
      default:
        return type;
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive 
      ? 'bg-red-100 text-red-800 border-red-200' 
      : 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (isActive: boolean) => {
    return isActive ? 'Aktivní' : 'Neaktivní';
  };

  const isExpired = (entity: BannedEntity) => {
    return entity.expiresAt && entity.expiresAt < new Date();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg text-gray-600">Načítání zablokovaných entit...</span>
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
          <h1 className="text-3xl font-bold text-gray-900">Zablokované entity</h1>
          <p className="text-gray-600 mt-2">
            Správa zablokovaných uživatelů, IP adres a emailů
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => setShowAddForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Přidat blokování
          </Button>
          <Ban className="w-8 h-8 text-red-600" />
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Ban className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold">Celkem zablokováno</h3>
            </div>
            <div className="text-2xl font-bold text-red-600 mb-2">
              {bannedEntities.length}
            </div>
            <p className="text-sm text-gray-600">Všechny zablokované entity</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold">Aktivní blokování</h3>
            </div>
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {bannedEntities.filter(e => e.isActive).length}
            </div>
            <p className="text-sm text-gray-600">Aktuálně zablokované</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Globe className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold">IP adresy</h3>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {bannedEntities.filter(e => e.type === 'ip').length}
            </div>
            <p className="text-sm text-gray-600">Zablokované IP adresy</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <User className="w-6 h-6 text-purple-600" />
              <h3 className="text-lg font-semibold">Uživatelé</h3>
            </div>
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {bannedEntities.filter(e => e.type === 'user').length}
            </div>
            <p className="text-sm text-gray-600">Zablokovaní uživatelé</p>
          </div>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Hledat v zablokovaných entitách..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Všechny typy</option>
                <option value="user">Uživatelé</option>
                <option value="ip">IP adresy</option>
                <option value="email">Emaily</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Všechny stavy</option>
                <option value="active">Aktivní</option>
                <option value="inactive">Neaktivní</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Banned Entities List */}
      <Card>
        <div className="border-b border-neutral-200 px-6 py-4">
          <h3 className="text-lg font-medium">Seznam zablokovaných entit</h3>
        </div>
        <div className="p-6">
          {filteredEntities.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Ban className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Žádné zablokované entity nenalezeny</p>
              <p className="text-sm">Zkuste upravit filtry nebo hledaný výraz</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEntities.map((entity) => (
                <div key={entity.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getTypeIcon(entity.type)}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{entity.value}</h4>
                          <Badge variant="outline" className={getStatusColor(entity.isActive)}>
                            {getStatusLabel(entity.isActive)}
                          </Badge>
                          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                            {getTypeLabel(entity.type)}
                          </Badge>
                          {isExpired(entity) && (
                            <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-200">
                              Vypršelo
                            </Badge>
                          )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Důvod:</span> {entity.reason}
                          </div>
                          <div>
                            <span className="font-medium">Zablokoval:</span> {entity.bannedBy}
                          </div>
                          <div>
                            <span className="font-medium">Datum blokování:</span> {entity.bannedAt.toLocaleDateString('cs-CZ')}
                          </div>
                          {entity.expiresAt && (
                            <div>
                              <span className="font-medium">Vyprší:</span> {entity.expiresAt.toLocaleDateString('cs-CZ')}
                            </div>
                          )}
                        </div>
                        
                        {entity.notes && (
                          <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                            <span className="font-medium">Poznámky:</span> {entity.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleBanStatus(entity.id)}
                      >
                        {entity.isActive ? (
                          <>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Aktivovat
                          </>
                        ) : (
                          <>
                            <Ban className="w-4 h-4 mr-1" />
                            Zablokovat
                          </>
                        )}
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingEntity(entity)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Upravit
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeBan(entity.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Odstranit
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
  );
};

export default SecurityBannedPage;
