import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, BookOpen, Target, Sparkles, Users, Presentation, 
  Tag, Download, Edit3, Save, RotateCcw, Star, 
  CheckCircle, AlertTriangle, Info, Clock
} from 'lucide-react';
import Button from '../ui/Button';
import { exportElementToPDFOptions, exportStructuredToDocxOptions } from '../../utils/exportUtils';

interface MaterialDisplayProps {
  material: any;
  onClose?: () => void;
  onContentUpdate?: (updatedContent: any) => void;
}

interface EditHistory {
  timestamp: Date;
  section: string;
  oldValue: string;
  newValue: string;
}

const MaterialDisplay: React.FC<MaterialDisplayProps> = ({ 
  material, 
  onClose, 
  onContentUpdate 
}) => {
  
  // Inline editing state
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [editHistory, setEditHistory] = useState<EditHistory[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Quality and validation state
  const [qualityScore, setQualityScore] = useState(85);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const [showQualityDetails, setShowQualityDetails] = useState(false);



  // Parse the content JSON if it's a string
  const content = typeof material.content === 'string' ? JSON.parse(material.content) : material.content;
  
  // Get teacher name from material or use fallback
  const teacherName = material.teacher_name || material.created_by || material.user_name || 'Učitel';
  
  // Filter out technical metadata fields that shouldn't be displayed to users
  const shouldDisplayField = (fieldName: string) => {
    const technicalFields = ['scaffolding', 'originalContent', 'structuredContent', 'educationalMetadata', 'difficultyProgression'];
    return !technicalFields.includes(fieldName);
  };
  
  // Get field label helper function
  const getFieldLabel = (name: string) => {
    const labels: Record<string, string> = {
      title: 'Název',
      subject: 'Předmět',
      gradeLevel: 'Ročník',
      grade_level: 'Ročník',
      difficulty: 'Obtížnost',
      learningObjectives: 'Výukové cíle',
      objectives: 'Cíle',
      instructions: 'Instrukce',
      estimatedTime: 'Odhadovaný čas',
      duration: 'Délka',
      materials: 'Potřebné materiály',
      activities: 'Aktivity',
      assessment: 'Hodnocení',
      steps: 'Kroky',
      evaluation: 'Kritéria hodnocení',
      slideCount: 'Počet slidů',
      keyPoints: 'Klíčové body',
      visualElements: 'Vizuální prvky',
      groupSize: 'Velikost skupiny',
      group_size: 'Velikost skupiny',
      questionCount: 'Počet otázek',
      questions: 'Otázky',
      questionTypes: 'Typy otázek',
      timeLimit: 'Časový limit',
      time_limit: 'Časový limit',
      tags: 'Štítky',
      rubric: 'Hodnotící rubrika',
      timeline: 'Časový plán',
      phases: 'Fáze projektu',
      deliverables: 'Výstupy',
      project_type: 'Typ projektu',
      description: 'Popis',
      template: 'Šablona',
      slides: 'Snímky prezentace',
      speakerNotes: 'Poznámky pro přednášejícího',
      visualSuggestions: 'Vizuální návrhy',
      slide_count: 'Počet slidů',
      presentation_style: 'Styl prezentace',
      target_audience: 'Cílová skupina',
      goal: 'Cíl aktivity',
      variation: 'Varianta',
      safety_notes: 'Bezpečnostní poznámky',
      structuredInstructions: 'Strukturované instrukce',
      activity_type: 'Typ aktivity'
    };
    return labels[name] || name;
  };
  
  // Get template icon based on template ID or file_type fallback
  const getTemplateIcon = (templateId: string) => {
    switch (templateId) {
      case 'worksheet':
        return <FileText className="w-6 h-6" />;
      case 'lesson-plan':
      case 'lesson_plan':
        return <BookOpen className="w-6 h-6" />;
      case 'quiz':
        return <Target className="w-6 h-6" />;
      case 'project':
        return <Sparkles className="w-6 h-6" />;
      case 'presentation':
        return <Presentation className="w-6 h-6" />;
      case 'activity':
        return <Users className="w-6 h-6" />;
      default:
        // Fallback: use file_type if template missing
        switch (material.file_type) {
          case 'lesson_plan': return <BookOpen className="w-6 h-6" />;
          case 'quiz': return <Target className="w-6 h-6" />;
          case 'project': return <Sparkles className="w-6 h-6" />;
          case 'presentation': return <Presentation className="w-6 h-6" />;
          case 'activity': return <Users className="w-6 h-6" />;
          default: return <FileText className="w-6 h-6" />;
        }
    }
  };

  const getTemplateName = (templateId: string) => {
    switch (templateId) {
      case 'worksheet':
        return 'Pracovní list';
      case 'lesson-plan':
      case 'lesson_plan':
        return 'Plán hodiny';
      case 'quiz':
        return 'Kvíz';
      case 'project':
        return 'Projekt';
      case 'presentation':
        return 'Prezentace';
      case 'activity':
        return 'Aktivita';
      default:
        // Fallback: use file_type if template missing
        switch (material.file_type) {
          case 'lesson_plan': return 'Plán hodiny';
          case 'quiz': return 'Kvíz';
          case 'project': return 'Projekt';
          case 'presentation': return 'Prezentace';
          case 'activity': return 'Aktivita';
          default: return 'Materiál';
        }
    }
  };

  // Inline editing functions
  const startEditing = (section: string, content: any) => {
    setEditingSection(section);
    
    // Special handling for different content types
    let editContent = '';
    
    if (section === 'questions' && Array.isArray(content)) {
      // Convert worksheet questions to a readable format
      editContent = content.map((question: any, index: number) => {
        const questionText = question.problem || question.question || 'Otázka bez textu';
        const answerText = question.answer || 'Bez odpovědi';
        return `${index + 1}. ${questionText}\n   Odpověď: ${answerText}`;
      }).join('\n\n');
    } else if (Array.isArray(content)) {
      // Handle other arrays
      editContent = content.join('\n');
    } else if (typeof content === 'object') {
      // Handle objects
      editContent = JSON.stringify(content, null, 2);
    } else {
      // Handle strings and other types
      editContent = String(content);
    }
    
    setEditContent(editContent);
    setHasUnsavedChanges(true);
  };

  const saveEdit = useCallback(() => {
    if (editingSection && editContent !== content[editingSection]) {
      // Add to edit history
      const historyEntry: EditHistory = {
        timestamp: new Date(),
        section: editingSection,
        oldValue: content[editingSection] || '',
        newValue: editContent
      };
      
      setEditHistory(prev => [historyEntry, ...prev]);
      
      // Convert edited content back to appropriate format
      let updatedValue: any = editContent;
      
      if (editingSection === 'questions' && Array.isArray(content[editingSection])) {
        // Parse the edited questions text back to structured format
        try {
          const lines = editContent.split('\n').filter(line => line.trim());
          const updatedQuestions = [];
          let currentQuestion: any = {};
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (/^\d+\./.test(trimmedLine)) {
              // New question
              if (currentQuestion.problem) {
                updatedQuestions.push(currentQuestion);
              }
              currentQuestion = {
                problem: trimmedLine.replace(/^\d+\.\s*/, ''),
                answer: '',
                type: 'calculation' // Default type
              };
            } else if (trimmedLine.startsWith('Odpověď:')) {
              currentQuestion.answer = trimmedLine.replace('Odpověď:', '').trim();
            } else if (currentQuestion.problem && !currentQuestion.answer) {
              // Additional problem text
              currentQuestion.problem += ' ' + trimmedLine;
            }
          }
          
          // Add the last question
          if (currentQuestion.problem) {
            updatedQuestions.push(currentQuestion);
          }
          
          updatedValue = updatedQuestions;
        } catch (error) {
          console.error('Failed to parse questions:', error);
          // Fallback to original content
          updatedValue = content[editingSection];
        }
      }
      
      // Update content
      const updatedContent = { ...content, [editingSection]: updatedValue };
      if (onContentUpdate) {
        onContentUpdate(updatedContent);
      }
      
      // Update quality score based on content changes
      updateQualityScore(updatedContent);
    }
    
    setEditingSection(null);
    setEditContent('');
    setHasUnsavedChanges(false);
  }, [editingSection, editContent, content, onContentUpdate]);

  const cancelEdit = () => {
    setEditingSection(null);
    setEditContent('');
    setHasUnsavedChanges(false);
  };

  const updateQualityScore = (updatedContent: any) => {
    // Simple quality scoring algorithm
    let score = 85;
    const issues: string[] = [];
    
    // Check content length
    Object.values(updatedContent).forEach((value: any) => {
      if (typeof value === 'string') {
        if (value.length < 10) {
          score -= 5;
          issues.push('Krátký obsah');
        } else if (value.length > 500) {
          score -= 3;
          issues.push('Příliš dlouhý obsah');
        }
      }
    });
    
    // Check for common issues
    const contentText = JSON.stringify(updatedContent).toLowerCase();
    if (contentText.includes('lorem') || contentText.includes('ipsum')) {
      score -= 20;
      issues.push('Obsahuje placeholder text');
    }
    
    if (contentText.includes('test') && contentText.includes('example')) {
      score -= 10;
      issues.push('Obsahuje testovací obsah');
    }
    
    setQualityScore(Math.max(0, score));
    setValidationIssues(issues);
  };

  // Auto-save functionality
  useEffect(() => {
    if (hasUnsavedChanges) {
      const timer = setTimeout(() => {
        if (editingSection) {
          saveEdit();
        }
      }, 5000); // Auto-save after 5 seconds of inactivity
      
      return () => clearTimeout(timer);
    }
  }, [hasUnsavedChanges, editingSection, saveEdit]);

  const renderField = (fieldName: string, value: any) => {
    if (!value) return null;

    // Special handling for worksheet questions
    if (fieldName === 'questions' && Array.isArray(value) && value.length > 0 && (value[0].problem || value[0].question)) {
      return renderWorksheetQuestions(value);
    }

    // Special handling for quiz questions
    if (fieldName === 'questions' && Array.isArray(value) && value.length > 0 && value[0].type) {
      return renderQuizQuestions(value);
    }

    // Special handling for presentation slides
    if (fieldName === 'slides' && Array.isArray(value) && value.length > 0) {
      return renderPresentationSlides(value);
    }

    // Special handling for activity structured instructions
    if (fieldName === 'structuredInstructions' && value && typeof value === 'object') {
      return renderActivityStructuredInstructions(value);
    }

    // Special handling for project rubric
    if (fieldName === 'rubric' && value && typeof value === 'object' && value.criteria) {
      return renderProjectRubric(value);
    }

    // Special handling for project timeline
    if (fieldName === 'timeline' && value && typeof value === 'object' && value.milestones) {
      return renderProjectTimeline(value);
    }

    // Special handling for project phases
    if (fieldName === 'phases' && Array.isArray(value)) {
      return renderProjectPhases(value);
    }

    const renderValue = (val: any) => {
      if (Array.isArray(val)) {
        // Display arrays of objects (e.g., quiz questions) as a readable list
        if (val.length > 0 && typeof val[0] === 'object') {
          return (
            <ul className="list-disc pl-5 space-y-1">
              {val.map((item: any, idx: number) => (
                <li key={idx} className="text-sm text-neutral-700">
                  {item.name || item.title || item.question || item.problem || JSON.stringify(item)}
                </li>
              ))}
            </ul>
          );
        }
        return val.join(', ');
      }
      if (typeof val === 'object') {
        return (
          <pre className="text-xs bg-neutral-100 rounded p-2 overflow-auto max-h-48">
            {JSON.stringify(val, null, 2)}
          </pre>
        );
      }
      if (typeof val === 'string' && val.length > 100) {
        return (
          <div className="whitespace-pre-wrap text-sm leading-relaxed">
            {val}
          </div>
        );
      }
      return val;
    };

    return (
      <div key={fieldName} className="mb-4">
        <h4 className="font-medium text-neutral-700 mb-2 flex items-center">
          <Tag className="w-4 h-4 mr-2 text-neutral-500" />
          {getFieldLabel(fieldName)}:
        </h4>
        <div className="text-neutral-900 bg-neutral-50 rounded-lg p-3">
          {renderValue(value)}
        </div>
      </div>
    );
  };

  const renderQuizQuestions = (questions: any[]) => {
    return (
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={index} className="border border-neutral-200 rounded-lg p-4 bg-white">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="mb-3">
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-700 rounded mr-2">
                    {question.type === 'multiple_choice' ? 'Výběr z možností' : 
                     question.type === 'true_false' ? 'Pravda/Nepravda' : 
                     question.type === 'short_answer' ? 'Krátká odpověď' : question.type}
                  </span>
                  <p className="text-neutral-900 font-medium">{question.question}</p>
                </div>
                
                                 {question.type === 'multiple_choice' && question.options && (
                   <div className="space-y-2">
                     {question.options.map((option: string, optIndex: number) => (
                       <div key={optIndex} className="flex items-center gap-2">
                         <div className={`w-4 h-4 rounded border-2 ${
                           option === question.answer ? 'border-green-500 bg-green-500' : 'border-neutral-300'
                         }`}>
                           {option === question.answer && (
                             <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                           )}
                         </div>
                         <span 
                           className={`text-sm ${
                             option === question.answer ? 'text-green-700 font-medium' : 'text-neutral-700'
                           }`}
                           data-answer={option === question.answer ? 'true' : 'false'}
                         >
                           {option}
                         </span>
                       </div>
                     ))}
                   </div>
                 )}
                
                                 {question.type === 'true_false' && (
                   <div className="flex items-center gap-2">
                     <div 
                       data-answer="true"
                       className={`px-3 py-1 rounded text-sm font-medium ${
                         question.answer === true ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                       }`}
                     >
                       {question.answer === true ? 'Pravda' : 'Nepravda'}
                     </div>
                   </div>
                 )}
                
                                 {question.type === 'short_answer' && (
                   <div className="bg-neutral-50 rounded p-2">
                     <span className="text-sm text-neutral-600">Správná odpověď:</span>
                     <div 
                       data-answer="true"
                       className="text-neutral-900 font-medium mt-1"
                     >
                       {question.answer}
                     </div>
                   </div>
                 )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderPresentationSlides = (slides: any[]) => {
    if (!slides || slides.length === 0) {
      return <div className="text-neutral-500">Žádné snímky prezentace není k dispozici</div>;
    }

    return (
      <div className="space-y-4">
        {slides.map((slide, index) => (
          <div key={index} className="border border-neutral-200 rounded-lg p-4 bg-white">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                {slide.slideNumber || index + 1}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-neutral-900 mb-3">
                  {slide.heading || `Snímek ${slide.slideNumber || index + 1}`}
                </h4>
                
                {slide.bullets && Array.isArray(slide.bullets) && (
                  <div className="mb-3">
                    <ul className="list-disc pl-5 space-y-1">
                      {slide.bullets.map((bullet: string, bulletIndex: number) => (
                        <li key={bulletIndex} className="text-sm text-neutral-700">
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {slide.estimatedTime && (
                  <div className="text-xs text-neutral-500 mb-2">
                    Odhadovaný čas: {slide.estimatedTime}
                  </div>
                )}
                
                {slide.visualSuggestions && (
                  <div className="text-xs text-neutral-600 mb-2">
                    <span className="font-medium">Vizuální návrhy:</span> {slide.visualSuggestions}
                  </div>
                )}
                
                {slide.transitionSuggestion && (
                  <div className="text-xs text-neutral-600">
                    <span className="font-medium">Přechod:</span> {slide.transitionSuggestion}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderActivityStructuredInstructions = (instructions: any) => {
    if (!instructions || typeof instructions !== 'object') {
      return <div className="text-neutral-500">Žádné strukturované instrukce není k dispozici</div>;
    }

    return (
      <div className="space-y-4">
        {instructions.preparation && (
          <div className="border border-neutral-200 rounded-lg p-4 bg-white">
            <h5 className="font-medium text-neutral-900 mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              Příprava
            </h5>
            {Array.isArray(instructions.preparation) && (
              <ul className="list-disc pl-5 space-y-1">
                {instructions.preparation.map((step: string, stepIndex: number) => (
                  <li key={stepIndex} className="text-sm text-neutral-700">
                    {step}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {instructions.execution && (
          <div className="border border-neutral-200 rounded-lg p-4 bg-white">
            <h5 className="font-medium text-neutral-900 mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              Provedení
            </h5>
            {Array.isArray(instructions.execution) && (
              <ul className="list-disc pl-5 space-y-1">
                {instructions.execution.map((step: string, stepIndex: number) => (
                  <li key={stepIndex} className="text-sm text-neutral-700">
                    {step}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {instructions.conclusion && (
          <div className="border border-neutral-200 rounded-lg p-4 bg-white">
            <h5 className="font-medium text-neutral-900 mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              Závěr
            </h5>
            {Array.isArray(instructions.conclusion) && (
              <ul className="list-disc pl-5 space-y-1">
                {instructions.conclusion.map((step: string, stepIndex: number) => (
                  <li key={stepIndex} className="text-sm text-neutral-700">
                    {step}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderProjectRubric = (rubric: any) => {
    if (!rubric.criteria || !Array.isArray(rubric.criteria)) {
      return <div className="text-neutral-500">Rubrika není k dispozici</div>;
    }

    return (
      <div className="space-y-4">
        {rubric.criteria.map((criteria: any, index: number) => (
          <div key={index} className="border border-neutral-200 rounded-lg p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h5 className="font-medium text-neutral-900">
                {criteria.name || `Kritérium ${index + 1}`}
              </h5>
              {criteria.weight && (
                <span className="text-sm text-neutral-500">
                  Váha: {Math.round(criteria.weight * 100)}%
                </span>
              )}
            </div>
            
            {criteria.levels && Array.isArray(criteria.levels) && (
              <div className="space-y-2">
                {criteria.levels.map((level: string, levelIndex: number) => (
                  <div key={levelIndex} className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">
                      {levelIndex + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-neutral-900 text-sm">{level}</div>
                      {criteria.descriptors && criteria.descriptors[levelIndex] && (
                        <div className="text-xs text-neutral-600 mt-1">
                          {criteria.descriptors[levelIndex]}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderProjectTimeline = (timeline: any) => {
    if (!timeline.milestones || !Array.isArray(timeline.milestones)) {
      return <div className="text-neutral-500">Časový plán není k dispozici</div>;
    }

    return (
      <div className="space-y-3">
        {timeline.milestones.map((milestone: any, index: number) => (
          <div key={index} className="flex items-center gap-4 p-3 bg-neutral-50 rounded-lg">
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
              {milestone.week || index + 1}
            </div>
            <div className="flex-1">
              <div className="font-medium text-neutral-900">{milestone.task}</div>
              {milestone.week && (
                <div className="text-xs text-neutral-500">Týden {milestone.week}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderProjectPhases = (phases: string[]) => {
    return (
      <div className="space-y-2">
        {phases.map((phase: string, index: number) => (
          <div key={index} className="flex items-center gap-3 p-2 bg-neutral-50 rounded-lg">
            <div className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-medium">
              {index + 1}
            </div>
            <span className="text-neutral-900">{phase}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderWorksheetQuestions = (questions: any[]) => {
    return (
      <div className="space-y-4">
        {questions.map((question, index) => (
          <div key={index} className="border border-neutral-200 rounded-lg p-4 bg-white">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="mb-3">
                  <span className="inline-block px-2 py-1 text-xs font-medium bg-neutral-100 text-neutral-700 rounded mr-2">
                    {question.type || 'úloha'}
                  </span>
                  <p className="text-neutral-900 font-medium">{question.problem || question.question}</p>
                </div>
                
                {question.answer && (
                  <div className="bg-green-50 rounded p-3 border border-green-200">
                    <span className="text-sm text-green-700 font-medium">Odpověď:</span>
                    <div className="text-neutral-900 mt-1">
                      {question.answer}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };


  const handleExportPDF = async (hideAnswers?: boolean) => {
    const root = document.querySelector('#material-root') as HTMLElement | null;
    if (root) await exportElementToPDFOptions(root, content.title || material.title || 'material', { hideAnswers });
  };

  const handleExportDocx = async (includeAnswers?: boolean) => {
    await exportStructuredToDocxOptions(
      content,
      content.title || material.title || 'material',
      { includeAnswers }
    );
  };

  return (
    <div id="material-root" className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg max-w-4xl mx-auto">
      {/* Enhanced Header with Quality Score */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-lg">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {getTemplateIcon(material.template_id || material.file_type)}
            <div>
              <h1 className="text-2xl font-bold">{getTemplateName(material.template_id || material.file_type)}</h1>
              <p className="text-blue-100 text-sm">
                Vytvořeno {new Date(material.created_at).toLocaleDateString('cs-CZ')} • 
                <span className="ml-1">{teacherName}</span>
              </p>
            </div>
          </div>
          
          {/* Quality Score Display */}
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-300" />
              <span className="text-lg font-bold">{qualityScore}/100</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-24 bg-blue-200 bg-opacity-30 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    qualityScore >= 80 ? 'bg-green-400' : 
                    qualityScore >= 60 ? 'bg-yellow-400' : 'bg-red-400'
                  }`}
                  style={{ width: `${qualityScore}%` }}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQualityDetails(!showQualityDetails)}
                className="text-white border-white hover:bg-white hover:text-blue-600"
              >
                <Info className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Quality Details Panel */}
        {showQualityDetails && (
          <div className="mt-4 p-4 bg-white bg-opacity-10 rounded-lg">
            <h3 className="font-medium mb-2">Detailní analýza kvality</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Celkové skóre:</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold">{qualityScore}/100</span>
                  {qualityScore >= 80 && <CheckCircle className="w-4 h-4 text-green-300" />}
                  {qualityScore < 60 && <AlertTriangle className="w-4 h-4 text-yellow-300" />}
                </div>
              </div>
              <div>
                <span className="font-medium">Stav validace:</span>
                <div className="mt-1">
                  {validationIssues.length === 0 ? (
                    <span className="text-green-300 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Bez problémů
                    </span>
                  ) : (
                    <span className="text-yellow-300 flex items-center gap-1">
                      <AlertTriangle className="w-4 h-4" />
                      {validationIssues.length} problémů
                    </span>
                  )}
                </div>
              </div>
              <div>
                <span className="font-medium">Poslední úprava:</span>
                <div className="mt-1 text-blue-100">
                  {editHistory.length > 0 ? 
                    new Date(editHistory[0].timestamp).toLocaleTimeString('cs-CZ') : 
                    'Žádné úpravy'
                  }
                </div>
              </div>
            </div>
            
            {validationIssues.length > 0 && (
              <div className="mt-3 p-3 bg-red-500 bg-opacity-20 rounded-lg">
                <h4 className="font-medium text-red-200 mb-2">Nalezené problémy:</h4>
                <ul className="text-sm text-red-100 space-y-1">
                  {validationIssues.map((issue, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <AlertTriangle className="w-3 h-3" />
                      {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

             {/* Content Sections */}
       <div id="material-content" className="p-6 space-y-6">
        {/* Metadata Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          {Object.entries(content).map(([key, value]) => {
            if (['title', 'subject', 'gradeLevel', 'difficulty', 'duration', 'estimatedTime'].includes(key)) {
              return (
                <div key={key} className="space-y-1">
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    {getFieldLabel(key)}
                  </label>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {String(value) || 'Neuvedeno'}
                  </p>
                </div>
              );
            }
            return null;
          })}
        </div>

        {/* Main Content Sections */}
        {Object.entries(content).map(([key, value]) => {
          if (['title', 'subject', 'gradeLevel', 'difficulty', 'duration', 'estimatedTime'].includes(key)) {
            return null; // Skip metadata fields
          }
          
          if (!shouldDisplayField(key)) {
            return null; // Skip technical metadata fields
          }
          
          if (!value || (typeof value === 'string' && value.trim() === '')) {
            return null; // Skip empty fields
          }

          return (
            <div key={key} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {getFieldLabel(key)}
                  </h3>
                  <div className="flex items-center gap-2">
                    {editingSection === key ? (
                      <>
                        <Button
                          size="sm"
                          onClick={saveEdit}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Save className="w-4 h-4 mr-1" />
                          Uložit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={cancelEdit}
                        >
                          <RotateCcw className="w-4 h-4 mr-1" />
                          Zrušit
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEditing(key, String(value))}
                      >
                        <Edit3 className="w-4 h-4 mr-1" />
                        Upravit
                      </Button>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="p-4">
                {editingSection === key ? (
                  <div className="space-y-3">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 resize-none"
                      rows={Math.max(3, Math.ceil(editContent.length / 100))}
                    />
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      <Clock className="w-4 h-4" />
                      Auto-uložení za 5 sekund
                    </div>
                  </div>
                ) : (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    {renderField(key, value)}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit History */}
      {editHistory.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Historie úprav
          </h3>
          <div className="space-y-3">
            {editHistory.slice(0, 5).map((entry, index) => (
              <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    {entry.section}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400">
                    {entry.timestamp.toLocaleString('cs-CZ')}
                  </span>
                </div>
                <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                  <div className="line-through opacity-60">{entry.oldValue}</div>
                  <div className="text-green-600 dark:text-green-400">{entry.newValue}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasUnsavedChanges && (
              <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400 text-sm">
                <AlertTriangle className="w-4 h-4" />
                Neuložené změny
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => {
                if (hasUnsavedChanges) {
                  if (window.confirm('Máte neuložené změny. Opravdu chcete zavřít?')) {
                    onClose?.();
                  }
                } else {
                  onClose?.();
                }
              }}
            >
              Zavřít
            </Button>
            
                         <div className="flex items-center gap-2" data-export-hide="true">
               <Button
                 onClick={() => handleExportPDF(false)}
                 variant="outline"
               >
                 <Download className="w-4 h-4 mr-2" />
                 PDF bez odpovědí
               </Button>
               <Button
                 onClick={() => handleExportPDF(true)}
               >
                 <Download className="w-4 h-4 mr-2" />
                 PDF s odpověďmi
               </Button>
               <Button
                 onClick={() => handleExportDocx(true)}
                 variant="outline"
               >
                 <Download className="w-4 h-4 mr-2" />
                 DOCX
               </Button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialDisplay;
