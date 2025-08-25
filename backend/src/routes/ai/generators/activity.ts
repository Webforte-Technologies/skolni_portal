import { Router, Response } from 'express';
import { authenticateToken, RequestWithUser } from '../../../middleware/auth';
import { validateBody } from '../../../middleware/zodValidation';
import { ActivityGenerationSchema } from '../../../schemas/ai';
import { ActivityData } from '../../../types/ai-generators';
import { 
  sendSSEMessage, 
  sendSSEError
} from '../../../services/ai-generation/sse-utils';
import { 
  initializeGenerator,
  saveGeneratedFile,
  extractAndSaveMetadata,
  handleGeneratorError
} from '../../../services/ai-generation/common-patterns';
import { parseActivityResponse } from '../../../services/ai-generation/response-parsers';
import { AIService } from '../../../services/AIService';
import { logUserAction } from '../../../middleware/activity-logger';

/**
 * Create activity routes with AIService injection
 */
export default function createActivityRoutes(aiService: AIService): Router {
  const router = Router();

  // Generate activity endpoint
  router.post('/generate-activity', authenticateToken, validateBody(ActivityGenerationSchema), async (req: RequestWithUser, res: Response) => {
    try {
      const { 
        topic, 
        subject, 
        grade_level, 
        activity_type, 
        duration, 
        group_size, 
        learning_objectives, 
        materials_needed, 
        custom_instructions 
      } = req.body;
      
      // Initialize generator (credits, SSE headers)
      const initResult = await initializeGenerator(req, res, 'activity', 'Activity generation');
      if (!initResult.success) {
        return;
      }

      // Send start message
      sendSSEMessage(res, { type: 'start', message: 'Starting activity generation...' });

      // Initialize enhanced prompt builder
      const { EnhancedPromptBuilder } = await import('../../../services/EnhancedPromptBuilder');
      const promptBuilder = new EnhancedPromptBuilder();

      // Build enhanced prompt
      sendSSEMessage(res, { type: 'chunk', content: 'Building enhanced prompt...\n' });
      
      const promptParams: any = {
        materialType: 'activity',
        userInputs: {
          title: topic,
          subject: subject || '',
          grade_level: grade_level || '',
          activity_type: activity_type,
          duration: duration,
          group_size: group_size,
          learning_objectives: learning_objectives,
          materials_needed: materials_needed
        },
        qualityLevel: 'standardní',
        customInstructions: custom_instructions
      };

      const enhancedPrompt = await promptBuilder.buildPrompt(promptParams);

      // Generate content with AIService using enhanced prompt
      sendSSEMessage(res, { type: 'chunk', content: 'Generating activity content...\n' });

      const materialResult = await aiService.generateMaterial({
        type: 'exercise',
        subject: subject,
        topic: topic,
        description: `Vytvoř aktivitu na téma: ${topic}`,
        userId: req.user!.id,
        customInstructions: custom_instructions,
        systemPrompt: enhancedPrompt, // Pass the enhanced prompt
        metadata: {
          user_role: req.user!.role
        }
      });

      if (!materialResult.success) {
        sendSSEError(res, materialResult.error || 'Failed to generate activity content');
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
      let validatedData: ActivityData;
      try {
        validatedData = parseActivityResponse(fullResponse);
      } catch (parseError) {
        console.error('Failed to parse activity JSON:', parseError);
        sendSSEError(res, 'The AI response could not be parsed as a valid activity.');
        res.end();
        return;
      }

      // Save the generated file to the database
      let savedFile: any;
      try {
        const metadata = extractAndSaveMetadata(
          validatedData,
          'intermediate',
          [topic, subject, grade_level, activity_type].filter(Boolean)
        );

        savedFile = await saveGeneratedFile(
          req.user!.id,
          validatedData.title || 'Generated Activity',
          validatedData,
          'activity',
          metadata
        );
      } catch (saveError) {
        console.error('Failed to save activity to database:', saveError);
        sendSSEMessage(res, { 
          type: 'chunk', 
          content: 'Warning: Could not save to database, but generation completed.\n' 
        });
      }

      // Send final response
      const endMessage: any = {
        type: 'end',
        file_id: savedFile?.id || '',
        file_type: 'activity',
        credits_used: initResult.creditsUsed,
        credits_balance: initResult.newBalance,
        activity: validatedData,
        metadata: materialResult.metadata
      };
      
      sendSSEMessage(res, endMessage);

      // Log the activity generation activity
      await logUserAction(
        req.user!.id,
        'file_generated',
        {
          file_id: savedFile.id,
          file_type: 'activity',
          topic: topic || 'N/A',
          activity_type: activity_type || 'N/A',
          duration: duration || 'N/A',
          credits_used: initResult.creditsUsed || 0,
          ai_model: materialResult.metadata?.model_used || 'unknown',
          tokens_used: materialResult.metadata?.tokens_used || 0
        },
        req
      );

      res.end();

    } catch (error) {
      console.error('Activity generation error:', error);
      handleGeneratorError(res, error, 'activity');
    }
  });

  return router;
}
