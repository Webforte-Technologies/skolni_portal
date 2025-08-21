import { MaterialType } from './AssignmentAnalyzer';
import { MaterialSubtype } from './EnhancedPromptBuilder';

export interface StructuredContent {
  originalContent: any;
  structuredContent: any;
  scaffolding: ScaffoldingElement[];
  difficultyProgression: DifficultyLevel[];
  educationalMetadata: EducationalMetadata;
}

export interface ScaffoldingElement {
  type: 'hint' | 'example' | 'step' | 'reminder' | 'connection';
  content: string;
  position: number;
  targetField: string;
}

export interface DifficultyLevel {
  level: number;
  description: string;
  indicators: string[];
}

export interface EducationalMetadata {
  bloomsTaxonomyLevels: BloomLevel[];
  learningStyles: LearningStyle[];
  assessmentType: string;
  differentiationOptions: string[];
  prerequisiteKnowledge: string[];
  cognitiveLoad: CognitiveLoad;
}

export interface BloomLevel {
  level: 'remember' | 'understand' | 'apply' | 'analyze' | 'evaluate' | 'create';
  czechName: string;
  percentage: number;
}

export interface LearningStyle {
  style: 'visual' | 'auditory' | 'kinesthetic' | 'reading';
  czechName: string;
  elements: string[];
}

export interface CognitiveLoad {
  intrinsic: number; // 0-1, complexity of the material itself
  extraneous: number; // 0-1, complexity added by presentation
  germane: number; // 0-1, mental effort devoted to processing and understanding
  overall: number; // 0-1, total cognitive load
}

export class ContentStructurer {
  private bloomTaxonomy: Map<string, BloomLevel> = new Map();
  private learningStyleIndicators: Map<string, string[]> = new Map();
  private scaffoldingStrategies: Map<MaterialType, ScaffoldingStrategy[]> = new Map();

  constructor() {
    this.initializeBloomTaxonomy();
    this.initializeLearningStyleIndicators();
    this.initializeScaffoldingStrategies();
  }

  structureContent(content: any, type: MaterialType, subtype?: MaterialSubtype): StructuredContent {
    const scaffolding = this.addScaffolding(content, type, subtype);
    const structuredContent = this.organizeContent(content, type, subtype);
    const difficultyProgression = this.organizeDifficultyProgression(content, type);
    const educationalMetadata = this.addEducationalMetadata(content, type);

    return {
      originalContent: content,
      structuredContent,
      scaffolding,
      difficultyProgression,
      educationalMetadata
    };
  }

  addScaffolding(content: any, type: MaterialType, subtype?: MaterialSubtype): ScaffoldingElement[] {
    const scaffolding: ScaffoldingElement[] = [];
    const strategies = this.scaffoldingStrategies.get(type) || [];

    for (const strategy of strategies) {
      const elements = strategy.generator(content, subtype);
      scaffolding.push(...elements);
    }

    return scaffolding.sort((a, b) => a.position - b.position);
  }

  organizeDifficultyProgression(content: any, type: MaterialType): DifficultyLevel[] {
    switch (type) {
      case 'worksheet':
        return this.organizeWorksheetProgression(content);
      case 'quiz':
        return this.organizeQuizProgression(content);
      case 'lesson-plan':
        return this.organizeLessonProgression(content);
      default:
        return this.createBasicProgression(content);
    }
  }

  addEducationalMetadata(content: any, type: MaterialType): EducationalMetadata {
    const bloomLevels = this.analyzeBloomTaxonomy(content);
    const learningStyles = this.analyzeLearningStyles(content);
    const assessmentType = this.determineAssessmentType(content, type);
    const differentiationOptions = this.generateDifferentiationOptions(content, type);
    const prerequisiteKnowledge = this.identifyPrerequisites(content);
    const cognitiveLoad = this.calculateCognitiveLoad(content, type);

    return {
      bloomsTaxonomyLevels: bloomLevels,
      learningStyles,
      assessmentType,
      differentiationOptions,
      prerequisiteKnowledge,
      cognitiveLoad
    };
  }

