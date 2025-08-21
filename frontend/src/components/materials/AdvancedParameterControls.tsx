import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Settings, Save, RotateCcw, AlertTriangle } from 'lucide-react';
import { MaterialSubtype, QualityLevel, TemplateField } from '../../types/MaterialTypes';
import Button from '../ui/Button';

interface AdvancedParameterControlsProps {
  subtype?: MaterialSubtype;
  parameters: Record<string, any>;
  onParameterChange: (name: string, value: any) => void;
  onPresetSave?: (name: string, parameters: Record<string, any>) => void;
  onPresetLoad?: (parameters: Record<string, any>) => void;
  savedPresets?: Array<{ name: string; parameters: Record<string, any> }>;
  className?: string;
}

const QUALITY_LEVELS: QualityLevel[] = [
  {
    id: 'basic',
    name: 'Základní',
    description: 'Rychlé generování s základní kvalitou',
    parameters: { temperature: 0.7, maxTokens: 1000 }
  },
  {
    id: 'standard',
    name: 'Standardní',
    description: 'Vyvážená kvalita a rychlost',
    parameters: { temperature: 0.5, maxTokens: 2000 }
  },
  {
    id: 'high',
    name: 'Vysoká',
    description: 'Nejvyšší kvalita, pomalejší generování',
    parameters: { temperature: 0.3, maxTokens: 3000 }
  }
];

