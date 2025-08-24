import React, { useState } from 'react';
import { 
  TrendingUp, Target, AlertTriangle,
  Download, Grid3X3
} from 'lucide-react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '../../contexts/ToastContext';
import {
  TrendAnalysisWidget,
  PredictiveInsightsWidget,
  AnomalyDetectionWidget,
  DashboardLayoutManager
} from '../../components/admin/DynamicWidgets';

interface TrendData {
  type: string;
  data: {
    total_growth?: number;
    total_purchased?: number;
    total_created?: number;
    total_revenue?: number;
  };
}

interface PredictionData {
  type: string;
  data: {
    confidence?: number;
  };
}

interface AnomalyData {
  type: string;
  severity?: string | number;
}

interface LayoutData {
  name: string;
}

interface ExportData {
  [key: string]: any;
}

const AdvancedAnalyticsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('trends');
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportData, setExportData] = useState<ExportData | null>(null);
  const [exportFormat, setExportFormat] = useState<'csv' | 'json'>('json');
  const { showToast } = useToast();

  const tabs = [
    { id: 'trends', name: 'Analýza trendů', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'predictions', name: 'Prediktivní analýza', icon: <Target className="w-4 h-4" /> },
    { id: 'anomalies', name: 'Detekce anomálií', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'layouts', name: 'Správa rozložení', icon: <Grid3X3 className="w-4 h-4" /> }
  ];

  const handleExport = (data: ExportData, format: string) => {
    // Validate format is supported
    if (format !== 'csv' && format !== 'json') {
      showToast({ type: 'error', message: 'Nepodporovaný formát exportu' });
      return;
    }
    
    setExportData(data);
    setExportFormat(format as 'csv' | 'json');
    setShowExportModal(true);
  };

  const handleExportConfirm = () => {
    if (!exportData) return;

    try {
      let content: string;
      let mimeType: string;
      let extension: string;

      if (exportFormat === 'csv') {
        content = convertToCSV(exportData);
        mimeType = 'text/csv';
        extension = 'csv';
      } else {
        content = JSON.stringify(exportData, null, 2);
        mimeType = 'application/json';
        extension = 'json';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `advanced-analytics-${activeTab}-${new Date().toISOString().split('T')[0]}.${extension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast({ type: 'success', message: 'Data byla úspěšně exportována' });
      setShowExportModal(false);
    } catch (error) {
      console.error('Export failed:', error);
      showToast({ type: 'error', message: 'Chyba při exportu dat' });
    }
  };

  const convertToCSV = (data: ExportData): string => {
    if (typeof data !== 'object' || data === null) {
      return String(data);
    }

    if (Array.isArray(data)) {
      if (data.length === 0) return '';
      
      const headers = Object.keys(data[0]);
      const csvRows = [headers.join(',')];
      
      for (const row of data) {
        const values = headers.map(header => {
          const value = row[header];
          // Handle different value types safely
          let stringValue: string;
          if (value === null || value === undefined) {
            stringValue = '';
          } else if (typeof value === 'object') {
            stringValue = JSON.stringify(value);
          } else {
            stringValue = String(value);
          }
          
          // Escape quotes and wrap in quotes if contains comma, newline, or quote
          const escapedValue = stringValue.replace(/"/g, '""');
          if (escapedValue.includes(',') || escapedValue.includes('\n') || escapedValue.includes('"')) {
            return `"${escapedValue}"`;
          }
          return escapedValue;
        });
        csvRows.push(values.join(','));
      }
      
      return csvRows.join('\n');
    } else {
      // Single object
      const headers = Object.keys(data);
      const values = headers.map(header => {
        const value = data[header];
        // Handle different value types safely
        let stringValue: string;
        if (value === null || value === undefined) {
          stringValue = '';
        } else if (typeof value === 'object') {
          stringValue = JSON.stringify(value);
        } else {
          stringValue = String(value);
        }
        
        // Escape quotes and wrap in quotes if contains comma, newline, or quote
        const escapedValue = stringValue.replace(/"/g, '""');
        if (escapedValue.includes(',') || escapedValue.includes('\n') || escapedValue.includes('"')) {
          return `"${escapedValue}"`;
        }
        return escapedValue;
      });
      
      return [headers.join(','), values.join(',')].join('\n');
    }
  };

  const handleTrendClick = (trend: TrendData) => {
    showToast({ 
      type: 'info', 
      message: `Trend kliknut: ${trend.type} - ${trend.data.total_growth || trend.data.total_purchased || trend.data.total_created || trend.data.total_revenue || 0}` 
    });
  };

  const handlePredictionClick = (prediction: PredictionData) => {
    showToast({ 
      type: 'info', 
      message: `Predikce kliknuta: ${prediction.type} - Jistota: ${Math.round((prediction.data.confidence || 0) * 100)}%` 
    });
  };

  const handleAnomalyClick = (anomaly: AnomalyData) => {
    showToast({ 
      type: 'info', 
      message: `Anomálie kliknuta: ${anomaly.type} - Závažnost: ${anomaly.severity}` 
    });
  };

  const handleLayoutChange = (layout: LayoutData) => {
    showToast({ 
      type: 'success', 
      message: `Rozložení změněno na: ${layout.name}` 
    });
  };

  const handleLayoutSave = (layout: LayoutData) => {
    showToast({ 
      type: 'success', 
      message: `Rozložení uloženo: ${layout.name}` 
    });
  };

  const handleExportClick = () => {
    if (exportData) {
      setShowExportModal(true);
    } else {
      showToast({ 
        type: 'warning', 
        message: 'Žádná data k exportu. Nejdříve načtěte data z některé z karet.' 
      });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pokročilá analýza</h1>
              <p className="text-gray-600 mt-1">
                Pokročilé analytické nástroje pro predikci, detekci anomálií a správu rozložení dashboardů
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportClick}
                disabled={!exportData}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {activeTab === 'trends' && (
            <TrendAnalysisWidget
              title="Analýza trendů"
              endpoint="/admin/analytics/trends"
              refreshInterval={30000}
              maxTrends={6}
              showFilters={true}
              showActions={true}
              onTrendClick={handleTrendClick}
              onExport={handleExport}
            />
          )}

          {activeTab === 'predictions' && (
            <PredictiveInsightsWidget
              title="Prediktivní analýza"
              endpoint="/admin/analytics/predictions"
              refreshInterval={60000}
              showFilters={true}
              showActions={true}
              onPredictionClick={handlePredictionClick}
              onExport={handleExport}
            />
          )}

          {activeTab === 'anomalies' && (
            <AnomalyDetectionWidget
              title="Detekce anomálií"
              endpoint="/admin/analytics/anomalies"
              refreshInterval={30000}
              maxAnomalies={15}
              showFilters={true}
              showActions={true}
              onAnomalyClick={handleAnomalyClick}
              onExport={handleExport}
            />
          )}

          {activeTab === 'layouts' && (
            <DashboardLayoutManager
              title="Správa rozložení dashboardů"
              onLayoutChange={handleLayoutChange}
              onLayoutSave={handleLayoutSave}
            />
          )}
        </div>

        {/* Export Modal */}
        {showExportModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Export dat</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Formát exportu
                    </label>
                    <select
                      value={exportFormat}
                      onChange={(e) => setExportFormat(e.target.value as 'csv' | 'json')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="json">JSON</option>
                      <option value="csv">CSV</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-end space-x-3">
                    <button
                      onClick={() => setShowExportModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Zrušit
                    </button>
                    <button
                      onClick={handleExportConfirm}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Exportovat
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdvancedAnalyticsPage;
