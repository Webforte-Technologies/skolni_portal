import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, TrendingUp, Users, CreditCard, Building2, 
  Activity, Calendar, BarChart3, PieChart, LineChart
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';
import SchoolAnalytics from '../../components/admin/SchoolAnalytics';

interface SchoolAnalyticsData {
  total_schools: number;
  active_schools: number;
  total_teachers: number;
  total_students: number;
  total_credits: number;
  credits_used: number;
  schools_by_city: Array<{ city: string; count: number }>;
  activity_trends: Array<{ date: string; schools_active: number; teachers_active: number }>;
  subscription_distribution: Array<{ plan: string; count: number }>;
  credit_usage_by_school: Array<{ school_name: string; credits_used: number; credits_balance: number }>;
}

const SchoolAnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [analytics, setAnalytics] = useState<SchoolAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/schools/analytics?range=${dateRange}`);
      setAnalytics(response.data.data);
    } catch (error: any) {
      showToast({ 
        type: 'error', 
        message: error.response?.data?.error || 'Chyba při načítání analytiky škol' 
      });
    } finally {
      setLoading(false);
    }
  };

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
                <p className="text-2xl font-bold text-gray-900">{analytics.total_schools}</p>
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
                <p className="text-2xl font-bold text-gray-900">{analytics.active_schools}</p>
                <p className="text-sm text-gray-500">
                  {((analytics.active_schools / analytics.total_schools) * 100).toFixed(1)}%
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
                <p className="text-sm font-medium text-gray-600">Celkem učitelů</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.total_teachers}</p>
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
                <p className="text-2xl font-bold text-gray-900">{analytics.total_credits.toLocaleString()}</p>
                <p className="text-sm text-gray-500">
                  Použito: {analytics.credits_used.toLocaleString()}
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
              {analytics.schools_by_city.slice(0, 10).map((city, index) => (
                <div key={city.city} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{city.city}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(city.count / Math.max(...analytics.schools_by_city.map(c => c.count))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">{city.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Subscription Distribution */}
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuce předplatných</h3>
            <div className="space-y-3">
              {analytics.subscription_distribution.map((plan) => (
                <div key={plan.plan} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{plan.plan}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full" 
                        style={{ width: `${(plan.count / analytics.total_schools) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-8 text-right">{plan.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Credit Usage by School */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Využití kreditů podle školy</h3>
          <div className="overflow-x-auto">
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
                  const totalCredits = school.credits_used + school.credits_balance;
                  const usagePercentage = totalCredits > 0 ? (school.credits_used / totalCredits) * 100 : 0;
                  
                  return (
                    <tr key={school.school_name}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {school.school_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {school.credits_used.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {school.credits_balance.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                usagePercentage > 80 ? 'bg-red-600' : 
                                usagePercentage > 60 ? 'bg-yellow-600' : 'bg-green-600'
                              }`}
                              style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-900 w-12">
                            {usagePercentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
