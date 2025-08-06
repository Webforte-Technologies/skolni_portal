import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AIFeature } from '../../types';
import Card from '../ui/Card';
import { MessageSquare, ArrowRight, Sparkles, Calculator, Atom, Beaker, Leaf, BookOpen, Languages } from 'lucide-react';

interface AssistantCardProps {
  feature: AIFeature;
}

// Icon mapping for different assistant types
const getAssistantIcon = (featureId: string) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    math_assistant: <Calculator className="h-6 w-6 text-blue-600" />,
    physics_assistant: <Atom className="h-6 w-6 text-purple-600" />,
    chemistry_assistant: <Beaker className="h-6 w-6 text-green-600" />,
    biology_assistant: <Leaf className="h-6 w-6 text-emerald-600" />,
    history_assistant: <BookOpen className="h-6 w-6 text-orange-600" />,
    language_assistant: <Languages className="h-6 w-6 text-red-600" />,
  };
  
  return iconMap[featureId] || <MessageSquare className="h-6 w-6 text-blue-600" />;
};

const AssistantCard: React.FC<AssistantCardProps> = ({ feature }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/chat');
  };

  return (
    <Card
      title={feature.name}
      onClick={handleClick}
      className="h-full flex flex-col group hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
    >
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors duration-200">
              {getAssistantIcon(feature.id)}
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-gray-600">
                {feature.credits_per_use} kredit
              </span>
            </div>
          </div>
        </div>
        
        <p className="text-gray-600 text-sm mb-4 flex-1 leading-relaxed">
          {feature.description}
        </p>
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-gray-100 group-hover:border-blue-200 transition-colors duration-200">
        <span className="text-xs text-gray-500 group-hover:text-blue-600 transition-colors duration-200">
          Klikněte pro spuštění
        </span>
        <div className="flex items-center space-x-1 text-blue-600 group-hover:text-blue-700 transition-colors duration-200">
          <span className="text-sm font-medium">Spustit</span>
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
        </div>
      </div>
    </Card>
  );
};

export default AssistantCard; 