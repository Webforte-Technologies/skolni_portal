import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useToast } from '../../contexts/ToastContext';

import { streamingService } from '../../services/streamingService';
import { 
  BookOpen, FileText, Target, Sparkles, Presentation, Users,
  Zap, Eye, Download, ArrowRight, Clock, GraduationCap,
  CheckCircle, AlertCircle, Lightbulb, Settings, HelpCircle
} from 'lucide-react';

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
  studentCount: number;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  teachingStyle: 'interactive' | 'traditional' | 'project_based' | 'discovery';
  additionalNotes?: string;
  // Quiz-specific fields
  questionCount?: number;
  questionTypes?: string[];
  timeLimit?: string;
  // Worksheet-specific fields
  exerciseTypes?: string[];
  includeAnswers?: boolean;
  // Project-specific fields
  projectDuration?: string;
  groupSize?: number;
  deliverables?: string[];
  // Presentation-specific fields
  slideCount?: number;
  includeNotes?: boolean;
  // Activity-specific fields
  activityFormat?: string;
  equipment?: string[];
}

const SimplifiedGeneratorPage: React.FC = () => {

  const { showToast } = useToast();
  const navigate = useNavigate();

  // Form state
  const [request, setRequest] = useState<GenerationRequest>({
    topic: '',
    activityType: 'lesson',
    gradeLevel: '',
    studentCount: 25,
    duration: '45 min',
    difficulty: 'medium',
    teachingStyle: 'interactive',
    additionalNotes: '',
    // Quiz defaults
    questionCount: 10,
    questionTypes: ['multiple_choice', 'true_false'],
    timeLimit: '20 min',
    // Worksheet defaults
    exerciseTypes: ['fill_blank'],
    includeAnswers: true,
    // Project defaults
    projectDuration: '2 týdny',
    groupSize: 4,
    deliverables: ['prezentace', 'dokumentace'],
    // Presentation defaults
    slideCount: 15,
    includeNotes: true,
    // Activity defaults
    activityFormat: 'skupinová',
    equipment: ['papír', 'tužky']
  });

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
  const [generatedFiles, setGeneratedFiles] = useState<string[]>([]);

  // Load saved preferences
  useEffect(() => {
    const saved = localStorage.getItem('eduai.generator.preferences');
    if (saved) {
      try {
        const prefs = JSON.parse(saved);
        setRequest(prev => ({ ...prev, ...prefs }));
      } catch {}
    }
  }, []);

  // Save preferences
  useEffect(() => {
    const prefs = {
      gradeLevel: request.gradeLevel,
      studentCount: request.studentCount,
      duration: request.duration,
      difficulty: request.difficulty,
      teachingStyle: request.teachingStyle
    };
    localStorage.setItem('eduai.generator.preferences', JSON.stringify(prefs));
  }, [request.gradeLevel, request.studentCount, request.duration, request.difficulty, request.teachingStyle]);

  const activityTypes = [
    { 
      id: 'lesson', 
      name: 'Plán hodiny', 
      icon: BookOpen, 
      description: 'Kompletní plán vyučovací hodiny s aktivitami',
      color: 'blue'
    },
    { 
      id: 'worksheet', 
      name: 'Pracovní list', 
      icon: FileText, 
      description: 'Cvičení a úkoly pro studenty',
      color: 'green'
    },
    { 
      id: 'quiz', 
      name: 'Kvíz', 
      icon: Target, 
      description: 'Otázky k ověření znalostí',
      color: 'purple'
    },
    { 
      id: 'project', 
      name: 'Projekt', 
      icon: Sparkles, 
      description: 'Dlouhodobé projektové zadání',
      color: 'orange'
    },
    { 
      id: 'presentation', 
      name: 'Prezentace', 
      icon: Presentation, 
      description: 'Osnova pro prezentaci tématu',
      color: 'indigo'
    },
    { 
      id: 'activity', 
      name: 'Aktivita', 
      icon: Users, 
      description: 'Krátká interaktivní aktivita',
      color: 'pink'
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

  // Worksheet-specific options
  const exerciseTypeOptions = [
    { value: 'fill_blank', label: 'Doplňování' },
    { value: 'matching', label: 'Přiřazování' },
    { value: 'crossword', label: 'Křížovka' },
    { value: 'word_search', label: 'Hledání slov' },
    { value: 'calculation', label: 'Výpočty' },
    { value: 'analysis', label: 'Analýza' }
  ];

  // Project-specific options
  const projectDurationOptions = ['1 týden', '2 týdny', '3 týdny', '1 měsíc', '2 měsíce'];
  const deliverableOptions = [
    'prezentace', 'dokumentace', 'model', 'video', 'webová stránka', 
    'plakát', 'brožura', 'protokol', 'portfolio'
  ];

  // Presentation-specific options
  const slideCountOptions = [5, 10, 15, 20, 25, 30];

  // Activity-specific options
  const activityFormatOptions = [
    'individuální', 'skupinová', 'celotřídní', 'staničková', 'hromadná'
  ];

  const canGenerate = request.topic.trim().length >= 3 && request.gradeLevel;

  const handleInputChange = (field: keyof GenerationRequest, value: any) => {
    setRequest(prev => ({ ...prev, [field]: value }));
  };

  const renderDynamicFields = () => {
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
          </Card>
        );

      default:
        return null;
    }
  };

  const generateActivityPreview = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    setCurrentStep('preview');
    
    try {
      const preview: ActivityPreview = {
        id: Date.now().toString(),
        title: `${request.topic} - ${request.gradeLevel}`,
        description: `${activityTypes.find(t => t.id === request.activityType)?.description} zaměřená na téma "${request.topic}" pro ${request.gradeLevel}.`,
        goals: ['Cíl 1', 'Cíl 2', 'Cíl 3'],
        duration: request.duration,
        materials: ['Tabule/projektor', 'Pracovní materiály', 'Psací potřeby'],
        steps: ['Krok 1', 'Krok 2', 'Krok 3'],
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
    setGeneratedFiles([]);

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

        default:
          setStreamContent('Generuji materiál...\n');
          setGenerationProgress(40);
          break;
      }

      setGeneratedFiles(files);
      setCurrentStep('complete');
      setGenerationProgress(100);
      
      showToast({ 
        type: 'success', 
        message: `Aktivita byla úspěšně vygenerována! Vytvořeno ${files.length} souborů.` 
      });

    } catch (error) {
      showToast({ type: 'error', message: 'Chyba při generování materiálů' });
      setCurrentStep('preview');
    } finally {
      setIsGenerating(false);
    }
  };

  const startOver = () => {
    setCurrentStep('input');
    setActivityPreview(null);
    setGeneratedFiles([]);
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
                      Délka
                    </label>
                    <select
                      value={request.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    >
                      {getDurationOptions(request.activityType).map(duration => (
                        <option key={duration} value={duration}>{duration}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Dynamic Fields based on Activity Type */}
                {renderDynamicFields()}
              </div>

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