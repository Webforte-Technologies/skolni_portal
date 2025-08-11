import React, { useState, useEffect } from 'react';
import { 
  X, HelpCircle, BookOpen, Play, SkipForward, SkipBack,
  ChevronRight, Lightbulb, CheckCircle,
  ArrowRight, MessageSquare, FileText, Zap, Heart, Search
} from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

export interface HelpTutorial {
  id: string;
  title: string;
  description: string;
  category: 'getting-started' | 'chat' | 'materials' | 'advanced' | 'accessibility';
  steps: HelpStep[];
  estimatedTime: number; // in minutes
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface HelpStep {
  id: string;
  title: string;
  description: string;
  action?: string;
  target?: string; // CSS selector or element to highlight
  image?: string;
  video?: string;
}

interface HelpSystemProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpSystem: React.FC<HelpSystemProps> = ({ isOpen, onClose }) => {
  const [activeTutorial, setActiveTutorial] = useState<HelpTutorial | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [completedTutorials, setCompletedTutorials] = useState<string[]>([]);

  const tutorials: HelpTutorial[] = [
    {
      id: 'welcome',
      title: 'Vítejte v Školním Portálu',
      description: 'První kroky s naší AI matematickou asistentkou',
      category: 'getting-started',
      estimatedTime: 3,
      difficulty: 'beginner',
      steps: [
        {
          id: 'welcome-1',
          title: 'Přihlášení',
          description: 'Přihlaste se pomocí svého školního účtu nebo se zaregistrujte',
          action: 'Přejít na přihlášení'
        },
        {
          id: 'welcome-2',
          title: 'Dashboard',
          description: 'Seznamte se s hlavním rozhraním a dostupnými funkcemi',
          action: 'Prozkoumat dashboard'
        },
        {
          id: 'welcome-3',
          title: 'První chat',
          description: 'Začněte svou první konverzaci s AI asistentkou',
          action: 'Spustit chat'
        }
      ]
    },
    {
      id: 'chat-basics',
      title: 'Základy chatu',
      description: 'Jak efektivně komunikovat s AI asistentkou',
      category: 'chat',
      estimatedTime: 5,
      difficulty: 'beginner',
      steps: [
        {
          id: 'chat-1',
          title: 'Psaní zpráv',
          description: 'Napište svou otázku nebo matematický problém do vstupního pole',
          action: 'Zkusit napsat zprávu'
        },
        {
          id: 'chat-2',
          title: 'Odeslání',
          description: 'Stiskněte Enter nebo klikněte na tlačítko odeslat',
          action: 'Odeslat zprávu'
        },
        {
          id: 'chat-3',
          title: 'Odpověď',
          description: 'AI asistentka vám poskytne podrobné vysvětlení s kroky řešení',
          action: 'Číst odpověď'
        }
      ]
    },
    {
      id: 'math-tools',
      title: 'Matematické nástroje',
      description: 'Využijte pokročilé nástroje pro matematiku',
      category: 'advanced',
      estimatedTime: 8,
      difficulty: 'intermediate',
      steps: [
        {
          id: 'tools-1',
          title: 'Nahrávání obrázků',
          description: 'Nahrajte obrázek matematického problému pro OCR analýzu',
          action: 'Nahrát obrázek'
        },
        {
          id: 'tools-2',
          title: 'Generování cvičení',
          description: 'Vytvořte si vlastní cvičení na základě probírané látky',
          action: 'Vytvořit cvičení'
        },
        {
          id: 'tools-3',
          title: 'Export PDF',
          description: 'Exportujte konverzace a cvičení do PDF formátu',
          action: 'Exportovat do PDF'
        }
      ]
    },
    {
      id: 'accessibility',
      title: 'Přístupnost',
      description: 'Nastavení pro uživatele se specifickými potřebami',
      category: 'accessibility',
      estimatedTime: 4,
      difficulty: 'beginner',
      steps: [
        {
          id: 'acc-1',
          title: 'Vysoký kontrast',
          description: 'Zapněte vysoký kontrast pro lepší čitelnost',
          action: 'Zapnout vysoký kontrast'
        },
        {
          id: 'acc-2',
          title: 'Čtečka obrazovky',
          description: 'Nastavte podporu pro čtečku obrazovky',
          action: 'Nastavit čtečku obrazovky'
        },
        {
          id: 'acc-3',
          title: 'Klávesové zkratky',
          description: 'Naučte se používat klávesové zkratky pro rychlejší práci',
          action: 'Zobrazit zkratky'
        }
      ]
    }
  ];

  const categories = [
    { id: 'all', name: 'Všechny', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'getting-started', name: 'Začátky', icon: <Play className="h-4 w-4" /> },
    { id: 'chat', name: 'Chat', icon: <MessageSquare className="h-4 w-4" /> },
    { id: 'materials', name: 'Materiály', icon: <FileText className="h-4 w-4" /> },
    { id: 'advanced', name: 'Pokročilé', icon: <Zap className="h-4 w-4" /> },
    { id: 'accessibility', name: 'Přístupnost', icon: <Heart className="h-4 w-4" /> }
  ];

