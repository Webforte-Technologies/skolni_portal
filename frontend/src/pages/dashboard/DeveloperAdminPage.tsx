import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import { api } from '../../services/apiClient';
import SparklineStatCard from '../../components/dashboard/SparklineStatCard';
import { useToast } from '../../contexts/ToastContext';
// Temporarily disabled recharts to fix production React error
// import { 
//   AreaChart, Area, BarChart, Bar, 
//   XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
// } from 'recharts';
import { 
  Users, CreditCard, Activity, Shield, 
  TrendingUp, TrendingDown, AlertTriangle, CheckCircle, 
  Settings, Search, Plus, Trash2,
  Bell, Zap, Database, Server, X, BarChart3
} from 'lucide-react';

const DeveloperAdminPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [metrics, setMetrics] = useState<any>(null);
  const [flags, setFlags] = useState<any[]>([]);
  const [credits, setCredits] = useState<any>(null);
  const [schools, setSchools] = useState<any>({ data: [], total: 0 });
  const [quality, setQuality] = useState<any>(null);
  const [modQueue, setModQueue] = useState<any[]>([]);
  const [modTotal, setModTotal] = useState(0);
  const [modPage, setModPage] = useState(0);
  const [modStatus, setModStatus] = useState<'pending'|'approved'|'rejected'>('pending');
  const [modEdit, setModEdit] = useState<{ id: string; notes: string; score: string } | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [usersTotal, setUsersTotal] = useState(0);
  const [userQuery, setUserQuery] = useState('');
  const [userPage, setUserPage] = useState(0);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [userFilters, setUserFilters] = useState({
    role: '',
    status: '',
    school: ''
  });
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotificationPanel, setShowNotificationPanel] = useState(false);
  const { showToast } = useToast();
  const [bulkMode, setBulkMode] = useState<'apiLoop' | 'bulkEndpoint'>('apiLoop');

  const pageSize = 20;

  const fetchHealth = async () => {
    const res = await api.get<any>('/admin/system/health');
    setHealth(res.data.data);
  };

  const fetchMetrics = async () => {
    const res = await api.get<any>('/admin/system/metrics');
    setMetrics(res.data.data);
  };

  const fetchFlags = async () => {
    const res = await api.get<any>('/admin/feature-flags');
    setFlags(res.data.data || []);
  };

  const fetchCredits = async () => {
    const res = await api.get<any>('/admin/credits/analytics');
    setCredits(res.data.data);
  };

  const fetchSchools = async () => {
    const res = await api.get<any>('/admin/schools?limit=10&offset=0');
    setSchools(res.data.data);
  };

  const fetchQuality = async () => {
    const res = await api.get<any>('/admin/quality/metrics');
    setQuality(res.data.data);
  };

  const modPageSize = 10;
  const fetchModerationQueue = async () => {
    const res = await api.get<any>(`/admin/moderation/queue?status=${modStatus}&limit=${modPageSize}&offset=${modPage * modPageSize}`);
    setModQueue(res.data.data.data || []);
    setModTotal(res.data.data.total || 0);
  };

  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const queryParams = new URLSearchParams({
        limit: pageSize.toString(),
        offset: (userPage * pageSize).toString(),
        q: userQuery
      });
      
      if (userFilters.role) queryParams.append('role', userFilters.role);
      if (userFilters.status) queryParams.append('is_active', userFilters.status === 'active' ? 'true' : 'false');
      if (userFilters.school) queryParams.append('school_id', userFilters.school);
      
      const res = await api.get<any>(`/admin/users?${queryParams.toString()}`);
      setUsers(res.data.data.data);
      setUsersTotal(res.data.data.total);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Load notifications
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get<any>('/notifications?limit=20');
        setNotifications(res.data.data || []);
      } catch {}
    };
    load();
    const t = setInterval(load, 60000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    fetchHealth();
    fetchMetrics();
    fetchFlags();
    fetchCredits();
    fetchSchools();
    fetchQuality();
  }, []);

  useEffect(() => {
    const i = setInterval(() => { fetchHealth(); fetchMetrics(); }, 15000);
    return () => clearInterval(i);
  }, []);

  useEffect(() => { fetchUsers(); }, [userPage, userFilters]);
  useEffect(() => { fetchModerationQueue(); }, [modPage, modStatus]);

  const toggleFlag = async (key: string, value: boolean) => {
    await api.put(`/admin/feature-flags/${key}`, { value });
    fetchFlags();
  };

  const totalPages = useMemo(() => Math.ceil(usersTotal / pageSize), [usersTotal]);

  const handleBulkAction = async (action: 'activate' | 'deactivate' | 'addCredits' | 'delete') => {
    if (selectedUsers.size === 0) return;

    const affectedIds = Array.from(selectedUsers);

    if (action === 'delete') {
      if (!confirm(`Are you sure you want to delete ${affectedIds.length} users?`)) return;
      // Assuming hard delete; undo not available
      // TODO: If soft delete exists, implement restore here
      for (const userId of affectedIds) {
        await api.delete(`/admin/users/${userId}`).catch(() => {});
      }
      showToast({ type: 'warning', message: `Deleted ${affectedIds.length} users. Undo is not available.` });
      setSelectedUsers(new Set());
      fetchUsers();
      return;
    }

    if (action === 'addCredits') {
      const amountStr = prompt('Enter credit amount to add:');
      const amount = Number(amountStr);
      if (!amountStr || isNaN(amount) || amount <= 0) return;
      if (bulkMode === 'bulkEndpoint') {
        await api.post('/admin/users/bulk', { action: 'addCredits', user_ids: affectedIds, amount });
      } else {
        for (const userId of affectedIds) {
          await api.post(`/admin/users/${userId}/credits`, { type: 'add', amount });
        }
      }
      showToast({
        type: 'info',
        message: `Added ${amount} credits to ${affectedIds.length} user(s).`,
        actionLabel: 'Undo',
        onAction: async () => {
          if (bulkMode === 'bulkEndpoint') {
            await api.post('/admin/users/bulk', { action: 'deductCredits', user_ids: affectedIds, amount }).catch(() => {});
          } else {
            for (const userId of affectedIds) {
              await api.post(`/admin/users/${userId}/credits`, { type: 'deduct', amount }).catch(() => {});
            }
          }
          fetchUsers();
        },
      });
    } else if (action === 'activate' || action === 'deactivate') {
      const newState = action === 'activate';
      if (bulkMode === 'bulkEndpoint') {
        await api.post('/admin/users/bulk', { action: newState ? 'activate' : 'deactivate', user_ids: affectedIds });
      } else {
        for (const userId of affectedIds) {
          await api.put(`/admin/users/${userId}`, { is_active: newState });
        }
      }
      showToast({
        type: 'info',
        message: `${newState ? 'Activated' : 'Deactivated'} ${affectedIds.length} user(s).`,
        actionLabel: 'Undo',
        onAction: async () => {
          if (bulkMode === 'bulkEndpoint') {
            await api.post('/admin/users/bulk', { action: !newState ? 'activate' : 'deactivate', user_ids: affectedIds }).catch(() => {});
          } else {
            for (const userId of affectedIds) {
              await api.put(`/admin/users/${userId}`, { is_active: !newState }).catch(() => {});
            }
          }
          fetchUsers();
        },
      });
    }

    setSelectedUsers(new Set());
    fetchUsers();
  };

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

  // Chart data preparation
  // Temporarily disabled while recharts is removed
  // const creditTrendData = useMemo(() => {
  //   if (!credits?.monthly) return [];
  //   return credits.monthly.usage.map((item: any, index: number) => ({
  //     month: item.month,
  //     usage: item.total,
  //     purchases: credits.monthly.purchases[index]?.total || 0
  //   }));
  // }, [credits]);



  const systemStatusColor = health?.status === 'OK' ? 'text-green-600' : 'text-red-600';
  const systemStatusIcon = health?.status === 'OK' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header with notifications */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Developer Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <Button
            variant="secondary"
            onClick={() => setShowNotificationPanel(!showNotificationPanel)}
            className="relative"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </Button>
          <Button variant="primary">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Mission Control KPI Section */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-900">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">System Status</h3>
              <div className={`text-2xl font-bold ${systemStatusColor} flex items-center gap-2 mt-2`}>
                {systemStatusIcon}
                {health?.status || '...'}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-700 dark:text-blue-300">Uptime</div>
              <div className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                {Math.floor((health?.process?.uptime_s || 0) / 3600)}h {Math.floor(((health?.process?.uptime_s || 0) % 3600) / 60)}m
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-100 dark:from-green-950 dark:to-emerald-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <div className="text-sm text-green-700 dark:text-green-300">Active Users</div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-100">
                {metrics?.total_requests ? Math.floor(metrics.total_requests / 100) : 0}
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-100 dark:from-purple-950 dark:to-violet-900">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
              <CreditCard className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-sm text-purple-700 dark:text-purple-300">Total Credits</div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {credits?.totals?.balance?.toLocaleString() || 0}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - System & Metrics */}
        <div className="xl:col-span-2 space-y-6">
          {/* System Health & Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="System Health" icon={<Server className="w-5 h-5" />}>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Database</span>
                  <span className={`text-sm font-medium ${health?.db?.ok ? 'text-green-600' : 'text-red-600'}`}>
                    {health?.db?.ok ? 'Connected' : 'Error'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Response Time</span>
                  <span className="text-sm font-medium">{health?.db?.roundtrip_ms || 0} ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Node Version</span>
                  <span className="text-sm font-medium">{health?.process?.node || '...'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Memory Usage</span>
                  <span className="text-sm font-medium">
                    {Math.round((health?.process?.memory?.heapUsed || 0) / 1024 / 1024)} MB
                  </span>
                </div>
              </div>
            </Card>

            <Card title="API Performance" icon={<Activity className="w-5 h-5" />}>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Requests</span>
                  <span className="text-lg font-semibold">{metrics?.total_requests?.toLocaleString() || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Avg Response</span>
                  <span className="text-lg font-semibold">{metrics?.avg_response_ms || 0} ms</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">Error Rate</span>
                  <span className="text-lg font-semibold">
                    {metrics?.error_count_by_status && metrics.total_requests ? 
                      Math.round((Object.values(metrics.error_count_by_status as Record<string, number>).reduce((a, b) => a + b, 0) / metrics.total_requests) * 100) : 0}%
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Credits Analytics with Charts */}
          <Card title="Credits Analytics" icon={<CreditCard className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {credits?.totals?.balance?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Total Balance</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {credits?.totals?.purchased?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Total Purchased</div>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {credits?.totals?.used?.toLocaleString() || 0}
                </div>
                <div className="text-sm text-red-600 dark:text-red-400">Total Used</div>
              </div>
            </div>
            
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-neutral-800 rounded-lg">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500 dark:text-neutral-400">Chart temporarily disabled</p>
                <p className="text-xs text-gray-400 dark:text-neutral-500">Data available via API</p>
              </div>
            </div>
          </Card>

          {/* Quality Metrics with Charts */}
          <Card title="Quality Metrics" icon={<Shield className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <SparklineStatCard 
                title="Pending" 
                value={(quality?.counts || []).find((c:any)=>c.moderation_status==='pending')?.count || 0} 
                data={(quality?.trends?.d7||[]).map((d:any)=>Number(d.total))} 
              />
              <SparklineStatCard 
                title="Approved" 
                value={(quality?.counts || []).find((c:any)=>c.moderation_status==='approved')?.count || 0} 
                data={(quality?.trends?.d7||[]).map((d:any)=>Number(d.total))} 
                color="#22c55e" 
              />
              <SparklineStatCard 
                title="Rejected" 
                value={(quality?.counts || []).find((c:any)=>c.moderation_status==='rejected')?.count || 0} 
                data={(quality?.trends?.d7||[]).map((d:any)=>Number(d.total))} 
                color="#ef4444" 
              />
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {quality?.avg_overall ?? '–'}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">Avg Quality</div>
              </div>
            </div>
            
            <div className="h-64 flex items-center justify-center bg-gray-50 dark:bg-neutral-800 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500 dark:text-neutral-400">Chart temporarily disabled</p>
                <p className="text-xs text-gray-400 dark:text-neutral-500">Data available via API</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Quick Actions & Feature Flags */}
        <div className="space-y-6">
          {/* Feature Flags */}
          <Card title="Feature Flags" icon={<Zap className="w-5 h-5" />}>
            <div className="space-y-3">
              {flags.map(f => (
                <div key={f.key} className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{f.key}</div>
                    <div className="text-xs text-neutral-500">{f.description}</div>
                  </div>
                  <label className="inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only" checked={!!f.value} onChange={() => toggleFlag(f.key, !f.value)} />
                    <div className={`w-10 h-5 rounded-full transition ${f.value ? 'bg-green-500' : 'bg-neutral-300'}`}>
                      <div className={`h-5 w-5 bg-white rounded-full shadow transform transition ${f.value ? 'translate-x-5' : ''}`}></div>
                    </div>
                  </label>
                </div>
              ))}
              {!flags.length && <div className="text-sm text-neutral-500 text-center py-4">No flags configured</div>}
            </div>
          </Card>

          {/* Quick Stats */}
          <Card title="Quick Stats" icon={<TrendingUp className="w-5 h-5" />}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Total Schools</span>
                <span className="text-lg font-semibold">{schools?.total || 0}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Pending Moderation</span>
                <span className="text-lg font-semibold text-orange-600">{modTotal}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">Active Users</span>
                <span className="text-lg font-semibold text-green-600">{usersTotal}</span>
              </div>
            </div>
          </Card>

          {/* System Alerts */}
          <Card title="System Alerts" icon={<AlertTriangle className="w-5 h-5" />}>
            <div className="space-y-2">
              {notifications.slice(0, 3).map(notif => (
                <div key={notif.id} className={`p-2 rounded text-sm ${
                  notif.type === 'warning' ? 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200' :
                  notif.type === 'error' ? 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200' :
                  notif.type === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200' :
                  'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                }`}>
                  <div className="font-medium">{notif.message}</div>
                  <div className="text-xs opacity-75">{notif.time}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Enhanced User Management */}
      <Card title="User Management" icon={<Users className="w-5 h-5" />}>
        {/* Advanced Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <InputField
            name="search"
            label="Search"
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            placeholder="Name or email"
          />
          <div>
            <label className="block text-sm font-medium mb-1">Role</label>
            <select 
              className="w-full border rounded-md p-2 bg-transparent"
              value={userFilters.role}
              onChange={(e) => setUserFilters(prev => ({ ...prev, role: e.target.value }))}
            >
              <option value="">All Roles</option>
              <option value="platform_admin">Platform Admin</option>
              <option value="school_admin">School Admin</option>
              <option value="teacher_school">School Teacher</option>
              <option value="teacher_individual">Individual Teacher</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select 
              className="w-full border rounded-md p-2 bg-transparent"
              value={userFilters.status}
              onChange={(e) => setUserFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex items-end">
            <Button onClick={() => { setUserPage(0); fetchUsers(); }} isLoading={isLoadingUsers} className="w-full">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedUsers.size > 0 && (
          <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {selectedUsers.size} user(s) selected
              </span>
                <div className="flex items-center gap-3">
                  <label className="text-xs flex items-center gap-1">
                    <input type="checkbox" checked={bulkMode==='bulkEndpoint'} onChange={(e)=> setBulkMode(e.target.checked ? 'bulkEndpoint' : 'apiLoop')} />
                    Use bulk API
                  </label>
                <Button size="sm" variant="secondary" onClick={() => handleBulkAction('activate')}>
                  Activate
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleBulkAction('deactivate')}>
                  Deactivate
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleBulkAction('addCredits')}>
                  Add Credits
                </Button>
                <Button size="sm" variant="danger" onClick={() => handleBulkAction('delete')}>
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Users Table */}
        <div className="overflow-auto rounded border border-neutral-200 dark:border-neutral-800">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900">
              <tr>
                <th className="p-2 text-left">
                  <input 
                    type="checkbox" 
                    checked={selectedUsers.size === users.length && users.length > 0}
                    onChange={selectAllUsers}
                    className="rounded"
                  />
                </th>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Credits</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-t border-neutral-200 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800">
                  <td className="p-2">
                    <input 
                      type="checkbox" 
                      checked={selectedUsers.has(u.id)}
                      onChange={() => toggleUserSelection(u.id)}
                      className="rounded"
                    />
                  </td>
                  <td className="p-2">{u.first_name} {u.last_name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">
                    <select 
                      className="bg-transparent border rounded p-1 text-xs" 
                      value={u.role} 
                      onChange={async (e) => {
                        const role = e.target.value;
                        await api.put(`/admin/users/${u.id}`, { role });
                        fetchUsers();
                      }}
                    >
                      {['platform_admin','school_admin','teacher_school','teacher_individual'].map(r => 
                        <option key={r} value={r}>{r.replace('_', ' ')}</option>
                      )}
                    </select>
                  </td>
                  <td className="p-2">
                    <label className="inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only" checked={!!u.is_active} onChange={async () => { 
                        await api.put(`/admin/users/${u.id}`, { is_active: !u.is_active }); 
                        fetchUsers(); 
                      }} />
                      <div className={`w-8 h-4 rounded-full transition ${u.is_active ? 'bg-green-500' : 'bg-neutral-300'}`}>
                        <div className={`h-4 w-4 bg-white rounded-full shadow transform transition ${u.is_active ? 'translate-x-4' : ''}`}></div>
                      </div>
                    </label>
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-1">
                      <Button size="sm" onClick={async () => { 
                        const amt = Number(prompt('Add credits amount')); 
                        if (amt>0) { 
                          await api.post(`/admin/users/${u.id}/credits`, { type: 'add', amount: amt }); 
                          fetchUsers(); 
                        }
                      }}>
                        <Plus className="w-3 h-3 mr-1" />
                        Add
                      </Button>
                      <Button size="sm" variant="secondary" onClick={async () => { 
                        const amt = Number(prompt('Deduct credits amount')); 
                        if (amt>0) { 
                          await api.post(`/admin/users/${u.id}/credits`, { type: 'deduct', amount: amt }); 
                          fetchUsers(); 
                        }
                      }}>
                        <TrendingDown className="w-3 h-3 mr-1" />
                        Deduct
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex justify-between items-center mt-4 text-sm">
          <div>Total: {usersTotal}</div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" disabled={userPage<=0} onClick={() => setUserPage(p => Math.max(0, p-1))}>
              Previous
            </Button>
            <div>{userPage+1} / {Math.max(1,totalPages)}</div>
            <Button variant="secondary" disabled={(userPage+1)>=totalPages} onClick={() => setUserPage(p => p+1)}>
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* Moderation Queue */}
      <Card title="Moderation Queue" icon={<Shield className="w-5 h-5" />}>
        <div className="flex items-center gap-3 mb-4">
          <label className="text-sm font-medium">Status</label>
          <select 
            className="border rounded p-2 bg-transparent" 
            value={modStatus} 
            onChange={e => { setModStatus(e.target.value as any); setModPage(0); }}
          >
            {['pending','approved','rejected'].map(s => 
              <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            )}
          </select>
        </div>
        
        <div className="overflow-auto rounded border border-neutral-200 dark:border-neutral-800">
          <table className="min-w-full text-sm">
            <thead className="bg-neutral-50 dark:bg-neutral-900">
              <tr>
                <th className="p-2 text-left">Title</th>
                <th className="p-2 text-left">Type</th>
                <th className="p-2 text-left">User</th>
                <th className="p-2 text-left">School</th>
                <th className="p-2 text-left">Created</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {modQueue.map(item => (
                <React.Fragment key={item.id}>
                  <tr className="border-t border-neutral-200 dark:border-neutral-800">
                    <td className="p-2">{item.title}</td>
                    <td className="p-2">{item.file_type}</td>
                    <td className="p-2">{item.first_name} {item.last_name} <span className="text-neutral-500">({item.email})</span></td>
                    <td className="p-2">{item.school_name || '-'}</td>
                    <td className="p-2">{new Date(item.created_at).toLocaleString()}</td>
                    <td className="p-2">
                      {modStatus==='pending' ? (
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => setModEdit({ id: item.id, notes: '', score: '' })}>
                            Decide
                          </Button>
                        </div>
                      ) : (
                        <span className="text-neutral-500">—</span>
                      )}
                    </td>
                  </tr>
                  {modEdit?.id === item.id && modEdit && (
                    <tr className="bg-neutral-50 dark:bg-neutral-900">
                      <td colSpan={6} className="p-3">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                          <div className="md:col-span-3">
                            <label className="block text-sm mb-1">Notes (optional)</label>
                            <textarea className="w-full border rounded p-2 text-sm" rows={2} value={modEdit.notes} onChange={e => setModEdit({ ...modEdit, notes: e.target.value })} />
                          </div>
                          <div>
                            <InputField name="score" label="Quality score (0-10)" type="number" value={modEdit.score} onChange={e => setModEdit({ ...modEdit, score: e.target.value })} />
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={async ()=>{ 
                              await api.post(`/admin/moderation/${item.id}/decision`, { 
                                status: 'approved', 
                                notes: modEdit?.notes || undefined, 
                                quality_score: modEdit?.score ? Number(modEdit.score) : undefined 
                              }); 
                              setModEdit(null); 
                              fetchModerationQueue(); 
                              fetchQuality(); 
                            }}>
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="secondary" onClick={async ()=>{ 
                              await api.post(`/admin/moderation/${item.id}/decision`, { 
                                status: 'rejected', 
                                notes: modEdit?.notes || undefined, 
                                quality_score: modEdit?.score ? Number(modEdit.score) : undefined 
                              }); 
                              setModEdit(null); 
                              fetchModerationQueue(); 
                              fetchQuality(); 
                            }}>
                              <X className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                            <Button size="sm" variant="danger" onClick={()=> setModEdit(null)}>
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="flex justify-between items-center mt-4 text-sm">
          <div>Total: {modTotal}</div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" disabled={modPage<=0} onClick={() => setModPage(p => Math.max(0, p-1))}>
              Previous
            </Button>
            <div>{modPage+1} / {Math.max(1, Math.ceil(modTotal / modPageSize))}</div>
            <Button variant="secondary" disabled={(modPage+1)>=Math.ceil(modTotal / modPageSize)} onClick={() => setModPage(p => p+1)}>
              Next
            </Button>
          </div>
        </div>
      </Card>

      {/* API Testing */}
      <Card title="API Testing" icon={<Database className="w-5 h-5" />}>
        <ApiTester />
      </Card>

      {/* Notification Panel */}
      {showNotificationPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-end p-4 z-50">
          <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl w-96 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Notifications</h3>
                <Button variant="secondary" size="sm" onClick={() => setShowNotificationPanel(false)}>
                  Close
                </Button>
              </div>
            </div>
            <div className="p-4 space-y-3">
              {notifications.map(notif => (
                <div key={notif.id} className={`p-3 rounded-lg ${
                  notif.type === 'warning' ? 'bg-yellow-50 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200' :
                  notif.type === 'error' ? 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200' :
                  notif.type === 'success' ? 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200' :
                  'bg-blue-50 text-blue-800 dark:bg-blue-950 dark:text-blue-200'
                }`}>
                  <div className="font-medium">{notif.message}</div>
                  <div className="text-xs opacity-75 mt-1">{notif.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ApiTester: React.FC = () => {
  const [method, setMethod] = useState<'GET'|'POST'|'PUT'|'DELETE'>('GET');
  const [path, setPath] = useState('/admin/ping');
  const [body, setBody] = useState('{}');
  const [resp, setResp] = useState<any>(null);

  const send = async () => {
    try {
      const url = path.startsWith('/api') ? path.replace('/api','') : path;
      if (method === 'GET' || method === 'DELETE') {
        const fn = method === 'GET' ? api.get : api.delete;
        const r = await fn<any>(url);
        setResp(r.data);
      } else {
        const data = body ? JSON.parse(body) : undefined;
        const fn = method === 'POST' ? api.post : api.put;
        const r = await fn<any>(url, data);
        setResp(r.data);
      }
    } catch (e: any) {
      setResp({ error: e?.response?.data || String(e) });
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-center">
        <select className="border rounded p-2" value={method} onChange={e => setMethod(e.target.value as any)}>
          {['GET','POST','PUT','DELETE'].map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input className="flex-1 border rounded p-2" value={path} onChange={e => setPath(e.target.value)} placeholder="/admin/..." />
        <Button onClick={send}>Send</Button>
      </div>
      {(method==='POST'||method==='PUT') && (
        <textarea className="w-full border rounded p-2 font-mono text-xs" rows={6} value={body} onChange={e => setBody(e.target.value)} />
      )}
      <pre className="bg-neutral-950 text-neutral-100 p-3 rounded text-xs overflow-auto max-h-80">{JSON.stringify(resp, null, 2)}</pre>
    </div>
  );
};

export default DeveloperAdminPage;


