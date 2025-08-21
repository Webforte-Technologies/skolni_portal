import { MaterialType } from './AssignmentAnalyzer';

export interface ValidationResult {
  isValid: boolean;
  score: QualityScore;
  issues: ValidationIssue[];
  suggestions: string[];
}

export interface QualityScore {
  overall: number;
  accuracy: number;
  ageAppropriateness: number;
  pedagogicalSoundness: number;
  clarity: number;
  engagement: number;
}

export interface ValidationIssue {
  type: 'error' | 'warning' | 'info';
  category: 'content' | 'structure' | 'language' | 'pedagogy' | 'math';
  message: string;
  field?: string;
  suggestion?: string;
}

export class ContentValidator {
  private czechStopWords: Set<string>;
  // private ageAppropriateVocabulary: Map<string, string[]>;
  private mathematicalPatterns: RegExp[];

  constructor() {
    this.czechStopWords = new Set([
      'a', 'aby', 'ale', 'ani', 'ano', 'asi', 'až', 'bez', 'být', 'co', 'či', 'do', 'ho', 'i', 'já', 'je', 'jeho', 'její', 'jejich', 'jen', 'již', 'jsem', 'jsi', 'jsme', 'jsou', 'jste', 'k', 'kam', 'kde', 'kdo', 'kdy', 'když', 'ma', 'má', 'mají', 'máme', 'máš', 'máte', 'mi', 'mít', 'mně', 'mnou', 'můj', 'může', 'my', 'na', 'nad', 'nám', 'námi', 'nás', 'náš', 'ne', 'nebo', 'něco', 'něj', 'není', 'nějak', 'někde', 'někdo', 'němu', 'ni', 'nic', 'ním', 'nimi', 'o', 'od', 'po', 'pod', 'pokud', 'pro', 'proč', 'před', 'při', 's', 'se', 'si', 'sice', 'svá', 'své', 'svůj', 'ta', 'tak', 'také', 'tam', 'te', 'tě', 'těm', 'těmi', 'ti', 'to', 'toto', 'tu', 'ty', 'u', 'už', 'v', 've', 'více', 'všech', 'vy', 'z', 'za', 'ze', 'že'
    ]);

    // this.ageAppropriateVocabulary = new Map([
    //   ['1.-3. třída ZŠ', ['jednoduchý', 'snadný', 'základní', 'malý', 'velký', 'krásný', 'dobrý']],
    //   ['4.-6. třída ZŠ', ['složitější', 'pokročilejší', 'důležitý', 'zajímavý', 'užitečný', 'praktický']],
    //   ['7.-9. třída ZŠ', ['komplexní', 'analytický', 'systematický', 'teoretický', 'abstraktní']],
    //   ['SŠ', ['sofistikovaný', 'konceptuální', 'metodologický', 'epistemologický', 'paradigmatický']]
    // ]);

    this.mathematicalPatterns = [
      /\d+\s*[\+\-\*\/]\s*\d+/g, // Basic operations
      /\d+\s*=\s*\d+/g, // Equations
      /[a-z]\s*[\+\-\*\/]\s*[a-z]/g, // Algebraic expressions
      /\d*[a-z](\^|\*\*)\d+/g, // Powers
      /√\d+/g, // Square roots
      /\(\d+[\+\-\*\/]\d+\)/g // Parentheses
    ];
  }

  validateContent(content: any, type: MaterialType): ValidationResult {
    const issues: ValidationIssue[] = [];
    let score: QualityScore = {
      overall: 0,
      accuracy: 0,
      ageAppropriateness: 0,
      pedagogicalSoundness: 0,
      clarity: 0,
      engagement: 0
    };

    try {
      // Validate structure based on material type
      this.validateStructure(content, type, issues);
      
      // Validate content quality
      score.accuracy = this.validateAccuracy(content, type, issues);
      score.ageAppropriateness = this.checkAgeAppropriateness(content, issues);
      score.pedagogicalSoundness = this.validatePedagogicalSoundness(content, type, issues);
      score.clarity = this.validateClarity(content, issues);
      score.engagement = this.validateEngagement(content, issues);

      // Calculate overall score
      score.overall = (
        score.accuracy * 0.25 +
        score.ageAppropriateness * 0.20 +
        score.pedagogicalSoundness * 0.25 +
        score.clarity * 0.15 +
        score.engagement * 0.15
      );

      const isValid = score.overall >= 0.6 && !issues.some(issue => issue.type === 'error');
      const suggestions = this.generateSuggestions(issues, score);

      return {
        isValid,
        score,
        issues,
        suggestions
      };
    } catch (error) {
      issues.push({
        type: 'error',
        category: 'content',
        message: `Chyba při validaci obsahu: ${error instanceof Error ? error.message : 'Neznámá chyba'}`
      });

      return {
        isValid: false,
        score,
        issues,
        suggestions: ['Opravte strukturální chyby v obsahu']
      };
    }
  }

