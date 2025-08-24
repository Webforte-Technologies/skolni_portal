import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText, CheckCircle, XCircle, Info } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import UserImportExport, { ImportResult } from '../../components/admin/UserImportExport';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

const UserImportExportPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showImportResult, setShowImportResult] = useState(false);

  const handleImport = async (file: File, options: any): Promise<ImportResult> => {
    try {
      setLoading(true);
      setShowImportResult(false);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('options', JSON.stringify(options));
      
      const response = await api.post<ApiResponse<ImportResult>>('/admin/users/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success && response.data.data) {
        const result = response.data.data as unknown as ImportResult;
        setImportResult(result);
        setShowImportResult(true);
        showToast({ 
          type: 'success', 
          message: `Import dokončen: ${result.successful} úspěšných, ${result.failed} chyb` 
        });
        return result;
      }
      throw new Error('Import failed');
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 'Chyba při importu souboru';
      showToast({ type: 'error', message: errorMessage });
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (options: any) => {
    try {
      const response = await api.get('/admin/users/export', {
        params: options,
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data as unknown as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `users-export-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showToast({ type: 'success', message: 'Export byl úspěšně stažen' });
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při exportu uživatelů' });
    }
  };



  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/admin/users')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zpět na seznam
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Import/Export uživatelů</h1>
              <p className="text-gray-600">Správa hromadného importu a exportu uživatelských dat</p>
            </div>
          </div>
        </div>

        {/* Import/Export Component */}
        <UserImportExport
          onImport={handleImport}
          onExport={handleExport}
          loading={loading}
        />

        {/* Import Result Modal */}
        {showImportResult && importResult && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Výsledek importu</h3>
                <Button variant="outline" onClick={() => setShowImportResult(false)}>
                  Zavřít
                </Button>
              </div>
              
              {/* Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Celkem řádků</p>
                      <p className="text-2xl font-bold text-gray-900">{importResult.total}</p>
                    </div>
                    <FileText className="w-6 h-6 text-blue-500" />
                  </div>
                </Card>
                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Úspěšné importy</p>
                      <p className="text-2xl font-bold text-green-600">{importResult.successful}</p>
                    </div>
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  </div>
                </Card>
                <Card>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Chyby</p>
                      <p className="text-2xl font-bold text-red-600">{importResult.failed}</p>
                    </div>
                    <XCircle className="w-6 h-6 text-red-500" />
                  </div>
                </Card>
              </div>

              {/* Errors */}
              {importResult.errors.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-md font-semibold text-red-700 mb-3 flex items-center">
                    <XCircle className="w-4 h-4 mr-2" />
                    Chyby ({importResult.errors.length})
                  </h4>
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="mb-2 p-2 bg-red-100 rounded">
                        <p className="text-sm text-red-800">
                          <strong>Řádek {error.row}:</strong> {error.field} - {error.message}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Success Rate */}
              {importResult.total > 0 && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <Info className="w-4 h-4 text-green-600 mr-2" />
                    <p className="text-sm text-green-800">
                      Úspěšnost importu: {Math.round((importResult.successful / importResult.total) * 100)}%
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Help Section */}
        <Card title="Nápověda pro import/export" icon={<Info className="w-5 h-5" />}>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Formát CSV souboru</h4>
              <p className="text-sm text-gray-600 mb-2">
                Pro import uživatelů použijte CSV soubor s následujícími sloupci:
              </p>
              <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                email,first_name,last_name,role,school_name,credits_balance
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Povinné sloupce</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>email</strong> - Emailová adresa uživatele (unikátní)</li>
                <li>• <strong>first_name</strong> - Jméno uživatele</li>
                <li>• <strong>last_name</strong> - Příjmení uživatele</li>
                <li>• <strong>role</strong> - Role uživatele (teacher, school_admin, platform_admin)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Volitelné sloupce</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>school_name</strong> - Název školy (pro učitele)</li>
                <li>• <strong>credits_balance</strong> - Počáteční kreditní zůstatek</li>
                <li>• <strong>phone</strong> - Telefonní číslo</li>
                <li>• <strong>address</strong> - Adresa</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Příklad CSV</h4>
              <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                email,first_name,last_name,role,school_name,credits_balance<br/>
                jan.novak@skola.cz,Jan,Novák,teacher,Základní škola Praha,100<br/>
                marie.svobodova@skola.cz,Marie,Svobodová,school_admin,Základní škola Praha,200
              </div>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default UserImportExportPage;
