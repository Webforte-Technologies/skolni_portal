import React from 'react';
import { Check, X, Star, ArrowRight, Lightbulb } from 'lucide-react';
import { MaterialTypeSuggestion, MaterialType } from '../../types/MaterialTypes';
import Button from '../ui/Button';

interface MaterialTypeSuggestionsProps {
  suggestions: MaterialTypeSuggestion[];
  onSuggestionAccept: (materialType: MaterialType, subtype?: string) => void;
  onSuggestionReject: () => void;
  className?: string;
}

const MATERIAL_TYPE_INFO = {
  worksheet: {
    name: 'Pracovní list',
    icon: '📝',
    color: 'from-blue-500 to-blue-600',
    description: 'Strukturovaná cvičení a úlohy'
  },
  quiz: {
    name: 'Kvíz',
    icon: '🎯',
    color: 'from-purple-500 to-purple-600',
    description: 'Hodnocení s otázkami a odpověďmi'
  },
  'lesson-plan': {
    name: 'Plán hodiny',
    icon: '📚',
    color: 'from-green-500 to-green-600',
    description: 'Komplexní plán výuky'
  },
  project: {
    name: 'Projekt',
    icon: '✨',
    color: 'from-orange-500 to-orange-600',
    description: 'Praktické a kreativní úkoly'
  },
  presentation: {
    name: 'Prezentace',
    icon: '🎤',
    color: 'from-red-500 to-red-600',
    description: 'Slidy a vizuální materiály'
  },
  activity: {
    name: 'Aktivita',
    icon: '👥',
    color: 'from-yellow-500 to-yellow-600',
    description: 'Interaktivní třídní aktivity'
  }
};

const MaterialTypeSuggestions: React.FC<MaterialTypeSuggestionsProps> = ({
  suggestions,
  onSuggestionAccept,
  onSuggestionReject,
  className = ''
}) => {
  if (suggestions.length === 0) {
    return null;
  }

  // Sort suggestions by confidence (highest first)
  const sortedSuggestions = [...suggestions].sort((a, b) => b.confidence - a.confidence);
  const topSuggestion = sortedSuggestions[0];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
          <Lightbulb className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
            AI doporučení materiálů
          </h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Na základě analýzy vašeho úkolu doporučujeme tyto materiály
          </p>
        </div>
      </div>

      {/* Top Suggestion (Highlighted) */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 bg-gradient-to-r ${MATERIAL_TYPE_INFO[topSuggestion.type as MaterialType].color} rounded-lg flex items-center justify-center text-white text-xl`}>
              {MATERIAL_TYPE_INFO[topSuggestion.type as MaterialType].icon}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                {MATERIAL_TYPE_INFO[topSuggestion.type as MaterialType].name}
              </h4>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                  Nejlepší volba
                </span>
              </div>
              <div className="px-2 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                {Math.round((topSuggestion.confidence || 0) * 100)}% shoda
              </div>
            </div>
            
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
              {topSuggestion.description}
            </p>
            
            <p className="text-sm text-neutral-700 dark:text-neutral-300 mb-3">
              <strong>Proč doporučujeme:</strong> {topSuggestion.reasoning}
            </p>
            
            {topSuggestion.recommendedSubtype && (
              <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                <strong>Doporučený typ:</strong> {topSuggestion.recommendedSubtype}
              </p>
            )}
            
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => onSuggestionAccept(topSuggestion.type as MaterialType, topSuggestion.recommendedSubtype)}
                className="flex items-center gap-1"
              >
                <Check className="w-4 h-4" />
                Použít toto doporučení
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Other Suggestions */}
      {sortedSuggestions.length > 1 && (
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
            Další možnosti:
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {sortedSuggestions.slice(1).map((suggestion, index) => (
              <div
                key={index}
                className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-neutral-300 dark:hover:border-neutral-600 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 bg-gradient-to-r ${MATERIAL_TYPE_INFO[suggestion.type as MaterialType].color} rounded-md flex items-center justify-center text-white text-sm`}>
                    {MATERIAL_TYPE_INFO[suggestion.type as MaterialType].icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h5 className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                        {MATERIAL_TYPE_INFO[suggestion.type as MaterialType].name}
                      </h5>
                      <span className="px-1.5 py-0.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-xs rounded">
                        {Math.round((suggestion.confidence || 0) * 100)}%
                      </span>
                    </div>
                    
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                      {suggestion.reasoning}
                    </p>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSuggestionAccept(suggestion.type as MaterialType, suggestion.recommendedSubtype)}
                      className="text-xs"
                    >
                      Vybrat
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-neutral-200 dark:border-neutral-700">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Nebo si vyberte materiál ručně níže
        </p>
        
        <Button
          variant="outline"
          size="sm"
          onClick={onSuggestionReject}
          className="flex items-center gap-1"
        >
          <X className="w-4 h-4" />
          Zavřít doporučení
        </Button>
      </div>

      {/* Confidence Explanation */}
      <div className="text-xs text-neutral-500 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 p-3 rounded-lg">
        <p className="font-medium mb-1">Jak funguje hodnocení shody:</p>
        <ul className="space-y-1 list-disc list-inside">
          <li><strong>90-100%:</strong> Velmi vysoká shoda s popisem úkolu</li>
          <li><strong>70-89%:</strong> Dobrá shoda, vhodné pro většinu případů</li>
          <li><strong>50-69%:</strong> Částečná shoda, zvažte další možnosti</li>
          <li><strong>Méně než 50%:</strong> Nízká shoda, doporučujeme jiný typ</li>
        </ul>
      </div>
    </div>
  );
};

export default MaterialTypeSuggestions;