  checkEducationalQuality(content: any): QualityScore {
    const result = this.validateContent(content, this.detectMaterialType(content));
    return result.score;
  }

  validateMathematicalAccuracy(content: any): boolean {
    const mathExpressions = this.extractMathematicalExpressions(content);
    
    for (const expression of mathExpressions) {
      if (!this.isValidMathExpression(expression)) {
        return false;
      }
    }

    return true;
  }

  checkAgeAppropriateness(content: any, issues: ValidationIssue[]): number {
    let score = 1.0;
    const gradeLevel = content.grade_level || '';
    const textContent = this.extractTextContent(content);
    
    // Check vocabulary complexity
    const vocabularyScore = this.assessVocabularyComplexity(textContent, gradeLevel);
    if (vocabularyScore < 0.7) {
      issues.push({
        type: 'warning',
        category: 'language',
        message: 'Slovní zásoba může být příliš složitá pro daný ročník',
        suggestion: 'Použijte jednodušší slova a kratší věty'
      });
      score *= 0.8;
    }

    // Check sentence complexity
    const sentenceComplexity = this.assessSentenceComplexity(textContent);
    const expectedComplexity = this.getExpectedComplexity(gradeLevel);
    
    if (sentenceComplexity > expectedComplexity * 1.5) {
      issues.push({
        type: 'warning',
        category: 'language',
        message: 'Věty jsou příliš složité pro daný ročník',
        suggestion: 'Rozdělte dlouhé věty na kratší a jednodušší'
      });
      score *= 0.9;
    }

    // Check content appropriateness
    const inappropriateContent = this.detectInappropriateContent(textContent);
    if (inappropriateContent.length > 0) {
      issues.push({
        type: 'error',
        category: 'content',
        message: `Nevhodný obsah pro daný věk: ${inappropriateContent.join(', ')}`,
        suggestion: 'Odstraňte nebo upravte nevhodný obsah'
      });
      score *= 0.5;
    }

    return Math.max(0, score);
  }

  private validateStructure(content: any, type: MaterialType, issues: ValidationIssue[]): void {
    const requiredFields = this.getRequiredFields(type);
    
    for (const field of requiredFields) {
      if (!content[field]) {
        issues.push({
          type: 'error',
          category: 'structure',
          message: `Chybí povinné pole: ${field}`,
          field,
          suggestion: `Přidejte pole ${field}`
        });
      }
    }

    // Type-specific validation
    switch (type) {
      case 'worksheet':
        this.validateWorksheetStructure(content, issues);
        break;
      case 'lesson-plan':
        this.validateLessonPlanStructure(content, issues);
        break;
      case 'quiz':
        this.validateQuizStructure(content, issues);
        break;
      case 'project':
        this.validateProjectStructure(content, issues);
        break;
      case 'presentation':
        this.validatePresentationStructure(content, issues);
        break;
      case 'activity':
        this.validateActivityStructure(content, issues);
        break;
    }
  }

  private validateAccuracy(content: any, _type: MaterialType, issues: ValidationIssue[]): number {
    let score = 1.0;

    // Check mathematical accuracy
    if (this.containsMathContent(content)) {
      const mathAccuracy = this.validateMathematicalAccuracy(content);
      if (!mathAccuracy) {
        issues.push({
          type: 'error',
          category: 'math',
          message: 'Nalezeny matematické chyby v obsahu',
          suggestion: 'Zkontrolujte všechny výpočty a vzorce'
        });
        score *= 0.3;
      }
    }

    // Check factual accuracy (basic checks)
    const factualIssues = this.checkBasicFactualAccuracy(content);
    if (factualIssues.length > 0) {
      factualIssues.forEach(issue => issues.push(issue));
      score *= Math.max(0.5, 1 - (factualIssues.length * 0.1));
    }

    // Check language accuracy
    const languageIssues = this.checkLanguageAccuracy(content);
    if (languageIssues.length > 0) {
      languageIssues.forEach(issue => issues.push(issue));
      score *= Math.max(0.7, 1 - (languageIssues.length * 0.05));
    }

    return Math.max(0, score);
  }

