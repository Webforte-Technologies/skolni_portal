import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Users, Search, Filter, Grid, List, Heart, 
  Share2, Download, Eye, Tag, BookOpen, Target,
  TrendingUp, Globe, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import apiClient from '../../services/apiClient';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import WorksheetDisplay from '../../components/chat/WorksheetDisplay';
import Header from '../../components/layout/Header';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/ui/Breadcrumb';

interface SharedMaterial {
  id: string;
  material_id: string;
  school_id: string;
  folder_id?: string;
  is_public: boolean;
  created_at: string;
  material: {
    id: string;
    title: string;
    content: any;
    file_type: string;
    user_id: string;
    created_at: string;
    ai_category?: string;
    ai_subject?: string;
    ai_difficulty?: string;
    ai_tags?: string[];
    moderation_status: string;
    quality_score?: number;
  };
  creator: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
  school: {
    id: string;
    name: string;
    city?: string;
  };
  folder?: {
    id: string;
    name: string;
    description?: string;
  };
  stats: {
    views: number;
    downloads: number;
    likes: number;
    shares: number;
    comments: number;
  };
}

interface FilterOptions {
  category: string;
  subject: string;
  difficulty: string;
  gradeLevel: string;
  tags: string[];
  creator: string;
  dateFrom: string;
  dateTo: string;
  sortBy: 'recent' | 'popular' | 'quality' | 'views';
}

const SharedMaterialsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showWorksheet, setShowWorksheet] = useState(false);
  const [worksheetData, setWorksheetData] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    category: '',
    subject: '',
    difficulty: '',
    gradeLevel: '',
    tags: [],
    creator: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'recent'
  });

  // Queries
  const { data: sharedMaterialsData, isLoading, refetch } = useQuery(
    ['shared-materials', searchTerm, filterOptions],
    async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterOptions.category) params.append('category', filterOptions.category);
      if (filterOptions.subject) params.append('subject', filterOptions.subject);
      if (filterOptions.difficulty) params.append('difficulty', filterOptions.difficulty);
      if (filterOptions.gradeLevel) params.append('grade_level', filterOptions.gradeLevel);
      if (filterOptions.creator) params.append('creator', filterOptions.creator);
      if (filterOptions.dateFrom) params.append('date_from', filterOptions.dateFrom);
      if (filterOptions.dateTo) params.append('date_to', filterOptions.dateTo);
      if (filterOptions.sortBy) params.append('sort_by', filterOptions.sortBy);
      
      const response = await apiClient.get(`/shared-materials/browse?${params.toString()}`);
      return response.data;
    },
    {
      enabled: !!user,
      retry: 2,
    }
  );

  // Query for community statistics
  const { data: communityStats } = useQuery(
    ['community-stats'],
    async () => {
      const response = await apiClient.get('/shared-materials/community-stats');
      return response.data;
    },
    {
      enabled: !!user,
      retry: 2,
    }
  );

  // Query for top contributors
  const { data: topContributors } = useQuery(
    ['top-contributors'],
    async () => {
      const response = await apiClient.get('/shared-materials/top-contributors');
      return response.data;
    },
    {
      enabled: !!user,
      retry: 2,
    }
  );

  // Mutations
  const likeMaterialMutation = useMutation(
    async (materialId: string) => {
      const response = await apiClient.post(`/shared-materials/${materialId}/like`);
      return response.data;
    },
    {
      onSuccess: () => {
        showToast({ type: 'success', message: 'Materiál byl přidán k oblíbeným' });
        queryClient.invalidateQueries(['shared-materials']);
        queryClient.invalidateQueries(['community-stats']);
      },
      onError: () => {
        showToast({ type: 'error', message: 'Chyba při přidávání k oblíbeným' });
      }
    }
  );

  const downloadMaterialMutation = useMutation(
    async (materialId: string) => {
      const response = await apiClient.post(`/shared-materials/${materialId}/download`);
      return response.data;
    },
    {
      onSuccess: () => {
        showToast({ type: 'success', message: 'Stažení bylo zaznamenáno' });
        queryClient.invalidateQueries(['shared-materials']);
        queryClient.invalidateQueries(['community-stats']);
      },
      onError: () => {
        showToast({ type: 'error', message: 'Chyba při zaznamenávání stažení' });
      }
    }
  );

  const shareMaterialMutation = useMutation(
    async (materialId: string) => {
      const response = await apiClient.post(`/shared-materials/${materialId}/share`);
      return response.data;
    },
    {
      onSuccess: () => {
        showToast({ type: 'success', message: 'Materiál byl sdílen' });
        queryClient.invalidateQueries(['shared-materials']);
        queryClient.invalidateQueries(['community-stats']);
      },
      onError: () => {
        showToast({ type: 'error', message: 'Chyba při sdílení' });
      }
    }
  );

  // Computed values
  const sharedMaterials = sharedMaterialsData?.data || [];
  const stats = communityStats?.data || {};
  const contributors = topContributors?.data || [];

  // Handlers
  const handleSearch = () => {
    refetch();
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilterOptions(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilterOptions({
      category: '',
      subject: '',
      difficulty: '',
      gradeLevel: '',
      tags: [],
      creator: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'recent'
    });
  };

  const handleLike = (materialId: string) => {
    likeMaterialMutation.mutate(materialId);
  };

  const handleDownload = (materialId: string) => {
    downloadMaterialMutation.mutate(materialId);
  };

  const handleShare = (materialId: string) => {
    shareMaterialMutation.mutate(materialId);
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'worksheet': return <BookOpen className="w-5 h-5" />;
      case 'lesson': return <Target className="w-5 h-5" />;
      case 'assessment': return <TrendingUp className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-400';
      case 'advanced': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-400';
      default: return 'text-neutral-600 bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400';
    }
  };

  const getSubjectColor = (subject: string) => {
    const colors = {
      'mathematics': 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-400',
      'physics': 'text-purple-600 bg-purple-100 dark:bg-purple-900 dark:text-purple-400',
      'chemistry': 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-400',
      'biology': 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900 dark:text-emerald-400',
      'history': 'text-amber-600 bg-amber-100 dark:bg-amber-900 dark:text-amber-400',
      'literature': 'text-pink-600 bg-pink-100 dark:bg-pink-900 dark:text-pink-400',
      'general': 'text-neutral-600 bg-neutral-100 dark:bg-neutral-900 dark:text-neutral-400'
    };
    return colors[subject as keyof typeof colors] || colors.general;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header />
      
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/materials')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zpět na materiály
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Školní knihovna
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Objevte a sdílejte vzdělávací materiály s komunitou
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: 'Materiály', path: '/materials' },
          { label: 'Školní knihovna' }
        ]} />

        {/* Community Statistics */}
        <Card className="mb-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Přehled komunity
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatNumber(stats.total_materials || 0)}
              </div>
              <div className="text-sm text-blue-600 dark:text-blue-400">Materiálů</div>
            </div>
            
            <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {formatNumber(stats.total_contributors || 0)}
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">Přispěvatelů</div>
            </div>
            
            <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {formatNumber(stats.total_downloads || 0)}
              </div>
              <div className="text-sm text-purple-600 dark:text-purple-400">Stažení</div>
            </div>
            
            <div className="text-center p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {formatNumber(stats.total_likes || 0)}
              </div>
              <div className="text-sm text-amber-600 dark:text-amber-400">Líbí se</div>
            </div>
            
            <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatNumber(stats.total_shares || 0)}
              </div>
              <div className="text-sm text-emerald-600 dark:text-emerald-400">Sdílení</div>
            </div>
            
            <div className="text-center p-3 bg-rose-50 dark:bg-rose-950 rounded-lg">
              <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                {formatNumber(stats.total_views || 0)}
              </div>
              <div className="text-sm text-rose-600 dark:text-rose-400">Zobrazení</div>
            </div>
          </div>
        </Card>

        {/* Top Contributors */}
        {contributors.length > 0 && (
          <Card className="mb-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Nejaktivnější přispěvatelé
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {contributors.slice(0, 6).map((contributor: any, index: number) => (
                <div key={contributor.id} className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800' :
                      index === 1 ? 'bg-neutral-100 text-neutral-800' :
                      index === 2 ? 'bg-amber-100 text-amber-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-neutral-900 dark:text-neutral-100">
                        {contributor.first_name} {contributor.last_name}
                      </div>
                      <div className="text-sm text-neutral-500 dark:text-neutral-400">
                        {contributor.school_name}
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        {contributor.materials_count}
                      </div>
                      <div className="text-xs text-neutral-500">Materiálů</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600 dark:text-green-400">
                        {formatNumber(contributor.total_downloads)}
                      </div>
                      <div className="text-xs text-neutral-500">Stažení</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {formatNumber(contributor.total_likes)}
                      </div>
                      <div className="text-xs text-neutral-500">Líbí se</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Search and Filters */}
        <Card className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Search className="w-4 h-4 text-neutral-500" />
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Hledat v sdílených materiálech
                </span>
              </div>
              
              <div className="flex gap-2">
                                 <InputField
                   name="search"
                   label=""
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                   placeholder="Hledej podle názvu, autora, tématu..."
                   className="flex-1"
                 />
                <Button onClick={handleSearch} isLoading={isLoading}>
                  <Search className="w-4 h-4 mr-2" />
                  Hledat
                </Button>
              </div>
            </div>
            
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtry
            </Button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Kategorie</label>
                  <select 
                    className="w-full border rounded-md p-2 bg-transparent"
                    value={filterOptions.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="">Všechny kategorie</option>
                    <option value="worksheet">Pracovní listy</option>
                    <option value="lesson">Lekce</option>
                    <option value="assessment">Hodnocení</option>
                    <option value="exercise">Cvičení</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Předmět</label>
                  <select 
                    className="w-full border rounded-md p-2 bg-transparent"
                    value={filterOptions.subject}
                    onChange={(e) => handleFilterChange('subject', e.target.value)}
                  >
                    <option value="">Všechny předměty</option>
                    <option value="mathematics">Matematika</option>
                    <option value="physics">Fyzika</option>
                    <option value="chemistry">Chemie</option>
                    <option value="biology">Biologie</option>
                    <option value="history">Dějepis</option>
                    <option value="literature">Literatura</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Obtížnost</label>
                  <select 
                    className="w-full border rounded-md p-2 bg-transparent"
                    value={filterOptions.difficulty}
                    onChange={(e) => handleFilterChange('difficulty', e.target.value)}
                  >
                    <option value="">Všechny obtížnosti</option>
                    <option value="beginner">Začátečník</option>
                    <option value="intermediate">Střední</option>
                    <option value="advanced">Pokročilý</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Řazení</label>
                  <select 
                    className="w-full border rounded-md p-2 bg-transparent"
                    value={filterOptions.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  >
                    <option value="recent">Nejnovější</option>
                    <option value="popular">Nejpopulárnější</option>
                    <option value="quality">Nejlepší kvalita</option>
                    <option value="views">Nejvíce zobrazení</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                >
                  Vymazat filtry
                </Button>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-500">
                    Nalezeno {sharedMaterials.length} materiálů
                  </span>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* View Mode Toggle */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'primary' : 'secondary'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Materials Grid/List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">Načítání sdílených materiálů...</p>
          </div>
        ) : sharedMaterials.length === 0 ? (
          <Card className="text-center py-12">
            <Users className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              Žádné sdílené materiály nenalezeny
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              {searchTerm ? 'Zkuste upravit vyhledávání nebo filtry.' : 'Zatím nebyly sdíleny žádné materiály.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => navigate('/materials')}>
                <BookOpen className="w-4 h-4 mr-2" />
                Sdílet materiál
              </Button>
            )}
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {sharedMaterials.map((item: SharedMaterial) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getFileIcon(item.material.file_type)}
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {item.material.ai_category || 'Uncategorized'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {item.material.ai_tags && item.material.ai_tags.length > 0 && (
                        <Tag className="w-4 h-4 text-blue-500" />
                      )}
                      {item.material.moderation_status === 'approved' && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2">
                    {item.material.title}
                  </h4>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.material.ai_subject && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(item.material.ai_subject)}`}>
                        {item.material.ai_subject}
                      </span>
                    )}
                    {item.material.ai_difficulty && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.material.ai_difficulty)}`}>
                        {item.material.ai_difficulty}
                      </span>
                    )}
                  </div>
                  
                  {item.material.ai_tags && item.material.ai_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.material.ai_tags.slice(0, 3).map((tag: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                      {item.material.ai_tags.length > 3 && (
                        <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full text-xs">
                          +{item.material.ai_tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-3">
                    <span>{new Date(item.material.created_at).toLocaleDateString()}</span>
                    {item.folder && (
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {item.folder.name}
                      </span>
                    )}
                  </div>
                  
                  {/* Creator Info */}
                  <div className="flex items-center gap-2 mb-3 p-2 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                        {item.creator.first_name[0]}{item.creator.last_name[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                        {item.creator.first_name} {item.creator.last_name}
                      </div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">
                        {item.school.name}
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-4 gap-2 mb-3 text-center text-xs">
                    <div>
                      <div className="font-medium text-neutral-700 dark:text-neutral-300">
                        {formatNumber(item.stats.views)}
                      </div>
                      <div className="text-neutral-500">Zobrazení</div>
                    </div>
                    <div>
                      <div className="font-medium text-neutral-700 dark:text-neutral-300">
                        {formatNumber(item.stats.downloads)}
                      </div>
                      <div className="text-neutral-500">Stažení</div>
                    </div>
                    <div>
                      <div className="font-medium text-neutral-700 dark:text-neutral-300">
                        {formatNumber(item.stats.likes)}
                      </div>
                      <div className="text-neutral-500">Líbí se</div>
                    </div>
                    <div>
                      <div className="font-medium text-neutral-700 dark:text-neutral-300">
                        {formatNumber(item.stats.shares)}
                      </div>
                      <div className="text-neutral-500">Sdílení</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => {
                        setWorksheetData(item.material.content);
                        setShowWorksheet(true);
                      }}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Zobrazit
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleLike(item.id)}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleDownload(item.id)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleShare(item.id)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modals */}
        {showWorksheet && worksheetData && (
          <WorksheetDisplay
            worksheet={worksheetData}
            onClose={() => setShowWorksheet(false)}
          />
        )}

        {/* Community Modal */}
        {/* This modal is no longer used and its state is removed */}
      </div>
    </div>
  );
};

export default SharedMaterialsPage;
