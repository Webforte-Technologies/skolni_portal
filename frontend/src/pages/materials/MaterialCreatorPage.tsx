import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

import Breadcrumb from '../../components/ui/Breadcrumb';
import AssignmentInput from '../../components/materials/AssignmentInput';
import MaterialTypeSuggestions from '../../components/materials/MaterialTypeSuggestions';
import SubtypeSelection from '../../components/materials/SubtypeSelection';
import AdvancedParameterControls from '../../components/materials/AdvancedParameterControls';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/apiClient';
import { streamingService } from '../../services/streamingService';
import { 
  FileText, BookOpen, Target, Sparkles, Users, 
  Presentation, Share2, Download, Brain, Wand2
} from 'lucide-react';
import { 
  AssignmentAnalysis, 
  MaterialTypeSuggestion, 
  MaterialSubtype, 
  MaterialType,
  TemplateField
} from '../../types/MaterialTypes';

interface MaterialTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  category: string;
  subject: string;
  difficulty: string;
  gradeLevel: string;
  estimatedTime: string;
  fields: TemplateField[];
  color?: string;
  subtypes?: MaterialSubtype[];
}



const MATERIAL_TEMPLATES: MaterialTemplate[] = [
  {
    id: 'worksheet',
    name: 'Pracovní list',
    description: 'Vytvořte strukturovaná cvičení a úlohy',
    icon: <FileText className="w-8 h-8" />,
    category: 'Cvičení',
    subject: 'Matematika',
    difficulty: 'Střední',
    gradeLevel: 'Základní škola',
    estimatedTime: '15-30 min',
    fields: [
      { name: 'title', type: 'text', label: 'Název pracovního listu', placeholder: 'např. Cvičení sčítání', required: true },
      { name: 'subject', type: 'select', label: 'Předmět', required: true, options: ['Matematika', 'Přírodověda', 'Český jazyk', 'Dějepis', 'Výtvarná výchova', 'Hudební výchova', 'Tělesná výchova'] },
      { name: 'gradeLevel', type: 'select', label: 'Ročník', required: true, options: ['Mateřská škola', '1. třída', '2. třída', '3. třída', '4. třída', '5. třída', '6. třída', '7. třída', '8. třída', 'Střední škola'] },
      { name: 'difficulty', type: 'select', label: 'Obtížnost', required: true, options: ['Začátečník', 'Snadné', 'Střední', 'Těžké', 'Pokročilé'] },
      { name: 'learningObjectives', type: 'textarea', label: 'Výukové cíle', placeholder: 'Co se studenti naučí z tohoto pracovního listu?', required: true },
      { name: 'instructions', type: 'textarea', label: 'Instrukce pro studenty', placeholder: 'Jasné instrukce pro dokončení pracovního listu', required: true },
      { name: 'estimatedTime', type: 'select', label: 'Odhadovaný čas', required: true, options: ['5-10 min', '10-15 min', '15-30 min', '30-45 min', '45-60 min', '60+ min'] },
      { name: 'tags', type: 'multiselect', label: 'Štítky', required: false, options: ['Cvičení', 'Hodnocení', 'Opakování', 'Domácí úkol', 'Práce ve třídě', 'Příprava na test'] }
    ],
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'lesson-plan',
    name: 'Plán hodiny',
    description: 'Navrhněte komplexní plány hodin s cíli a aktivitami',
    icon: <BookOpen className="w-8 h-8" />,
    category: 'Výuka',
    subject: 'Obecné',
    difficulty: 'Střední',
    gradeLevel: 'Základní škola',
    estimatedTime: '45-90 min',
    fields: [
      { name: 'title', type: 'text', label: 'Název hodiny', placeholder: 'např. Úvod do zlomků', required: true },
      { name: 'subject', type: 'select', label: 'Předmět', required: true, options: ['Matematika', 'Přírodověda', 'Český jazyk', 'Dějepis', 'Výtvarná výchova', 'Hudební výchova', 'Tělesná výchova'] },
      { name: 'gradeLevel', type: 'select', label: 'Ročník', required: true, options: ['Mateřská škola', '1. třída', '2. třída', '3. třída', '4. třída', '5. třída', '6. třída', '7. třída', '8. třída', 'Střední škola'] },
      { name: 'difficulty', type: 'select', label: 'Obtížnost', required: true, options: ['Začátečník', 'Snadné', 'Střední', 'Těžké', 'Pokročilé'] },
      { name: 'duration', type: 'select', label: 'Délka hodiny', required: true, options: ['30 min', '45 min', '60 min', '90 min', '120 min', 'Celý den'] },
      { name: 'learningObjectives', type: 'textarea', label: 'Výukové cíle', placeholder: 'Co se studenti naučí z této hodiny?', required: true },
      { name: 'materials', type: 'textarea', label: 'Potřebné materiály', placeholder: 'Seznam materiálů a zdrojů', required: true },
      { name: 'activities', type: 'textarea', label: 'Aktivity hodiny', placeholder: 'Krok za krokem aktivity a postupy', required: true },
      { name: 'assessment', type: 'textarea', label: 'Metody hodnocení', placeholder: 'Jak budete hodnotit učení studentů?', required: true },
      { name: 'tags', type: 'multiselect', label: 'Štítky', required: false, options: ['Plán hodiny', 'Výuka', 'Učební osnovy', 'Hodnocení', 'Diferenciace', 'Integrace technologií'] }
    ],
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'quiz',
    name: 'Kvíz',
    description: 'Vytvořte hodnocení s výběrem z možností, pravda/nepravda a krátkými odpověďmi',
    icon: <Target className="w-8 h-8" />,
    category: 'Hodnocení',
    subject: 'Obecné',
    difficulty: 'Střední',
    gradeLevel: 'Základní škola',
    estimatedTime: '20-40 min',
    fields: [
      { name: 'title', type: 'text', label: 'Název kvízu', placeholder: 'např. Opakovací kvíz kapitoly 5', required: true },
      { name: 'subject', type: 'select', label: 'Předmět', required: true, options: ['Matematika', 'Přírodověda', 'Český jazyk', 'Dějepis', 'Výtvarná výchova', 'Hudební výchova', 'Tělesná výchova'] },
      { name: 'gradeLevel', type: 'select', label: 'Ročník', required: true, options: ['Mateřská škola', '1. třída', '2. třída', '3. třída', '4. třída', '5. třída', '6. třída', '7. třída', '8. třída', 'Střední škola'] },
      { name: 'difficulty', type: 'select', label: 'Obtížnost', required: true, options: ['Začátečník', 'Snadné', 'Střední', 'Těžké', 'Pokročilé'] },
      { name: 'timeLimit', type: 'select', label: 'Časový limit', required: true, options: ['Bez limitu', '15 min', '20 min', '30 min', '45 min', '60 min'] },
      { name: 'questionCount', type: 'number', label: 'Počet otázek', placeholder: 'např. 20', required: true, validation: { min: 1, max: 100 } },
      { name: 'questionTypes', type: 'multiselect', label: 'Typy otázek', required: true, options: ['Výběr z možností', 'Pravda/Nepravda', 'Krátká odpověď', 'Esej', 'Přiřazování', 'Doplňování'] },
      { name: 'learningObjectives', type: 'textarea', label: 'Výukové cíle', placeholder: 'Jaké znalosti/dovednosti tento kvíz hodnotí?', required: true },
      { name: 'tags', type: 'multiselect', label: 'Štítky', required: false, options: ['Hodnocení', 'Kvíz', 'Test', 'Opakování', 'Evaluační', 'Formativní', 'Sumativní'] }
    ],
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'project',
    name: 'Projekt',
    description: 'Navrhněte praktické projekty a kreativní úkoly',
    icon: <Sparkles className="w-8 h-8" />,
    category: 'Kreativní',
    subject: 'Obecné',
    difficulty: 'Střední',
    gradeLevel: 'Základní škola',
    estimatedTime: '1-2 týdny',
    fields: [
      { name: 'title', type: 'text', label: 'Název projektu', placeholder: 'např. Model sluneční soustavy', required: true },
      { name: 'subject', type: 'select', label: 'Předmět', required: true, options: ['Matematika', 'Přírodověda', 'Český jazyk', 'Dějepis', 'Výtvarná výchova', 'Hudební výchova', 'Tělesná výchova'] },
      { name: 'gradeLevel', type: 'select', label: 'Ročník', required: true, options: ['Mateřská škola', '1. třída', '2. třída', '3. třída', '4. třída', '5. třída', '6. třída', '7. třída', '8. třída', 'Střední škola'] },
      { name: 'difficulty', type: 'select', label: 'Obtížnost', required: true, options: ['Začátečník', 'Snadné', 'Střední', 'Těžké', 'Pokročilé'] },
      { name: 'duration', type: 'select', label: 'Délka projektu', required: true, options: ['1-2 dny', '1 týden', '2 týdny', '1 měsíc', 'Semestr'] },
      { name: 'learningObjectives', type: 'textarea', label: 'Výukové cíle', placeholder: 'Co se studenti naučí z tohoto projektu?', required: true },
      { name: 'materials', type: 'textarea', label: 'Potřebné materiály', placeholder: 'Seznam materiálů a zdrojů', required: true },
      { name: 'steps', type: 'textarea', label: 'Kroky projektu', placeholder: 'Krok za krokem instrukce pro projekt', required: true },
      { name: 'evaluation', type: 'textarea', label: 'Kritéria hodnocení', placeholder: 'Jak bude projekt hodnocen?', required: true },
      { name: 'tags', type: 'multiselect', label: 'Štítky', required: false, options: ['Projekt', 'Kreativní', 'Praktický', 'Spolupráce', 'Výzkum', 'Prezentace'] }
    ],
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'presentation',
    name: 'Prezentace',
    description: 'Vytvořte slidy a vizuální výukové materiály',
    icon: <Presentation className="w-8 h-8" />,
    category: 'Vizuální',
    subject: 'Obecné',
    difficulty: 'Střední',
    gradeLevel: 'Základní škola',
    estimatedTime: '30-60 min',
    fields: [
      { name: 'title', type: 'text', label: 'Název prezentace', placeholder: 'např. Přehled 2. světové války', required: true },
      { name: 'subject', type: 'select', label: 'Předmět', required: true, options: ['Matematika', 'Přírodověda', 'Český jazyk', 'Dějepis', 'Výtvarná výchova', 'Hudební výchova', 'Tělesná výchova'] },
      { name: 'gradeLevel', type: 'select', label: 'Ročník', required: true, options: ['Mateřská škola', '1. třída', '2. třída', '3. třída', '4. třída', '5. třída', '6. třída', '7. třída', '8. třída', 'Střední škola'] },
      { name: 'difficulty', type: 'select', label: 'Obtížnost', required: true, options: ['Začátečník', 'Snadné', 'Střední', 'Těžké', 'Pokročilé'] },
      { name: 'slideCount', type: 'number', label: 'Počet slidů', placeholder: 'např. 15', required: true, validation: { min: 1, max: 50 } },
      { name: 'learningObjectives', type: 'textarea', label: 'Výukové cíle', placeholder: 'Co se studenti naučí z této prezentace?', required: true },
      { name: 'keyPoints', type: 'textarea', label: 'Klíčové body', placeholder: 'Hlavní témata a koncepty k pokrytí', required: true },
      { name: 'visualElements', type: 'multiselect', label: 'Vizuální prvky', required: false, options: ['Obrázky', 'Grafy', 'Diagramy', 'Videa', 'Animace', 'Interaktivní prvky'] },
      { name: 'tags', type: 'multiselect', label: 'Štítky', required: false, options: ['Prezentace', 'Vizuální', 'Slidy', 'Přednáška', 'Přehled', 'Úvod'] }
    ],
    color: 'from-red-500 to-red-600'
  },
  {
    id: 'activity',
    name: 'Aktivita',
    description: 'Navrhněte interaktivní třídní aktivity a hry',
    icon: <Users className="w-8 h-8" />,
    category: 'Interaktivní',
    subject: 'Obecné',
    difficulty: 'Střední',
    gradeLevel: 'Základní škola',
    estimatedTime: '20-45 min',
    fields: [
      { name: 'title', type: 'text', label: 'Název aktivity', placeholder: 'např. Slovní bingo', required: true },
      { name: 'subject', type: 'select', label: 'Předmět', required: true, options: ['Matematika', 'Přírodověda', 'Český jazyk', 'Dějepis', 'Výtvarná výchova', 'Hudební výchova', 'Tělesná výchova'] },
      { name: 'gradeLevel', type: 'select', label: 'Ročník', required: true, options: ['Mateřská škola', '1. třída', '2. třída', '3. třída', '4. třída', '5. třída', '6. třída', '7. třída', '8. třída', 'Střední škola'] },
      { name: 'difficulty', type: 'select', label: 'Obtížnost', required: true, options: ['Začátečník', 'Snadné', 'Střední', 'Těžké', 'Pokročilé'] },
      { name: 'duration', type: 'select', label: 'Délka aktivity', required: true, options: ['10-15 min', '15-20 min', '20-30 min', '30-45 min', '45-60 min'] },
      { name: 'groupSize', type: 'select', label: 'Velikost skupiny', required: true, options: ['Individuální', 'Dvojice', 'Malé skupiny (3-4)', 'Velké skupiny (5-8)', 'Celá třída'] },
      { name: 'learningObjectives', type: 'textarea', label: 'Výukové cíle', placeholder: 'Co se studenti naučí z této aktivity?', required: true },
      { name: 'materials', type: 'textarea', label: 'Potřebné materiály', placeholder: 'Seznam materiálů a zdrojů', required: true },
      { name: 'instructions', type: 'textarea', label: 'Instrukce k aktivitě', placeholder: 'Krok za krokem instrukce k aktivitě', required: true },
      { name: 'tags', type: 'multiselect', label: 'Štítky', required: false, options: ['Aktivita', 'Interaktivní', 'Hra', 'Skupinová práce', 'Praktická', 'Zapojení'] }
    ],
    color: 'from-yellow-500 to-yellow-600'
  }
];

const MaterialCreatorPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  
  // Enhanced state for new features
  const [selectedTemplate, setSelectedTemplate] = useState<MaterialTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isCreating, setIsCreating] = useState(false);
  
  // Assignment-based generation state
  const [assignmentMode, setAssignmentMode] = useState(false);
  const [assignmentAnalysis, setAssignmentAnalysis] = useState<AssignmentAnalysis | null>(null);
  const [materialSuggestions, setMaterialSuggestions] = useState<MaterialTypeSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Subtype selection state
  const [selectedSubtype, setSelectedSubtype] = useState<MaterialSubtype | null>(null);
  const [showSubtypeSelection, setShowSubtypeSelection] = useState(false);
  
  // Advanced parameters state
  const [advancedParameters, setAdvancedParameters] = useState<Record<string, any>>({
    qualityLevel: 'standard',
    customInstructions: ''
  });

  const handleTemplateSelect = (template: MaterialTemplate) => {
    setSelectedTemplate(template);
    setFormData({});
    setSelectedSubtype(null);
    setShowSubtypeSelection(true);
  };

  // Assignment analysis handlers
  const handleAssignmentAnalysis = (analysis: AssignmentAnalysis, suggestions: MaterialTypeSuggestion[]) => {
    setAssignmentAnalysis(analysis);
    setMaterialSuggestions(suggestions);
    setShowSuggestions(true);
    
    // Auto-populate form fields from analysis
    setFormData(prev => ({
      ...prev,
      subject: analysis.subjectArea,
      difficulty: analysis.detectedDifficulty,
      estimatedTime: analysis.estimatedDuration,
      learningObjectives: analysis.extractedObjectives.join('\n')
    }));
  };

  const handleAssignmentAnalysisError = (error: string) => {
    showToast({ type: 'error', message: error });
  };

  // Material type suggestion handlers
  const handleSuggestionAccept = (materialType: MaterialType, recommendedSubtype?: string) => {
    const template = MATERIAL_TEMPLATES.find(t => t.id === materialType);
    if (template) {
      setSelectedTemplate(template);
      setShowSuggestions(false);
      setShowSubtypeSelection(true);
      
      // If there's a recommended subtype, we'll handle it in the subtype selection
      if (recommendedSubtype) {
        // This will be used by SubtypeSelection component
      }
    }
  };

  const handleSuggestionReject = () => {
    setShowSuggestions(false);
    setMaterialSuggestions([]);
  };

  // Subtype selection handlers
  const handleSubtypeSelect = (subtype: MaterialSubtype) => {
    setSelectedSubtype(subtype);
    
    // Initialize subtype-specific parameters
    const subtypeParams: Record<string, any> = {};
    subtype.specialFields.forEach(field => {
      switch (field.type) {
        case 'boolean':
          subtypeParams[field.name] = false;
          break;
        case 'multiselect':
          subtypeParams[field.name] = [];
          break;
        case 'number':
          subtypeParams[field.name] = field.validation?.min || 0;
          break;
        default:
          subtypeParams[field.name] = '';
      }
    });
    
    setAdvancedParameters(prev => ({
      ...prev,
      ...subtypeParams
    }));
  };

  // Advanced parameter handlers
  const handleParameterChange = (name: string, value: any) => {
    setAdvancedParameters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePresetSave = (name: string) => {
    // In a real implementation, this would save to localStorage or backend
    showToast({ type: 'success', message: `Předvolba "${name}" byla uložena` });
  };

  const handlePresetLoad = (parameters: Record<string, any>) => {
    setAdvancedParameters(parameters);
    showToast({ type: 'info', message: 'Předvolba byla načtena' });
  };





  const handleCreateMaterial = async () => {
    if (!selectedTemplate) return;
    
    // Enhanced validation for subtype mode
    if (showSubtypeSelection && !selectedSubtype) {
      showToast({ type: 'error', message: 'Prosím vyberte typ materiálu' });
      return;
    }

    setIsCreating(true);
    try {
      const id = selectedTemplate.id;
      
      // Enhanced parameter collection
      const enhancedParams = {
        // Basic parameters
        title: formData.title || selectedTemplate.name,
        subject: formData.subject || assignmentAnalysis?.subjectArea || selectedTemplate.subject,
        gradeLevel: formData.gradeLevel || selectedTemplate.gradeLevel,
        difficulty: formData.difficulty || assignmentAnalysis?.detectedDifficulty,
        questionCount: formData.questionCount || 10,
        duration: formData.duration,
        timeLimit: formData.timeLimit,
        
        // Enhanced parameters
        subtype: selectedSubtype?.id,
        subtypeName: selectedSubtype?.name,
        assignmentDescription: assignmentAnalysis ? 'Založeno na analýze úkolu' : undefined,
        learningObjectives: assignmentAnalysis?.extractedObjectives.join('\n') || formData.learningObjectives,
        customInstructions: advancedParameters.customInstructions,
        qualityLevel: advancedParameters.qualityLevel,
        
        // Subtype-specific parameters
        ...advancedParameters
      };

      // Enhanced AI generation with subtype support
      const generationCallbacks = {
        onStart: () => showToast({ type: 'info', message: `Generuji ${selectedTemplate.name.toLowerCase()}…` }),
        onEnd: (meta: any) => {
          showToast({ type: 'success', message: `${selectedTemplate.name} vygenerován.` });
          if (meta.file_id) navigate(`/materials/my-materials?new=${meta.file_id}`);
        },
        onError: (m: string) => showToast({ type: 'error', message: m || `Nepodařilo se vygenerovat ${selectedTemplate.name.toLowerCase()}` })
      };

      if (id === 'worksheet') {
        await streamingService.generateWorksheetStream(enhancedParams.title, generationCallbacks, {
          question_count: enhancedParams.questionCount,
          difficulty: enhancedParams.difficulty
          // TODO: Add subtype and custom instructions support to backend
        });
      } else if (id === 'lesson-plan' || id === 'lesson_plan') {
        await streamingService.generateLessonPlanStream({
          title: enhancedParams.title,
          subject: enhancedParams.subject,
          grade_level: enhancedParams.gradeLevel
          // TODO: Add subtype and custom instructions support to backend
        }, generationCallbacks);
      } else if (id === 'quiz') {
        const questionTypesHint = Array.isArray(formData.questionTypes) && formData.questionTypes.length > 0
          ? ` Typy otázek: ${formData.questionTypes.join(', ')}.`
          : '';
        
        await streamingService.generateQuizStream({
          title: enhancedParams.title,
          subject: enhancedParams.subject,
          grade_level: enhancedParams.gradeLevel,
          question_count: enhancedParams.questionCount,
          time_limit: enhancedParams.timeLimit,
          prompt_hint: questionTypesHint
          // TODO: Add subtype and custom instructions support to backend
        }, generationCallbacks);
      } else if (id === 'project') {
        await streamingService.generateProjectStream({
          title: enhancedParams.title,
          subject: enhancedParams.subject,
          grade_level: enhancedParams.gradeLevel
          // TODO: Add subtype and custom instructions support to backend
        }, generationCallbacks);
      } else if (id === 'presentation') {
        await streamingService.generatePresentationStream({
          title: enhancedParams.title,
          subject: enhancedParams.subject,
          grade_level: enhancedParams.gradeLevel
          // TODO: Add subtype and custom instructions support to backend
        }, generationCallbacks);
      } else if (id === 'activity') {
        await streamingService.generateActivityStream({
          title: enhancedParams.title,
          subject: enhancedParams.subject,
          grade_level: enhancedParams.gradeLevel,
          duration: enhancedParams.duration
          // TODO: Add subtype and custom instructions support to backend
        }, generationCallbacks);
      } else {
        // Fallback to manual creation if unknown template (should not happen)
        const materialData = {
          title: formData.title || `Nový ${selectedTemplate.name}`,
          content: JSON.stringify({ template: selectedTemplate.id, ...formData, created_at: new Date().toISOString(), status: 'draft' }),
          file_type: 'worksheet'
        };
        await api.post('/files', materialData);
        showToast({ type: 'success', message: 'Materiál byl vytvořen.' });
        navigate('/materials/my-materials');
      }

      // Close modal
      setSelectedTemplate(null);
    } catch (error) {
      console.error('Error creating material via AI:', error);
      const errorMessage = error instanceof Error ? error.message : 'Neznámá chyba';
      showToast({ type: 'error', message: 'Chyba při vytváření: ' + errorMessage });
    } finally {
      setIsCreating(false);
    }
  };



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-neutral-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
                      <Button
              variant="ghost"
              onClick={() => navigate('/materials')}
              className="mb-4"
            >
              Zpět na materiály
            </Button>
          
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-neutral-900 dark:text-neutral-100 mb-4">
              Vytvořit nový materiál
            </h1>
            <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              Popište svůj úkol nebo vyberte šablonu pro vytvoření profesionálního vzdělávacího materiálu
            </p>
            
            {/* Mode Toggle */}
            <div className="flex justify-center mt-6">
              <div className="flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
                <button
                  onClick={() => setAssignmentMode(true)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    assignmentMode
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }`}
                >
                  <Brain className="w-4 h-4" />
                  AI asistent
                </button>
                <button
                  onClick={() => setAssignmentMode(false)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2 ${
                    !assignmentMode
                      ? 'bg-white dark:bg-neutral-700 text-neutral-900 dark:text-neutral-100 shadow-sm'
                      : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100'
                  }`}
                >
                  <Wand2 className="w-4 h-4" />
                  Šablony
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: 'Materiály', path: '/materials' },
          { label: 'Vytvořit nový materiál' }
        ]} />

        {/* Assignment Input Mode */}
        {assignmentMode && (
          <div className="max-w-4xl mx-auto mb-8">
            <AssignmentInput
              onAnalysisComplete={handleAssignmentAnalysis}
              onAnalysisError={handleAssignmentAnalysisError}
              className="mb-6"
            />
            
            {/* Material Type Suggestions */}
            {showSuggestions && materialSuggestions.length > 0 && (
              <MaterialTypeSuggestions
                suggestions={materialSuggestions}
                onSuggestionAccept={handleSuggestionAccept}
                onSuggestionReject={handleSuggestionReject}
                className="mb-6"
              />
            )}
          </div>
        )}

        {/* Template Grid */}
        {!assignmentMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {MATERIAL_TEMPLATES.map((template) => (
            <Card
              key={template.id}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105"
              onClick={() => handleTemplateSelect(template)}
            >
              <div className="text-center p-6">
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${template.color} rounded-full mb-4 text-white`}>
                  {template.icon}
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                  {template.name}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                  {template.description}
                </p>
                <Button className="w-full">
                  Použít šablonu
                </Button>
              </div>
            </Card>
          ))}
        </div>
        )}

        {/* Subtype Selection */}
        {showSubtypeSelection && selectedTemplate && (
          <div className="max-w-6xl mx-auto mb-8">
            <SubtypeSelection
              materialType={selectedTemplate.id as MaterialType}
              selectedSubtype={selectedSubtype || undefined}
              onSubtypeSelect={handleSubtypeSelect}
              recommendedSubtypeId={materialSuggestions.find(s => s.type === selectedTemplate.id)?.recommendedSubtype}
              className="mb-6"
            />
            
            {/* Advanced Parameter Controls */}
            {selectedSubtype && (
              <AdvancedParameterControls
                subtype={selectedSubtype}
                parameters={advancedParameters}
                onParameterChange={handleParameterChange}
                onPresetSave={handlePresetSave}
                onPresetLoad={handlePresetLoad}
                className="mb-6"
              />
            )}
            
            {/* Generate Button */}
            {selectedSubtype && (
              <div className="text-center">
                <Button
                  onClick={handleCreateMaterial}
                  size="lg"
                  isLoading={isCreating}
                  disabled={isCreating}
                  className="px-8 py-3"
                >
                  {isCreating ? 'Generuji materiál...' : 'Vygenerovat materiál'}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Features Section */}
        {!assignmentMode && !showSubtypeSelection && (
        <div className="text-center">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-6">
            Proč používat naše šablony?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full mb-3">
                <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Vytváření pomocí AI
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Generujte kvalitní obsah pomocí našich pokročilých AI šablon
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full mb-3">
                <Share2 className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Snadné sdílení
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Sdílejte materiály s kolegy a studenty bez problémů
              </p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full mb-3">
                <Download className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Více formátů
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Exportujte a stahujte v různých formátech pro různé použití
              </p>
            </div>
          </div>
        </div>
        )}


      </div>
    </div>
  );
};

export default MaterialCreatorPage;
