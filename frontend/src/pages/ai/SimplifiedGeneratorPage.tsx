import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useToast } from '../../contexts/ToastContext';
import { AssignmentAnalysisService } from '../../services/assignmentAnalysisService';
import { AssignmentAnalysis, MaterialTypeSuggestion } from '../../types/MaterialTypes';
import { getSubtypesForMaterial } from '../../data/materialSubtypes';
import MaterialGenerationHelp from '../../components/materials/MaterialGenerationHelp';

import { streamingService } from '../../services/streamingService';
import { 
  BookOpen, FileText, Target, Sparkles, Presentation, Users,
  Zap, Eye, ArrowRight, Clock, CheckCircle, Lightbulb,
  Brain, Search, Star, Info, Settings
} from 'lucide-react';
import { MaterialType } from '../../types/MaterialTypes';

interface ActivityPreview {
  id: string;
  title: string;
  description: string;
  goals: string[];
  duration: string;
  materials: string[];
  steps: string[];
  approved: boolean;
}

interface GenerationRequest {
  topic: string;
  activityType: 'lesson' | 'worksheet' | 'quiz' | 'project' | 'presentation' | 'activity';
  gradeLevel: string;
  subject?: string;
  duration: string;
  // Quiz-specific fields
  questionCount?: number;
  questionTypes?: string[];
  timeLimit?: string;
  // Worksheet-specific fields
  worksheetDifficulty?: 'easy' | 'medium' | 'hard' | string;
  estimatedTime?: string;
  // Lesson-specific fields
  lessonDifficulty?: 'easy' | 'medium' | 'hard' | string;
  lessonDuration?: string;
  // Presentation-specific fields
  slideCount?: number;
  presentationDifficulty?: 'easy' | 'medium' | 'hard' | string;
  // Project-specific fields
  projectDifficulty?: 'easy' | 'medium' | 'hard' | string;
  projectDuration?: string;
  // Activity-specific fields
  groupSize?: string;
  activityDuration?: string;
  // Common fields
  learningObjectives?: string;
  materials?: string;
  instructions?: string;
  activities?: string;
  keyPoints?: string;
  visualElements?: string[];
  projectSteps?: string;
  qualityLevel?: 'basic' | 'standard' | 'high';
  customInstructions?: string;
  specialRequirements?: string[];
}

