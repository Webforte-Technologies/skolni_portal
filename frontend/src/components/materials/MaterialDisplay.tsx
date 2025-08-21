import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FileText, BookOpen, Target, Sparkles, Users, Presentation, 
  Tag, Download, Edit3, Save, RotateCcw, Eye, Star, 
  CheckCircle, AlertTriangle, Info, Clock, User
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
  const { user } = useAuth();
  const [teacherName, setTeacherName] = useState(user?.first_name + ' ' + user?.last_name || '');
  
  // Inline editing state
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editContent, setEditContent] = useState<string>('');
  const [editHistory, setEditHistory] = useState<EditHistory[]>([]);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Quality and validation state
  const [qualityScore, setQualityScore] = useState(85);
  const [validationIssues, setValidationIssues] = useState<string[]>([]);
  const [showQualityDetails, setShowQualityDetails] = useState(false);

  // Refs for content editing
  const contentRefs = useRef<Record<string, HTMLDivElement | null>>({});

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

  // Inline editing functions
  const startEditing = (section: string, content: string) => {
    setEditingSection(section);
    setEditContent(content);
    setHasUnsavedChanges(true);
  };

  const saveEdit = () => {
    if (editingSection && editContent !== content[editingSection]) {
      // Add to edit history
      const historyEntry: EditHistory = {
        timestamp: new Date(),
        section: editingSection,
        oldValue: content[editingSection] || '',
        newValue: editContent
      };
      
      setEditHistory(prev => [historyEntry, ...prev]);
      
      // Update content
      const updatedContent = { ...content, [editingSection]: editContent };
      if (onContentUpdate) {
        onContentUpdate(updatedContent);
      }
      
      // Update quality score based on content changes
      updateQualityScore(updatedContent);
    }
    
    setEditingSection(null);
    setEditContent('');
    setHasUnsavedChanges(false);
  };

  const cancelEdit = () => {
    setEditingSection(null);
    setEditContent('');
    setHasUnsavedChanges(false);
  };

  const updateQualityScore = (updatedContent: any) => {
    // Simple quality scoring algorithm
    let score = 85;
    let issues: string[] = [];
    
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
  }, [hasUnsavedChanges, editingSection]);

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
    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow-lg max-w-4xl mx-auto">
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
      <div className="p-6 space-y-6">
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
            
            <Button
              onClick={() => {
                // Export functionality
                const element = document.getElementById('material-content');
                if (element) {
                  exportElementToPDFOptions(element, `${material.title || 'material'}.pdf`);
                }
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportovat PDF
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialDisplay;
