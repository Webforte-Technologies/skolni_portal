import React, { useState } from 'react';
import Header from '../../components/layout/Header';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useToast } from '../../contexts/ToastContext';
import { streamingService } from '../../services/streamingService';

const AIGeneratorPage: React.FC = () => {
  const { showToast } = useToast();
  const [type, setType] = useState<'worksheet' | 'lesson_plan' | 'quiz' | 'project' | 'presentation' | 'activity'>('lesson_plan');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [gradeLevel, setGradeLevel] = useState('');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamPreview, setStreamPreview] = useState('');
  const [teachingStyle, setTeachingStyle] = useState('');
  const [worksheetDifficulty, setWorksheetDifficulty] = useState('');
  const [batch, setBatch] = useState(false);

  // In batch mode we will generate a worksheet too, so ensure we have a usable topic
  const derivedWorksheetTopic = (topic || '').trim() || (title || '').trim() || (subject || '').trim();
  const canGenerate = batch
    ? derivedWorksheetTopic.length >= 3
    : (type !== 'worksheet' || topic.trim().length >= 3);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStreamPreview('');
    try {
      const createdIds: string[] = [];
      const runWorksheet = async () => streamingService.generateWorksheetStream(derivedWorksheetTopic, {
          onStart: () => setStreamPreview('Generuji pracovní list...'),
          onChunk: (c) => setStreamPreview((p) => p + c),
          onEnd: (meta) => {
            showToast({ type: 'success', message: 'Pracovní list vygenerován a uložen do knihovny.' });
            if (meta.file_id) createdIds.push(meta.file_id);
            if (!batch && meta.file_id) {
              window.location.href = `/materials/${meta.file_id}`;
            }
          },
          onError: (m) => showToast({ type: 'error', message: m })
        }, { question_count: questionCount, difficulty: worksheetDifficulty, teaching_style: teachingStyle });

      const runLesson = async () => streamingService.generateLessonPlanStream({ title, subject, grade_level: gradeLevel }, {
          onStart: () => setStreamPreview('Generuji plán hodiny...'),
          onChunk: (c) => setStreamPreview((p) => p + c),
          onEnd: (meta) => {
            showToast({ type: 'success', message: 'Plán hodiny vygenerován a uložen do knihovny.' });
            if (meta.file_id) createdIds.push(meta.file_id);
            if (!batch && meta.file_id) {
              window.location.href = `/materials/${meta.file_id}`;
            }
          },
          onError: (m) => showToast({ type: 'error', message: m })
        });

      const runQuiz = async () => streamingService.generateQuizStream({ title, subject, grade_level: gradeLevel, question_count: questionCount }, {
          onStart: () => setStreamPreview('Generuji kvíz...'),
          onChunk: (c) => setStreamPreview((p) => p + c),
          onEnd: (meta) => {
            showToast({ type: 'success', message: 'Kvíz vygenerován a uložen do knihovny.' });
            if (meta.file_id) createdIds.push(meta.file_id);
            if (!batch && meta.file_id) {
              window.location.href = `/materials/${meta.file_id}`;
            }
          },
          onError: (m) => showToast({ type: 'error', message: m })
        });

      const runProject = async () => streamingService.generateProjectStream({ title, subject, grade_level: gradeLevel }, {
          onStart: () => setStreamPreview('Generuji projekt...'),
          onChunk: (c) => setStreamPreview((p) => p + c),
          onEnd: (meta) => {
            showToast({ type: 'success', message: 'Projekt vygenerován a uložen do knihovny.' });
            if (meta.file_id) createdIds.push(meta.file_id);
            if (!batch && meta.file_id) {
              window.location.href = `/materials/${meta.file_id}`;
            }
          },
          onError: (m) => showToast({ type: 'error', message: m })
        });

      const runPresentation = async () => streamingService.generatePresentationStream({ title, subject, grade_level: gradeLevel }, {
          onStart: () => setStreamPreview('Generuji prezentaci...'),
          onChunk: (c) => setStreamPreview((p) => p + c),
          onEnd: (meta) => {
            showToast({ type: 'success', message: 'Prezentace vygenerována a uložena do knihovny.' });
            if (meta.file_id) createdIds.push(meta.file_id);
            if (!batch && meta.file_id) {
              window.location.href = `/materials/${meta.file_id}`;
            }
          },
          onError: (m) => showToast({ type: 'error', message: m })
        });

      const runActivity = async () => streamingService.generateActivityStream({ title, subject, grade_level: gradeLevel, duration }, {
          onStart: () => setStreamPreview('Generuji aktivitu...'),
          onChunk: (c) => setStreamPreview((p) => p + c),
          onEnd: (meta) => {
            showToast({ type: 'success', message: 'Aktivita vygenerována a uložena do knihovny.' });
            if (meta.file_id) createdIds.push(meta.file_id);
            if (!batch && meta.file_id) {
              window.location.href = `/materials/my-materials?new=${meta.file_id}`;
            }
          },
          onError: (m) => showToast({ type: 'error', message: m })
        });

      if (batch) {
        // Batch: generate lesson + worksheet + quiz (common course pack)
        await runLesson();
        await runWorksheet();
        await runQuiz();
        if (createdIds.length > 0) {
          const first = createdIds[0];
          showToast({ type: 'success', message: 'Balíček vygenerován. Otevírám první materiál…' });
          window.location.href = `/materials/${first}`;
        }
      } else {
        if (type === 'worksheet') await runWorksheet();
        else if (type === 'lesson_plan') await runLesson();
        else if (type === 'quiz') await runQuiz();
        else if (type === 'project') await runProject();
        else if (type === 'presentation') await runPresentation();
        else if (type === 'activity') await runActivity();
      }
    } catch (e) {
      const { errorToMessage } = await import('../../services/apiClient');
      showToast({ type: 'error', message: errorToMessage(e) });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">AI Generátor</h1>
        <Card title="Zvolte typ materiálu">
          <div className="flex gap-2 flex-wrap">
            <Button variant={type === 'worksheet' ? 'primary' : 'secondary'} onClick={() => setType('worksheet')}>Pracovní list</Button>
            <Button variant={type === 'lesson_plan' ? 'primary' : 'secondary'} onClick={() => setType('lesson_plan')}>Plán hodiny</Button>
            <Button variant={type === 'quiz' ? 'primary' : 'secondary'} onClick={() => setType('quiz')}>Kvíz</Button>
            <Button variant={type === 'project' ? 'primary' : 'secondary'} onClick={() => setType('project')}>Projekt</Button>
            <Button variant={type === 'presentation' ? 'primary' : 'secondary'} onClick={() => setType('presentation')}>Prezentace</Button>
            <Button variant={type === 'activity' ? 'primary' : 'secondary'} onClick={() => setType('activity')}>Aktivita</Button>
          </div>
        </Card>

        <Card title="Parametry">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {type === 'worksheet' ? (
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1">Téma pracovního listu</label>
                <input value={topic} onChange={(e) => setTopic(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-neutral-800 dark:text-neutral-100" placeholder="např. Kvadratické rovnice" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Počet otázek</label>
                    <input type="number" min={5} max={100} value={questionCount} onChange={(e) => setQuestionCount(parseInt(e.target.value || '10', 10))} className="w-full px-3 py-2 border rounded-md dark:bg-neutral-800 dark:text-neutral-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Obtížnost (volitelné)</label>
                    <input value={worksheetDifficulty} onChange={(e) => setWorksheetDifficulty(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-neutral-800 dark:text-neutral-100" placeholder="např. začátečník/střední/pokročilý" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Styl výuky (volitelné)</label>
                    <input value={teachingStyle} onChange={(e) => setTeachingStyle(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-neutral-800 dark:text-neutral-100" placeholder="např. heuristický, frontální, projektový" />
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium mb-1">Název</label>
                  <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-neutral-800 dark:text-neutral-100" placeholder="např. Úvod do zlomků" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Předmět</label>
                  <input value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-neutral-800 dark:text-neutral-100" placeholder="např. Matematika" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ročník</label>
                  <input value={gradeLevel} onChange={(e) => setGradeLevel(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-neutral-800 dark:text-neutral-100" placeholder="např. 7. třída" />
                </div>
              </>
            )}
            {type === 'quiz' && (
              <div>
                <label className="block text-sm font-medium mb-1">Počet otázek</label>
                <input type="number" min={5} max={100} value={questionCount} onChange={(e) => setQuestionCount(parseInt(e.target.value || '10', 10))} className="w-full px-3 py-2 border rounded-md dark:bg-neutral-800 dark:text-neutral-100" />
              </div>
            )}
            {type === 'activity' && (
              <div>
                <label className="block text-sm font-medium mb-1">Délka aktivity</label>
                <input value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full px-3 py-2 border rounded-md dark:bg-neutral-800 dark:text-neutral-100" placeholder="např. 10 min" />
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={batch} onChange={(e) => setBatch(e.target.checked)} />
              Vygenerovat balíček (Plán hodiny + Pracovní list + Kvíz)
            </label>
            <Button onClick={handleGenerate} isLoading={isGenerating} disabled={!canGenerate}>
              Vygenerovat
            </Button>
          </div>
          {batch && derivedWorksheetTopic.length < 3 && (
            <div className="mt-2 text-xs text-red-600">Pro balíček prosím zadejte alespoň název, předmět nebo téma pracovního listu (min. 3 znaky), aby šlo vytvořit pracovní list.</div>
          )}
          {type === 'worksheet' && topic.trim().length < 3 && (
            <div className="mt-2 text-xs text-red-600">Zadejte prosím téma alespoň o 3 znacích.</div>
          )}
        </Card>

        <Card title="Náhled (stream)">
          <pre className="whitespace-pre-wrap text-sm text-neutral-800 dark:text-neutral-100 bg-neutral-50 dark:bg-neutral-800 p-3 rounded-md min-h-[160px]">{streamPreview}</pre>
        </Card>
      </main>
    </div>
  );
};

export default AIGeneratorPage;


