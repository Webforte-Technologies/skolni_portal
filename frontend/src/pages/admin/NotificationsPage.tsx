import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle, XCircle, Filter, Search, Trash2, Eye, EyeOff } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card, Button, Badge } from '../../components/ui';


interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'system' | 'user' | 'security' | 'billing';
  priority: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  read: boolean;
  actionRequired: boolean;
  source: string;
}

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread' | 'critical' | 'action-required'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotifications, setSelectedNotifications] = useState<string[]>([]);

  useEffect(() => {
    // Simulate API call for notifications
    const fetchNotifications = async () => {
      setLoading(true);
      // In real implementation, this would be an API call
      setTimeout(() => {
        const mockNotifications: Notification[] = [
          {
            id: '1',
            title: 'Kritická chyba v systému',
            message: 'Detekována chyba v databázovém připojení. Systém automaticky přepnul na záložní server.',
            type: 'error',
            category: 'system',
            priority: 'critical',
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            read: false,
            actionRequired: true,
            source: 'Database Service'
          },
          {
            id: '2',
            title: 'Nový uživatel vyžaduje schválení',
            message: 'Učitel Jan Novák z Gymnázium Jana Nerudy čeká na schválení účtu.',
            type: 'info',
            category: 'user',
            priority: 'medium',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            read: false,
            actionRequired: true,
            source: 'User Management'
          },
          {
            id: '3',
            title: 'Nízký zůstatek kreditů',
            message: 'Škola ZŠ TGM má pouze 15% zbývajících kreditů. Doporučujeme kontaktovat správce.',
            type: 'warning',
            category: 'billing',
            priority: 'high',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
            read: true,
            actionRequired: false,
            source: 'Billing System'
          },
          {
            id: '4',
            title: 'Úspěšné zálohování dat',
            message: 'Automatické zálohování databáze bylo úspěšně dokončeno v 02:00.',
            type: 'success',
            category: 'system',
            priority: 'low',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 6), // 6 hours ago
            read: true,
            actionRequired: false,
            source: 'Backup Service'
          },
          {
            id: '5',
            title: 'Podezřelá aktivita',
            message: 'Detekováno neobvykle vysoké množství požadavků z IP adresy 192.168.1.100.',
            type: 'warning',
            category: 'security',
            priority: 'high',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), // 8 hours ago
            read: false,
            actionRequired: true,
            source: 'Security Monitor'
          },
          {
            id: '6',
            title: 'Aktualizace systému dokončena',
            message: 'Systém byl úspěšně aktualizován na verzi 2.1.0. Všechny služby jsou funkční.',
            type: 'success',
            category: 'system',
            priority: 'low',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
            read: true,
            actionRequired: false,
            source: 'Update Service'
          }
        ];
        setNotifications(mockNotifications);
        setLoading(false);
      }, 1000);
    };

    fetchNotifications();
  }, []);

  const getTypeIcon = (type: Notification['type']) => {
    switch (type) {
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: Notification['priority']) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: Notification['category']) => {
    switch (category) {
      case 'system':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'user':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'security':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'billing':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `před ${minutes} min`;
    } else if (hours < 24) {
      return `před ${hours} hod`;
    } else {
      return `před ${days} dny`;
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const deleteSelected = () => {
    setNotifications(prev => prev.filter(notif => !selectedNotifications.includes(notif.id)));
    setSelectedNotifications([]);
  };

  const toggleSelection = (id: string) => {
    setSelectedNotifications(prev => 
      prev.includes(id) 
        ? prev.filter(n => n !== id)
        : [...prev, id]
    );
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.read) ||
      (filter === 'critical' && notification.priority === 'critical') ||
      (filter === 'action-required' && notification.actionRequired);
    
    const matchesCategory = categoryFilter === 'all' || notification.category === categoryFilter;
    
    const matchesSearch = searchQuery === '' || 
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesCategory && matchesSearch;
  });

  const unreadCount = notifications.filter(n => !n.read).length;
  const criticalCount = notifications.filter(n => n.priority === 'critical').length;
  const actionRequiredCount = notifications.filter(n => n.actionRequired).length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Načítání notifikací...</div>
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
            <h1 className="text-2xl font-bold text-gray-900">Centrum notifikací</h1>
            <p className="text-gray-600">Přehled systémových upozornění a uživatelských notifikací</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button
              variant="outline"
              onClick={markAllAsRead}
              className="flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Označit vše jako přečtené</span>
            </Button>
            {selectedNotifications.length > 0 && (
              <Button
                variant="danger"
                onClick={deleteSelected}
                className="flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Smazat vybrané ({selectedNotifications.length})</span>
              </Button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Celkem notifikací</p>
                <p className="text-2xl font-bold text-gray-900">{notifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Nepřečtené</p>
                <p className="text-2xl font-bold text-orange-600">{unreadCount}</p>
              </div>
              <EyeOff className="w-8 h-8 text-orange-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Kritické</p>
                <p className="text-2xl font-bold text-red-600">{criticalCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vyžadují akci</p>
                <p className="text-2xl font-bold text-purple-600">{actionRequiredCount}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-wrap items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filtry:</span>
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Všechny</option>
                <option value="unread">Nepřečtené</option>
                <option value="critical">Kritické</option>
                <option value="action-required">Vyžadují akci</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Všechny kategorie</option>
                <option value="system">Systém</option>
                <option value="user">Uživatelé</option>
                <option value="security">Bezpečnost</option>
                <option value="billing">Fakturace</option>
              </select>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Hledat v notifikacích..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-full lg:w-80"
              />
            </div>
          </div>
        </Card>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <Card className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné notifikace</h3>
              <p className="text-gray-600">Pro zvolené filtry nebyly nalezeny žádné notifikace.</p>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`p-6 transition-all duration-200 ${
                  !notification.read ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification.id)}
                    onChange={() => toggleSelection(notification.id)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(notification.type)}
                        <div>
                          <h3 className={`text-lg font-semibold ${
                            !notification.read ? 'text-blue-900' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className="text-gray-600 mt-1">{notification.message}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                        <Badge variant="outline" className={getCategoryColor(notification.category)}>
                          {notification.category}
                        </Badge>
                        {notification.actionRequired && (
                          <Badge variant="warning">Vyžaduje akci</Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>Zdroj: {notification.source}</span>
                        <span>{formatTimestamp(notification.timestamp)}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="flex items-center space-x-2"
                          >
                            <Eye className="w-4 h-4" />
                            <span>Označit jako přečtené</span>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="flex items-center space-x-2 text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>Smazat</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default NotificationsPage;