  private initializeBloomTaxonomy(): void {
    this.bloomTaxonomy = new Map([
      ['remember', { level: 'remember', czechName: 'Zapamatování', percentage: 0 }],
      ['understand', { level: 'understand', czechName: 'Porozumění', percentage: 0 }],
      ['apply', { level: 'apply', czechName: 'Aplikace', percentage: 0 }],
      ['analyze', { level: 'analyze', czechName: 'Analýza', percentage: 0 }],
      ['evaluate', { level: 'evaluate', czechName: 'Hodnocení', percentage: 0 }],
      ['create', { level: 'create', czechName: 'Tvorba', percentage: 0 }]
    ]);
  }

  private initializeLearningStyleIndicators(): void {
    this.learningStyleIndicators = new Map([
      ['visual', ['obrázek', 'diagram', 'graf', 'schéma', 'mapa', 'tabulka', 'barevně']],
      ['auditory', ['poslouchejte', 'diskutujte', 'vysvětlete', 'řekněte', 'prezentujte', 'debata']],
      ['kinesthetic', ['prakticky', 'manipulujte', 'stavějte', 'experimentujte', 'pohyb', 'dotyk']],
      ['reading', ['přečtěte', 'napište', 'text', 'kniha', 'článek', 'poznámky']]
    ]);
  }

  private initializeScaffoldingStrategies(): void {
    this.scaffoldingStrategies = new Map();

    // Worksheet scaffolding strategies
    this.scaffoldingStrategies.set('worksheet', [
      {
        name: 'Postupné kroky',
        generator: (content: any) => this.generateStepByStepScaffolding(content)
      },
      {
        name: 'Příklady',
        generator: (content: any) => this.generateExampleScaffolding(content)
      },
      {
        name: 'Nápovědy',
        generator: (content: any) => this.generateHintScaffolding(content)
      }
    ]);

    // Lesson plan scaffolding strategies
    this.scaffoldingStrategies.set('lesson-plan', [
      {
        name: 'Aktivační otázky',
        generator: (content: any) => this.generateActivationScaffolding(content)
      },
      {
        name: 'Propojení s předchozím učivem',
        generator: (content: any) => this.generateConnectionScaffolding(content)
      }
    ]);

    // Quiz scaffolding strategies
    this.scaffoldingStrategies.set('quiz', [
      {
        name: 'Postupná obtížnost',
        generator: (content: any) => this.generateProgressiveScaffolding(content)
      }
    ]);

    // Add strategies for other material types
    ['project', 'presentation', 'activity'].forEach(type => {
      this.scaffoldingStrategies.set(type as MaterialType, [
        {
          name: 'Základní struktura',
          generator: (content: any) => this.generateBasicScaffolding(content)
        }
      ]);
    });
  }

  private organizeContent(content: any, type: MaterialType, subtype?: MaterialSubtype): any {
    const organized = { ...content };

    switch (type) {
      case 'worksheet':
        return this.organizeWorksheetContent(organized, subtype);
      case 'lesson-plan':
        return this.organizeLessonPlanContent(organized, subtype);
      case 'quiz':
        return this.organizeQuizContent(organized, subtype);
      case 'project':
        return this.organizeProjectContent(organized, subtype);
      case 'presentation':
        return this.organizePresentationContent(organized, subtype);
      case 'activity':
        return this.organizeActivityContent(organized, subtype);
      default:
        return organized;
    }
  }

  private organizeWorksheetContent(content: any, subtype?: MaterialSubtype): any {
    if (content.questions && Array.isArray(content.questions)) {
      // Sort questions by difficulty
      content.questions = this.sortQuestionsByDifficulty(content.questions);
      
      // Add section headers
      content.sections = this.createWorksheetSections(content.questions);
      
      // Add warm-up and bonus sections if appropriate
      if (subtype?.id === 'practice-problems') {
        content.warmUp = this.generateWarmUpProblems(content.questions);
        content.bonus = this.generateBonusProblems(content.questions);
      }
    }

    return content;
  }

  private organizeLessonPlanContent(content: any, _subtype?: MaterialSubtype): any {
    if (content.activities && Array.isArray(content.activities)) {
      // Ensure proper lesson structure
      content.activities = this.structureLessonActivities(content.activities);
      
      // Add transitions between activities
      content.transitions = this.generateTransitions(content.activities);
      
      // Add differentiation strategies
      content.differentiation = this.enhanceDifferentiation(content.differentiation, content.activities);
    }

    return content;
  }

