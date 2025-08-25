import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  EyeOff, 
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Activity,
  Database,
  FileText,
  Lock,
  Unlock,
  RefreshCw,
  Server,
  XCircle
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import AdminLayout from '../../components/admin/AdminLayout';

interface SecurityEvent {
  id: string;
  timestamp: Date;
  eventType: 'login' | 'logout' | 'failed_login' | 'permission_change' | 'data_access' | 'system_change';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  userId: string;
  userEmail: string;
  ipAddress: string;
  userAgent: string;
  resource: string;
  details: string;
  status: 'investigating' | 'resolved' | 'false_positive' | 'open';
}

const SecurityAuditPage: React.FC = () => {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Simulate API call for security audit data
    const fetchSecurityEvents = async () => {
      setLoading(true);
      setTimeout(() => {
        const mockEvents: SecurityEvent[] = [
          {
            id: '1',
            timestamp: new Date(Date.now() - 1000 * 60 * 30),
            eventType: 'failed_login',
            severity: 'high',
            description: 'Neúspěšný pokus o přihlášení',
            userId: 'user123',
            userEmail: 'user@example.com',
            ipAddress: '192.168.1.100',
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
            resource: '/api/auth/login',
            details: 'Nesprávné heslo - 3 pokusy za 5 minut',
            status: 'investigating'
          },
          {
            id: '2',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2),
            eventType: 'permission_change',
            severity: 'medium',
            description: 'Změna oprávnění uživatele',
            userId: 'admin1',
            userEmail: 'admin@school.cz',
            ipAddress: '10.0.0.50',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            resource: '/api/admin/users/permissions',
            details: 'Uživateli user456 přidána role "teacher"',
            status: 'resolved'
          },
          {
            id: '3',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4),
            eventType: 'data_access',
            severity: 'low',
            description: 'Přístup k citlivým datům',
            userId: 'teacher1',
            userEmail: 'teacher@school.cz',
            ipAddress: '172.16.0.25',
            userAgent: 'Mozilla/5.0 (iPad; CPU OS 14_7_1)',
            resource: '/api/materials/private/123',
            details: 'Zobrazení soukromého materiálu',
            status: 'resolved'
          },
          {
            id: '4',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6),
            eventType: 'system_change',
            severity: 'critical',
            description: 'Změna systémového nastavení',
            userId: 'admin1',
            userEmail: 'admin@school.cz',
            ipAddress: '10.0.0.50',
            userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
            resource: '/api/admin/system/config',
            details: 'Změna JWT secret key',
            status: 'investigating'
          },
          {
            id: '5',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8),
            eventType: 'login',
            severity: 'low',
            description: 'Úspěšné přihlášení',
            userId: 'user789',
            userEmail: 'user789@example.com',
            ipAddress: '203.0.113.45',
            userAgent: 'Mozilla/5.0 (Android 11; Mobile)',
            resource: '/api/auth/login',
            details: 'Přihlášení z nového zařízení',
            status: 'resolved'
          }
        ];
        setEvents(mockEvents);
        setLoading(false);
      }, 1000);
    };

    fetchSecurityEvents();
  }, []);

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'login':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'logout':
        return <XCircle className="w-4 h-4 text-blue-600" />;
      case 'failed_login':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      case 'permission_change':
        return <Shield className="w-4 h-4 text-orange-600" />;
      case 'data_access':
        return <Database className="w-4 h-4 text-purple-600" />;
      case 'system_change':
        return <Server className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'investigating':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'false_positive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'open':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };


  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'Vyřešeno';
      case 'investigating':
        return 'Vyšetřuje se';
      case 'false_positive':
        return 'Falešný poplach';
      case 'open':
        return 'Otevřené';
      default:
        return status;
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesType = filterType === 'all' || event.eventType === filterType;
    const matchesSeverity = filterSeverity === 'all' || event.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    const matchesSearch = searchQuery === '' || 
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.ipAddress.includes(searchQuery);

    return matchesType && matchesSeverity && matchesStatus && matchesSearch;
  });

  const exportAuditLog = () => {
    // Simulate export functionality
    const dataStr = JSON.stringify(filteredEvents, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `security-audit-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-6 h-6 animate-spin text-primary" />
            <span className="text-lg text-gray-600">Načítání bezpečnostního auditu...</span>
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
          <h1 className="text-3xl font-bold text-gray-900">Bezpečnostní audit</h1>
          <p className="text-gray-600 mt-2">
            Přehled všech bezpečnostních událostí a aktivit v systému
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      {/* Audit Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <h3 className="text-lg font-semibold">Kritické události</h3>
            </div>
            <div className="text-2xl font-bold text-red-600 mb-2">
              {events.filter(e => e.severity === 'critical').length}
            </div>
            <p className="text-sm text-gray-600">Vyžadují okamžitou pozornost</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Clock className="w-6 h-6 text-orange-600" />
              <h3 className="text-lg font-semibold">Dnes</h3>
            </div>
            <div className="text-2xl font-bold text-orange-600 mb-2">
              {events.filter(e => e.timestamp.toDateString() === new Date().toDateString()).length}
            </div>
            <p className="text-sm text-gray-600">Události za dnešní den</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Search className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold">Vyšetřuje se</h3>
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {events.filter(e => e.status === 'investigating').length}
            </div>
            <p className="text-sm text-gray-600">Aktivní vyšetřování</p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <h3 className="text-lg font-semibold">Vyřešeno</h3>
            </div>
            <div className="text-2xl font-bold text-green-600 mb-2">
              {events.filter(e => e.status === 'resolved').length}
            </div>
            <p className="text-sm text-gray-600">Uzavřené události</p>
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
                  placeholder="Hledat v událostech..."
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
                <option value="login">Přihlášení</option>
                <option value="logout">Odhlášení</option>
                <option value="failed_login">Neúspěšné přihlášení</option>
                <option value="permission_change">Změna oprávnění</option>
                <option value="data_access">Přístup k datům</option>
                <option value="system_change">Systémová změna</option>
              </select>

              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Všechny úrovně</option>
                <option value="low">Nízká</option>
                <option value="medium">Střední</option>
                <option value="high">Vysoká</option>
                <option value="critical">Kritická</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Všechny stavy</option>
                <option value="open">Otevřené</option>
                <option value="investigating">Vyšetřuje se</option>
                <option value="resolved">Vyřešeno</option>
                <option value="false_positive">Falešný poplach</option>
              </select>
            </div>

            <Button onClick={exportAuditLog} variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </Card>

      {/* Events List */}
      <Card>
        <div className="border-b border-neutral-200 px-6 py-4">
          <h3 className="text-lg font-medium">Bezpečnostní události</h3>
        </div>
        <div className="p-6">
          {filteredEvents.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Žádné události nenalezeny</p>
              <p className="text-sm">Zkuste upravit filtry nebo hledaný výraz</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredEvents.map((event) => (
                <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getEventTypeIcon(event.eventType)}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{event.description}</h4>
                          <Badge variant="outline" className={getSeverityColor(event.severity)}>
                            {event.severity === 'low' ? 'Nízká' :
                             event.severity === 'medium' ? 'Střední' :
                             event.severity === 'high' ? 'Vysoká' : 'Kritická'}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(event.status)}>
                            {getStatusLabel(event.status)}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Uživatel:</span> {event.userEmail}
                          </div>
                          <div>
                            <span className="font-medium">IP adresa:</span> {event.ipAddress}
                          </div>
                          <div>
                            <span className="font-medium">Zdroj:</span> {event.resource}
                          </div>
                          <div>
                            <span className="font-medium">Čas:</span> {event.timestamp.toLocaleString('cs-CZ')}
                          </div>
                        </div>
                        
                        {event.details && (
                          <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                            <span className="font-medium">Detaily:</span> {event.details}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 ml-4">
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4 mr-1" />
                        Zobrazit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </AdminLayout>
  );
};

export default SecurityAuditPage;
