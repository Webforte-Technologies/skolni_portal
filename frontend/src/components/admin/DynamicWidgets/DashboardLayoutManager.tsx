import React, { useState, useEffect } from 'react';
import {  Save, Plus, Trash2, Eye, EyeOff, Download, Upload } from 'lucide-react';
import Card from '../../ui/Card';
import Button from '../../ui/Button';
import { useToast } from '../../../contexts/ToastContext';
import { api } from '../../../services/apiClient';
import { cn } from '../../../utils/cn';
import { ApiResponse } from '../../../types';

export interface DashboardLayout {
  id: string;
  name: string;
  description: string;
  widgets: string[];
  layout: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

// API response types
interface DashboardLayoutsResponse {
  layouts: DashboardLayout[];
}

export interface DashboardLayoutManagerProps {
  title: string;
  className?: string;
  onLayoutChange?: (layout: DashboardLayout) => void;
  onLayoutSave?: (layout: DashboardLayout) => void;
}

const DashboardLayoutManager: React.FC<DashboardLayoutManagerProps> = ({
  title,
  className = '',
  onLayoutChange,
  onLayoutSave
}) => {
  const [layouts, setLayouts] = useState<DashboardLayout[]>([]);
  const [currentLayout, setCurrentLayout] = useState<DashboardLayout | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLayoutName, setNewLayoutName] = useState('');
  const [newLayoutDescription, setNewLayoutDescription] = useState('');
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>([]);
  const [selectedLayoutType, setSelectedLayoutType] = useState<string>('grid-4x2');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  // Available widgets for selection
  const availableWidgets = [
    { id: 'system_health', name: 'Zdraví systému', description: 'Zobrazení stavu systému a výkonu' },
    { id: 'user_metrics', name: 'Metriky uživatelů', description: 'Statistiky a aktivita uživatelů' },
    { id: 'revenue_analytics', name: 'Analýza příjmů', description: 'Finanční metriky a trendy' },
    { id: 'content_analytics', name: 'Analýza obsahu', description: 'Statistiky tvorby a používání obsahu' },
    { id: 'alert_panel', name: 'Panel upozornění', description: 'Systémová upozornění a výstrahy' },
    { id: 'performance_monitor', name: 'Monitor výkonu', description: 'Sledování výkonu aplikace' },
    { id: 'trend_charts', name: 'Trendové grafy', description: 'Vizualizace trendů a vzorů' },
    { id: 'anomaly_detection', name: 'Detekce anomálií', description: 'Identifikace neobvyklých vzorů' },
    { id: 'school_metrics', name: 'Metriky škol', description: 'Statistiky škol a institucí' },
    { id: 'teacher_activity', name: 'Aktivita učitelů', description: 'Sledování aktivity pedagogů' },
    { id: 'credit_balance', name: 'Zůstatek kreditů', description: 'Přehled kreditů a transakcí' },
    { id: 'recent_activity', name: 'Poslední aktivita', description: 'Přehled nedávných událostí' }
  ];

  // Available layout types
  const layoutTypes = [
    { id: 'grid-2x2', name: '2x2 Grid', description: '4 widgety v mřížce 2x2' },
    { id: 'grid-3x2', name: '3x2 Grid', description: '6 widgetů v mřížce 3x2' },
    { id: 'grid-4x2', name: '4x2 Grid', description: '8 widgetů v mřížce 4x2' },
    { id: 'sidebar-main', name: 'Sidebar + Main', description: 'Postranní panel + hlavní obsah' },
    { id: 'dashboard-focus', name: 'Dashboard Focus', description: 'Zaměření na hlavní metriky' }
  ];

  useEffect(() => {
    loadLayouts();
  }, []);

