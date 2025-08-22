import { EnhancedPromptBuilder, PromptBuildParams, MaterialSubtype } from '../services/EnhancedPromptBuilder';
import { AssignmentAnalysis } from '../services/AssignmentAnalyzer';

describe('EnhancedPromptBuilder', () => {
  let builder: EnhancedPromptBuilder;

  beforeEach(() => {
    builder = new EnhancedPromptBuilder();
  });

  describe('buildPrompt', () => {
    it('should build basic prompt for worksheet', async () => {
      const params: PromptBuildParams = {
        materialType: 'worksheet',
        userInputs: {
          title: 'Základy matematiky',
          subject: 'matematika',
          grade_level: '3. třída ZŠ',
          question_count: 10
        },
        qualityLevel: 'standardní'
      };

      const prompt = await builder.buildPrompt(params);

      expect(prompt).toContain('pracovní list');
      expect(prompt).toContain('Základy matematiky');
      expect(prompt).toContain('matematika');
      expect(prompt).toContain('3. třída ZŠ');
      expect(prompt).toContain('10');
    });

    it('should build prompt with assignment context', async () => {
      const assignment: AssignmentAnalysis = {
        learningObjectives: ['Naučit se základy sčítání'],
        difficulty: 'základní',
        subject: 'matematika',
        gradeLevel: '2. třída ZŠ',
        estimatedDuration: '30 min',
        keyTopics: ['sčítání', 'čísla'],
        suggestedMaterialTypes: ['worksheet'],
        confidence: 0.9
      };

      const params: PromptBuildParams = {
        materialType: 'worksheet',
        assignment,
        userInputs: {
          title: 'Sčítání do 20'
        },
        qualityLevel: 'standardní'
      };

      const prompt = await builder.buildPrompt(params);

      expect(prompt).toContain('KONTEXT ZADÁNÍ');
      expect(prompt).toContain('matematika');
      expect(prompt).toContain('2. třída ZŠ');
      expect(prompt).toContain('základní');
      expect(prompt).toContain('Naučit se základy sčítání');
      expect(prompt).toContain('sčítání, čísla');
    });

    it('should build prompt with subtype modifications', async () => {
      const subtype: MaterialSubtype = {
        id: 'practice-problems',
        name: 'Cvičné úlohy',
        description: 'Strukturované cvičení',
        parentType: 'worksheet',
        specialFields: [],
        promptModifications: [
          {
            type: 'prepend',
            content: 'SPECIÁLNÍ POKYN: Zaměř se na postupné zvyšování obtížnosti'
          },
          {
            type: 'append',
            content: 'DODATEK: Přidej tipy pro řešení'
          }
        ]
      };

      const params: PromptBuildParams = {
        materialType: 'worksheet',
        subtype,
        userInputs: {
          title: 'Cvičné úlohy'
        },
        qualityLevel: 'standardní'
      };

      const prompt = await builder.buildPrompt(params);

      expect(prompt).toContain('SPECIÁLNÍ POKYN: Zaměř se na postupné zvyšování obtížnosti');
      expect(prompt).toContain('DODATEK: Přidej tipy pro řešení');
    });

    it('should build prompt with custom instructions', async () => {
      const params: PromptBuildParams = {
        materialType: 'lesson-plan',
        userInputs: {
          title: 'Hodina geometrie'
        },
        qualityLevel: 'vysoká',
        customInstructions: 'Zahrň praktické experimenty a manipulativní pomůcky'
      };

      const prompt = await builder.buildPrompt(params);

      expect(prompt).toContain('DODATEČNÉ POKYNY');
      expect(prompt).toContain('Zahrň praktické experimenty a manipulativní pomůcky');
    });
  });

  describe('addSubtypeModifications', () => {
    it('should prepend content correctly', () => {
      const basePrompt = 'Základní prompt';
      const subtype: MaterialSubtype = {
        id: 'test',
        name: 'Test',
        description: 'Test subtype',
        parentType: 'worksheet',
        specialFields: [],
        promptModifications: [
          {
            type: 'prepend',
            content: 'Přidáno na začátek'
          }
        ]
      };

      const result = builder.addSubtypeModifications(basePrompt, subtype);

      expect(result).toBe('Přidáno na začátek\n\nZákladní prompt');
    });

    it('should append content correctly', () => {
      const basePrompt = 'Základní prompt';
      const subtype: MaterialSubtype = {
        id: 'test',
        name: 'Test',
        description: 'Test subtype',
        parentType: 'worksheet',
        specialFields: [],
        promptModifications: [
          {
            type: 'append',
            content: 'Přidáno na konec'
          }
        ]
      };

      const result = builder.addSubtypeModifications(basePrompt, subtype);

      expect(result).toBe('Základní prompt\n\nPřidáno na konec');
    });

    it('should replace content correctly', () => {
      const basePrompt = 'Vytvoř základní materiál';
      const subtype: MaterialSubtype = {
        id: 'test',
        name: 'Test',
        description: 'Test subtype',
        parentType: 'worksheet',
        specialFields: [],
        promptModifications: [
          {
            type: 'replace',
            target: 'základní',
            content: 'pokročilý'
          }
        ]
      };

      const result = builder.addSubtypeModifications(basePrompt, subtype);

      expect(result).toBe('Vytvoř pokročilý materiál');
    });

    it('should inject content correctly', () => {
      const basePrompt = 'Vytvoř materiál. Konec promptu.';
      const subtype: MaterialSubtype = {
        id: 'test',
        name: 'Test',
        description: 'Test subtype',
        parentType: 'worksheet',
        specialFields: [],
        promptModifications: [
          {
            type: 'inject',
            target: 'Vytvoř materiál.',
            content: 'SPECIÁLNÍ POKYN: Přidej obrázky.'
          }
        ]
      };

      const result = builder.addSubtypeModifications(basePrompt, subtype);

      expect(result).toContain('Vytvoř materiál.\nSPECIÁLNÍ POKYN: Přidej obrázky.\n Konec promptu.');
    });

    it('should handle multiple modifications', () => {
      const basePrompt = 'Základní prompt';
      const subtype: MaterialSubtype = {
        id: 'test',
        name: 'Test',
        description: 'Test subtype',
        parentType: 'worksheet',
        specialFields: [],
        promptModifications: [
          {
            type: 'prepend',
            content: 'Začátek'
          },
          {
            type: 'append',
            content: 'Konec'
          }
        ]
      };

      const result = builder.addSubtypeModifications(basePrompt, subtype);

      expect(result).toBe('Začátek\n\nZákladní prompt\n\nKonec');
    });
  });

  describe('addAssignmentContext', () => {
    it('should add complete assignment context', () => {
      const basePrompt = 'Základní prompt';
      const assignment: AssignmentAnalysis = {
        learningObjectives: ['Cíl 1', 'Cíl 2'],
        difficulty: 'střední',
        subject: 'matematika',
        gradeLevel: '5. třída ZŠ',
        estimatedDuration: '45 min',
        keyTopics: ['algebra', 'rovnice'],
        suggestedMaterialTypes: ['worksheet'],
        confidence: 0.8
      };

      const result = builder.addAssignmentContext(basePrompt, assignment);

      expect(result).toContain('KONTEXT ZADÁNÍ');
      expect(result).toContain('matematika');
      expect(result).toContain('5. třída ZŠ');
      expect(result).toContain('střední');
      expect(result).toContain('45 min');
      expect(result).toContain('algebra, rovnice');
      expect(result).toContain('CÍLE UČENÍ');
      expect(result).toContain('- Cíl 1');
      expect(result).toContain('- Cíl 2');
      expect(result).toContain('Základní prompt');
    });
  });

  describe('addQualityConstraints', () => {
    it('should add basic quality constraints', () => {
      const basePrompt = 'Základní prompt';
      const result = builder.addQualityConstraints(basePrompt, 'základní');

      expect(result).toContain('POŽADAVKY NA KVALITU (ZÁKLADNÍ)');
      expect(result).toContain('jednoduchý a srozumitelný jazyk');
      expect(result).toContain('základní příklady');
    });

    it('should add standard quality constraints', () => {
      const basePrompt = 'Základní prompt';
      const result = builder.addQualityConstraints(basePrompt, 'standardní');

      expect(result).toContain('POŽADAVKY NA KVALITU (STANDARDNÍ)');
      expect(result).toContain('přiměřeně náročný jazyk');
      expect(result).toContain('praktické příklady');
    });

    it('should add high quality constraints', () => {
      const basePrompt = 'Základní prompt';
      const result = builder.addQualityConstraints(basePrompt, 'vysoká');

      expect(result).toContain('POŽADAVKY NA KVALITU (VYSOKÁ)');
      expect(result).toContain('precizní a odborný jazyk');
      expect(result).toContain('kritické myšlení');
    });

    it('should add expert quality constraints', () => {
      const basePrompt = 'Základní prompt';
      const result = builder.addQualityConstraints(basePrompt, 'expertní');

      expect(result).toContain('POŽADAVKY NA KVALITU (EXPERTNÍ)');
      expect(result).toContain('expertní terminologii');
      expect(result).toContain('nejnovější poznatky');
    });
  });

  describe('material type specific prompts', () => {
    it('should have specific prompt for worksheet', async () => {
      const params: PromptBuildParams = {
        materialType: 'worksheet',
        userInputs: {},
        qualityLevel: 'standardní'
      };

      const prompt = await builder.buildPrompt(params);

      expect(prompt).toContain('pracovní list');
      expect(prompt).toContain('STRUKTURA PRACOVNÍHO LISTU');
      expect(prompt).toContain('questions');
    });

    it('should have specific prompt for lesson-plan', async () => {
      const params: PromptBuildParams = {
        materialType: 'lesson-plan',
        userInputs: {},
        qualityLevel: 'standardní'
      };

      const prompt = await builder.buildPrompt(params);

      expect(prompt).toContain('plán hodiny');
      expect(prompt).toContain('STRUKTURA PLÁNU HODINY');
      expect(prompt).toContain('activities');
    });

    it('should have specific prompt for quiz', async () => {
      const params: PromptBuildParams = {
        materialType: 'quiz',
        userInputs: {},
        qualityLevel: 'standardní'
      };

      const prompt = await builder.buildPrompt(params);

      expect(prompt).toContain('kvíz');
      expect(prompt).toContain('STRUKTURA KVÍZU');
      expect(prompt).toContain('multiple_choice');
    });

    it('should have specific prompt for project', async () => {
      const params: PromptBuildParams = {
        materialType: 'project',
        userInputs: {},
        qualityLevel: 'standardní'
      };

      const prompt = await builder.buildPrompt(params);

      expect(prompt).toContain('projekt');
      expect(prompt).toContain('STRUKTURA PROJEKTU');
      expect(prompt).toContain('deliverables');
    });

    it('should have specific prompt for presentation', async () => {
      const params: PromptBuildParams = {
        materialType: 'presentation',
        userInputs: {},
        qualityLevel: 'standardní'
      };

      const prompt = await builder.buildPrompt(params);

      expect(prompt).toContain('prezentace');
      expect(prompt).toContain('STRUKTURA PREZENTACE');
      expect(prompt).toContain('slides');
    });

    it('should have specific prompt for activity', async () => {
      const params: PromptBuildParams = {
        materialType: 'activity',
        userInputs: {},
        qualityLevel: 'standardní'
      };

      const prompt = await builder.buildPrompt(params);

      expect(prompt).toContain('aktivity');
      expect(prompt).toContain('STRUKTURA AKTIVITY');
      expect(prompt).toContain('instructions');
    });
  });

  describe('user inputs integration', () => {
    it('should include common user inputs', async () => {
      const params: PromptBuildParams = {
        materialType: 'worksheet',
        userInputs: {
          title: 'Test materiál',
          subject: 'čeština',
          grade_level: '4. třída ZŠ',
          duration: '30 min'
        },
        qualityLevel: 'standardní'
      };

      const prompt = await builder.buildPrompt(params);

      expect(prompt).toContain('SPECIFIKACE UŽIVATELE');
      expect(prompt).toContain('Test materiál');
      expect(prompt).toContain('čeština');
      expect(prompt).toContain('4. třída ZŠ');
      expect(prompt).toContain('30 min');
    });

    it('should include worksheet-specific inputs', async () => {
      const params: PromptBuildParams = {
        materialType: 'worksheet',
        userInputs: {
          question_count: 15,
          difficulty_progression: true,
          include_answer_key: true
        },
        qualityLevel: 'standardní'
      };

      const prompt = await builder.buildPrompt(params);

      expect(prompt).toContain('Počet úloh: 15');
      expect(prompt).toContain('Postupné zvyšování obtížnosti: true');
      expect(prompt).toContain('Zahrnout klíč odpovědí: true');
    });

    it('should include quiz-specific inputs', async () => {
      const params: PromptBuildParams = {
        materialType: 'quiz',
        userInputs: {
          question_count: 20,
          time_limit: '25 min',
          question_types: ['multiple_choice', 'true_false']
        },
        qualityLevel: 'standardní'
      };

      const prompt = await builder.buildPrompt(params);

      expect(prompt).toContain('Počet otázek: 20');
      expect(prompt).toContain('Časový limit: 25 min');
      expect(prompt).toContain('Typy otázek: multiple_choice, true_false');
    });
  });

  describe('prompt finalization', () => {
    it('should include final instructions', async () => {
      const params: PromptBuildParams = {
        materialType: 'worksheet',
        userInputs: {
          grade_level: '3. třída ZŠ'
        },
        qualityLevel: 'standardní'
      };

      const prompt = await builder.buildPrompt(params);

      expect(prompt).toContain('DŮLEŽITÉ PŘIPOMÍNKY');
      expect(prompt).toContain('českém jazyce');
      expect(prompt).toContain('3. třída ZŠ');
      expect(prompt).toContain('validní JSON objekt');
      expect(prompt).toContain('ZAČNI GENEROVÁNÍ');
    });
  });
});