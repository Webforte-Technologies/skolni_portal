import { Router, Response } from 'express';
import { authenticateToken, RequestWithUser } from '../../../middleware/auth';
import { validateBody } from '../../../middleware/zodValidation';
import { ProjectGenerationSchema } from '../../../schemas/ai';
import { ProjectData, validateProject } from '../../../types/ai-generators';
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
import { parseProjectResponse } from '../../../services/ai-generation/response-parsers';
import { AIService } from '../../../services/AIService';
import { logUserAction } from '../../../middleware/activity-logger';

/**
 * Create project routes with AIService injection
 */
export default function createProjectRoutes(aiService: AIService): Router {
  const router = Router();

  // Generate project endpoint
  router.post('/generate-project', authenticateToken, validateBody(ProjectGenerationSchema), async (req: RequestWithUser, res: Response) => {
    try {
      const { 
        topic, 
        subject, 
        grade_level, 
        project_type, 
        duration, 
        group_size, 
        learning_objectives, 
        deliverables, 
        assessment_criteria, 
        custom_instructions 
      } = req.body;
      
      // Initialize generator (credits, SSE headers)
      const initResult = await initializeGenerator(req, res, 'project', 'Project generation');
      if (!initResult.success) {
        return;
      }

      // Send start message
      sendSSEMessage(res, { type: 'start', message: 'Starting project generation...' });

      // Initialize enhanced prompt builder
      const { EnhancedPromptBuilder } = await import('../../../services/EnhancedPromptBuilder');
      const promptBuilder = new EnhancedPromptBuilder();

      // Build enhanced prompt
      sendSSEMessage(res, { type: 'chunk', content: 'Building enhanced prompt...\n' });
      
      const promptParams: any = {
        materialType: 'project',
        userInputs: {
          title: topic,
          subject: subject || '',
          grade_level: grade_level || '',
          project_type: project_type,
          duration: duration,
          group_size: group_size,
          learning_objectives: learning_objectives,
          deliverables: deliverables,
          assessment_criteria: assessment_criteria
        },
        qualityLevel: 'standardní',
        customInstructions: custom_instructions
      };

      const enhancedPrompt = await promptBuilder.buildPrompt(promptParams);

      // Generate content with AIService using enhanced prompt
      sendSSEMessage(res, { type: 'chunk', content: 'Generating project content...\n' });

      const materialResult = await aiService.generateMaterial({
        type: 'exercise',
        subject: subject,
        topic: topic,
        description: `Vytvoř projekt na téma: ${topic}`,
        userId: req.user!.id,
        customInstructions: custom_instructions,
        systemPrompt: enhancedPrompt, // Pass the enhanced prompt
        metadata: {
          user_role: req.user!.role
        }
      });

      if (!materialResult.success) {
        sendSSEError(res, materialResult.error || 'Failed to generate project content');
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
      let validatedData: ProjectData;
      try {
        validatedData = parseProjectResponse(fullResponse);
      } catch (parseError) {
        console.error('Failed to parse project JSON:', parseError);
        sendSSEError(res, 'The AI response could not be parsed as a valid project.');
        res.end();
        return;
      }

      // Save the generated file to the database
      let savedFile: any;
      try {
        const metadata = extractAndSaveMetadata(
          validatedData,
          'intermediate',
          [topic, subject, grade_level, project_type].filter(Boolean)
        );

        savedFile = await saveGeneratedFile(
          req.user!.id,
          validatedData.title || 'Generated Project',
          validatedData,
          'project',
          metadata
        );
      } catch (saveError) {
        console.error('Failed to save project to database:', saveError);
        sendSSEMessage(res, { 
          type: 'chunk', 
          content: 'Warning: Could not save to database, but generation completed.\n' 
        });
      }

      // Send final response
      const endMessage: any = {
        type: 'end',
        file_id: savedFile?.id || '',
        file_type: 'project',
        credits_used: initResult.creditsUsed,
        credits_balance: initResult.newBalance,
        project: validatedData,
        metadata: materialResult.metadata
      };
      
      sendSSEMessage(res, endMessage);

      // Log the project generation activity
      await logUserAction(
        req.user!.id,
        'file_generated',
        {
          file_id: savedFile.id,
          file_type: 'project',
          topic: topic || 'N/A',
          project_type: project_type || 'N/A',
          duration: duration || 'N/A',
          credits_used: initResult.creditsUsed || 0,
          ai_model: materialResult.metadata?.model_used || 'unknown',
          tokens_used: materialResult.metadata?.tokens_used || 0
        },
        req
      );

      res.end();

    } catch (error) {
      console.error('Project generation error:', error);
      handleGeneratorError(res, error, 'project');
    }
  });

  return router;
}
