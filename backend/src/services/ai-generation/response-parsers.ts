import { 
  WorksheetData,
  LessonPlanData,
  QuizData,
  ProjectData,
  PresentationData,
  ActivityData
} from '../../types/ai-generators';
import { 
  validateAIResponse,
  cleanAIResponse,
  hasValidJsonStructure
} from './validators';
import {
  constructBasicProjectStructure,
  constructBasicPresentationStructure,
  constructBasicActivityStructure,
  constructGenericStructure
} from './structure-builders';

/**
 * Parse and validate worksheet response
 */
export function parseWorksheetResponse(rawResponse: string): WorksheetData {
  const cleanedResponse = cleanAIResponse(rawResponse);
  
  return validateAIResponse(
    cleanedResponse,
    (data) => data as WorksheetData,
    (response) => constructGenericStructure('worksheet', response, 'Pracovní list', 'Matematika')
  );
}

/**
 * Parse and validate lesson plan response
 */
export function parseLessonPlanResponse(rawResponse: string): LessonPlanData {
  const cleanedResponse = cleanAIResponse(rawResponse);
  
  return validateAIResponse(
    cleanedResponse,
    (data) => data as LessonPlanData,
    (response) => constructGenericStructure('lesson_plan', response, 'Plán hodiny', 'Obecný')
  );
}

/**
 * Parse and validate quiz response
 */
export function parseQuizResponse(rawResponse: string): QuizData {
  const cleanedResponse = cleanAIResponse(rawResponse);
  
  return validateAIResponse(
    cleanedResponse,
    (data) => data as QuizData,
    (response) => constructGenericStructure('quiz', response, 'Kvíz', 'Obecný')
  );
}

/**
 * Parse and validate project response
 */
export function parseProjectResponse(rawResponse: string): ProjectData {
  const cleanedResponse = cleanAIResponse(rawResponse);
  
  return validateAIResponse(
    cleanedResponse,
    (data) => data as ProjectData,
    constructBasicProjectStructure
  );
}

/**
 * Parse and validate presentation response
 */
export function parsePresentationResponse(rawResponse: string): PresentationData {
  const cleanedResponse = cleanAIResponse(rawResponse);
  
  return validateAIResponse(
    cleanedResponse,
    (data) => data as PresentationData,
    constructBasicPresentationStructure
  );
}

/**
 * Parse and validate activity response
 */
export function parseActivityResponse(rawResponse: string): ActivityData {
  const cleanedResponse = cleanAIResponse(rawResponse);
  
  return validateAIResponse(
    cleanedResponse,
    (data) => data as ActivityData,
    constructBasicActivityStructure
  );
}

/**
 * Generic response parser for any material type
 */
export function parseMaterialResponse<T>(
  rawResponse: string,
  materialType: string,
  validator: (data: any) => T,
  fallbackBuilder: (rawResponse: string) => string
): T {
  const cleanedResponse = cleanAIResponse(rawResponse);
  
  return validateAIResponse(
    cleanedResponse,
    validator,
    fallbackBuilder
  );
}

/**
 * Parse streaming response chunks
 */
export function parseStreamingResponse(chunk: string): {
  type: 'data' | 'error' | 'complete';
  content?: string;
  error?: string;
  data?: any;
} {
  try {
    // Try to parse as JSON first
    if (hasValidJsonStructure(chunk)) {
      const parsed = JSON.parse(chunk);
      return {
        type: 'data',
        data: parsed
      };
    }
    
    // Check for error indicators
    if (chunk.toLowerCase().includes('error') || chunk.toLowerCase().includes('chyba')) {
      return {
        type: 'error',
        error: chunk
      };
    }
    
    // Check for completion indicators
    if (chunk.toLowerCase().includes('complete') || chunk.toLowerCase().includes('dokončeno')) {
      return {
        type: 'complete',
        content: chunk
      };
    }
    
    // Default to data content
    return {
      type: 'data',
      content: chunk
    };
  } catch (error) {
    return {
      type: 'error',
      error: `Failed to parse chunk: ${error}`
    };
  }
}

/**
 * Extract metadata from AI response
 */
export function extractMetadataFromResponse(rawResponse: string): {
  title?: string;
  subject?: string;
  gradeLevel?: string;
  tags?: string[];
} {
  const metadata: any = {};
  
  // Extract title
  const titleMatch = rawResponse.match(/title["\s]*:["\s]*"([^"]+)"/i) || 
                    rawResponse.match(/název["\s]*:["\s]*"([^"]+)"/i);
  if (titleMatch) {
    metadata.title = titleMatch[1];
  }
  
  // Extract subject
  const subjectMatch = rawResponse.match(/subject["\s]*:["\s]*"([^"]+)"/i) ||
                      rawResponse.match(/předmět["\s]*:["\s]*"([^"]+)"/i);
  if (subjectMatch) {
    metadata.subject = subjectMatch[1];
  }
  
  // Extract grade level
  const gradeMatch = rawResponse.match(/grade_level["\s]*:["\s]*"([^"]+)"/i) ||
                    rawResponse.match(/ročník["\s]*:["\s]*"([^"]+)"/i);
  if (gradeMatch) {
    metadata.gradeLevel = gradeMatch[1];
  }
  
  // Extract tags
  const tagsMatch = rawResponse.match(/tags["\s]*:["\s]*\[([^\]]+)\]/i);
  if (tagsMatch) {
    try {
      metadata.tags = JSON.parse(`[${tagsMatch[1]}]`);
    } catch {
      // Parse manually if JSON parsing fails
      metadata.tags = tagsMatch[1]?.split(',').map(tag => tag.trim().replace(/"/g, '')).filter(Boolean) || [];
    }
  }
  
  return metadata;
}
