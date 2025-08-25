import React, { useState, useEffect } from 'react';
import {  TrendingUp, Users, CreditCard, FileText, Download, Zap, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import MCPAnalyticsDashboard from '../../components/admin/MCPAnalyticsDashboard';
import { api, errorToMessage } from '../../services/apiClient';

interface PlatformOverviewData {
  activeUsers: {
    total: number;
    todayActive: number;
    weeklyActive: number;
    monthlyActive: number;
  };
  materialsCreated: {
    today: number;
    thisWeek: number;
    thisMonth: number;
    total: number;
  };
  userGrowth: Array<{
    month: string;
    users: number;
    newUsers: number;
  }>;
  creditUsage: Array<{
    month: string;
    credits: number;
    transactions: number;
  }>;
  topSchools: Array<{
    id: string;
    name: string;
    users: number;
    credits: number;
    materialsCreated: number;
  }>;
  materialCreationTrend: {
    daily: Array<{
      date: string;
      materials: number;
      uniqueUsers: number;
    }>;
    bySubject: Array<{
      subject: string;
      materials: number;
      percentage: number;
    }>;
    byType: Array<{
      type: string;
      materials: number;
      percentage: number;
    }>;
  };
}

const AnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<PlatformOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState<'platform' | 'mcp'>('platform');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await api.get<PlatformOverviewData>(`/admin/analytics/platform-overview?timeRange=${timeRange}`);
        
        if (response.data.success) {
          setAnalyticsData(response.data.data);
        } else {
          setError('Nepodařilo se načíst analytická data');
        }
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
        setError(errorToMessage(err));
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const exportData = (format: 'csv' | 'pdf') => {
    // Implementation for data export
    // TODO: Implement analytics data export functionality
    console.log(`Exporting analytics data in ${format} format`);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Načítání analytických dat...</div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <div className="text-lg text-gray-900 mb-2">Chyba při načítání dat</div>
            <div className="text-gray-600 mb-4">{error}</div>
            <Button 
              onClick={() => window.location.reload()} 
              variant="outline"
            >
              Zkusit znovu
            </Button>
          </div>
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
            <h1 className="text-2xl font-bold text-gray-900">Analytika platformy</h1>
            <p className="text-gray-600">Přehled klíčových metrik a trendů</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            {/* Tab Switcher */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('platform')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'platform'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users className="w-4 h-4 inline mr-2" />
                Platforma
              </button>
              <button
                onClick={() => setActiveTab('mcp')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'mcp'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Zap className="w-4 h-4 inline mr-2" />
                MCP AI
              </button>
            </div>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'mcp' ? (
          <MCPAnalyticsDashboard />
        ) : (
          <div className="space-y-6">
            {/* Platform Analytics Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Analytika platformy</h2>
                <p className="text-gray-600">Uživatelé, kredity a obsah</p>
              </div>
              <div className="flex items-center space-x-3">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
              <option value="7d">Posledních 7 dní</option>
              <option value="30d">Posledních 30 dní</option>
              <option value="90d">Posledních 90 dní</option>
              <option value="1y">Poslední rok</option>
                </select>
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

        {/* System Performance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktivní uživatelé</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData?.activeUsers.total || 0}
                </p>
                <p className="text-xs text-gray-500">
                  {analyticsData?.activeUsers.todayActive || 0} dnes
                </p>
              </div>
              <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                <Users className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Vytvořené materiály</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData?.materialsCreated.today || 0}
                </p>
                <p className="text-xs text-gray-500">dnes</p>
              </div>
              <div className="p-2 rounded-full bg-green-100 text-green-600">
                <FileText className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Týdenní aktivita</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData?.activeUsers.weeklyActive || 0}
                </p>
                <p className="text-xs text-gray-500">aktivních uživatelů</p>
              </div>
              <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Celkem materiálů</p>
                <p className="text-2xl font-bold text-gray-900">
                  {analyticsData?.materialsCreated.total || 0}
                </p>
                <p className="text-xs text-gray-500">
                  {analyticsData?.materialsCreated.thisMonth || 0} tento měsíc
                </p>
              </div>
              <div className="p-2 rounded-full bg-orange-100 text-orange-600">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Růst uživatelů</h3>
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div className="h-64 flex items-end justify-between space-x-2">
              {analyticsData?.userGrowth.map((data, index) => {
                const maxUsers = Math.max(...(analyticsData?.userGrowth.map(d => d.users) || [1]));
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="relative w-full">
                      <div 
                        className="w-full bg-blue-500 rounded-t"
                        style={{ height: `${(data.users / maxUsers) * 200}px` }}
                        title={`${data.users} celkem uživatelů, ${data.newUsers} nových`}
                      />
                      <div 
                        className="w-full bg-blue-300 rounded-t absolute bottom-0"
                        style={{ height: `${(data.newUsers / maxUsers) * 200}px` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-center mt-4 space-x-4 text-xs">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-1"></div>
                <span>Celkem uživatelů</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-300 rounded mr-1"></div>
                <span>Noví uživatelé</span>
              </div>
            </div>
          </Card>

          {/* Credit Usage Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Využití kreditů</h3>
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <div className="h-64 flex items-end justify-between space-x-2">
              {analyticsData?.creditUsage.map((data, index) => {
                const maxCredits = Math.max(...(analyticsData?.creditUsage.map(d => d.credits) || [1]));
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-green-500 rounded-t"
                      style={{ height: `${(data.credits / maxCredits) * 200}px` }}
                      title={`${data.credits} kreditů, ${data.transactions} transakcí`}
                    />
                    <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Top Schools and Popular Subjects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Schools */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nejaktivnější školy</h3>
            <div className="space-y-3">
              {analyticsData?.topSchools.map((school, index) => (
                <div key={school.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{school.name}</p>
                    <p className="text-sm text-gray-600">{school.users} uživatelů</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{school.credits} kreditů</p>
                    <p className="text-xs text-gray-500">{school.materialsCreated} materiálů</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Popular Subjects */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nejoblíbenější předměty</h3>
            <div className="space-y-3">
              {analyticsData?.materialCreationTrend.bySubject.map((subject, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{subject.subject}</p>
                    <p className="text-sm text-gray-600">{subject.materials} materiálů</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">{subject.percentage}%</p>
                    <div className="w-16 bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${subject.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Content Creation Trend */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Trend vytváření materiálů</h3>
            <FileText className="w-5 h-5 text-purple-600" />
          </div>
          <div className="h-48 flex items-end justify-between space-x-2">
            {analyticsData?.contentCreation.map((data, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-purple-500 rounded-t"
                  style={{ height: `${(data.materials / 120) * 160}px` }}
                />
                <span className="text-xs text-gray-600 mt-2">{data.month}</span>
              </div>
            ))}
          </div>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AnalyticsPage;
