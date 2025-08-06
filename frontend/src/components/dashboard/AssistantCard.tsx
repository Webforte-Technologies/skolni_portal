import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AIFeature } from '../../types';
import Card from '../ui/Card';
import { MessageSquare, ArrowRight } from 'lucide-react';

interface AssistantCardProps {
  feature: AIFeature;
}

const AssistantCard: React.FC<AssistantCardProps> = ({ feature }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/chat');
  };

  return (
    <Card
      title={feature.name}
      onClick={handleClick}
      className="h-full flex flex-col"
    >
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-3">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <span className="text-sm text-gray-600">
            {feature.credits_per_use} kredit
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4 flex-1">
          {feature.description}
        </p>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        <span className="text-xs text-gray-500">
          Klikněte pro spuštění
        </span>
        <ArrowRight className="h-4 w-4 text-blue-600" />
      </div>
    </Card>
  );
};

export default AssistantCard; 