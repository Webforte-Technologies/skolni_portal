import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Plus, TrendingUp, TrendingDown, Users, 
  Building2, Download, Filter, 
  AlertTriangle, CheckCircle, Clock, Zap
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';

interface CreditTransaction {
  id: string;
  user_id: string;
  user_name: string;
  school_name?: string;
  type: 'purchase' | 'usage' | 'refund' | 'bonus' | 'deduction';
  amount: number;
  balance_before: number;
  balance_after: number;
  description: string;
  created_at: string;
  status: 'completed' | 'pending' | 'failed';
}

interface CreditAnalytics {
  total_balance: number;
  total_purchased: number;
  total_used: number;
  active_users: number;
  monthly_usage: Array<{ month: string; amount: number }>;
  monthly_purchases: Array<{ month: string; amount: number }>;
  top_users: Array<{ user_id: string; name: string; usage: number }>;
  top_schools: Array<{ school_id: string; name: string; usage: number }>;
}

const CreditsManagementPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<CreditAnalytics | null>(null);
  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [showFilters, setShowFilters] = useState(false);

  const { showToast } = useToast();

  const fetchAnalytics = async () => {
    try {
      const res = await api.get<any>('/admin/credits/analytics');
      setAnalytics(res.data.data);
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při načítání analytiky' });
    }
  };

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get<any>(`/admin/credits/transactions?period=${selectedPeriod}`);
      setTransactions(res.data.data || []);
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při načítání transakcí' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [selectedPeriod]);

  const getTransactionTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'purchase': 'bg-green-100 text-green-800',
      'usage': 'bg-red-100 text-red-800',
      'refund': 'bg-blue-100 text-blue-800',
      'bonus': 'bg-purple-100 text-purple-800',
      'deduction': 'bg-orange-100 text-orange-800'
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  };

  const getTransactionTypeName = (type: string) => {
    const nameMap: Record<string, string> = {
      'purchase': 'Nákup',
      'usage': 'Využití',
      'refund': 'Vratka',
      'bonus': 'Bonus',
      'deduction': 'Srážka'
    };
    return nameMap[type] || type;
  };

  const getTransactionIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      'purchase': <Plus className="w-4 h-4" />,
      'usage': <TrendingDown className="w-4 h-4" />,
      'refund': <TrendingUp className="w-4 h-4" />,
      'bonus': <Zap className="w-4 h-4" />,
      'deduction': <AlertTriangle className="w-4 h-4" />
    };
    return iconMap[type] || <CreditCard className="w-4 h-4" />;
  };

  const exportTransactions = async () => {
    try {
      const res = await api.get('/admin/credits/transactions/export', { responseType: 'blob' });
      // When responseType is 'blob', res.data is directly a Blob
      const blob = res.data as unknown as Blob;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `credits-transactions-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      showToast({ type: 'success', message: 'Export transakcí byl stažen' });
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při exportu' });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Správa kreditů</h1>
          <p className="text-gray-600 mt-1">Přehled a správa kreditového systému</p>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={exportTransactions} variant="secondary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="primary">
            <Plus className="w-4 h-4 mr-2" />
            Přidat kredity
          </Button>
        </div>
      </div>

      {/* Analytics Overview */}
      {analytics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="text-sm text-blue-700">Celkový zůstatek</div>
                <div className="text-2xl font-bold text-blue-900">
                  {analytics.total_balance.toLocaleString()}
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <div className="text-sm text-green-700">Celkem zakoupeno</div>
                <div className="text-2xl font-bold text-green-900">
                  {analytics.total_purchased.toLocaleString()}
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-rose-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <div className="text-sm text-red-700">Celkem použito</div>
                <div className="text-2xl font-bold text-red-900">
                  {analytics.total_used.toLocaleString()}
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <div className="text-sm text-purple-700">Aktivní uživatelé</div>
                <div className="text-2xl font-bold text-purple-900">
                  {analytics.active_users}
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Využití kreditů" icon={<TrendingDown className="w-5 h-5" />}>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <TrendingDown className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">Graf využití kreditů</p>
              <p className="text-xs text-gray-400">Implementace v další fázi</p>
            </div>
          </div>
        </Card>

        <Card title="Nákupy kreditů" icon={<TrendingUp className="w-5 h-5" />}>
          <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p className="text-gray-500">Graf nákupů kreditů</p>
              <p className="text-xs text-gray-400">Implementace v další fázi</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Top Users and Schools */}
      {analytics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Nejaktivnější uživatelé" icon={<Users className="w-5 h-5" />}>
            <div className="space-y-3">
              {analytics.top_users.map((user, index) => (
                <div key={user.user_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-700 text-sm font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">ID: {user.user_id}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">{user.usage.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">kreditů</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Nejaktivnější školy" icon={<Building2 className="w-5 h-5" />}>
            <div className="space-y-3">
              {analytics.top_schools.map((school, index) => (
                <div key={school.school_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-700 text-sm font-medium">{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{school.name}</div>
                      <div className="text-sm text-gray-500">ID: {school.school_id}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-red-600">{school.usage.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">kreditů</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Transactions */}
      <Card title="Transakce kreditů" icon={<CreditCard className="w-5 h-5" />}>
        {/* Filters */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Období:</span>
            <select 
              className="border border-gray-300 rounded-md p-2 bg-white"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <option value="7d">Posledních 7 dní</option>
              <option value="30d">Posledních 30 dní</option>
              <option value="90d">Posledních 90 dní</option>
              <option value="1y">Poslední rok</option>
            </select>
          </div>
          
          <Button 
            variant="secondary" 
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filtry
          </Button>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Uživatel</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Typ</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Množství</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Zůstatek</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Popis</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Datum</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Stav</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">{transaction.user_name}</div>
                      {transaction.school_name && (
                        <div className="text-sm text-gray-500">{transaction.school_name}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`p-2 rounded ${getTransactionTypeColor(transaction.type)}`}>
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <span className="text-sm font-medium">
                        {getTransactionTypeName(transaction.type)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-medium ${
                      transaction.type === 'purchase' || transaction.type === 'refund' || transaction.type === 'bonus'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'purchase' || transaction.type === 'refund' || transaction.type === 'bonus' ? '+' : '-'}
                      {transaction.amount.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <div className="text-gray-500">Před: {transaction.balance_before.toLocaleString()}</div>
                      <div className="font-medium">Po: {transaction.balance_after.toLocaleString()}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {transaction.description}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-500">
                      {new Date(transaction.created_at).toLocaleDateString('cs-CZ')}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status === 'completed' ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Dokončeno
                        </>
                      ) : transaction.status === 'pending' ? (
                        <>
                          <Clock className="w-3 h-3 mr-1" />
                          Čeká
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Selhalo
                        </>
                      )}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {!loading && transactions.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné transakce</h3>
            <p className="text-gray-500">Pro vybrané období nebyly nalezeny žádné transakce.</p>
          </div>
        )}
      </Card>
      </div>
    </AdminLayout>
  );
};

export default CreditsManagementPage;
