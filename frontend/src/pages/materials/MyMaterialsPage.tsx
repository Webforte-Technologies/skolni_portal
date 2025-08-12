import React, { useState, useMemo, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import InputField from '../../components/ui/InputField';
import ConfirmModal from '../../components/ui/ConfirmModal';
import Breadcrumb from '../../components/ui/Breadcrumb';
import Header from '../../components/layout/Header';
import { 
  FileText, Trash2, Eye, Search, Folder, Share2, Plus, 
  Filter, Grid, List, Tag, BookOpen, Target,
  Lightbulb, BarChart3, Sparkles, Zap, ArrowLeft, Presentation, Users, Download
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import apiClient from '../../services/apiClient';
import { exportStructuredToDocx } from '../../utils/exportUtils';
// import WorksheetDisplay from '../../components/chat/WorksheetDisplay';
import MaterialDisplay from '../../components/materials/MaterialDisplay';
import { GeneratedFile } from '../../types';

interface Worksheet {
  title: string;
  instructions: string;
  questions: Array<{
    problem: string;
    answer: string;
  }>;
}

interface FilterOptions {
  fileType: string;
  folderId: string;
  dateFrom: string;
  dateTo: string;
  showSharedOnly: boolean;
  // New AI-powered filters
  category: string;
  subject: string;
  difficulty: string;
  gradeLevel: string;
  tags: string[];
}

interface ContentAnalytics {
  total_files: number;
  categorized_files: number;
  tagged_files: number;
  approved_files: number;
  pending_files: number;
  rejected_files: number;
  avg_quality_score: number;
  files_last_30_days: number;
  files_last_7_days: number;
}

interface DistributionData {
  category?: string;
  subject?: string;
  difficulty?: string;
  count: number;
  percentage: number;
}

const MyMaterialsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const searchParams = new URLSearchParams(window.location.search);
  const newParam = searchParams.get('new') || '';
  const newIds = newParam ? newParam.split(',') : [];
  const [hasAutoOpened, setHasAutoOpened] = useState(false);
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showWorksheet, setShowWorksheet] = useState(false);
  const [worksheetData, setWorksheetData] = useState<Worksheet | null>(null);
  const [fileToDelete, setFileToDelete] = useState<GeneratedFile | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
  const [showAddFolderModal, setShowAddFolderModal] = useState(false);
  const [showMoveToFolderModal, setShowMoveToFolderModal] = useState(false);
  const [fileToMove, setFileToMove] = useState<GeneratedFile | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderDescription, setNewFolderDescription] = useState('');
  const [newFolderParentId, setNewFolderParentId] = useState<string>('');
  const [newFolderIsShared, setNewFolderIsShared] = useState(false);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    fileType: '',
    folderId: '',
    dateFrom: '',
    dateTo: '',
    showSharedOnly: false,
    category: '',
    subject: '',
    difficulty: '',
    gradeLevel: '',
    tags: []
  });
  const [showFilters, setShowFilters] = useState(false);
  const [searchMode, setSearchMode] = useState<'basic' | 'ai'>('ai');
  const [showRecommendations, setShowRecommendations] = useState(true);
  const [showAnalytics, setShowAnalytics] = useState(true);

  // Queries
  const { data: filesData, isLoading, refetch } = useQuery(
    ['user-files', searchTerm, filterOptions, searchMode],
    async () => {
      if (searchMode === 'ai' && searchTerm) {
        // Use AI-powered search
        const params = new URLSearchParams({
          query: searchTerm,
          limit: '50',
          offset: '0'
        });
        
        if (filterOptions.category) params.append('category', filterOptions.category);
        if (filterOptions.subject) params.append('subject', filterOptions.subject);
        if (filterOptions.difficulty) params.append('difficulty', filterOptions.difficulty);
        if (filterOptions.gradeLevel) params.append('gradeLevel', filterOptions.gradeLevel);
        if (filterOptions.tags.length > 0) params.append('tags', filterOptions.tags.join(','));
        if (filterOptions.dateFrom) params.append('dateFrom', filterOptions.dateFrom);
        if (filterOptions.dateTo) params.append('dateTo', filterOptions.dateTo);
        
        const response = await apiClient.get(`/files/search/ai?${params.toString()}`);
        return Array.isArray(response.data?.data) ? response.data : { data: [] };
      } else {
        // Use basic search
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (filterOptions.fileType) params.append('file_type', filterOptions.fileType);
        if (filterOptions.folderId) params.append('folder_id', filterOptions.folderId);
        if (filterOptions.dateFrom) params.append('date_from', filterOptions.dateFrom);
        if (filterOptions.dateTo) params.append('date_to', filterOptions.dateTo);
        
        const response = await apiClient.get(`/files?${params.toString()}`);
        return response.data;
      }
    },
    {
      enabled: !!user,
      retry: 2,
    }
  );

  // New query for content recommendations
  const { data: recommendationsData } = useQuery(
    ['content-recommendations'],
    async () => {
      const response = await apiClient.get('/files/recommendations?limit=5');
      return response.data;
    },
    {
      enabled: !!user && showRecommendations,
      retry: 2,
    }
  );

  // New query for content analytics
  const { data: analyticsData } = useQuery(
    ['content-analytics'],
    async () => {
      const response = await apiClient.get('/files/analytics/content');
      return response.data;
    },
    {
      enabled: !!user && showAnalytics,
      retry: 2,
    }
  );

  const { data: foldersData, refetch: refetchFolders } = useQuery(
    ['user-folders'],
    async () => {
      const response = await apiClient.get('/folders');
      return response.data;
    },
    {
      enabled: !!user,
      retry: 2,
    }
  );

  // Removed unused statsData query

  // Computed values
  const files = useMemo(() => {
    const d: any = filesData?.data;
    if (d && Array.isArray(d.files)) return d.files;
    if (Array.isArray(d)) return d;
    return [] as any[];
  }, [filesData]);

  // Auto-open the newly created material if exactly one
  useEffect(() => {
    if (!hasAutoOpened && newIds.length === 1 && files.length > 0) {
      const target = files.find((f: any) => f.id === newIds[0]);
      if (target) {
        setWorksheetData(target);
        setShowWorksheet(true);
        setHasAutoOpened(true);
      }
    }
  }, [files, newIds, hasAutoOpened]);

  const totalFiles = useMemo(() => {
    const d: any = filesData?.data;
    if (d?.pagination?.total !== undefined) return d.pagination.total as number;
    if (Array.isArray(d)) return d.length;
    return 0;
  }, [filesData]);

  const recommendations = recommendationsData?.data || [];
  const analytics: ContentAnalytics = analyticsData?.data?.analytics || {};
  const categoryDistribution = analyticsData?.data?.distributions?.categories || [];
  const subjectDistribution = analyticsData?.data?.distributions?.subjects || [];
  const difficultyDistribution = analyticsData?.data?.distributions?.difficulties || [];

  // Mutations
  const deleteFileMutation = useMutation(
    async (fileId: string) => {
      await apiClient.delete(`/files/${fileId}`);
    },
    {
      onSuccess: () => {
        showToast({ type: 'success', message: 'Soubor byl úspěšně smazán' });
        queryClient.invalidateQueries(['user-files']);
        queryClient.invalidateQueries(['user-stats']);
        queryClient.invalidateQueries(['shared-materials']);
        queryClient.invalidateQueries(['content-analytics']);
      },
      onError: () => {
        showToast({ type: 'error', message: 'Chyba při mazání souboru' });
      }
    }
  );

  const shareMaterialMutation = useMutation(
    async (data: { material_id: string; folder_id?: string; is_public: boolean }) => {
      const response = await apiClient.post('/shared-materials/share', data);
      return response.data;
    },
    {
      onSuccess: () => {
        showToast({ type: 'success', message: 'Materiál byl úspěšně sdílen' });
        setShowShareModal(false);
        setSelectedFile(null);
        queryClient.invalidateQueries(['user-files']);
        queryClient.invalidateQueries(['shared-materials']);
      },
      onError: (error: any) => {
        showToast({ type: 'error', message: error.response?.data?.error || 'Chyba při sdílení materiálu' });
      }
    }
  );

  const createFolderMutation = useMutation(
    async (data: { name: string; description?: string; parent_folder_id?: string; is_shared: boolean }) => {
      const response = await apiClient.post('/folders', data);
      return response.data;
    },
    {
      onSuccess: () => {
        showToast({ type: 'success', message: 'Složka byla úspěšně vytvořena' });
        setShowAddFolderModal(false);
        setNewFolderName('');
        setNewFolderDescription('');
        setNewFolderParentId('');
        setNewFolderIsShared(false);
        refetchFolders();
      },
      onError: (error: any) => {
        showToast({ type: 'error', message: error.response?.data?.error || 'Chyba při vytváření složky' });
      }
    }
  );

  const moveToFolderMutation = useMutation(
    async (data: { material_ids: string[]; folder_id: string }) => {
      const response = await apiClient.post(`/folders/${data.folder_id}/move-materials`, {
        material_ids: data.material_ids
      });
      return response.data;
    },
    {
      onSuccess: () => {
        showToast({ type: 'success', message: 'Materiál byl úspěšně přesunut do složky' });
        setShowMoveToFolderModal(false);
        setFileToMove(null);
        setSelectedFolderId('');
        queryClient.invalidateQueries(['user-files']);
      },
      onError: (error: any) => {
        showToast({ type: 'error', message: error.response?.data?.error || 'Chyba při přesouvání materiálu' });
      }
    }
  );

  // Handlers
  const handleSearch = () => {
    refetch();
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilterOptions(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilterOptions({
      fileType: '',
      folderId: '',
      dateFrom: '',
      dateTo: '',
      showSharedOnly: false,
      category: '',
      subject: '',
      difficulty: '',
      gradeLevel: '',
      tags: []
    });
  };

  const getFileIcon = (fileType: string) => {
    switch (fileType) {
      case 'worksheet': return <FileText className="w-5 h-5" />;
      case 'lesson_plan': return <BookOpen className="w-5 h-5" />;
      case 'quiz': return <Target className="w-5 h-5" />;
      case 'project': return <Sparkles className="w-5 h-5" />;
      case 'presentation': return <Presentation className="w-5 h-5" />;
      case 'activity': return <Users className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
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

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
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
              Moje materiály
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              Spravujte a organizujte své vzdělávací materiály
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: 'Materiály', path: '/materials' },
          { label: 'Moje materiály' }
        ]} />

        {/* Content Analytics Dashboard */}
        {showAnalytics && analytics.total_files > 0 && (
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Přehled obsahu
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnalytics(!showAnalytics)}
              >
                {showAnalytics ? 'Skrýt' : 'Zobrazit'}
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {analytics.total_files}
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">Celkem</div>
              </div>
              
              <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {analytics.categorized_files}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">Kategorizováno</div>
              </div>
              
              <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {analytics.tagged_files}
                </div>
                <div className="text-sm text-purple-600 dark:text-purple-400">Označeno</div>
              </div>
              
              <div className="text-center p-3 bg-amber-50 dark:bg-amber-950 rounded-lg">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {analytics.approved_files}
                </div>
                <div className="text-sm text-amber-600 dark:text-amber-400">Schváleno</div>
              </div>
              
              <div className="text-center p-3 bg-emerald-50 dark:bg-emerald-950 rounded-lg">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {analytics.files_last_30_days}
                </div>
                <div className="text-sm text-emerald-600 dark:text-emerald-400">30 dní</div>
              </div>
              
              <div className="text-center p-3 bg-rose-50 dark:bg-rose-950 rounded-lg">
                <div className="text-2xl font-bold text-rose-600 dark:text-rose-400">
                  {analytics.files_last_7_days}
                </div>
                <div className="text-sm text-rose-600 dark:text-rose-400">7 dní</div>
              </div>
            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
              <div>
                <h4 className="font-medium mb-3 text-neutral-700 dark:text-neutral-300">Kategorie</h4>
                <div className="space-y-2">
                  {categoryDistribution.slice(0, 5).map((item: DistributionData) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {item.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 text-neutral-700 dark:text-neutral-300">Předměty</h4>
                <div className="space-y-2">
                  {subjectDistribution.slice(0, 5).map((item: DistributionData) => (
                    <div key={item.subject} className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {item.subject}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-3 text-neutral-700 dark:text-neutral-300">Obtížnost</h4>
                <div className="space-y-2">
                  {difficultyDistribution.map((item: DistributionData) => (
                    <div key={item.difficulty} className="flex items-center justify-between">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {item.difficulty}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                          <div 
                            className="bg-purple-500 h-2 rounded-full" 
                            style={{ width: `${item.percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                          {item.count}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Content Recommendations */}
        {showRecommendations && recommendations.length > 0 && (
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Doporučené materiály
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRecommendations(!showRecommendations)}
              >
                {showRecommendations ? 'Skrýt' : 'Zobrazit'}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((rec: any) => (
                <div key={rec.id} className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getFileIcon(rec.file_type)}
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {rec.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <span className="text-xs text-neutral-500">
                        {rec.match_score}
                      </span>
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                    {rec.title}
                  </h4>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(rec.subject)}`}>
                      {rec.subject}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(rec.difficulty)}`}>
                      {rec.difficulty}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>{new Date(rec.created_at).toLocaleDateString()}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setWorksheetData(rec);
                        setShowWorksheet(true);
                      }}
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      Zobrazit
                    </Button>
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
                  {searchMode === 'ai' ? 'AI-powered search' : 'Basic search'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchMode(searchMode === 'ai' ? 'basic' : 'ai')}
                  className="ml-auto"
                >
                  <Zap className={`w-4 h-4 ${searchMode === 'ai' ? 'text-yellow-500' : 'text-neutral-400'}`} />
                  {searchMode === 'ai' ? 'AI' : 'Basic'}
                </Button>
              </div>
              
              <div className="flex gap-2">
                <InputField
                  label=""
                  name="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchMode === 'ai' ? "Hledej s AI pomocí klíčových slov, témat..." : "Hledej podle názvu..."}
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
                  <label className="block text-sm font-medium mb-1">Typ materiálu</label>
                  <select 
                    className="w-full border rounded-md p-2 bg-transparent"
                    value={filterOptions.fileType}
                    onChange={(e) => handleFilterChange('fileType', e.target.value)}
                  >
                    <option value="">Všechny typy</option>
                    <option value="worksheet">Pracovní list</option>
                    <option value="lesson_plan">Plán hodiny</option>
                    <option value="quiz">Kvíz</option>
                    <option value="project">Projekt</option>
                    <option value="presentation">Prezentace</option>
                    <option value="activity">Aktivita</option>
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
                  <label className="block text-sm font-medium mb-1">Ročník</label>
                  <select 
                    className="w-full border rounded-md p-2 bg-transparent"
                    value={filterOptions.gradeLevel}
                    onChange={(e) => handleFilterChange('gradeLevel', e.target.value)}
                  >
                    <option value="">Všechny ročníky</option>
                    <option value="elementary">Základní škola</option>
                    <option value="high_school">Střední škola</option>
                    <option value="university">Vysoká škola</option>
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
                    Nalezeno {totalFiles} materiálů
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
            <p className="mt-4 text-neutral-600 dark:text-neutral-400">Načítání materiálů...</p>
          </div>
        ) : files.length === 0 ? (
          <Card className="text-center py-12">
            <FileText className="w-16 h-16 text-neutral-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
              Žádné materiály nenalezeny
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              {searchTerm ? 'Zkuste upravit vyhledávání nebo filtry.' : 'Začněte vytvářet své první vzdělávací materiály.'}
            </p>
            {!searchTerm && (
              <Button onClick={() => navigate('/materials/create')}>
                <Plus className="w-4 h-4 mr-2" />
                Vytvořit materiál
              </Button>
            )}
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}>
            {files.map((file: any) => (
              <Card key={file.id} className={`hover:shadow-lg transition-shadow ${newIds.includes(file.id) ? 'ring-2 ring-blue-500' : ''}`}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getFileIcon(file.file_type)}
                      <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                        {file.category || 'Nezarovnané'}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      {file.ai_tags && file.ai_tags.length > 0 && (
                        <Tag className="w-4 h-4 text-blue-500" />
                      )}
                      {file.moderation_status === 'approved' && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                  </div>
                  
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2">
                    {file.title}
                  </h4>
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {file.subject && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSubjectColor(file.subject)}`}>
                        {file.subject}
                      </span>
                    )}
                    {file.difficulty && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(file.difficulty)}`}>
                        {file.difficulty}
                      </span>
                    )}
                  </div>
                  
                  {file.ai_tags && file.ai_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {file.ai_tags.slice(0, 3).map((tag: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                      {file.ai_tags.length > 3 && (
                        <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 rounded-full text-xs">
                          +{file.ai_tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-xs text-neutral-500 mb-3">
                    <span>{new Date(file.created_at).toLocaleDateString()}</span>
                    {file.folder_id && (
                      <span className="flex items-center gap-1">
                        <Folder className="w-3 h-3" />
                        {foldersData?.data?.find((f: any) => f.id === file.folder_id)?.name || 'Neznámé'}
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => navigate(`/materials/${file.id}`)}
                      className="flex-1"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Otevřít
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={async () => {
                        try {
                          const content = typeof file.content === 'string' ? JSON.parse(file.content) : file.content;
                          await exportStructuredToDocx(content, file.title || 'material');
                        } catch (e) {
                          showToast({ type: 'error', message: 'Nelze exportovat do DOCX' });
                        }
                      }}
                      title="Stáhnout DOCX"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedFile(file);
                        setShowShareModal(true);
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFileToDelete(file);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Modals */}
        {showWorksheet && worksheetData && (
          <MaterialDisplay
            material={worksheetData}
            onClose={() => setShowWorksheet(false)}
          />
        )}

        {fileToDelete && (
          <ConfirmModal
            isOpen={!!fileToDelete}
            onClose={() => setFileToDelete(null)}
            onConfirm={() => {
              deleteFileMutation.mutate(fileToDelete.id);
              setFileToDelete(null);
            }}
            title="Smazat materiál"
            message={`Opravdu chcete smazat materiál "${fileToDelete.title}"? Tato akce je nevratná.`}
          />
        )}

        {/* Add Folder Modal */}
        {showAddFolderModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Vytvořit novou složku</h3>
              
              <div className="space-y-4">
                <InputField
                  name="name"
                  label="Název složky"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="Zadejte název složky"
                />
                
                <InputField
                  name="description"
                  label="Popis (volitelné)"
                  value={newFolderDescription}
                  onChange={(e) => setNewFolderDescription(e.target.value)}
                  placeholder="Krátký popis složky"
                />
                
                <div>
                  <label className="block text-sm font-medium mb-1">Nadřazená složka</label>
                  <select 
                    className="w-full border rounded-md p-2 bg-transparent"
                    value={newFolderParentId}
                    onChange={(e) => setNewFolderParentId(e.target.value)}
                  >
                    <option value="">Žádná (kořenová složka)</option>
                    {foldersData?.data?.map((folder: any) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="shared"
                    checked={newFolderIsShared}
                    onChange={(e) => setNewFolderIsShared(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="shared" className="text-sm">
                    Sdílet ve škole
                  </label>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setShowAddFolderModal(false)}
                  className="flex-1"
                >
                  Zrušit
                </Button>
                <Button
                  onClick={() => createFolderMutation.mutate({
                    name: newFolderName,
                    description: newFolderDescription,
                    parent_folder_id: newFolderParentId || undefined,
                    is_shared: newFolderIsShared
                  })}
                  disabled={!newFolderName.trim()}
                  className="flex-1"
                >
                  Vytvořit
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Share Modal */}
        {showShareModal && selectedFile && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Sdílet materiál</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Složka (volitelné)</label>
                  <select 
                    className="w-full border rounded-md p-2 bg-transparent"
                    value={selectedFolderId}
                    onChange={(e) => setSelectedFolderId(e.target.value)}
                  >
                    <option value="">Žádná složka</option>
                    {foldersData?.data?.map((folder: any) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="public"
                    className="rounded"
                  />
                  <label htmlFor="public" className="text-sm">
                    Veřejně dostupné
                  </label>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setShowShareModal(false)}
                  className="flex-1"
                >
                  Zrušit
                </Button>
                <Button
                  onClick={() => shareMaterialMutation.mutate({
                    material_id: selectedFile.id,
                    folder_id: selectedFolderId || undefined,
                    is_public: false
                  })}
                  className="flex-1"
                >
                  Sdílet
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Move to Folder Modal */}
        {showMoveToFolderModal && fileToMove && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Přesunout do složky</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Cílová složka</label>
                  <select 
                    className="w-full border rounded-md p-2 bg-transparent"
                    value={selectedFolderId}
                    onChange={(e) => setSelectedFolderId(e.target.value)}
                  >
                    <option value="">Vyberte složku</option>
                    {foldersData?.data?.map((folder: any) => (
                      <option key={folder.id} value={folder.id}>
                        {folder.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-2 mt-6">
                <Button
                  variant="secondary"
                  onClick={() => setShowMoveToFolderModal(false)}
                  className="flex-1"
                >
                  Zrušit
                </Button>
                <Button
                  onClick={() => moveToFolderMutation.mutate({
                    material_ids: [fileToMove.id],
                    folder_id: selectedFolderId
                  })}
                  disabled={!selectedFolderId}
                  className="flex-1"
                >
                  Přesunout
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyMaterialsPage;