  private organizeQuizContent(content: any, _subtype?: MaterialSubtype): any {
    if (content.questions && Array.isArray(content.questions)) {
      // Organize by question type and difficulty
      content.questions = this.organizeQuizQuestions(content.questions);
      
      // Add section instructions
      content.sectionInstructions = this.generateSectionInstructions(content.questions);
      
      // Add scoring guide
      content.scoringGuide = this.generateScoringGuide(content.questions);
    }

    return content;
  }

  private organizeProjectContent(content: any, _subtype?: MaterialSubtype): any {
    // Add project phases
    content.phases = this.generateProjectPhases(content);
    
    // Enhance rubric with detailed criteria
    if (content.rubric) {
      content.rubric = this.enhanceProjectRubric(content.rubric);
    }
    
    // Add timeline
    content.timeline = this.generateProjectTimeline(content);

    return content;
  }

  private organizePresentationContent(content: any, _subtype?: MaterialSubtype): any {
    if (content.slides && Array.isArray(content.slides)) {
      // Add slide types and transitions
      content.slides = this.enhancePresentationSlides(content.slides);
      
      // Add speaker notes
      content.speakerNotes = this.generateSpeakerNotes(content.slides);
      
      // Add visual suggestions
      content.visualSuggestions = this.generateVisualSuggestions(content.slides);
    }

    return content;
  }

  private organizeActivityContent(content: any, _subtype?: MaterialSubtype): any {
    // Structure instructions into clear phases
    if (content.instructions) {
      content.structuredInstructions = this.structureActivityInstructions(content.instructions);
    }
    
    // Add safety considerations
    content.safetyNotes = this.generateSafetyNotes(content);
    
    // Add assessment criteria
    content.assessmentCriteria = this.generateActivityAssessment(content);

    return content;
  }

  private sortQuestionsByDifficulty(questions: any[]): any[] {
    return questions.sort((a, b) => {
      const difficultyA = this.assessQuestionDifficulty(a);
      const difficultyB = this.assessQuestionDifficulty(b);
      return difficultyA - difficultyB;
    });
  }

  private assessQuestionDifficulty(question: any): number {
    let difficulty = 1;
    
    const text = question.problem || question.question || '';
    
    // Length-based difficulty
    difficulty += Math.min(2, text.length / 50);
    
    // Mathematical complexity
    if (/\d+\s*[\+\-\*\/]\s*\d+/.test(text)) difficulty += 1;
    if (/[a-z]/.test(text)) difficulty += 1; // Variables
    if (/\^|\*\*/.test(text)) difficulty += 2; // Powers
    
    // Question type complexity
    if (question.type === 'multiple_choice') difficulty += 0.5;
    if (question.type === 'short_answer') difficulty += 1;
    if (question.type === 'essay') difficulty += 2;
    
    return difficulty;
  }

  private createWorksheetSections(questions: any[]): any[] {
    const sections = [];
    const questionsPerSection = Math.ceil(questions.length / 3);
    
    for (let i = 0; i < questions.length; i += questionsPerSection) {
      const sectionQuestions = questions.slice(i, i + questionsPerSection);
      const avgDifficulty = sectionQuestions.reduce((sum, q) => 
        sum + this.assessQuestionDifficulty(q), 0) / sectionQuestions.length;
      
      let sectionName = 'Základní úlohy';
      if (avgDifficulty > 3) sectionName = 'Pokročilé úlohy';
      else if (avgDifficulty > 2) sectionName = 'Střední úlohy';
      
      sections.push({
        name: sectionName,
        questions: sectionQuestions,
        instructions: this.generateSectionInstructions(sectionQuestions)
      });
    }
    
    return sections;
  }

  private generateStepByStepScaffolding(content: any): ScaffoldingElement[] {
    const scaffolding: ScaffoldingElement[] = [];
    
    if (content.questions && Array.isArray(content.questions)) {
      content.questions.forEach((question: any, index: number) => {
        const difficulty = this.assessQuestionDifficulty(question);
        
        if (difficulty > 2) {
          scaffolding.push({
            type: 'step',
            content: `Krok za krokem: 1) Přečtěte si zadání pozorně 2) Identifikujte známé údaje 3) Určete, co hledáte 4) Vyberte vhodný postup`,
            position: index,
            targetField: `questions[${index}]`
          });
        }
      });
    }
    
    return scaffolding;
  }

