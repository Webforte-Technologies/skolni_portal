import { Router, Response } from 'express';
import { authenticateToken, RequestWithUser } from '../../../middleware/auth';
import { validateBody } from '../../../middleware/zodValidation';
import { LessonPlanGenerationSchema } from '../../../schemas/ai';
import { LessonPlanData } from '../../../types/ai-generators';
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
import { parseLessonPlanResponse } from '../../../services/ai-generation/response-parsers';
import { AIService } from '../../../services/AIService';
import { logUserAction } from '../../../middleware/activity-logger';

/**
 * Create lesson plan routes with AIService injection
 */
export default function createLessonPlanRoutes(aiService: AIService): Router {
  const router = Router();

  // Generate lesson plan endpoint
  router.post('/generate-lesson-plan', authenticateToken, validateBody(LessonPlanGenerationSchema), async (req: RequestWithUser, res: Response) => {
    try {
      const { 
        title, 
        subject, 
        grade_level, 
        duration, 
        assignment_description, 
        teaching_methods, 
        available_resources, 
        custom_instructions 
      } = req.body;
      
      // Initialize generator (credits, SSE headers)
      const initResult = await initializeGenerator(req, res, 'lesson-plan', 'Lesson plan generation');
      if (!initResult.success) {
        return;
      }

      // Send start message
      sendSSEMessage(res, { type: 'start', message: 'Starting lesson plan generation...' });

      // Initialize enhanced prompt builder
      const { EnhancedPromptBuilder } = await import('../../../services/EnhancedPromptBuilder');
      const promptBuilder = new EnhancedPromptBuilder();

      // Build enhanced prompt
      sendSSEMessage(res, { type: 'chunk', content: 'Building enhanced prompt...\n' });
      
      const promptParams: any = {
        materialType: 'lesson-plan',
        userInputs: {
          title: title || subject,
          subject: subject || '',
          grade_level: grade_level || '',
          duration: duration,
          assignment_description: assignment_description,
          teaching_methods: teaching_methods,
          available_resources: available_resources
        },
        qualityLevel: 'standardní',
        customInstructions: custom_instructions
      };

      const enhancedPrompt = await promptBuilder.buildPrompt(promptParams);

      // Generate content with AIService using enhanced prompt
      sendSSEMessage(res, { type: 'chunk', content: 'Generating lesson plan content...\n' });

      const materialResult = await aiService.generateMaterial({
        type: 'lesson_plan',
        subject: subject,
        topic: title || subject,
        description: assignment_description || `Vytvoř plán hodiny na téma: ${title || subject}`,
        userId: req.user!.id,
        customInstructions: custom_instructions,
        systemPrompt: enhancedPrompt, // Pass the enhanced prompt
        metadata: {
          user_role: req.user!.role
        }
      });

      if (!materialResult.success) {
        sendSSEError(res, materialResult.error || 'Failed to generate lesson plan content');
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
      let validatedData: LessonPlanData;
      try {
        validatedData = parseLessonPlanResponse(fullResponse);
      } catch (parseError) {
        console.error('Failed to parse lesson plan JSON:', parseError);
        sendSSEError(res, 'The AI response could not be parsed as a valid lesson plan.');
        res.end();
        return;
      }

      // Save the generated file to the database
      let savedFile: any;
      try {
        const metadata = extractAndSaveMetadata(
          validatedData,
          'intermediate',
          [title || subject, subject, grade_level].filter(Boolean)
        );

        savedFile = await saveGeneratedFile(
          req.user!.id,
          validatedData.title || title || 'Generated Lesson Plan',
          validatedData,
          'lesson_plan',
          metadata
        );
      } catch (saveError) {
        console.error('Failed to save lesson plan to database:', saveError);
        sendSSEMessage(res, { 
          type: 'chunk', 
          content: 'Warning: Could not save to database, but generation completed.\n' 
        });
      }

      // Send final response
      const endMessage: any = {
        type: 'end',
        file_id: savedFile?.id || '',
        file_type: 'lesson_plan',
        credits_used: initResult.creditsUsed,
        credits_balance: initResult.newBalance,
        lesson_plan: validatedData,
        metadata: materialResult.metadata
      };
      
      sendSSEMessage(res, endMessage);

      // Log the lesson plan generation activity
      await logUserAction(
        req.user!.id,
        'file_generated',
        {
          file_id: savedFile.id,
          file_type: 'lesson_plan',
          topic: title || subject,
          grade_level: grade_level || 'N/A',
          duration: duration || 'N/A',
          credits_used: initResult.creditsUsed || 0,
          ai_model: materialResult.metadata?.model_used || 'unknown',
          tokens_used: materialResult.metadata?.tokens_used || 0
        },
        req
      );

      res.end();

    } catch (error) {
      console.error('Lesson plan generation error:', error);
      handleGeneratorError(res, error, 'lesson_plan');
    }
  });

  return router;
}
