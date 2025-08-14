import React, { useState } from 'react';
import Header from '../../components/layout/Header';
import MathToolsToolbar from '../../components/chat/MathToolsToolbar';
import DifficultyProgression from '../../components/chat/DifficultyProgression';
import PracticeMode from '../../components/chat/PracticeMode';
import { MathTopic, MathDifficulty, PracticeSession } from '../../types';

const ToolsPage: React.FC = () => {
  const [selectedTopic, setSelectedTopic] = useState<MathTopic>('basic_math');
  const [selectedDifficulty, setSelectedDifficulty] = useState<MathDifficulty>('basic');
  const [showPractice, setShowPractice] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  const handleTopicChange = (t: MathTopic) => setSelectedTopic(t);
  const handleDifficultyChange = (d: MathDifficulty) => setSelectedDifficulty(d);

  const handleStartPractice = () => {
    setShowPractice(true);
    setShowProgress(false);
  };

  const handleShowProgress = () => {
    setShowProgress(true);
    setShowPractice(false);
  };

  const handlePracticeComplete = (_: PracticeSession) => {
    // Future: persist progress
    setShowPractice(false);
  };

  return (
    <div className="min-h-screen bg-background dark:bg-neutral-900">
      <Header />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
        <h1 className="text-2xl font-semibold">Nástroje a cvičení</h1>
        <div className="border border-border dark:border-neutral-800 bg-card dark:bg-neutral-950 rounded-lg">
          <MathToolsToolbar
            selectedTopic={selectedTopic}
            selectedDifficulty={selectedDifficulty}
            onTopicChange={handleTopicChange}
            onDifficultyChange={handleDifficultyChange}
            onStartPractice={handleStartPractice}
            onShowProgression={handleShowProgress}
            className="mx-4 my-4"
          />
        </div>

        {showPractice && (
          <div className="border border-border dark:border-neutral-800 bg-card dark:bg-neutral-950 rounded-lg">
            <PracticeMode
              topic={selectedTopic}
              difficulty={selectedDifficulty}
              onClose={() => setShowPractice(false)}
              onComplete={handlePracticeComplete}
            />
          </div>
        )}

        {showProgress && (
          <div className="border border-border dark:border-neutral-800 bg-card dark:bg-neutral-950 rounded-lg p-4">
            <DifficultyProgression
              topic={selectedTopic}
              currentDifficulty={selectedDifficulty}
              userProgress={70}
              onDifficultySelect={handleDifficultyChange}
              onStartPractice={handleStartPractice}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default ToolsPage;


