import React, { useState, useEffect } from 'react';
import {
  Wifi, WifiOff, Cloud, CloudOff, AlertCircle,
  CheckCircle, RefreshCw, Clock, Database, Download, Upload, Settings
} from 'lucide-react';
import { useToast } from '../../contexts/ToastContext';
import { offlineService } from '../../services/OfflineService';
import Button from './Button';
import Card from './Card';

interface OfflineStats {
  totalMaterials: number;
  unsyncedMaterials: number;
  totalFolders: number;
  unsyncedFolders: number;
  queueSize: number;
  cacheSize: number;
}

const OfflineIndicator: React.FC = () => {
  const { showToast } = useToast();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showDetails, setShowDetails] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [stats, setStats] = useState<OfflineStats | null>(null);

  useEffect(() => {
    // Initialize offline service
    offlineService.init();

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOnline(true);
      showToast({
        type: 'success',
        message: 'Připojení obnoveno. Synchronizuji data...'
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
      showToast({
        type: 'warning',
        message: 'Jste offline. Změny budou synchronizovány po obnovení připojení.'
      });
    };

    const handleSyncStarted = () => {
      setSyncStatus('syncing');
    };

    const handleSyncCompleted = () => {
      setSyncStatus('idle');
      showToast({
        type: 'success',
        message: 'Synchronizace dokončena'
      });
      loadStats();
    };

    const handleSyncError = (_error: any) => {
      setSyncStatus('error');
      showToast({
        type: 'error',
        message: 'Chyba při synchronizaci'
      });
    };

    // Register event listeners
    offlineService.on('online', handleOnline);
    offlineService.on('offline', handleOffline);
    offlineService.on('sync_started', handleSyncStarted);
    offlineService.on('sync_completed', handleSyncCompleted);
    offlineService.on('sync_error', handleSyncError);

    // Load initial stats
    loadStats();

    // Update stats periodically
    const statsInterval = setInterval(loadStats, 30000); // Every 30 seconds

    return () => {
      offlineService.off('online', handleOnline);
      offlineService.off('offline', handleOffline);
      offlineService.off('sync_started', handleSyncStarted);
      offlineService.off('sync_completed', handleSyncCompleted);
      offlineService.off('sync_error', handleSyncError);
      clearInterval(statsInterval);
    };
  }, [showToast]);

  const loadStats = async () => {
    try {
      const offlineStats = await offlineService.getOfflineStats();
      setStats(offlineStats);
    } catch (error) {
      console.error('Failed to load offline stats:', error);
    }
  };

  const handleExportData = async () => {
    try {
      const data = await offlineService.exportOfflineData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eduai-offline-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast({ type: 'success', message: 'Offline data byla exportována' });
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při exportu dat' });
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      const content = e.target?.result as string;
      const success = await offlineService.importOfflineData(content);
      if (success) {
        showToast({ type: 'success', message: 'Data byla importována' });
        loadStats();
      } else {
        showToast({ type: 'error', message: 'Neplatný formát souboru' });
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = async () => {
    if (window.confirm('Opravdu chcete smazat všechna offline data? Tato akce je nevratná.')) {
      try {
        await offlineService.clearAllData();
        showToast({ type: 'success', message: 'Offline data byla vymazána' });
        loadStats();
      } catch (error) {
        showToast({ type: 'error', message: 'Chyba při mazání dat' });
      }
    }
  };

  const getStatusIcon = () => {
    if (syncStatus === 'syncing') {
      return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
    }
    if (syncStatus === 'error') {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    if (isOnline) {
      return <Wifi className="w-4 h-4 text-green-500" />;
    }
    return <WifiOff className="w-4 h-4 text-orange-500" />;
  };

  const getStatusText = () => {
    if (syncStatus === 'syncing') return 'Synchronizuji...';
    if (syncStatus === 'error') return 'Chyba sync';
    if (isOnline) return 'Online';
    return 'Offline';
  };

  const getStatusColor = () => {
    if (syncStatus === 'syncing') return 'text-blue-600 dark:text-blue-400';
    if (syncStatus === 'error') return 'text-red-600 dark:text-red-400';
    if (isOnline) return 'text-green-600 dark:text-green-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  return (
    <>
      {/* Indicator Button */}
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`
          flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors
          ${isOnline
            ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950 hover:bg-green-100 dark:hover:bg-green-900'
            : 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950 hover:bg-orange-100 dark:hover:bg-orange-900'
          }
        `}
        title={`Stav připojení: ${getStatusText()}`}
      >
        {getStatusIcon()}
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
        {stats && (stats.unsyncedMaterials > 0 || stats.queueSize > 0) && (
          <span className="ml-1 px-2 py-1 text-xs bg-orange-500 text-white rounded-full">
            {stats.unsyncedMaterials + stats.queueSize}
          </span>
        )}
      </button>

      {/* Details Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
                <Database className="w-5 h-5" />
                Offline režim
              </h2>
              <Button variant="ghost" onClick={() => setShowDetails(false)}>
                ×
              </Button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-140px)]">
              {/* Connection Status */}
              <div className="flex items-center gap-4 p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                <div className={`p-3 rounded-full ${
                  isOnline
                    ? 'bg-green-100 dark:bg-green-900'
                    : 'bg-orange-100 dark:bg-orange-900'
                }`}>
                  {isOnline ? (
                    <Cloud className="w-6 h-6 text-green-600 dark:text-green-400" />
                  ) : (
                    <CloudOff className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                    Stav připojení
                  </h3>
                  <p className={`text-sm ${getStatusColor()}`}>
                    {isOnline ? 'Připojeno k internetu' : 'Bez připojení k internetu'}
                  </p>
                  {syncStatus === 'syncing' && (
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      Probíhá synchronizace dat...
                    </p>
                  )}
                </div>
              </div>

              {/* Statistics */}
              {stats && (
                <div>
                  <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                    Offline statistiky
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {stats.totalMaterials}
                      </div>
                      <div className="text-sm text-blue-600 dark:text-blue-400">
                        Materiálů offline
                      </div>
                    </div>

                    <div className="text-center p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {stats.unsyncedMaterials}
                      </div>
                      <div className="text-sm text-orange-600 dark:text-orange-400">
                        Nesynchronizováno
                      </div>
                    </div>

                    <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {stats.totalFolders}
                      </div>
                      <div className="text-sm text-green-600 dark:text-green-400">
                        Složek offline
                      </div>
                    </div>

                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {stats.queueSize}
                      </div>
                      <div className="text-sm text-purple-600 dark:text-purple-400">
                        Ve frontě sync
                      </div>
                    </div>

                    <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                      <div className="text-2xl font-bold text-neutral-600 dark:text-neutral-400">
                        {stats.cacheSize}
                      </div>
                      <div className="text-sm text-neutral-600 dark:text-neutral-400">
                        Cache položek
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Offline Features */}
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                  Dostupné funkce offline
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-green-900 dark:text-green-100">
                      Prohlížení a úprava uložených materiálů
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-green-900 dark:text-green-100">
                      Vytváření nových materiálů (sync po připojení)
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-green-900 dark:text-green-100">
                      Organizace do složek
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    <span className="text-sm text-green-900 dark:text-green-100">
                      Export do PDF/DOCX
                    </span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-950 rounded-lg">
                    <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    <span className="text-sm text-orange-900 dark:text-orange-100">
                      AI generování (vyžaduje připojení)
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                  Správa dat
                </h3>
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={handleExportData}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportovat data
                  </Button>

                  <div>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportData}
                      className="hidden"
                      id="import-offline-data"
                    />
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => document.getElementById('import-offline-data')?.click()}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Importovat data
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearData}
                    className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Vymazat offline data
                  </Button>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Tipy pro offline práci
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Materiály se automaticky synchronizují po obnovení připojení</li>
                  <li>• Změny provedené offline jsou bezpečně uloženy</li>
                  <li>• Pro AI generování je potřeba připojení k internetu</li>
                  <li>• Exportujte si důležitá data jako zálohu</li>
                </ul>
              </div>
            </div>

            <div className="border-t border-neutral-200 dark:border-neutral-700 p-6 flex justify-end">
              <Button onClick={() => setShowDetails(false)}>
                Zavřít
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
};

export default OfflineIndicator;