  private generateExampleScaffolding(content: any): ScaffoldingElement[] {
    const scaffolding: ScaffoldingElement[] = [];
    
    if (content.questions && Array.isArray(content.questions)) {
      const complexQuestions = content.questions.filter((q: any) => 
        this.assessQuestionDifficulty(q) > 2.5
      );
      
      if (complexQuestions.length > 0) {
        scaffolding.push({
          type: 'example',
          content: `Příklad řešení: ${this.generateSampleSolution(complexQuestions[0])}`,
          position: 0,
          targetField: 'instructions'
        });
      }
    }
    
    return scaffolding;
  }

  private generateHintScaffolding(content: any): ScaffoldingElement[] {
    const scaffolding: ScaffoldingElement[] = [];
    
    if (content.questions && Array.isArray(content.questions)) {
      content.questions.forEach((question: any, index: number) => {
        const hint = this.generateQuestionHint(question);
        if (hint) {
          scaffolding.push({
            type: 'hint',
            content: hint,
            position: index,
            targetField: `questions[${index}]`
          });
        }
      });
    }
    
    return scaffolding;
  }

  private generateActivationScaffolding(content: any): ScaffoldingElement[] {
    const scaffolding: ScaffoldingElement[] = [];
    
    if (content.activities && Array.isArray(content.activities)) {
      scaffolding.push({
        type: 'reminder',
        content: 'Aktivační otázky: Co už víte o tomto tématu? Kde jste se s tím setkali?',
        position: 0,
        targetField: 'activities[0]'
      });
    }
    
    return scaffolding;
  }

  private generateConnectionScaffolding(_content: any): ScaffoldingElement[] {
    const scaffolding: ScaffoldingElement[] = [];
    
    scaffolding.push({
      type: 'connection',
      content: 'Propojení: Připomeňte si předchozí hodinu a najděte souvislosti s novým učivem',
      position: 0,
      targetField: 'objectives'
    });
    
    return scaffolding;
  }

  private generateProgressiveScaffolding(_content: any): ScaffoldingElement[] {
    const scaffolding: ScaffoldingElement[] = [];
    
    if (_content.questions && Array.isArray(_content.questions)) {
      const midPoint = Math.floor(_content.questions.length / 2);
      
      scaffolding.push({
        type: 'reminder',
        content: 'Pokud máte potíže, vraťte se k jednodušším úlohám a postupujte krok za krokem',
        position: midPoint,
        targetField: `questions[${midPoint}]`
      });
    }
    
    return scaffolding;
  }

  private generateBasicScaffolding(_content: any): ScaffoldingElement[] {
    return [{
      type: 'reminder',
      content: 'Nezapomeňte si průběžně kontrolovat svou práci a ptát se, pokud něčemu nerozumíte',
      position: 0,
      targetField: 'instructions'
    }];
  }

  private organizeWorksheetProgression(content: any): DifficultyLevel[] {
    const levels: DifficultyLevel[] = [];
    
    if (content.questions && Array.isArray(content.questions)) {
      const difficulties = content.questions.map((q: any) => this.assessQuestionDifficulty(q));
      const minDiff = Math.min(...difficulties);
      const maxDiff = Math.max(...difficulties);
      const range = maxDiff - minDiff;
      
      const levelDescriptions = ['Základní úroveň', 'Střední úroveň', 'Pokročilá úroveň'];
      
      for (let i = 0; i < 3; i++) {
        const levelDifficulty = minDiff + (range * i / 2);
        const description = levelDescriptions[i];
        if (description) {
          levels.push({
            level: i + 1,
            description,
            indicators: this.getDifficultyIndicators(levelDifficulty)
          });
        }
      }
    }
    
    return levels;
  }

  private organizeQuizProgression(content: any): DifficultyLevel[] {
    return this.organizeWorksheetProgression(content); // Similar logic
  }