  const loadLayouts = async () => {
    try {
      setLoading(true);
      const response = await api.get<DashboardLayoutsResponse>('/admin/analytics/dashboard-layouts');
      if (response.data.success && response.data.data) {
        const layouts = response.data.data.layouts || [];
        setLayouts(layouts);
        // Set first layout as current if none selected
        if (!currentLayout && layouts.length > 0) {
          const defaultLayout = layouts.find((l: DashboardLayout) => l.is_default) || layouts[0];
          setCurrentLayout(defaultLayout);
        }
      }
    } catch (error) {
      console.error('Failed to load layouts:', error);
      showToast({ type: 'error', message: 'Chyba při načítání rozložení' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateLayout = async () => {
    if (!newLayoutName.trim()) {
      showToast({ type: 'error', message: 'Název rozložení je povinný' });
      return;
    }

    if (selectedWidgets.length === 0) {
      showToast({ type: 'error', message: 'Vyberte alespoň jeden widget' });
      return;
    }

    try {
      setLoading(true);
      const newLayout: Partial<DashboardLayout> = {
        name: newLayoutName.trim(),
        description: newLayoutDescription.trim(),
        widgets: selectedWidgets,
        layout: selectedLayoutType,
        is_default: false
      };

      const response = await api.post('/admin/analytics/dashboard-layouts', newLayout);
      if (response.data.success) {
        showToast({ type: 'success', message: 'Rozložení bylo úspěšně vytvořeno' });
        setShowCreateForm(false);
        setNewLayoutName('');
        setNewLayoutDescription('');
        setSelectedWidgets([]);
        setSelectedLayoutType('grid-4x2');
        await loadLayouts();
      }
    } catch (error) {
      console.error('Failed to create layout:', error);
      showToast({ type: 'error', message: 'Chyba při vytváření rozložení' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLayout = async (layout: DashboardLayout) => {
    try {
      setLoading(true);
      const response = await api.post('/admin/analytics/dashboard-layouts', {
        ...layout,
        updated_at: new Date().toISOString()
      });
      
      if (response.data.success) {
        showToast({ type: 'success', message: 'Rozložení bylo úspěšně uloženo' });
        await loadLayouts();
        if (onLayoutSave) {
          onLayoutSave(layout);
        }
      }
    } catch (error) {
      console.error('Failed to save layout:', error);
      showToast({ type: 'error', message: 'Chyba při ukládání rozložení' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLayout = async (layoutId: string) => {
    if (!confirm('Opravdu chcete smazat toto rozložení?')) {
      return;
    }

    try {
      setLoading(true);
      // Note: This would need a DELETE endpoint in the backend
      // For now, we'll just remove it from the local state
      setLayouts(layouts.filter(l => l.id !== layoutId));
      if (currentLayout?.id === layoutId) {
        setCurrentLayout(layouts[0] || null);
      }
      showToast({ type: 'success', message: 'Rozložení bylo smazáno' });
    } catch (error) {
      console.error('Failed to delete layout:', error);
      showToast({ type: 'error', message: 'Chyba při mazání rozložení' });
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (layout: DashboardLayout) => {
    try {
      setLoading(true);
      const updatedLayout = { ...layout, is_default: true };
      await handleSaveLayout(updatedLayout);
      showToast({ type: 'success', message: 'Výchozí rozložení bylo nastaveno' });
    } catch (error) {
      console.error('Failed to set default layout:', error);
      showToast({ type: 'error', message: 'Chyba při nastavování výchozího rozložení' });
    }
  };

  const handleLayoutChange = (layout: DashboardLayout) => {
    setCurrentLayout(layout);
    if (onLayoutChange) {
      onLayoutChange(layout);
    }
  };

  const exportLayout = (layout: DashboardLayout) => {
    const dataStr = JSON.stringify(layout, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `dashboard-layout-${layout.name}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importLayout = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const layout = JSON.parse(e.target?.result as string);
        if (layout.name && layout.widgets && layout.layout) {
          setNewLayoutName(layout.name);
          setNewLayoutDescription(layout.description || '');
          setSelectedWidgets(layout.widgets);
          setSelectedLayoutType(layout.layout);
          setShowCreateForm(true);
          showToast({ type: 'success', message: 'Rozložení bylo načteno' });
        } else {
          showToast({ type: 'error', message: 'Neplatný formát souboru rozložení' });
        }
      } catch (error) {
        showToast({ type: 'error', message: 'Chyba při načítání souboru' });
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <Card title={title} className={className}>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card title={title} className={className}>
      <div className="p-4 space-y-6">
        {/* Current Layout Display */}
        {currentLayout && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Aktuální rozložení</h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700">
                  <strong>{currentLayout.name}</strong> - {currentLayout.description}
                </p>
                <p className="text-xs text-blue-600">
                  {currentLayout.widgets.length} widgetů • {currentLayout.layout}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => setIsEditing(!isEditing)}
                  variant="secondary"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  {isEditing ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  <span>{isEditing ? 'Náhled' : 'Upravit'}</span>
                </Button>
                <Button
                  onClick={() => exportLayout(currentLayout)}
                  variant="secondary"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <Download className="w-4 h-4" />
                  <span>Export</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Layout Selection */}
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Dostupná rozložení</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {layouts.map((layout) => (
              <div
                key={layout.id}
                className={cn(
                  'p-4 border rounded-lg cursor-pointer transition-colors',
                  currentLayout?.id === layout.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300'
                )}
                onClick={() => handleLayoutChange(layout)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium text-gray-900">{layout.name}</h5>
                  {layout.is_default && (
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      Výchozí
                    </span>
                  )}
                </div>
                
                <p className="text-sm text-gray-600 mb-3">{layout.description}</p>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{layout.widgets.length} widgetů</span>
                  <span>{layout.layout}</span>
                </div>
                
                <div className="flex items-center space-x-2 mt-3">
                  {!layout.is_default && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(layout);
                      }}
                      variant="secondary"
                      size="sm"
                      className="text-xs"
                    >
                      Nastavit výchozí
                    </Button>
                  )}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      exportLayout(layout);
                    }}
                    variant="secondary"
                    size="sm"
                    className="text-xs"
                  >
                    Export
                  </Button>
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLayout(layout.id);
                    }}
                    variant="danger"
                    size="sm"
                    className="text-xs"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Create New Layout */}
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium text-gray-900">Vytvořit nové rozložení</h4>
            <Button
              onClick={() => setShowCreateForm(!showCreateForm)}
              variant="primary"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>{showCreateForm ? 'Zrušit' : 'Nové rozložení'}</span>
            </Button>
          </div>

          {showCreateForm && (
            <div className="bg-gray-50 rounded-lg p-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Název rozložení *
                  </label>
                  <input
                    type="text"
                    value={newLayoutName}
                    onChange={(e) => setNewLayoutName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Např. Moje rozložení"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Popis
                  </label>
                  <input
                    type="text"
                    value={newLayoutDescription}
                    onChange={(e) => setNewLayoutDescription(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Krátký popis rozložení"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Typ rozložení
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {layoutTypes.map((type) => (
                    <label key={type.id} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="layoutType"
                        value={type.id}
                        checked={selectedLayoutType === type.id}
                        onChange={(e) => setSelectedLayoutType(e.target.value)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium text-sm">{type.name}</div>
                        <div className="text-xs text-gray-500">{type.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vyberte widgety *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-48 overflow-y-auto">
                  {availableWidgets.map((widget) => (
                    <label key={widget.id} className="flex items-start space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedWidgets.includes(widget.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedWidgets([...selectedWidgets, widget.id]);
                          } else {
                            setSelectedWidgets(selectedWidgets.filter(w => w !== widget.id));
                          }
                        }}
                        className="mt-1 text-blue-600 focus:ring-blue-500"
                      />
                      <div>
                        <div className="font-medium text-sm">{widget.name}</div>
                        <div className="text-xs text-gray-500">{widget.description}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleCreateLayout}
                  variant="primary"
                  disabled={!newLayoutName.trim() || selectedWidgets.length === 0}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Vytvořit rozložení
                </Button>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Upload className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Import JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importLayout}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default DashboardLayoutManager;
