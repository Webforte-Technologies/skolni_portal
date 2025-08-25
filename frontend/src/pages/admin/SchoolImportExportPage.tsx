import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Download, Upload, FileText, CheckCircle, 
  AlertCircle, XCircle
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { api } from '../../services/apiClient';
import { useToast } from '../../contexts/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; field: string; message: string }>;
}

interface ExportOptions {
  includeTeachers: boolean;
  includeActivity: boolean;
  includeCredits: boolean;
  dateRange: 'all' | '30d' | '90d' | '1y';
  format: 'csv' | 'excel';
}

const SchoolImportExportPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    includeTeachers: true,
    includeActivity: false,
    includeCredits: true,
    dateRange: 'all',
    format: 'csv'
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (file.type === 'text/csv' || 
          file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.type === 'application/vnd.ms-excel') {
        setImportFile(file);
        setImportResult(null);
      } else {
        showToast({ 
          type: 'error', 
          message: 'Podporované formáty: CSV, Excel (.xlsx, .xls)' 
        });
      }
    }
  };

  const handleImport = async () => {
    if (!importFile) return;

    try {
      setImporting(true);
      const formData = new FormData();
      formData.append('file', importFile);

      const response = await api.post('/admin/schools/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const responseData = response.data.data as any;
      setImportResult(responseData);
      showToast({ 
        type: 'success', 
        message: `Import dokončen: ${responseData.success} úspěšných, ${responseData.failed} neúspěšných` 
      });
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      setImportFile(null);
    } catch (error: any) {
      showToast({ 
        type: 'error', 
        message: error.response?.data?.error || 'Chyba při importu škol' 
      });
    } finally {
      setImporting(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      
      const queryParams = new URLSearchParams({
        include_teachers: exportOptions.includeTeachers.toString(),
        include_activity: exportOptions.includeActivity.toString(),
        include_credits: exportOptions.includeCredits.toString(),
        date_range: exportOptions.dateRange,
        format: exportOptions.format
      });

      const response = await api.get(`/admin/schools/export?${queryParams.toString()}`, {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data as unknown as BlobPart]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `schools_export_${new Date().toISOString().split('T')[0]}.${exportOptions.format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      showToast({ 
        type: 'success', 
        message: 'Export škol byl úspěšně dokončen' 
      });
    } catch (error: any) {
      showToast({ 
        type: 'error', 
        message: error.response?.data?.error || 'Chyba při exportu škol' 
      });
    } finally {
      setExporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `Název školy,Adresa,Město,PSČ,Telefon,Email,Webové stránky,Počet učitelů,Počet studentů,Předplatný
Základní škola Praha,Na Příkopě 1,Praha,11000,+420123456789,info@zs-praha.cz,www.zs-praha.cz,25,300,premium
Gymnázium Brno,Komenského 5,Brno,60200,+420987654321,gym@brno.cz,www.gym-brno.cz,35,450,standard`;
    
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'schools_import_template.csv');
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="secondary" 
              onClick={() => navigate('/admin/schools')}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Zpět na školy</span>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Import/Export škol</h1>
              <p className="text-gray-600 mt-1">Hromadné importování a exportování dat škol</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Import Section */}
          <Card>
            <div className="flex items-center space-x-2 mb-4">
              <Upload className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Import škol</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vyberte soubor (CSV nebo Excel)
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              {importFile && (
                <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-800">{importFile.name}</span>
                  <span className="text-xs text-blue-600">
                    ({(importFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              )}

              <div className="flex items-center space-x-3">
                <Button 
                  variant="primary" 
                  onClick={handleImport}
                  disabled={!importFile || importing}
                  isLoading={importing}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Importovat školy
                </Button>
                <Button variant="secondary" onClick={downloadTemplate}>
                  <Download className="w-4 h-4 mr-2" />
                  Stáhnout šablonu
                </Button>
              </div>

              {importResult && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Výsledek importu:</h4>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span>{importResult.success} úspěšných</span>
                    </div>
                    {importResult.failed > 0 && (
                      <div className="flex items-center space-x-1 text-red-600">
                        <XCircle className="w-4 h-4" />
                        <span>{importResult.failed} neúspěšných</span>
                      </div>
                    )}
                  </div>
                  
                  {importResult.errors.length > 0 && (
                    <div className="mt-3">
                      <h5 className="font-medium text-gray-700 mb-2">Chyby:</h5>
                      <div className="space-y-1 text-xs text-red-600">
                        {importResult.errors.slice(0, 5).map((error, index) => (
                          <div key={index}>
                            Řádek {error.row}: {error.field} - {error.message}
                          </div>
                        ))}
                        {importResult.errors.length > 5 && (
                          <div>... a dalších {importResult.errors.length - 5} chyb</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Export Section */}
          <Card>
            <div className="flex items-center space-x-2 mb-4">
              <Download className="w-5 h-5 text-green-600" />
              <h2 className="text-xl font-semibold text-gray-900">Export škol</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Obsah exportu
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeTeachers}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeTeachers: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Zahrnout učitele</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeActivity}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeActivity: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Zahrnout aktivitu</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeCredits}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeCredits: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Zahrnout kredity</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Časové období
                </label>
                <select
                  value={exportOptions.dateRange}
                  onChange={(e) => setExportOptions(prev => ({ ...prev, dateRange: e.target.value as any }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">Všechny školy</option>
                  <option value="30d">Aktivní v posledních 30 dnech</option>
                  <option value="90d">Aktivní v posledních 90 dnech</option>
                  <option value="1y">Aktivní v posledním roce</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formát exportu
                </label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="csv"
                      checked={exportOptions.format === 'csv'}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as 'csv' | 'excel' }))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">CSV</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="excel"
                      checked={exportOptions.format === 'excel'}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, format: e.target.value as 'csv' | 'excel' }))}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Excel</span>
                  </label>
                </div>
              </div>

              <Button 
                variant="primary" 
                onClick={handleExport}
                disabled={exporting}
                isLoading={exporting}
                className="w-full"
              >
                <Download className="w-4 h-4 mr-2" />
                Exportovat školy
              </Button>
            </div>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Instrukce pro import</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Použijte poskytnutou šablonu CSV pro správný formát dat</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Povinné pole je pouze &quot;Název školy&quot; - ostatní jsou volitelné</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Pro telefon použijte mezinárodní formát (+420...)</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span>Email musí být ve validním formátu</span>
            </div>
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <span>Školy se stejným názvem nebudou importovány</span>
            </div>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default SchoolImportExportPage;