  private organizeLessonProgression(content: any): DifficultyLevel[] {
    const levels: DifficultyLevel[] = [];
    
    if (content.activities && Array.isArray(content.activities)) {
      levels.push(
        {
          level: 1,
          description: 'Úvod a motivace',
          indicators: ['Aktivace předchozích znalostí', 'Představení nového tématu']
        },
        {
          level: 2,
          description: 'Výklad a procvičování',
          indicators: ['Vysvětlení nových konceptů', 'Řízené procvičování']
        },
        {
          level: 3,
          description: 'Aplikace a syntéza',
          indicators: ['Samostatná práce', 'Aplikace v nových situacích']
        }
      );
    }
    
    return levels;
  }

  private createBasicProgression(_content: any): DifficultyLevel[] {
    return [
      {
        level: 1,
        description: 'Základní úroveň',
        indicators: ['Jednoduché koncepty', 'Přímá aplikace']
      },
      {
        level: 2,
        description: 'Pokročilá úroveň',
        indicators: ['Složitější úlohy', 'Kombinace konceptů']
      }
    ];
  }

  private analyzeBloomTaxonomy(content: any): BloomLevel[] {
    const text = this.extractTextContent(content);
    const bloomKeywords = {
      remember: ['zapamatujte', 'vyjmenujte', 'definujte', 'označte', 'pojmenujte'],
      understand: ['vysvětlete', 'popište', 'shrňte', 'interpretujte', 'klasifikujte'],
      apply: ['použijte', 'aplikujte', 'vypočítajte', 'demonstrujte', 'řešte'],
      analyze: ['analyzujte', 'porovnejte', 'rozlište', 'zkoumejte', 'kategorizujte'],
      evaluate: ['zhodnoťte', 'kritizujte', 'obhajte', 'posouďte', 'argumentujte'],
      create: ['vytvořte', 'navrhněte', 'sestavte', 'formulujte', 'konstruujte']
    };

    const levels: BloomLevel[] = [];
    const textLower = text.toLowerCase();
    let totalMatches = 0;

    for (const [level, keywords] of Object.entries(bloomKeywords)) {
      const matches = keywords.filter(keyword => textLower.includes(keyword)).length;
      totalMatches += matches;
      
      const bloomLevel = this.bloomTaxonomy.get(level);
      if (bloomLevel) {
        levels.push({
          ...bloomLevel,
          percentage: matches
        });
      }
    }

    // Normalize percentages
    if (totalMatches > 0) {
      levels.forEach(level => {
        level.percentage = level.percentage / totalMatches;
      });
    }

    return levels.filter(level => level.percentage > 0);
  }

  private analyzeLearningStyles(content: any): LearningStyle[] {
    const text = this.extractTextContent(content);
    const styles: LearningStyle[] = [];
    
    for (const [style, indicators] of this.learningStyleIndicators.entries()) {
      const elements = indicators.filter(indicator => 
        text.toLowerCase().includes(indicator)
      );
      
      if (elements.length > 0) {
        styles.push({
          style: style as any,
          czechName: this.getStyleCzechName(style),
          elements
        });
      }
    }
    
    return styles;
  }

  private determineAssessmentType(_content: any, type: MaterialType): string {
    switch (type) {
      case 'quiz':
        return 'Formativní hodnocení';
      case 'worksheet':
        return 'Procvičování a upevňování';
      case 'project':
        return 'Sumativní hodnocení';
      case 'activity':
        return 'Aktivní učení';
      default:
        return 'Smíšené hodnocení';
    }
  }

  private generateDifferentiationOptions(_content: any, type: MaterialType): string[] {
    const options = [
      'Různé úrovně obtížnosti úloh',
      'Volba způsobu prezentace výsledků',
      'Skupinová vs. individuální práce',
      'Dodatečný čas pro pomalejší žáky',
      'Rozšiřující úlohy pro rychlejší žáky'
    ];

    // Add type-specific options
    switch (type) {
      case 'worksheet':
        options.push('Nápovědy a postupy řešení', 'Kalkulačka pro složitější výpočty');
        break;
      case 'lesson-plan':
        options.push('Různé role ve skupinové práci', 'Alternativní způsoby vysvětlení');
        break;
      case 'project':
        options.push('Volba tématu podle zájmů', 'Různé formy výstupů');
        break;
    }

    return options;
  }

  private identifyPrerequisites(content: any): string[] {
    const text = this.extractTextContent(content);
    const prerequisites: string[] = [];
    
    // Basic pattern matching for prerequisites
    const patterns = [
      /znalost\s+([^.!?]+)/gi,
      /umět\s+([^.!?]+)/gi,
      /předchozí\s+([^.!?]+)/gi,
      /základy\s+([^.!?]+)/gi
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        if (match[1]) {
          prerequisites.push(match[1].trim());
        }
      }
    }
    
