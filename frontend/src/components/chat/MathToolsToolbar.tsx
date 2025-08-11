import React, { useState } from 'react';
import { MathTopic, MathDifficulty } from '../../types';
import { Target, TrendingUp, Star, BookOpen, Calculator, Brain } from 'lucide-react';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';
import MathTopicCategorizer from './MathTopicCategorizer';

interface MathToolsToolbarProps {
  selectedTopic?: MathTopic;
  selectedDifficulty?: MathDifficulty;
  onTopicChange: (topic: MathTopic) => void;
  onDifficultyChange: (difficulty: MathDifficulty) => void;
  onStartPractice: () => void;
  onShowProgression: () => void;
  className?: string;
}

const MathToolsToolbar: React.FC<MathToolsToolbarProps> = ({
  selectedTopic = 'basic_math',
  selectedDifficulty = 'basic',
  onTopicChange,
  onDifficultyChange,
  onStartPractice,
  onShowProgression,
  className
}) => {
  const [showTopicSelector, setShowTopicSelector] = useState(false);

  const difficultyIcons = {
    basic: <Target className="h-4 w-4" />,
    intermediate: <TrendingUp className="h-4 w-4" />,
    advanced: <Star className="h-4 w-4" />
  };

  const difficultyNames = {
    basic: 'Základní',
    intermediate: 'Střední',
    advanced: 'Pokročilé'
  };

  const difficultyColors = {
    basic: 'bg-green-500 hover:bg-green-600',
    intermediate: 'bg-yellow-500 hover:bg-yellow-600',
    advanced: 'bg-red-500 hover:bg-red-600'
  };

  return (
    <div className={cn('bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-primary-600" />
          Matematické nástroje
        </h3>
        <Button
          onClick={onShowProgression}
          variant="secondary"
          size="sm"
          className="flex items-center gap-2"
        >
          <Brain className="h-4 w-4" />
          Pokrok
        </Button>
      </div>

      {/* Topic Selection */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Téma:
          </label>
          <Button
            onClick={() => setShowTopicSelector(!showTopicSelector)}
            variant="secondary"
            size="sm"
          >
            {showTopicSelector ? 'Skrýt' : 'Změnit'}
          </Button>
        </div>
        
        {showTopicSelector ? (
          <MathTopicCategorizer
            selectedTopic={selectedTopic}
            onTopicSelect={(topic) => {
              onTopicChange(topic);
              setShowTopicSelector(false);
            }}
            showExamples={true}
          />
        ) : (
          <div className="flex items-center gap-2">
            <span className="px-3 py-2 bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-200 rounded-lg text-sm font-medium">
              {selectedTopic === 'basic_math' && 'Základní matematika'}
              {selectedTopic === 'algebra' && 'Algebra'}
              {selectedTopic === 'geometry' && 'Geometrie'}
              {selectedTopic === 'calculus' && 'Analýza'}
              {selectedTopic === 'statistics' && 'Statistika'}
              {selectedTopic === 'discrete_math' && 'Diskrétní matematika'}
              {selectedTopic === 'physics' && 'Fyzika'}
              {selectedTopic === 'chemistry' && 'Chemie'}
              {selectedTopic === 'biology' && 'Biologie'}
              {selectedTopic === 'history' && 'Dějepis'}
              {selectedTopic === 'czech_language' && 'Český jazyk'}
              {selectedTopic === 'other' && 'Jiné'}
            </span>
          </div>
        )}
      </div>

      {/* Difficulty Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
          Obtížnost:
        </label>
        <div className="flex gap-2">
          {(['basic', 'intermediate', 'advanced'] as MathDifficulty[]).map((difficulty) => (
            <Button
              key={difficulty}
              onClick={() => onDifficultyChange(difficulty)}
              variant={selectedDifficulty === difficulty ? "primary" : "secondary"}
              size="sm"
              className={cn(
                'flex items-center gap-2',
                selectedDifficulty === difficulty && difficultyColors[difficulty]
              )}
            >
              {difficultyIcons[difficulty]}
              {difficultyNames[difficulty]}
            </Button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-3">
        <Button
          onClick={onStartPractice}
          variant="primary"
          className="flex-1 flex items-center justify-center gap-2"
        >
          <BookOpen className="h-4 w-4" />
          Začít cvičení
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          className="px-4"
          onClick={() => {
            // This would open a modal with math formulas and examples
            alert('Funkce pro zobrazení matematických vzorců bude implementována v další fázi.');
          }}
        >
          Vzorce
        </Button>
      </div>

      {/* Quick Tips */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-start gap-2">
          <Brain className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-medium mb-1">💡 Tipy pro lepší učení:</p>
            <ul className="space-y-1 text-xs">
              <li>• Začněte s tématy, která už znáte</li>
              <li>• Postupně zvyšujte obtížnost</li>
              <li>• Pravidelně opakujte a procvičujte</li>
              <li>• Používejte nápovědy, když si nejste jisti</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MathToolsToolbar;