  private validatePedagogicalSoundness(content: any, type: MaterialType, issues: ValidationIssue[]): number {
    let score = 1.0;

    // Check learning objectives alignment
    if (content.objectives && Array.isArray(content.objectives)) {
      const objectiveQuality = this.assessLearningObjectives(content.objectives);
      if (objectiveQuality < 0.7) {
        issues.push({
          type: 'warning',
          category: 'pedagogy',
          message: 'Cíle učení nejsou dostatečně konkrétní nebo měřitelné',
          suggestion: 'Formulujte cíle pomocí akčních sloves (naučí se, dokáže, pochopí)'
        });
        score *= 0.8;
      }
    }

    // Check difficulty progression
    if (type === 'worksheet' && content.questions) {
      const progressionScore = this.assessDifficultyProgression(content.questions);
      if (progressionScore < 0.6) {
        issues.push({
          type: 'warning',
          category: 'pedagogy',
          message: 'Úlohy nemají vhodnou postupnou obtížnost',
          suggestion: 'Uspořádejte úlohy od nejjednodušších k nejobtížnějším'
        });
        score *= 0.9;
      }
    }

    // Check activity timing (for lesson plans)
    if (type === 'lesson-plan' && content.activities && content.duration) {
      const timingScore = this.validateActivityTiming(content.activities, content.duration);
      if (timingScore < 0.8) {
        issues.push({
          type: 'warning',
          category: 'pedagogy',
          message: 'Časový rozvrh aktivit neodpovídá celkové délce hodiny',
          suggestion: 'Upravte časy jednotlivých aktivit tak, aby odpovídaly celkové délce'
        });
        score *= 0.9;
      }
    }

    return Math.max(0, score);
  }

  private validateClarity(content: any, issues: ValidationIssue[]): number {
    let score = 1.0;
    // const textContent = this.extractTextContent(content);

    // Check instruction clarity
    const instructions = this.extractInstructions(content);
    for (const instruction of instructions) {
      const clarityScore = this.assessInstructionClarity(instruction);
      if (clarityScore < 0.7) {
        issues.push({
          type: 'warning',
          category: 'language',
          message: 'Některé pokyny nejsou dostatečně jasné',
          suggestion: 'Použijte konkrétní a jednoznačné formulace'
        });
        score *= 0.9;
        break;
      }
    }

    // Check question clarity (for quizzes and worksheets)
    if (content.questions && Array.isArray(content.questions)) {
      const unclearQuestions = content.questions.filter((q: any) => 
        this.assessQuestionClarity(q.question || q.problem) < 0.7
      );
      
      if (unclearQuestions.length > 0) {
        issues.push({
          type: 'warning',
          category: 'language',
          message: `${unclearQuestions.length} otázek není dostatečně jasných`,
          suggestion: 'Přeformulujte nejasné otázky jednodušeji a konkrétněji'
        });
        score *= Math.max(0.6, 1 - (unclearQuestions.length / content.questions.length) * 0.5);
      }
    }

    return Math.max(0, score);
  }

  private validateEngagement(content: any, issues: ValidationIssue[]): number {
    let score = 0.5; // Base score

    // Check variety in content
    const varietyScore = this.assessContentVariety(content);
    score += varietyScore * 0.3;

    // Check interactive elements
    const interactivityScore = this.assessInteractivity(content);
    score += interactivityScore * 0.2;

    // Check real-world connections
    const relevanceScore = this.assessRealWorldRelevance(content);
    score += relevanceScore * 0.3;

    if (score < 0.6) {
      issues.push({
        type: 'info',
        category: 'pedagogy',
        message: 'Obsah by mohl být více poutavý pro žáky',
        suggestion: 'Přidejte praktické příklady, různorodé aktivity nebo interaktivní prvky'
      });
    }

    return Math.min(1.0, score);
  }

  private getRequiredFields(type: MaterialType): string[] {
    const commonFields = ['title'];
    
    switch (type) {
      case 'worksheet':
        return [...commonFields, 'instructions', 'questions'];
      case 'lesson-plan':
        return [...commonFields, 'subject', 'grade_level', 'duration', 'objectives', 'activities'];
      case 'quiz':
        return [...commonFields, 'questions', 'time_limit'];
      case 'project':
        return [...commonFields, 'description', 'objectives', 'deliverables'];
      case 'presentation':
        return [...commonFields, 'slides'];
      case 'activity':
        return [...commonFields, 'goal', 'instructions', 'materials'];
      default:
        return commonFields;
    }
  }

