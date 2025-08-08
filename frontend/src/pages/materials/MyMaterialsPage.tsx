import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { FileText, Download, Trash2, Eye, Calendar, Search } from 'lucide-react';
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

interface GeneratedFile {
  id: string;
  title: string;
  content: string;
  file_type: string;
  created_at: string;
}

interface Worksheet {
  title: string;
  instructions: string;
  questions: Array<{
    problem: string;
    answer: string;
  }>;
}

const MyMaterialsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
  const [showWorksheet, setShowWorksheet] = useState(false);
  const [worksheetData, setWorksheetData] = useState<Worksheet | null>(null);
  const [fileToDelete, setFileToDelete] = useState<GeneratedFile | null>(null);

  // Fetch user's generated files
  const { data: filesData, isLoading, error, refetch } = useQuery(
    ['user-files'],
    async () => {
      const response = await apiClient.get('/files');
      return response.data;
    },
    {
      enabled: !!user,
      retry: 2,
    }
  );

  const files = filesData?.data?.files || [];

  // Filter files based on search term
  const filteredFiles = files.filter((file: GeneratedFile) =>
    file.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewWorksheet = async (file: GeneratedFile) => {
    try {
      const worksheet = JSON.parse(file.content);
      setWorksheetData(worksheet);
      setSelectedFile(file);
      setShowWorksheet(true);
    } catch (error) {
      showToast('Chyba při načítání cvičení', 'error');
    }
  };

  const handleDeleteFile = async (file: GeneratedFile) => {
    try {
      await apiClient.delete(`/files/${file.id}`);
      showToast('Soubor byl úspěšně smazán', 'success');
      refetch();
    } catch (error) {
      showToast('Chyba při mazání souboru', 'error');
    }
    setFileToDelete(null);
  };

  const handleDownloadPDF = (file: GeneratedFile) => {
    try {
      const worksheet = JSON.parse(file.content);
      // Open the worksheet in a modal and then trigger PDF download
      setWorksheetData(worksheet);
      setSelectedFile(file);
      setShowWorksheet(true);
      
      // Trigger PDF download after a short delay to ensure modal is rendered
      setTimeout(() => {
        const pdfButton = document.querySelector('[data-pdf-download]') as HTMLButtonElement;
        if (pdfButton) {
          pdfButton.click();
        }
      }, 100);
    } catch (error) {
      showToast('Chyba při načítání cvičení', 'error');
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-900">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <InputField
                  type="text"
                  placeholder="Hledat materiály..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Celkem materiálů</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{files.length}</p>
                </div>
              </div>
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <div className="flex items-center">
                <Calendar className="h-8 w-8 text-green-600" />
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
                <Download className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-300">Cvičení</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {files.filter((file: GeneratedFile) => file.file_type === 'worksheet').length}
                  </p>
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
                {searchTerm ? 'Žádné materiály nenalezeny' : 'Zatím nemáte žádné materiály'}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-300">
                {searchTerm 
                  ? 'Zkuste změnit vyhledávací termín'
                  : 'Začněte generovat cvičení v chat rozhraní'
                }
              </p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      </div>
                      <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2 line-clamp-2">
                        {file.title}
                      </h3>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                        Vytvořeno: {formatDate(file.created_at)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleViewWorksheet(file)}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>Zobrazit</span>
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleDownloadPDF(file)}
                        className="flex items-center space-x-1"
                      >
                        <Download className="h-4 w-4" />
                        <span>PDF</span>
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setFileToDelete(file)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
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
            setSelectedFile(null);
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
    </div>
  );
};

export default MyMaterialsPage;
