import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, BookOpen, Target, Sparkles, Users, Presentation, Tag, Download } from 'lucide-react';
import Button from '../ui/Button';
import { exportElementToPDFOptions, exportStructuredToDocxOptions } from '../../utils/exportUtils';

interface MaterialDisplayProps {
  material: any;
  onClose?: () => void;
}

const MaterialDisplay: React.FC<MaterialDisplayProps> = ({ material, onClose }) => {
  const { user } = useAuth();
  const [teacherName, setTeacherName] = useState(user?.first_name + ' ' + user?.last_name || '');

  // Parse the content JSON if it's a string
  const content = typeof material.content === 'string' ? JSON.parse(material.content) : material.content;
  
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

  const renderField = (fieldName: string, value: any) => {
    if (!value) return null;

    const getFieldLabel = (name: string) => {
      const labels: Record<string, string> = {
        title: 'Název',
        subject: 'Předmět',
        gradeLevel: 'Ročník',
        grade_level: 'Ročník',
        difficulty: 'Obtížnost',
        learningObjectives: 'Výukové cíle',
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
        questionCount: 'Počet otázek',
        questions: 'Otázky',
        questionTypes: 'Typy otázek',
        timeLimit: 'Časový limit',
        time_limit: 'Časový limit',
        tags: 'Štítky'
      };
      return labels[name] || name;
    };

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

  const handlePrint = () => window.print();

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
    <div className="min-h-screen bg-neutral-50 print:bg-white" id="material-root">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-8 mb-6 print:shadow-none">
          {/* Title and Icon Section */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-blue-100 rounded-xl flex-shrink-0">
                {getTemplateIcon(content.template)}
              </div>
              <div className="min-w-0">
                <h1 className="text-3xl font-bold text-neutral-900 leading-tight mb-2">
                  {content.title || material.title}
                </h1>
                <div className="flex items-center space-x-3 text-neutral-600">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-neutral-100">
                    {getTemplateName(content.template)}
                  </span>
                  <span className="text-neutral-400">•</span>
                  <span className="text-neutral-600">{content.subject || 'Obecné'}</span>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2 print:hidden" data-export-hide="true">
              <Button onClick={handlePrint} variant="outline" size="sm" className="px-3 py-1.5 text-xs">
                <FileText className="w-3 h-3 mr-1" />
                Tisk
              </Button>
              <Button onClick={() => handleExportPDF(true)} variant="outline" size="sm" className="px-3 py-1.5 text-xs">
                <Download className="w-3 h-3 mr-1" />
                PDF
              </Button>
              <Button onClick={() => handleExportDocx(false)} variant="outline" size="sm" className="px-3 py-1.5 text-xs">
                <FileText className="w-3 h-3 mr-1" />
                DOCX
              </Button>
              <Button onClick={() => handleExportDocx(true)} variant="outline" size="sm" className="px-3 py-1.5 text-xs">
                <FileText className="w-3 h-3 mr-1" />
                Klíč
              </Button>
              {onClose && (
                <Button onClick={onClose} variant="ghost" size="sm" className="px-3 py-1.5 text-xs">
                  Zavřít
                </Button>
              )}
            </div>
          </div>

          {/* Material metadata */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-neutral-200">
            <div className="space-y-1">
              <span className="text-sm font-medium text-neutral-500 uppercase tracking-wide">Vytvořil</span>
              <div className="text-base font-semibold text-neutral-900">{user?.first_name} {user?.last_name}</div>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium text-neutral-500 uppercase tracking-wide">Datum</span>
              <div className="text-base font-semibold text-neutral-900">
                {new Date(material.created_at).toLocaleDateString('cs-CZ')}
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium text-neutral-500 uppercase tracking-wide">Obtížnost</span>
              <div className="text-base font-semibold text-neutral-900">{content.difficulty || 'Střední'}</div>
            </div>
            <div className="space-y-1">
              <span className="text-sm font-medium text-neutral-500 uppercase tracking-wide">Ročník</span>
              <div className="text-base font-semibold text-neutral-900">{content.gradeLevel || 'Základní škola'}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 print:shadow-none">
          {/* Student/Teacher inputs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-neutral-50 rounded-lg">
            <div data-student-only="true">
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Jméno žáka
              </label>
              <div className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm bg-white text-neutral-500">
                Vyplňte jméno žáka
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Učitel
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm"
                placeholder="Vyplňte jméno učitele"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Datum
              </label>
              <div className="px-3 py-2 bg-white border border-neutral-300 rounded-md text-sm">
                {new Date().toLocaleDateString('cs-CZ')}
              </div>
            </div>
          </div>

          {/* Material fields */}
          <div className="space-y-6">
            {Object.entries(content).map(([key, value]) => {
              // Skip certain fields that are already displayed in header
              if (['template', 'title', 'subject', 'difficulty', 'gradeLevel', 'created_at', 'status', 'questions', 'problems'].includes(key)) {
                return null;
              }
              return renderField(key, value);
            })}
          </div>

          {/* Worksheet Content Section */}
          {(content.template === 'worksheet' || material.file_type === 'worksheet' || Array.isArray(content.problems)) && (
            <div className="mt-8 pt-6 border-t border-neutral-200">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Obsah pracovního listu
              </h3>
              
              {/* If there are actual problems/questions, display them */}
              {Array.isArray(content.questions) || Array.isArray(content.problems) ? (
                <div className="space-y-4">
                  {(content.questions || content.problems).map((problem: any, index: number) => (
                    <div key={index} className="border border-neutral-200 rounded-lg p-4 bg-white">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-blue-600">
                            {index + 1}
                          </span>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <h4 className="font-medium text-neutral-900 mb-2">
                              Úloha:
                            </h4>
                            <p className="text-neutral-700 whitespace-pre-wrap">
                              {problem.question || problem.problem || problem.text || 'Úloha bez textu'}
                            </p>
                          </div>
                          {problem.answer && (
                            <div className="border-t border-neutral-100 pt-3" data-answer="true">
                              <h5 className="font-medium text-neutral-900 mb-2 flex items-center">
                                <span className="text-success-600 mr-2">✓</span>
                                Řešení:
                              </h5>
                              <p className="text-neutral-700 whitespace-pre-wrap">
                                {problem.answer}
                              </p>
                            </div>
                          )}
                          {!problem.answer && (
                            <div className="pt-3" data-student-only="true">
                              <div className="text-sm text-neutral-600 mb-2">Odpověď:</div>
                              <div className="h-8 border-b border-dashed border-neutral-400" />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* If no problems exist, show a placeholder for manual content entry */
                <div className="text-center py-8 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-300">
                  <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                  <h4 className="text-lg font-medium text-neutral-700 mb-2">
                    Pracovní list je připraven
                  </h4>
                  <p className="text-neutral-500 mb-4">
                    Tento pracovní list má nastavené parametry, ale zatím neobsahuje konkrétní úlohy.
                  </p>
                  <div className="text-sm text-neutral-400">
                    <p>• Název: {content.title}</p>
                    <p>• Předmět: {content.subject}</p>
                    <p>• Obtížnost: {content.difficulty}</p>
                    <p>• Ročník: {content.gradeLevel}</p>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-neutral-500">
                      💡 Tip: Pro generování úloh použijte chat s AI
                    </p>
                    <Button 
                      onClick={() => window.open('/chat', '_blank')}
                      variant="outline"
                      size="sm"
                    >
                      Otevřít chat s AI
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Lesson Plan tailored view */}
          {(content.template === 'lesson-plan' || content.template === 'lesson_plan') && (
            <div className="mt-8 pt-6 border-t border-neutral-200">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center">
                <BookOpen className="w-5 h-5 mr-2" />
                Struktura plánu hodiny
              </h3>
              {content.objectives && (
                <div className="mb-4">
                  <h4 className="font-medium mb-2">Cíle</h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {content.objectives.map((o: string, i: number) => <li key={i}>{o}</li>)}
                  </ul>
                </div>
              )}
              {content.activities && (
                <div className="space-y-3">
                  <h4 className="font-medium mb-2">Aktivity</h4>
                  {content.activities.map((a: any, i: number) => (
                    <div key={i} className="border border-neutral-200 rounded-lg p-3">
                      <div className="font-medium">{a.name}</div>
                      <div className="text-sm text-neutral-700 mb-2">{a.description}</div>
                      {Array.isArray(a.steps) && (
                        <ol className="list-decimal pl-5 space-y-1 text-sm">
                          {a.steps.map((s: string, j: number) => <li key={j}>{s}</li>)}
                        </ol>
                      )}
                      {a.time && <div className="text-xs text-neutral-500 mt-2">Čas: {a.time}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quiz tailored view */}
          {content.template === 'quiz' && (
            <div className="mt-8 pt-6 border-t border-neutral-200">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Otázky kvízu
              </h3>
              {Array.isArray(content.questions) && content.questions.length > 0 ? (
                <div className="space-y-4">
                  {content.questions.map((q: any, i: number) => (
                    <div key={i} className="border border-neutral-200 rounded-lg p-4 bg-white">
                      <div className="text-sm font-medium mb-2">{i + 1}. {q.question}</div>
                      {q.options && (
                        <ul className="list-disc pl-5 space-y-1 text-sm">
                          {q.options.map((opt: string, j: number) => <li key={j}>{opt}</li>)}
                        </ul>
                      )}
                      {q.answer !== undefined && (
                        <div className="text-xs text-neutral-600 mt-2">Správná odpověď: {String(q.answer)}</div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-neutral-600">Žádné otázky k zobrazení.</div>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-neutral-200 text-center text-sm text-neutral-500">
            <p>Vygenerováno pomocí EduAI-Asistent</p>
            <p>© 2025 EduAI-Asistent. Všechna práva vyhrazena.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialDisplay;
