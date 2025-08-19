import React, { useState } from 'react';
import { 
  Eye, Edit3, Check, X, ArrowLeft, ArrowRight, 
  AlertCircle, Lightbulb, Settings, Sparkles,
  FileText, BookOpen, Target, Users, Presentation,
  Clock, GraduationCap, Tag, Plus, Minus
} from 'lucide-react';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { useToast } from '../../contexts/ToastContext';
import { any } from 'zod/v4';

interface MaterialPreview {
  id: string;
  type: 'lesson_plan' | 'worksheet' | 'quiz' | 'project' | 'presentation' | 'activity';
  title: string;
  subject: string;
  grade_level: string;
  duration?: string;
  content: any;
  generated_at: string;
  estimated_credits: number;
}

interface ApprovalStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  issues?: string[];
}

interface MaterialApprovalWorkflowProps {
  preview: MaterialPreview;
  onApprove: (modifications?: any) => void;
  onReject: (reason: string) => void;
  onModify: (modifications: any) => void;
  onCancel: () => void;
}

const MaterialApprovalWorkflow: React.FC<MaterialApprovalWorkflowProps> = ({
  preview,
  onApprove,
  onReject,
  onModify,
  onCancel
}) => {
  const { showToast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [modifications, setModifications] = useState<any>({});
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');

  // Approval steps
  const approvalSteps: ApprovalStep[] = [
    {
      id: 'basic_info',
      title: 'Základní informace',
      description: 'Zkontrolujte název, předmět a ročník',
      completed: false
    },
    {
      id: 'content_review',
      title: 'Obsah materiálu',
      description: 'Projděte si obsah a strukturu materiálu',
      completed: false
    },
    {
      id: 'customization',
      title: 'Přizpůsobení',
      description: 'Upravte materiál podle svých potřeb',
      completed: false
    },
    {
      id: 'final_approval',
      title: 'Finální schválení',
      description: 'Potvrďte generování finálních materiálů',
      completed: false
    }
  ];

  const [steps, setSteps] = useState(approvalSteps);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lesson_plan': return <BookOpen className="w-5 h-5" />;
      case 'worksheet': return <FileText className="w-5 h-5" />;
      case 'quiz': return <Target className="w-5 h-5" />;
      case 'project': return <Sparkles className="w-5 h-5" />;
      case 'presentation': return <Presentation className="w-5 h-5" />;
      case 'activity': return <Users className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'lesson_plan': return 'Plán hodiny';
      case 'worksheet': return 'Pracovní list';
      case 'quiz': return 'Kvíz';
      case 'project': return 'Projekt';
      case 'presentation': return 'Prezentace';
      case 'activity': return 'Aktivita';
      default: return 'Materiál';
    }
  };

  const handleStepComplete = (stepIndex: number) => {
    const newSteps = [...steps];
    newSteps[stepIndex].completed = true;
    setSteps(newSteps);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      handleStepComplete(currentStep);
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleModificationChange = (field: string, value: any) => {
    setModifications(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleApproveWithModifications = () => {
    handleStepComplete(currentStep);
    onApprove(Object.keys(modifications).length > 0 ? modifications : undefined);
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      showToast({ type: 'error', message: 'Prosím zadejte důvod zamítnutí' });
      return;
    }
    onReject(rejectionReason);
    setShowRejectionModal(false);
  };

  const renderStepContent = () => {
    const step = steps[currentStep];

    switch (step.id) {
      case 'basic_info':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                {getTypeIcon(preview.type)}
                <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                  {getTypeName(preview.type)}
                </h3>
              </div>
              <p className="text-neutral-600 dark:text-neutral-400">
                Zkontrolujte základní informace o materiálu
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Název materiálu
                </label>
                <input
                  type="text"
                  value={modifications.title || preview.title}
                  onChange={(e) => handleModificationChange('title', e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Předmět
                </label>
                <input
                  type="text"
                  value={modifications.subject || preview.subject}
                  onChange={(e) => handleModificationChange('subject', e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Ročník
                </label>
                <input
                  type="text"
                  value={modifications.grade_level || preview.grade_level}
                  onChange={(e) => handleModificationChange('grade_level', e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              {preview.duration && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    Délka
                  </label>
                  <input
                    type="text"
                    value={modifications.duration || preview.duration}
                    onChange={(e) => handleModificationChange('duration', e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                    Tip
                  </h4>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Můžete upravit základní informace podle svých potřeb. Změny se projeví ve finálním materiálu.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'content_review':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Náhled obsahu
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Projděte si obsah a strukturu materiálu
              </p>
            </div>

            <div className="bg-neutral-50 dark:bg-neutral-800 rounded-lg p-6 max-h-96 overflow-y-auto">
              {preview.type === 'lesson_plan' && preview.content.activities && (
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                    Aktivity hodiny
                  </h4>
                  <div className="space-y-3">
                    {preview.content.activities.map((activity: any, index: number) => (
                      <div key={index} className="bg-white dark:bg-neutral-700 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium text-neutral-900 dark:text-neutral-100">
                            {activity.name}
                          </h5>
                          <div className="flex items-center gap-2 text-sm text-neutral-500">
                            <Clock className="w-4 h-4" />
                            {activity.time}
                          </div>
                        </div>
                        {activity.description && (
                          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                            {activity.description}
                          </p>
                        )}
                        {activity.outcome && (
                          <div className="text-sm text-green-600 dark:text-green-400">
                            <strong>Výsledek:</strong> {activity.outcome}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {preview.type === 'worksheet' && preview.content.questions && (
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                    Otázky ({preview.content.questions.length})
                  </h4>
                  <div className="space-y-3">
                    {preview.content.questions.slice(0, 3).map((question: any, index: number) => (
                      <div key={index} className="bg-white dark:bg-neutral-700 p-4 rounded-lg">
                        <div className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                          {index + 1}. {question.problem || question.question}
                        </div>
                        <div className="text-sm text-green-600 dark:text-green-400">
                          <strong>Odpověď:</strong> {question.answer}
                        </div>
                      </div>
                    ))}
                    {preview.content.questions.length > 3 && (
                      <div className="text-center text-sm text-neutral-500 dark:text-neutral-400">
                        ... a dalších {preview.content.questions.length - 3} otázek
                      </div>
                    )}
                  </div>
                </div>
              )}

              {preview.type === 'quiz' && preview.content.questions && (
                <div>
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-4">
                    Kvízové otázky ({preview.content.questions.length})
                  </h4>
                  <div className="space-y-3">
                    {preview.content.questions.slice(0, 3).map((question: any, index: number) => (
                      <div key={index} className="bg-white dark:bg-neutral-700 p-4 rounded-lg">
                        <div className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                          {question.question}
                        </div>
                        {question.options && (
                          <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                            {question.options.map((option: string, optIndex: number) => (
                              <div key={optIndex}>
                                {String.fromCharCode(65 + optIndex)}) {option}
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="text-sm text-green-600 dark:text-green-400">
                          <strong>Správná odpověď:</strong> {question.answer}
                        </div>
                      </div>
                    ))}
                    {preview.content.questions.length > 3 && (
                      <div className="text-center text-sm text-neutral-500 dark:text-neutral-400">
                        ... a dalších {preview.content.questions.length - 3} otázek
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Eye className="w-5 h-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900 dark:text-green-100 mb-1">
                    Kontrola obsahu
                  </h4>
                  <p className="text-sm text-green-800 dark:text-green-200">
                    Zkontrolujte, zda obsah odpovídá vašim požadavkům. V dalším kroku můžete provést úpravy.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'customization':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Přizpůsobení materiálu
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Upravte materiál podle svých specifických potřeb
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Dodatečné pokyny pro AI
                </label>
                <textarea
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="Např. 'Přidej více praktických příkladů', 'Zjednodušuj terminologii', 'Zaměř se na vizuální learners'..."
                  rows={4}
                  className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Tyto pokyny budou použity k vylepšení materiálu
                </p>
              </div>

              {preview.type === 'lesson_plan' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Styl výuky
                    </label>
                    <select
                      value={modifications.teaching_style || 'interactive'}
                      onChange={(e) => handleModificationChange('teaching_style', e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    >
                      <option value="interactive">Interaktivní</option>
                      <option value="traditional">Tradiční</option>
                      <option value="project_based">Projektová</option>
                      <option value="discovery">Objevná</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Počet žáků
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={modifications.student_count || 25}
                      onChange={(e) => handleModificationChange('student_count', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                </div>
              )}

              {preview.type === 'worksheet' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Obtížnost
                    </label>
                    <select
                      value={modifications.difficulty || 'medium'}
                      onChange={(e) => handleModificationChange('difficulty', e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    >
                      <option value="easy">Snadná</option>
                      <option value="medium">Střední</option>
                      <option value="hard">Náročná</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Počet otázek
                    </label>
                    <input
                      type="number"
                      min="5"
                      max="50"
                      value={modifications.question_count || preview.content.questions?.length || 10}
                      onChange={(e) => handleModificationChange('question_count', parseInt(e.target.value))}
                      className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Štítky
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {(modifications.tags || []).map((tag: string, index: number) => (
                    <span key={index} className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm">
                      <Tag className="w-3 h-3" />
                      {tag}
                      <button
                        onClick={() => {
                          const newTags = [...(modifications.tags || [])];
                          newTags.splice(index, 1);
                          handleModificationChange('tags', newTags);
                        }}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Přidat štítek..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const input = e.target as HTMLInputElement;
                        const tag = input.value.trim();
                        if (tag && !(modifications.tags || []).includes(tag)) {
                          handleModificationChange('tags', [...(modifications.tags || []), tag]);
                          input.value = '';
                        }
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                  />
                </div>
              </div>
            </div>

            <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Settings className="w-5 h-5 text-orange-500 mt-0.5" />
                <div>
                  <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-1">
                    Přizpůsobení
                  </h4>
                  <p className="text-sm text-orange-800 dark:text-orange-200">
                    Všechna přizpůsobení budou aplikována při finálním generování. Můžete je kdykoli změnit.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );

      case 'final_approval':
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100 mb-2">
                Finální schválení
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Zkontrolujte všechny detaily před generováním
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  Přehled materiálu
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Typ:</span>
                    <span className="text-neutral-900 dark:text-neutral-100">{getTypeName(preview.type)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Název:</span>
                    <span className="text-neutral-900 dark:text-neutral-100">{modifications.title || preview.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Předmět:</span>
                    <span className="text-neutral-900 dark:text-neutral-100">{modifications.subject || preview.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-600 dark:text-neutral-400">Ročník:</span>
                    <span className="text-neutral-900 dark:text-neutral-100">{modifications.grade_level || preview.grade_level}</span>
                  </div>
                  {(modifications.duration || preview.duration) && (
                    <div className="flex justify-between">
                      <span className="text-neutral-600 dark:text-neutral-400">Délka:</span>
                      <span className="text-neutral-900 dark:text-neutral-100">{modifications.duration || preview.duration}</span>
                    </div>
                  )}
                </div>
              </Card>

              <Card>
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Co se vygeneruje
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    Hlavní materiál ({getTypeName(preview.type)})
                  </div>
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    PDF verze pro tisk
                  </div>
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    DOCX pro úpravy
                  </div>
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    Interaktivní HTML verze
                  </div>
                  {preview.type === 'presentation' && (
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <Check className="w-4 h-4" />
                      Prezentační slidy
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                    Odhadované náklady
                  </h4>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {preview.estimated_credits} kreditů
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    Zahrnuje generování hlavního materiálu a všech doplňkových formátů
                  </p>
                </div>
              </div>
            </div>

            {Object.keys(modifications).length > 0 && (
              <div className="bg-orange-50 dark:bg-orange-950 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                <h4 className="font-medium text-orange-900 dark:text-orange-100 mb-2">
                  Provedené úpravy
                </h4>
                <div className="text-sm text-orange-800 dark:text-orange-200">
                  {Object.entries(modifications).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2">
                      <Edit3 className="w-3 h-3" />
                      <span className="capitalize">{key.replace('_', ' ')}:</span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
            Schválení materiálu
          </h2>
          <Button variant="ghost" onClick={onCancel}>
            ×
          </Button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2
                  ${index === currentStep 
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400'
                    : step.completed
                    ? 'border-green-500 bg-green-50 dark:bg-green-950 text-green-600 dark:text-green-400'
                    : 'border-neutral-300 dark:border-neutral-600 bg-neutral-50 dark:bg-neutral-800 text-neutral-400'
                  }
                `}>
                  {step.completed ? <Check className="w-4 h-4" /> : index + 1}
                </div>
                <div className="ml-3 hidden md:block">
                  <div className={`text-sm font-medium ${
                    index === currentStep
                      ? 'text-blue-600 dark:text-blue-400'
                      : step.completed
                      ? 'text-green-600 dark:text-green-400'
                      : 'text-neutral-500 dark:text-neutral-400'
                  }`}>
                    {step.title}
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <ArrowRight className="w-4 h-4 text-neutral-400 mx-4" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {renderStepContent()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-neutral-200 dark:border-neutral-700">
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowRejectionModal(true)}
              className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400"
            >
              <X className="w-4 h-4 mr-2" />
              Zamítnout
            </Button>
          </div>

          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="secondary" onClick={handlePrevious}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Zpět
              </Button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext}>
                Další
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleApproveWithModifications}>
                <Check className="w-4 h-4 mr-2" />
                Schválit a generovat
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Rejection Modal */}
      {showRejectionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-60">
          <Card className="w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100 mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-500" />
                Zamítnutí materiálu
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Důvod zamítnutí
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Popište, proč materiál neodpovídá vašim požadavkům..."
                  rows={4}
                  className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setShowRejectionModal(false)}
                >
                  Zrušit
                </Button>
                <Button
                  variant="primary"
                  onClick={handleReject}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Zamítnout materiál
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MaterialApprovalWorkflow;