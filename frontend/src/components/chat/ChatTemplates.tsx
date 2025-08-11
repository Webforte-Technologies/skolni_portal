import React, { useState } from 'react';
import { 
  BookOpen, 
  Calculator, 
  Target, 
  TrendingUp, 
  Zap, 
  Lightbulb,
  Plus,
  X,
  Search
} from 'lucide-react';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

export interface ChatTemplate {
  id: string;
  title: string;
  description: string;
  category: MathTopic;
  difficulty: MathDifficulty;
  prompt: string;
  tags: string[];
  icon: React.ReactNode;
}

// Import types from the main types file
import { MathTopic, MathDifficulty } from '../../types';

interface ChatTemplatesProps {
  isOpen: boolean;
  onClose: () => void;
  onTemplateSelect: (template: ChatTemplate) => void;
}

const ChatTemplates: React.FC<ChatTemplatesProps> = ({
  isOpen,
  onClose,
  onTemplateSelect
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<MathTopic | 'all'>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<MathDifficulty | 'all'>('all');

  const templates: ChatTemplate[] = [
    // Basic Math Templates
    {
      id: 'basic-math-intro',
      title: 'Základy matematiky',
      description: 'Začít s jednoduchými matematickými operacemi a pojmy',
      category: 'basic_math',
      difficulty: 'basic',
      prompt: 'Můžete mi vysvětlit základy matematiky? Začněme s jednoduchými operacemi a postupně se dostaneme k složitějším pojmům.',
      tags: ['základy', 'operace', 'počítání'],
      icon: <Calculator className="h-5 w-5" />
    },

    // Algebra Templates
    {
      id: 'algebra-basics',
      title: 'Základy algebry',
      description: 'Začít s jednoduchými algebraickými výrazy a rovnicemi',
      category: 'algebra',
      difficulty: 'intermediate',
      prompt: 'Můžete mi vysvětlit základy algebry? Začněme s jednoduchými algebraickými výrazy a postupně se dostaneme k řešení rovnic.',
      tags: ['výrazy', 'rovnice', 'základy'],
      icon: <Calculator className="h-5 w-5" />
    },
    {
      id: 'quadratic-equations',
      title: 'Kvadratické rovnice',
      description: 'Naučit se řešit kvadratické rovnice různými metodami',
      category: 'algebra',
      difficulty: 'advanced',
      prompt: 'Potřebuji pomoct s kvadratickými rovnicemi. Můžete mi ukázat různé metody řešení a kdy kterou použít?',
      tags: ['kvadratické', 'rovnice', 'metody'],
      icon: <Target className="h-5 w-5" />
    },

    // Geometry Templates
    {
      id: 'geometry-basics',
      title: 'Základy geometrie',
      description: 'Úvod do základních geometrických pojmů a vlastností',
      category: 'geometry',
      difficulty: 'intermediate',
      prompt: 'Začínám s geometrií. Můžete mi vysvětlit základní pojmy jako bod, přímka, úsečka a jejich vlastnosti?',
      tags: ['body', 'přímky', 'úsečky', 'základy'],
      icon: <BookOpen className="h-5 w-5" />
    },

    // Calculus Templates
    {
      id: 'limits-intro',
      title: 'Úvod do limit',
      description: 'Základní pojmy a výpočet limit funkcí',
      category: 'calculus',
      difficulty: 'advanced',
      prompt: 'Začínám s diferenciálním počtem. Můžete mi vysvětlit, co jsou limity a jak je počítat?',
      tags: ['limity', 'funkce', 'diferenciální počet'],
      icon: <TrendingUp className="h-5 w-5" />
    },

    // Statistics Templates
    {
      id: 'descriptive-stats',
      title: 'Popisná statistika',
      description: 'Základní statistické charakteristiky a grafy',
      category: 'statistics',
      difficulty: 'intermediate',
      prompt: 'Začínám se statistikou. Můžete mi vysvětlit základní pojmy jako průměr, medián a modus?',
      tags: ['průměr', 'medián', 'modus', 'grafy'],
      icon: <TrendingUp className="h-5 w-5" />
    },

    // Discrete Math Templates
    {
      id: 'discrete-basics',
      title: 'Základy diskrétní matematiky',
      description: 'Logika, množiny a kombinatorika',
      category: 'discrete_math',
      difficulty: 'intermediate',
      prompt: 'Potřebuji se naučit základy diskrétní matematiky. Můžete mi vysvětlit logiku, množiny a kombinatoriku?',
      tags: ['logika', 'množiny', 'kombinatorika'],
      icon: <Lightbulb className="h-5 w-5" />
    },

    // Physics Templates
    {
      id: 'physics-basics',
      title: 'Základy fyziky',
      description: 'Mechanika, kinematika a dynamika',
      category: 'physics',
      difficulty: 'intermediate',
      prompt: 'Začínám s fyzikou. Můžete mi vysvětlit základní pojmy mechaniky, kinematiky a dynamiky?',
      tags: ['mechanika', 'kinematika', 'dynamika'],
      icon: <Zap className="h-5 w-5" />
    },

    // Chemistry Templates
    {
      id: 'chemistry-basics',
      title: 'Základy chemie',
      description: 'Chemické výpočty a stechiometrie',
      category: 'chemistry',
      difficulty: 'intermediate',
      prompt: 'Potřebuji pomoct s chemií. Můžete mi vysvětlit chemické výpočty a stechiometrii?',
      tags: ['chemie', 'výpočty', 'stechiometrie'],
      icon: <Target className="h-5 w-5" />
    },

    // Biology Templates
    {
      id: 'biology-basics',
      title: 'Základy biologie',
      description: 'Biostatistika a matematické modely v biologii',
      category: 'biology',
      difficulty: 'intermediate',
      prompt: 'Začínám s biologií. Můžete mi vysvětlit, jak se používají matematické modely v biologii?',
      tags: ['biologie', 'modely', 'statistika'],
      icon: <BookOpen className="h-5 w-5" />
    },

    // History Templates
    {
      id: 'history-math',
      title: 'Historie matematiky',
      description: 'Vývoj matematických pojmů a teorií',
      category: 'history',
      difficulty: 'basic',
      prompt: 'Zajímá mě historie matematiky. Můžete mi vyprávět o vývoji matematických pojmů a teorií?',
      tags: ['historie', 'vývoj', 'teorie'],
      icon: <BookOpen className="h-5 w-5" />
    },

    // Czech Language Templates
    {
      id: 'czech-math',
      title: 'Matematika v češtině',
      description: 'České matematické pojmy a terminologie',
      category: 'czech_language',
      difficulty: 'basic',
      prompt: 'Potřebuji se naučit české matematické pojmy. Můžete mi vysvětlit českou matematickou terminologii?',
      tags: ['čeština', 'pojmy', 'terminologie'],
      icon: <BookOpen className="h-5 w-5" />
    }
  ];

  const categories = [
    { id: 'all', name: 'Všechny kategorie', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'basic_math', name: 'Základy matematiky', icon: <Calculator className="h-4 w-4" /> },
    { id: 'algebra', name: 'Algebra', icon: <Calculator className="h-4 w-4" /> },
    { id: 'geometry', name: 'Geometrie', icon: <Target className="h-4 w-4" /> },
    { id: 'calculus', name: 'Diferenciální počet', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'statistics', name: 'Statistika', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'discrete_math', name: 'Diskrétní matematika', icon: <Lightbulb className="h-4 w-4" /> },
    { id: 'physics', name: 'Fyzika', icon: <Zap className="h-4 w-4" /> },
    { id: 'chemistry', name: 'Chemie', icon: <Target className="h-4 w-4" /> },
    { id: 'biology', name: 'Biologie', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'history', name: 'Historie', icon: <BookOpen className="h-4 w-4" /> },
    { id: 'czech_language', name: 'Čeština', icon: <BookOpen className="h-4 w-4" /> }
  ];

  const difficulties = [
    { id: 'all', name: 'Všechny obtížnosti', color: 'text-neutral-600' },
    { id: 'basic', name: 'Základní', color: 'text-green-600' },
    { id: 'intermediate', name: 'Střední', color: 'text-yellow-600' },
    { id: 'advanced', name: 'Pokročilý', color: 'text-red-600' }
  ];

  const getFilteredTemplates = () => {
    return templates.filter(template => {
      const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || template.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });
  };

  const getDifficultyColor = (difficulty: MathDifficulty) => {
    switch (difficulty) {
      case 'basic': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'intermediate': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'advanced': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-neutral-600 bg-neutral-50 dark:bg-neutral-900/20';
    }
  };

  const handleTemplateSelect = (template: ChatTemplate) => {
    onTemplateSelect(template);
    onClose();
  };

  if (!isOpen) return null;

  const filteredTemplates = getFilteredTemplates();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <div>
            <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              Šablony konverzací
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Vyberte si předpřipravené konverzační startéry pro matematická témata
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Hledat v šablonách..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Category and Difficulty Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Categories */}
            <div className="flex flex-wrap gap-1">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id as MathTopic | 'all')}
                  className="flex items-center gap-2"
                >
                  {category.icon}
                  {category.name}
                </Button>
              ))}
            </div>

            {/* Difficulties */}
            <div className="flex flex-wrap gap-1 ml-4">
              {difficulties.map((difficulty) => (
                <Button
                  key={difficulty.id}
                  variant={selectedDifficulty === difficulty.id ? "primary" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDifficulty(difficulty.id as MathDifficulty | 'all')}
                  className={cn(
                    "flex items-center gap-2",
                    selectedDifficulty === difficulty.id && difficulty.color
                  )}
                >
                  {difficulty.name}
                </Button>
              ))}
            </div>
          </div>

          {/* Results count */}
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Nalezeno {filteredTemplates.length} šablon
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Nebyly nalezeny žádné šablony
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Zkuste změnit filtry nebo hledaný výraz
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-4 hover:border-primary-300 dark:hover:border-primary-600 transition-colors cursor-pointer group"
                  onClick={() => handleTemplateSelect(template)}
                >
                  {/* Template Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="text-primary-600 dark:text-primary-400">
                        {template.icon}
                      </div>
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {template.title}
                      </h3>
                    </div>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      getDifficultyColor(template.difficulty)
                    )}>
                                             {template.difficulty === 'basic' && 'Základní'}
                       {template.difficulty === 'intermediate' && 'Střední'}
                       {template.difficulty === 'advanced' && 'Pokročilý'}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3 line-clamp-2">
                    {template.description}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs rounded-md"
                      >
                        {tag}
                      </span>
                    ))}
                    {template.tags.length > 3 && (
                      <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs rounded-md">
                        +{template.tags.length - 3}
                      </span>
                    )}
                  </div>

                  {/* Use Template Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full group-hover:border-primary-300 group-hover:text-primary-600 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Použít šablonu
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatTemplates;