const SimplifiedGeneratorPage: React.FC = () => {

  const { showToast } = useToast();
  const navigate = useNavigate();

  // Form state
  const [request, setRequest] = useState<GenerationRequest>({
    topic: '',
    activityType: 'lesson',
    gradeLevel: '',
    duration: '45 min',
    // Quiz defaults
    questionCount: 10,
    questionTypes: ['multiple_choice', 'true_false'],
    timeLimit: '20 min'
  });

  // Assignment analysis state
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [assignmentAnalysis, setAssignmentAnalysis] = useState<AssignmentAnalysis | null>(null);
  const [materialSuggestions, setMaterialSuggestions] = useState<MaterialTypeSuggestion[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisConfidence, setAnalysisConfidence] = useState(0);

  // Subtype selection state
  const [selectedSubtypes, setSelectedSubtypes] = useState<Record<string, any>>({});

  // Advanced help state
  const [showAdvancedHelp, setShowAdvancedHelp] = useState(false);

  // Update duration when activity type changes
  useEffect(() => {
    const defaultDuration = getDurationOptions(request.activityType)[0];
    setRequest(prev => ({ ...prev, duration: defaultDuration }));
  }, [request.activityType]);

  // UI state
  const [currentStep, setCurrentStep] = useState<'input' | 'preview' | 'generating' | 'complete'>('input');
  const [activityPreview, setActivityPreview] = useState<ActivityPreview | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [streamContent, setStreamContent] = useState('');


  // Load saved preferences
  useEffect(() => {
    const saved = localStorage.getItem('eduai.generator.preferences');
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        setRequest(prev => ({ ...prev, ...prefs }));
      } catch (error) {
        console.warn('Failed to parse saved preferences:', error);
      }
    }
  }, []);

  // Save preferences
  useEffect(() => {
    const prefs = {
      gradeLevel: request.gradeLevel,
      duration: request.duration
    };
    localStorage.setItem('eduai.generator.preferences', JSON.stringify(prefs));
  }, [request.gradeLevel, request.duration]);

  // Assignment analysis functions
  const analyzeAssignment = async () => {
    if (!assignmentDescription.trim()) {
      showToast({ type: 'error', message: 'Prosím zadejte popis úkolu' });
      return;
    }

    setIsAnalyzing(true);
    try {
      const response = await AssignmentAnalysisService.analyzeAssignment(assignmentDescription);
      setAssignmentAnalysis(response.analysis);
      setMaterialSuggestions(response.suggestions);
      setAnalysisConfidence(response.analysis.confidence);
      
      // Auto-populate form fields from analysis
      if (response.analysis.suggestedMaterialTypes.length > 0) {
        const suggestedType = response.analysis.suggestedMaterialTypes[0];
        const typeMapping: Record<string, string> = {
          'worksheet': 'worksheet',
          'quiz': 'quiz',
          'lesson-plan': 'lesson',
          'project': 'project',
          'presentation': 'presentation',
          'activity': 'activity'
        };
        
        if (typeMapping[suggestedType]) {
          handleInputChange('activityType', typeMapping[suggestedType]);
        }
      }
      
      if (response.analysis.detectedDifficulty) {
        const difficultyMapping: Record<string, string> = {
          'Začátečník': 'easy',
          'Snadné': 'easy',
          'Střední': 'medium',
          'Těžké': 'hard',
          'Pokročilé': 'hard'
        };
        
        const difficulty = difficultyMapping[response.analysis.detectedDifficulty] || 'medium';
        handleInputChange('lessonDifficulty', difficulty);
        handleInputChange('worksheetDifficulty', difficulty);
        handleInputChange('projectDifficulty', difficulty);
        handleInputChange('presentationDifficulty', difficulty);
      }
      
      if (response.analysis.estimatedDuration) {
        handleInputChange('duration', response.analysis.estimatedDuration);
      }
      
      showToast({ type: 'success', message: 'Analýza úkolu dokončena!' });
    } catch (error) {
      console.error('Assignment analysis error:', error);
      showToast({ type: 'error', message: 'Nepodařilo se analyzovat úkol. Zkuste to prosím znovu.' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const quickAnalyze = () => {
    // Fallback analysis using local methods
    const analysis: AssignmentAnalysis = {
      suggestedMaterialTypes: ['worksheet', 'quiz'],
      extractedObjectives: AssignmentAnalysisService.extractLearningObjectives(assignmentDescription),
      detectedDifficulty: AssignmentAnalysisService.detectDifficulty(assignmentDescription),
      subjectArea: AssignmentAnalysisService.detectSubjectArea(assignmentDescription),
      estimatedDuration: AssignmentAnalysisService.estimateDuration(assignmentDescription),
      keyTopics: assignmentDescription.split(' ').filter(word => word.length > 4).slice(0, 5),
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

    setAssignmentAnalysis(analysis);
    setMaterialSuggestions(suggestions);
    setAnalysisConfidence(0.7);
    showToast({ type: 'success', message: 'Rychlá analýza dokončena!' });
  };

  const activityTypes = [
    { 
      id: 'lesson', 
      name: 'Plán hodiny', 
      icon: BookOpen, 
      description: 'Kompletní plán vyučovací hodiny s aktivitami'
    },
    { 
      id: 'worksheet', 
      name: 'Pracovní list', 
      icon: FileText, 
      description: 'Cvičení a úkoly pro studenty'
    },
    { 
      id: 'quiz', 
      name: 'Kvíz', 
      icon: Target, 
      description: 'Otázky k ověření znalostí'
    },
    { 
      id: 'project', 
      name: 'Projekt', 
      icon: Sparkles, 
      description: 'Dlouhodobé projektové zadání'
    },
    { 
      id: 'presentation', 
      name: 'Prezentace', 
      icon: Presentation, 
      description: 'Osnova pro prezentaci tématu'
    },
    { 
      id: 'activity', 
      name: 'Aktivita', 
      icon: Users, 
      description: 'Krátká interaktivní aktivita'
    }
  ];

  const gradeOptions = [
    '1. třída ZŠ', '2. třída ZŠ', '3. třída ZŠ', '4. třída ZŠ', '5. třída ZŠ',
    '6. třída ZŠ', '7. třída ZŠ', '8. třída ZŠ', '9. třída ZŠ',
    '1. ročník SŠ', '2. ročník SŠ', '3. ročník SŠ', '4. ročník SŠ'
  ];

  // Duration options for different material types
  const getDurationOptions = (activityType: string) => {
    switch (activityType) {
      case 'quiz':
        return ['10 min', '15 min', '20 min', '30 min', '45 min'];
      case 'worksheet':
        return ['15 min', '20 min', '30 min', '45 min', '60 min'];
      case 'project':
        return ['1 hodina', '2 hodiny', '3 hodiny', '4 hodiny', 'Celý den'];
      case 'presentation':
        return ['15 min', '20 min', '30 min', '45 min', '60 min'];
      case 'activity':
        return ['10 min', '15 min', '20 min', '30 min', '45 min'];
      default: // lesson plan
        return ['15 min', '30 min', '45 min', '60 min', '90 min'];
    }
  };

  // Get subtypes for material type
  const getSubtypesForCurrentType = () => {
    const materialType = getMaterialTypeFromActivityType(request.activityType);
    return materialType ? getSubtypesForMaterial(materialType) : [];
  };

  // Convert GenerationRequest activity type to MaterialType
  const getMaterialTypeFromActivityType = (activityType: string): MaterialType | null => {
    const typeMapping: Record<string, MaterialType> = {
      'worksheet': 'worksheet',
      'quiz': 'quiz',
      'lesson': 'lesson-plan',
      'project': 'project',
      'presentation': 'presentation',
      'activity': 'activity'
    };
    
    return typeMapping[activityType] || null;
  };

  // Handle subtype selection
  const handleSubtypeSelect = (subtypeId: string, subtype: any) => {
    setSelectedSubtypes(prev => ({
      ...prev,
      [request.activityType]: { id: subtypeId, ...subtype }
    }));
  };

  // Quiz-specific options
  const questionTypeOptions = [
    { value: 'multiple_choice', label: 'Výběr z možností' },
    { value: 'true_false', label: 'Pravda/Nepravda' },
    { value: 'fill_blank', label: 'Doplňování' },
    { value: 'matching', label: 'Přiřazování' },
    { value: 'short_answer', label: 'Krátká odpověď' },
    { value: 'essay', label: 'Esej' }
  ];

  const timeLimitOptions = ['10 min', '15 min', '20 min', '30 min', '45 min', '60 min'];

  const canGenerate = request.topic.trim().length >= 3 && request.gradeLevel;

  const handleInputChange = (field: keyof GenerationRequest, value: any) => {
    setRequest(prev => ({ ...prev, [field]: value }));
  };

  const renderDynamicFields = () => {
    const subtypes = getSubtypesForCurrentType();
    const currentSubtype = selectedSubtypes[request.activityType];

    return (
      <>
        {/* Subtype Selection */}
        {subtypes.length > 0 && (
          <Card className="bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-4 h-4 text-indigo-500" />
              <h3 className="font-medium text-indigo-900 dark:text-indigo-100">Vyberte specifický typ</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {subtypes.map((subtype) => {
                const isSelected = currentSubtype?.id === subtype.id;
                const currentMaterialType = getMaterialTypeFromActivityType(request.activityType);
                const isRecommended = currentMaterialType && assignmentAnalysis?.suggestedMaterialTypes.includes(currentMaterialType);
                
                return (
                  <div
                    key={subtype.id}
                    className={`relative p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                        : 'border-indigo-200 dark:border-indigo-700 hover:border-indigo-300 dark:hover:border-indigo-600'
                    }`}
                    onClick={() => handleSubtypeSelect(subtype.id, subtype)}
                  >
                    {/* Recommended Badge */}
                    {isRecommended && (
                      <div className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full flex items-center gap-1">
                        <Star className="w-3 h-3" />
                      </div>
                    )}

                    {/* Selection Indicator */}
                    {isSelected && (
                      <div className="absolute top-1 right-1 w-4 h-4 bg-indigo-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-3 h-3 text-white" />
                      </div>
                    )}

                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">{subtype.name}</h4>
                      <p className="text-xs opacity-80">{subtype.description}</p>
                      
                      {subtype.specialFields.length > 0 && (
                        <div className="text-xs opacity-70">
                          <span className="font-medium">Speciální možnosti:</span>
                          <ul className="list-disc list-inside mt-1 ml-2">
                            {subtype.specialFields.slice(0, 2).map((field) => (
                              <li key={field.name}>{field.label}</li>
                            ))}
                            {subtype.specialFields.length > 2 && <li>a další...</li>}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Selected Subtype Details */}
            {currentSubtype && (
              <div className="mt-4 p-3 bg-white dark:bg-indigo-900 rounded-lg border border-indigo-200 dark:border-indigo-700">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="font-medium text-indigo-900 dark:text-indigo-100">
                      Vybrán: {currentSubtype.name}
                    </h4>
                    <p className="text-sm text-indigo-700 dark:text-indigo-300 mt-1">
                      {currentSubtype.description}
                    </p>
                    {currentSubtype.promptModifications.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs font-medium text-indigo-800 dark:text-indigo-200 mb-1">
                          Toto ovlivní generování:
                        </p>
                        <ul className="text-xs text-indigo-700 dark:text-indigo-300 list-disc list-inside space-y-0.5">
                          {currentSubtype.promptModifications.slice(0, 2).map((modification: string, index: number) => (
                            <li key={index}>{modification}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Existing Dynamic Fields */}
        {(() => {
          switch (request.activityType) {
            case 'quiz':
              return (
                <Card className="bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Target className="w-4 h-4 text-purple-500" />
                    <h3 className="font-medium text-purple-900 dark:text-purple-100">Nastavení kvízu</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                        Počet otázek
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="50"
                        value={request.questionCount}
                        onChange={(e) => handleInputChange('questionCount', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-purple-300 dark:border-purple-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-purple-900 text-purple-900 dark:text-purple-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                        Časový limit
                      </label>
                      <select
                        value={request.timeLimit}
                        onChange={(e) => handleInputChange('timeLimit', e.target.value)}
                        className="w-full px-3 py-2 border border-purple-300 dark:border-purple-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-purple-900 text-purple-900 dark:text-purple-100"
                      >
                        {timeLimitOptions.map(option => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-purple-700 dark:text-purple-300 mb-2">
                        Typy otázek
                      </label>
                      <div className="relative">
                        <select
                          multiple
                          value={request.questionTypes}
                          onChange={(e) => {
                            const selected = Array.from(e.target.selectedOptions, option => option.value);
                            handleInputChange('questionTypes', selected);
                          }}
                          className="w-full px-3 py-2 border border-purple-300 dark:border-purple-600 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-purple-900 text-purple-900 dark:text-purple-100 min-h-[120px]"
                          size={4}
                        >
                          {questionTypeOptions.map(option => (
                            <option 
                              key={option.value} 
                              value={option.value}
                              className="py-1 px-2 hover:bg-purple-100 dark:hover:bg-purple-800"
                            >
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {request.questionTypes?.map(type => {
                            const option = questionTypeOptions.find(opt => opt.value === type);
                            return option ? (
                              <span 
                                key={type}
                                className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-purple-100 dark:bg-purple-800 text-purple-700 dark:text-purple-300 rounded-full"
                              >
                                {option.label}
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newTypes = request.questionTypes?.filter(t => t !== type) || [];
                                    handleInputChange('questionTypes', newTypes);
                                  }}
                                  className="ml-1 text-purple-500 hover:text-purple-700 dark:hover:text-purple-100"
                                >
                                  ×
                                </button>
                              </span>
                            ) : null;
                          })}
                        </div>
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
                          Držte Ctrl (Cmd na Mac) pro výběr více
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Additional Quiz Settings */}
                  <div className="mt-4 space-y-4">
                    {/* Removed Výukové cíle - AI will generate this automatically */}
                  </div>
                </Card>
              );

            case 'worksheet':
              return (
                <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="w-4 h-4 text-blue-500" />
                    <h3 className="font-medium text-blue-900 dark:text-blue-100">Nastavení pracovního listu</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                        Obtížnost
                      </label>
                      <select
                        value={request.worksheetDifficulty || 'medium'}
                        onChange={(e) => handleInputChange('worksheetDifficulty', e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                      >
                        <option value="easy">Snadná</option>
                        <option value="medium">Střední</option>
                        <option value="hard">Náročná</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                        Počet otázek
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="50"
                        value={request.questionCount}
                        onChange={(e) => handleInputChange('questionCount', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-blue-700 dark:text-blue-300 mb-2">
                        Odhadovaný čas
                      </label>
                      <select
                        value={request.estimatedTime || '15-30 min'}
                        onChange={(e) => handleInputChange('estimatedTime', e.target.value)}
                        className="w-full px-3 py-2 border border-blue-300 dark:border-blue-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                      >
                        <option value="5-10 min">5-10 min</option>
                        <option value="10-15 min">10-15 min</option>
                        <option value="15-30 min">15-30 min</option>
                        <option value="30-45 min">30-45 min</option>
                        <option value="45-60 min">45-60 min</option>
                        <option value="60+ min">60+ min</option>
                      </select>
                    </div>
                  </div>

                  {/* Additional Worksheet Settings */}
                  <div className="mt-4 space-y-4">
                    {/* Removed Výukové cíle - AI will generate this automatically */}
                    {/* Removed Instrukce pro studenty - AI will generate this automatically */}
                  </div>
                </Card>
              );

            case 'lesson':
              return (
                <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2 mb-4">
                    <BookOpen className="w-4 h-4 text-green-600" />
                    <h3 className="font-medium text-green-900 dark:text-green-100">Nastavení hodiny</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                        Obtížnost
                      </label>
                      <select
                        value={request.lessonDifficulty || 'medium'}
                        onChange={(e) => handleInputChange('lessonDifficulty', e.target.value)}
                        className="w-full px-3 py-2 border border-green-300 dark:border-green-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-green-900 text-green-900 dark:text-green-100"
                      >
                        <option value="easy">Snadná</option>
                        <option value="medium">Střední</option>
                        <option value="hard">Náročná</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                        Délka hodiny
                      </label>
                      <select
                        value={request.lessonDuration || '45 min'}
                        onChange={(e) => handleInputChange('lessonDuration', e.target.value)}
                        className="w-full px-3 py-2 border border-green-300 dark:border-green-600 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-green-900 text-green-900 dark:text-green-100"
                      >
                        <option value="30 min">30 min</option>
                        <option value="45 min">45 min</option>
                        <option value="60 min">60 min</option>
                        <option value="90 min">90 min</option>
                        <option value="120 min">120 min</option>
                        <option value="Celý den">Celý den</option>
                      </select>
                    </div>
                  </div>

                  {/* Additional Lesson Settings */}
                  <div className="mt-4 space-y-4">
                    {/* Removed Výukové cíle - AI will generate this automatically */}
                    {/* Removed Potřebné materiály - AI will generate this automatically */}
                    {/* Removed Aktivity hodiny - AI will generate this automatically */}
                  </div>
                </Card>
              );

            case 'presentation':
              return (
                <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Presentation className="w-4 h-4 text-red-600" />
                    <h3 className="font-medium text-red-900 dark:text-red-100">Nastavení prezentace</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                        Počet slidů
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={request.slideCount || 10}
                        onChange={(e) => handleInputChange('slideCount', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-red-300 dark:border-red-600 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-red-900 text-red-900 dark:text-red-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                        Obtížnost
                      </label>
                      <select
                        value={request.presentationDifficulty || 'medium'}
                        onChange={(e) => handleInputChange('presentationDifficulty', e.target.value)}
                        className="w-full px-3 py-2 border border-red-300 dark:border-red-600 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white dark:bg-red-900 text-red-900 dark:text-red-100"
                      >
                        <option value="easy">Snadná</option>
                        <option value="medium">Střední</option>
                        <option value="hard">Náročná</option>
                      </select>
                    </div>
                  </div>

                  {/* Additional Presentation Settings */}
                  <div className="mt-4 space-y-4">
                    {/* Removed Výukové cíle - AI will generate this automatically */}
                    {/* Removed Klíčové body - AI will generate this automatically */}
                    <div>
                      <label className="block text-sm font-medium text-red-700 dark:text-red-300 mb-2">
                        Vizuální prvky
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        {['Obrázky', 'Grafy', 'Diagramy', 'Videa', 'Animace', 'Interaktivní prvky'].map(option => (
                          <label key={option} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={Array.isArray(request.visualElements) && request.visualElements.includes(option)}
                              onChange={(e) => {
                                const currentValues = Array.isArray(request.visualElements) ? request.visualElements : [];
                                if (e.target.checked) {
                                  handleInputChange('visualElements', [...currentValues, option]);
                                } else {
                                  handleInputChange('visualElements', currentValues.filter(v => v !== option));
                                }
                              }}
                              className="rounded border-red-300 text-red-600 focus:ring-red-500"
                            />
                            <span className="text-sm text-red-700 dark:text-red-300">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              );

            case 'project':
              return (
                <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-orange-600" />
                    <h3 className="font-medium text-orange-900 dark:text-orange-100">Nastavení projektu</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                        Obtížnost
                      </label>
                      <select
                        value={request.projectDifficulty || 'medium'}
                        onChange={(e) => handleInputChange('projectDifficulty', e.target.value)}
                        className="w-full px-3 py-2 border border-orange-300 dark:border-orange-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-orange-900 text-orange-900 dark:text-orange-100"
                      >
                        <option value="easy">Snadná</option>
                        <option value="medium">Střední</option>
                        <option value="hard">Náročná</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-orange-700 dark:text-orange-300 mb-2">
                        Délka projektu
                      </label>
                      <select
                        value={request.projectDuration || '1 týden'}
                        onChange={(e) => handleInputChange('projectDuration', e.target.value)}
                        className="w-full px-3 py-2 border border-orange-300 dark:border-orange-600 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-orange-900 text-orange-900 dark:text-orange-100"
                      >
                        <option value="1-2 dny">1-2 dny</option>
                        <option value="1 týden">1 týden</option>
                        <option value="2 týdny">2 týdny</option>
                        <option value="1 měsíc">1 měsíc</option>
                        <option value="Semestr">Semestr</option>
                      </select>
                    </div>
                  </div>

                  {/* Additional Project Settings */}
                  <div className="mt-4 space-y-4">
                    {/* Removed Výukové cíle - AI will generate this automatically */}
                    {/* Removed Potřebné materiály - AI will generate this automatically */}
                    {/* Removed Kroky projektu - AI will generate this automatically */}
                  </div>
                </Card>
              );

            case 'activity':
              return (
                <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Users className="w-4 h-4 text-yellow-600" />
                    <h3 className="font-medium text-yellow-900 dark:text-yellow-100">Nastavení aktivity</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">
                        Velikost skupiny
                      </label>
                      <select
                        value={request.groupSize || 'Individuální'}
                        onChange={(e) => handleInputChange('groupSize', e.target.value)}
                        className="w-full px-3 py-2 border border-yellow-300 dark:border-yellow-600 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100"
                      >
                        <option value="Individuální">Individuální</option>
                        <option value="Dvojice">Dvojice</option>
                        <option value="Malé skupiny (3-4)">Malé skupiny (3-4)</option>
                        <option value="Velké skupiny (5-8)">Velké skupiny (5-8)</option>
                        <option value="Celá třída">Celá třída</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-yellow-700 dark:text-yellow-300 mb-2">
                        Délka aktivity
                      </label>
                      <select
                        value={request.activityDuration || '20-30 min'}
                        onChange={(e) => handleInputChange('activityDuration', e.target.value)}
                        className="w-full px-3 py-2 border border-yellow-300 dark:border-yellow-600 rounded-md focus:ring-2 focus:ring-yellow-500 focus:border-transparent bg-white dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100"
                      >
                        <option value="10-15 min">10-15 min</option>
                        <option value="15-20 min">15-20 min</option>
                        <option value="20-30 min">20-30 min</option>
                        <option value="30-45 min">30-45 min</option>
                        <option value="45-60 min">45-60 min</option>
                      </select>
                    </div>
                  </div>

                  {/* Additional Activity Settings */}
                  <div className="mt-4 space-y-4">
                    {/* Removed Výukové cíle - AI will generate this automatically */}
                    {/* Removed Potřebné materiály - AI will generate this automatically */}
                    {/* Removed Instrukce k aktivitě - AI will generate this automatically */}
                  </div>
                </Card>
              );

            default:
              return null;
          }
        })()}
      </>
    );
  };

  const generateActivityPreview = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    setCurrentStep('preview');
    
    try {
      // Vytvoříme skutečný náhled na základě zadaných parametrů
      const activityType = activityTypes.find(t => t.id === request.activityType);
      const selectedSubtype = selectedSubtypes[request.activityType];
      
      // Generujeme cíle na základě tématu a typu
      const goals = [
        `Žáci pochopí základní principy ${request.topic}`,
        `Žáci budou schopni aplikovat znalosti o ${request.topic}`,
        `Žáci rozvinou dovednosti potřebné pro práci s ${request.topic}`
      ];

      // Generujeme kroky na základě typu aktivity
      let steps: string[] = [];
      switch (request.activityType) {
        case 'lesson':
          steps = [
            'Úvod a motivace (5 min)',
            'Výklad nové látky (20 min)',
            'Procvičování a aktivity (15 min)',
            'Shrnutí a závěr (5 min)'
          ];
          break;
        case 'worksheet':
          steps = [
            'Seznámení s úkoly (3 min)',
            'Samostatná práce žáků (25 min)',
            'Kontrola a oprava (12 min)',
            'Reflexe a shrnutí (5 min)'
          ];
          break;
        case 'quiz':
          steps = [
            'Instrukce k testu (3 min)',
            'Vypracování testu (15 min)',
            'Kontrola odpovědí (7 min)',
            'Vysvětlení správných řešení (5 min)'
          ];
          break;
        case 'activity':
          steps = [
            'Představení aktivity (5 min)',
            'Vykonání aktivity (20 min)',
            'Prezentace výsledků (10 min)',
            'Reflexe a diskuse (10 min)'
          ];
          break;
        default:
          steps = [
            'Příprava a úvod (10 min)',
            'Hlavní část (25 min)',
            'Závěr a reflexe (10 min)'
          ];
      }

      // Generujeme materiály na základě typu
      const materials = [
        'Tabule nebo projektor',
        'Pracovní listy nebo sešity',
        'Psací potřeby',
        request.activityType === 'activity' ? 'Pomůcky pro aktivitu' : '',
        request.activityType === 'quiz' ? 'Testovací formuláře' : ''
      ].filter(Boolean);

      const preview: ActivityPreview = {
        id: Date.now().toString(),
        title: `${request.topic} - ${request.gradeLevel}`,
        description: `${activityType?.description || 'Aktivita'} zaměřená na téma "${request.topic}" pro ${request.gradeLevel}.${selectedSubtype ? ` Typ: ${selectedSubtype.name}` : ''}`,
        goals,
        duration: request.duration,
        materials,
        steps,
        approved: false
      };

      setActivityPreview(preview);
    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při generování náhledu aktivity' });
      setCurrentStep('input');
    } finally {
      setIsGenerating(false);
    }
  };

  const approveAndGenerate = async () => {
    if (!activityPreview) return;

    setCurrentStep('generating');
    setIsGenerating(true);
    setGenerationProgress(0);
    setStreamContent('');

    try {
      const files: string[] = [];
      
      // Generate main material based on activity type
      switch (request.activityType) {
        case 'quiz':
          await streamingService.generateQuizStream({
            title: request.topic,
            subject: request.topic,
            grade_level: request.gradeLevel,
            question_count: request.questionCount,
            time_limit: request.timeLimit,
            prompt_hint: `Typy otázek: ${request.questionTypes?.map(type => 
              questionTypeOptions.find(opt => opt.value === type)?.label
            ).join(', ')}`
          }, {
            onStart: () => {
              setStreamContent('Generuji kvíz...\n');
              setGenerationProgress(20);
            },
            onChunk: (chunk) => setStreamContent(prev => prev + chunk),
            onEnd: (meta) => {
              if (meta.file_id) files.push(meta.file_id);
              setGenerationProgress(60);
            },
            onError: (error) => showToast({ type: 'error', message: error })
          });
          break;

        case 'worksheet':
          await streamingService.generateWorksheetStream(request.topic, {
            onStart: () => {
              setStreamContent('Generuji pracovní list...\n');
              setGenerationProgress(20);
            },
            onChunk: (chunk) => setStreamContent(prev => prev + chunk),
            onEnd: (meta) => {
              if (meta.file_id) files.push(meta.file_id);
              setGenerationProgress(60);
            },
            onError: (error) => showToast({ type: 'error', message: error })
          }, { 
            question_count: request.questionCount, 
            difficulty: request.worksheetDifficulty, 
            teaching_style: 'interactive' 
          });
          break;

        case 'lesson':
          await streamingService.generateLessonPlanStream({
            title: request.topic,
            subject: request.topic,
            grade_level: request.gradeLevel
          }, {
            onStart: () => {
              setStreamContent('Generuji plán hodiny...\n');
              setGenerationProgress(20);
            },
            onChunk: (chunk) => setStreamContent(prev => prev + chunk),
            onEnd: (meta) => {
              if (meta.file_id) files.push(meta.file_id);
              setGenerationProgress(60);
            },
            onError: (error) => showToast({ type: 'error', message: error })
          });
          break;

        case 'project':
          await streamingService.generateProjectStream({
            title: request.topic,
            subject: request.topic,
            grade_level: request.gradeLevel
          }, {
            onStart: () => {
              setStreamContent('Generuji projekt...\n');
              setGenerationProgress(20);
            },
            onChunk: (chunk) => setStreamContent(prev => prev + chunk),
            onEnd: (meta) => {
              if (meta.file_id) files.push(meta.file_id);
              setGenerationProgress(60);
            },
            onError: (error) => showToast({ type: 'error', message: error })
          });
          break;

        case 'presentation':
          await streamingService.generatePresentationStream({
            title: request.topic,
            subject: request.topic,
            grade_level: request.gradeLevel,
            slide_count: request.slideCount || 10
          }, {
            onStart: () => {
              setStreamContent('Generuji prezentaci...\n');
              setGenerationProgress(20);
            },
            onChunk: (chunk) => setStreamContent(prev => prev + chunk),
            onEnd: (meta) => {
              if (meta.file_id) files.push(meta.file_id);
              setGenerationProgress(60);
            },
            onError: (error) => showToast({ type: 'error', message: error })
          });
          break;

        case 'activity':
          await streamingService.generateActivityStream({
            title: request.topic,
            subject: request.topic,
            grade_level: request.gradeLevel,
            activity_type: 'interactive',
            group_size: 1
          }, {
            onStart: () => {
              setStreamContent('Generuji aktivitu...\n');
              setGenerationProgress(20);
            },
            onChunk: (chunk) => setStreamContent(prev => prev + chunk),
            onEnd: (meta) => {
              if (meta.file_id) files.push(meta.file_id);
              setGenerationProgress(60);
            },
            onError: (error) => showToast({ type: 'error', message: error })
          });
          break;

        default:
          setStreamContent('Generuji materiál...\n');
          setGenerationProgress(40);
          break;
      }

      setCurrentStep('complete');
      setGenerationProgress(100);
      
      showToast({ 
        type: 'success', 
        message: `Aktivita byla úspěšně vygenerována! Vytvořeno ${files.length} souborů.` 
      });

    } catch (error) {
      console.error('Generation failed:', error);
      showToast({ type: 'error', message: 'Chyba při generování materiálů' });
      setCurrentStep('preview');
    } finally {
      setIsGenerating(false);
    }
  };

  const startOver = () => {
    setCurrentStep('input');
    setActivityPreview(null);
    setStreamContent('');
    setGenerationProgress(0);
  };



  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
            AI Generátor Materiálů
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-4">
            Jednoduše vytvořte kompletní výukové materiály v několika krocích
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${currentStep === 'input' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'input' ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950' : 'border-green-600 dark:border-green-400 bg-green-50 dark:bg-green-950'}`}>
                {currentStep !== 'input' ? <CheckCircle className="w-5 h-5" /> : '1'}
              </div>
              <span className="ml-2 font-medium">Zadání</span>
            </div>
            
            <ArrowRight className="w-4 h-4 text-neutral-400" />
            
            <div className={`flex items-center ${currentStep === 'preview' ? 'text-blue-600 dark:text-blue-400' : ['generating', 'complete'].includes(currentStep) ? 'text-green-600 dark:text-green-400' : 'text-neutral-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'preview' ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950' : ['generating', 'complete'].includes(currentStep) ? 'border-green-600 dark:border-green-400 bg-green-50 dark:bg-green-950' : 'border-neutral-300 dark:border-neutral-600'}`}>
                {['generating', 'complete'].includes(currentStep) ? <CheckCircle className="w-5 h-5" /> : '2'}
              </div>
              <span className="ml-2 font-medium">Náhled</span>
            </div>
            
            <ArrowRight className="w-4 h-4 text-neutral-400" />
            
            <div className={`flex items-center ${currentStep === 'generating' ? 'text-blue-600 dark:text-blue-400' : currentStep === 'complete' ? 'text-green-600 dark:text-green-400' : 'text-neutral-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'generating' ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950' : currentStep === 'complete' ? 'border-green-600 dark:border-green-400 bg-green-50 dark:bg-green-950' : 'border-neutral-300 dark:border-neutral-600'}`}>
                {currentStep === 'complete' ? <CheckCircle className="w-5 h-5" /> : '3'}
              </div>
              <span className="ml-2 font-medium">Generování</span>
            </div>
          </div>
        </div>

        {/* Step 1: Input Form */}
        {currentStep === 'input' && (
          <div className="space-y-6">
            <Card>
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-yellow-500" />
                Co chcete vyučovat?
              </h2>
              
              <div className="space-y-6">
                {/* Topic */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Téma hodiny *
                  </label>
                  <input
                    type="text"
                    value={request.topic}
                    onChange={(e) => handleInputChange('topic', e.target.value)}
                    placeholder="např. Kvadratické rovnice, Fotosyntéza, Druhá světová válka..."
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>

                {/* Assignment Description with AI Analysis */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    <Brain className="w-4 h-4 inline mr-2 text-blue-500" />
                    Popis úkolu (AI analýza)
                  </label>
                  <div className="space-y-3">
                    <textarea
                      value={assignmentDescription}
                      onChange={(e) => setAssignmentDescription(e.target.value)}
                      placeholder="Popište podrobně, co mají studenti dělat nebo co se mají naučit. AI vám pomůže vybrat nejvhodnější typ materiálu a nastavení..."
                      rows={4}
                      className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 resize-none"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={analyzeAssignment}
                        disabled={!assignmentDescription.trim() || isAnalyzing}
                        isLoading={isAnalyzing}
                        className="flex-1"
                      >
                        <Search className="w-4 h-4 mr-2" />
                        {isAnalyzing ? 'Analyzuji...' : 'Analyzovat úkol'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={quickAnalyze}
                        disabled={!assignmentDescription.trim() || isAnalyzing}
                        className="whitespace-nowrap"
                      >
                        Rychlá analýza
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Assignment Analysis Results */}
                {assignmentAnalysis && (
                  <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-green-900 dark:text-green-100">
                          Analýza úkolu dokončena
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm text-green-700 dark:text-green-300">
                              Spolehlivost: {Math.round(analysisConfidence * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <strong className="text-green-800 dark:text-green-200">Předmět:</strong>
                        <span className="ml-2 text-green-700 dark:text-green-300">{assignmentAnalysis.subjectArea}</span>
                      </div>
                      <div>
                        <strong className="text-green-800 dark:text-green-200">Obtížnost:</strong>
                        <span className="ml-2 text-green-700 dark:text-green-300">{assignmentAnalysis.detectedDifficulty}</span>
                      </div>
                      <div>
                        <strong className="text-green-800 dark:text-green-200">Odhadovaný čas:</strong>
                        <span className="ml-2 text-green-700 dark:text-green-300">{assignmentAnalysis.estimatedDuration}</span>
                      </div>
                      <div>
                        <strong className="text-green-800 dark:text-green-200">Doporučené typy:</strong>
                        <span className="ml-2 text-green-700 dark:text-green-300">
                          {assignmentAnalysis.suggestedMaterialTypes.join(', ')}
                        </span>
                      </div>
                    </div>

                    {assignmentAnalysis.extractedObjectives.length > 0 && (
                      <div className="mb-4">
                        <strong className="text-green-800 dark:text-green-200">Výukové cíle:</strong>
                        <ul className="mt-1 list-disc list-inside text-sm text-green-700 dark:text-green-300">
                          {assignmentAnalysis.extractedObjectives.map((objective, index) => (
                            <li key={index}>{objective}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {assignmentAnalysis.keyTopics.length > 0 && (
                      <div className="mb-4">
                        <strong className="text-green-800 dark:text-green-200">Klíčová témata:</strong>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {assignmentAnalysis.keyTopics.map((topic, index) => (
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

                    {/* Material Type Suggestions */}
                    {materialSuggestions.length > 0 && (
                      <div>
                        <strong className="text-green-800 dark:text-green-200">Doporučení AI:</strong>
                        <div className="mt-2 space-y-2">
                          {materialSuggestions.map((suggestion, index) => (
                            <div key={index} className="p-3 bg-white dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium text-green-800 dark:text-green-100">
                                  {suggestion.type === 'worksheet' && 'Pracovní list'}
                                  {suggestion.type === 'quiz' && 'Kvíz'}
                                  {suggestion.type === 'lesson-plan' && 'Plán hodiny'}
                                  {suggestion.type === 'project' && 'Projekt'}
                                  {suggestion.type === 'presentation' && 'Prezentace'}
                                  {suggestion.type === 'activity' && 'Aktivita'}
                                </span>
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 text-yellow-500" />
                                  <span className="text-sm text-green-700 dark:text-green-300">
                                    {Math.round((suggestion.confidence || 0) * 100)}%
                                  </span>
                                </div>
                              </div>
                              <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                                {suggestion.reasoning}
                              </p>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const typeMapping: Record<string, string> = {
                                    'worksheet': 'worksheet',
                                    'quiz': 'quiz',
                                    'lesson-plan': 'lesson',
                                    'project': 'project',
                                    'presentation': 'presentation',
                                    'activity': 'activity'
                                  };
                                  if (typeMapping[suggestion.type]) {
                                    handleInputChange('activityType', typeMapping[suggestion.type]);
                                  }
                                }}
                                className="text-xs"
                              >
                                Použít doporučení
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                )}

                {/* Activity Type */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Typ materiálu
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {activityTypes.map((type) => {
                      const IconComponent = type.icon;
                      const isSelected = request.activityType === type.id;
                      
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => handleInputChange('activityType', type.id)}
                          className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 shadow-lg scale-105'
                              : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600 hover:scale-102'
                          }`}
                        >
                          <IconComponent className={`w-6 h-6 mx-auto mb-2`} />
                          <div className="font-medium text-sm">{type.name}</div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            {type.description}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Basic Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Ročník *
                    </label>
                    <select
                      value={request.gradeLevel}
                      onChange={(e) => handleInputChange('gradeLevel', e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    >
                      <option value="">Vyberte ročník</option>
                      {gradeOptions.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Předmět
                    </label>
                    <select
                      value={request.subject || ''}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    >
                      <option value="">Vyberte předmět</option>
                      <option value="Matematika">Matematika</option>
                      <option value="Český jazyk">Český jazyk</option>
                      <option value="Anglický jazyk">Anglický jazyk</option>
                      <option value="Přírodověda">Přírodověda</option>
                      <option value="Vlastivěda">Vlastivěda</option>
                      <option value="Dějepis">Dějepis</option>
                      <option value="Zeměpis">Zeměpis</option>
                      <option value="Fyzika">Fyzika</option>
                      <option value="Chemie">Chemie</option>
                      <option value="Biologie">Biologie</option>
                      <option value="Výtvarná výchova">Výtvarná výchova</option>
                      <option value="Hudební výchova">Hudební výchova</option>
                      <option value="Tělesná výchova">Tělesná výchova</option>
                      <option value="Informatika">Informatika</option>
                      <option value="Občanská výchova">Občanská výchova</option>
                    </select>
                  </div>
                </div>

                {/* Help Section */}
                <MaterialGenerationHelp />

                {/* Dynamic Fields based on Activity Type */}
                {renderDynamicFields()}

                {/* Advanced Parameter Controls */}
                <Card className="bg-gray-50 dark:bg-gray-950 border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-4 h-4 text-gray-500" />
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Pokročilé nastavení</h3>
                    <div className="ml-auto">
                      <button
                        type="button"
                        onClick={() => setShowAdvancedHelp(!showAdvancedHelp)}
                        className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {showAdvancedHelp && (
                    <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">Jak funguje pokročilé nastavení?</h4>
                      <div className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                        <p><strong>Úroveň kvality:</strong></p>
                        <ul className="list-disc list-inside ml-2">
                          <li><strong>Základní:</strong> Rychlé generování, základní kvalita (vhodné pro rychlé náčrty)</li>
                          <li><strong>Standardní:</strong> Vyvážená kvalita a rychlost (doporučeno pro většinu materiálů)</li>
                          <li><strong>Vysoká:</strong> Nejlepší kvalita, pomalejší generování (pro důležité materiály)</li>
                        </ul>
                        <p><strong>Vlastní instrukce:</strong> Přidejte specifické požadavky pro AI (např. "Zahrň více praktických příkladů", "Použij jednoduchý jazyk pro mladší žáky")</p>
                        <p><strong>Speciální požadavky:</strong> Zaškrtněte prvky, které chcete v materiálu zahrnout</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Úroveň kvality
                      </label>
                      <select
                        value={request.qualityLevel || 'standard'}
                        onChange={(e) => handleInputChange('qualityLevel', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                      >
                        <option value="basic">Základní (rychlejší)</option>
                        <option value="standard">Standardní (vyvážené)</option>
                        <option value="high">Vysoká (nejlepší kvalita)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Vlastní instrukce
                      </label>
                      <textarea
                        value={request.customInstructions || ''}
                        onChange={(e) => handleInputChange('customInstructions', e.target.value)}
                        placeholder="Přidejte specifické požadavky nebo instrukce pro AI..."
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Speciální požadavky
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {['Interaktivní prvky', 'Vizuální podpora', 'Praktické příklady', 'Teoretické základy'].map(requirement => (
                        <label key={requirement} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={Array.isArray(request.specialRequirements) && request.specialRequirements.includes(requirement)}
                            onChange={(e) => {
                              const currentValues = Array.isArray(request.specialRequirements) ? request.specialRequirements : [];
                              if (e.target.checked) {
                                handleInputChange('specialRequirements', [...currentValues, requirement]);
                              } else {
                                handleInputChange('specialRequirements', currentValues.filter(v => v !== requirement));
                              }
                            }}
                            className="rounded border-gray-300 text-gray-600 focus:ring-gray-500"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{requirement}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Final Button */}
                <div className="flex justify-end mt-6">
                  <Button
                    onClick={generateActivityPreview}
                    disabled={!canGenerate || isGenerating}
                    isLoading={isGenerating}
                    className="px-8 py-3"
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Vytvořit náhled aktivity
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Step 2: Preview */}
        {currentStep === 'preview' && activityPreview && (
          <div className="space-y-6">
            <Card>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Eye className="w-5 h-5 text-blue-500" />
                  Náhled aktivity
                </h2>
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle className="w-4 h-4" />
                  Připraveno k vygenerování
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                    {activityPreview.title}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {activityPreview.description}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Cíle hodiny
                    </h4>
                    <ul className="space-y-2">
                      {activityPreview.goals.map((goal, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {goal}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Struktura hodiny ({activityPreview.duration})
                    </h4>
                    <ul className="space-y-2">
                      {activityPreview.steps.map((step, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                          <div className="w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 text-xs font-medium flex items-center justify-center mt-0.5 flex-shrink-0">
                            {index + 1}
                          </div>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              <div className="flex justify-between mt-6">
                <Button
                  variant="secondary"
                  onClick={startOver}
                >
                  Upravit zadání
                </Button>
                <Button
                  onClick={approveAndGenerate}
                  disabled={isGenerating}
                  isLoading={isGenerating}
                  className="px-8 py-3"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Schválit a vygenerovat
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Step 3: Generating */}
        {currentStep === 'generating' && (
          <div className="space-y-6">
            <Card>
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-2">Generuji materiály...</h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Prosím počkejte, AI vytváří vaše výukové materiály
                </p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Postup generování
                  </span>
                  <span className="text-sm text-neutral-500 dark:text-neutral-400">
                    {generationProgress}%
                  </span>
                </div>
                <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${generationProgress}%` }}
                  />
                </div>
              </div>

              {/* Stream Content */}
              <div className="bg-neutral-900 dark:bg-neutral-800 rounded-lg p-4 min-h-[300px]">
                <pre className="text-sm text-green-400 font-mono whitespace-pre-wrap overflow-auto">
                  {streamContent}
                  <span className="animate-pulse">█</span>
                </pre>
              </div>
            </Card>
          </div>
        )}

        {/* Step 4: Complete */}
        {currentStep === 'complete' && (
          <div className="space-y-6">
            <Card>
              <div className="text-center mb-6">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-green-600 dark:text-green-400 mb-2">
                  Materiály úspěšně vygenerovány!
                </h2>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Vaše výukové materiály jsou připraveny k použití
                </p>
              </div>

              <div className="flex flex-wrap gap-3 justify-center">
                <Button
                  onClick={() => navigate('/materials/my-materials')}
                  className="px-6 py-3"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Zobrazit materiály
                </Button>
                
                <Button
                  variant="outline"
                  onClick={startOver}
                  className="px-6 py-3"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Vytvořit další
                </Button>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
};

export default SimplifiedGeneratorPage;