  private validateWorksheetStructure(content: any, issues: ValidationIssue[]): void {
    if (content.questions && Array.isArray(content.questions)) {
      if (content.questions.length === 0) {
        issues.push({
          type: 'error',
          category: 'structure',
          message: 'Pracovní list musí obsahovat alespoň jednu úlohu',
          field: 'questions'
        });
      }

      content.questions.forEach((question: any, index: number) => {
        if (!question.problem && !question.question) {
          issues.push({
            type: 'error',
            category: 'structure',
            message: `Úloha ${index + 1} nemá zadání`,
            field: `questions[${index}].problem`
          });
        }
        if (!question.answer) {
          issues.push({
            type: 'error',
            category: 'structure',
            message: `Úloha ${index + 1} nemá odpověď`,
            field: `questions[${index}].answer`
          });
        }
      });
    }
  }

  private validateLessonPlanStructure(content: any, issues: ValidationIssue[]): void {
    if (content.activities && Array.isArray(content.activities)) {
      if (content.activities.length === 0) {
        issues.push({
          type: 'error',
          category: 'structure',
          message: 'Plán hodiny musí obsahovat alespoň jednu aktivitu',
          field: 'activities'
        });
      }

      content.activities.forEach((activity: any, index: number) => {
        if (!activity.name) {
          issues.push({
            type: 'error',
            category: 'structure',
            message: `Aktivita ${index + 1} nemá název`,
            field: `activities[${index}].name`
          });
        }
        if (!activity.time) {
          issues.push({
            type: 'error',
            category: 'structure',
            message: `Aktivita ${index + 1} nemá časový údaj`,
            field: `activities[${index}].time`
          });
        }
      });
    }
  }

  private validateQuizStructure(content: any, issues: ValidationIssue[]): void {
    if (content.questions && Array.isArray(content.questions)) {
      content.questions.forEach((question: any, index: number) => {
        if (!question.type) {
          issues.push({
            type: 'error',
            category: 'structure',
            message: `Otázka ${index + 1} nemá specifikovaný typ`,
            field: `questions[${index}].type`
          });
        }

        if (question.type === 'multiple_choice' && (!question.options || question.options.length < 2)) {
          issues.push({
            type: 'error',
            category: 'structure',
            message: `Otázka ${index + 1} s výběrem musí mít alespoň 2 možnosti`,
            field: `questions[${index}].options`
          });
        }
      });
    }
  }

  private validateProjectStructure(content: any, issues: ValidationIssue[]): void {
    if (content.deliverables && Array.isArray(content.deliverables) && content.deliverables.length === 0) {
      issues.push({
        type: 'warning',
        category: 'structure',
        message: 'Projekt by měl mít specifikované výstupy',
        field: 'deliverables'
      });
    }

    if (content.rubric && Array.isArray(content.rubric) && content.rubric.length === 0) {
      issues.push({
        type: 'warning',
        category: 'structure',
        message: 'Projekt by měl mít hodnotící rubriku',
        field: 'rubric'
      });
    }
  }

  private validatePresentationStructure(content: any, issues: ValidationIssue[]): void {
    if (content.slides && Array.isArray(content.slides)) {
      if (content.slides.length === 0) {
        issues.push({
          type: 'error',
          category: 'structure',
          message: 'Prezentace musí obsahovat alespoň jeden slide',
          field: 'slides'
        });
      }

      content.slides.forEach((slide: any, index: number) => {
        if (!slide.heading) {
          issues.push({
            type: 'warning',
            category: 'structure',
            message: `Slide ${index + 1} nemá nadpis`,
            field: `slides[${index}].heading`
          });
        }
      });
    }
  }

  private validateActivityStructure(content: any, issues: ValidationIssue[]): void {
    if (content.instructions && Array.isArray(content.instructions) && content.instructions.length === 0) {
      issues.push({
        type: 'error',
        category: 'structure',
        message: 'Aktivita musí obsahovat pokyny',
        field: 'instructions'
      });
    }

    if (content.materials && Array.isArray(content.materials) && content.materials.length === 0) {
      issues.push({
        type: 'warning',
        category: 'structure',
        message: 'Aktivita by měla specifikovat potřebné materiály',
        field: 'materials'
      });
    }
  }

  private extractMathematicalExpressions(content: any): string[] {
    const textContent = this.extractTextContent(content);
    const expressions: string[] = [];

    for (const pattern of this.mathematicalPatterns) {
      const matches = textContent.match(pattern);
      if (matches) {
        expressions.push(...matches);
      }
    }

    return expressions;
  }

