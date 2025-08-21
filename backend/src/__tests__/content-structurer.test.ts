import { ContentStructurer, StructuredContent, ScaffoldingElement } from '../services/ContentStructurer';
import { MaterialSubtype } from '../services/EnhancedPromptBuilder';

describe('ContentStructurer', () => {
  let structurer: ContentStructurer;

  beforeEach(() => {
    structurer = new ContentStructurer();
  });

  describe('structureContent', () => {
    it('should structure worksheet content with scaffolding', () => {
      const worksheetContent = {
        title: 'Matematické úlohy',
        instructions: 'Řešte postupně',
        questions: [
          {
            problem: '2 + 3 = ?',
            answer: '5',
            type: 'calculation'
          },
          {
            problem: 'Vypočítejte obvod čtverce se stranou 4 cm',
            answer: '16 cm',
            type: 'geometry'
          },
          {
            problem: 'Řešte rovnici: 2x + 5 = 13',
            answer: 'x = 4',
            type: 'algebra'
          }
        ],
        grade_level: '7. třída ZŠ'
      };

      const result = structurer.structureContent(worksheetContent, 'worksheet');

      expect(result.originalContent).toEqual(worksheetContent);
      expect(result.structuredContent).toBeDefined();
      expect(result.scaffolding.length).toBeGreaterThan(0);
      expect(result.difficultyProgression.length).toBeGreaterThan(0);
      expect(result.educationalMetadata).toBeDefined();
    });

    it('should structure lesson plan content', () => {
      const lessonContent = {
        title: 'Úvod do geometrie',
        subject: 'matematika',
        grade_level: '6. třída ZŠ',
        duration: '45 min',
        objectives: ['Student se naučí základy geometrie', 'Žák dokáže rozpoznat geometrické tvary'],
        activities: [
          {
            name: 'Úvod',
            description: 'Představení tématu',
            time: '10 min',
            steps: ['Přivítání', 'Motivace']
          },
          {
            name: 'Výklad',
            description: 'Geometrické tvary',
            time: '25 min',
            steps: ['Definice', 'Příklady', 'Cvičení']
          },
          {
            name: 'Závěr',
            description: 'Shrnutí',
            time: '10 min',
            steps: ['Opakování', 'Domácí úkol']
          }
        ]
      };

      const result = structurer.structureContent(lessonContent, 'lesson-plan');

      expect(result.structuredContent.activities).toBeDefined();
      expect(result.structuredContent.transitions).toBeDefined();
      expect(result.educationalMetadata.bloomsTaxonomyLevels.length).toBeGreaterThanOrEqual(0);
    });

    it('should add subtype-specific structuring', () => {
      const subtype: MaterialSubtype = {
        id: 'practice-problems',
        name: 'Cvičné úlohy',
        description: 'Strukturované cvičení',
        parentType: 'worksheet',
        specialFields: [],
        promptModifications: []
      };

      const content = {
        title: 'Cvičné úlohy',
        questions: [
          { problem: '1 + 1', answer: '2' },
          { problem: '2 + 2', answer: '4' }
        ]
      };

      const result = structurer.structureContent(content, 'worksheet', subtype);

      expect(result.structuredContent.warmUp).toBeDefined();
      expect(result.structuredContent.bonus).toBeDefined();
    });
  });

  describe('addScaffolding', () => {
    it('should add step-by-step scaffolding for complex questions', () => {
      const content = {
        questions: [
          {
            problem: 'Řešte složitou algebraickou rovnici: 3x² + 2x - 5 = 0',
            answer: 'x = 1 nebo x = -5/3',
            type: 'algebra'
          }
        ]
      };

      const scaffolding = structurer.addScaffolding(content, 'worksheet');

      expect(scaffolding.length).toBeGreaterThan(0);
      expect(scaffolding.some(s => s.type === 'step')).toBe(true);
    });

    it('should add example scaffolding for difficult content', () => {
      const content = {
        questions: [
          {
            problem: 'Velmi složitá úloha s mnoha kroky a komplexními výpočty',
            answer: 'Složitá odpověď',
            type: 'complex'
          }
        ]
      };

      const scaffolding = structurer.addScaffolding(content, 'worksheet');

      expect(scaffolding.some(s => s.type === 'example')).toBe(true);
    });

    it('should add activation scaffolding for lesson plans', () => {
      const content = {
        activities: [
          {
            name: 'Hlavní aktivita',
            description: 'Výklad nového učiva'
          }
        ]
      };

      const scaffolding = structurer.addScaffolding(content, 'lesson-plan');

      expect(scaffolding.some(s => s.type === 'reminder')).toBe(true);
    });

    it('should sort scaffolding by position', () => {
      const content = {
        questions: [
          { problem: 'Otázka 1', answer: 'Odpověď 1' },
          { problem: 'Složitá otázka 2 s mnoha kroky', answer: 'Odpověď 2' },
          { problem: 'Otázka 3', answer: 'Odpověď 3' }
        ]
      };

      const scaffolding = structurer.addScaffolding(content, 'worksheet');

      // Check that scaffolding is sorted by position
      for (let i = 1; i < scaffolding.length; i++) {
        expect(scaffolding[i].position).toBeGreaterThanOrEqual(scaffolding[i - 1].position);
      }
    });
  });

  describe('organizeDifficultyProgression', () => {
    it('should organize worksheet difficulty progression', () => {
      const content = {
        questions: [
          { problem: '1 + 1', answer: '2' },
          { problem: '2x + 3 = 7', answer: 'x = 2' },
          { problem: 'Složitá algebraická rovnice', answer: 'Složitá odpověď' }
        ]
      };

      const progression = structurer.organizeDifficultyProgression(content, 'worksheet');

      expect(progression.length).toBeGreaterThan(0);
      expect(progression[0].level).toBe(1);
      expect(progression[0].description).toContain('Základní');
    });

    it('should organize lesson plan progression', () => {
      const content = {
        activities: [
          { name: 'Úvod', time: '10 min' },
          { name: 'Výklad', time: '25 min' },
          { name: 'Cvičení', time: '10 min' }
        ]
      };

      const progression = structurer.organizeDifficultyProgression(content, 'lesson-plan');

      expect(progression.length).toBe(3);
      expect(progression[0].description).toContain('Úvod');
      expect(progression[1].description).toContain('Výklad');
      expect(progression[2].description).toContain('Aplikace');
    });

    it('should create basic progression for unknown types', () => {
      const content = { title: 'Test content' };

      const progression = structurer.organizeDifficultyProgression(content, 'activity');

      expect(progression.length).toBe(2);
      expect(progression[0].description).toContain('Základní');
      expect(progression[1].description).toContain('Pokročilá');
    });
  });

  describe('addEducationalMetadata', () => {
    it('should analyze Bloom taxonomy levels', () => {
      const content = {
        instructions: 'Zapamatujte si definice, vysvětlete pojmy, aplikujte vzorce, analyzujte výsledky',
        questions: [
          { problem: 'Definujte pojem', answer: 'Definice' },
          { problem: 'Vytvořte nový model', answer: 'Model' }
        ]
      };

      const metadata = structurer.addEducationalMetadata(content, 'worksheet');

      expect(metadata.bloomsTaxonomyLevels.length).toBeGreaterThan(0);
      expect(metadata.bloomsTaxonomyLevels.some(level => level.level === 'remember')).toBe(true);
      expect(metadata.bloomsTaxonomyLevels.some(level => level.level === 'create')).toBe(true);
    });

    it('should analyze learning styles', () => {
      const content = {
        instructions: 'Podívejte se na obrázek, poslouchejte vysvětlení, prakticky si vyzkoušejte',
        activities: [
          { description: 'Vizuální diagram a schéma' },
          { description: 'Diskutujte ve skupinách' },
          { description: 'Manipulujte s objekty' }
        ]
      };

      const metadata = structurer.addEducationalMetadata(content, 'lesson-plan');

      expect(metadata.learningStyles.length).toBeGreaterThan(0);
      expect(metadata.learningStyles.some(style => style.style === 'visual')).toBe(true);
      expect(metadata.learningStyles.some(style => style.style === 'auditory')).toBe(true);
      expect(metadata.learningStyles.some(style => style.style === 'kinesthetic')).toBe(true);
    });

    it('should determine assessment type correctly', () => {
      const quizMetadata = structurer.addEducationalMetadata({}, 'quiz');
      const worksheetMetadata = structurer.addEducationalMetadata({}, 'worksheet');
      const projectMetadata = structurer.addEducationalMetadata({}, 'project');

      expect(quizMetadata.assessmentType).toBe('Formativní hodnocení');
      expect(worksheetMetadata.assessmentType).toBe('Procvičování a upevňování');
      expect(projectMetadata.assessmentType).toBe('Sumativní hodnocení');
    });

    it('should generate differentiation options', () => {
      const content = { title: 'Test content' };

      const metadata = structurer.addEducationalMetadata(content, 'worksheet');

      expect(metadata.differentiationOptions.length).toBeGreaterThan(0);
      expect(metadata.differentiationOptions).toContain('Různé úrovně obtížnosti úloh');
      expect(metadata.differentiationOptions).toContain('Nápovědy a postupy řešení');
    });

    it('should identify prerequisites', () => {
      const content = {
        description: 'Znalost základů algebry je nutná. Student musí umět řešit lineární rovnice.',
        instructions: 'Předchozí kapitola o funkcích je důležitá.'
      };

      const metadata = structurer.addEducationalMetadata(content, 'worksheet');

      expect(metadata.prerequisiteKnowledge.length).toBeGreaterThan(0);
    });

    it('should calculate cognitive load', () => {
      const simpleContent = {
        title: 'Jednoduché sčítání',
        questions: [{ problem: '1 + 1', answer: '2' }]
      };

      const complexContent = {
        title: 'Komplexní analytické úlohy s abstraktními koncepty',
        questions: Array(20).fill(0).map((_, i) => ({
          problem: `Velmi složitá úloha ${i} s mnoha kroky a teoretickými základy`,
          answer: `Složitá odpověď ${i}`
        }))
      };

      const simpleLoad = structurer.addEducationalMetadata(simpleContent, 'worksheet').cognitiveLoad;
      const complexLoad = structurer.addEducationalMetadata(complexContent, 'worksheet').cognitiveLoad;

      expect(complexLoad.overall).toBeGreaterThan(simpleLoad.overall);
      expect(simpleLoad.overall).toBeGreaterThan(0);
      expect(complexLoad.overall).toBeLessThanOrEqual(1);
    });
  });

  describe('content organization', () => {
    it('should organize worksheet content with sections', () => {
      const content = {
        questions: [
          { problem: '1 + 1', answer: '2' },
          { problem: '2 + 2', answer: '4' },
          { problem: 'Složitá úloha', answer: 'Složitá odpověď' }
        ]
      };

      const organized = structurer['organizeWorksheetContent'](content);

      expect(organized.sections).toBeDefined();
      expect(organized.sections.length).toBeGreaterThan(0);
      expect(organized.questions).toBeDefined();
    });

    it('should sort questions by difficulty', () => {
      const questions = [
        { problem: 'Velmi složitá algebraická rovnice s mnoha neznámými', answer: 'x = ...' },
        { problem: '1 + 1', answer: '2' },
        { problem: '2x = 6', answer: 'x = 3' }
      ];

      const sorted = structurer['sortQuestionsByDifficulty'](questions);

      const difficulties = sorted.map(q => structurer['assessQuestionDifficulty'](q));
      
      // Check that difficulties are in ascending order
      for (let i = 1; i < difficulties.length; i++) {
        expect(difficulties[i]).toBeGreaterThanOrEqual(difficulties[i - 1]);
      }
    });

    it('should assess question difficulty correctly', () => {
      const easyQuestion = { problem: '1 + 1', answer: '2' };
      const mediumQuestion = { problem: '2x + 3 = 7', answer: 'x = 2' };
      const hardQuestion = { problem: 'Řešte komplexní rovnici s mocninami: x³ + 2x² - 5x + 1 = 0', answer: 'x = ...' };

      const easyDifficulty = structurer['assessQuestionDifficulty'](easyQuestion);
      const mediumDifficulty = structurer['assessQuestionDifficulty'](mediumQuestion);
      const hardDifficulty = structurer['assessQuestionDifficulty'](hardQuestion);

      expect(easyDifficulty).toBeLessThan(mediumDifficulty);
      expect(mediumDifficulty).toBeLessThan(hardDifficulty);
    });

    it('should create worksheet sections with appropriate names', () => {
      const questions = [
        { problem: '1 + 1', answer: '2' },
        { problem: '2 + 2', answer: '4' },
        { problem: 'Složitější úloha', answer: 'Odpověď' }
      ];

      const sections = structurer['createWorksheetSections'](questions);

      expect(sections.length).toBeGreaterThan(0);
      expect(sections[0].name).toBeDefined();
      expect(sections[0].questions).toBeDefined();
    });

    it('should structure lesson activities properly', () => {
      const activities = [
        { name: 'Hlavní aktivita', time: '30 min' },
        { name: 'Další aktivita', time: '15 min' }
      ];

      const structured = structurer['structureLessonActivities'](activities);

      // Should add introduction if not present
      expect(structured[0].name.toLowerCase()).toContain('úvod');
      expect(structured.length).toBeGreaterThan(activities.length);
    });

    it('should generate transitions between activities', () => {
      const activities = [
        { name: 'Úvod' },
        { name: 'Výklad' },
        { name: 'Cvičení' }
      ];

      const transitions = structurer['generateTransitions'](activities);

      expect(transitions.length).toBe(activities.length - 1);
      expect(transitions[0]).toContain('Úvod');
      expect(transitions[0]).toContain('Výklad');
    });
  });

  describe('helper methods', () => {
    it('should extract text content correctly', () => {
      const content = {
        title: 'Test title',
        nested: {
          description: 'Nested description'
        },
        array: ['Item 1', 'Item 2']
      };

      const text = structurer['extractTextContent'](content);

      expect(text).toContain('Test title');
      expect(text).toContain('Nested description');
      expect(text).toContain('Item 1');
      expect(text).toContain('Item 2');
    });

    it('should get difficulty indicators correctly', () => {
      const basicIndicators = structurer['getDifficultyIndicators'](1.5);
      const advancedIndicators = structurer['getDifficultyIndicators'](3.5);

      expect(basicIndicators).toContain('Jednoduché výpočty');
      expect(advancedIndicators).toContain('Komplexní problémy');
    });

    it('should get Czech style names correctly', () => {
      expect(structurer['getStyleCzechName']('visual')).toBe('Vizuální');
      expect(structurer['getStyleCzechName']('auditory')).toBe('Sluchový');
      expect(structurer['getStyleCzechName']('kinesthetic')).toBe('Pohybový');
      expect(structurer['getStyleCzechName']('reading')).toBe('Čtení/psaní');
    });

    it('should detect complex concepts', () => {
      const simpleText = 'jednoduché sčítání a odčítání';
      const complexText = 'abstraktní teoretické koncepty a komplexní analytické metody';

      expect(structurer['containsComplexConcepts'](simpleText)).toBe(false);
      expect(structurer['containsComplexConcepts'](complexText)).toBe(true);
    });

    it('should detect scaffolding elements', () => {
      const textWithScaffolding = 'postupujte krok za krokem, použijte nápovědu a příklad';
      const textWithoutScaffolding = 'řešte úlohy samostatně';

      expect(structurer['hasScaffolding'](textWithScaffolding)).toBe(true);
      expect(structurer['hasScaffolding'](textWithoutScaffolding)).toBe(false);
    });

    it('should detect connections in content', () => {
      const textWithConnections = 'toto souvisí s předchozí kapitolou a navazuje na základy';
      const textWithoutConnections = 'izolované téma bez souvislostí';

      expect(structurer['hasConnections'](textWithConnections)).toBe(true);
      expect(structurer['hasConnections'](textWithoutConnections)).toBe(false);
    });
  });
});