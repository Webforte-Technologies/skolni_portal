import React, { useState } from 'react';
import { MathTopic, MathDifficulty } from '../../types';
import { TrendingUp, Target, Star, Lock, CheckCircle, ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';

interface DifficultyProgressionProps {
  topic: MathTopic;
  currentDifficulty: MathDifficulty;
  userProgress: number; // 0-100 mastery level
  onDifficultySelect: (difficulty: MathDifficulty) => void;
  onStartPractice: (topic: MathTopic, difficulty: MathDifficulty) => void;
}

const DIFFICULTY_LEVELS: Record<MathDifficulty, {
  name: string;
  description: string;
  color: string;
  requiredMastery: number;
  icon: React.ReactNode;
}> = {
  basic: {
    name: 'Základní',
    description: 'Základní koncepty a jednoduché příklady',
    color: 'bg-green-500',
    requiredMastery: 0,
    icon: <Target className="h-5 w-5" />
  },
  intermediate: {
    name: 'Střední',
    description: 'Složitější úlohy a pokročilé koncepty',
    color: 'bg-yellow-500',
    requiredMastery: 70,
    icon: <TrendingUp className="h-5 w-5" />
  },
  advanced: {
    name: 'Pokročilé',
    description: 'Nejsložitější úlohy a expertní úroveň',
    color: 'bg-red-500',
    requiredMastery: 90,
    icon: <Star className="h-5 w-5" />
  }
};

const TOPIC_PROGRESSION: Record<MathTopic, {
  name: string;
  description: string;
  prerequisites: MathTopic[];
  learningPath: string[];
}> = {
  basic_math: {
    name: 'Základní matematika',
    description: 'Základy aritmetiky, zlomky, procenta',
    prerequisites: [],
    learningPath: ['Sčítání a odčítání', 'Násobení a dělení', 'Zlomky', 'Procenta', 'Desetinná čísla']
  },
  algebra: {
    name: 'Algebra',
    description: 'Rovnice, funkce, grafy',
    prerequisites: ['basic_math'],
    learningPath: ['Lineární rovnice', 'Kvadratické rovnice', 'Funkce', 'Grafy', 'Soustavy rovnic']
  },
  geometry: {
    name: 'Geometrie',
    description: 'Plošný obsah, objem, trigonometrie',
    prerequisites: ['basic_math'],
    learningPath: ['Základní geometrické tvary', 'Pythagorova věta', 'Trigonometrie', 'Obsahy a objemy', 'Kružnice a kruhy']
  },
  calculus: {
    name: 'Analýza',
    description: 'Derivace, integrály, limity',
    prerequisites: ['algebra', 'geometry'],
    learningPath: ['Limity', 'Derivace', 'Integrály', 'Aplikace derivací', 'Aplikace integrálů']
  },
  statistics: {
    name: 'Statistika',
    description: 'Průměry, grafy, pravděpodobnost',
    prerequisites: ['basic_math'],
    learningPath: ['Popisná statistika', 'Pravděpodobnost', 'Distribuce', 'Testování hypotéz', 'Regrese']
  },
  discrete_math: {
    name: 'Diskrétní matematika',
    description: 'Kombinatorika, logika, teorie grafů',
    prerequisites: ['basic_math'],
    learningPath: ['Kombinatorika', 'Logika', 'Teorie grafů', 'Teorie čísel', 'Algoritmy']
  },
  physics: {
    name: 'Fyzika',
    description: 'Mechanika, elektřina, optika',
    prerequisites: ['basic_math', 'algebra'],
    learningPath: ['Mechanika', 'Elektřina a magnetismus', 'Optika', 'Termodynamika', 'Moderní fyzika']
  },
  chemistry: {
    name: 'Chemie',
    description: 'Chemické výpočty, stechiometrie',
    prerequisites: ['basic_math'],
    learningPath: ['Základní chemie', 'Stechiometrie', 'Rovnováhy', 'Elektrochemie', 'Organická chemie']
  },
  biology: {
    name: 'Biologie',
    description: 'Biologické procesy, genetika',
    prerequisites: ['basic_math'],
    learningPath: ['Buňka', 'Genetika', 'Evoluce', 'Ekologie', 'Lidské tělo']
  },
  history: {
    name: 'Dějepis',
    description: 'Historické události, chronologie',
    prerequisites: [],
    learningPath: ['Starověk', 'Středověk', 'Novověk', 'Moderní dějiny', 'České dějiny']
  },
  czech_language: {
    name: 'Český jazyk',
    description: 'Gramatika, pravopis, literatura',
    prerequisites: [],
    learningPath: ['Gramatika', 'Pravopis', 'Literatura', 'Stylistika', 'Komunikační výchova']
  },
  other: {
    name: 'Jiné',
    description: 'Ostatní předměty a témata',
    prerequisites: [],
    learningPath: ['Obecné dotazy', 'Pomoc s učením', 'Metodika', 'Pedagogika', 'Vzdělávání']
  }
};

const DifficultyProgression: React.FC<DifficultyProgressionProps> = ({
  topic,
  currentDifficulty,
  userProgress,
  onDifficultySelect,
  onStartPractice
}) => {
  const [showLearningPath, setShowLearningPath] = useState(false);
  
  const topicInfo = TOPIC_PROGRESSION[topic];
  const isUnlocked = (difficulty: MathDifficulty) => {
    return userProgress >= DIFFICULTY_LEVELS[difficulty].requiredMastery;
  };

  const getProgressColor = (difficulty: MathDifficulty) => {
    if (difficulty === currentDifficulty) return 'ring-2 ring-primary-500';
    if (isUnlocked(difficulty)) return 'hover:bg-neutral-50 dark:hover:bg-neutral-800';
    return 'opacity-50 cursor-not-allowed';
  };

  const getProgressBarColor = (difficulty: MathDifficulty) => {
    if (difficulty === 'basic') return 'bg-green-500';
    if (difficulty === 'intermediate') return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getMasteryText = (difficulty: MathDifficulty) => {
    if (difficulty === 'basic') return 'Vždy dostupné';
    if (difficulty === 'intermediate') return 'Vyžaduje 70% zvládnutí základní úrovně';
    return 'Vyžaduje 90% zvládnutí střední úrovně';
  };

  return (
    <div className="space-y-6">
      {/* Topic Overview */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
              {topicInfo.name}
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400 mb-3">
              {topicInfo.description}
            </p>
            <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Celkové zvládnutí: {userProgress}%</span>
            </div>
          </div>
          <Button
            onClick={() => setShowLearningPath(!showLearningPath)}
            variant="secondary"
            size="sm"
          >
            {showLearningPath ? 'Skrýt' : 'Zobrazit'} učební plán
          </Button>
        </div>

        {/* Learning Path */}
        {showLearningPath && (
          <div className="mt-4 p-4 bg-neutral-50 dark:bg-neutral-900 rounded-lg border border-neutral-200 dark:border-neutral-700">
            <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3">Učební plán:</h4>
            <div className="space-y-2">
              {topicInfo.learningPath.map((step, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center text-xs font-medium text-primary-700 dark:text-primary-300">
                    {index + 1}
                  </div>
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">{step}</span>
                  {index < topicInfo.learningPath.length - 1 && (
                    <ArrowRight className="h-4 w-4 text-neutral-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Difficulty Levels */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
          Úrovně obtížnosti
        </h4>
        
        {Object.entries(DIFFICULTY_LEVELS).map(([difficulty, level]) => (
          <div
            key={difficulty}
            className={cn(
              'bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700 transition-all duration-200',
              getProgressColor(difficulty as MathDifficulty)
            )}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center text-white',
                  level.color
                )}>
                  {level.icon}
                </div>
                <div>
                  <h5 className="font-medium text-neutral-900 dark:text-neutral-100">
                    {level.name}
                  </h5>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {level.description}
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                {isUnlocked(difficulty as MathDifficulty) ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">
                      {getMasteryText(difficulty as MathDifficulty)}
                    </span>
                    {difficulty === currentDifficulty && (
                      <span className="px-2 py-1 bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 text-xs rounded-full">
                        Aktuální
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-neutral-400">
                    <Lock className="h-4 w-4" />
                    <span className="text-sm">
                      Vyžaduje {level.requiredMastery}% zvládnutí
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2 mb-3">
              <div
                className={cn(
                  'h-2 rounded-full transition-all duration-300',
                  getProgressBarColor(difficulty as MathDifficulty)
                )}
                style={{ 
                  width: `${Math.min(100, (userProgress / level.requiredMastery) * 100)}%` 
                }}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={() => onDifficultySelect(difficulty as MathDifficulty)}
                variant={difficulty === currentDifficulty ? "primary" : "secondary"}
                disabled={!isUnlocked(difficulty as MathDifficulty)}
                className="flex-1"
              >
                {difficulty === currentDifficulty ? 'Aktuální úroveň' : 'Vybrat úroveň'}
              </Button>
              
              {isUnlocked(difficulty as MathDifficulty) && (
                <Button
                  onClick={() => onStartPractice(topic, difficulty as MathDifficulty)}
                  variant="primary"
                  size="sm"
                >
                  Začít cvičení
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
        <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
          💡 Doporučení pro pokrok
        </h4>
        <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
          <li>• Dokončete alespoň 70% úloh na základní úrovni před přechodem na střední</li>
          <li>• Pravidelně opakujte již zvládnutá témata</li>
          <li>• Používejte nápovědy, když si nejste jisti postupem</li>
          <li>• Sledujte svůj pokrok v jednotlivých oblastech</li>
        </ul>
      </div>
    </div>
  );
};

export default DifficultyProgression;
