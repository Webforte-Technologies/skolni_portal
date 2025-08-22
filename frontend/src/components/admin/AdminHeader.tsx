import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, Search, Bell, User, Settings, LogOut, 
  ChevronDown, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/apiClient';
import Button from '../ui/Button';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  time: string;
  read: boolean;
}



interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface SchoolData {
  id: string;
  name: string;
  teacher_count?: number;
}

interface MaterialData {
  id: string;
  title: string;
  file_type: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Quick actions - commented out for now as they're not being used
  // const quickActions: QuickAction[] = [
  //   {
  //     id: 'add-user',
  //     title: 'Přidat uživatele',
  //     description: 'Rychle vytvořit nový uživatelský účet',
  //     action: () => navigate('/admin/users/new'),
  //     icon: <User className="w-4 h-4" />
  //   },
  //   {
  //     id: 'system-backup',
  //     title: 'Záloha systému',
  //     description: 'Spustit zálohu databáze',
  //     action: async () => {
  //       try {
  //       await api.post('/admin/system/backup');
  //       showToast({ type: 'success', message: 'Záloha byla spuštěna' });
  //     } catch (error) {
  //       showToast({ type: 'error', message: 'Chyba při spouštění zálohy' });
  //     }
  //   },
  //     icon: <Settings className="w-4 h-4" />
  //   }
  // ];

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const res = await api.get<any>('/notifications?limit=20');
        const notifs = res.data.data || [];
        setNotifications(notifs);
        setUnreadCount(notifs.filter((n: any) => !n.read).length);
      } catch (error) {
        console.error('Failed to load notifications:', error);
      }
    };

    loadNotifications();
    const interval = setInterval(loadNotifications, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  // Global search
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      // Search across different admin areas
      const [usersRes, schoolsRes, materialsRes] = await Promise.all([
        api.get(`/admin/users?q=${encodeURIComponent(query)}&limit=5`),
        api.get(`/admin/schools?q=${encodeURIComponent(query)}&limit=5`),
        api.get(`/admin/content/materials?q=${encodeURIComponent(query)}&limit=5`)
      ]);

      const results = [
        ...(usersRes.data as any).data.data.map((u: UserData) => ({
          type: 'user',
          id: u.id,
          title: `${u.first_name} ${u.last_name}`,
          subtitle: u.email,
          path: `/admin/users/${u.id}`
        })),
        ...(schoolsRes.data as any).data.data.map((s: SchoolData) => ({
          type: 'school',
          id: s.id,
          title: s.name,
          subtitle: `${s.teacher_count || 0} učitelů`,
          path: `/admin/schools/${s.id}`
        })),
        ...(materialsRes.data as any).data.data.map((m: MaterialData) => ({
          type: 'material',
          id: m.id,
          title: m.title,
          subtitle: m.file_type,
          path: `/admin/content/materials/${m.id}`
        }))
      ];

      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při odhlašování' });
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await api.put(`/notifications/${notificationId}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between h-full px-6">
        
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <Link to="/admin/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EA</span>
            </div>
            <div className="hidden md:block">
              <h1 className="text-lg font-semibold text-gray-900">EduAI Admin</h1>
            </div>
          </Link>
        </div>

        {/* Center - Search */}
        <div className="flex-1 max-w-md mx-8 relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Hledat uživatele, školy, materiály..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                handleSearch(e.target.value);
                setShowSearch(true);
              }}
              onFocus={() => setShowSearch(true)}
            />
          </div>

          {/* Search Results */}
          {showSearch && (searchResults.length > 0 || searchQuery.trim()) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
              {searchResults.length > 0 ? (
                <div className="p-2">
                  {searchResults.map((result) => (
                    <Link
                      key={`${result.type}-${result.id}`}
                      to={result.path}
                      className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        setShowSearch(false);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                        result.type === 'user' ? 'bg-blue-100 text-blue-700' :
                        result.type === 'school' ? 'bg-green-100 text-green-700' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {result.type === 'user' ? 'U' : result.type === 'school' ? 'Š' : 'M'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">{result.title}</div>
                        <div className="text-xs text-gray-500 truncate">{result.subtitle}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Žádné výsledky pro &quot;{searchQuery}&quot;
                </div>
              ) : null}
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">Notifikace</h3>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowNotifications(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                          !notification.read ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            notification.type === 'error' ? 'bg-red-500' :
                            notification.type === 'warning' ? 'bg-yellow-500' :
                            notification.type === 'success' ? 'bg-green-500' :
                            'bg-blue-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">{notification.message}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      Žádné notifikace
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2"
            >
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {user?.first_name?.[0]}{user?.last_name?.[0]}
                </span>
              </div>
              <span className="hidden md:block text-sm font-medium">
                {user?.first_name} {user?.last_name}
              </span>
              <ChevronDown className="w-4 h-4" />
            </Button>

            {/* User Dropdown */}
            {showUserMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <div className="p-4 border-b border-gray-200">
                  <div className="text-sm font-medium text-gray-900">
                    {user?.first_name} {user?.last_name}
                  </div>
                  <div className="text-xs text-gray-500">{user?.email}</div>
                  <div className="text-xs text-blue-600 mt-1">
                    {user?.role?.replace('_', ' ')}
                  </div>
                </div>
                <div className="p-2">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="w-4 h-4" />
                    Profil
                  </Link>
                  <Link
                    to="/admin/system/config"
                    className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Nastavení
                  </Link>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 rounded hover:bg-red-50"
                  >
                    <LogOut className="w-4 h-4" />
                    Odhlásit se
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions Tooltip */}
        <div className="hidden lg:block">
          <div className="text-xs text-gray-500 mt-1">
            Rychlé akce: Ctrl+K pro vyhledávání
          </div>
        </div>
      </div>

      {/* Click outside handlers */}
      {(showSearch || showNotifications || showUserMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowSearch(false);
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </header>
  );
};

export default AdminHeader;
