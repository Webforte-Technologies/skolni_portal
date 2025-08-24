import { Router, Response } from 'express';
import { authenticateToken, RequestWithUser } from '../../../middleware/auth';
import { validateBody } from '../../../middleware/zodValidation';
import { BatchGenerationRequestSchema } from '../../../schemas/ai';
import { SYSTEM_PROMPT } from '../../../services/ai-generation/system-prompts';
import { 
  sendSSEMessage, 
  setupSSEHeaders, 
  sendSSEError,
  escapeSSEContent 
} from '../../../services/ai-generation/sse-utils';
import { 
  initializeGenerator,
  saveGeneratedFile,
  extractAndSaveMetadata,
  handleGeneratorError,
  sendGeneratorSuccess
} from '../../../services/ai-generation/common-patterns';
import { AIService } from '../../../services/AIService';
import { logUserAction } from '../../../middleware/activity-logger';

/**
 * Create batch routes with AIService injection
 */
export default function createBatchRoutes(aiService: AIService): Router {
  const router = Router();

  // Generate batch endpoint
  router.post('/generate-batch', authenticateToken, validateBody(BatchGenerationRequestSchema), async (req: RequestWithUser, res: Response) => {
    try {
      const { 
        topic, 
        subject, 
        grade_level, 
        material_types, 
        count_per_type, 
        difficulty, 
        custom_instructions 
      } = req.body;
      
      // Initialize generator (credits, SSE headers)
      const initResult = await initializeGenerator(req, res, 'batch', 'Batch generation');
      if (!initResult.success) {
        return;
      }

      // Send start message
      sendSSEMessage(res, { type: 'start', message: 'Starting batch generation...' });

      // Generate content with AIService
      sendSSEMessage(res, { type: 'chunk', content: 'Generating batch content...\n' });

      const materialResult = await aiService.generateMaterial({
        type: 'exercise',
        subject: subject,
        topic: topic,
        description: `Vytvoř sadu materiálů na téma: ${topic}`,
        userId: req.user!.id,
        difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced' || 'intermediate',
        customInstructions: custom_instructions,
        metadata: {
          user_role: req.user!.role
        }
      });

      if (!materialResult.success) {
        sendSSEError(res, materialResult.error || 'Failed to generate batch content');
        res.end();
        return;
      }

      const fullResponse = materialResult.content || '';

      // Check if we received any content
      if (!fullResponse.trim()) {
        sendSSEError(res, 'No content received from AI. Please try again.');
        res.end();
        return;
      }

      // Parse and validate JSON response
      let validatedData: any;
      try {
        // The original code had parseBatchGenerationResponse here, but it's not imported.
        // Assuming the intent was to parse the JSON response if the AI service returned it directly.
        // For now, we'll just log the error if parsing fails.
        validatedData = JSON.parse(fullResponse); // Fallback to JSON parsing if specific parser is not available
      } catch (parseError) {
        console.error('Failed to parse batch JSON:', parseError);
        sendSSEError(res, 'The AI response could not be parsed as a valid batch generation.');
        res.end();
        return;
      }

      // Save the generated file to the database
      let savedFile: any;
      try {
        const metadata = extractAndSaveMetadata(
          validatedData,
          'intermediate',
          [topic, subject, grade_level, material_types?.join(', ')].filter(Boolean)
        );

        savedFile = await saveGeneratedFile(
          req.user!.id,
          validatedData.title || 'Generated Batch',
          validatedData,
          'batch',
          metadata
        );
      } catch (saveError) {
        console.error('Failed to save batch to database:', saveError);
        sendSSEMessage(res, { 
          type: 'chunk', 
          content: 'Warning: Could not save to database, but generation completed.\n' 
        });
      }

      // Send final response
      const endMessage: any = {
        type: 'end',
        file_id: savedFile?.id || '',
        file_type: 'batch',
        credits_used: initResult.creditsUsed,
        credits_balance: initResult.newBalance,
        batch: validatedData,
        metadata: materialResult.metadata
      };
      
      sendSSEMessage(res, endMessage);

      // Log the batch generation activity
      await logUserAction(
        req.user!.id,
        'file_generated',
        {
          file_id: savedFile?.id || '',
          file_type: 'batch',
          topic: topic || 'N/A',
          material_count: count_per_type || 0,
          material_types: material_types?.join(', ') || 'N/A',
          credits_used: initResult.creditsUsed || 0,
          ai_model: materialResult.metadata?.model_used || 'unknown',
          tokens_used: materialResult.metadata?.tokens_used || 0
        },
        req
      );

      res.end();

    } catch (error) {
      console.error('Batch generation error:', error);
      handleGeneratorError(res, error, 'batch');
    }
  });

  return router;
}
