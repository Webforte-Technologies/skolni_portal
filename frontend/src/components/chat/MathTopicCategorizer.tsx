import React from 'react';
import { MathTopic, MathTopicInfo } from '../../types';
import { 
  Calculator, 
  Square, 
  TrendingUp, 
  BarChart3, 
  Network, 
  Atom, 
  FlaskConical, 
  Leaf, 
  BookOpen, 
  Languages,
  HelpCircle 
} from 'lucide-react';
import { cn } from '../../utils/cn';

const MATH_TOPICS: Record<MathTopic, MathTopicInfo> = {
  basic_math: {
    id: 'basic_math',
    name: 'Základní matematika',
    description: 'Aritmetika, zlomky, procenta, desetinná čísla',
    icon: 'Calculator',
    color: 'bg-blue-500',
    examples: ['2 + 2 = 4', '25% z 80', '3/4 + 1/2']
  },
  algebra: {
    id: 'algebra',
    name: 'Algebra',
    description: 'Rovnice, nerovnice, funkce, grafy',
    icon: 'TrendingUp',
    color: 'bg-green-500',
    examples: ['x² + 5x + 6 = 0', 'f(x) = 2x + 3', '|x - 2| < 5']
  },
  geometry: {
    id: 'geometry',
    name: 'Geometrie',
    description: 'Plošný obsah, objem, Pythagorova věta, trigonometrie',
    icon: 'Square',
    color: 'bg-purple-500',
    examples: ['Pythagorova věta', 'Obsah kruhu', 'sin(30°)']
  },
  calculus: {
    id: 'calculus',
    name: 'Analýza',
    description: 'Derivace, integrály, limity, posloupnosti',
    icon: 'TrendingUp',
    color: 'bg-red-500',
    examples: ['d/dx(x²)', '∫x dx', 'lim(x→0) sin(x)/x']
  },
  statistics: {
    id: 'statistics',
    name: 'Statistika',
    description: 'Průměry, grafy, pravděpodobnost',
    icon: 'BarChart3',
    color: 'bg-yellow-500',
    examples: ['Aritmetický průměr', 'Pravděpodobnost', 'Grafy']
  },
  discrete_math: {
    id: 'discrete_math',
    name: 'Diskrétní matematika',
    description: 'Kombinatorika, logika, teorie grafů',
    icon: 'Network',
    color: 'bg-indigo-500',
    examples: ['Kombinace', 'Logické operace', 'Grafy']
  },
  physics: {
    id: 'physics',
    name: 'Fyzika',
    description: 'Mechanika, elektřina, optika, termodynamika',
    icon: 'Atom',
    color: 'bg-orange-500',
    examples: ['F = ma', 'E = mc²', 'Ohmův zákon']
  },
  chemistry: {
    id: 'chemistry',
    name: 'Chemie',
    description: 'Chemické výpočty, stechiometrie, pH',
    icon: 'FlaskConical',
    color: 'bg-teal-500',
    examples: ['Molární hmotnost', 'pH = -log[H⁺]', 'Stechiometrie']
  },
  biology: {
    id: 'biology',
    name: 'Biologie',
    description: 'Biologické procesy, genetika, ekologie',
    icon: 'Leaf',
    color: 'bg-emerald-500',
    examples: ['Genetické výpočty', 'Populační růst', 'Statistika']
  },
  history: {
    id: 'history',
    name: 'Dějepis',
    description: 'Historické události, data, chronologie',
    icon: 'BookOpen',
    color: 'bg-amber-500',
    examples: ['Chronologie', 'Historické souvislosti', 'Data']
  },
  czech_language: {
    id: 'czech_language',
    name: 'Český jazyk',
    description: 'Gramatika, pravopis, literatura',
    icon: 'Languages',
    color: 'bg-rose-500',
    examples: ['Gramatické pravidla', 'Pravopis', 'Literární analýza']
  },
  other: {
    id: 'other',
    name: 'Jiné',
    description: 'Ostatní předměty a témata',
    icon: 'HelpCircle',
    color: 'bg-gray-500',
    examples: ['Různá témata', 'Obecné dotazy', 'Pomoc']
  }
};

const getTopicIcon = (iconName: string) => {
  const iconMap: Record<string, React.ReactNode> = {
    Calculator: <Calculator className="h-4 w-4" />,
    TrendingUp: <TrendingUp className="h-4 w-4" />,
    Square: <Square className="h-4 w-4" />,
    BarChart3: <BarChart3 className="h-4 w-4" />,
    Network: <Network className="h-4 w-4" />,
    Atom: <Atom className="h-4 w-4" />,
    FlaskConical: <FlaskConical className="h-4 w-4" />,
    Leaf: <Leaf className="h-4 w-4" />,
    BookOpen: <BookOpen className="h-4 w-4" />,
    Languages: <Languages className="h-4 w-4" />,
    HelpCircle: <HelpCircle className="h-4 w-4" />
  };
  return iconMap[iconName] || <HelpCircle className="h-4 w-4" />;
};

interface MathTopicCategorizerProps {
  selectedTopic?: MathTopic;
  onTopicSelect: (topic: MathTopic) => void;
  className?: string;
  showExamples?: boolean;
}

const MathTopicCategorizer: React.FC<MathTopicCategorizerProps> = ({
  selectedTopic,
  onTopicSelect,
  className,
  showExamples = false
}) => {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-wrap gap-2">
        {Object.values(MATH_TOPICS).map((topic) => (
          <button
            key={topic.id}
            onClick={() => onTopicSelect(topic.id)}
            className={cn(
              'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105',
              'border-2 border-transparent',
              selectedTopic === topic.id
                ? `${topic.color} text-white shadow-lg`
                : 'bg-white dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-600'
            )}
          >
            {getTopicIcon(topic.icon)}
            <span>{topic.name}</span>
          </button>
        ))}
      </div>
      
      {showExamples && selectedTopic && (
        <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700">
          <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
            Příklady z {MATH_TOPICS[selectedTopic].name}:
          </h4>
          <div className="flex flex-wrap gap-2">
            {MATH_TOPICS[selectedTopic].examples.map((example, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-white dark:bg-neutral-700 rounded text-sm text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-600"
              >
                {example}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MathTopicCategorizer;
