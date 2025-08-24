import { RequestWithUser } from '../../middleware/auth';
import { GeneratedFileModel } from '../../models/GeneratedFile';
import { validateAndDeductCredits, MaterialType } from './credit-handler';
import { sendSSEMessage, setupSSEHeaders, sendSSEError } from './sse-utils';
import { deriveTags } from './validators';
import { extractMetadataFromResponse } from './response-parsers';

/**
 * Common generator initialization pattern
 */
export async function initializeGenerator(
  req: RequestWithUser,
  res: any,
  materialType: MaterialType,
  description?: string
): Promise<{
  success: boolean;
  error?: string;
  creditsUsed?: number;
  newBalance?: number;
}> {
  // Setup SSE headers
  setupSSEHeaders(res);
  
  // Validate credits
  const creditResult = await validateAndDeductCredits(req, materialType, description);
  
  if (!creditResult.success) {
    sendSSEError(res, creditResult.error || 'Nedostatek kreditů');
    res.end();
    return creditResult;
  }
  
  return creditResult;
}

/**
 * Common file saving pattern
 */
export async function saveGeneratedFile(
  userId: string,
  title: string,
  content: any,
  fileType: string,
  metadata?: {
    category?: string;
    subject?: string;
    difficulty?: string;
    gradeLevel?: string;
    tags?: string[];
  }
): Promise<any> {
  try {
    const savedFile = await GeneratedFileModel.create({
      user_id: userId,
      title: title,
      content: typeof content === 'string' ? content : JSON.stringify(content),
      file_type: fileType
    });

    // Update AI metadata if provided
    if (metadata) {
      await GeneratedFileModel.updateAIMetadata(savedFile.id, metadata);
    }

    return savedFile;
  } catch (error) {
    console.error('Failed to save generated file:', error);
    throw error;
  }
}

/**
 * Common metadata extraction pattern
 */
export function extractAndSaveMetadata(
  validatedData: any,
  difficulty?: string,
  customTags?: string[]
): {
  category: string;
  subject: string;
  difficulty: string;
  gradeLevel: string;
  tags: string[];
} {
  const metadata = extractMetadataFromResponse(JSON.stringify(validatedData));
  
  const tags = Array.isArray(validatedData.tags) && validatedData.tags.length 
    ? validatedData.tags 
    : deriveTags(validatedData.title, validatedData.subject, '', validatedData.template);
  
  // Add custom tags if provided
  if (customTags && customTags.length > 0) {
    tags.push(...customTags);
  }
  
  return {
    category: validatedData.template || 'unknown',
    subject: metadata.subject || validatedData.subject || '',
    difficulty: difficulty || 'střední',
    gradeLevel: metadata.gradeLevel || validatedData.grade_level || '',
    tags: [...new Set(tags)].filter(tag => typeof tag === 'string') as string[] // Remove duplicates and ensure strings
  };
}

/**
 * Common error handling pattern
 */
export function handleGeneratorError(
  res: any,
  error: any,
  context: string
): void {
  console.error(`${context} error:`, error);
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
  sendSSEError(res, errorMessage);
  res.end();
}

/**
 * Common success response pattern
 */
export function sendGeneratorSuccess(
  res: any,
  data: any,
  creditsUsed: number,
  newBalance: number,
  fileId?: string
): void {
  sendSSEMessage(res, { 
    type: 'end', 
    ...data,
    credits_used: creditsUsed,
    credits_balance: newBalance,
    file_id: fileId
  });
  res.end();
}

/**
 * Common MCP request builder
 */
export function buildMCPRequest(
  req: RequestWithUser,
  materialType: string,
  parameters: any,
  priority: 'low' | 'normal' | 'high' = 'normal',
  caching: boolean = true
): any {
  return {
    id: require('uuid').v4(),
    type: 'generation' as const,
    user_id: req.user!.id,
    priority,
    parameters: {
      material_type: materialType,
      ...parameters,
      language: 'cs-CZ'
    },
    metadata: {
      ip_address: req.ip || 'unknown',
      user_agent: req.get('User-Agent') || 'unknown',
      timestamp: new Date().toISOString(),
      user_role: req.user!.role
    },
    caching: {
      enabled: caching,
      ttl_seconds: 3600 // Cache for 1 hour
    }
  };
}

/**
 * Common MCP response handler
 */
export async function handleMCPResponse(
  response: any,
  res: any,
  validator: (data: any) => any,
  materialType: MaterialType,
  req: RequestWithUser,
  creditsUsed: number
): Promise<any> {
  if (!response.success) {
    sendSSEError(res, response.error?.message || 'MCP generation failed');
    res.end();
    return null;
  }

  // Parse and validate the response
  let validatedData: any;
  try {
    const content = response.data?.content || response.data?.generated_material;
    if (typeof content === 'string') {
      const parsedData = JSON.parse(content);
      validatedData = validator(parsedData);
    } else {
      throw new Error('Invalid response format from MCP server');
    }
  } catch (parseError) {
    console.error('Failed to parse JSON:', parseError);
    sendSSEError(res, 'The AI response could not be parsed as valid data.');
    res.end();
    return null;
  }

  // Save the generated file
  let savedFile: any;
  try {
    const metadata = extractAndSaveMetadata(validatedData);
    savedFile = await saveGeneratedFile(
      req.user!.id,
      validatedData.title || `Generated ${materialType}`,
      validatedData,
      materialType,
      metadata
    );
  } catch (saveError) {
    console.error('Failed to save generated file:', saveError);
    sendSSEMessage(res, { 
      type: 'chunk', 
      content: 'Warning: Could not save to database, but generation completed.\n' 
    });
  }

  // Get updated user balance
  const { getUpdatedUserBalance } = await import('./credit-handler');
  const updatedBalance = await getUpdatedUserBalance(req.user!.id);

  return {
    validatedData,
    savedFile,
    updatedBalance
  };
}

/**
 * Common generation progress tracking
 */
export function trackGenerationProgress(
  res: any,
  currentStep: number,
  totalSteps: number,
  stepName: string
): void {
  const progress = Math.round((currentStep / totalSteps) * 100);
  sendSSEMessage(res, {
    type: 'progress',
    progress: progress,
    message: `${stepName} (${currentStep}/${totalSteps})`
  });
}
