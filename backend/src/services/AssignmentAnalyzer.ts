import OpenAI from 'openai';

export interface AssignmentAnalysis {
  learningObjectives: string[];
  difficulty: DifficultyLevel;
  subject: string;
  gradeLevel: string;
  estimatedDuration: string;
  keyTopics: string[];
  suggestedMaterialTypes: MaterialType[];
  confidence: number;
}

export type DifficultyLevel = 'základní' | 'střední' | 'pokročilá' | 'expertní';
export type MaterialType = 'worksheet' | 'lesson-plan' | 'quiz' | 'project' | 'presentation' | 'activity';

export class AssignmentAnalyzer {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env['OPENAI_API_KEY'],
    });
  }

  async analyzeAssignment(description: string): Promise<AssignmentAnalysis> {
    try {
      const prompt = this.buildAnalysisPrompt(description);
      
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'Jsi expert na vzdělávání v České republice. Analyzuješ zadání úkolů a poskytneš strukturovanou analýzu pro tvorbu výukových materiálů.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000
      });

      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No response from OpenAI');
      }

      return this.parseAnalysisResponse(content, description);
    } catch (error) {
      console.error('Assignment analysis failed:', error);
      // Return fallback analysis
      return this.createFallbackAnalysis(description);
    }
  }

  extractLearningObjectives(text: string): string[] {
    const objectives: string[] = [];
    
    // Look for explicit objectives patterns
    const objectivePatterns = [
      /cíl[e]?\s*[:]\s*([^.!?]+)/gi,
      /student[iy]?\s+(?:se\s+)?(?:naučí|zvládnou|pochopí|dokáží)\s*([^.!?]+)/gi,
      /po\s+(?:této\s+)?hodině\s+(?:student[iy]?\s+)?(?:budou\s+)?(?:umět|znát|chápat)\s*([^.!?]+)/gi,
      /(?:naučit|pochopit|zvládnout|osvojit)\s+(?:si\s+)?([^.!?]+)/gi
    ];

    for (const pattern of objectivePatterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        const objective = match[1]?.trim();
        if (objective && objective.length > 10 && !objectives.includes(objective)) {
          objectives.push(objective);
        }
      }
    }

    // If no explicit objectives found, extract key concepts
    if (objectives.length === 0) {
      const concepts = this.extractKeyConcepts(text);
      objectives.push(...concepts.slice(0, 3).map(concept => `Pochopit ${concept}`));
    }

    return objectives.slice(0, 5); // Limit to 5 objectives
  }

  detectDifficulty(text: string): DifficultyLevel {
    const difficultyIndicators = {
      základní: [
        'základy', 'úvod', 'jednoduchý', 'základní', 'začátečník', 
        'první', 'elementární', 'snadný', 'lehký'
      ],
      střední: [
        'střední', 'pokročilejší', 'rozšířený', 'aplikace', 'praktický',
        'kombinace', 'analýza', 'porovnání'
      ],
      pokročilá: [
        'pokročilý', 'složitý', 'komplexní', 'syntéza', 'kritické myšlení',
        'evaluace', 'tvorba', 'design', 'řešení problémů'
      ],
      expertní: [
        'expertní', 'výzkum', 'inovace', 'originální', 'vědecký',
        'teoretický', 'abstraktní', 'meta-analýza'
      ]
    };

    const textLower = text.toLowerCase();
    const scores = {
      základní: 0,
      střední: 0,
      pokročilá: 0,
      expertní: 0
    };

    // Count indicator matches
    for (const [level, indicators] of Object.entries(difficultyIndicators)) {
      for (const indicator of indicators) {
        const matches = (textLower.match(new RegExp(indicator, 'g')) || []).length;
        scores[level as DifficultyLevel] += matches;
      }
    }

    // Additional heuristics
    const wordCount = text.split(/\s+/).length;
    const sentenceCount = text.split(/[.!?]+/).length;
    const avgWordsPerSentence = wordCount / sentenceCount;

    // Longer, more complex sentences suggest higher difficulty
    if (avgWordsPerSentence > 20) scores.pokročilá += 2;
    else if (avgWordsPerSentence > 15) scores.střední += 1;
    else scores.základní += 1;

    // Find the level with highest score
    const maxScore = Math.max(...Object.values(scores));
    const detectedLevel = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as DifficultyLevel;
    
    return detectedLevel || 'střední';
  }

  suggestMaterialTypes(analysis: AssignmentAnalysis): MaterialType[] {
    const suggestions: MaterialType[] = [];
    const text = analysis.keyTopics.join(' ').toLowerCase();
    
    // Rule-based suggestions based on content and objectives
    if (this.containsKeywords(text, ['cvičení', 'úlohy', 'problémy', 'výpočty', 'procvičování'])) {
      suggestions.push('worksheet');
    }
    
    if (this.containsKeywords(text, ['hodina', 'výuka', 'vysvětlit', 'naučit', 'prezentovat'])) {
      suggestions.push('lesson-plan');
    }
    
    if (this.containsKeywords(text, ['test', 'zkouška', 'ověření', 'kontrola', 'kvíz'])) {
      suggestions.push('quiz');
    }
    
    if (this.containsKeywords(text, ['projekt', 'výzkum', 'dlouhodobý', 'samostatná práce', 'tvorba'])) {
      suggestions.push('project');
    }
    
    if (this.containsKeywords(text, ['prezentace', 'slidy', 'vystoupení', 'přednesení'])) {
      suggestions.push('presentation');
    }
    
    if (this.containsKeywords(text, ['aktivita', 'hra', 'cvičení', 'skupinová práce', 'interakce'])) {
      suggestions.push('activity');
    }

    // Default suggestions based on difficulty
    if (suggestions.length === 0) {
      switch (analysis.difficulty) {
        case 'základní':
          suggestions.push('worksheet', 'activity');
          break;
        case 'střední':
          suggestions.push('lesson-plan', 'worksheet', 'quiz');
          break;
        case 'pokročilá':
          suggestions.push('project', 'presentation', 'quiz');
          break;
        case 'expertní':
          suggestions.push('project', 'presentation');
          break;
      }
    }

    return Array.from(new Set(suggestions)); // Remove duplicates
  }

  private buildAnalysisPrompt(description: string): string {
    return `
Analyzuj následující zadání úkolu a poskytni strukturovanou analýzu:

ZADÁNÍ:
${description}

Poskytni analýzu ve formátu JSON s následujícími klíči:
{
  "learningObjectives": ["seznam konkrétních cílů učení"],
  "difficulty": "základní|střední|pokročilá|expertní",
  "subject": "předmět (matematika, čeština, přírodověda, atd.)",
  "gradeLevel": "ročník (1.-9. třída ZŠ, 1.-4. ročník SŠ)",
  "estimatedDuration": "odhadovaná doba (např. '45 min', '2 hodiny')",
  "keyTopics": ["klíčová témata a koncepty"],
  "confidence": 0.85
}

Zaměř se na:
- Identifikaci konkrétních vzdělávacích cílů
- Určení obtížnosti na základě kognitivní náročnosti
- Rozpoznání předmětu a ročníku
- Odhad času potřebného k dokončení
- Extrakci klíčových témat
`;
  }

  private parseAnalysisResponse(content: string, originalDescription: string): AssignmentAnalysis {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // Validate and normalize the response
      const analysis: AssignmentAnalysis = {
        learningObjectives: Array.isArray(parsed.learningObjectives) ? parsed.learningObjectives : [],
        difficulty: this.validateDifficulty(parsed.difficulty),
        subject: typeof parsed.subject === 'string' ? parsed.subject : 'obecný',
        gradeLevel: typeof parsed.gradeLevel === 'string' ? parsed.gradeLevel : 'neurčeno',
        estimatedDuration: typeof parsed.estimatedDuration === 'string' ? parsed.estimatedDuration : '45 min',
        keyTopics: Array.isArray(parsed.keyTopics) ? parsed.keyTopics : [],
        suggestedMaterialTypes: [],
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0.7
      };

      // Generate material type suggestions
      analysis.suggestedMaterialTypes = this.suggestMaterialTypes(analysis);

      return analysis;
    } catch (error) {
      console.error('Failed to parse analysis response:', error);
      return this.createFallbackAnalysis(originalDescription);
    }
  }

  private createFallbackAnalysis(description: string): AssignmentAnalysis {
    return {
      learningObjectives: this.extractLearningObjectives(description),
      difficulty: this.detectDifficulty(description),
      subject: this.detectSubject(description),
      gradeLevel: this.detectGradeLevel(description),
      estimatedDuration: this.estimateDuration(description),
      keyTopics: this.extractKeyConcepts(description),
      suggestedMaterialTypes: ['worksheet', 'lesson-plan'],
      confidence: 0.5
    };
  }

  private validateDifficulty(difficulty: any): DifficultyLevel {
    const validLevels: DifficultyLevel[] = ['základní', 'střední', 'pokročilá', 'expertní'];
    return validLevels.includes(difficulty) ? difficulty : 'střední';
  }

  private detectSubject(text: string): string {
    const subjects = {
      'matematika': ['matematika', 'počty', 'algebra', 'geometrie', 'statistika', 'rovnice'],
      'čeština': ['čeština', 'literatura', 'gramatika', 'pravopis', 'sloh', 'čtení'],
      'přírodověda': ['přírodověda', 'biologie', 'fyzika', 'chemie', 'příroda'],
      'dějepis': ['dějepis', 'historie', 'minulost', 'události', 'období'],
      'zeměpis': ['zeměpis', 'geografie', 'země', 'kontinenty', 'mapy'],
      'angličtina': ['angličtina', 'english', 'anglický jazyk'],
      'informatika': ['informatika', 'počítače', 'programování', 'IT']
    };

    const textLower = text.toLowerCase();
    for (const [subject, keywords] of Object.entries(subjects)) {
      if (keywords.some(keyword => textLower.includes(keyword))) {
        return subject;
      }
    }

    return 'obecný';
  }

  private detectGradeLevel(text: string): string {
    const gradePatterns = [
      /(\d+)\.\s*třída/gi,
      /(\d+)\.\s*ročník/gi,
      /pro\s+(\d+)\.\s*třídu/gi,
      /žáci?\s+(\d+)\.\s*třídy/gi
    ];

    for (const pattern of gradePatterns) {
      const match = pattern.exec(text);
      if (match && match[1]) {
        const grade = parseInt(match[1]);
        if (grade >= 1 && grade <= 9) {
          return `${grade}. třída ZŠ`;
        } else if (grade >= 1 && grade <= 4) {
          return `${grade}. ročník SŠ`;
        }
      }
    }

    return 'neurčeno';
  }

  private estimateDuration(text: string): string {
    const durationPatterns = [
      /(\d+)\s*(?:minut|min)/gi,
      /(\d+)\s*hodin?/gi,
      /(\d+)\s*vyučovacích?\s+hodin?/gi
    ];

    for (const pattern of durationPatterns) {
      const match = pattern.exec(text);
      if (match) {
        return match[0];
      }
    }

    // Default estimation based on text length
    const wordCount = text.split(/\s+/).length;
    if (wordCount < 50) return '20 min';
    if (wordCount < 100) return '45 min';
    if (wordCount < 200) return '90 min';
    return '2 hodiny';
  }

  private extractKeyConcepts(text: string): string[] {
    // Extract nouns and important terms
    const words = text.toLowerCase().split(/\s+/);
    const importantWords = words.filter(word => 
      word.length > 4 && 
      !this.isStopWord(word) &&
      /^[a-záčďéěíňóřšťúůýž]+$/.test(word)
    );

    // Count word frequency
    const wordCount: { [key: string]: number } = {};
    importantWords.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    // Get most frequent words
    const sortedWords = Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([word]) => word);

    return sortedWords;
  }

  private isStopWord(word: string): boolean {
    const stopWords = [
      'a', 'aby', 'ale', 'ani', 'ano', 'asi', 'až', 'bez', 'být', 'co', 'či', 'do', 'ho', 'i', 'já', 'je', 'jeho', 'její', 'jejich', 'jen', 'již', 'jsem', 'jsi', 'jsme', 'jsou', 'jste', 'k', 'kam', 'kde', 'kdo', 'kdy', 'když', 'ma', 'má', 'mají', 'máme', 'máš', 'máte', 'mi', 'mít', 'mně', 'mnou', 'můj', 'může', 'my', 'na', 'nad', 'nám', 'námi', 'nás', 'náš', 'ne', 'nebo', 'něco', 'něj', 'není', 'nějak', 'někde', 'někdo', 'němu', 'ni', 'nic', 'ním', 'nimi', 'nás', 'o', 'od', 'po', 'pod', 'pokud', 'pro', 'proč', 'před', 'při', 's', 'se', 'si', 'sice', 'svá', 'své', 'svůj', 'ta', 'tak', 'také', 'tam', 'te', 'tě', 'těm', 'těmi', 'ti', 'to', 'toto', 'tu', 'ty', 'u', 'už', 'v', 've', 'více', 'všech', 'vy', 'z', 'za', 'ze', 'že'
    ];
    return stopWords.includes(word);
  }

  private containsKeywords(text: string, keywords: string[]): boolean {
    return keywords.some(keyword => text.includes(keyword));
  }
}