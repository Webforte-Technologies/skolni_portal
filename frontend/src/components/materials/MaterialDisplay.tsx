import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { FileText, BookOpen, Target, Sparkles, Users, Presentation, Calendar, Tag } from 'lucide-react';
import Button from '../ui/Button';

interface MaterialDisplayProps {
  material: any;
  onClose?: () => void;
}

const MaterialDisplay: React.FC<MaterialDisplayProps> = ({ material, onClose }) => {
  const { user } = useAuth();
  const [studentName, setStudentName] = useState('');
  const [teacherName, setTeacherName] = useState(user?.first_name + ' ' + user?.last_name || '');

  // Parse the content JSON if it's a string
  const content = typeof material.content === 'string' ? JSON.parse(material.content) : material.content;
  
  // Get template icon based on template ID
  const getTemplateIcon = (templateId: string) => {
    switch (templateId) {
      case 'worksheet':
        return <FileText className="w-6 h-6" />;
      case 'lesson-plan':
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
        return <FileText className="w-6 h-6" />;
    }
  };

  const getTemplateName = (templateId: string) => {
    switch (templateId) {
      case 'worksheet':
        return 'Pracovní list';
      case 'lesson-plan':
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
        return 'Materiál';
    }
  };

  const renderField = (fieldName: string, value: any) => {
    if (!value) return null;

    const getFieldLabel = (name: string) => {
      const labels: Record<string, string> = {
        title: 'Název',
        subject: 'Předmět',
        gradeLevel: 'Ročník',
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
        questionTypes: 'Typy otázek',
        timeLimit: 'Časový limit',
        tags: 'Štítky'
      };
      return labels[name] || name;
    };

    const renderValue = (val: any) => {
      if (Array.isArray(val)) {
        return val.join(', ');
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

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-neutral-50 print:bg-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6 print:shadow-none">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                {getTemplateIcon(content.template)}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-neutral-900">
                  {content.title || material.title}
                </h1>
                <p className="text-neutral-600">
                  {getTemplateName(content.template)} • {content.subject || 'Obecné'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2 print:hidden">
              <Button onClick={handlePrint} variant="outline">
                Tisk
              </Button>
              {onClose && (
                <Button onClick={onClose} variant="ghost">
                  Zavřít
                </Button>
              )}
            </div>
          </div>

          {/* Material metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-neutral-500">Vytvořil:</span>
              <div className="font-medium">{user?.first_name} {user?.last_name}</div>
            </div>
            <div>
              <span className="text-neutral-500">Datum:</span>
              <div className="font-medium">
                {new Date(material.created_at).toLocaleDateString('cs-CZ')}
              </div>
            </div>
            <div>
              <span className="text-neutral-500">Obtížnost:</span>
              <div className="font-medium">{content.difficulty || 'Střední'}</div>
            </div>
            <div>
              <span className="text-neutral-500">Ročník:</span>
              <div className="font-medium">{content.gradeLevel || 'Základní škola'}</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 print:shadow-none">
          {/* Student/Teacher inputs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-neutral-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Jméno žáka
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-md text-sm"
                placeholder="Vyplňte jméno žáka"
              />
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
              if (['template', 'title', 'subject', 'difficulty', 'gradeLevel', 'created_at', 'status'].includes(key)) {
                return null;
              }
              return renderField(key, value);
            })}
          </div>

          {/* Worksheet Content Section */}
          {content.template === 'worksheet' && (
            <div className="mt-8 pt-6 border-t border-neutral-200">
              <h3 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Obsah pracovního listu
              </h3>
              
              {/* If there are actual problems/questions, display them */}
              {content.problems ? (
                <div className="space-y-4">
                  {content.problems.map((problem: any, index: number) => (
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
                            <div className="border-t border-neutral-100 pt-3">
                              <h5 className="font-medium text-neutral-900 mb-2 flex items-center">
                                <span className="text-success-600 mr-2">✓</span>
                                Řešení:
                              </h5>
                              <p className="text-neutral-700 whitespace-pre-wrap">
                                {problem.answer}
                              </p>
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
