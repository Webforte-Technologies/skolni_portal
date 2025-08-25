import React, { useState, useEffect } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Database,
  Activity,
  Download,
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';

interface SecurityMetric {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
  period: string;
}

interface ThreatCategory {
  category: string;
  count: number;
  percentage: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface SecurityTrend {
  date: string;
  threats: number;
  blocked: number;
  suspicious: number;
}

const SecurityAnalyticsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [securityMetrics, setSecurityMetrics] = useState<SecurityMetric[]>([]);
  const [threatCategories, setThreatCategories] = useState<ThreatCategory[]>([]);
  const [securityTrends, setSecurityTrends] = useState<SecurityTrend[]>([]);

  useEffect(() => {
    // Simulate API call for security analytics data
    const fetchSecurityAnalytics = async () => {
      setLoading(true);
      setTimeout(() => {
        const mockMetrics: SecurityMetric[] = [
          {
            name: 'Celkové hrozby',
            value: 1247,
            change: 12.5,
            trend: 'up',
            period: 'za posledních 30 dní'
          },
          {
            name: 'Blokované útoky',
            value: 1189,
            change: -8.2,
            trend: 'down',
            period: 'za posledních 30 dní'
          },
          {
            name: 'Podezřelé aktivity',
            value: 58,
            change: 23.1,
            trend: 'up',
            period: 'za posledních 30 dní'
          },
          {
            name: 'Úspěšné útoky',
            value: 3,
            change: -50.0,
            trend: 'down',
            period: 'za posledních 30 dní'
          }
        ];

        const mockThreatCategories: ThreatCategory[] = [
          {
            category: 'Brute Force',
            count: 456,
            percentage: 36.6,
            severity: 'high'
          },
          {
            category: 'SQL Injection',
            count: 234,
            percentage: 18.8,
            severity: 'critical'
          },
          {
            category: 'XSS Attacks',
            count: 189,
            percentage: 15.2,
            severity: 'medium'
          },
          {
            category: 'DDoS',
            count: 156,
            percentage: 12.5,
            severity: 'high'
          },
          {
            category: 'Phishing',
            count: 98,
            percentage: 7.9,
            severity: 'medium'
          },
          {
            category: 'Ostatní',
            count: 114,
            percentage: 9.1,
            severity: 'low'
          }
        ];

        const mockTrends: SecurityTrend[] = [
          { date: '2024-01-01', threats: 45, blocked: 42, suspicious: 3 },
          { date: '2024-01-02', threats: 52, blocked: 48, suspicious: 4 },
          { date: '2024-01-03', threats: 38, blocked: 35, suspicious: 3 },
          { date: '2024-01-04', threats: 67, blocked: 63, suspicious: 4 },
          { date: '2024-01-05', threats: 41, blocked: 38, suspicious: 3 },
          { date: '2024-01-06', threats: 58, blocked: 54, suspicious: 4 },
          { date: '2024-01-07', threats: 49, blocked: 46, suspicious: 3 }
        ];

        setSecurityMetrics(mockMetrics);
        setThreatCategories(mockThreatCategories);
        setSecurityTrends(mockTrends);
        setLoading(false);
      }, 1000);
    };

    fetchSecurityAnalytics();
  }, [timeRange]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="w-4 h-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="w-4 h-4 text-green-500" />;
      default:
        return <TrendingUp className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-red-600';
      case 'down':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'Nízká';
      case 'medium':
        return 'Střední';
      case 'high':
        return 'Vysoká';
      case 'critical':
        return 'Kritická';
      default:
        return severity;
    }
  };

  const exportReport = () => {
    // Simulate export functionality
    const data = {
      metrics: securityMetrics,
      categories: threatCategories,
      trends: securityTrends,
      generatedAt: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(data, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `security-analytics-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="text-lg text-gray-600">Načítání bezpečnostních analýz...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bezpečnostní analýzy</h1>
          <p className="text-gray-600 mt-2">
            Přehled bezpečnostních metrik, trendů a hrozeb
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Posledních 7 dní</option>
            <option value="30d">Posledních 30 dní</option>
            <option value="90d">Posledních 90 dní</option>
            <option value="1y">Poslední rok</option>
          </select>
          
          <Button onClick={exportReport} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export reportu
          </Button>
          
          <Shield className="w-8 h-8 text-blue-600" />
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {securityMetrics.map((metric, index) => (
          <Card key={index}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">{metric.name}</h3>
                {getTrendIcon(metric.trend)}
              </div>
              <div className="text-2xl font-bold mb-2">{metric.value.toLocaleString()}</div>
              <div className={`text-sm ${getTrendColor(metric.trend)}`}>
                {metric.change > 0 ? '+' : ''}{metric.change}% {metric.period}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Threat Categories and Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Threat Categories */}
        <Card>
          <div className="border-b border-neutral-200 px-6 py-4">
            <h3 className="text-lg font-medium">Kategorie hrozeb</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {threatCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-4 h-4 rounded-full" style={{
                      backgroundColor: index === 0 ? '#3B82F6' :
                                    index === 1 ? '#EF4444' :
                                    index === 2 ? '#F59E0B' :
                                    index === 3 ? '#8B5CF6' :
                                    index === 4 ? '#10B981' : '#6B7280'
                    }}></div>
                    <div>
                      <div className="font-medium">{category.category}</div>
                      <div className="text-sm text-gray-500">{category.count} útoků</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="font-medium">{category.percentage}%</div>
                    </div>
                    <Badge variant="outline" className={getSeverityColor(category.severity)}>
                      {getSeverityLabel(category.severity)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Security Trends */}
        <Card>
          <div className="border-b border-neutral-200 px-6 py-4">
            <h3 className="text-lg font-medium">Trendy bezpečnosti</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {securityTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {new Date(trend.date).toLocaleDateString('cs-CZ')}
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Hrozby</div>
                      <div className="font-medium text-red-600">{trend.threats}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Blokováno</div>
                      <div className="font-medium text-green-600">{trend.blocked}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500">Podezřelé</div>
                      <div className="font-medium text-yellow-600">{trend.suspicious}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Security Insights */}
      <Card className="mb-8">
        <div className="border-b border-neutral-200 px-6 py-4">
          <h3 className="text-lg font-medium">Bezpečnostní poznatky</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-800">Zvýšený počet SQL Injection útoků</h4>
                  <p className="text-sm text-gray-600">
                    Za posledních 7 dní jsme zaznamenali 23% nárůst SQL Injection pokusů. 
                    Doporučujeme zkontrolovat validaci vstupů.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-800">Úspěšná blokace DDoS útoků</h4>
                  <p className="text-sm text-gray-600">
                    Naše ochrana proti DDoS útokům úspěšně blokovala 98.7% všech pokusů 
                    za poslední měsíc.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-800">Průměrná doba reakce</h4>
                  <p className="text-sm text-gray-600">
                    Průměrná doba detekce a reakce na bezpečnostní incidenty je 2.3 minuty, 
                    což je pod cílovou hodnotou 5 minut.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Users className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-purple-800">Aktivní uživatelé</h4>
                  <p className="text-sm text-gray-600">
                    Počet aktivních uživatelů se zvýšil o 15% oproti minulému měsíci, 
                    což může vysvětlovat nárůst pokusů o útoky.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Recommendations */}
      <Card>
        <div className="border-b border-neutral-200 px-6 py-4">
          <h3 className="text-lg font-medium">Doporučení pro zlepšení</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3 p-4 bg-blue-50 rounded-lg">
              <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-800">Implementovat dvoufaktorovou autentifikaci</h4>
                <p className="text-sm text-blue-700">
                  Pro všechny admin účty doporučujeme implementovat 2FA, což by snížilo 
                  riziko neoprávněného přístupu o 95%.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-yellow-50 rounded-lg">
              <Database className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Aktualizovat WAF pravidla</h4>
                <p className="text-sm text-yellow-700">
                  Web Application Firewall pravidla by měla být aktualizována pro lepší 
                  detekci nových typů útoků.
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3 p-4 bg-green-50 rounded-lg">
              <Activity className="w-5 h-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-green-800">Pravidelné bezpečnostní audity</h4>
                <p className="text-sm text-green-700">
                  Doporučujeme provádět měsíční bezpečnostní audity a penetration testy 
                  pro identifikaci nových zranitelností.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </AdminLayout>
  );
};

export default SecurityAnalyticsPage;
