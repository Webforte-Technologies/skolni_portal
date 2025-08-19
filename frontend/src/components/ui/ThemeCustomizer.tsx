import React, { useState } from 'react';
import { 
  Palette, Monitor, Sun, Moon, Eye, Type, Zap, 
  Settings, Download, Upload, RotateCcw, Check,
  Contrast, Volume2, VolumeX, Accessibility
} from 'lucide-react';
import { useEnhancedTheme } from '../../contexts/EnhancedThemeContext';
import { useToast } from '../../contexts/ToastContext';
import Button from './Button';
import Card from './Card';

interface ThemeCustomizerProps {
  isOpen: boolean;
  onClose: () => void;
}

const ThemeCustomizer: React.FC<ThemeCustomizerProps> = ({ isOpen, onClose }) => {
  const { preferences, actualTheme, updatePreferences, resetToDefaults, exportPreferences, importPreferences } = useEnhancedTheme();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'appearance' | 'accessibility' | 'advanced'>('appearance');

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      const data = exportPreferences();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'eduai-theme-preferences.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast({ type: 'success', message: 'Nastavení tématu bylo exportováno' });
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při exportu nastavení' });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (importPreferences(content)) {
        showToast({ type: 'success', message: 'Nastavení tématu bylo importováno' });
      } else {
        showToast({ type: 'error', message: 'Neplatný formát souboru' });
      }
    };
    reader.readAsText(file);
  };

  const themeOptions = [
    { value: 'light' as const, label: 'Světlý', icon: Sun },
    { value: 'dark' as const, label: 'Tmavý', icon: Moon },
    { value: 'system' as const, label: 'Systémový', icon: Monitor }
  ];

  const accentColors = [
    { value: 'blue' as const, label: 'Modrá', color: '#4A90E2' },
    { value: 'green' as const, label: 'Zelená', color: '#28A745' },
    { value: 'purple' as const, label: 'Fialová', color: '#6F42C1' },
    { value: 'orange' as const, label: 'Oranžová', color: '#FD7E14' },
    { value: 'red' as const, label: 'Červená', color: '#DC3545' }
  ];

  const colorSchemes = [
    { value: 'default' as const, label: 'Výchozí', description: 'Standardní barvy' },
    { value: 'high-contrast' as const, label: 'Vysoký kontrast', description: 'Vyšší kontrast pro lepší čitelnost' },
    { value: 'warm' as const, label: 'Teplé', description: 'Teplejší barevné tóny' },
    { value: 'cool' as const, label: 'Chladné', description: 'Chladnější barevné tóny' }
  ];

  const fontSizes = [
    { value: 'small' as const, label: 'Malé', description: '90% standardní velikosti' },
    { value: 'medium' as const, label: 'Střední', description: 'Standardní velikost' },
    { value: 'large' as const, label: 'Velké', description: '110% standardní velikosti' }
  ];

  const darkVariants = [
    { value: 'default' as const, label: 'Výchozí', description: 'Standardní tmavý režim' },
    { value: 'oled' as const, label: 'OLED', description: 'Čistě černé pozadí pro OLED displeje' },
    { value: 'soft' as const, label: 'Jemný', description: 'Měkčí tmavé tóny' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Přizpůsobení tématu
          </h2>
          <Button variant="ghost" onClick={onClose}>
            ×
          </Button>
        </div>

        <div className="flex">
          {/* Sidebar */}
          <div className="w-48 border-r border-neutral-200 dark:border-neutral-700">
            <div className="p-4 space-y-1">
              <button
                onClick={() => setActiveTab('appearance')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'appearance'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Palette className="w-4 h-4 inline mr-2" />
                Vzhled
              </button>
              
              <button
                onClick={() => setActiveTab('accessibility')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'accessibility'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Accessibility className="w-4 h-4 inline mr-2" />
                Přístupnost
              </button>
              
              <button
                onClick={() => setActiveTab('advanced')}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'advanced'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
              >
                <Settings className="w-4 h-4 inline mr-2" />
                Pokročilé
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                {/* Theme Mode */}
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-3">
                    Režim tématu
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {themeOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <button
                          key={option.value}
                          onClick={() => updatePreferences({ mode: option.value })}
                          className={`p-4 border-2 rounded-lg transition-all ${
                            preferences.mode === option.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                              : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                          }`}
                        >
                          <IconComponent className="w-6 h-6 mx-auto mb-2" />
                          <div className="text-sm font-medium">{option.label}</div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                    Aktuální téma: <strong>{actualTheme === 'dark' ? 'Tmavý' : 'Světlý'}</strong>
                  </p>
                </div>

                {/* Accent Color */}
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-3">
                    Hlavní barva
                  </h3>
                  <div className="grid grid-cols-5 gap-3">
                    {accentColors.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => updatePreferences({ accentColor: color.value })}
                        className={`p-3 border-2 rounded-lg transition-all ${
                          preferences.accentColor === color.value
                            ? 'border-current'
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                        }`}
                        style={{ color: color.color }}
                      >
                        <div
                          className="w-8 h-8 rounded-full mx-auto mb-1"
                          style={{ backgroundColor: color.color }}
                        />
                        <div className="text-xs font-medium text-neutral-900 dark:text-neutral-100">
                          {color.label}
                        </div>
                        {preferences.accentColor === color.value && (
                          <Check className="w-4 h-4 mx-auto mt-1" style={{ color: color.color }} />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color Scheme */}
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-3">
                    Barevné schéma
                  </h3>
                  <div className="space-y-2">
                    {colorSchemes.map((scheme) => (
                      <button
                        key={scheme.value}
                        onClick={() => updatePreferences({ colorScheme: scheme.value })}
                        className={`w-full p-3 text-left border rounded-lg transition-all ${
                          preferences.colorScheme === scheme.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-neutral-900 dark:text-neutral-100">
                              {scheme.label}
                            </div>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                              {scheme.description}
                            </div>
                          </div>
                          {preferences.colorScheme === scheme.value && (
                            <Check className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dark Variant (only show in dark mode) */}
                {actualTheme === 'dark' && (
                  <div>
                    <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-3">
                      Varianta tmavého režimu
                    </h3>
                    <div className="space-y-2">
                      {darkVariants.map((variant) => (
                        <button
                          key={variant.value}
                          onClick={() => updatePreferences({ darkVariant: variant.value })}
                          className={`w-full p-3 text-left border rounded-lg transition-all ${
                            preferences.darkVariant === variant.value
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                              : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium text-neutral-900 dark:text-neutral-100">
                                {variant.label}
                              </div>
                              <div className="text-sm text-neutral-500 dark:text-neutral-400">
                                {variant.description}
                              </div>
                            </div>
                            {preferences.darkVariant === variant.value && (
                              <Check className="w-5 h-5 text-blue-500" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'accessibility' && (
              <div className="space-y-6">
                {/* Font Size */}
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-3">
                    Velikost písma
                  </h3>
                  <div className="space-y-2">
                    {fontSizes.map((size) => (
                      <button
                        key={size.value}
                        onClick={() => updatePreferences({ fontSize: size.value })}
                        className={`w-full p-3 text-left border rounded-lg transition-all ${
                          preferences.fontSize === size.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-neutral-900 dark:text-neutral-100">
                              {size.label}
                            </div>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                              {size.description}
                            </div>
                          </div>
                          {preferences.fontSize === size.value && (
                            <Check className="w-5 h-5 text-blue-500" />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accessibility Options */}
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-3">
                    Možnosti přístupnosti
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Contrast className="w-5 h-5 text-neutral-500" />
                        <div>
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">
                            Vysoký kontrast
                          </div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            Zvýší kontrast pro lepší čitelnost
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => updatePreferences({ highContrast: !preferences.highContrast })}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          preferences.highContrast
                            ? 'bg-blue-500'
                            : 'bg-neutral-300 dark:bg-neutral-600'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            preferences.highContrast ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        {preferences.reducedMotion ? (
                          <VolumeX className="w-5 h-5 text-neutral-500" />
                        ) : (
                          <Volume2 className="w-5 h-5 text-neutral-500" />
                        )}
                        <div>
                          <div className="font-medium text-neutral-900 dark:text-neutral-100">
                            Omezit animace
                          </div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            Sníží nebo vypne animace a přechody
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => updatePreferences({ reducedMotion: !preferences.reducedMotion })}
                        className={`w-12 h-6 rounded-full transition-colors ${
                          preferences.reducedMotion
                            ? 'bg-blue-500'
                            : 'bg-neutral-300 dark:bg-neutral-600'
                        }`}
                      >
                        <div
                          className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            preferences.reducedMotion ? 'translate-x-6' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'advanced' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-3">
                    Správa nastavení
                  </h3>
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <Button variant="secondary" onClick={handleExport}>
                        <Download className="w-4 h-4 mr-2" />
                        Exportovat nastavení
                      </Button>
                      
                      <div>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleImport}
                          className="hidden"
                          id="import-settings"
                        />
                        <Button
                          variant="secondary"
                          onClick={() => document.getElementById('import-settings')?.click()}
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Importovat nastavení
                        </Button>
                      </div>
                      
                      <Button
                        variant="outline"
                        onClick={() => {
                          resetToDefaults();
                          showToast({ type: 'success', message: 'Nastavení bylo obnoveno na výchozí hodnoty' });
                        }}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Obnovit výchozí
                      </Button>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-3">
                    Náhled aktuálního nastavení
                  </h3>
                  <div className="bg-neutral-100 dark:bg-neutral-800 rounded-lg p-4">
                    <pre className="text-sm text-neutral-700 dark:text-neutral-300 overflow-auto">
                      {JSON.stringify(preferences, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-neutral-200 dark:border-neutral-700 p-6 flex justify-end">
          <Button onClick={onClose}>
            Zavřít
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default ThemeCustomizer;