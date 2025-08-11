import React, { useState, useEffect } from 'react';
import { MathTopic, MathDifficulty, PracticeProblem, PracticeSession } from '../../types';
import { Check, X, Lightbulb, Target, Timer, Trophy, ArrowRight, RotateCcw } from 'lucide-react';
import Button from '../ui/Button';
import { cn } from '../../utils/cn';
import { generateUUID } from '../../utils/uuid';

interface PracticeModeProps {
  topic: MathTopic;
  difficulty: MathDifficulty;
  onClose: () => void;
  onComplete: (session: PracticeSession) => void;
}

// Sample practice problems - in a real app, these would come from the backend
const SAMPLE_PROBLEMS: Record<MathTopic, Record<MathDifficulty, PracticeProblem[]>> = {
  basic_math: {
    basic: [
      {
        id: '1',
        problem: 'Vypočítej: 15 + 27',
        answer: '42',
        solution: '15 + 27 = 42\n\nPostup:\n1. Sečti jednotky: 5 + 7 = 12\n2. Napiš 2, 1 si pamatuj\n3. Sečti desítky: 1 + 1 + 2 = 4\n4. Výsledek: 42',
        topic: 'basic_math',
        difficulty: 'basic',
        hints: ['Začni sčítáním jednotek', 'Nezapomeň si pamatovat přenos']
      },
      {
        id: '2',
        problem: 'Kolik je 25% z 80?',
        answer: '20',
        solution: '25% z 80 = 20\n\nPostup:\n1. 25% = 25/100 = 0.25\n2. 0.25 × 80 = 20\n\nKontrola: 20 je čtvrtina z 80',
        topic: 'basic_math',
        difficulty: 'basic',
        hints: ['Procenta jsou zlomky', '25% = 0.25']
      }
    ],
    intermediate: [
      {
        id: '3',
        problem: 'Vypočítej: 3/4 + 2/3',
        answer: '17/12',
        solution: '3/4 + 2/3 = 17/12\n\nPostup:\n1. Najdi společný jmenovatel: 12\n2. 3/4 = 9/12\n3. 2/3 = 8/12\n4. 9/12 + 8/12 = 17/12',
        topic: 'basic_math',
        difficulty: 'intermediate',
        hints: ['Najdi nejmenší společný násobek', 'Rozšiř zlomky na společný jmenovatel']
      }
    ],
    advanced: []
  },
  algebra: {
    basic: [
      {
        id: '4',
        problem: 'Řeš rovnici: 2x + 5 = 13',
        answer: 'x = 4',
        solution: '2x + 5 = 13\n\nPostup:\n1. Odečti 5 od obou stran: 2x = 8\n2. Vyděl obě strany 2: x = 4\n\nKontrola: 2(4) + 5 = 8 + 5 = 13 ✓',
        topic: 'algebra',
        difficulty: 'basic',
        hints: ['Odečti 5 od obou stran', 'Vyděl obě strany 2']
      }
    ],
    intermediate: [
      {
        id: '5',
        problem: 'Řeš kvadratickou rovnici: x² - 5x + 6 = 0',
        answer: 'x₁ = 2, x₂ = 3',
        solution: 'x² - 5x + 6 = 0\n\nPostup:\n1. Rozlož na součin: (x - 2)(x - 3) = 0\n2. x - 2 = 0 → x = 2\n3. x - 3 = 0 → x = 3\n\nŘešení: x₁ = 2, x₂ = 3',
        topic: 'algebra',
        difficulty: 'intermediate',
        hints: ['Zkus rozložit na součin', 'Hledej čísla, jejichž součin je 6 a součet -5']
      }
    ],
    advanced: []
  },
  geometry: {
    basic: [
      {
        id: '6',
        problem: 'Vypočítej obsah kruhu o poloměru 5 cm.',
        answer: '25π cm²',
        solution: 'S = πr²\n\nPostup:\n1. r = 5 cm\n2. S = π × 5² = π × 25 = 25π cm²\n\nPřibližně: 25π ≈ 78.54 cm²',
        topic: 'geometry',
        difficulty: 'basic',
        hints: ['Použij vzorec S = πr²', 'r² = 5² = 25']
      }
    ],
    intermediate: [],
    advanced: []
  },
  // Add more topics with sample problems...
  calculus: { basic: [], intermediate: [], advanced: [] },
  statistics: { basic: [], intermediate: [], advanced: [] },
  discrete_math: { basic: [], intermediate: [], advanced: [] },
  physics: { basic: [], intermediate: [], advanced: [] },
  chemistry: { basic: [], intermediate: [], advanced: [] },
  biology: { basic: [], intermediate: [], advanced: [] },
  history: { basic: [], intermediate: [], advanced: [] },
  czech_language: { basic: [], intermediate: [], advanced: [] },
  other: { basic: [], intermediate: [], advanced: [] }
};

