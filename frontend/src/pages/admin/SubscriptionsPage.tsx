import React, { useState, useEffect } from 'react';
import { CreditCard, Search, Filter, Plus, Edit, Trash2, Calendar, DollarSign,  Building2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card, Button, Badge, Input } from '../../components/ui';


interface Subscription {
  id: string;
  schoolId: string;
  schoolName: string;
  plan: 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'expired' | 'cancelled' | 'pending' | 'overdue';
  startDate: Date;
  endDate: Date;
  renewalDate: Date;
  monthlyPrice: number;
  totalPrice: number;
  creditsPerMonth: number;
  totalCredits: number;
  usedCredits: number;
  remainingCredits: number;
  autoRenew: boolean;
  paymentMethod: string;
  lastPayment: Date;
  nextPayment: Date;
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
}

const SubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [selectedSubscriptions, setSelectedSubscriptions] = useState<string[]>([]);

  useEffect(() => {
    // Simulate API call for subscriptions data
    const fetchSubscriptions = async () => {
      setLoading(true);
      // In real implementation, this would be an API call
      setTimeout(() => {
        const mockSubscriptions: Subscription[] = [
          {
            id: '1',
            schoolId: 'school1',
            schoolName: 'Gymnázium Jana Nerudy',
            plan: 'premium',
            status: 'active',
            startDate: new Date('2023-09-01'),
            endDate: new Date('2024-08-31'),
            renewalDate: new Date('2024-08-31'),
            monthlyPrice: 2990,
            totalPrice: 35880,
            creditsPerMonth: 1000,
            totalCredits: 12000,
            usedCredits: 450,
            remainingCredits: 11550,
            autoRenew: true,
            paymentMethod: 'Bankovní převod',
            lastPayment: new Date('2024-01-01'),
            nextPayment: new Date('2024-02-01'),
            contactPerson: 'Mgr. Jan Novák',
            contactEmail: 'novak@gymnazium-neruda.cz',
            contactPhone: '+420 123 456 789'
          },
          {
            id: '2',
            schoolId: 'school2',
            schoolName: 'ZŠ TGM',
            plan: 'basic',
            status: 'active',
            startDate: new Date('2023-08-15'),
            endDate: new Date('2024-08-14'),
            renewalDate: new Date('2024-08-14'),
            monthlyPrice: 1490,
            totalPrice: 17880,
            creditsPerMonth: 500,
            totalCredits: 6000,
            usedCredits: 320,
            remainingCredits: 5680,
            autoRenew: true,
            paymentMethod: 'Kreditní karta',
            lastPayment: new Date('2024-01-15'),
            nextPayment: new Date('2024-02-15'),
            contactPerson: 'Mgr. Marie Svobodová',
            contactEmail: 'svobodova@zs-tgm.cz',
            contactPhone: '+420 987 654 321'
          },
          {
            id: '3',
            schoolId: 'school3',
            schoolName: 'SŠ technická',
            plan: 'enterprise',
            status: 'pending',
            startDate: new Date('2024-01-01'),
            endDate: new Date('2024-12-31'),
            renewalDate: new Date('2024-12-31'),
            monthlyPrice: 5990,
            totalPrice: 71880,
            creditsPerMonth: 2000,
            totalCredits: 24000,
            usedCredits: 0,
            remainingCredits: 24000,
            autoRenew: false,
            paymentMethod: 'Faktura',
            lastPayment: new Date('2024-01-01'),
            nextPayment: new Date('2024-02-01'),
            contactPerson: 'Ing. Petr Černý',
            contactEmail: 'cerny@sst-technicka.cz',
            contactPhone: '+420 555 123 456'
          },
          {
            id: '4',
            schoolId: 'school4',
            schoolName: 'ZŠ Komenského',
            plan: 'basic',
            status: 'expired',
            startDate: new Date('2023-06-01'),
            endDate: new Date('2023-11-30'),
            renewalDate: new Date('2023-11-30'),
            monthlyPrice: 1490,
            totalPrice: 8940,
            creditsPerMonth: 500,
            totalCredits: 3000,
            usedCredits: 280,
            remainingCredits: 0,
            autoRenew: false,
            paymentMethod: 'Bankovní převod',
            lastPayment: new Date('2023-11-01'),
            nextPayment: new Date('2023-12-01'),
            contactPerson: 'Mgr. Anna Veselá',
            contactEmail: 'vesela@zs-komenskeho.cz',
            contactPhone: '+420 777 888 999'
          },
          {
            id: '5',
            schoolId: 'school5',
            schoolName: 'Gymnázium Botičská',
            plan: 'premium',
            status: 'overdue',
            startDate: new Date('2023-10-01'),
            endDate: new Date('2024-09-30'),
            renewalDate: new Date('2024-09-30'),
            monthlyPrice: 2990,
            totalPrice: 35880,
            creditsPerMonth: 1000,
            totalCredits: 12000,
            usedCredits: 890,
            remainingCredits: 11110,
            autoRenew: true,
            paymentMethod: 'Kreditní karta',
            lastPayment: new Date('2023-12-01'),
            nextPayment: new Date('2024-01-01'),
            contactPerson: 'PhDr. Tomáš Malý',
            contactEmail: 'maly@gymnazium-boticka.cz',
            contactPhone: '+420 111 222 333'
          }
        ];
        setSubscriptions(mockSubscriptions);
        setLoading(false);
      }, 1000);
    };

    fetchSubscriptions();
  }, []);

  const getPlanColor = (plan: Subscription['plan']) => {
    switch (plan) {
      case 'basic':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'premium':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'enterprise':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'expired':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPlanName = (plan: Subscription['plan']) => {
    switch (plan) {
      case 'basic':
        return 'Základní';
      case 'premium':
        return 'Premium';
      case 'enterprise':
        return 'Enterprise';
      default:
        return 'Neznámý';
    }
  };

  const getStatusName = (status: Subscription['status']) => {
    switch (status) {
      case 'active':
        return 'Aktivní';
      case 'expired':
        return 'Expirované';
      case 'cancelled':
        return 'Zrušené';
      case 'pending':
        return 'Čekající';
      case 'overdue':
        return 'Po splatnosti';
      default:
        return 'Neznámý';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('cs-CZ');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK'
    }).format(amount);
  };

  const activateSubscription = (id: string) => {
    setSubscriptions(prev => 
      prev.map(sub => 
        sub.id === id 
          ? { ...sub, status: 'active' as const }
          : sub
      )
    );
  };

  const cancelSubscription = (id: string) => {
    setSubscriptions(prev => 
      prev.map(sub => 
        sub.id === id 
          ? { ...sub, status: 'cancelled' as const }
          : sub
      )
    );
  };

  const renewSubscription = (id: string) => {
    setSubscriptions(prev => 
      prev.map(sub => 
        sub.id === id 
          ? { 
              ...sub, 
              status: 'active' as const,
              endDate: new Date(sub.endDate.getTime() + 365 * 24 * 60 * 60 * 1000),
              renewalDate: new Date(sub.endDate.getTime() + 365 * 24 * 60 * 60 * 1000)
            }
          : sub
      )
    );
  };

  const deleteSubscription = (id: string) => {
    setSubscriptions(prev => prev.filter(sub => sub.id !== id));
  };

  const deleteSelected = () => {
    setSubscriptions(prev => prev.filter(sub => !selectedSubscriptions.includes(sub.id)));
    setSelectedSubscriptions([]);
  };

  const toggleSelection = (id: string) => {
    setSelectedSubscriptions(prev => 
      prev.includes(id) 
        ? prev.filter(s => s !== id)
        : [...prev, id]
    );
  };

  const filteredSubscriptions = subscriptions.filter(subscription => {
    const matchesSearch = searchQuery === '' || 
      subscription.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      subscription.contactEmail.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || subscription.status === statusFilter;
    const matchesPlan = planFilter === 'all' || subscription.plan === planFilter;

    return matchesSearch && matchesStatus && matchesPlan;
  });

  const totalRevenue = subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((sum, sub) => sum + sub.monthlyPrice, 0);

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;
  const pendingSubscriptions = subscriptions.filter(sub => sub.status === 'pending').length;
  const overdueSubscriptions = subscriptions.filter(sub => sub.status === 'overdue').length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Načítání předplatných...</div>
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
            <h1 className="text-2xl font-bold text-gray-900">Správa předplatných</h1>
            <p className="text-gray-600">Přehled a správa všech předplatných škol</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button
              onClick={() => {}}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nové předplatné</span>
            </Button>
            {selectedSubscriptions.length > 0 && (
              <Button
                variant="danger"
                onClick={deleteSelected}
                className="flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Smazat vybrané ({selectedSubscriptions.length})</span>
              </Button>
            )}
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Celkem předplatných</p>
                <p className="text-2xl font-bold text-gray-900">{subscriptions.length}</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktivní</p>
                <p className="text-2xl font-bold text-green-600">{activeSubscriptions}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Čekající</p>
                <p className="text-2xl font-bold text-yellow-600">{pendingSubscriptions}</p>
              </div>
              <Calendar className="w-8 h-8 text-yellow-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Po splatnosti</p>
                <p className="text-2xl font-bold text-orange-600">{overdueSubscriptions}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-orange-600" />
            </div>
          </Card>
        </div>

        {/* Revenue Summary */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Měsíční příjmy</h3>
            <DollarSign className="w-6 h-6 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-600">
            {formatCurrency(totalRevenue)}
            <span className="text-lg text-gray-500 ml-2">/ měsíc</span>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Z {activeSubscriptions} aktivních předplatných
          </p>
        </Card>

        {/* Filters and Search */}
        <Card className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex flex-wrap items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Filtry:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Všechny stavy</option>
                <option value="active">Aktivní</option>
                <option value="expired">Expirované</option>
                <option value="cancelled">Zrušené</option>
                <option value="pending">Čekající</option>
                <option value="overdue">Po splatnosti</option>
              </select>
              <select
                value={planFilter}
                onChange={(e) => setPlanFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Všechny plány</option>
                <option value="basic">Základní</option>
                <option value="premium">Premium</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Hledat předplatné..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full lg:w-80"
              />
            </div>
          </div>
        </Card>

        {/* Subscriptions Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedSubscriptions.length === filteredSubscriptions.length && filteredSubscriptions.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSubscriptions(filteredSubscriptions.map(s => s.id));
                        } else {
                          setSelectedSubscriptions([]);
                        }
                      }}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Škola
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stav
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cena
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kredity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Platby
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredSubscriptions.map((subscription) => (
                  <tr key={subscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedSubscriptions.includes(subscription.id)}
                        onChange={() => toggleSelection(subscription.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {subscription.schoolName}
                          </div>
                          <div className="text-sm text-gray-500">{subscription.contactPerson}</div>
                          <div className="text-sm text-gray-500">{subscription.contactEmail}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className={getPlanColor(subscription.plan)}>
                        {getPlanName(subscription.plan)}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {subscription.creditsPerMonth} kreditů/měsíc
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className={getStatusColor(subscription.status)}>
                        {getStatusName(subscription.status)}
                      </Badge>
                      <div className="text-xs text-gray-500 mt-1">
                        {subscription.autoRenew ? 'Auto-obnovení' : 'Manuální obnovení'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>{formatCurrency(subscription.monthlyPrice)}/měsíc</div>
                        <div className="text-gray-500">Celkem: {formatCurrency(subscription.totalPrice)}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Použito: {subscription.usedCredits}</div>
                        <div className="text-green-600">Zbývá: {subscription.remainingCredits}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        Celkem: {subscription.totalCredits}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <div>Poslední: {formatDate(subscription.lastPayment)}</div>
                        <div className="text-blue-600">Další: {formatDate(subscription.nextPayment)}</div>
                      </div>
                      <div className="text-xs text-gray-500">
                        {subscription.paymentMethod}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {}}
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {subscription.status === 'pending' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => activateSubscription(subscription.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {subscription.status === 'active' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => cancelSubscription(subscription.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                        {subscription.status === 'expired' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => renewSubscription(subscription.id)}
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteSubscription(subscription.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default SubscriptionsPage;
