import React, { useState, useEffect, useCallback } from 'react';
import {  TrendingUp, Users, CreditCard, FileText, Download, Zap, AlertCircle } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import MCPAnalyticsDashboard from '../../components/admin/MCPAnalyticsDashboard';
import AnalyticsChart from '../../components/admin/AnalyticsChart';
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
      worksheets: number;
      tests: number;
      assignments: number;
      avgCreationTime: number;
    }>;
    bySubject: Array<{
      subject: string;
      materials: number;
      uniqueUsers: number;
      avgFileSize: number;
      recentMaterials: number;
      percentage: number;
    }>;
    byType: Array<{
      type: string;
      materials: number;
      uniqueUsers: number;
      avgFileSize: number;
      recentMaterials: number;
      avgCreationTime: number;
      percentage: number;
    }>;
  };
}

interface EnhancedMaterialTrends {
  hourlyTrend: Array<{
    hour: string;
    materials: number;
    uniqueUsers: number;
    avgResponseTime: number;
  }>;
  subjectEngagement: Array<{
    subject: string;
    materials: number;
    uniqueUsers: number;
    avgSessionDuration: number;
    popularityScore: number;
  }>;
  typeEfficiency: Array<{
    type: string;
    materials: number;
    avgCreationTime: number;
    successRate: number;
    userSatisfaction: number;
  }>;
  userEngagementMetrics: {
    totalActiveCreators: number;
    averageCreationsPerUser: number;
    peakCreationHour: string;
    mostProductiveDay: string;
  };
}

const AnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<PlatformOverviewData | null>(null);
  const [enhancedTrends, setEnhancedTrends] = useState<EnhancedMaterialTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState<'platform' | 'mcp'>('platform');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch both regular analytics and enhanced trends in parallel
        const [analyticsResponse, trendsResponse] = await Promise.all([
          api.get<PlatformOverviewData>(`/admin/analytics/platform-overview?timeRange=${timeRange}`),
          api.get<EnhancedMaterialTrends>(`/admin/analytics/enhanced-material-trends?timeRange=${timeRange}`)
        ]);
        
        if (analyticsResponse.data.success && analyticsResponse.data.data) {
          setAnalyticsData(analyticsResponse.data.data);
        } else {
          setError(analyticsResponse.data.error || 'Nepodařilo se načíst analytická data');
        }

        if (trendsResponse.data.success && trendsResponse.data.data) {
          setEnhancedTrends(trendsResponse.data.data);
        } else if (!trendsResponse.data.success) {
          console.warn('Enhanced trends data not available:', trendsResponse.data.error);
        }

        setLastUpdated(new Date());
      } catch (err) {
        console.error('Failed to fetch analytics data:', err);
        setError(errorToMessage(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchAnalytics();
  }, [timeRange]);

  const refreshData = useCallback(async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    setError(null);
    
    try {
      // Fetch both regular analytics and enhanced trends in parallel
      const [analyticsResponse, trendsResponse] = await Promise.all([
        api.get<PlatformOverviewData>(`/admin/analytics/platform-overview?timeRange=${timeRange}`),
        api.get<EnhancedMaterialTrends>(`/admin/analytics/enhanced-material-trends?timeRange=${timeRange}`)
      ]);
      
      if (analyticsResponse.data.success && analyticsResponse.data.data) {
        setAnalyticsData(analyticsResponse.data.data);
      } else {
        setError(analyticsResponse.data.error || 'Nepodařilo se načíst analytická data');
      }

      if (trendsResponse.data.success && trendsResponse.data.data) {
        setEnhancedTrends(trendsResponse.data.data);
      } else if (!trendsResponse.data.success) {
        console.warn('Enhanced trends data not available:', trendsResponse.data.error);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to refresh analytics data:', err);
      setError(errorToMessage(err));
    } finally {
      setRefreshing(false);
    }
  }, [timeRange, refreshing]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        refreshData();
      }, 30000); // Refresh every 30 seconds
      setRefreshInterval(interval);
    } else {
      if (refreshInterval) {
        clearInterval(refreshInterval);
        setRefreshInterval(null);
      }
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [autoRefresh, refreshData, refreshInterval]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshInterval]);

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
                {lastUpdated && (
                  <div className="text-xs text-gray-500">
                    Aktualizováno: {lastUpdated.toLocaleTimeString('cs-CZ')}
                  </div>
                )}
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="auto-refresh"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="auto-refresh" className="text-sm text-gray-700">
                    Auto-refresh (30s)
                  </label>
                </div>
                <Button
                  variant="outline"
                  onClick={refreshData}
                  disabled={refreshing}
                  className="flex items-center space-x-2"
                >
                  <TrendingUp className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>{refreshing ? 'Aktualizuji...' : 'Obnovit'}</span>
                </Button>
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading || refreshing}
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
          <AnalyticsChart
            type="user-growth"
            title="Růst uživatelů"
            icon={<Users className="w-5 h-5 text-blue-600" />}
            timeRange={timeRange}
          />

          {/* Credit Usage Chart */}
          <AnalyticsChart
            type="credit-usage"
            title="Využití kreditů"
            icon={<CreditCard className="w-5 h-5 text-green-600" />}
            timeRange={timeRange}
          />
        </div>

        {/* Top Schools and Popular Subjects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Schools */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nejaktivnější školy</h3>
            <div className="space-y-3">
              {analyticsData?.topSchools.map((school) => (
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

        {/* Enhanced Content Creation Trend */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enhanced Daily Material Creation */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Denní trend vytváření materiálů</h3>
              <FileText className="w-5 h-5 text-purple-600" />
            </div>
            <div className="h-48 flex items-end justify-between space-x-1">
              {analyticsData?.materialCreationTrend.daily.slice(-14).map((data, index) => {
                const maxMaterials = Math.max(...(analyticsData?.materialCreationTrend.daily.map(d => d.materials) || [1]));
                const date = new Date(data.date);
                const dayLabel = date.getDate().toString();
                const worksheetHeight = Math.max(2, (data.worksheets / maxMaterials) * 160);
                const testHeight = Math.max(2, (data.tests / maxMaterials) * 160);
                const assignmentHeight = Math.max(2, (data.assignments / maxMaterials) * 160);
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full relative">
                      {/* Stacked bars for different material types */}
                      <div 
                        className="w-full bg-purple-500 rounded-t min-h-[2px]"
                        style={{ height: `${worksheetHeight}px` }}
                        title={`${data.date}: ${data.worksheets} pracovních listů`}
                      />
                      <div 
                        className="w-full bg-purple-400 min-h-[2px]"
                        style={{ height: `${testHeight}px` }}
                        title={`${data.date}: ${data.tests} testů`}
                      />
                      <div 
                        className="w-full bg-purple-300 rounded-b min-h-[2px]"
                        style={{ height: `${assignmentHeight}px` }}
                        title={`${data.date}: ${data.assignments} úkolů`}
                      />
                    </div>
                    <span className="text-xs text-gray-600 mt-1">{dayLabel}</span>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-center space-x-4 text-xs">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-500 rounded mr-1"></div>
                  <span>Pracovní listy</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-400 rounded mr-1"></div>
                  <span>Testy</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-purple-300 rounded mr-1"></div>
                  <span>Úkoly</span>
                </div>
              </div>
              <div className="text-sm text-gray-600 text-center">
                Posledních 14 dní • Zobrazuje počet vytvořených materiálů podle typu
              </div>
            </div>
          </Card>

          {/* Enhanced Material Types Breakdown */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Typy materiálů</h3>
              <FileText className="w-5 h-5 text-orange-600" />
            </div>
            <div className="space-y-3">
              {analyticsData?.materialCreationTrend.byType.map((type, index) => (
                <div key={index} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className={`w-3 h-3 rounded mr-2 ${
                        index === 0 ? 'bg-orange-500' :
                        index === 1 ? 'bg-orange-400' :
                        index === 2 ? 'bg-orange-300' :
                        'bg-orange-200'
                      }`}></div>
                      <span className="text-sm font-medium text-gray-900 capitalize">{type.type}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-semibold text-gray-900">{type.materials}</span>
                      <span className="text-xs text-gray-500 ml-1">({type.percentage}%)</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">{type.uniqueUsers}</span> uživatelů
                    </div>
                    <div>
                      <span className="font-medium">{type.recentMaterials}</span> za týden
                    </div>
                  </div>
                  {type.avgCreationTime > 0 && (
                    <div className="mt-1 text-xs text-gray-500">
                      Průměrný čas: {Math.round(type.avgCreationTime / 60)}min
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Enhanced Real-time Analytics Section */}
        {enhancedTrends && (
          <div className="space-y-6">
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Pokročilá analytika v reálném čase</h2>
              
              {/* User Engagement Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <Card className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {enhancedTrends.userEngagementMetrics.totalActiveCreators}
                    </div>
                    <div className="text-sm text-gray-600">Aktivní tvůrci</div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {enhancedTrends.userEngagementMetrics.averageCreationsPerUser.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Průměr na uživatele</div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {enhancedTrends.userEngagementMetrics.peakCreationHour}
                    </div>
                    <div className="text-sm text-gray-600">Špička aktivity</div>
                  </div>
                </Card>
                <Card className="p-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {enhancedTrends.userEngagementMetrics.mostProductiveDay}
                    </div>
                    <div className="text-sm text-gray-600">Nejproduktivnější den</div>
                  </div>
                </Card>
              </div>

              {/* Hourly Trend and Subject Engagement */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Hourly Trend */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Hodinový trend (24h)</h3>
                    <TrendingUp className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="h-48 flex items-end justify-between space-x-1">
                    {enhancedTrends.hourlyTrend.map((data, index) => {
                      const maxMaterials = Math.max(...enhancedTrends.hourlyTrend.map(d => d.materials), 1);
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div 
                            className="w-full bg-blue-500 rounded-t min-h-[2px]"
                            style={{ height: `${Math.max(2, (data.materials / maxMaterials) * 160)}px` }}
                            title={`${data.hour}: ${data.materials} materiálů, ${data.uniqueUsers} uživatelů`}
                          />
                          <span className="text-xs text-gray-600 mt-1 transform -rotate-45 origin-bottom-left">
                            {data.hour}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    Posledních 24 hodin • Materiály vytvořené podle hodin
                  </div>
                </Card>

                {/* Subject Engagement */}
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Angažovanost podle předmětů</h3>
                    <Users className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="space-y-3">
                    {enhancedTrends.subjectEngagement.slice(0, 5).map((subject, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{subject.subject}</div>
                          <div className="text-sm text-gray-600">
                            {subject.materials} materiálů • {subject.uniqueUsers} uživatelů
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">
                            {subject.popularityScore.toFixed(1)}
                          </div>
                          <div className="text-xs text-gray-500">Skóre popularity</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </div>

              {/* Type Efficiency */}
              <Card className="p-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Efektivita podle typů materiálů</h3>
                  <CreditCard className="w-5 h-5 text-purple-600" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {enhancedTrends.typeEfficiency.map((type, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 capitalize">{type.type}</span>
                        <span className="text-sm font-semibold text-purple-600">
                          {type.successRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-gray-600">
                        <div>Materiály: <span className="font-medium">{type.materials}</span></div>
                        <div>Čas vytvoření: <span className="font-medium">{Math.round(type.avgCreationTime / 60)}min</span></div>
                        <div>Spokojenost: <span className="font-medium">{type.userSatisfaction.toFixed(1)}/5</span></div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AnalyticsPage;