  private isValidMathExpression(expression: string): boolean {
    try {
      // Basic validation - check if expression can be evaluated
      // Remove variables for basic arithmetic check
      const numericExpression = expression.replace(/[a-z]/g, '1');
      
      // Simple evaluation for basic arithmetic
      if (/^[\d\+\-\*\/\(\)\s]+$/.test(numericExpression)) {
        // Use Function constructor for safe evaluation of simple math
        const result = new Function('return ' + numericExpression)();
        return typeof result === 'number' && !isNaN(result);
      }

      return true; // For complex expressions, assume valid
    } catch {
      return false;
    }
  }

  private containsMathContent(content: any): boolean {
    const textContent = this.extractTextContent(content);
    return this.mathematicalPatterns.some(pattern => pattern.test(textContent));
  }

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

  private assessVocabularyComplexity(text: string, gradeLevel: string): number {
    const words = text.toLowerCase().split(/\s+/).filter(word => 
      word.length > 3 && !this.czechStopWords.has(word)
    );

    if (words.length === 0) return 1.0;

    // Simple heuristic: longer words are more complex
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    const expectedLength = this.getExpectedWordLength(gradeLevel);
    const ratio = avgWordLength / expectedLength;

    return Math.max(0, Math.min(1, 2 - ratio));
  }

  private getExpectedWordLength(gradeLevel: string): number {
    if (gradeLevel.includes('1.') || gradeLevel.includes('2.') || gradeLevel.includes('3.')) return 5;
    if (gradeLevel.includes('4.') || gradeLevel.includes('5.') || gradeLevel.includes('6.')) return 6;
    if (gradeLevel.includes('7.') || gradeLevel.includes('8.') || gradeLevel.includes('9.')) return 7;
    return 8; // High school
  }

  private assessSentenceComplexity(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    if (sentences.length === 0) return 0;

    const avgWordsPerSentence = sentences.reduce((sum, sentence) => {
      return sum + sentence.split(/\s+/).length;
    }, 0) / sentences.length;

    return avgWordsPerSentence;
  }

  private getExpectedComplexity(gradeLevel: string): number {
    if (gradeLevel.includes('1.') || gradeLevel.includes('2.') || gradeLevel.includes('3.')) return 8;
    if (gradeLevel.includes('4.') || gradeLevel.includes('5.') || gradeLevel.includes('6.')) return 12;
    if (gradeLevel.includes('7.') || gradeLevel.includes('8.') || gradeLevel.includes('9.')) return 16;
    return 20; // High school
  }

  private detectInappropriateContent(text: string): string[] {
    const inappropriate = ['násilí', 'alkohol', 'drogy', 'sex', 'smrt'];
    const found: string[] = [];
    
    const textLower = text.toLowerCase();
    for (const word of inappropriate) {
      if (textLower.includes(word)) {
        found.push(word);
      }
    }
    
    return found;
  }

