import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { FileText, Download, Trash2, Eye, Calendar, Search, Folder, Share2, Plus, Filter, Grid, List, Users } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import apiClient from '../../services/apiClient';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import InputField from '../../components/ui/InputField';
import ConfirmModal from '../../components/ui/ConfirmModal';
import WorksheetDisplay from '../../components/chat/WorksheetDisplay';
import Header from '../../components/layout/Header';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { GeneratedFile, Folder as FolderType } from '../../types';

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
  showSharedOnly: boolean; // New filter option
}

const MyMaterialsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
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
    showSharedOnly: false // New filter option
  });
  const [showFilters, setShowFilters] = useState(false);

  // Queries
  const { data: filesData, isLoading, error, refetch } = useQuery(
    ['user-files', searchTerm, filterOptions],
    async () => {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterOptions.fileType) params.append('file_type', filterOptions.fileType);
      if (filterOptions.folderId) params.append('folder_id', filterOptions.folderId);
      if (filterOptions.dateFrom) params.append('date_from', filterOptions.dateFrom);
      if (filterOptions.dateTo) params.append('date_to', filterOptions.dateTo);
      
      const response = await apiClient.get(`/files?${params.toString()}`);
      return response.data;
    },
    {
      enabled: !!user,
      retry: 2,
    }
  );

  // New query for shared materials
  const { data: sharedMaterialsData } = useQuery(
    ['shared-materials'],
    async () => {
      const response = await apiClient.get('/shared-materials/browse');
      return response.data;
    },
    {
      enabled: !!user,
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

  const { data: statsData } = useQuery(
    ['user-stats'],
    async () => {
      const response = await apiClient.get('/files/stats');
      return response.data;
    },
    {
      enabled: !!user,
      retry: 2,
    }
  );

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
        queryClient.invalidateQueries(['shared-materials']); // Invalidate shared materials too
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
        // Invalidate both queries to refresh the data
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
        // Refresh folders data
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
        // Refresh files data
        queryClient.invalidateQueries(['user-files']);
      },
      onError: (error: any) => {
        showToast({ type: 'error', message: error.response?.data?.error || 'Chyba při přesouvání materiálu' });
      }
    }
  );

  // Data
  const files = filesData?.data?.files || [];
  const sharedMaterials = sharedMaterialsData?.data || [];
  const folders = (foldersData?.data || []) as FolderType[];
  const stats = statsData?.data || {};

  // Filter files based on search term and filters
  const filteredFiles = files.filter((file: GeneratedFile) => {
    if (searchTerm && !file.title.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (filterOptions.fileType && file.file_type !== filterOptions.fileType) {
      return false;
    }
    if (filterOptions.folderId && file.folder_id !== filterOptions.folderId) {
      return false;
    }
    if (filterOptions.dateFrom && new Date(file.created_at) < new Date(filterOptions.dateFrom)) {
      return false;
    }
    if (filterOptions.dateTo && new Date(file.created_at) > new Date(filterOptions.dateTo)) {
      return false;
    }
    // New filter: show only shared files
    if (filterOptions.showSharedOnly) {
      const isShared = sharedMaterials.some((shared: any) => shared.material_id === file.id);
      if (!isShared) {
        return false;
      }
    }
    return true;
  });

  // Get shared count for the current user's materials
  const userSharedCount = sharedMaterials.filter((shared: any) => 
    files.some((file: GeneratedFile) => file.id === shared.material_id)
  ).length;

  // Handlers
  const handleViewWorksheet = async (file: GeneratedFile) => {
    try {
      console.log('File content type:', typeof file.content);
      console.log('File content preview:', file.content?.substring(0, 200));
      
      let worksheet;
      
      // Try to parse as JSON first
      if (typeof file.content === 'string') {
        try {
          worksheet = JSON.parse(file.content);
        } catch (jsonError) {
          console.log('JSON parsing failed, trying to handle as plain text');
          // If JSON parsing fails, try to create a basic structure
          worksheet = {
            title: file.title,
            instructions: 'Content loaded from file',
            questions: [{
              problem: file.content,
              answer: 'Content loaded from file'
            }]
          };
        }
      } else if (typeof file.content === 'object' && file.content !== null) {
        // Content is already an object
        worksheet = file.content;
      } else {
        throw new Error('Invalid content format');
      }
      
      // Validate worksheet structure
      if (!worksheet.title || !worksheet.questions || !Array.isArray(worksheet.questions)) {
        console.log('Invalid worksheet structure, creating fallback');
        worksheet = {
          title: file.title || 'Untitled',
          instructions: 'Content loaded from file',
          questions: [{
            problem: typeof file.content === 'string' ? file.content : JSON.stringify(file.content, null, 2),
            answer: 'Content loaded from file'
          }]
        };
      }
      
      setWorksheetData(worksheet);
      setShowWorksheet(true);
    } catch (error) {
      console.error('Error loading worksheet:', error);
      console.error('File object:', file);
      
      // Create a fallback worksheet with raw content
      const fallbackWorksheet = {
        title: file.title || 'Untitled',
        instructions: 'Content could not be parsed properly',
        questions: [{
          problem: `Raw content: ${typeof file.content === 'string' ? file.content : JSON.stringify(file.content, null, 2)}`,
          answer: 'Please check the content format'
        }]
      };
      
      setWorksheetData(fallbackWorksheet);
      setShowWorksheet(true);
      
      showToast({ type: 'warning', message: 'Obsah byl načten v základním formátu' });
    }
  };

  const handleDeleteFile = async (file: GeneratedFile) => {
    await deleteFileMutation.mutateAsync(file.id);
    setFileToDelete(null);
  };

  const handleDownloadPDF = (file: GeneratedFile) => {
    try {
      console.log('Downloading file:', file.title);
      console.log('File content type:', typeof file.content);
      
      let worksheet;
      
      // Try to parse as JSON first
      if (typeof file.content === 'string') {
        try {
          worksheet = JSON.parse(file.content);
        } catch (jsonError) {
          console.log('JSON parsing failed for PDF, creating basic structure');
          // If JSON parsing fails, try to create a basic structure
          worksheet = {
            title: file.title,
            instructions: 'Content loaded from file',
            questions: [{
              problem: file.content,
              answer: 'Content loaded from file'
            }]
          };
        }
      } else if (typeof file.content === 'object' && file.content !== null) {
        // Content is already an object
        worksheet = file.content;
      } else {
        throw new Error('Invalid content format');
      }
      
      // Validate worksheet structure
      if (!worksheet.title || !worksheet.questions || !Array.isArray(worksheet.questions)) {
        console.log('Invalid worksheet structure for PDF, creating fallback');
        worksheet = {
          title: file.title || 'Untitled',
          instructions: 'Content loaded from file',
          questions: [{
            problem: typeof file.content === 'string' ? file.content : JSON.stringify(file.content, null, 2),
            answer: 'Content loaded from file'
          }]
        };
      }
      
      setWorksheetData(worksheet);
      setShowWorksheet(true);
      
      setTimeout(() => {
        const pdfButton = document.querySelector('[data-pdf-download]') as HTMLButtonElement;
        if (pdfButton) {
          pdfButton.click();
        } else {
          console.log('PDF download button not found');
          showToast({ type: 'info', message: 'Otevřete cvičení pro stažení PDF' });
        }
      }, 100);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      
      // Create a fallback worksheet with raw content
      const fallbackWorksheet = {
        title: file.title || 'Untitled',
        instructions: 'Content could not be parsed properly',
        questions: [{
          problem: `Raw content: ${typeof file.content === 'string' ? file.content : JSON.stringify(file.content, null, 2)}`,
          answer: 'Please check the content format'
        }]
      };
      
      setWorksheetData(fallbackWorksheet);
      setShowWorksheet(true);
      
      showToast({ type: 'warning', message: 'Obsah byl načten v základním formátu pro PDF' });
    }
  };

  const handleShareMaterial = (file: GeneratedFile) => {
    setSelectedFile(file);
    setShowShareModal(true);
  };

  const handleShare = async (folderId?: string, isPublic: boolean = false) => {
    if (!selectedFile) return;
    
    await shareMaterialMutation.mutateAsync({
      material_id: selectedFile.id,
      folder_id: folderId,
      is_public: isPublic
    });
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      showToast({ type: 'error', message: 'Název složky je povinný' });
      return;
    }

    await createFolderMutation.mutateAsync({
      name: newFolderName.trim(),
      description: newFolderDescription.trim() || undefined,
      parent_folder_id: newFolderParentId || undefined,
      is_shared: newFolderIsShared
    });
  };

  const handleMoveToFolder = (file: GeneratedFile) => {
    setFileToMove(file);
    setSelectedFolderId(file.folder_id || '');
    setShowMoveToFolderModal(true);
  };

  const handleMoveToFolderConfirm = async () => {
    if (!fileToMove) return;
    
    // If no folder is selected, it means removing from folder
    if (!selectedFolderId) {
      // Remove from current folder by setting folder_id to null
      await moveToFolderMutation.mutateAsync({
        material_ids: [fileToMove.id],
        folder_id: 'unorganized' // Special value to indicate removal
      });
      return;
    }
    
    await moveToFolderMutation.mutateAsync({
      material_ids: [fileToMove.id],
      folder_id: selectedFolderId
    });
  };

  const handleRemoveFromFolder = async (file: GeneratedFile) => {
    if (!file.folder_id) return;
    
    await moveToFolderMutation.mutateAsync({
      material_ids: [file.id],
      folder_id: 'unorganized' // Special value to indicate removal
    });
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

  // Check if a file is shared
  const isFileShared = (fileId: string) => {
    return sharedMaterials.some((shared: any) => shared.material_id === fileId);
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
              Chyba při načítání materiálů
            </h2>
            <p className="text-neutral-600 dark:text-neutral-300 mb-4">
              Nepodařilo se načíst vaše vygenerované materiály.
            </p>
            <Button onClick={() => refetch()}>
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
                Moje materiály
              </h1>
              <p className="text-neutral-600 dark:text-neutral-300 mt-2">
                Zde najdete všechny vaše vygenerované cvičení a materiály
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => navigate('/shared-materials')}
                className="flex items-center space-x-2"
              >
                <Users className="h-4 w-4" />
                <span>Zobrazit sdílené</span>
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowAddFolderModal(true)}
                className="flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Nová složka</span>
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
              name="materials_search"
              label="Hledat"
              type="text"
              placeholder="Hledat materiály..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
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
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Zobrazit pouze sdílené
                </label>
                <div className="flex items-center h-10">
                  <input
                    type="checkbox"
                    id="showSharedOnly"
                    checked={filterOptions.showSharedOnly}
                    onChange={(e) => setFilterOptions({...filterOptions, showSharedOnly: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-neutral-300 rounded"
                  />
                  <label htmlFor="showSharedOnly" className="ml-2 text-sm text-neutral-700 dark:text-neutral-300">
                    Pouze sdílené materiály
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Celkem materiálů</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.total_files || files.length}</p>
                </div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <Folder className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Organizované</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{stats.organized_files || 0}</p>
                </div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Vytvořeno tento měsíc</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {files.filter((file: GeneratedFile) => {
                      const fileDate = new Date(file.created_at);
                      const now = new Date();
                      return fileDate.getMonth() === now.getMonth() && 
                             fileDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <Share2 className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Sdílené</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{userSharedCount}</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Materials List */}
        {filteredFiles.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <FileText className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                {searchTerm || Object.values(filterOptions).some(v => v) ? 'Žádné materiály nenalezeny' : 'Zatím nemáte žádné materiály'}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300">
                {searchTerm || Object.values(filterOptions).some(v => v)
                  ? 'Zkuste změnit vyhledávací termín nebo filtry'
                  : 'Začněte generovat cvičení v chat rozhraní'
                }
              </p>
            </div>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
          }>
            {filteredFiles.map((file: GeneratedFile) => (
              <Card key={file.id} className="hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <FileText className="h-5 w-5 text-blue-600 mr-2" />
                        <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded">
                          {file.file_type === 'worksheet' ? 'Cvičení' : file.file_type}
                        </span>
                        {file.folder_id && (
                          <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded ml-2">
                            {getFolderName(file.folder_id)}
                          </span>
                        )}
                        {/* Show shared indicator */}
                        {isFileShared(file.id) && (
                          <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded ml-2">
                            Sdílené
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2">
                        {file.title}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                        Vytvořeno: {formatDate(file.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex space-x-1">
                      <div className="relative group">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewWorksheet(file)}
                          className="p-2 h-8 w-8 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                        >
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 pointer-events-none whitespace-nowrap z-10 shadow-lg">
                          Zobrazit
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900 dark:border-t-neutral-100"></div>
                        </div>
                      </div>
                      
                      <div className="relative group">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDownloadPDF(file)}
                          className="p-2 h-8 w-8 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
                        >
                          <Download className="h-4 w-4 text-green-600" />
                        </Button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 pointer-events-none whitespace-nowrap z-10 shadow-lg">
                          PDF
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900 dark:border-t-neutral-100"></div>
                        </div>
                      </div>
                      
                      <div className="relative group">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleShareMaterial(file)}
                          className="p-2 h-8 w-8 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                        >
                          <Share2 className="h-4 w-4 text-purple-600" />
                        </Button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 pointer-events-none whitespace-nowrap z-10 shadow-lg">
                          Sdílet
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900 dark:border-t-neutral-100"></div>
                        </div>
                      </div>
                      
                      <div className="relative group">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveToFolder(file)}
                          className="p-2 h-8 w-8 hover:bg-orange-50 dark:hover:bg-orange-900/20 transition-all duration-200"
                        >
                          <Folder className="h-4 w-4 text-orange-600" />
                        </Button>
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 pointer-events-none whitespace-nowrap z-10 shadow-lg">
                          Přesunout
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900 dark:border-t-neutral-100"></div>
                        </div>
                      </div>
                      
                      {file.folder_id && (
                        <div className="relative group">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFromFolder(file)}
                            className="p-2 h-8 w-8 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                          >
                            <Folder className="h-4 w-4 text-red-600" />
                          </Button>
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 text-xs rounded opacity-0 group-hover:opacity-100 transition-all duration-300 delay-100 pointer-events-none whitespace-nowrap z-10 shadow-lg">
                            Odstranit
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900 dark:border-t-neutral-100"></div>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFileToDelete(file)}
                      className="p-2 h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

      {/* Delete Confirmation Modal */}
      {fileToDelete && (
        <ConfirmModal
          isOpen={!!fileToDelete}
          onClose={() => setFileToDelete(null)}
          onConfirm={() => handleDeleteFile(fileToDelete)}
          title="Smazat materiál"
          message={`Opravdu chcete smazat materiál "${fileToDelete.title}"? Tato akce je nevratná.`}
          confirmText="Smazat"
          cancelText="Zrušit"
          variant="danger"
        />
      )}

      {/* Share Modal */}
      {showShareModal && selectedFile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Sdílet materiál
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
              "{selectedFile.title}" bude sdílen s ostatními učiteli ve vaší škole.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Složka (volitelné)
                </label>
                <select className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md">
                  <option value="">Bez složky</option>
                  {folders.map((folder: FolderType) => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="isPublic" className="rounded" />
                <label htmlFor="isPublic" className="text-sm text-neutral-700 dark:text-neutral-300">
                  Veřejně dostupné
                </label>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowShareModal(false)}
              >
                Zrušit
              </Button>
              <Button
                onClick={() => handleShare(undefined, false)}
                disabled={shareMaterialMutation.isLoading}
              >
                {shareMaterialMutation.isLoading ? 'Sdílím...' : 'Sdílet'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Folder Modal */}
      {showAddFolderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Vytvořit novou složku
            </h3>
            <div className="space-y-4">
              <div>
                <InputField
                  name="new_folder_name"
                  label="Název složky"
                  type="text"
                  placeholder="Zadejte název složky"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  className="mb-4"
                />
              </div>
              <div>
                <InputField
                  name="new_folder_description"
                  label="Popis (volitelné)"
                  type="text"
                  placeholder="Zadejte popis složky"
                  value={newFolderDescription}
                  onChange={(e) => setNewFolderDescription(e.target.value)}
                  className="mb-4"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Nadřazená složka (volitelné)
                </label>
                <select
                  value={newFolderParentId}
                  onChange={(e) => setNewFolderParentId(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md"
                >
                  <option value="">Bez nadřazené složky</option>
                  {folders.map((folder: FolderType) => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="newFolderIsShared"
                  checked={newFolderIsShared}
                  onChange={(e) => setNewFolderIsShared(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-neutral-300 rounded"
                />
                <label htmlFor="newFolderIsShared" className="text-sm text-neutral-700 dark:text-neutral-300">
                  Sdílená v rámci školy
                </label>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowAddFolderModal(false)}
              >
                Zrušit
              </Button>
              <Button
                onClick={handleCreateFolder}
                disabled={createFolderMutation.isLoading}
              >
                {createFolderMutation.isLoading ? 'Vytvářím...' : 'Vytvořit složku'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Move To Folder Modal */}
      {showMoveToFolderModal && fileToMove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4">
              Přesunout materiál do složky
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-300 mb-4">
              Materiál "{fileToMove.title}" bude přesunut do složky "{getFolderName(selectedFolderId)}".
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Složka
                </label>
                <select
                  value={selectedFolderId}
                  onChange={(e) => setSelectedFolderId(e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md"
                >
                  <option value="">Bez složky</option>
                  {folders.map((folder: FolderType) => (
                    <option key={folder.id} value={folder.id}>{folder.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                variant="secondary"
                onClick={() => setShowMoveToFolderModal(false)}
              >
                Zrušit
              </Button>
              <Button
                onClick={handleMoveToFolderConfirm}
                disabled={moveToFolderMutation.isLoading}
              >
                {moveToFolderMutation.isLoading ? 'Přesouvám...' : 'Přesunout'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyMaterialsPage;