  useEffect(() => {
    // Load completed tutorials from localStorage
    const saved = localStorage.getItem('completedTutorials');
    if (saved) {
      try {
        setCompletedTutorials(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to parse completed tutorials:', error);
      }
    }
  }, []);

  const markTutorialComplete = (tutorialId: string) => {
    const newCompleted = [...completedTutorials, tutorialId];
    setCompletedTutorials(newCompleted);
    localStorage.setItem('completedTutorials', JSON.stringify(newCompleted));
  };

  const startTutorial = (tutorial: HelpTutorial) => {
    setActiveTutorial(tutorial);
    setCurrentStep(0);
  };

  const nextStep = () => {
    if (activeTutorial && currentStep < activeTutorial.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const completeTutorial = () => {
    if (activeTutorial) {
      markTutorialComplete(activeTutorial.id);
      setActiveTutorial(null);
      setCurrentStep(0);
    }
  };

  const getFilteredTutorials = () => {
    return tutorials.filter(tutorial => {
      const matchesSearch = tutorial.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           tutorial.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || tutorial.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600 bg-green-100';
      case 'intermediate': return 'text-yellow-600 bg-yellow-100';
      case 'advanced': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyName = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'Začátečník';
      case 'intermediate': return 'Střední';
      case 'advanced': return 'Pokročilý';
      default: return difficulty;
    }
  };

  if (!isOpen) return null;

  if (activeTutorial) {
    const currentStepData = activeTutorial.steps[currentStep];
    const progress = ((currentStep + 1) / activeTutorial.steps.length) * 100;
    const isLastStep = currentStep === activeTutorial.steps.length - 1;

    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg" title={activeTutorial.title}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <HelpCircle className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-xl font-bold">{activeTutorial.title}</h2>
                <p className="text-sm text-gray-600">{activeTutorial.description}</p>
              </div>
            </div>
            <Button
              onClick={() => setActiveTutorial(null)}
              variant="ghost"
              size="sm"
              className="p-2"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Krok {currentStep + 1} z {activeTutorial.steps.length}</span>
              <span>{Math.round(progress)}% dokončeno</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* Current step */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">{currentStepData.title}</h3>
            <p className="text-gray-700 mb-4">{currentStepData.description}</p>
            
            {currentStepData.action && (
              <div className="flex items-center gap-2 text-blue-600">
                <ArrowRight className="h-4 w-4" />
                <span className="text-sm font-medium">{currentStepData.action}</span>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                onClick={previousStep}
                disabled={currentStep === 0}
                variant="outline"
                size="sm"
              >
                <SkipBack className="h-4 w-4 mr-2" />
                Předchozí
              </Button>
              
              <Button
                onClick={nextStep}
                disabled={isLastStep}
                variant="outline"
                size="sm"
              >
                Další
                <SkipForward className="h-4 w-4 ml-2" />
              </Button>
            </div>

            <div className="flex gap-2">
              {isLastStep ? (
                <Button
                  onClick={completeTutorial}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Dokončit
                </Button>
              ) : (
                <Button
                  onClick={nextStep}
                  disabled={isLastStep}
                >
                  Další krok
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              )}
            </div>
          </div>

          {/* Tutorial info */}
          <div className="mt-6 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Obtížnost: <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(activeTutorial.difficulty)}`}>
                {getDifficultyName(activeTutorial.difficulty)}
              </span></span>
              <span>Čas: ~{activeTutorial.estimatedTime} min</span>
            </div>
          </div>
        </div>
      </Modal>
    );
  }

  const filteredTutorials = getFilteredTutorials();

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Nápověda">
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-bold">Nápověda a výuka</h2>
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

        {/* Search and filters */}
        <div className="mb-6 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Hledat v nápovědě..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.icon}
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Tutorials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTutorials.map(tutorial => {
            const isCompleted = completedTutorials.includes(tutorial.id);
            
            return (
              <div
                key={tutorial.id}
                className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-md ${
                  isCompleted 
                    ? 'border-green-200 bg-green-50' 
                    : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">{tutorial.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{tutorial.description}</p>
                  </div>
                  {isCompleted && (
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 ml-2" />
                  )}
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs ${getDifficultyColor(tutorial.difficulty)}`}>
                    {getDifficultyName(tutorial.difficulty)}
                  </span>
                  <span className="text-xs text-gray-500">~{tutorial.estimatedTime} min</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {tutorial.steps.length} kroků
                  </span>
                  <Button
                    onClick={() => startTutorial(tutorial)}
                    size="sm"
                    variant={isCompleted ? "outline" : "primary"}
                    className="flex items-center gap-2"
                  >
                    {isCompleted ? (
                      <>
                        <Play className="h-4 w-4" />
                        Znovu
                      </>
                    ) : (
                      <>
                        <Play className="h-4 w-4" />
                        Začít
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredTutorials.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Žádné výsledky</h3>
            <p className="text-gray-600">Zkuste změnit vyhledávání nebo kategorii</p>
          </div>
        )}

        {/* Quick tips */}
        <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-yellow-900 mb-2">Rychlé tipy</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Stiskněte F1 pro rychlý přístup k nápovědě</li>
                <li>• Použijte klávesové zkratky Ctrl+/ pro nastavení zkratek</li>
                <li>• Dokončené tutoriály se automaticky uloží</li>
                <li>• Každý tutoriál obsahuje praktické kroky</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default HelpSystem;