  private checkBasicFactualAccuracy(_content: any): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    // Basic factual checks would go here
    // For now, return empty array
    return issues;
  }

  private checkLanguageAccuracy(content: any): ValidationIssue[] {
    const issues: ValidationIssue[] = [];
    const text = this.extractTextContent(content);
    
    // Check for common Czech language errors
    if (text.includes('mě') && text.includes('mně')) {
      // This is a simplified check - in real implementation, context matters
    }
    
    return issues;
  }

  private assessLearningObjectives(objectives: string[]): number {
    if (objectives.length === 0) return 0;
    
    const actionVerbs = ['naučí', 'dokáže', 'pochopí', 'aplikuje', 'analyzuje', 'vytvoří', 'zhodnotí'];
    const measurableObjectives = objectives.filter(obj => 
      actionVerbs.some(verb => obj.toLowerCase().includes(verb))
    );
    
    return measurableObjectives.length / objectives.length;
  }

  private assessDifficultyProgression(questions: any[]): number {
    if (questions.length < 2) return 1.0;
    
    // Simple heuristic: questions should get progressively longer/more complex
    let progressionScore = 0;
    for (let i = 1; i < questions.length; i++) {
      const prevLength = (questions[i-1].problem || questions[i-1].question || '').length;
      const currLength = (questions[i].problem || questions[i].question || '').length;
      
      if (currLength >= prevLength) {
        progressionScore++;
      }
    }
    
    return progressionScore / (questions.length - 1);
  }

  private validateActivityTiming(activities: any[], duration: string): number {
    const totalMinutes = this.parseTimeToMinutes(duration);
    const activityMinutes = activities.reduce((sum, activity) => {
      return sum + this.parseTimeToMinutes(activity.time || '0');
    }, 0);
    
    const ratio = Math.abs(totalMinutes - activityMinutes) / totalMinutes;
    return Math.max(0, 1 - ratio);
  }

  private parseTimeToMinutes(timeStr: string): number {
    const match = /(\d+)\s*min/i.exec(timeStr);
    return match && match[1] ? parseInt(match[1], 10) : 0;
  }

  private extractInstructions(content: any): string[] {
    const instructions: string[] = [];
    
    if (content.instructions) {
      if (typeof content.instructions === 'string') {
        instructions.push(content.instructions);
      } else if (Array.isArray(content.instructions)) {
        instructions.push(...content.instructions);
      }
    }
    
    return instructions;
  }

  private assessInstructionClarity(instruction: string): number {
    // Simple heuristic: clear instructions have action verbs and specific details
    const actionVerbs = ['napište', 'vypočítajte', 'vysvětlete', 'najděte', 'určete', 'dokažte'];
    const hasActionVerb = actionVerbs.some(verb => instruction.toLowerCase().includes(verb));
    
    const wordCount = instruction.split(/\s+/).length;
    const isAppropriateLength = wordCount >= 3 && wordCount <= 30;
    
    return (hasActionVerb ? 0.6 : 0.2) + (isAppropriateLength ? 0.4 : 0.1);
  }

  private assessQuestionClarity(question: string): number {
    if (!question || question.length < 5) return 0;
    
    // Questions should be clear and specific
    const hasQuestionWord = /\b(co|jak|kdy|kde|proč|který|kolik)\b/i.test(question);
    const endsWithQuestionMark = question.trim().endsWith('?');
    const isReasonableLength = question.length >= 10 && question.length <= 200;
    
    let score = 0.3;
    if (hasQuestionWord || endsWithQuestionMark) score += 0.4;
    if (isReasonableLength) score += 0.3;
    
    return score;
  }

  private assessContentVariety(content: any): number {
    let varietyScore = 0;
    
    // Check for different types of content elements
    if (content.questions && Array.isArray(content.questions)) {
      const questionTypes = new Set(content.questions.map((q: any) => q.type));
      varietyScore += Math.min(1, questionTypes.size / 3);
    }
    
    if (content.activities && Array.isArray(content.activities)) {
      varietyScore += Math.min(1, content.activities.length / 5);
    }
    
    return Math.min(1, varietyScore);
  }

  private assessInteractivity(content: any): number {
    const text = this.extractTextContent(content);
    const interactiveWords = ['diskutujte', 'pracujte ve skupinách', 'prezentujte', 'experimentujte', 'zkoumejte'];
    
    const interactiveElements = interactiveWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    
    return Math.min(1, interactiveElements / 3);
  }

  private assessRealWorldRelevance(content: any): number {
    const text = this.extractTextContent(content);
    const relevantWords = ['praktický', 'každodenní', 'skutečný', 'aplikace', 'příklad z praxe', 'v životě'];
    
    const relevantElements = relevantWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    
    return Math.min(1, relevantElements / 2);
  }

  private detectMaterialType(content: any): MaterialType {
    if (content.questions) return 'quiz';
    if (content.activities) return 'lesson-plan';
    if (content.slides) return 'presentation';
    if (content.deliverables) return 'project';
    if (content.goal && content.materials) return 'activity';
    return 'worksheet';
  }

  private generateSuggestions(issues: ValidationIssue[], score: QualityScore): string[] {
    const suggestions: string[] = [];
    
    // Add suggestions based on issues
    issues.forEach(issue => {
      if (issue.suggestion) {
        suggestions.push(issue.suggestion);
      }
    });
    
    // Add suggestions based on low scores
    if (score.accuracy < 0.7) {
      suggestions.push('Zkontrolujte faktickou správnost všech informací');
    }
    
    if (score.clarity < 0.7) {
      suggestions.push('Zjednodušte jazyk a zpřesněte formulace');
    }
    
    if (score.engagement < 0.6) {
      suggestions.push('Přidejte více interaktivních prvků a praktických příkladů');
    }
    
    if (score.pedagogicalSoundness < 0.7) {
      suggestions.push('Zkontrolujte soulad s pedagogickými principy');
    }
    
    return [...new Set(suggestions)]; // Remove duplicates
  }
}