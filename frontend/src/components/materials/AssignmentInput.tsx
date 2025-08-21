import React, { useState } from 'react';
import { Search, Lightbulb, AlertCircle, CheckCircle } from 'lucide-react';
import Button from '../ui/Button';
import { AssignmentAnalysis, MaterialTypeSuggestion } from '../../types/MaterialTypes';
import { AssignmentAnalysisService } from '../../services/assignmentAnalysisService';

interface AssignmentInputProps {
  onAnalysisComplete: (analysis: AssignmentAnalysis, suggestions: MaterialTypeSuggestion[]) => void;
  onAnalysisError: (error: string) => void;
  className?: string;
}

const AssignmentInput: React.FC<AssignmentInputProps> = ({
  onAnalysisComplete,
  onAnalysisError,
  className = ''
}) => {
  const [description, setDescription] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AssignmentAnalysis | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAnalyze = async () => {
    if (!description.trim()) {
      onAnalysisError('Prosím zadejte popis úkolu');
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await AssignmentAnalysisService.analyzeAssignment(description);
      setAnalysisResult(response.analysis);
      setShowSuggestions(true);
      onAnalysisComplete(response.analysis, response.suggestions);
    } catch (error) {
      console.error('Assignment analysis error:', error);
      onAnalysisError('Nepodařilo se analyzovat úkol. Zkuste to prosím znovu.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleQuickAnalyze = () => {
    // Fallback analysis using local methods when API is not available
    const analysis: AssignmentAnalysis = {
      suggestedMaterialTypes: ['worksheet', 'quiz'],
      extractedObjectives: AssignmentAnalysisService.extractLearningObjectives(description),
      detectedDifficulty: AssignmentAnalysisService.detectDifficulty(description),
      subjectArea: AssignmentAnalysisService.detectSubjectArea(description),
      estimatedDuration: AssignmentAnalysisService.estimateDuration(description),
      keyTopics: description.split(' ').filter(word => word.length > 4).slice(0, 5),
      confidence: 0.7
    };

    const suggestions: MaterialTypeSuggestion[] = [
      {
        type: 'worksheet',
        description: 'Vhodné pro procvičování a upevnění znalostí',
        estimatedCredits: 5,
        confidence: 0.8,
        priority: 1,
        reasoning: 'Vhodné pro procvičování a upevnění znalostí',
        recommendedSubtype: 'practice-problems'
      },
      {
        type: 'quiz',
        description: 'Dobré pro ověření porozumění',
        estimatedCredits: 3,
        confidence: 0.6,
        priority: 2,
        reasoning: 'Dobré pro ověření porozumění',
        recommendedSubtype: 'formative-assessment'
      }
    ];

    setAnalysisResult(analysis);
    setShowSuggestions(true);
    onAnalysisComplete(analysis, suggestions);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Assignment Description Input */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
          Popis úkolu nebo výukového cíle
          <span className="text-red-500 ml-1">*</span>
        </label>
        <div className="relative">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Popište, co mají studenti dělat nebo co se mají naučit. Například: 'Studenti si procvičí sčítání a odčítání do 100. Měli by zvládnout řešit slovní úlohy a pochopit vztah mezi sčítáním a odčítáním.'"
            rows={4}
            className="w-full px-3 py-2 pr-12 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:text-neutral-100 resize-none"
          />
          <div className="absolute top-2 right-2">
            <Lightbulb className="w-5 h-5 text-neutral-400" />
          </div>
        </div>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Tip: Čím podrobnější popis, tím lepší doporučení AI poskytne
        </p>
      </div>

      {/* Analysis Button */}
      <div className="flex gap-2">
        <Button
          onClick={handleAnalyze}
          disabled={!description.trim() || isAnalyzing}
          isLoading={isAnalyzing}
          className="flex-1"
        >
          <Search className="w-4 h-4 mr-2" />
          {isAnalyzing ? 'Analyzuji...' : 'Analyzovat úkol'}
        </Button>
        <Button
          variant="outline"
          onClick={handleQuickAnalyze}
          disabled={!description.trim() || isAnalyzing}
          className="whitespace-nowrap"
        >
          Rychlá analýza
        </Button>
      </div>

      {/* Analysis Results */}
      {analysisResult && showSuggestions && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start gap-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium text-green-800 dark:text-green-200">
                Analýza dokončena
              </h3>
              <p className="text-sm text-green-700 dark:text-green-300">
                Spolehlivost: {Math.round(analysisResult.confidence * 100)}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong className="text-green-800 dark:text-green-200">Předmět:</strong>
              <span className="ml-2 text-green-700 dark:text-green-300">{analysisResult.subjectArea}</span>
            </div>
            <div>
              <strong className="text-green-800 dark:text-green-200">Obtížnost:</strong>
              <span className="ml-2 text-green-700 dark:text-green-300">{analysisResult.detectedDifficulty}</span>
            </div>
            <div>
              <strong className="text-green-800 dark:text-green-200">Odhadovaný čas:</strong>
              <span className="ml-2 text-green-700 dark:text-green-300">{analysisResult.estimatedDuration}</span>
            </div>
            <div>
              <strong className="text-green-800 dark:text-green-200">Doporučené typy:</strong>
              <span className="ml-2 text-green-700 dark:text-green-300">
                {analysisResult.suggestedMaterialTypes.join(', ')}
              </span>
            </div>
          </div>

          {analysisResult.extractedObjectives.length > 0 && (
            <div className="mt-3">
              <strong className="text-green-800 dark:text-green-200">Výukové cíle:</strong>
              <ul className="mt-1 list-disc list-inside text-sm text-green-700 dark:text-green-300">
                {analysisResult.extractedObjectives.map((objective, index) => (
                  <li key={index}>{objective}</li>
                ))}
              </ul>
            </div>
          )}

          {analysisResult.keyTopics.length > 0 && (
            <div className="mt-3">
              <strong className="text-green-800 dark:text-green-200">Klíčová témata:</strong>
              <div className="mt-1 flex flex-wrap gap-1">
                {analysisResult.keyTopics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs rounded-full"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Help Text */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
        <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-700 dark:text-blue-300">
          <p className="font-medium mb-1">Jak napsat dobrý popis úkolu:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Uveďte, co se studenti mají naučit nebo procvičit</li>
            <li>Specifikujte předmět a ročník</li>
            <li>Popište typ aktivity (cvičení, test, projekt...)</li>
            <li>Uveďte časové omezení, pokud je relevantní</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AssignmentInput;