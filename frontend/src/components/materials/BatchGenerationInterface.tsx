import React, { useState } from 'react';
import { 
  Plus, Trash2, Play, Pause, CheckCircle, Clock, 
  AlertCircle, Download, Settings, Eye
} from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { MaterialType, MaterialSubtype } from '../../types/MaterialTypes';

interface BatchMaterial {
  id: string;
  title: string;
  materialType: MaterialType;
  subtype?: MaterialSubtype;
  parameters: Record<string, any>;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  progress: number;
  result?: any;
  error?: string;
}

interface BatchGenerationInterfaceProps {
  onStartBatch: (materials: BatchMaterial[]) => void;
  onCancelBatch: () => void;
  className?: string;
}

const MATERIAL_TYPE_TEMPLATES = [
  {
    type: 'worksheet' as MaterialType,
    name: 'Pracovní list',
    description: 'Cvičení a úlohy pro studenty',
    defaultParams: {
      questionCount: 10,
      difficulty: 'medium',
      estimatedTime: '15-30 min'
    }
  },
  {
    type: 'quiz' as MaterialType,
    name: 'Kvíz',
    description: 'Test pro ověření znalostí',
    defaultParams: {
      questionCount: 15,
      timeLimit: '20 min',
      questionTypes: ['multiple_choice', 'true_false']
    }
  },
  {
    type: 'lesson-plan' as MaterialType,
    name: 'Plán hodiny',
    description: 'Kompletní plán vyučovací hodiny',
    defaultParams: {
      duration: '45 min',
      difficulty: 'medium'
    }
  },
  {
    type: 'project' as MaterialType,
    name: 'Projekt',
    description: 'Dlouhodobé projektové zadání',
    defaultParams: {
      duration: '1 týden',
      difficulty: 'medium'
    }
  }
];

const BatchGenerationInterface: React.FC<BatchGenerationInterfaceProps> = ({
  onStartBatch,
  onCancelBatch,
  className = ''
}) => {
  const [materials, setMaterials] = useState<BatchMaterial[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<MaterialType>('worksheet');
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);

  const addMaterial = () => {
    const template = MATERIAL_TYPE_TEMPLATES.find(t => t.type === selectedTemplate);
    if (!template) return;

    const newMaterial: BatchMaterial = {
      id: Date.now().toString(),
      title: `${template.name} ${materials.length + 1}`,
      materialType: template.type,
      parameters: { ...template.defaultParams },
      status: 'pending',
      progress: 0
    };

    setMaterials(prev => [...prev, newMaterial]);
  };

  const removeMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  };



  const startBatchGeneration = () => {
    if (materials.length === 0) return;
    
    setIsGenerating(true);
    setBatchProgress(0);
    
    // Simulate batch generation progress
    const interval = setInterval(() => {
      setBatchProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsGenerating(false);
          return 100;
        }
        return prev + 10;
      });
    }, 1000);

    onStartBatch(materials);
  };

  const cancelBatchGeneration = () => {
    setIsGenerating(false);
    setBatchProgress(0);
    onCancelBatch();
  };

  const getStatusIcon = (status: BatchMaterial['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-gray-400" />;
      case 'generating':
        return <Play className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: BatchMaterial['status']) => {
    switch (status) {
      case 'pending':
        return 'Čeká';
      case 'generating':
        return 'Generuje se';
      case 'completed':
        return 'Dokončeno';
      case 'failed':
        return 'Chyba';
      default:
        return 'Neznámý stav';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Dávkové generování materiálů
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Vytvořte více materiálů najednou s podobnými parametry
        </p>
      </div>

      {/* Material Templates */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Šablony materiálů
          </h3>
          <Button
            variant="outline"
            onClick={() => setShowAdvancedOptions(!showAdvancedOptions)}
          >
            <Settings className="w-4 h-4 mr-2" />
            Pokročilé možnosti
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {MATERIAL_TYPE_TEMPLATES.map((template) => (
            <div
              key={template.type}
              className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                selectedTemplate === template.type
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
              onClick={() => setSelectedTemplate(template.type)}
            >
              <h4 className="font-medium text-sm mb-1">{template.name}</h4>
              <p className="text-xs opacity-80">{template.description}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button
            onClick={addMaterial}
            disabled={isGenerating}
            className="flex-1"
          >
            <Plus className="w-4 h-4 mr-2" />
            Přidat materiál
          </Button>
          
          <span className="text-sm text-gray-500 dark:text-gray-400">
            {materials.length} materiálů připraveno
          </span>
        </div>
      </Card>

      {/* Materials List */}
      {materials.length > 0 && (
        <Card>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Seznam materiálů
          </h3>
          
          <div className="space-y-3">
            {materials.map((material) => (
              <div
                key={material.id}
                className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(material.status)}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {material.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {MATERIAL_TYPE_TEMPLATES.find(t => t.type === material.materialType)?.name}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {material.status === 'generating' && (
                      <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${material.progress}%` }}
                        />
                      </div>
                    )}
                    
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {getStatusText(material.status)}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeMaterial(material.id)}
                      disabled={isGenerating}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Material Parameters */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {Object.entries(material.parameters).map(([key, value]) => (
                    <div key={key} className="bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded">
                      <span className="font-medium">{key}:</span>
                      <span className="ml-1">{String(value)}</span>
                    </div>
                  ))}
                </div>

                {/* Result Preview */}
                {material.status === 'completed' && material.result && (
                  <div className="mt-3 p-3 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700 dark:text-green-300">
                        Materiál úspěšně vygenerován
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Náhled
                      </Button>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {material.status === 'failed' && material.error && (
                  <div className="mt-3 p-3 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-300">
                      <AlertCircle className="w-4 h-4" />
                      Chyba: {material.error}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Batch Progress */}
      {isGenerating && (
        <Card>
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
              Průběh generování
            </h3>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Celkový postup
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {batchProgress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                <div 
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${batchProgress}%` }}
                />
              </div>
            </div>

            <div className="flex justify-center gap-3">
              <Button
                variant="outline"
                onClick={cancelBatchGeneration}
                className="text-red-600 hover:text-red-700"
              >
                <Pause className="w-4 h-4 mr-2" />
                Zastavit
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Action Buttons */}
      {materials.length > 0 && (
        <div className="flex items-center justify-center gap-4">
          <Button
            onClick={startBatchGeneration}
            disabled={isGenerating || materials.length === 0}
            isLoading={isGenerating}
            className="px-8 py-3"
          >
            <Play className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generuji...' : 'Spustit generování'}
          </Button>
          
          {!isGenerating && (
            <>
              <Button
                variant="outline"
                onClick={() => {
                  // Export batch configuration
                  const config = {
                    materials,
                    timestamp: new Date().toISOString(),
                    version: '1.0'
                  };
                  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'batch-config.json';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Exportovat konfiguraci
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setMaterials([])}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Vyčistit seznam
              </Button>
            </>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400">
        <p className="mb-2">
          💡 Tip: Vytvořte si šablonu materiálu a pak ji použijte pro generování více variant
        </p>
        <p>
          Všechny materiály budou generovány s podobnými parametry, ale s různým obsahem
        </p>
      </div>
    </div>
  );
};

export default BatchGenerationInterface;
