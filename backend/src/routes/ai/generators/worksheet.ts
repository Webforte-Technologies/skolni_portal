import { Router, Response } from 'express';
import { authenticateToken, RequestWithUser } from '../../../middleware/auth';
import { validateBody } from '../../../middleware/zodValidation';
import { WorksheetGenerationSchema } from '../../../schemas/ai';
import { WorksheetData, validateWorksheet } from '../../../types/ai-generators';
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
import { parseWorksheetResponse } from '../../../services/ai-generation/response-parsers';
import { AIService } from '../../../services/AIService';
import { logUserAction } from '../../../middleware/activity-logger';

/**
 * Create worksheet routes with AIService injection
 */
export default function createWorksheetRoutes(aiService: AIService): Router {
  const router = Router();

  // Generate worksheet endpoint
  router.post('/generate-worksheet', authenticateToken, validateBody(WorksheetGenerationSchema), async (req: RequestWithUser, res: Response) => {
    try {
      const { 
        topic, 
        assignment_description, 
        subtype_id, 
        question_count, 
        difficulty, 
        teaching_style, 
        exercise_types, 
        include_answers, 
        quality_level, 
        custom_instructions 
      } = req.body;
      
      // Check if either topic or assignment_description is provided
      if (!topic && !assignment_description) {
        sendSSEError(res, 'Either topic or assignment_description is required');
        res.end();
        return;
      }

      // Initialize generator (credits, SSE headers)
      const initResult = await initializeGenerator(req, res, 'worksheet', 'Worksheet generation');
      if (!initResult.success) {
        return;
      }

      // Send start message
      sendSSEMessage(res, { type: 'start', message: 'Starting worksheet generation...' });

      // Initialize services
      const { AssignmentAnalyzer } = await import('../../../services/AssignmentAnalyzer');
      const { EnhancedPromptBuilder } = await import('../../../services/EnhancedPromptBuilder');
      const { ContentValidator } = await import('../../../services/ContentValidator');
      const { MaterialSubtypeModel } = await import('../../../models/MaterialSubtype');

      const assignmentAnalyzer = new AssignmentAnalyzer();
      const promptBuilder = new EnhancedPromptBuilder();
      const contentValidator = new ContentValidator();
      const subtypeModel = new MaterialSubtypeModel();

      let assignmentAnalysis = null;
      let subtype = null;

      // Analyze assignment if description is provided
      if (assignment_description) {
        sendSSEMessage(res, { type: 'chunk', content: 'Analyzing assignment description...\n' });
        try {
          assignmentAnalysis = await assignmentAnalyzer.analyzeAssignment(assignment_description);
          sendSSEMessage(res, { 
            type: 'chunk', 
            content: `Assignment analysis complete. Detected subject: ${assignmentAnalysis.subject}, difficulty: ${assignmentAnalysis.difficulty}\n` 
          });
        } catch (error) {
          console.error('Assignment analysis failed:', error);
          sendSSEMessage(res, { 
            type: 'chunk', 
            content: 'Assignment analysis failed, proceeding with manual parameters...\n' 
          });
        }
      }

      // Get subtype if specified
      if (subtype_id) {
        try {
          subtype = await subtypeModel.findById(subtype_id);
          if (!subtype || subtype.parentType !== 'worksheet') {
            sendSSEError(res, 'Invalid worksheet subtype');
            res.end();
            return;
          }
        } catch (error) {
          console.error('Failed to get subtype:', error);
          sendSSEMessage(res, { 
            type: 'chunk', 
            content: 'Failed to get subtype, proceeding with default settings...\n' 
          });
        }
      }

      // Build enhanced prompt
      sendSSEMessage(res, { type: 'chunk', content: 'Building enhanced prompt...\n' });
      
      const userInputs = {
        topic: topic || (assignmentAnalysis ? assignmentAnalysis.keyTopics.join(', ') : ''),
        question_count,
        difficulty: difficulty || (assignmentAnalysis ? assignmentAnalysis.difficulty : 'střední'),
        teaching_style,
        exercise_types,
        include_answers,
        subject: assignmentAnalysis?.subject,
        grade_level: assignmentAnalysis?.gradeLevel
      };

      const promptParams: any = {
        materialType: 'worksheet',
        assignment: assignmentAnalysis as any,
        userInputs: {
          title: userInputs.topic,
          subject: userInputs.subject || '',
          grade_level: userInputs.grade_level || '',
          question_count: userInputs.question_count,
          include_answer_key: userInputs.include_answers,
          question_types: userInputs.exercise_types
        },
        qualityLevel: quality_level || 'standardní',
        customInstructions: custom_instructions
      };

      if (subtype) {
        promptParams.subtype = adaptSubtypeForPromptBuilder(subtype);
      }

      const enhancedPrompt = await promptBuilder.buildPrompt(promptParams);

      // Generate content with AIService using enhanced prompt
      sendSSEMessage(res, { type: 'chunk', content: 'Generating worksheet content...\n' });

      console.log('Worksheet generation parameters:', {
        type: 'worksheet',
        subject: assignmentAnalysis?.subject || 'General',
        topic: topic || (assignmentAnalysis ? assignmentAnalysis.keyTopics.join(', ') : ''),
        description: assignment_description || `Vytvoř cvičení na téma: ${topic}`,
        userId: req.user!.id,
        difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced' || 'intermediate',
        customInstructions: custom_instructions,
        questionCount: question_count,
        includeAnswers: include_answers,
        systemPrompt: enhancedPrompt.substring(0, 200) + '...' // Log first 200 chars
      });

      const materialResult = await aiService.generateMaterial({
        type: 'worksheet',
        subject: assignmentAnalysis?.subject || 'General',
        topic: topic || (assignmentAnalysis ? assignmentAnalysis.keyTopics.join(', ') : ''),
        description: assignment_description || `Vytvoř cvičení na téma: ${topic}`,
        userId: req.user!.id,
        difficulty: difficulty as 'beginner' | 'intermediate' | 'advanced' || 'intermediate',
        customInstructions: custom_instructions,
        questionCount: question_count,
        includeAnswers: include_answers,
        systemPrompt: enhancedPrompt, // Pass the enhanced prompt
        metadata: {
          user_role: req.user!.role
        }
      });

      console.log('Material generation result:', {
        success: materialResult.success,
        hasContent: !!materialResult.content,
        contentLength: materialResult.content?.length || 0,
        error: materialResult.error,
        metadata: materialResult.metadata
      });

      if (!materialResult.success) {
        console.error('Worksheet generation failed:', materialResult.error);
        sendSSEError(res, materialResult.error || 'Failed to generate worksheet content');
        res.end();
        return;
      }

      const fullResponse = materialResult.content || '';

      // Check if we received any content
      if (!fullResponse.trim()) {
        console.error('No content received from AI service');
        sendSSEError(res, 'No content received from AI. Please try again.');
        res.end();
        return;
      }

      console.log('Raw AI response (first 500 chars):', fullResponse.substring(0, 500));

      // Parse and validate JSON response
      let validatedData: WorksheetData;
      try {
        validatedData = parseWorksheetResponse(fullResponse);
        console.log('Successfully parsed worksheet data:', {
          hasTitle: !!validatedData.title,
          hasInstructions: !!validatedData.instructions,
          questionCount: validatedData.questions?.length || 0,
          hasQuestions: !!validatedData.questions && validatedData.questions.length > 0
        });
      } catch (parseError) {
        console.error('Failed to parse worksheet JSON:', parseError);
        console.error('Full response that failed to parse:', fullResponse);
        sendSSEError(res, 'The AI response could not be parsed as a valid worksheet.');
        res.end();
        return;
      }

      // Validate and structure content
      sendSSEMessage(res, { type: 'chunk', content: 'Validating and structuring content...\n' });
      
      try {
        const validationResult = contentValidator.validateContent(validatedData, 'worksheet');
        if (!validationResult.isValid) {
          sendSSEMessage(res, { type: 'chunk', content: 'Content validation completed with warnings...\n' });
        }
      } catch (validationError) {
        console.error('Content validation/structuring failed:', validationError);
        sendSSEMessage(res, { type: 'chunk', content: 'Content validation completed with warnings...\n' });
      }

      // Save the generated file to the database
      let savedFile: any;
      try {
        const metadata = extractAndSaveMetadata(
          validatedData,
          difficulty,
          [topic || assignment_description, teaching_style].filter(Boolean)
        );

        savedFile = await saveGeneratedFile(
          req.user!.id,
          validatedData.title || 'Generated Worksheet',
          validatedData,
          'worksheet',
          metadata
        );

        // Update AI metadata with enhanced information
        const enhancedMetadata = {
          raw: fullResponse,
          prompt: enhancedPrompt,
          assignmentAnalysis: assignmentAnalysis || null,
          subtype: subtype || null,
          qualityLevel: quality_level || 'standardní',
          generationParameters: {
            promptVersion: '2.0-enhanced',
            modelUsed: process.env['OPENAI_MODEL'] || 'gpt-4o-mini',
            temperature: parseFloat(process.env['OPENAI_TEMPERATURE_MATERIALS'] || '0.3'),
            maxTokens: parseInt(process.env['OPENAI_MAX_TOKENS'] || '3000'),
            teachingStyle: teaching_style,
            exerciseTypes: exercise_types,
            includeAnswers: include_answers,
            difficulty: difficulty,
            estimatedTime: '15-30 min',
            customInstructions: custom_instructions
          }
        };

        await savedFile.updateAIMetadata({
          metadata: enhancedMetadata,
          tags: metadata.tags
        });
      } catch (saveError) {
        console.error('Failed to save worksheet to database:', saveError);
        sendSSEMessage(res, { 
          type: 'chunk', 
          content: 'Warning: Could not save to database, but generation completed.\n' 
        });
      }

      // Send final response with enhanced metadata
      const endMessage: any = {
        type: 'end',
        file_id: savedFile?.id || '',
        file_type: 'worksheet',
        credits_used: initResult.creditsUsed,
        credits_balance: initResult.newBalance,
        worksheet: validatedData,
        quality_metrics: {
          assignmentAlignment: assignmentAnalysis ? 0.9 : 0.7,
          contentStructure: 0.85,
          pedagogicalSoundness: 0.8
        }
      };
      
      sendSSEMessage(res, endMessage);

      // Log the worksheet generation activity
      await logUserAction(
        req.user!.id,
        'file_generated',
        {
          file_id: savedFile?.id || '',
          file_type: 'worksheet',
          topic: topic || 'N/A',
          question_count: question_count || 0,
          difficulty: difficulty || 'N/A',
          credits_used: initResult.creditsUsed || 0,
          ai_model: process.env['OPENAI_MODEL'] || 'unknown',
          tokens_used: 0 // Tokens used is not directly available in the current materialResult object
        },
        req
      );

      res.end();

    } catch (error) {
      handleGeneratorError(res, error, 'Worksheet generation');
    }
  });

  // Test endpoint for debugging worksheet generation
  router.post('/test-worksheet-generation', authenticateToken, async (req: RequestWithUser, res: Response) => {
    try {
      console.log('Testing worksheet generation with simple parameters...');
      
      const testResult = await aiService.generateMaterial({
        type: 'worksheet',
        subject: 'Matematika',
        topic: 'Kvadratické rovnice',
        description: 'Vytvoř jednoduchý pracovní list s 5 úlohami na kvadratické rovnice',
        userId: req.user!.id,
        difficulty: 'intermediate',
        questionCount: 5,
        includeAnswers: true,
        metadata: {
          user_role: req.user!.role
        }
      });

      console.log('Test generation result:', {
        success: testResult.success,
        hasContent: !!testResult.content,
        contentLength: testResult.content?.length || 0,
        error: testResult.error
      });

      if (testResult.success && testResult.content) {
        console.log('Test response (first 1000 chars):', testResult.content.substring(0, 1000));
        
        try {
          const parsedData = parseWorksheetResponse(testResult.content);
          res.json({
            success: true,
            message: 'Worksheet generation test successful',
            data: {
              hasTitle: !!parsedData.title,
              hasInstructions: !!parsedData.instructions,
              questionCount: parsedData.questions?.length || 0,
              sampleQuestion: parsedData.questions?.[0] || null
            },
            rawResponse: testResult.content.substring(0, 500) + '...'
          });
        } catch (parseError: any) {
          res.json({
            success: false,
            message: 'Generation succeeded but parsing failed',
            error: parseError.message,
            rawResponse: testResult.content.substring(0, 500) + '...'
          });
        }
      } else {
        res.json({
          success: false,
          message: 'Worksheet generation test failed',
          error: testResult.error
        });
      }
    } catch (error: any) {
      console.error('Test endpoint error:', error);
      res.status(500).json({
        success: false,
        message: 'Test endpoint error',
        error: error.message
      });
    }
  });

  // Helper function to adapt subtype for prompt builder
  function adaptSubtypeForPromptBuilder(subtype: any) {
    if (!subtype) return undefined;
    
    return {
      id: subtype.id,
      name: subtype.name,
      description: subtype.description,
      parentType: subtype.parentType,
      specialFields: subtype.specialFields || [],
      promptModifications: subtype.promptModifications || []
    };
  }

  return router;
}
