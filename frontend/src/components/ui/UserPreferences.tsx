import React, { useState, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { 
  X, Settings, Palette, Bell, Globe, Monitor,
  Sun, Moon, Save, RotateCcw, Eye,
  Accessibility
} from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: 'cs' | 'en';
  notifications: {
    email: boolean;
    push: boolean;
    sound: boolean;
    chat: boolean;
    updates: boolean;
  };
  accessibility: {
    highContrast: boolean;
    screenReader: boolean;
    fontSize: 'small' | 'medium' | 'large';
    reducedMotion: boolean;
    focusIndicator: boolean;
  };
  display: {
    compactMode: boolean;
    sidebarCollapsed: boolean;
    showTooltips: boolean;
    showProgressBars: boolean;
  };
  privacy: {
    analytics: boolean;
    telemetry: boolean;
    shareUsage: boolean;
  };
}

interface UserPreferencesProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserPreferences: React.FC<UserPreferencesProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: settings.theme,
    language: 'cs',
    notifications: { email: true, push: true, sound: true, chat: true, updates: true },
    accessibility: {
      highContrast: settings.highContrast,
      screenReader: false,
      fontSize: settings.fontSize === 'sm' ? 'small' : settings.fontSize === 'lg' ? 'large' : 'medium',
      reducedMotion: settings.reducedMotion,
      focusIndicator: settings.focusIndicator,
    },
    display: { compactMode: false, sidebarCollapsed: false, showTooltips: true, showProgressBars: true },
    privacy: { analytics: true, telemetry: false, shareUsage: false },
  });
  const [activeTab, setActiveTab] = useState<'general' | 'accessibility' | 'notifications' | 'privacy' | 'display'>('general');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setPreferences(prev => ({
      ...prev,
      theme: settings.theme,
      accessibility: {
        ...prev.accessibility,
        highContrast: settings.highContrast,
        fontSize: settings.fontSize === 'sm' ? 'small' : settings.fontSize === 'lg' ? 'large' : 'medium',
        reducedMotion: settings.reducedMotion,
        focusIndicator: settings.focusIndicator,
      },
    }));
    setHasChanges(false);
  }, [settings]);

  const updatePreference = <K extends keyof UserPreferences>(
    section: K,
    key: keyof UserPreferences[K],
    value: any
  ) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [key]: value
      }
    }));
    setHasChanges(true);
  };

  const updateSimplePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    updateSettings({
      theme: preferences.theme as any,
      highContrast: preferences.accessibility.highContrast,
      reducedMotion: preferences.accessibility.reducedMotion,
      focusIndicator: preferences.accessibility.focusIndicator,
      fontSize: preferences.accessibility.fontSize === 'small' ? 'sm' : preferences.accessibility.fontSize === 'large' ? 'lg' : 'md',
    });
    setHasChanges(false);
    onClose();
  };

  const handleReset = () => {
    resetSettings();
    setHasChanges(false);
  };

  const tabs = [
    { id: 'general', name: 'Obecné', icon: <Settings className="h-4 w-4" /> },
    { id: 'accessibility', name: 'Přístupnost', icon: <Accessibility className="h-4 w-4" /> },
    { id: 'notifications', name: 'Oznámení', icon: <Bell className="h-4 w-4" /> },
    { id: 'display', name: 'Zobrazení', icon: <Monitor className="h-4 w-4" /> },
    { id: 'privacy', name: 'Soukromí', icon: <Eye className="h-4 w-4" /> }
  ];

  const languages = [
    { code: 'cs', name: 'Čeština', flag: '🇨🇿' },
    { code: 'en', name: 'English', flag: '🇺🇸' }
  ];

  const fontSizes = [
    { value: 'small', name: 'Malé', size: 'text-sm' },
    { value: 'medium', name: 'Střední', size: 'text-base' },
    { value: 'large', name: 'Velké', size: 'text-lg' }
  ];

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Nastavení uživatele">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Settings className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold">Nastavení uživatele</h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.icon}
              {tab.name}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div className="space-y-6">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              {/* Theme */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Palette className="h-5 w-5 text-blue-600" />
                  Téma
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', name: 'Světlé', icon: <Sun className="h-5 w-5" /> },
                    { value: 'dark', name: 'Tmavé', icon: <Moon className="h-5 w-5" /> },
                    { value: 'auto', name: 'Automatické', icon: <Monitor className="h-5 w-5" /> }
                  ].map(theme => (
                    <button
                      key={theme.value}
                      onClick={() => updateSimplePreference('theme', theme.value as any)}
                      className={`p-4 border rounded-lg text-center transition-all ${
                        preferences.theme === theme.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        {theme.icon}
                        <span className="font-medium">{theme.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Language */}
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Globe className="h-5 w-5 text-blue-600" />
                  Jazyk
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => updateSimplePreference('language', lang.code as any)}
                      className={`p-4 border rounded-lg text-center transition-all ${
                        preferences.language === lang.code
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{lang.flag}</span>
                        <span className="font-medium">{lang.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Accessibility Tab */}
          {activeTab === 'accessibility' && (
            <div className="space-y-6">
              {/* High Contrast */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Vysoký kontrast</h4>
                    <p className="text-sm text-gray-600">Zvýraznit prvky pro lepší čitelnost</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.accessibility.highContrast}
                    onChange={(e) => updatePreference('accessibility', 'highContrast', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Screen Reader */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Accessibility className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Čtečka obrazovky</h4>
                    <p className="text-sm text-gray-600">Podpora pro asistivní technologie</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.accessibility.screenReader}
                    onChange={(e) => updatePreference('accessibility', 'screenReader', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Font Size */}
              <div>
                <h4 className="font-medium mb-3">Velikost písma</h4>
                <div className="grid grid-cols-3 gap-3">
                  {fontSizes.map(size => (
                    <button
                      key={size.value}
                      onClick={() => updatePreference('accessibility', 'fontSize', size.value)}
                      className={`p-3 border rounded-lg text-center transition-all ${
                        preferences.accessibility.fontSize === size.value
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={`${size.size} font-medium`}>{size.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reduced Motion */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Monitor className="h-5 w-5 text-blue-600" />
                  <div>
                    <h4 className="font-medium">Snížený pohyb</h4>
                    <p className="text-sm text-gray-600">Omezit animace a přechody</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.accessibility.reducedMotion}
                    onChange={(e) => updatePreference('accessibility', 'reducedMotion', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-4">
              {Object.entries(preferences.notifications).map(([key, value]) => {
                const labels = {
                  email: { name: 'E-mailová oznámení', description: 'Dostávat oznámení na e-mail' },
                  push: { name: 'Push oznámení', description: 'Oznámení v prohlížeči' },
                  sound: { name: 'Zvuková oznámení', description: 'Přehrávat zvuk při oznámení' },
                  chat: { name: 'Chat oznámení', description: 'Oznámení o nových zprávách' },
                  updates: { name: 'Aktualizace', description: 'Oznámení o nových funkcích' }
                };

                return (
                  <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Bell className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{labels[key as keyof typeof labels].name}</h4>
                        <p className="text-sm text-gray-600">{labels[key as keyof typeof labels].description}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updatePreference('notifications', key as keyof UserPreferences['notifications'], e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                );
              })}
            </div>
          )}

          {/* Display Tab */}
          {activeTab === 'display' && (
            <div className="space-y-4">
              {Object.entries(preferences.display).map(([key, value]) => {
                const labels = {
                  compactMode: { name: 'Kompaktní režim', description: 'Zmenšit mezery mezi prvky' },
                  sidebarCollapsed: { name: 'Sbalený postranní panel', description: 'Skrýt postranní panel ve výchozím nastavení' },
                  showTooltips: { name: 'Zobrazovat tooltips', description: 'Zobrazovat nápovědu při najetí myší' },
                  showProgressBars: { name: 'Zobrazovat progress bary', description: 'Zobrazovat průběh operací' }
                };

                return (
                  <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Monitor className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{labels[key as keyof typeof labels].name}</h4>
                        <p className="text-sm text-gray-600">{labels[key as keyof typeof labels].description}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updatePreference('display', key as keyof UserPreferences['display'], e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                );
              })}
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              {Object.entries(preferences.privacy).map(([key, value]) => {
                const labels = {
                  analytics: { name: 'Analytika', description: 'Povolit sběr anonymních dat o používání' },
                  telemetry: { name: 'Telemetrie', description: 'Odesílat data o výkonu a chybách' },
                  shareUsage: { name: 'Sdílet používání', description: 'Sdílet anonymní data o používání funkcí' }
                };

                return (
                  <div key={key} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Eye className="h-5 w-5 text-blue-600" />
                      <div>
                        <h4 className="font-medium">{labels[key as keyof typeof labels].name}</h4>
                        <p className="text-sm text-gray-600">{labels[key as keyof typeof labels].description}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => updatePreference('privacy', key as keyof UserPreferences['privacy'], e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {hasChanges && (
              <span className="text-orange-600 font-medium">Máte neuložené změny</span>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleReset}
              variant="outline"
              disabled={!hasChanges}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Obnovit
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              Uložit
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UserPreferences;
