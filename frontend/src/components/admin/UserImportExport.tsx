import React, { useState, useRef } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import InputField from '../ui/InputField';
import Badge from '../ui/Badge';

export interface UserImportData {
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  school_id?: string;
  credits_balance: number;
  is_active: boolean;
}

export interface UserExportOptions {
  include_activity: boolean;
  include_credits: boolean;
  include_school_info: boolean;
  date_from?: string;
  date_to?: string;
  role_filter?: string;
  school_filter?: string;
  format: 'csv' | 'excel';
}

export interface ImportResult {
  total: number;
  successful: number;
  failed: number;
  errors: Array<{
    row: number;
    field: string;
    message: string;
  }>;
}

interface UserImportExportProps {
  onImport: (file: File, options: any) => Promise<ImportResult>;
  onExport: (options: UserExportOptions) => Promise<void>;
  schools?: Array<{ id: string; name: string }>;
  loading?: boolean;
}

const UserImportExport: React.FC<UserImportExportProps> = ({
  onImport,
  onExport,
  schools = [],
  loading = false
}) => {
  const [activeTab, setActiveTab] = useState<'import' | 'export'>('import');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [exportOptions, setExportOptions] = useState<UserExportOptions>({
    include_activity: true,
    include_credits: true,
    include_school_info: true,
    format: 'csv'
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setImportResult(null);
    }
  };

  const handleImport = async () => {
    if (!selectedFile) return;

    try {
      const result = await onImport(selectedFile, {});
      setImportResult(result);
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  const handleExport = async () => {
    try {
      await onExport(exportOptions);
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const downloadTemplate = () => {
    const template = `email,first_name,last_name,role,school_id,credits_balance,is_active
jan.novak@example.com,Jan,Novák,teacher_school,1,100,true
marie.svobodova@example.com,Marie,Svobodová,teacher_individual,,50,true`;
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'user_import_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Import/Export uživatelů</h3>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('import')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'import'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Import uživatelů
          </button>
          <button
            onClick={() => setActiveTab('export')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'export'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Export uživatelů
          </button>
        </nav>
      </div>

      {/* Import Tab */}
      {activeTab === 'import' && (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-blue-900 mb-2">Instrukce pro import</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Soubor musí být ve formátu CSV nebo Excel</li>
              <li>• Povinné sloupce: email, first_name, last_name, role</li>
              <li>• Volitelné sloupce: school_id, credits_balance, is_active</li>
              <li>• Role musí být: platform_admin, school_admin, teacher_school, teacher_individual</li>
              <li>• is_active musí být true nebo false</li>
            </ul>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                Vybrat soubor
              </Button>
              <Button
                variant="outline"
                onClick={downloadTemplate}
                disabled={loading}
              >
                Stáhnout šablonu
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleFileSelect}
              className="hidden"
            />

            {selectedFile && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{selectedFile.name}</p>
                    <p className="text-sm text-gray-600">{getFileSize(selectedFile.size)}</p>
                  </div>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setSelectedFile(null);
                      setImportResult(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    disabled={loading}
                  >
                    Odstranit
                  </Button>
                </div>
              </div>
            )}

            {selectedFile && (
              <Button
                variant="primary"
                onClick={handleImport}
                disabled={loading}
                className="w-full"
              >
                {loading ? 'Importuji...' : 'Importovat uživatele'}
              </Button>
            )}
          </div>

          {/* Import Results */}
          {importResult && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-md font-medium text-gray-900 mb-3">Výsledky importu</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{importResult.total}</p>
                  <p className="text-sm text-gray-600">Celkem</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{importResult.successful}</p>
                  <p className="text-sm text-gray-600">Úspěšné</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">{importResult.failed}</p>
                  <p className="text-sm text-gray-600">Chyby</p>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-2">Chyby:</h5>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {importResult.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        Řádek {error.row}: {error.field} - {error.message}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Export Tab */}
      {activeTab === 'export' && (
        <div className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-md font-medium text-green-900 mb-2">Možnosti exportu</h4>
            <p className="text-sm text-green-800">
              Vyberte, jaká data chcete exportovat a v jakém formátu.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Export Options */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Zahrnout data</h4>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.include_activity}
                    onChange={(e) => setExportOptions({
                      ...exportOptions,
                      include_activity: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Aktivita uživatelů</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.include_credits}
                    onChange={(e) => setExportOptions({
                      ...exportOptions,
                      include_credits: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Kreditní transakce</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={exportOptions.include_school_info}
                    onChange={(e) => setExportOptions({
                      ...exportOptions,
                      include_school_info: e.target.checked
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Informace o školách</span>
                </label>
              </div>
            </div>

            {/* Filters */}
            <div className="space-y-4">
              <h4 className="text-md font-medium text-gray-900">Filtry</h4>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Datum od
                  </label>
                  <InputField
                    type="date"
                    value={exportOptions.date_from || ''}
                    onChange={(e) => setExportOptions({
                      ...exportOptions,
                      date_from: e.target.value
                    })}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Datum do
                  </label>
                  <InputField
                    type="date"
                    value={exportOptions.date_to || ''}
                    onChange={(e) => setExportOptions({
                      ...exportOptions,
                      date_to: e.target.value
                    })}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    value={exportOptions.role_filter || ''}
                    onChange={(e) => setExportOptions({
                      ...exportOptions,
                      role_filter: e.target.value
                    })}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Všechny role</option>
                    <option value="platform_admin">Platform Admin</option>
                    <option value="school_admin">School Admin</option>
                    <option value="teacher_school">School Teacher</option>
                    <option value="teacher_individual">Individual Teacher</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Škola
                  </label>
                  <select
                    value={exportOptions.school_filter || ''}
                    onChange={(e) => setExportOptions({
                      ...exportOptions,
                      school_filter: e.target.value
                    })}
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Všechny školy</option>
                    {schools.map((school) => (
                      <option key={school.id} value={school.id}>
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div className="space-y-3">
            <h4 className="text-md font-medium text-gray-900">Formát exportu</h4>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="csv"
                  checked={exportOptions.format === 'csv'}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    format: e.target.value as 'csv' | 'excel'
                  })}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">CSV</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="excel"
                  checked={exportOptions.format === 'excel'}
                  onChange={(e) => setExportOptions({
                    ...exportOptions,
                    format: e.target.value as 'csv' | 'excel'
                  })}
                  className="text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Excel</span>
              </label>
            </div>
          </div>

          <Button
            variant="primary"
            onClick={handleExport}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'Exportuji...' : `Exportovat uživatele (${exportOptions.format.toUpperCase()})`}
          </Button>
        </div>
      )}
    </Card>
  );
};

export default UserImportExport;
