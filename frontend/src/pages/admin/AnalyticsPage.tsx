import React, { useState, useEffect } from 'react';
import {  TrendingUp, Users, CreditCard, FileText, Download } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

interface AnalyticsData {
  userGrowth: { month: string; users: number }[];
  creditUsage: { month: string; credits: number }[];
  contentCreation: { month: string; materials: number }[];
  systemPerformance: { metric: string; value: number; unit: string; trend: 'up' | 'down' | 'stable' }[];
  topSchools: { name: string; users: number; credits: number }[];
  popularSubjects: { subject: string; materials: number; usage: number }[];
}

const AnalyticsPage: React.FC = () => {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  useEffect(() => {
    // Simulate API call for analytics data
    const fetchAnalytics = async () => {
      setLoading(true);
      // In real implementation, this would be an API call
      setTimeout(() => {
        setAnalyticsData({
          userGrowth: [
            { month: 'Led', users: 120 },
            { month: 'Úno', users: 145 },
            { month: 'Bře', users: 167 },
            { month: 'Dub', users: 189 },
            { month: 'Kvě', users: 234 },
            { month: 'Čer', users: 278 }
          ],
          creditUsage: [
            { month: 'Led', credits: 1250 },
            { month: 'Úno', credits: 1380 },
            { month: 'Bře', credits: 1560 },
            { month: 'Dub', credits: 1720 },
            { month: 'Kvě', credits: 1980 },
            { month: 'Čer', credits: 2340 }
          ],
          contentCreation: [
            { month: 'Led', materials: 45 },
            { month: 'Úno', materials: 52 },
            { month: 'Bře', materials: 61 },
            { month: 'Dub', materials: 73 },
            { month: 'Kvě', materials: 89 },
            { month: 'Čer', materials: 104 }
          ],
          systemPerformance: [
            { metric: 'Průměrná odezva API', value: 245, unit: 'ms', trend: 'down' },
            { metric: 'Uptime', value: 99.8, unit: '%', trend: 'stable' },
            { metric: 'Aktivní uživatelé', value: 156, unit: '', trend: 'up' },
            { metric: 'Vytvořené materiály', value: 23, unit: 'dnes', trend: 'up' }
          ],
          topSchools: [
            { name: 'Gymnázium Jana Nerudy', users: 45, credits: 890 },
            { name: 'ZŠ TGM', users: 38, credits: 720 },
            { name: 'SŠ technická', users: 32, credits: 650 },
            { name: 'ZŠ Komenského', users: 28, credits: 580 }
          ],
          popularSubjects: [
            { subject: 'Matematika', materials: 156, usage: 2340 },
            { subject: 'Český jazyk', materials: 134, usage: 1890 },
            { subject: 'Anglický jazyk', materials: 98, usage: 1450 },
            { subject: 'Fyzika', materials: 87, usage: 1230 },
            { subject: 'Chemie', materials: 76, usage: 980 }
          ]
        });
        setLoading(false);
      }, 1000);
    };

    fetchAnalytics();
  }, [timeRange]);

  const exportData = (format: 'csv' | 'pdf') => {
    // Implementation for data export
    console.log(`Exporting data in ${format} format`);
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analytika platformy</h1>
            <p className="text-gray-600">Přehled klíčových metrik a trendů</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
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
          {analyticsData?.systemPerformance.map((metric, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{metric.metric}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {metric.value}{metric.unit}
                  </p>
                </div>
                <div className={`p-2 rounded-full ${
                  metric.trend === 'up' ? 'bg-green-100 text-green-600' :
                  metric.trend === 'down' ? 'bg-red-100 text-red-600' :
                  'bg-gray-100 text-gray-600'
                }`}>
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
            </Card>
          ))}
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
              {analyticsData?.userGrowth.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-blue-500 rounded-t"
                    style={{ height: `${(data.users / 300) * 200}px` }}
                  />
                  <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Credit Usage Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Využití kreditů</h3>
              <CreditCard className="w-5 h-5 text-green-600" />
            </div>
            <div className="h-64 flex items-end justify-between space-x-2">
              {analyticsData?.creditUsage.map((data, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-green-500 rounded-t"
                    style={{ height: `${(data.credits / 2500) * 200}px` }}
                  />
                  <span className="text-xs text-gray-600 mt-2">{data.month}</span>
                </div>
              ))}
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
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{school.name}</p>
                    <p className="text-sm text-gray-600">{school.users} uživatelů</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{school.credits} kreditů</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Popular Subjects */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Nejoblíbenější předměty</h3>
            <div className="space-y-3">
              {analyticsData?.popularSubjects.map((subject, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{subject.subject}</p>
                    <p className="text-sm text-gray-600">{subject.materials} materiálů</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-blue-600">{subject.usage} použití</p>
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
    </AdminLayout>
  );
};

export default AnalyticsPage;
