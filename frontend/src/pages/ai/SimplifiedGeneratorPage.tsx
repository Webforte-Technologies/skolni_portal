import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';
import { streamingService } from '../../services/streamingService';
import { 
  BookOpen, FileText, Target, Sparkles, Presentation, Users,
  Zap, Eye, Download, Share2, ArrowRight, Clock, GraduationCap,
  CheckCircle, AlertCircle, Lightbulb, Settings
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
}

const SimplifiedGeneratorPage: React.FC = () => {
  const { user } = useAuth();
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
    additionalNotes: ''
  });

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
    { id: 'lesson', name: 'Plán hodiny', icon: BookOpen, description: 'Kompletní plán vyučovací hodiny s aktivitami' },
    { id: 'worksheet', name: 'Pracovní list', icon: FileText, description: 'Cvičení a úkoly pro studenty' },
    { id: 'quiz', name: 'Kvíz', icon: Target, description: 'Otázky k ověření znalostí' },
    { id: 'project', name: 'Projekt', icon: Sparkles, description: 'Dlouhodobé projektové zadání' },
    { id: 'presentation', name: 'Prezentace', icon: Presentation, description: 'Osnova pro prezentaci tématu' },
    { id: 'activity', name: 'Aktivita', icon: Users, description: 'Krátká interaktivní aktivita' }
  ];

  const gradeOptions = [
    '1. třída ZŠ', '2. třída ZŠ', '3. třída ZŠ', '4. třída ZŠ', '5. třída ZŠ',
    '6. třída ZŠ', '7. třída ZŠ', '8. třída ZŠ', '9. třída ZŠ',
    '1. ročník SŠ', '2. ročník SŠ', '3. ročník SŠ', '4. ročník SŠ'
  ];

  const durationOptions = ['15 min', '30 min', '45 min', '60 min', '90 min'];

  const canGenerate = request.topic.trim().length >= 3 && request.gradeLevel;

  const handleInputChange = (field: keyof GenerationRequest, value: any) => {
    setRequest(prev => ({ ...prev, [field]: value }));
  };

  const generateActivityPreview = async () => {
    if (!canGenerate) return;

    setIsGenerating(true);
    setCurrentStep('preview');
    
    try {
      // Generate a quick preview of what will be created
      const preview: ActivityPreview = {
        id: Date.now().toString(),
        title: `${request.topic} - ${request.gradeLevel}`,
        description: `${activityTypes.find(t => t.id === request.activityType)?.description} zaměřená na téma "${request.topic}" pro ${request.gradeLevel}.`,
        goals: [
          `Studenti porozumí základním principům tématu ${request.topic}`,
          `Studenti dokážou prakticky aplikovat získané znalosti`,
          `Studenti si procvičí klíčové dovednosti související s tématem`
        ],
        duration: request.duration,
        materials: ['Tabule/projektor', 'Pracovní materiály', 'Psací potřeby'],
        steps: [
          'Úvod a motivace (5 min)',
          'Výklad nového učiva (15 min)',
          'Praktické cvičení (20 min)',
          'Shrnutí a reflexe (5 min)'
        ],
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
      
      // Generate main material
      if (request.activityType === 'lesson') {
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
      } else if (request.activityType === 'worksheet') {
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
        });
      }
      // Add other material types...

      // Generate supplementary materials
      setStreamContent(prev => prev + '\n\nGeneruji doplňkové materiály...\n');
      setGenerationProgress(80);

      // TODO: Generate PDF, images, presentations automatically
      
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
          <p className="text-lg text-neutral-600 dark:text-neutral-400">
            Jednoduše vytvořte kompletní výukové materiály v několika krocích
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center space-x-4">
            <div className={`flex items-center ${currentStep === 'input' ? 'text-blue-600 dark:text-blue-400' : currentStep !== 'input' ? 'text-green-600 dark:text-green-400' : 'text-neutral-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${currentStep === 'input' ? 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-950' : currentStep !== 'input' ? 'border-green-600 dark:border-green-400 bg-green-50 dark:bg-green-950' : 'border-neutral-300 dark:border-neutral-600'}`}>
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
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    Zadejte jasné a konkrétní téma, které chcete vyučovat
                  </p>
                </div>

                {/* Activity Type */}
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
                    Typ materiálu
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {activityTypes.map((type) => {
                      const IconComponent = type.icon;
                      return (
                        <button
                          key={type.id}
                          type="button"
                          onClick={() => handleInputChange('activityType', type.id)}
                          className={`p-4 border-2 rounded-lg transition-all ${
                            request.activityType === type.id
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                              : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
                          }`}
                        >
                          <IconComponent className="w-6 h-6 mx-auto mb-2" />
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
                      Délka hodiny
                    </label>
                    <select
                      value={request.duration}
                      onChange={(e) => handleInputChange('duration', e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    >
                      {durationOptions.map(duration => (
                        <option key={duration} value={duration}>{duration}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Advanced Settings */}
                <Card className="bg-neutral-50 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-4 h-4 text-neutral-500" />
                    <h3 className="font-medium text-neutral-700 dark:text-neutral-300">Pokročilé nastavení</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Počet žáků
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={request.studentCount}
                        onChange={(e) => handleInputChange('studentCount', parseInt(e.target.value))}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Obtížnost
                      </label>
                      <select
                        value={request.difficulty}
                        onChange={(e) => handleInputChange('difficulty', e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                      >
                        <option value="easy">Snadná</option>
                        <option value="medium">Střední</option>
                        <option value="hard">Náročná</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Styl výuky
                      </label>
                      <select
                        value={request.teachingStyle}
                        onChange={(e) => handleInputChange('teachingStyle', e.target.value)}
                        className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                      >
                        <option value="interactive">Interaktivní</option>
                        <option value="traditional">Tradiční</option>
                        <option value="project_based">Projektová</option>
                        <option value="discovery">Objevná</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Dodatečné poznámky (volitelné)
                    </label>
                    <textarea
                      value={request.additionalNotes}
                      onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                      placeholder="Specifické požadavky, zaměření na určité aspekty tématu..."
                      rows={3}
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                </Card>
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

                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Potřebné materiály
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {activityPreview.materials.map((material, index) => (
                      <span key={index} className="px-3 py-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 rounded-full text-sm">
                        {material}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-6 mt-6">
                <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                        Co se vygeneruje
                      </h5>
                      <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                        <li>• Detailní plán hodiny s časovým rozvrhem</li>
                        <li>• Pracovní listy pro studenty (PDF)</li>
                        <li>• Prezentační materiály</li>
                        <li>• Hodnoticí kritéria a testy</li>
                        <li>• Návody pro učitele</li>
                      </ul>
                    </div>
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <FileText className="w-8 h-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <div className="font-medium text-green-900 dark:text-green-100">
                    {generatedFiles.length}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-400">
                    Vygenerované soubory
                  </div>
                </div>

                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <Clock className="w-8 h-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                  <div className="font-medium text-blue-900 dark:text-blue-100">
                    {request.duration}
                  </div>
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    Délka hodiny
                  </div>
                </div>

                <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <Users className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                  <div className="font-medium text-purple-900 dark:text-purple-100">
                    {request.studentCount}
                  </div>
                  <div className="text-sm text-purple-600 dark:text-purple-400">
                    Žáků
                  </div>
                </div>
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
                  variant="secondary"
                  onClick={() => navigate('/materials/my-materials')}
                  className="px-6 py-3"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Stáhnout vše
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