const PracticeMode: React.FC<PracticeModeProps> = ({
  topic,
  difficulty,
  onClose,
  onComplete
}) => {
  const [session, setSession] = useState<PracticeSession>(() => {
    const problems = SAMPLE_PROBLEMS[topic]?.[difficulty] || [];
    return {
      id: generateUUID(),
      topic,
      difficulty,
      problems,
      currentProblemIndex: 0,
      score: 0,
      totalProblems: problems.length,
      startedAt: new Date().toISOString()
    };
  });

  const [userAnswer, setUserAnswer] = useState('');
  const [showSolution, setShowSolution] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeStarted, setTimeStarted] = useState<number>(Date.now());
  const [currentTime, setCurrentTime] = useState<number>(0);

  const currentProblem = session.problems[session.currentProblemIndex];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now() - timeStarted);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeStarted]);

  const handleSubmitAnswer = () => {
    if (!currentProblem) return;

    const correct = userAnswer.trim().toLowerCase() === currentProblem.answer.toLowerCase();
    setIsCorrect(correct);
    setShowSolution(true);

    if (correct) {
      setSession(prev => ({
        ...prev,
        score: prev.score + 1
      }));
    }
  };

  const handleNextProblem = () => {
    if (session.currentProblemIndex < session.problems.length - 1) {
      setSession(prev => ({
        ...prev,
        currentProblemIndex: prev.currentProblemIndex + 1
      }));
      setUserAnswer('');
      setShowSolution(false);
      setIsCorrect(null);
    } else {
      // Session completed
      const completedSession = {
        ...session,
        completedAt: new Date().toISOString()
      };
      onComplete(completedSession);
    }
  };

  const handleShowHint = () => {
    // In a real app, this would show hints progressively
    alert(`Nápověda: ${currentProblem?.hints[0] || 'Zkus to znovu!'}`);
  };

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (!currentProblem) {
    return (
      <div className="p-6 text-center">
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
          Pro toto téma a obtížnost zatím nejsou k dispozici cvičení.
        </p>
        <Button onClick={onClose} variant="primary">
          Zpět na chat
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="h-6 w-6 text-primary-600" />
          <div>
            <h3 className="font-semibold text-lg">Cvičení: {topic}</h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Obtížnost: {difficulty} • Otázka {session.currentProblemIndex + 1} z {session.totalProblems}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Trophy className="h-4 w-4 text-yellow-500" />
            <span>{session.score}/{session.totalProblems}</span>
          </div>
          <div className="flex items-center gap-1">
            <Timer className="h-4 w-4 text-blue-500" />
            <span>{formatTime(currentTime)}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
        <div
          className="bg-primary-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${((session.currentProblemIndex + 1) / session.totalProblems) * 100}%` }}
        />
      </div>

      {/* Problem */}
      <div className="bg-white dark:bg-neutral-800 rounded-lg p-6 border border-neutral-200 dark:border-neutral-700">
        <h4 className="font-medium text-lg mb-4">Úloha:</h4>
        <p className="text-lg mb-6 whitespace-pre-wrap">{currentProblem.problem}</p>

        {!showSolution ? (
          <div className="space-y-4">
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Zde napiš svou odpověď..."
              className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100"
              onKeyPress={(e) => e.key === 'Enter' && handleSubmitAnswer()}
            />
            <div className="flex gap-3">
              <Button onClick={handleSubmitAnswer} variant="primary" className="flex-1">
                Odeslat odpověď
              </Button>
              <Button onClick={handleShowHint} variant="secondary" size="sm">
                <Lightbulb className="h-4 w-4 mr-2" />
                Nápověda
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Result */}
            <div className={cn(
              'p-4 rounded-lg border-2',
              isCorrect 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'
            )}>
              <div className="flex items-center gap-2">
                {isCorrect ? (
                  <Check className="h-5 w-5 text-green-600" />
                ) : (
                  <X className="h-5 w-5 text-red-600" />
                )}
                <span className={cn(
                  'font-medium',
                  isCorrect ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                )}>
                  {isCorrect ? 'Správně!' : 'Nesprávně'}
                </span>
              </div>
              {!isCorrect && (
                <p className="text-sm text-red-700 dark:text-red-300 mt-2">
                  Správná odpověď: {currentProblem.answer}
                </p>
              )}
            </div>

            {/* Solution */}
            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-4">
              <h5 className="font-medium mb-2">Řešení:</h5>
              <div className="whitespace-pre-wrap text-sm">{currentProblem.solution}</div>
            </div>

            {/* Navigation */}
            <div className="flex gap-3">
              <Button onClick={handleNextProblem} variant="primary" className="flex-1">
                {session.currentProblemIndex < session.problems.length - 1 ? (
                  <>
                    Další otázka
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                ) : (
                  <>
                    Dokončit cvičení
                    <Trophy className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Session Controls */}
      <div className="flex justify-between">
        <Button onClick={onClose} variant="secondary">
          Ukončit cvičení
        </Button>
        <Button 
          onClick={() => {
            setSession(prev => ({ ...prev, currentProblemIndex: 0, score: 0 }));
            setUserAnswer('');
            setShowSolution(false);
            setIsCorrect(null);
            setTimeStarted(Date.now());
          }}
          variant="secondary"
          size="sm"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Začít znovu
        </Button>
      </div>
    </div>
  );
};

export default PracticeMode;
