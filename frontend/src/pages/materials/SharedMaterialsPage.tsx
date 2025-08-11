import React, { useState } from 'react';
import { useQuery } from 'react-query';
import { FileText, Download, Eye, Calendar, Search, Filter, Grid, List, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import apiClient from '../../services/apiClient';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import WorksheetDisplay from '../../components/chat/WorksheetDisplay';
import Header from '../../components/layout/Header';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Folder as FolderType } from '../../types';

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
  searchTerm: string;
}

interface SharedMaterial {
  id: string;
  material_id: string;
  shared_by_user_id: string;
  school_id: string;
  folder_id: string | null;
  is_public: boolean;
  shared_at: string;
  title: string;
  content: any;
  file_type: string;
  material_created_at: string;
  first_name: string;
  last_name: string;
  email: string;
  folder_name: string | null;
}

const SharedMaterialsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showWorksheet, setShowWorksheet] = useState(false);
  const [worksheetData, setWorksheetData] = useState<Worksheet | null>(null);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    fileType: '',
    folderId: '',
    dateFrom: '',
    dateTo: '',
    searchTerm: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Queries
  const { data: sharedMaterialsData, isLoading, error } = useQuery(
    ['shared-materials-browse', searchTerm, filterOptions],
    async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterOptions.fileType) params.append('file_type', filterOptions.fileType);
      if (filterOptions.folderId) params.append('folder_id', filterOptions.folderId);
      if (filterOptions.dateFrom) params.append('date_from', filterOptions.dateFrom);
      if (filterOptions.dateTo) params.append('date_to', filterOptions.dateTo);
      
      const response = await apiClient.get(`/shared-materials/browse?${params.toString()}`);
      return response.data;
    },
    {
      enabled: !!user,
      retry: 2,
    }
  );

  const { data: foldersData } = useQuery(
    ['shared-folders'],
    async () => {
      const response = await apiClient.get('/folders');
      return response.data;
    },
    {
      enabled: !!user,
      retry: 2,
    }
  );

  // Data
  const sharedMaterials = (sharedMaterialsData?.data || []) as SharedMaterial[];
  const folders = (foldersData?.data || []) as FolderType[];

  // Filter shared materials based on search term and filters
  const filteredMaterials = sharedMaterials.filter((material: SharedMaterial) => {
    if (searchTerm && !material.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filterOptions.fileType && material.file_type !== filterOptions.fileType) {
      return false;
    }
    if (filterOptions.folderId && material.folder_id !== filterOptions.folderId) {
      return false;
    }
    if (filterOptions.dateFrom && new Date(material.material_created_at) < new Date(filterOptions.dateFrom)) {
      return false;
    }
    if (filterOptions.dateTo && new Date(material.material_created_at) > new Date(filterOptions.dateTo)) {
      return false;
    }
    return true;
  });

  // Handlers
  const handleViewWorksheet = async (material: SharedMaterial) => {
    try {
      const worksheet = material.content;
      setWorksheetData(worksheet);
      setShowWorksheet(true);
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při načítání cvičení' });
    }
  };

  const handleDownloadPDF = (material: SharedMaterial) => {
    try {
      const worksheet = material.content;
      setWorksheetData(worksheet);
      setShowWorksheet(true);
      
      setTimeout(() => {
        const pdfButton = document.querySelector('[data-pdf-download]') as HTMLButtonElement;
        if (pdfButton) {
          pdfButton.click();
        }
      }, 100);
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při načítání cvičení' });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFolderName = (folderId?: string) => {
    if (!folderId) return 'Bez složky';
    const folder = folders.find((f: FolderType) => f.id === folderId);
    return folder ? folder.name : 'Neznámá složka';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 dark:bg-neutral-800 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Chyba při načítání sdílených materiálů
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 mb-4">
              Nepodařilo se načíst sdílené materiály.
            </p>
            <Button onClick={() => window.location.reload()}>
              Zkusit znovu
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation */}
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Zpět na dashboard</span>
          </Button>
        </div>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                Sdílené materiály
              </h1>
              <p className="text-neutral-600 dark:text-neutral-300 mt-2">
                Materiály sdílené učiteli ve vaší škole
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/materials')}
                className="flex items-center space-x-2"
              >
                <FileText className="h-4 w-4" />
                <span>Moje materiály</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span>Filtry</span>
              </Button>
              <div className="flex items-center space-x-2 border border-neutral-300 dark:border-neutral-600 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="p-1"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="p-1"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <InputField
              name="shared_materials_search"
              label="Hledat"
              type="text"
              placeholder="Hledat sdílené materiály..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Typ souboru
                </label>
                <select
                  value={filterOptions.fileType}
                  onChange={(e) => setFilterOptions({...filterOptions, fileType: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md"
                >
                  <option value="">Všechny typy</option>
                  <option value="worksheet">Cvičení</option>
                  <option value="test">Test</option>
                  <option value="lesson_plan">Plán hodiny</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Složka
                </label>
                <select
                  value={filterOptions.folderId}
                  onChange={(e) => setFilterOptions({...filterOptions, folderId: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md"
                >
                  <option value="">Všechny složky</option>
                  <option value="unorganized">Bez složky</option>
                  {folders.map((folder: FolderType) => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Od data
                </label>
                <input
                  type="date"
                  value={filterOptions.dateFrom}
                  onChange={(e) => setFilterOptions({...filterOptions, dateFrom: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Do data
                </label>
                <input
                  type="date"
                  value={filterOptions.dateTo}
                  onChange={(e) => setFilterOptions({...filterOptions, dateTo: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md dark:bg-neutral-800 dark:text-neutral-100"
                />
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Celkem sdílených</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{sharedMaterials.length}</p>
                </div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Typy materiálů</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {new Set(sharedMaterials.map(m => m.file_type)).size}
                  </p>
                </div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Sdíleno tento měsíc</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {sharedMaterials.filter((material: SharedMaterial) => {
                      const sharedDate = new Date(material.shared_at);
                      const now = new Date();
                      return sharedDate.getMonth() === now.getMonth() && 
                             sharedDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Materials List */}
        {filteredMaterials.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                {searchTerm || Object.values(filterOptions).some(v => v) ? 'Žádné sdílené materiály nenalezeny' : 'Zatím nejsou sdílené žádné materiály'}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300">
                {searchTerm || Object.values(filterOptions).some(v => v)
                  ? 'Zkuste změnit vyhledávací termín nebo filtry'
                  : 'Učitelé ve vaší škole zatím nesdíleli žádné materiály'
                }
              </p>
            </div>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
          }>
            {filteredMaterials.map((material: SharedMaterial) => (
              <Card key={material.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <FileText className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          {material.file_type === 'worksheet' ? 'Cvičení' : material.file_type}
                        </span>
                        {material.folder_id && (
                          <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded ml-2">
                            {getFolderName(material.folder_id)}
                          </span>
                        )}
                        <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded ml-2">
                          Sdílené
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2">
                        {material.title}
                      </h3>
                      <div className="space-y-1 mb-4">
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Sdílel: {material.first_name} {material.last_name}
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Vytvořeno: {formatDate(material.material_created_at)}
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                          Sdíleno: {formatDate(material.shared_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewWorksheet(material)}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Zobrazit</span>
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownloadPDF(material)}
                        className="flex items-center space-x-1"
                      >
                        <Download className="h-4 w-4" />
                        <span>PDF</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Worksheet Display Modal */}
      {showWorksheet && worksheetData && (
        <WorksheetDisplay
          worksheet={worksheetData}
          onClose={() => {
            setShowWorksheet(false);
            setWorksheetData(null);
          }}
        />
      )}
    </div>
  );
};

export default SharedMaterialsPage;
