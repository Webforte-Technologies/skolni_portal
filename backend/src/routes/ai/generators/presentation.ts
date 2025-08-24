import { Router, Response } from 'express';
import { authenticateToken, RequestWithUser } from '../../../middleware/auth';
import { validateBody } from '../../../middleware/zodValidation';
import { PresentationGenerationSchema } from '../../../schemas/ai';
import { PresentationData } from '../../../types/ai-generators';
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
import { parsePresentationResponse } from '../../../services/ai-generation/response-parsers';
import { AIService } from '../../../services/AIService';
import { logUserAction } from '../../../middleware/activity-logger';

/**
 * Create presentation routes with AIService injection
 */
export default function createPresentationRoutes(aiService: AIService): Router {
  const router = Router();

  // Generate presentation endpoint
  router.post('/generate-presentation', authenticateToken, validateBody(PresentationGenerationSchema), async (req: RequestWithUser, res: Response) => {
    try {
      const { 
        topic, 
        subject, 
        grade_level, 
        presentation_type, 
        slide_count, 
        _duration, 
        learning_objectives, 
        custom_instructions 
      } = req.body;
      
      // Initialize generator (credits, SSE headers)
      const initResult = await initializeGenerator(req, res, 'presentation', 'Presentation generation');
      if (!initResult.success) {
        return;
      }

      // Send start message
      sendSSEMessage(res, { type: 'start', message: 'Starting presentation generation...' });

      // Initialize enhanced prompt builder
      const { EnhancedPromptBuilder } = await import('../../../services/EnhancedPromptBuilder');
      const promptBuilder = new EnhancedPromptBuilder();

      // Build enhanced prompt
      sendSSEMessage(res, { type: 'chunk', content: 'Building enhanced prompt...\n' });
      
      const promptParams: any = {
        materialType: 'presentation',
        userInputs: {
          title: topic,
          subject: subject || '',
          grade_level: grade_level || '',
          presentation_type: presentation_type,
          slide_count: slide_count,
          learning_objectives: learning_objectives
        },
        qualityLevel: 'standardní',
        customInstructions: custom_instructions
      };

      const enhancedPrompt = await promptBuilder.buildPrompt(promptParams);

      // Generate content with AIService using enhanced prompt
      sendSSEMessage(res, { type: 'chunk', content: 'Generating presentation content...\n' });

      const materialResult = await aiService.generateMaterial({
        type: 'exercise',
        subject: subject,
        topic: topic,
        description: `Vytvoř prezentaci na téma: ${topic}`,
        userId: req.user!.id,
        customInstructions: custom_instructions,
        systemPrompt: enhancedPrompt, // Pass the enhanced prompt
        metadata: {
          user_role: req.user!.role
        }
      });

      if (!materialResult.success) {
        sendSSEError(res, materialResult.error || 'Failed to generate presentation content');
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
      let validatedData: PresentationData;
      try {
        validatedData = parsePresentationResponse(fullResponse);
      } catch (parseError) {
        console.error('Failed to parse presentation JSON:', parseError);
        sendSSEError(res, 'The AI response could not be parsed as a valid presentation.');
        res.end();
        return;
      }

      // Save the generated file to the database
      let savedFile: any;
      try {
        const metadata = extractAndSaveMetadata(
          validatedData,
          'intermediate',
          [topic, subject, grade_level, presentation_type].filter(Boolean)
        );

        savedFile = await saveGeneratedFile(
          req.user!.id,
          validatedData.title || 'Generated Presentation',
          validatedData,
          'presentation',
          metadata
        );
      } catch (saveError) {
        console.error('Failed to save presentation to database:', saveError);
        sendSSEMessage(res, { 
          type: 'chunk', 
          content: 'Warning: Could not save to database, but generation completed.\n' 
        });
      }

      // Send final response
      const endMessage: any = {
        type: 'end',
        file_id: savedFile?.id || '',
        file_type: 'presentation',
        credits_used: initResult.creditsUsed,
        credits_balance: initResult.newBalance,
        presentation: validatedData,
        metadata: materialResult.metadata
      };
      
      sendSSEMessage(res, endMessage);

      // Log the presentation generation activity
      await logUserAction(
        req.user!.id,
        'file_generated',
        {
          file_id: savedFile?.id || '',
          file_type: 'presentation',
          topic: topic || 'N/A',
          slide_count: slide_count || 0,
          style: presentation_type || 'N/A',
          credits_used: initResult.creditsUsed || 0,
          ai_model: materialResult.metadata?.model_used || 'unknown',
          tokens_used: materialResult.metadata?.tokens_used || 0
        },
        req
      );

      res.end();

    } catch (error) {
      console.error('Presentation generation error:', error);
      handleGeneratorError(res, error, 'presentation');
    }
  });

  return router;
}
