import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AIFeature } from '../../types';
import Card from '../ui/Card';
import { MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
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
    <Card
      title={feature.name}
      onClick={handleClick}
      className="h-full flex flex-col group hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
    >
      <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-50 dark:bg-neutral-800 rounded-lg group-hover:bg-blue-50 dark:group-hover:bg-neutral-700 transition-colors duration-200">
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
        
        <p className="text-gray-600 dark:text-neutral-300 text-sm mb-4 flex-1 leading-relaxed">
          {feature.description}
        </p>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-neutral-800 group-hover:border-blue-200 transition-colors duration-200">
        <span className="text-xs text-gray-500 dark:text-neutral-400 group-hover:text-blue-600 transition-colors duration-200">
          Klikněte pro spuštění
        </span>
        <div className="flex items-center space-x-1 text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
          <span className="text-sm font-medium">Spustit</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
        </div>
      </div>
    </Card>
  );
});

AssistantCard.displayName = 'AssistantCard';

export default AssistantCard; 