import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, FileText, Eye, Download, Heart, Share2, Filter, Download as DownloadIcon } from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { Card, Button, Badge, Input } from '../../components/ui';


interface ContentMetric {
  id: string;
  title: string;
  subject: string;
  grade: string;
  author: string;
  school: string;
  views: number;
  downloads: number;
  likes: number;
  shares: number;
  rating: number;
  createdAt: Date;
  lastActivity: Date;
  tags: string[];
  category: string;
  aiGenerated: boolean;
  quality: 'low' | 'medium' | 'high' | 'excellent';
}

interface SubjectPerformance {
  subject: string;
  totalMaterials: number;
  totalViews: number;
  totalDownloads: number;
  averageRating: number;
  growth: number;
}

const ContentAnalyticsPage: React.FC = () => {
  const [contentMetrics, setContentMetrics] = useState<ContentMetric[]>([]);
  const [subjectPerformance, setSubjectPerformance] = useState<SubjectPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<string>('30d');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [qualityFilter, setQualityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Simulate API call for analytics data
    const fetchAnalyticsData = async () => {
      setLoading(true);
      setTimeout(() => {
        const mockContentMetrics: ContentMetric[] = [
          {
            id: '1',
            title: 'Matematické cvičení - Pythagorova věta',
            subject: 'Matematika',
            grade: '8. třída',
            author: 'Jan Novák',
            school: 'Gymnázium Jana Nerudy',
            views: 1247,
            downloads: 89,
            likes: 67,
            shares: 23,
            rating: 4.8,
            createdAt: new Date('2024-01-15'),
            lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 2),
            tags: ['matematika', 'geometrie', 'pythagorova věta'],
            category: 'Cvičení',
            aiGenerated: false,
            quality: 'excellent'
          },
          {
            id: '2',
            title: 'Anglická gramatika - Present Perfect',
            subject: 'Anglický jazyk',
            grade: '6. třída',
            author: 'Marie Svobodová',
            school: 'ZŠ Komenského',
            views: 892,
            downloads: 156,
            likes: 89,
            shares: 45,
            rating: 4.6,
            createdAt: new Date('2024-01-20'),
            lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 6),
            tags: ['angličtina', 'gramatika', 'present perfect'],
            category: 'Výklad',
            aiGenerated: true,
            quality: 'high'
          },
          {
            id: '3',
            title: 'Česká literatura - Karel Čapek',
            subject: 'Český jazyk',
            grade: '9. třída',
            author: 'Petr Černý',
            school: 'ZŠ TGM',
            views: 567,
            downloads: 78,
            likes: 34,
            shares: 12,
            rating: 4.4,
            createdAt: new Date('2024-02-01'),
            lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 12),
            tags: ['čeština', 'literatura', 'karel čapek'],
            category: 'Analýza',
            aiGenerated: false,
            quality: 'high'
          },
          {
            id: '4',
            title: 'Fyzika - Mechanické vlnění',
            subject: 'Fyzika',
            grade: 'SŠ',
            author: 'Tomáš Malý',
            school: 'SŠ technická',
            views: 445,
            downloads: 67,
            likes: 23,
            shares: 8,
            rating: 4.2,
            createdAt: new Date('2024-02-10'),
            lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 24),
            tags: ['fyzika', 'mechanika', 'vlnění'],
            category: 'Výklad',
            aiGenerated: true,
            quality: 'medium'
          },
          {
            id: '5',
            title: 'Dějepis - Starověký Řím',
            subject: 'Dějepis',
            grade: '6. třída',
            author: 'Anna Veselá',
            school: 'ZŠ Masarykova',
            views: 678,
            downloads: 92,
            likes: 45,
            shares: 18,
            rating: 4.7,
            createdAt: new Date('2024-01-25'),
            lastActivity: new Date(Date.now() - 1000 * 60 * 60 * 48),
            tags: ['dějepis', 'starověk', 'římská říše'],
            category: 'Prezentace',
            aiGenerated: false,
            quality: 'excellent'
          }
        ];

        const mockSubjectPerformance: SubjectPerformance[] = [
          {
            subject: 'Matematika',
            totalMaterials: 156,
            totalViews: 12470,
            totalDownloads: 890,
            averageRating: 4.6,
            growth: 12.5
          },
          {
            subject: 'Anglický jazyk',
            totalMaterials: 134,
            totalViews: 8920,
            totalDownloads: 1560,
            averageRating: 4.4,
            growth: 8.7
          },
          {
            subject: 'Český jazyk',
            totalMaterials: 89,
            totalViews: 5670,
            totalDownloads: 780,
            averageRating: 4.5,
            growth: 15.2
          },
          {
            subject: 'Fyzika',
            totalMaterials: 67,
            totalViews: 4450,
            totalDownloads: 670,
            averageRating: 4.2,
            growth: 6.8
          },
          {
            subject: 'Dějepis',
            totalMaterials: 45,
            totalViews: 6780,
            totalDownloads: 920,
            averageRating: 4.7,
            growth: 18.9
          }
        ];

        setContentMetrics(mockContentMetrics);
        setSubjectPerformance(mockSubjectPerformance);
        setLoading(false);
      }, 1000);
    };

    fetchAnalyticsData();
  }, []);

  const getQualityColor = (quality: ContentMetric['quality']) => {
    switch (quality) {
      case 'excellent':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'high':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getQualityName = (quality: ContentMetric['quality']) => {
    switch (quality) {
      case 'excellent':
        return 'Vynikající';
      case 'high':
        return 'Vysoká';
      case 'medium':
        return 'Střední';
      case 'low':
        return 'Nízká';
      default:
        return 'Neznámá';
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('cs-CZ');
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) {
      return `před ${minutes} min`;
    } else if (hours < 24) {
      return `před ${hours} hod`;
    } else {
      return `před ${days} dny`;
    }
  };

  const filteredMetrics = contentMetrics.filter(metric => {
    const matchesSearch = searchQuery === '' || 
      metric.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      metric.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      metric.school.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesSubject = subjectFilter === 'all' || metric.subject === subjectFilter;
    const matchesQuality = qualityFilter === 'all' || metric.quality === qualityFilter;

    return matchesSearch && matchesSubject && matchesQuality;
  });

  const totalViews = contentMetrics.reduce((sum, metric) => sum + metric.views, 0);
  const totalDownloads = contentMetrics.reduce((sum, metric) => sum + metric.downloads, 0);
  const totalLikes = contentMetrics.reduce((sum, metric) => sum + metric.likes, 0);
  const averageRating = contentMetrics.reduce((sum, metric) => sum + metric.rating, 0) / contentMetrics.length;
  const aiGeneratedCount = contentMetrics.filter(metric => metric.aiGenerated).length;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Načítání analýzy...</div>
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
            <h1 className="text-2xl font-bold text-gray-900">Analýza obsahu</h1>
            <p className="text-gray-600">Přehled výkonu a využití výukových materiálů</p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Posledních 7 dní</option>
              <option value="30d">Posledních 30 dní</option>
              <option value="90d">Posledních 90 dní</option>
              <option value="1y">Poslední rok</option>
            </select>
            <Button
              variant="outline"
              className="flex items-center space-x-2"
            >
              <DownloadIcon className="w-4 h-4" />
              <span>Exportovat data</span>
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Celkem zobrazení</p>
                <p className="text-2xl font-bold text-blue-600">{formatNumber(totalViews)}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Celkem stažení</p>
                <p className="text-2xl font-bold text-green-600">{formatNumber(totalDownloads)}</p>
              </div>
              <Download className="w-8 h-8 text-green-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Celkem lajků</p>
                <p className="text-2xl font-bold text-red-600">{formatNumber(totalLikes)}</p>
              </div>
              <Heart className="w-8 h-8 text-red-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Průměrné hodnocení</p>
                <p className="text-2xl font-bold text-yellow-600">{averageRating.toFixed(1)}</p>
              </div>
              <BarChart3 className="w-8 h-8 text-yellow-600" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI generované</p>
                <p className="text-2xl font-bold text-purple-600">{aiGeneratedCount}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-600" />
            </div>
          </Card>
        </div>

        {/* Subject Performance Chart */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Výkon podle předmětů</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">Růst:</span>
              <Badge variant="outline" className="text-green-600 border-green-200">
                +{subjectPerformance.reduce((sum, subj) => sum + subj.growth, 0) / subjectPerformance.length}%
              </Badge>
            </div>
          </div>
          <div className="space-y-4">
            {subjectPerformance.map((subject) => (
              <div key={subject.subject} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{subject.subject}</h4>
                    <p className="text-sm text-gray-500">{subject.totalMaterials} materiálů</p>
                  </div>
                </div>
                <div className="flex items-center space-x-8">
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{formatNumber(subject.totalViews)}</p>
                    <p className="text-xs text-gray-500">Zobrazení</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{formatNumber(subject.totalDownloads)}</p>
                    <p className="text-xs text-gray-500">Stažení</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900">{subject.averageRating.toFixed(1)}</p>
                    <p className="text-xs text-gray-500">Hodnocení</p>
                  </div>
                  <div className="text-center">
                    <Badge 
                      variant="outline" 
                      className={subject.growth > 10 ? 'text-green-600 border-green-200' : 'text-orange-600 border-orange-200'}
                    >
                      {subject.growth > 0 ? '+' : ''}{subject.growth}%
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Všechny předměty</option>
                <option value="Matematika">Matematika</option>
                <option value="Anglický jazyk">Anglický jazyk</option>
                <option value="Český jazyk">Český jazyk</option>
                <option value="Fyzika">Fyzika</option>
                <option value="Dějepis">Dějepis</option>
              </select>
              <select
                value={qualityFilter}
                onChange={(e) => setQualityFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Všechny kvality</option>
                <option value="excellent">Vynikající</option>
                <option value="high">Vysoká</option>
                <option value="medium">Střední</option>
                <option value="low">Nízká</option>
              </select>
            </div>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Hledat materiály..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full lg:w-80"
              />
            </div>
          </div>
        </Card>

        {/* Content Performance Table */}
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Materiál
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Autor & Škola
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Metriky
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Kvalita
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Poslední aktivita
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Akce
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMetrics.map((metric) => (
                  <tr key={metric.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {metric.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {metric.subject} • {metric.grade}
                          </div>
                          <div className="text-xs text-gray-400">
                            {metric.aiGenerated ? 'AI generované' : 'Lidsky vytvořené'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {metric.author}
                      </div>
                      <div className="text-sm text-gray-500">
                        {metric.school}
                      </div>
                      <div className="text-xs text-gray-400">
                        Vytvořeno: {formatDate(metric.createdAt)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Eye className="w-4 h-4 text-blue-500" />
                            <span className="font-medium">{formatNumber(metric.views)}</span>
                          </div>
                          <p className="text-xs text-gray-500">Zobrazení</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Download className="w-4 h-4 text-green-500" />
                            <span className="font-medium">{formatNumber(metric.downloads)}</span>
                          </div>
                          <p className="text-xs text-gray-500">Stažení</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Heart className="w-4 h-4 text-red-500" />
                            <span className="font-medium">{formatNumber(metric.likes)}</span>
                          </div>
                          <p className="text-xs text-gray-500">Lajky</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center space-x-1">
                            <Share2 className="w-4 h-4 text-purple-500" />
                            <span className="font-medium">{formatNumber(metric.shares)}</span>
                          </div>
                          <p className="text-xs text-gray-500">Sdílení</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-center">
                        <Badge variant="outline" className={getQualityColor(metric.quality)}>
                          {getQualityName(metric.quality)}
                        </Badge>
                        <div className="text-sm font-medium text-gray-900 mt-1">
                          {metric.rating.toFixed(1)} ⭐
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {getTimeAgo(metric.lastActivity)}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(metric.lastActivity)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-purple-600 hover:text-purple-700"
                        >
                          <TrendingUp className="w-4 h-4" />
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

export default ContentAnalyticsPage;
