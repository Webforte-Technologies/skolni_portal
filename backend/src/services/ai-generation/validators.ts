import { 
  validateWorksheet,
  validateLessonPlan,
  validateQuiz,
  validateProject,
  validatePresentation,
  validateActivity
} from '../../types/ai-generators';

/**
 * Tag derivation utility function
 */
export function deriveTags(...parts: Array<string | undefined>): string[] {
  const tags: string[] = [];
  
  for (const part of parts) {
    if (part && typeof part === 'string') {
      // Split by common delimiters and clean up
      const cleanPart = part.trim().toLowerCase();
      if (cleanPart) {
        // Split by spaces, commas, and other common delimiters
        const splitTags = cleanPart.split(/[\s,;|]+/).filter(tag => tag.length > 0);
        tags.push(...splitTags);
      }
    }
  }
  
  // Remove duplicates and limit to reasonable number
  return [...new Set(tags)].slice(0, 10);
}

/**
 * Safe JSON parsing with error handling
 */
export function safeJsonParse<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    console.error('JSON parsing error:', error);
    return fallback;
  }
}

/**
 * Validate AI response and provide fallback if needed
 */
export function validateAIResponse<T>(
  rawResponse: string,
  validator: (data: any) => T,
  fallbackBuilder: (rawResponse: string) => string
): T {
  try {
    // First try to extract JSON from the response
    const extractedJson = extractJsonFromResponse(rawResponse);
    if (extractedJson) {
      const parsedData = JSON.parse(extractedJson);
      if (parsedData) {
        return validator(parsedData);
      }
    }
    
    // If extraction failed, try to parse the raw response directly
    const parsedData = safeJsonParse(rawResponse, null);
    if (parsedData) {
      return validator(parsedData);
    }
  } catch (error) {
    console.error('Validation error:', error);
  }
  
  // If parsing or validation fails, use fallback
  try {
    const fallbackJson = fallbackBuilder(rawResponse);
    const fallbackData = safeJsonParse(fallbackJson, null);
    
    if (fallbackData) {
      return validator(fallbackData);
    }
  } catch (fallbackError) {
    console.error('Fallback builder error:', fallbackError);
  }
  
  throw new Error('Failed to validate AI response and create fallback');
}

/**
 * Material type validators
 */
export const materialValidators = {
  worksheet: validateWorksheet,
  lesson_plan: validateLessonPlan,
  quiz: validateQuiz,
  project: validateProject,
  presentation: validatePresentation,
  activity: validateActivity
} as const;

/**
 * Validate material by type
 */
export function validateMaterialByType<T>(
  materialType: keyof typeof materialValidators,
  data: any
): T {
  const validator = materialValidators[materialType];
  return validator(data) as T;
}

/**
 * Check if response contains valid JSON structure
 */
export function hasValidJsonStructure(response: string): boolean {
  try {
    const parsed = JSON.parse(response);
    return typeof parsed === 'object' && parsed !== null;
  } catch {
    return false;
  }
}

/**
 * Extract JSON from mixed content response
 */
export function extractJsonFromResponse(response: string): string | null {
  // First, try to clean the response
  const cleanedResponse = cleanAIResponse(response);
  
  // Look for JSON object in the response
  const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      JSON.parse(jsonMatch[0]);
      return jsonMatch[0];
    } catch {
      // Invalid JSON, try to fix common issues
      const fixedJson = fixCommonJsonIssues(jsonMatch[0]);
      if (fixedJson) {
        try {
          JSON.parse(fixedJson);
          return fixedJson;
        } catch {
          // Still invalid, continue searching
        }
      }
    }
  }
  
  // Look for JSON array
  const arrayMatch = cleanedResponse.match(/\[[\s\S]*\]/);
  if (arrayMatch) {
    try {
      JSON.parse(arrayMatch[0]);
      return arrayMatch[0];
    } catch {
      // Invalid JSON
    }
  }
  
  return null;
}

/**
 * Fix common JSON formatting issues
 */
function fixCommonJsonIssues(jsonString: string): string | null {
  try {
    // Remove trailing commas
    let fixed = jsonString.replace(/,(\s*[}\]])/g, '$1');
    
    // Fix unquoted property names
    fixed = fixed.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
    
    // Fix single quotes to double quotes
    fixed = fixed.replace(/'/g, '"');
    
    // Fix missing quotes around string values
    fixed = fixed.replace(/:\s*([a-zA-Z][a-zA-Z0-9\s]*[a-zA-Z0-9])\s*([,}])/g, ': "$1"$2');
    
    // Try to parse the fixed JSON
    JSON.parse(fixed);
    return fixed;
  } catch {
    return null;
  }
}

/**
 * Clean and normalize AI response
 */
export function cleanAIResponse(response: string): string {
  return response
    .trim()
    .replace(/^```json\s*/i, '')  // Remove markdown code blocks
    .replace(/\s*```\s*$/i, '')   // Remove trailing code blocks
    .replace(/^```\s*/i, '')      // Remove leading code blocks
    .trim();
}

/**
 * Validate required fields in material data
 */
export function validateRequiredFields(data: any, requiredFields: string[]): {
  isValid: boolean;
  missingFields: string[];
} {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (!data || data[field] === undefined || data[field] === null) {
      missingFields.push(field);
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}