    return [...new Set(prerequisites)].slice(0, 5); // Remove duplicates and limit
  }

  private calculateCognitiveLoad(content: any, _type: MaterialType): CognitiveLoad {
    const text = this.extractTextContent(content);
    
    // Intrinsic load - complexity of the material
    let intrinsic = 0.3; // Base complexity
    if (text.length > 1000) intrinsic += 0.2;
    if (this.containsComplexConcepts(text)) intrinsic += 0.3;
    
    // Extraneous load - presentation complexity
    let extraneous = 0.2; // Base presentation load
    if (this.hasComplexStructure(content)) extraneous += 0.2;
    if (this.hasDistractions(content)) extraneous += 0.1;
    
    // Germane load - productive mental effort
    let germane = 0.4; // Base learning effort
    if (this.hasScaffolding(content)) germane += 0.2;
    if (this.hasConnections(content)) germane += 0.1;
    
    const overall = Math.min(1, (intrinsic + extraneous + germane) / 3);
    
    return {
      intrinsic: Math.min(1, intrinsic),
      extraneous: Math.min(1, extraneous),
      germane: Math.min(1, germane),
      overall
    };
  }

  // Helper methods
  private extractTextContent(content: any): string {
    let text = '';
    
    const extractFromValue = (value: any): void => {
      if (typeof value === 'string') {
        text += value + ' ';
      } else if (Array.isArray(value)) {
        value.forEach(extractFromValue);
      } else if (typeof value === 'object' && value !== null) {
        Object.values(value).forEach(extractFromValue);
      }
    };

    extractFromValue(content);
    return text;
  }

  private getDifficultyIndicators(difficulty: number): string[] {
    if (difficulty < 2) {
      return ['Jednoduché výpočty', 'Základní koncepty', 'Přímá aplikace'];
    } else if (difficulty < 3) {
      return ['Složitější úlohy', 'Kombinace postupů', 'Analýza problému'];
    } else {
      return ['Komplexní problémy', 'Kritické myšlení', 'Syntéza informací'];
    }
  }

  private getStyleCzechName(style: string): string {
    const names = {
      visual: 'Vizuální',
      auditory: 'Sluchový',
      kinesthetic: 'Pohybový',
      reading: 'Čtení/psaní'
    };
    return names[style as keyof typeof names] || style;
  }

  private generateSampleSolution(_question: any): string {
    return `Pro řešení této úlohy postupujte následovně: 1) Analyzujte zadání, 2) Identifikujte známé hodnoty, 3) Aplikujte vhodný vzorec nebo postup.`;
  }

  private generateQuestionHint(question: any): string | null {
    const difficulty = this.assessQuestionDifficulty(question);
    if (difficulty > 2.5) {
      return 'Nápověda: Rozdělte úlohu na menší kroky a řešte postupně.';
    }
    return null;
  }

  private containsComplexConcepts(text: string): boolean {
    const complexWords = ['abstraktní', 'teoretický', 'komplexní', 'systematický', 'analytický'];
    return complexWords.some(word => text.toLowerCase().includes(word));
  }

  private hasComplexStructure(content: any): boolean {
    // Check if content has many nested levels or complex organization
    const stringify = JSON.stringify(content);
    return stringify.length > 2000 || (stringify.match(/\{/g) || []).length > 10;
  }

  private hasDistractions(content: any): boolean {
    // Check for potentially distracting elements
    const text = this.extractTextContent(content);
    return text.includes('pozor') || text.includes('upozornění') || text.includes('varování');
  }

  private hasScaffolding(content: any): boolean {
    const text = this.extractTextContent(content);
    const scaffoldingWords = ['krok', 'postup', 'nápověda', 'příklad', 'tip'];
    return scaffoldingWords.some(word => text.toLowerCase().includes(word));
  }

  private hasConnections(content: any): boolean {
    const text = this.extractTextContent(content);
    const connectionWords = ['souvisí', 'navazuje', 'propojení', 'vztah', 'podobně'];
    return connectionWords.some(word => text.toLowerCase().includes(word));
  }

  // Additional helper methods for content organization
  private generateSectionInstructions(questions: any[]): string {
    return `Tato sekce obsahuje ${questions.length} úloh. Řešte postupně a nezapomeňte kontrolovat své odpovědi.`;
  }

  private generateWarmUpProblems(questions: any[]): any[] {
    // Generate simpler versions of the first few questions
    return questions.slice(0, 2).map(q => ({
      ...q,
      problem: `Rozehřívací úloha: ${q.problem}`,
      difficulty: 'easy'
    }));
  }

  private generateBonusProblems(questions: any[]): any[] {
    // Generate more challenging versions
    return questions.slice(-2).map(q => ({
      ...q,
      problem: `Bonusová úloha: ${q.problem}`,
      difficulty: 'challenging'
    }));
  }

  private structureLessonActivities(activities: any[]): any[] {
    // Ensure proper lesson flow: introduction -> development -> conclusion
    const structured = [...activities];
    
    if (structured.length > 0 && !structured[0].name.toLowerCase().includes('úvod')) {
      structured.unshift({
        name: 'Úvod a motivace',
        description: 'Aktivace předchozích znalostí a představení tématu',
        time: '5 min',
        steps: ['Přivítání žáků', 'Připomenutí předchozí hodiny', 'Představení cílů']
      });
    }
    
    return structured;
  }

  private generateTransitions(activities: any[]): string[] {
    const transitions: string[] = [];
    
    for (let i = 0; i < activities.length - 1; i++) {
      transitions.push(`Přechod z "${activities[i].name}" do "${activities[i + 1].name}": Shrňte klíčové body a připravte žáky na další aktivitu.`);
    }
    
    return transitions;
  }

  private enhanceDifferentiation(existing: string, _activities: any[]): string {
    let enhanced = existing || '';
    
    enhanced += '\n\nDodatečné možnosti diferenciace:';
    enhanced += '\n- Pro pokročilé žáky: rozšiřující úlohy a samostatné projekty';
    enhanced += '\n- Pro žáky s obtížemi: dodatečná podpora a zjednodušené úlohy';
    enhanced += '\n- Skupinová práce s různými rolemi podle schopností';
    
    return enhanced;
  }

  private organizeQuizQuestions(questions: any[]): any[] {
    // Group by type and sort by difficulty within each type
    const grouped = questions.reduce((acc: any, question: any) => {
      const type = question.type || 'other';
      if (!acc[type]) acc[type] = [];
      acc[type].push(question);
      return acc;
    }, {});
    
    // Sort each group by difficulty and flatten
    const organized: any[] = [];
    Object.values(grouped).forEach((group: any) => {
      const sorted = group.sort((a: any, b: any) => 
        this.assessQuestionDifficulty(a) - this.assessQuestionDifficulty(b)
      );
      organized.push(...sorted);
    });
    
    return organized;
  }

  private generateScoringGuide(questions: any[]): any {
    const totalPoints = questions.length;
    return {
      totalPoints,
      passingScore: Math.ceil(totalPoints * 0.6),
      excellentScore: Math.ceil(totalPoints * 0.9),
      timePerQuestion: '2-3 minuty',
      instructions: 'Každá správná odpověď = 1 bod'
    };
  }

  private generateProjectPhases(_content: any): any[] {
    return [
      {
        name: 'Přípravná fáze',
        duration: '1 týden',
        activities: ['Výběr tématu', 'Plánování postupu', 'Shromažďování zdrojů']
      },
      {
        name: 'Realizační fáze',
        duration: '2-3 týdny',
        activities: ['Výzkum a sběr dat', 'Analýza informací', 'Tvorba výstupů']
      },
      {
        name: 'Prezentační fáze',
        duration: '1 týden',
        activities: ['Příprava prezentace', 'Prezentování výsledků', 'Reflexe a hodnocení']
      }
    ];
  }

  private enhanceProjectRubric(rubric: any[]): any[] {
    return rubric.map(item => ({
      ...item,
      weight: this.calculateCriteriaWeight(item.criteria),
      descriptors: this.generateRubricDescriptors(item.criteria)
    }));
  }

  private generateProjectTimeline(content: any): any {
    const duration = content.duration || '4 týdny';
    return {
      totalDuration: duration,
      milestones: [
        { week: 1, task: 'Výběr tématu a plán' },
        { week: 2, task: 'Výzkum a sběr dat' },
        { week: 3, task: 'Analýza a tvorba' },
        { week: 4, task: 'Prezentace a hodnocení' }
      ]
    };
  }

  private enhancePresentationSlides(slides: any[]): any[] {
    return slides.map((slide, index) => ({
      ...slide,
      slideNumber: index + 1,
      estimatedTime: this.estimateSlideTime(slide),
      visualSuggestions: this.generateSlideVisuals(slide),
      transitionSuggestion: index < slides.length - 1 ? 'Plynulý přechod k dalšímu tématu' : 'Závěrečné shrnutí'
    }));
  }

  private generateSpeakerNotes(slides: any[]): string[] {
    return slides.map((slide, index) => 
      `Slide ${index + 1}: ${slide.heading}\nKlíčové body k vysvětlení: ${slide.bullets?.join(', ') || 'Rozveďte téma podle obsahu'}`
    );
  }

  private generateVisualSuggestions(slides: any[]): string[] {
    return slides.map(slide => 
      `Pro slide "${slide.heading}": Použijte jednoduché schéma nebo diagram k vizualizaci hlavních bodů`
    );
  }

  private structureActivityInstructions(instructions: any): any {
    if (Array.isArray(instructions)) {
      return {
        preparation: instructions.slice(0, Math.ceil(instructions.length / 3)),
        execution: instructions.slice(Math.ceil(instructions.length / 3), Math.ceil(instructions.length * 2 / 3)),
        conclusion: instructions.slice(Math.ceil(instructions.length * 2 / 3))
      };
    }
    
    return {
      preparation: ['Připravte si potřebné materiály'],
      execution: [instructions],
      conclusion: ['Zhodnoťte výsledky aktivity']
    };
  }

  private generateSafetyNotes(content: any): string[] {
    const notes = ['Dodržujte pokyny učitele', 'Pracujte opatrně s materiály'];
    
    const text = this.extractTextContent(content);
    if (text.includes('nůžky') || text.includes('řezání')) {
      notes.push('Opatrně zacházejte s ostrými předměty');
    }
    if (text.includes('chemikálie') || text.includes('experiment')) {
      notes.push('Používejte ochranné pomůcky');
    }
    
    return notes;
  }

  private generateActivityAssessment(_content: any): string[] {
    return [
      'Aktivní účast v činnosti',
      'Dodržování pokynů',
      'Kvalita výsledků',
      'Spolupráce ve skupině',
      'Reflexe a zhodnocení'
    ];
  }

  private calculateCriteriaWeight(criteria: string): number {
    // Simple weight calculation based on criteria importance
    const importantKeywords = ['kvalita', 'originalita', 'přesnost', 'úplnost'];
    const hasImportantKeyword = importantKeywords.some(keyword => 
      criteria.toLowerCase().includes(keyword)
    );
    return hasImportantKeyword ? 0.3 : 0.2;
  }

  private generateRubricDescriptors(criteria: string): string[] {
    return [
      `Výborně (4): ${criteria} splněno na vysoké úrovni`,
      `Dobře (3): ${criteria} splněno s drobnými nedostatky`,
      `Dostatečně (2): ${criteria} splněno základně`,
      `Nedostatečně (1): ${criteria} nesplněno nebo s velkými nedostatky`
    ];
  }

  private estimateSlideTime(slide: any): string {
    const bulletCount = slide.bullets?.length || 1;
    const estimatedMinutes = Math.max(1, Math.ceil(bulletCount / 2));
    return `${estimatedMinutes} min`;
  }

  private generateSlideVisuals(slide: any): string {
    const heading = slide.heading?.toLowerCase() || '';
    
    if (heading.includes('graf') || heading.includes('data')) {
      return 'Graf nebo tabulka';
    }
    if (heading.includes('proces') || heading.includes('postup')) {
      return 'Vývojový diagram';
    }
    if (heading.includes('porovnání')) {
      return 'Srovnávací tabulka';
    }
    
    return 'Jednoduché schéma nebo obrázek';
  }
}

interface ScaffoldingStrategy {
  name: string;
  generator: (content: any, subtype?: MaterialSubtype) => ScaffoldingElement[];
}