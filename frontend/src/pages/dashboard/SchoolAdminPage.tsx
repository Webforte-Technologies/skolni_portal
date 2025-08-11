import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import { api } from '../../services/apiClient';
import { ArrowLeft, Search, CreditCard, Calendar, Users, TrendingUp } from 'lucide-react';

interface TeacherForm {
  email: string;
  first_name: string;
  last_name: string;
  password: string;
}

interface CreditUsage {
  teacher_id: string;
  teacher_name: string;
  credits_used: number;
  last_used: string;
}

const SchoolAdminPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [teachers, setTeachers] = useState<any[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [, setSchool] = useState<any | null>(null);
  const [schoolForm, setSchoolForm] = useState<{ name?: string; address?: string; city?: string; postal_code?: string; contact_email?: string; contact_phone?: string }>({});
  const [form, setForm] = useState<TeacherForm>({ email: '', first_name: '', last_name: '', password: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [creditUsage, setCreditUsage] = useState<CreditUsage[]>([]);
  const [subscriptionInfo, setSubscriptionInfo] = useState<{
    plan: string;
    renewal_date: string;
    total_credits: number;
    credits_used: number;
    monthly_usage: number;
  } | null>(null);
  const [showAddCreditsForm, setShowAddCreditsForm] = useState(false);
  const [addCreditsAmount, setAddCreditsAmount] = useState('');
  const [addCreditsDescription, setAddCreditsDescription] = useState('');
  const [showAllocationForm, setShowAllocationForm] = useState(false);
  const [allocationTeacherId, setAllocationTeacherId] = useState('');
  const [allocationAmount, setAllocationAmount] = useState('');
  const [allocationDescription, setAllocationDescription] = useState('');
  const [creditAllocation, setCreditAllocation] = useState<any>(null);

  const loadTeachers = async () => {
    if (!user?.school_id) return;
    setIsLoading(true);
    try {
      const res = await api.get<any[]>(`/schools/${user.school_id}/teachers`);
      if (res.data.success) {
        const teachersData = res.data.data as any[];
        setTeachers(teachersData);
        setFilteredTeachers(teachersData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadSchool = async () => {
    if (!user?.school_id) return;
    const res = await api.get<any>(`/schools/${user.school_id}`);
    if (res.data.success) {
      setSchool(res.data.data);
      setSchoolForm({
        name: res.data.data.name,
        address: res.data.data.address || '',
        city: res.data.data.city || '',
        postal_code: res.data.data.postal_code || '',
        contact_email: res.data.data.contact_email || '',
        contact_phone: res.data.data.contact_phone || ''
      });
    }
  };

  const loadCreditUsage = async () => {
    if (!user?.school_id) return;
    try {
      const res = await api.get(`/schools/${user.school_id}/credit-stats`);
      if (res.data.success) {
        const data = res.data.data as any;
        setCreditUsage(data.teacher_usage.map((t: any) => ({
          teacher_id: t.teacher_id,
          teacher_name: `${t.first_name} ${t.last_name}`,
          credits_used: t.credits_used,
          last_used: t.last_used || new Date().toISOString()
        })));
        
        // Update subscription info with real data
        if (data.subscription) {
          setSubscriptionInfo({
            plan: data.subscription.plan,
            renewal_date: data.subscription.renewal_date,
            total_credits: data.total_credits,
            credits_used: data.monthly_usage,
            monthly_usage: data.monthly_usage
          });
        }
      }
    } catch (error) {
      console.error('Failed to load credit usage:', error);
      // Fallback to mock data if API fails
      const mockCreditUsage: CreditUsage[] = [
        { teacher_id: '1', teacher_name: 'Jan Novák', credits_used: 45, last_used: '2024-01-15' },
        { teacher_id: '2', teacher_name: 'Marie Svobodová', credits_used: 32, last_used: '2024-01-14' },
        { teacher_id: '3', teacher_name: 'Petr Černý', credits_used: 28, last_used: '2024-01-13' },
      ];
      setCreditUsage(mockCreditUsage);
    }
  };

  const loadSubscriptionInfo = async () => {
    if (!user?.school_id) return;
    try {
      const res = await api.get(`/schools/${user.school_id}/credit-stats`);
      if (res.data.success) {
        const data = res.data.data as any;
        if (data.subscription) {
          setSubscriptionInfo({
            plan: data.subscription.plan,
            renewal_date: data.subscription.renewal_date,
            total_credits: data.total_credits,
            credits_used: data.monthly_usage,
            monthly_usage: data.monthly_usage
          });
        } else {
          // Fallback if no subscription data
          setSubscriptionInfo({
            plan: 'Basic',
            renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            total_credits: data.total_credits || 0,
            credits_used: data.monthly_usage || 0,
            monthly_usage: data.monthly_usage || 0
          });
        }
      }
    } catch (error) {
      console.error('Failed to load subscription info:', error);
      // Fallback to mock data if API fails
      setSubscriptionInfo({
        plan: 'Premium',
        renewal_date: '2024-12-31',
        total_credits: 1000,
        credits_used: 105,
        monthly_usage: 105
      });
    }
  };

  const loadCreditAllocation = async () => {
    if (!user?.school_id) return;
    try {
      const res = await api.get(`/schools/${user.school_id}/credit-allocation`);
      if (res.data.success) {
        setCreditAllocation(res.data.data);
      }
    } catch (error) {
      console.error('Failed to load credit allocation:', error);
    }
  };

  const allocateCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.school_id) return;
    
    const amount = parseInt(allocationAmount);
    if (!amount || amount <= 0 || !allocationTeacherId) {
      showToast({ type: 'error', message: 'Zadejte platný počet kreditů a vyberte učitele' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post(`/schools/${user.school_id}/allocate-credits`, {
        teacherId: allocationTeacherId,
        amount,
        description: allocationDescription || 'Credit allocation'
      });
      
      if (res.data.success) {
        // Reset form
        setAllocationAmount('');
        setAllocationDescription('');
        setAllocationTeacherId('');
        setShowAllocationForm(false);
        
        // Reload data
        await loadCreditAllocation();
        await loadCreditUsage();
        await loadSubscriptionInfo();
        
        // Show success message
        showToast({ type: 'success', message: `Úspěšně přiděleno ${amount} kreditů učiteli ${(res.data.data as any).teacher_name}!` });
      }
    } catch (error: any) {
      console.error('Failed to allocate credits:', error);
      showToast({ type: 'error', message: error.response?.data?.error || 'Nepodařilo se přidělit kredity. Zkuste to prosím znovu.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    loadTeachers(); 
    loadSchool(); 
    loadCreditUsage();
    loadSubscriptionInfo();
    loadCreditAllocation();
  }, []);

  // Filter teachers based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTeachers(teachers);
    } else {
      const filtered = teachers.filter(teacher =>
        teacher.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTeachers(filtered);
    }
  }, [searchTerm, teachers]);

  const addTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.school_id) return;
    setIsLoading(true);
    try {
      await api.post(`/schools/${user.school_id}/teachers`, form);
      setForm({ email: '', first_name: '', last_name: '', password: '' });
      await loadTeachers();
    } finally {
      setIsLoading(false);
    }
  };

  const deactivateTeacher = async (id: string) => {
    if (!user?.school_id) return;
    setIsLoading(true);
    try {
      await api.delete(`/schools/${user.school_id}/teachers/${id}`);
      await loadTeachers();
    } finally {
      setIsLoading(false);
    }
  };

  const saveSchool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.school_id) return;
    setIsLoading(true);
    try {
      const res = await api.put(`/schools/${user.school_id}`, schoolForm);
      if (res.data.success) {
        setSchool(res.data.data);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const addCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.school_id) return;
    
    const amount = parseInt(addCreditsAmount);
    if (!amount || amount <= 0) {
      showToast({ type: 'error', message: 'Zadejte platný počet kreditů' });
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post(`/schools/${user.school_id}/add-credits`, {
        amount,
        description: addCreditsDescription || 'Demo credit addition'
      });
      
      if (res.data.success) {
        // Reset form
        setAddCreditsAmount('');
        setAddCreditsDescription('');
        setShowAddCreditsForm(false);
        
        // Reload credit data
        await loadCreditUsage();
        await loadSubscriptionInfo();
        
        // Show success message
        showToast({ type: 'success', message: `Úspěšně přidáno ${amount} kreditů do vaší školy!` });
      }
    } catch (error) {
      console.error('Failed to add credits:', error);
      showToast({ type: 'error', message: 'Nepodařilo se přidat kredity. Zkuste to prosím znovu.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back to Dashboard Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="secondary" 
              onClick={() => window.history.back()}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Zpět na dashboard</span>
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-neutral-100">Správa školy</h1>
          </div>
        </div>

        {/* Credit Allocation Section */}
        <Card title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <span>Správa přidělení kreditů</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setShowAllocationForm(!showAllocationForm)}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Přidělit kredity učiteli</span>
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={loadCreditAllocation}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Obnovit</span>
              </Button>
            </div>
          </div>
        }>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700/50">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Celkem kreditů školy</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {creditAllocation?.total_credits || 0}
              </p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 p-4 rounded-lg border border-green-200 dark:border-green-700/50">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Přidělené učitelům</span>
              </div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {creditAllocation?.allocated_credits || 0}
              </p>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/30 p-4 rounded-lg border border-yellow-200 dark:border-yellow-700/50">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">Nepřidělené kredity</span>
              </div>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                {creditAllocation?.unallocated_credits || 0}
              </p>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/30 p-4 rounded-lg border border-purple-200 dark:border-purple-700/50">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Aktivní učitelé</span>
              </div>
              <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                {creditAllocation?.active_teachers || 0}
              </p>
            </div>
          </div>

          {/* Credit Allocation Form */}
          {showAllocationForm && (
            <div className="border-t border-gray-200 dark:border-neutral-800 pt-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-neutral-100 mb-4">Přidělit kredity učiteli</h4>
              <form onSubmit={allocateCredits} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                    Učitel
                  </label>
                  <select
                    value={allocationTeacherId}
                    onChange={(e) => setAllocationTeacherId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 dark:bg-neutral-800 dark:text-neutral-100"
                    required
                  >
                    <option value="">Vyberte učitele</option>
                    {teachers.filter(t => t.is_active).map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.first_name} {teacher.last_name} ({teacher.email})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                    Počet kreditů
                  </label>
                  <InputField
                    name="allocation_amount"
                    type="number"
                    min="1"
                    max={creditAllocation?.unallocated_credits || 0}
                    placeholder="50"
                    value={allocationAmount}
                    onChange={(e) => setAllocationAmount(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                    Popis (volitelné)
                  </label>
                  <InputField
                    name="allocation_description"
                    placeholder="Měsíční přidělení, bonus, atd."
                    value={allocationDescription}
                    onChange={(e) => setAllocationDescription(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    type="submit" 
                    disabled={isLoading || !allocationAmount || !allocationTeacherId}
                    className="flex items-center space-x-2"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Přidělit</span>
                  </Button>
                  <Button 
                    type="button" 
                    variant="secondary"
                    onClick={() => {
                      setShowAllocationForm(false);
                      setAllocationAmount('');
                      setAllocationDescription('');
                      setAllocationTeacherId('');
                    }}
                  >
                    Zrušit
                  </Button>
                </div>
              </form>
              <p className="text-sm text-neutral-500 mt-2">
                💡 <strong>Přidělení kreditů:</strong> Kredity budou přiděleny konkrétnímu učiteli a odečteny z celkového fondu školy.
              </p>
            </div>
          )}

          <div className="border-t border-gray-200 dark:border-neutral-800 pt-4">
            <h4 className="text-lg font-medium text-gray-900 dark:text-neutral-100 mb-4">Přehled přidělení kreditů učitelům</h4>
            {creditAllocation?.teachers && creditAllocation.teachers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-800">
                  <thead className="bg-gray-50 dark:bg-neutral-800">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Učitel</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Přidělené kredity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Použité kredity</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Dostupné kredity</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-800">
                    {creditAllocation.teachers.map((teacher: any) => (
                      <tr key={teacher.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-neutral-100">
                          {teacher.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-400">
                          {teacher.allocated_credits}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-400">
                          {teacher.credits_used}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-400">
                          <span className={`font-semibold ${teacher.available_credits > 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {teacher.available_credits}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-neutral-500 text-center py-4">
                Žádní učitelé nebyli nalezeni nebo nemají přidělené kredity.
              </p>
            )}
          </div>
        </Card>

        {/* Credit Management Section */}
        <Card title={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5 text-primary-600" />
              <span>Správa kreditů</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setShowAddCreditsForm(!showAddCreditsForm)}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>Přidat kredity</span>
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => { loadCreditUsage(); loadSubscriptionInfo(); }}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Obnovit</span>
              </Button>
            </div>
          </div>
        }>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/30 p-4 rounded-lg border border-primary-200 dark:border-primary-700/50">
              <div className="flex items-center space-x-2 mb-2">
                <CreditCard className="h-5 w-5 text-primary-600" />
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">Celkem kreditů</span>
              </div>
              <p className="text-2xl font-bold text-primary-900 dark:text-primary-100">
                {subscriptionInfo?.total_credits || 0}
              </p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/30 p-4 rounded-lg border border-green-200 dark:border-green-700/50">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Použito tento měsíc</span>
              </div>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {subscriptionInfo?.monthly_usage || 0}
              </p>
            </div>
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/30 p-4 rounded-lg border border-blue-200 dark:border-blue-700/50">
              <div className="flex items-center space-x-2 mb-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Dostupné kredity</span>
              </div>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {(subscriptionInfo?.total_credits || 0) - (subscriptionInfo?.credits_used || 0)}
              </p>
            </div>
          </div>
          
          {/* Add Credits Form */}
          {showAddCreditsForm && (
            <div className="border-t border-gray-200 dark:border-neutral-800 pt-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-neutral-100 mb-4">Přidat kredity do školy</h4>
              <form onSubmit={addCredits} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                    Počet kreditů
                  </label>
                  <InputField
                    name="credits_amount"
                    type="number"
                    min="1"
                    placeholder="100"
                    value={addCreditsAmount}
                    onChange={(e) => setAddCreditsAmount(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-neutral-300 mb-2">
                    Popis (volitelné)
                  </label>
                  <InputField
                    name="credits_description"
                    placeholder="Demo kredity, bonus, atd."
                    value={addCreditsDescription}
                    onChange={(e) => setAddCreditsDescription(e.target.value)}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    type="submit" 
                    disabled={isLoading || !addCreditsAmount}
                    className="flex items-center space-x-2"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Přidat kredity</span>
                  </Button>
                  <Button 
                    type="button" 
                    variant="secondary"
                    onClick={() => {
                      setShowAddCreditsForm(false);
                      setAddCreditsAmount('');
                      setAddCreditsDescription('');
                    }}
                  >
                    Zrušit
                  </Button>
                </div>
              </form>
              <p className="text-sm text-neutral-500 mt-2">
                💡 <strong>Demo funkce:</strong> Kredity budou rovnoměrně rozděleny mezi všechny aktivní uživatele školy.
              </p>
            </div>
          )}
          
          <div className="border-t border-gray-200 dark:border-neutral-800 pt-4">
              <h4 className="text-lg font-medium text-gray-900 dark:text-neutral-100 mb-4">Využití kreditů podle učitelů</h4>
              {isLoading ? (
                <div className="text-center py-8">
                  <div className="inline-flex items-center space-x-2 text-sm text-neutral-500">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Načítání statistik...</span>
                  </div>
                </div>
              ) : (
              <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-neutral-800">
                <thead className="bg-gray-50 dark:bg-neutral-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Učitel</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Použité kredity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-neutral-400 uppercase tracking-wider">Poslední použití</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-neutral-900 divide-y divide-gray-200 dark:divide-neutral-800">
                  {creditUsage.map((usage) => (
                    <tr key={usage.teacher_id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-neutral-100">
                        {usage.teacher_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-400">
                        {usage.credits_used}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-neutral-400">
                        {new Date(usage.last_used).toLocaleDateString('cs-CZ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
              )}
          </div>
        </Card>

        {/* Subscription Info Panel */}
        <Card title={
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary-600" />
            <span>Informace o předplatném</span>
          </div>
        }>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">Aktuální plán:</span>
                <span className="text-sm text-gray-900 dark:text-neutral-100 font-semibold">
                  {subscriptionInfo?.plan || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">Datum obnovení:</span>
                <span className="text-sm text-gray-900 dark:text-neutral-100">
                  {subscriptionInfo?.renewal_date ? new Date(subscriptionInfo.renewal_date).toLocaleDateString('cs-CZ') : 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">Celkem kreditů:</span>
                <span className="text-sm text-gray-900 dark:text-neutral-100 font-semibold">
                  {subscriptionInfo?.total_credits || 0}
                </span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">Použité kredity:</span>
                <span className="text-sm text-gray-900 dark:text-neutral-100 font-semibold">
                  {subscriptionInfo?.credits_used || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">Dostupné kredity:</span>
                <span className="text-sm text-gray-900 dark:text-neutral-100 font-semibold text-green-600">
                  {(subscriptionInfo?.total_credits || 0) - (subscriptionInfo?.credits_used || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700 dark:text-neutral-300">Měsíční využití:</span>
                <span className="text-sm text-gray-900 dark:text-neutral-100 font-semibold">
                  {subscriptionInfo?.monthly_usage || 0}
                </span>
              </div>
            </div>
          </div>
        </Card>

        <Card title="Profil školy">
          <form onSubmit={saveSchool} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <InputField name="school_name" label="Název" required value={schoolForm.name || ''} onChange={e=>setSchoolForm({...schoolForm, name: e.target.value})} />
            <InputField name="school_city" label="Město" value={schoolForm.city || ''} onChange={e=>setSchoolForm({...schoolForm, city: e.target.value})} />
            <InputField name="school_postal_code" label="PSČ" value={schoolForm.postal_code || ''} onChange={e=>setSchoolForm({...schoolForm, postal_code: e.target.value})} />
            <InputField name="school_address" label="Adresa" className="sm:col-span-2" value={schoolForm.address || ''} onChange={e=>setSchoolForm({...schoolForm, address: e.target.value})} />
            <InputField name="school_contact_email" label="Kontaktní email" value={schoolForm.contact_email || ''} onChange={e=>setSchoolForm({...schoolForm, contact_email: e.target.value})} />
                         <InputField name="school_contact_phone" label="Kontaktní telefon" value={schoolForm.contact_phone || ''} onChange={e=>setSchoolForm({...schoolForm, contact_phone: e.target.value})} />
            <div className="sm:col-span-3 flex justify-end">
              <Button type="submit" disabled={isLoading}>Uložit</Button>
            </div>
          </form>
        </Card>

        <Card title="Učitelé">
          <div className="space-y-4">
            <form onSubmit={addTeacher} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <InputField name="teacher_email" label="Email" required value={form.email} onChange={e=>setForm({...form, email: e.target.value})} />
              <InputField name="teacher_first_name" label="Jméno" required value={form.first_name} onChange={e=>setForm({...form, first_name: e.target.value})} />
              <InputField name="teacher_last_name" label="Příjmení" required value={form.last_name} onChange={e=>setForm({...form, last_name: e.target.value})} />
              <InputField name="teacher_password" label="Dočasné heslo" required type="password" value={form.password} onChange={e=>setForm({...form, password: e.target.value})} />
              <div className="flex items-end">
                <Button type="submit" disabled={isLoading}>Přidat učitele</Button>
              </div>
            </form>

            {/* Search Input for Teachers */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <InputField
                name="teacher_search"
                placeholder="Hledat učitele..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="border-t border-gray-200 dark:border-neutral-800 pt-4">
              {isLoading && <p className="text-sm text-neutral-500">Načítání…</p>}
              {filteredTeachers.length === 0 && !isLoading && (
                <p className="text-sm text-neutral-500 text-center py-4">
                  {searchTerm ? 'Žádní učitelé neodpovídají vyhledávání' : 'Žádní učitelé nebyli nalezeni'}
                </p>
              )}
              <ul className="divide-y divide-gray-200 dark:divide-neutral-800">
                {filteredTeachers.map(t => (
                  <li key={t.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-neutral-100">{t.first_name} {t.last_name}</p>
                      <p className="text-sm text-neutral-500">{t.email} • {t.role}</p>
                    </div>
                    <div>
                      {t.is_active ? (
                        <Button variant="secondary" onClick={()=>deactivateTeacher(t.id)} disabled={isLoading}>Deaktivovat</Button>
                      ) : (
                        <span className="text-xs text-neutral-500">Deaktivováno</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
};

export default SchoolAdminPage;



