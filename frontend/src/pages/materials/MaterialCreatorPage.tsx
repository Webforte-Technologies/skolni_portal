import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Breadcrumb from '../../components/ui/Breadcrumb';
import { useToast } from '../../contexts/ToastContext';
import { api } from '../../services/apiClient';
import { streamingService } from '../../services/streamingService';
import { 
  FileText, BookOpen, Target, Sparkles, Users, 
  Presentation, Share2, Download
} from 'lucide-react';

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
  color?: string; // Added for new template grid
}

interface TemplateField {
  name: string;
  type: 'text' | 'textarea' | 'number' | 'select' | 'multiselect' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
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
  // State
  const [selectedTemplate, setSelectedTemplate] = useState<MaterialTemplate | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isCreating, setIsCreating] = useState(false);

  const handleTemplateSelect = (template: MaterialTemplate) => {
    setSelectedTemplate(template);
    setFormData({});
  };

  const handleInputChange = (fieldName: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };

  const handleCreateMaterial = async () => {
    if (!selectedTemplate) return;

    setIsCreating(true);
    try {
      const id = selectedTemplate.id;
      const title = formData.title || selectedTemplate.name;
      const subject = formData.subject || selectedTemplate.subject;
      const gradeLevel = formData.gradeLevel || selectedTemplate.gradeLevel;
      const difficulty = formData.difficulty;
      const questionCount = formData.questionCount || 10;
      const duration = formData.duration;

      // Map template to AI generation endpoint (server also saves file and returns file_id)
      if (id === 'worksheet') {
        await streamingService.generateWorksheetStream(title, {
          onStart: () => showToast({ type: 'info', message: 'Generuji pracovní list…' }),
          onEnd: (meta) => {
            showToast({ type: 'success', message: 'Pracovní list vygenerován.' });
            if (meta.file_id) navigate(`/materials/my-materials?new=${meta.file_id}`);
          },
          onError: (m) => showToast({ type: 'error', message: m || 'Nepodařilo se vygenerovat pracovní list' })
        }, { question_count: questionCount, difficulty });
      } else if (id === 'lesson-plan' || id === 'lesson_plan') {
        await streamingService.generateLessonPlanStream({ title, subject, grade_level: gradeLevel }, {
          onStart: () => showToast({ type: 'info', message: 'Generuji plán hodiny…' }),
          onEnd: (meta) => {
            showToast({ type: 'success', message: 'Plán hodiny vygenerován.' });
            if (meta.file_id) navigate(`/materials/my-materials?new=${meta.file_id}`);
          },
          onError: (m) => showToast({ type: 'error', message: m || 'Nepodařilo se vygenerovat plán hodiny' })
        });
      } else if (id === 'quiz') {
        await streamingService.generateQuizStream({ title, subject, grade_level: gradeLevel, question_count: questionCount }, {
          onStart: () => showToast({ type: 'info', message: 'Generuji kvíz…' }),
          onEnd: (meta) => {
            showToast({ type: 'success', message: 'Kvíz vygenerován.' });
            if (meta.file_id) navigate(`/materials/my-materials?new=${meta.file_id}`);
          },
          onError: (m) => showToast({ type: 'error', message: m || 'Nepodařilo se vygenerovat kvíz' })
        });
      } else if (id === 'project') {
        await streamingService.generateProjectStream({ title, subject, grade_level: gradeLevel }, {
          onStart: () => showToast({ type: 'info', message: 'Generuji projekt…' }),
          onEnd: (meta) => {
            showToast({ type: 'success', message: 'Projekt vygenerován.' });
            if (meta.file_id) navigate(`/materials/my-materials?new=${meta.file_id}`);
          },
          onError: (m) => showToast({ type: 'error', message: m || 'Nepodařilo se vygenerovat projekt' })
        });
      } else if (id === 'presentation') {
        await streamingService.generatePresentationStream({ title, subject, grade_level: gradeLevel }, {
          onStart: () => showToast({ type: 'info', message: 'Generuji prezentaci…' }),
          onEnd: (meta) => {
            showToast({ type: 'success', message: 'Prezentace vygenerována.' });
            if (meta.file_id) navigate(`/materials/my-materials?new=${meta.file_id}`);
          },
          onError: (m) => showToast({ type: 'error', message: m || 'Nepodařilo se vygenerovat prezentaci' })
        });
      } else if (id === 'activity') {
        await streamingService.generateActivityStream({ title, subject, grade_level: gradeLevel, duration }, {
          onStart: () => showToast({ type: 'info', message: 'Generuji aktivitu…' }),
          onEnd: (meta) => {
            showToast({ type: 'success', message: 'Aktivita vygenerována.' });
            if (meta.file_id) navigate(`/materials/my-materials?new=${meta.file_id}`);
          },
          onError: (m) => showToast({ type: 'error', message: m || 'Nepodařilo se vygenerovat aktivitu' })
        });
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

  const renderField = (field: TemplateField) => {
    const value = formData[field.name] || '';
    
    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            name={field.name}
            value={value}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            required={field.required}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:text-neutral-100"
          />
        );
      
      case 'textarea':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              rows={4}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:text-neutral-100"
            />
          </div>
        );
      
      case 'number':
        return (
          <input
            type="number"
            name={field.name}
            value={value}
            onChange={(e) => handleInputChange(field.name, parseInt(e.target.value))}
            placeholder={field.placeholder}
            required={field.required}
            min={field.validation?.min}
            max={field.validation?.max}
            className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:text-neutral-100"
          />
        );
      
      case 'select':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              value={value}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              required={field.required}
              className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-neutral-800 dark:text-neutral-100"
            >
              <option value="">Vyberte {field.label}</option>
              {field.options?.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        );
      
      case 'multiselect':
        return (
          <div className="space-y-2">
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {field.options?.map(option => (
                <label key={option} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={Array.isArray(value) && value.includes(option)}
                    onChange={(e) => {
                      const currentValues = Array.isArray(value) ? value : [];
                      if (e.target.checked) {
                        handleInputChange(field.name, [...currentValues, option]);
                      } else {
                        handleInputChange(field.name, currentValues.filter(v => v !== option));
                      }
                    }}
                    className="rounded border-neutral-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );
      
      default:
        return null;
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
              Vyberte šablonu a vytvořte profesionální vzdělávací materiál pomocí AI
            </p>
          </div>
        </div>

        {/* Breadcrumb */}
        <Breadcrumb items={[
          { label: 'Materiály', path: '/materials' },
          { label: 'Vytvořit nový materiál' }
        ]} />

        {/* Template Grid */}
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

        {/* Features Section */}
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

        {/* Template Modal */}
        {selectedTemplate && (
          <Modal
            isOpen={!!selectedTemplate}
            onClose={() => setSelectedTemplate(null)}
            title={`Vytvořit ${selectedTemplate.name}`}
          >
                         <div className="space-y-4">
               {selectedTemplate.fields.map((field) => (
                 <div key={field.name}>
                   {renderField(field)}
                 </div>
               ))}
              
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateMaterial}
                  className="flex-1"
                  isLoading={isCreating}
                >
                  Vytvořit materiál
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedTemplate(null)}
                >
                  Zrušit
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default MaterialCreatorPage;
