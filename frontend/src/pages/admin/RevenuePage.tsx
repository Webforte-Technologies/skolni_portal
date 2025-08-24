import React, { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, Building2, Download, BarChart3, PieChart, LineChart } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card, Button, Badge } from '../../components/ui';


interface RevenueData {
  monthlyRevenue: { month: string; revenue: number; growth: number }[];
  planDistribution: { plan: string; revenue: number; percentage: number }[];
  schoolRevenue: { school: string; revenue: number; plan: string; status: string }[];
  revenueMetrics: {
    totalRevenue: number;
    monthlyRecurring: number;
    annualGrowth: number;
    averageRevenuePerSchool: number;
    churnRate: number;
    lifetimeValue: number;
  };
  revenueByPlan: { plan: string; monthlyRevenue: number; totalSchools: number }[];
  seasonalTrends: { quarter: string; revenue: number; growth: number }[];
}

const RevenuePage: React.FC = () => {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'6m' | '1y' | '2y' | 'all'>('1y');
  const [viewMode, setViewMode] = useState<'overview' | 'details' | 'forecast'>('overview');

  useEffect(() => {
    // Simulate API call for revenue data
    const fetchRevenueData = async () => {
      setLoading(true);
      // In real implementation, this would be an API call
      setTimeout(() => {
        setRevenueData({
          monthlyRevenue: [
            { month: 'Červenec 2023', revenue: 125000, growth: 0 },
            { month: 'Srpen 2023', revenue: 138000, growth: 10.4 },
            { month: 'Září 2023', revenue: 156000, growth: 13.0 },
            { month: 'Říjen 2023', revenue: 172000, growth: 10.3 },
            { month: 'Listopad 2023', revenue: 189000, growth: 9.9 },
            { month: 'Prosinec 2023', revenue: 198000, growth: 4.8 },
            { month: 'Leden 2024', revenue: 234000, growth: 18.2 },
            { month: 'Únor 2024', revenue: 245000, growth: 4.7 },
            { month: 'Březen 2024', revenue: 267000, growth: 9.0 },
            { month: 'Duben 2024', revenue: 289000, growth: 8.2 },
            { month: 'Květen 2024', revenue: 312000, growth: 8.0 },
            { month: 'Červen 2024', revenue: 334000, growth: 7.1 }
          ],
          planDistribution: [
            { plan: 'Základní', revenue: 156000, percentage: 46.7 },
            { plan: 'Premium', revenue: 134000, percentage: 40.1 },
            { plan: 'Enterprise', revenue: 44000, percentage: 13.2 }
          ],
          schoolRevenue: [
            { school: 'Gymnázium Jana Nerudy', revenue: 2990, plan: 'Premium', status: 'active' },
            { school: 'ZŠ TGM', revenue: 1490, plan: 'Základní', status: 'active' },
            { school: 'SŠ technická', revenue: 5990, plan: 'Enterprise', status: 'pending' },
            { school: 'ZŠ Komenského', revenue: 0, plan: 'Základní', status: 'expired' },
            { school: 'Gymnázium Botičská', revenue: 2990, plan: 'Premium', status: 'overdue' }
          ],
          revenueMetrics: {
            totalRevenue: 334000,
            monthlyRecurring: 334000,
            annualGrowth: 167.2,
            averageRevenuePerSchool: 2783,
            churnRate: 2.1,
            lifetimeValue: 33400
          },
          revenueByPlan: [
            { plan: 'Základní', monthlyRevenue: 156000, totalSchools: 105 },
            { plan: 'Premium', monthlyRevenue: 134000, totalSchools: 45 },
            { plan: 'Enterprise', monthlyRevenue: 44000, totalSchools: 8 }
          ],
          seasonalTrends: [
            { quarter: 'Q3 2023', revenue: 419000, growth: 0 },
            { quarter: 'Q4 2023', revenue: 559000, growth: 33.4 },
            { quarter: 'Q1 2024', revenue: 746000, growth: 33.5 },
            { quarter: 'Q2 2024', revenue: 935000, growth: 25.3 }
          ]
        });
        setLoading(false);
      }, 1000);
    };

    fetchRevenueData();
  }, [timeRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('cs-CZ', {
      style: 'currency',
      currency: 'CZK'
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const exportData = (format: 'csv' | 'pdf') => {
    // Implementation for data export
    // TODO: Implement revenue data export functionality
    console.log(`Exporting revenue data in ${format} format`);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Načítání finančních dat...</div>
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
            <h1 className="text-2xl font-bold text-gray-900">Analýza příjmů</h1>
            <p className="text-gray-600">Přehled finančních metrik a trendů platformy</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="6m">Posledních 6 měsíců</option>
              <option value="1y">Poslední rok</option>
              <option value="2y">Poslední 2 roky</option>
              <option value="all">Všechny údaje</option>
            </select>
            <div className="flex border border-gray-300 rounded-md">
              <Button
                variant={viewMode === 'overview' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('overview')}
                className="rounded-r-none border-r"
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'details' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('details')}
                className="rounded-none border-r"
              >
                <PieChart className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'forecast' ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('forecast')}
                className="rounded-l-none"
              >
                <LineChart className="w-4 h-4" />
              </Button>
            </div>
            <Button
              variant="outline"
              onClick={() => exportData('csv')}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </Button>
            <Button
              variant="outline"
              onClick={() => exportData('pdf')}
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Měsíční příjmy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(revenueData!.revenueMetrics.monthlyRecurring)}
                </p>
                <p className="text-sm text-gray-500">MRR</p>
              </div>
              <div className="p-2 rounded-full bg-blue-100">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Roční růst</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatPercentage(revenueData!.revenueMetrics.annualGrowth)}
                </p>
                <p className="text-sm text-gray-500">vs. předchozí rok</p>
              </div>
              <div className="p-2 rounded-full bg-green-100">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Průměr na školu</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(revenueData!.revenueMetrics.averageRevenuePerSchool)}
                </p>
                <p className="text-sm text-gray-500">měsíčně</p>
              </div>
              <div className="p-2 rounded-full bg-purple-100">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Churn rate</p>
                <p className="text-2xl font-bold text-red-600">
                  {revenueData!.revenueMetrics.churnRate}%
                </p>
                <p className="text-sm text-gray-500">měsíčně</p>
              </div>
              <div className="p-2 rounded-full bg-red-100">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Monthly Revenue Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Měsíční trend příjmů</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Celkem:</span>
              <span className="text-lg font-semibold text-green-600">
                {formatCurrency(revenueData!.revenueMetrics.totalRevenue)}
              </span>
            </div>
          </div>
          <div className="h-80 flex items-end justify-between space-x-1">
            {revenueData!.monthlyRevenue.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="relative w-full">
                  <div 
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-600 rounded-t"
                    style={{ height: `${(data.revenue / 400000) * 300}px` }}
                  />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 text-center">
                    {formatCurrency(data.revenue)}
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-2 text-center">
                  <div>{data.month}</div>
                  <div className={`font-medium ${getGrowthColor(data.growth)}`}>
                    {formatPercentage(data.growth)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Plan Distribution and Revenue by Plan */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Plan Distribution */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribuce podle plánů</h3>
            <div className="space-y-4">
              {revenueData!.planDistribution.map((plan, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ 
                        backgroundColor: index === 0 ? '#3B82F6' : 
                                   index === 1 ? '#8B5CF6' : '#10B981' 
                      }}
                    />
                    <span className="text-sm font-medium text-gray-900">{plan.plan}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {formatCurrency(plan.revenue)}
                    </div>
                    <div className="text-xs text-gray-500">{plan.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">Celkem</span>
                <span className="text-lg font-bold text-gray-900">
                  {formatCurrency(revenueData!.planDistribution.reduce((sum, plan) => sum + plan.revenue, 0))}
                </span>
              </div>
            </div>
          </Card>

          {/* Revenue by Plan */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Příjmy podle plánů</h3>
            <div className="space-y-4">
              {revenueData!.revenueByPlan.map((plan, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{plan.plan}</div>
                    <div className="text-sm text-gray-500">{plan.totalSchools} škol</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-green-600">
                      {formatCurrency(plan.monthlyRevenue)}
                    </div>
                    <div className="text-xs text-gray-500">měsíčně</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Seasonal Trends */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Kvartální trendy</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {revenueData!.seasonalTrends.map((quarter, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg text-center">
                <div className="text-sm font-medium text-gray-900">{quarter.quarter}</div>
                <div className="text-xl font-bold text-green-600 mt-1">
                  {formatCurrency(quarter.revenue)}
                </div>
                <div className={`text-sm font-medium mt-1 ${getGrowthColor(quarter.growth)}`}>
                  {formatPercentage(quarter.growth)}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Top Revenue Schools */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Nejvyšší příjmy podle škol</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Škola
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Plán
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Měsíční příjmy
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stav
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {revenueData!.schoolRevenue.map((school, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{school.school}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className={
                        school.plan === 'Basic' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        school.plan === 'Premium' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                        'bg-green-100 text-green-800 border-green-200'
                      }>
                        {school.plan}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        {formatCurrency(school.revenue)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="outline" className={
                        school.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' :
                        school.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                        school.status === 'expired' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                        'bg-orange-100 text-orange-800 border-orange-200'
                      }>
                        {school.status === 'active' ? 'Aktivní' :
                         school.status === 'pending' ? 'Čekající' :
                         school.status === 'expired' ? 'Expirované' : 'Po splatnosti'}
                      </Badge>
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

export default RevenuePage;
