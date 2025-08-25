import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Users, CreditCard, Building2, 
  Activity, LineChart
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';

interface SchoolAnalyticsData {
  total_schools: number;
  active_schools: number;
  total_teachers?: number;
  total_students?: number;
  total_credits?: number;
  credits_used?: number;
  // Backend actually provides these fields
  average_teachers_per_school?: number;
  average_credits_per_school?: number;
  basic_tier?: number;
  premium_tier?: number;
  enterprise_tier?: number;
  suspended_schools?: number;
  pending_verification_schools?: number;
  schools_by_city: Array<{ city: string; count: number }>;
  activity_trends: Array<{ date: string; schools_active: number; teachers_active: number }>;
  subscription_distribution?: Array<{ plan: string; count: number }>;
  credit_usage_by_school?: Array<{ school_name: string; credits_used: number; credits_balance: number }>;
}

const SchoolAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [analytics, setAnalytics] = useState<SchoolAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  // Utility function to safely convert values to numbers
  const safeNumber = (value: any): number => {
    if (value === null || value === undefined) return 0;
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  };

  // Utility function to safely format numbers
  const safeFormat = (value: any, decimals: number = 0): string => {
    const num = safeNumber(value);
    if (decimals === 0) return num.toLocaleString();
    return num.toFixed(decimals);
  };

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/schools/analytics?range=${dateRange}`);
      
      // Add debugging to see what we're actually getting
      console.log('Analytics API response:', response.data);
      
      if (response.data && response.data.data) {
        setAnalytics(response.data.data as SchoolAnalyticsData);
      } else if (response.data) {
        // If the response is directly the data (not wrapped in data.data)
        setAnalytics(response.data as unknown as SchoolAnalyticsData);
      } else {
        console.error('Unexpected API response structure:', response);
        showToast({ 
          type: 'error', 
          message: 'Neočekávaná struktura odpovědi z API' 
        });
      }
    } catch (error: any) {
      console.error('Analytics fetch error:', error);
      showToast({ 
        type: 'error', 
        message: error.response?.data?.error || 'Chyba při načítání analytiky škol' 
      });
    } finally {
      setLoading(false);
    }
  }, [dateRange, showToast]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!analytics) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Analytika není dostupná</h2>
          <Button variant="secondary" onClick={() => navigate('/admin/schools')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zpět na školy
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="secondary" 
              onClick={() => navigate('/admin/schools')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Zpět na školy</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytika škol</h1>
              <p className="text-gray-600 mt-1">Přehled výkonnosti a statistik škol</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Období:</span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as any)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="7d">Posledních 7 dní</option>
              <option value="30d">Posledních 30 dní</option>
              <option value="90d">Posledních 90 dní</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Celkem škol</p>
                <p className="text-2xl font-bold text-gray-900">{safeNumber(analytics.total_schools)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktivní školy</p>
                <p className="text-2xl font-bold text-gray-900">{safeNumber(analytics.active_schools)}</p>
                <p className="text-sm text-gray-500">
                  {safeNumber(analytics.total_schools) > 0 && safeNumber(analytics.active_schools) > 0 
                    ? ((safeNumber(analytics.active_schools) / safeNumber(analytics.total_schools)) * 100).toFixed(1) 
                    : '0'}%
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Activity className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Průměr učitelů na školu</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analytics.average_teachers_per_school !== undefined && analytics.average_teachers_per_school !== null
                    ? safeFormat(analytics.average_teachers_per_school, 1)
                    : 'N/A'
                  }
                </p>
                <p className="text-sm text-gray-500">
                  Celkem: {safeFormat(analytics.total_teachers)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Celkem kreditů</p>
                <p className="text-2xl font-bold text-gray-900">
                  {safeFormat(analytics.total_credits || analytics.average_credits_per_school)}
                </p>
                <p className="text-sm text-gray-500">
                  Použito: {safeFormat(analytics.credits_used)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Schools by City */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Školy podle města</h3>
            <div className="space-y-3">
              {(analytics.schools_by_city || []).slice(0, 10).map((city) => {
                const cityCount = safeNumber(city.count);
                const maxCount = Math.max(...(analytics.schools_by_city || []).map(c => safeNumber(c.count)));
                const percentage = maxCount > 0 ? (cityCount / maxCount) * 100 : 0;
                
                return (
                  <div key={city.city} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{city.city}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-right">{cityCount}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Subscription Distribution */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuce předplatných</h3>
            <div className="space-y-3">
              {(analytics.subscription_distribution || []).map((plan) => {
                const planCount = safeNumber(plan.count);
                const totalSchools = safeNumber(analytics.total_schools);
                const percentage = totalSchools > 0 ? (planCount / totalSchools) * 100 : 0;
                
                return (
                  <div key={plan.plan} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{plan.plan}</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium text-gray-900 w-8 text-right">{planCount}</span>
                    </div>
                  </div>
                );
              })}
              {(!analytics.subscription_distribution || analytics.subscription_distribution.length === 0) && (
                <div className="text-center py-4 text-gray-500">
                  <p>Data o předplatných nejsou dostupná</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Additional Metrics from Backend */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Subscription Tiers */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Předplatné podle úrovní</h3>
            <div className="space-y-3">
              {analytics.basic_tier !== undefined && analytics.basic_tier !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Základní</span>
                  <span className="text-sm font-medium text-gray-900">{safeNumber(analytics.basic_tier)}</span>
                </div>
              )}
              {analytics.premium_tier !== undefined && analytics.premium_tier !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Premium</span>
                  <span className="text-sm font-medium text-gray-900">{safeNumber(analytics.premium_tier)}</span>
                </div>
              )}
              {analytics.enterprise_tier !== undefined && analytics.enterprise_tier !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Enterprise</span>
                  <span className="text-sm font-medium text-gray-900">{safeNumber(analytics.enterprise_tier)}</span>
                </div>
              )}
            </div>
          </Card>

          {/* School Status */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Stav škol</h3>
            <div className="space-y-3">
              {analytics.suspended_schools !== undefined && analytics.suspended_schools !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Pozastavené</span>
                  <span className="text-sm font-medium text-gray-900">{safeNumber(analytics.suspended_schools)}</span>
                </div>
              )}
              {analytics.pending_verification_schools !== undefined && analytics.pending_verification_schools !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Čekající na ověření</span>
                  <span className="text-sm font-medium text-gray-900">{safeNumber(analytics.pending_verification_schools)}</span>
                </div>
              )}
            </div>
          </Card>

          {/* Average Metrics */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Průměrné hodnoty</h3>
            <div className="space-y-3">
              {analytics.average_teachers_per_school !== undefined && analytics.average_teachers_per_school !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Učitelů na školu</span>
                  <span className="text-sm font-medium text-gray-900">
                    {safeFormat(analytics.average_teachers_per_school, 1)}
                  </span>
                </div>
              )}
              {analytics.average_credits_per_school !== undefined && analytics.average_credits_per_school !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Kreditů na školu</span>
                  <span className="text-sm font-medium text-gray-900">
                    {safeFormat(analytics.average_credits_per_school, 0)}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Credit Usage by School */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Využití kreditů podle školy</h3>
          <div className="overflow-x-auto">
            {(analytics.credit_usage_by_school && analytics.credit_usage_by_school.length > 0) ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Název školy
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Použité kredity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zbývající kredity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Využití
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analytics.credit_usage_by_school.slice(0, 10).map((school) => {
                    const creditsUsed = safeNumber(school.credits_used);
                    const creditsBalance = safeNumber(school.credits_balance);
                    const totalCredits = creditsUsed + creditsBalance;
                    const usagePercentage = totalCredits > 0 ? (creditsUsed / totalCredits) * 100 : 0;
                    
                    return (
                      <tr key={school.school_name}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {school.school_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {safeFormat(creditsUsed)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {safeFormat(creditsBalance)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {usagePercentage.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <p>Data o využití kreditů nejsou dostupná</p>
              </div>
            )}
          </div>
        </Card>

        {/* Activity Trends Chart */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Trendy aktivity</h3>
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <LineChart className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p>Graf trendů aktivity bude implementován v další verzi</p>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default SchoolAnalyticsPage;
