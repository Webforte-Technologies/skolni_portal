import { api } from './apiClient';
import { AssignmentAnalysis, AssignmentAnalysisRequest, AssignmentAnalysisResponse, MaterialTypeSuggestion } from '../types/MaterialTypes';

export class AssignmentAnalysisService {
  /**
   * Analyze assignment description and get AI suggestions
   */
  static async analyzeAssignment(description: string): Promise<AssignmentAnalysisResponse> {
    try {
      // Use a longer timeout for AI operations (30 seconds)
      const response = await api.post<AssignmentAnalysisResponse>('/ai/analyze-assignment', {
        description
      } as AssignmentAnalysisRequest, {
        timeout: 30000 // 30 seconds for AI analysis
      });

      return response.data.data || {
        analysis: {
          suggestedMaterialTypes: [],
          extractedObjectives: [],
          detectedDifficulty: 'Střední',
          subjectArea: 'Obecné',
          estimatedDuration: '45 min',
          keyTopics: [],
          confidence: 0
        },
        suggestions: []
      };
    } catch (error: any) {
      console.error('Error analyzing assignment:', error);
      
      // Handle timeout specifically
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Analýza zadání trvala příliš dlouho. Zkuste to prosím znovu nebo zkraťte popis zadání.');
      }
      
      throw error;
    }
  }

  /**
   * Get material type suggestions based on assignment analysis
   */
  static async getMaterialTypeSuggestions(analysis: AssignmentAnalysis): Promise<MaterialTypeSuggestion[]> {
    try {
      // Use a longer timeout for AI operations (20 seconds)
      const response = await api.post<MaterialTypeSuggestion[]>('/ai/suggest-material-types', {
        analysis
      }, {
        timeout: 20000 // 20 seconds for suggestions
      });

      return response.data.data || [];
    } catch (error: any) {
      console.error('Error getting material type suggestions:', error);
      
      // Handle timeout specifically
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Generování návrhů trvalo příliš dlouho. Zkuste to prosím znovu.');
      }
      
      throw error;
    }
  }

  /**
   * Extract learning objectives from text using AI
   */
  static extractLearningObjectives(text: string): string[] {
    // Simple extraction logic - in real implementation this would use AI
    const objectives: string[] = [];
    
    // Look for common patterns
    const patterns = [
      /studenti? (?:se )?(?:naučí|pochopí|zvládnou|budou umět|dokážou) ([^.!?]+)/gi,
      /cílem? (?:je|bude) ([^.!?]+)/gi,
      /po (?:této )?(?:hodině|lekci|aktivitě) (?:studenti? )?(?:budou )?(?:umět|znát|chápat) ([^.!?]+)/gi
    ];

    patterns.forEach(pattern => {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        objectives.push(match[1].trim());
      }
    });

    return objectives;
  }

  /**
   * Detect difficulty level from text
   */
  static detectDifficulty(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('začátečník') || lowerText.includes('základní') || lowerText.includes('jednoduch')) {
      return 'Začátečník';
    } else if (lowerText.includes('pokročil') || lowerText.includes('složit') || lowerText.includes('náročn')) {
      return 'Pokročilé';
    } else if (lowerText.includes('těžk') || lowerText.includes('obtížn')) {
      return 'Těžké';
    } else if (lowerText.includes('snadn') || lowerText.includes('lehk')) {
      return 'Snadné';
    }
    
    return 'Střední';
  }

  /**
   * Extract subject area from text
   */
  static detectSubjectArea(text: string): string {
    const lowerText = text.toLowerCase();
    
    const subjects = [
      { keywords: ['matematik', 'číslo', 'rovnic', 'geometri', 'algebr'], subject: 'Matematika' },
      { keywords: ['přírodověd', 'biologi', 'fyzik', 'chemi', 'ekologi'], subject: 'Přírodověda' },
      { keywords: ['český jazyk', 'čeština', 'literatur', 'gramatik', 'pravopis'], subject: 'Český jazyk' },
      { keywords: ['dějepis', 'histori', 'událost', 'období', 'válk'], subject: 'Dějepis' },
      { keywords: ['výtvarn', 'umění', 'kreslen', 'malován'], subject: 'Výtvarná výchova' },
      { keywords: ['hudební', 'hudba', 'zpěv', 'nástroj'], subject: 'Hudební výchova' },
      { keywords: ['tělesn', 'sport', 'cvičen', 'pohyb'], subject: 'Tělesná výchova' }
    ];

    for (const { keywords, subject } of subjects) {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        return subject;
      }
    }

    return 'Obecné';
  }

  /**
   * Estimate duration from text
   */
  static estimateDuration(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('krátk') || lowerText.includes('rychl')) {
      return '15-30 min';
    } else if (lowerText.includes('dlouh') || lowerText.includes('podrobn')) {
      return '60-90 min';
    } else if (lowerText.includes('celá hodina') || lowerText.includes('90 min')) {
      return '90 min';
    } else if (lowerText.includes('45 min') || lowerText.includes('vyučovací hodina')) {
      return '45 min';
    }
    
    return '45 min';
  }
}