const AdvancedParameterControls: React.FC<AdvancedParameterControlsProps> = ({
  subtype,
  parameters,
  onParameterChange,
  onPresetSave,
  onPresetLoad,
  savedPresets = [],
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedQualityLevel, setSelectedQualityLevel] = useState<string>('standard');
  const [customInstructions, setCustomInstructions] = useState(parameters.customInstructions || '');
  const [presetName, setPresetName] = useState('');
  const [showPresetSave, setShowPresetSave] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateField = (field: TemplateField, value: any): string | null => {
    if (field.required && (!value || (typeof value === 'string' && !value.trim()))) {
      return `${field.label} je povinné pole`;
    }

    if (field.type === 'number' && field.validation) {
      const numValue = Number(value);
      if (field.validation.min !== undefined && numValue < field.validation.min) {
        return `${field.label} musí být alespoň ${field.validation.min}`;
      }
      if (field.validation.max !== undefined && numValue > field.validation.max) {
        return `${field.label} nesmí být více než ${field.validation.max}`;
      }
    }

    if (field.type === 'text' && field.validation?.pattern) {
      const regex = new RegExp(field.validation.pattern);
      if (!regex.test(value)) {
        return `${field.label} má neplatný formát`;
      }
    }

    return null;
  };

  const handleFieldChange = (field: TemplateField, value: any) => {
    const error = validateField(field, value);
    setValidationErrors(prev => ({
      ...prev,
      [field.name]: error || ''
    }));
    onParameterChange(field.name, value);
  };

  const handleQualityLevelChange = (levelId: string) => {
    setSelectedQualityLevel(levelId);
    const level = QUALITY_LEVELS.find(l => l.id === levelId);
    if (level) {
      Object.entries(level.parameters).forEach(([key, value]) => {
        onParameterChange(key, value);
      });
    }
  };

  const handleCustomInstructionsChange = (value: string) => {
    setCustomInstructions(value);
    onParameterChange('customInstructions', value);
  };

  const handlePresetSave = () => {
    if (presetName.trim() && onPresetSave) {
      onPresetSave(presetName.trim(), { ...parameters, customInstructions });
      setPresetName('');
      setShowPresetSave(false);
    }
  };

  const handlePresetLoad = (preset: { name: string; parameters: Record<string, any> }) => {
    if (onPresetLoad) {
      onPresetLoad(preset.parameters);
      setCustomInstructions(preset.parameters.customInstructions || '');
    }
  };

  const resetToDefaults = () => {
    setSelectedQualityLevel('standard');
    setCustomInstructions('');
    setValidationErrors({});
    onParameterChange('qualityLevel', 'standard');
    onParameterChange('customInstructions', '');
    
    // Reset subtype-specific fields to defaults
    if (subtype) {
      subtype.specialFields.forEach(field => {
        let defaultValue;
        switch (field.type) {
          case 'boolean':
            defaultValue = false;
            break;
          case 'multiselect':
            defaultValue = [];
            break;
          case 'number':
            defaultValue = field.validation?.min || 0;
            break;
          default:
            defaultValue = '';
        }
        onParameterChange(field.name, defaultValue);
      });
    }
  };

  const renderField = (field: TemplateField) => {
    const value = parameters[field.name] || '';
    const error = validationErrors[field.name];

    switch (field.type) {
      case 'text':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="text"
              value={value}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              placeholder={field.placeholder}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:text-neutral-100 ${
                error ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'
              }`}
            />
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>
        );

      case 'textarea':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              placeholder={field.placeholder}
              rows={3}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:text-neutral-100 resize-none ${
                error ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'
              }`}
            />
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>
        );

      case 'number':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(field, parseInt(e.target.value))}
              placeholder={field.placeholder}
              min={field.validation?.min}
              max={field.validation?.max}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:text-neutral-100 ${
                error ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'
              }`}
            />
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>
        );

      case 'select':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleFieldChange(field, e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:text-neutral-100 ${
                error ? 'border-red-500' : 'border-neutral-300 dark:border-neutral-600'
              }`}
            >
              <option value="">Vyberte {field.label}</option>
              {field.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>
        );

      case 'multiselect':
        return (
          <div key={field.name} className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {field.options?.map(option => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={Array.isArray(value) && value.includes(option)}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        handleFieldChange(field, [...currentValues, option]);
                      } else {
                        handleFieldChange(field, currentValues.filter(v => v !== option));
                      }
                    }}
                    className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">{option}</span>
                </label>
              ))}
            </div>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>
        );

      case 'boolean':
        return (
          <div key={field.name} className="space-y-2">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={Boolean(value)}
                onChange={(e) => handleFieldChange(field, e.target.checked)}
                className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </label>
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`border border-neutral-200 dark:border-neutral-700 rounded-lg ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-neutral-50 dark:hover:bg-neutral-800 rounded-t-lg"
      >
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
          <span className="font-medium text-neutral-900 dark:text-neutral-100">
            Pokročilé nastavení
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-6 border-t border-neutral-200 dark:border-neutral-700">
          {/* Quality Level Selection */}
          <div className="space-y-3">
            <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
              Úroveň kvality
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {QUALITY_LEVELS.map((level) => (
                <label
                  key={level.id}
                  className={`p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedQualityLevel === level.id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                  }`}
                >
                  <input
                    type="radio"
                    name="qualityLevel"
                    value={level.id}
                    checked={selectedQualityLevel === level.id}
                    onChange={() => handleQualityLevelChange(level.id)}
                    className="sr-only"
                  />
                  <div className="text-sm">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      {level.name}
                    </div>
                    <div className="text-neutral-600 dark:text-neutral-400 mt-1">
                      {level.description}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Subtype-specific Fields */}
          {subtype && subtype.specialFields.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                Specifické možnosti pro {subtype.name}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {subtype.specialFields.map(renderField)}
              </div>
            </div>
          )}

          {/* Custom Instructions */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              Vlastní instrukce
            </label>
            <textarea
              value={customInstructions}
              onChange={(e) => handleCustomInstructionsChange(e.target.value)}
              placeholder="Přidejte specifické požadavky nebo pokyny pro AI..."
              rows={3}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:text-neutral-100 resize-none"
            />
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              Například: "Zahrň více praktických příkladů" nebo "Použij jednodušší jazyk"
            </p>
          </div>

          {/* Preset Management */}
          <div className="space-y-3">
            <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
              Předvolby
            </h4>
            
            {/* Save Preset */}
            <div className="flex gap-2">
              {!showPresetSave ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPresetSave(true)}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Uložit předvolbu
                </Button>
              ) : (
                <div className="flex gap-2 flex-1">
                  <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="Název předvolby..."
                    className="flex-1 px-3 py-2 text-sm border border-neutral-300 dark:border-neutral-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:text-neutral-100"
                  />
                  <Button size="sm" onClick={handlePresetSave} disabled={!presetName.trim()}>
                    Uložit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowPresetSave(false);
                      setPresetName('');
                    }}
                  >
                    Zrušit
                  </Button>
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefaults}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Výchozí
              </Button>
            </div>

            {/* Load Presets */}
            {savedPresets.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Uložené předvolby:
                </p>
                <div className="flex flex-wrap gap-2">
                  {savedPresets.map((preset, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handlePresetLoad(preset)}
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedParameterControls;