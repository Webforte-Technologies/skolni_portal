import { Router, Request, Response } from 'express';
import { authenticateToken, RequestWithUser } from '../../../middleware/auth';
import { validateBody } from '../../../middleware/zodValidation';
import { QuizGenerationSchema } from '../../../schemas/ai';
import { AIService } from '../../../services/AIService';
import { v4 as uuidv4 } from 'uuid';
import {
  QuizData,
  validateQuiz,
  SSEMessage
} from '../../../types/ai-generators';
import {
  initializeGenerator,
  saveGeneratedFile,
  extractAndSaveMetadata,
  handleGeneratorError,
  sendGeneratorSuccess
} from '../../../services/ai-generation/common-patterns';
import {
  checkUserCredits,
  deductCredits,
  getUpdatedUserBalance
} from '../../../services/ai-generation/credit-handler';
import {
  setupSSEHeaders,
  sendSSEMessage,
  sendSSEConnectionMessage,
  sendSSEError,
  sendSSEProgress,
  sendSSEChunk,
  sendSSEComplete
} from '../../../services/ai-generation/sse-utils';
import {
  parseQuizResponse
} from '../../../services/ai-generation/response-parsers';
import {
  constructGenericStructure
} from '../../../services/ai-generation/structure-builders';
import { GeneratedFileModel } from '../../../models/GeneratedFile';
import { logUserAction } from '../../../middleware/activity-logger';

/**
 * Create quiz routes with AIService injection
 */
export default function createQuizRoutes(aiService: AIService): Router {
  const router = Router();

  // Generate quiz (streaming) with enhanced assignment analysis and subtype support
  router.post('/generate-quiz', authenticateToken, validateBody(QuizGenerationSchema), async (req: RequestWithUser, res: Response) => {
    try {
      if (!req.user) {
        sendSSEError(res, 'Authentication required');
        res.end();
        return;
      }

      const { 
        title, 
        subject, 
        grade_level, 
        assignment_description, 
        subtype_id, 
        question_count, 
        time_limit, 
        prompt_hint, 
        question_types, 
        cognitive_levels, 
        quality_level, 
        custom_instructions 
      } = req.body;

      // Initialize generator with credit check
      const generator = await initializeGenerator(req, res, 'quiz', 'Enhanced quiz generation');
      if (!generator.success) {
        return; // Error already sent by initializeGenerator
      }

      // Send initial progress message
      sendSSEMessage(res, { type: 'chunk', content: 'Initializing quiz generation...\n' });

      // Initialize enhanced prompt builder
      const { EnhancedPromptBuilder } = await import('../../../services/EnhancedPromptBuilder');
      const promptBuilder = new EnhancedPromptBuilder();

      // Build enhanced prompt
      sendSSEMessage(res, { type: 'chunk', content: 'Building enhanced prompt...\n' });
      
      const promptParams: any = {
        materialType: 'quiz',
        userInputs: {
          title: title,
          subject: subject || '',
          grade_level: grade_level || '',
          question_count: question_count,
          time_limit: time_limit,
          question_types: question_types,
          cognitive_levels: cognitive_levels,
          prompt_hint: prompt_hint
        },
        qualityLevel: quality_level || 'standardní',
        customInstructions: custom_instructions
      };

      const enhancedPrompt = await promptBuilder.buildPrompt(promptParams);

      // Generate content with AIService using enhanced prompt
      sendSSEMessage(res, { type: 'chunk', content: 'Generating quiz content...\n' });

      const materialResult = await aiService.generateMaterial({
        type: 'quiz',
        subject: subject,
        topic: title,
        description: assignment_description || `Vytvoř kvíz na téma: ${title}`,
        userId: req.user.id,
        difficulty: 'intermediate',
        customInstructions: custom_instructions,
        questionCount: question_count,
        includeAnswers: true,
        systemPrompt: enhancedPrompt, // Pass the enhanced prompt
        metadata: {
          user_role: req.user.role
        }
      });

      if (!materialResult.success) {
        sendSSEError(res, materialResult.error || 'Failed to generate quiz content');
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
      let validatedData: QuizData;
      try {
        validatedData = parseQuizResponse(fullResponse);
      } catch (parseError) {
        console.error('Failed to parse quiz JSON:', parseError);
        sendSSEError(res, 'The AI response could not be parsed as a valid quiz.');
        res.end();
        return;
      }

      // Save the generated file to the database
      let savedFile: any;
      try {
        const metadata = extractAndSaveMetadata(
          validatedData,
          'intermediate',
          [title, subject, grade_level].filter(Boolean)
        );

        savedFile = await saveGeneratedFile(
          req.user.id,
          validatedData.title || 'Generated Quiz',
          validatedData,
          'quiz',
          metadata
        );
      } catch (saveError) {
        console.error('Failed to save quiz to database:', saveError);
        sendSSEMessage(res, { 
          type: 'chunk', 
          content: 'Warning: Could not save to database, but generation completed.\n' 
        });
      }

      // Send final response
      const endMessage: any = {
        type: 'end',
        file_id: savedFile?.id || '',
        file_type: 'quiz',
        credits_used: generator.creditsUsed,
        credits_balance: generator.newBalance,
        quiz: validatedData,
        metadata: materialResult.metadata
      };
      
      sendSSEMessage(res, endMessage);

      // Log the quiz generation activity
      await logUserAction(
        req.user!.id,
        'file_generated',
        {
          file_id: savedFile.id,
          file_type: 'quiz',
          topic: title,
          question_count: question_count || 0,
          difficulty: 'intermediate',
          credits_used: generator.creditsUsed || 0,
          ai_model: materialResult.metadata?.model_used || 'unknown',
          tokens_used: materialResult.metadata?.tokens_used || 0
        },
        req
      );

      res.end();

    } catch (error) {
      handleGeneratorError(res, error, 'Quiz generation');
    }
  });

  return router;
}
