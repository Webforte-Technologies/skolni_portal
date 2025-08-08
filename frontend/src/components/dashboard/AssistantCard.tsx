import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AIFeature } from '../../types';
import { ArrowRight, Sparkles } from 'lucide-react';
import { getAssistantIcon } from '../icons';

interface AssistantCardProps {
  feature: AIFeature;
}

// icons are centralized in components/icons

const AssistantCard: React.FC<AssistantCardProps> = React.memo(({ feature }) => {
  const navigate = useNavigate();

  const handleClick = useCallback(() => {
    navigate('/chat');
  }, [navigate]);

  return (
    <div
      onClick={handleClick}
      className="h-full cursor-pointer rounded-xl p-[1px] bg-gradient-to-br from-white/20 via-white/10 to-white/0 dark:from-white/10 dark:via-white/5 dark:to-white/0 backdrop-blur group transition-transform duration-200 hover:-translate-y-1 hover:shadow-brand"
    >
      <div className="h-full rounded-xl bg-white/70 dark:bg-neutral-900/70 border border-neutral-200/70 dark:border-neutral-800/70 shadow-soft p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-white/70 dark:bg-neutral-800/60 ring-1 ring-neutral-200/60 dark:ring-neutral-700/60">
              {getAssistantIcon(feature.id)}
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-600 dark:text-neutral-300">
                {feature.credits_per_use} kredit
              </span>
            </div>
          </div>
          <span className="text-xs text-neutral-500 dark:text-neutral-400">Klikněte pro detaily</span>
        </div>
        <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-2">{feature.name}</h3>
        <p className="text-gray-600 dark:text-neutral-300 text-sm mb-4 flex-1 leading-relaxed">
          {feature.description}
        </p>
        <div className="flex items-center justify-between pt-4 border-t border-gray-100/70 dark:border-neutral-800/70">
          <span className="text-xs text-gray-500 dark:text-neutral-400 group-hover:text-blue-600 transition-colors duration-200">
            Klikněte pro spuštění
          </span>
          <div className="flex items-center space-x-1 text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
            <span className="text-sm font-medium">Spustit</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
          </div>
        </div>
      </div>
    </div>
  );
});

AssistantCard.displayName = 'AssistantCard';

export default AssistantCard; 