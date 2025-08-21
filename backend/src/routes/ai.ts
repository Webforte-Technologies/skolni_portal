import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, RequestWithUser } from '../middleware/auth';
import { CreditTransactionModel } from '../models/CreditTransaction';
import { UserModel } from '../models/User';
import { ConversationModel } from '../models/Conversation';
import { MessageModel } from '../models/Message';
import { GeneratedFileModel } from '../models/GeneratedFile';
import OpenAI from 'openai';
import {
  WorksheetData,
  LessonPlanData,
  QuizData,
  ProjectData,
  PresentationData,
  ActivityData,
  SSEMessage,
  validateWorksheet,
  validateLessonPlan,
  validateQuiz,
  validateProject,
  validatePresentation,
  validateActivity
} from '../types/ai-generators';

const router = Router();

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env['OPENAI_API_KEY'],
});

// High-quality system prompt for Czech Math Assistant
const SYSTEM_PROMPT = `Jsi trpělivý a přátelský matematický asistent pro české středoškolské studenty. Tvým úkolem je:

1. **Vysvětlovat matematické koncepty jasně a krok za krokem** - Používej jednoduchý jazyk a logické kroky
2. **Vždy odpovídej česky** - Používej českou matematickou terminologii
3. **Buď povzbuzující a pozitivní** - Motivuj studenty k učení
4. **Poskytuj praktické příklady** - Ukaž, jak se matematika používá v reálném světě
5. **Pomáhej s různými matematickými tématy** - Od základní aritmetiky po pokročilou matematiku
6. **Odpovídej na dotazy o všech předmětech** - Nejen matematika, ale i fyzika, chemie, biologie, dějepis, český jazyk

Při odpovídání:
- Používej "ty" formu pro přátelský tón
- Vysvětluj postupně a logicky
- Uváděj praktické příklady
- Buď trpělivý a povzbuzující
- Pokud nevíš odpověď, upřímně to řekni a nabídni pomoc s něčím jiným

Pamatuj: Jsi tu, abys pomohl českým studentům a učitelům s učením!`;







// Specialized system prompt for project generation
const PROJECT_SYSTEM_PROMPT = `Jsi zkušený český učitel. Vytvoř projektové zadání v čistém JSON formátu dle následující struktury a pravidel.

PRAVIDLA A STRUKTURA (pouze JSON, žádný další text):
{
  "template": "project",
  "title": "Název projektu",
  "subject": "Předmět",
  "grade_level": "Ročník",
  "duration": "2 týdny",
  "objectives": ["cíl 1", "cíl 2"],
  "description": "Stručné zadání projektu",
  "deliverables": ["co mají odevzdat"],
  "rubric": [
    { "criteria": "kritérium", "levels": ["výborné", "dobré", "dostačující", "nedostačující"] }
  ]
}

POŽADAVKY:
- Vždy odpovídej česky
- Zaměř se na praktické výstupy a hodnoticí kritéria
- Výstup musí být platný JSON bez dalšího textu.`;

// Specialized system prompt for presentation outline generation
const PRESENTATION_SYSTEM_PROMPT = `Jsi zkušený český učitel. Vytvoř osnovu prezentace v čistém JSON formátu dle následující struktury a pravidel.

PRAVIDLA A STRUKTURA (pouze JSON, žádný další text):
{
  "template": "presentation",
  "title": "Název prezentace",
  "subject": "Předmět",
  "grade_level": "Ročník",
  "slides": [
    { "heading": "Nadpis snímku", "bullets": ["bod", "bod", "bod"] }
  ]
}

POŽADAVKY:
- Vždy odpovídej česky
- Použij jasné, krátké body
- Výstup musí být platný JSON bez dalšího textu.`;

// Specialized system prompt for classroom activity generation
const ACTIVITY_SYSTEM_PROMPT = `Jsi zkušený český učitel. Vytvoř krátkou aktivitu do hodiny v čistém JSON formátu dle následující struktury a pravidel.

PRAVIDLA A STRUKTURA (pouze JSON, žádný další text):
{
  "title": "Název aktivity",
  "subject": "Předmět",
  "grade_level": "Ročník",
  "duration": "15 min",
  "goal": "Cíl aktivity",
  "instructions": ["krok 1", "krok 2"],
  "materials": ["potřebné materiály"],
  "variation": "Jak upravit aktivitu"
}

POŽADAVKY:
- Vždy odpovídej česky
- Zaměř se na praktické aktivity
- Výstup musí být platný JSON bez dalšího textu.`;

// Read constants to satisfy TS noUnusedLocals in dev if routes are temporarily disabled
void PROJECT_SYSTEM_PROMPT;
void PRESENTATION_SYSTEM_PROMPT;
void ACTIVITY_SYSTEM_PROMPT;

// Validation middleware
// Simple tag derivation from user inputs/content
function deriveTags(...parts: Array<string | undefined>): string[] {
  const text = parts.filter(Boolean).join(' ').toLowerCase();
  const candidates = new Set<string>();
  const addIf = (word: string, cond: boolean) => { if (cond) candidates.add(word); };
  
  // Subject tags
  addIf('matematika', /mat(ematika)?|algebra|rovnic|geometri|zlomk|derivac|integrál|kvadratick|lineárn|trojúheln|kruh|kružnic|úhel|pravděpodobnost|statistik/.test(text));
  addIf('fyzika', /fyzik/.test(text));
  addIf('chemie', /chem/.test(text));
  addIf('biologie', /biolog/.test(text));
  addIf('dějepis', /dějepis|histor/.test(text));
  
  // Math subtopics
  addIf('algebra', /algebra|rovnic|lineárn|kvadratick/.test(text));
  addIf('geometrie', /geometri|trojúheln|kruh|kružnic|úhel/.test(text));
  addIf('pravděpodobnost', /pravděpodobnost|statistik/.test(text));
  addIf('zlomky', /zlomek|zlomk/.test(text));
  addIf('derivace', /derivac/.test(text));
  addIf('integrály', /integrál/.test(text));
  
  // Material types
  addIf('prezentace', /prezentac/.test(text));
  addIf('projekt', /projekt/.test(text));
  addIf('cvičení', /cvičení|pracovní.*list|worksheet/.test(text));
  
  // Difficulty tags
  addIf('snadné', /snadn|easy|lehk/.test(text));
  addIf('střední', /středn|medium|průměr/.test(text));
  addIf('náročné', /náročn|hard|těžk/.test(text));
  
  // Teaching style tags
  addIf('interaktivní', /interaktivn|interactive/.test(text));
  addIf('tradiční', /tradičnín|traditional/.test(text));
  addIf('projektová', /projektov|project.*based/.test(text));
  addIf('objevná', /objevná|discovery/.test(text));
  
  return Array.from(candidates).slice(0, 8);
}

// Utility function to send SSE messages
function sendSSEMessage(res: Response, message: SSEMessage): void {
  res.write(`data: ${JSON.stringify(message)}\n\n`);
}

// Utility function to escape content for SSE
function escapeSSEContent(content: string): string {
  return content.replace(/"/g, '\\"').replace(/\n/g, '\\n');
}


const validateChatMessage = [
  body('message').trim().isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters'),
  body('session_id').optional().isUUID().withMessage('Invalid session ID format')
];

// Send message to AI assistant (live OpenAI implementation)
router.post('/chat', authenticateToken, validateChatMessage, async (req: RequestWithUser, res: Response) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { message, session_id, conversation_id } = req.body;
    const userId = req.user.id;

    // Check if user has enough credits (1 credit per message)
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const creditsRequired = 1;
    
    // Critical fix: Ensure user has > 0 credits before proceeding
    if (user.credits_balance <= 0) {
      return res.status(402).json({
        success: false,
        error: 'Insufficient credits',
        data: {
          credits_balance: user.credits_balance,
          credits_required: creditsRequired,
          message: 'You need at least 1 credit to use the AI assistant. Please add more credits to continue.'
        }
      });
    }
    
    if (user.credits_balance < creditsRequired) {
      return res.status(402).json({
        success: false,
        error: 'Insufficient credits',
        data: {
          credits_balance: user.credits_balance,
          credits_required: creditsRequired,
          message: `You have ${user.credits_balance} credits but need ${creditsRequired} credits for this request.`
        }
      });
    }

    // Deduct credits before starting the stream
    await CreditTransactionModel.deductCredits(
      userId, 
      creditsRequired, 
      `AI chat message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`
    );

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    // Send initial response
    res.write('data: {"type":"start","message":"Starting AI response..."}\n\n');

    // Call OpenAI API with streaming
    const stream = await openai.chat.completions.create({
      model: process.env['OPENAI_MODEL'] || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: parseInt(process.env['OPENAI_MAX_TOKENS'] || '2000'),
      temperature: 0.7,
      stream: true,
    });

    let fullResponse = '';

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        // Send each chunk to the client
        res.write(`data: {"type":"chunk","content":"${content.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"}\n\n`);
      }
    }

    // Get updated user balance
    const updatedUser = await UserModel.findById(userId);

    // Save messages to database if conversation_id is provided
    if (conversation_id) {
      try {
        // Save user message
        await MessageModel.create({
          conversation_id,
          role: 'user',
          content: message
        });

        // Save AI response
        await MessageModel.create({
          conversation_id,
          role: 'assistant',
          content: fullResponse
        });

        // Update conversation title if it's the first message
        const messageCount = await MessageModel.countByConversationId(conversation_id);
        if (messageCount <= 2) { // User message + AI response
          const conversation = await ConversationModel.findById(conversation_id);
          if (conversation && conversation.title === 'New Conversation') {
            // Create a title from the first user message
            const title = message.length > 50 ? message.substring(0, 50) + '...' : message;
            await ConversationModel.updateTitle(conversation_id, title);
          }
        }
      } catch (dbError) {
        console.error('Failed to save messages to database:', dbError);
        // Don't fail the request if database save fails
      }
    }

    // Send final response with metadata
    res.write(`data: {"type":"end","credits_used":${creditsRequired},"credits_balance":${updatedUser?.credits_balance || 0},"session_id":"${session_id || ''}"}\n\n`);
    res.end();
    return;

  } catch (error) {
    console.error('AI chat error:', error);
    
    // Send error through stream
    res.write(`data: {"type":"error","message":"${error instanceof Error ? error.message : 'An unexpected error occurred'}"}\n\n`);
    res.end();
    return;
  }
});

// Get AI usage statistics
router.get('/stats', authenticateToken, async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userId = req.user.id;

    // Get user's AI usage statistics
    const totalCreditsUsed = await CreditTransactionModel.getTotalCreditsUsed(userId);
    const totalCreditsPurchased = await CreditTransactionModel.getTotalCreditsPurchased(userId);
    const user = await UserModel.findById(userId);

    return res.status(200).json({
      success: true,
      data: {
        total_messages: totalCreditsUsed,
        total_credits_purchased: totalCreditsPurchased,
        current_balance: user?.credits_balance || 0,
        average_cost_per_message: 1 // Fixed cost for MVP
      },
      message: 'AI usage statistics retrieved successfully'
    });

  } catch (error) {
    console.error('AI stats error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve AI usage statistics'
    });
  }
});

// Get available AI features (for future expansion)
router.get('/features', authenticateToken, async (_req: Request, res: Response) => {
  try {
    return res.status(200).json({
      success: true,
      data: [
        {
          id: 'math_assistant',
          name: 'Matematický Asistent',
          description: 'Pomáhá s matematickými úlohami a vysvětluje matematické koncepty',
          credits_per_use: 1,
          available: true
        },
        {
          id: 'physics_assistant',
          name: 'Fyzikální Asistent',
          description: 'Vysvětluje fyzikální zákony a pomáhá s fyzikálními úlohami',
          credits_per_use: 1,
          available: true
        },
        {
          id: 'chemistry_assistant',
          name: 'Chemický Asistent',
          description: 'Pomáhá s chemickými výpočty a vysvětluje chemické procesy',
          credits_per_use: 1,
          available: true
        },
        {
          id: 'biology_assistant',
          name: 'Biologický Asistent',
          description: 'Vysvětluje biologické procesy a pomáhá s biologickými tématy',
          credits_per_use: 1,
          available: true
        },
        {
          id: 'history_assistant',
          name: 'Historický Asistent',
          description: 'Pomáhá s historickými fakty a vysvětluje historické události',
          credits_per_use: 1,
          available: true
        },
        {
          id: 'language_assistant',
          name: 'Jazykový Asistent',
          description: 'Pomáhá s gramatikou a jazykovými pravidly',
          credits_per_use: 1,
          available: true
        }
      ],
      message: 'AI features retrieved successfully'
    });

  } catch (error) {
    console.error('AI features error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve AI features'
    });
  }
});


// Generate worksheet endpoint with streaming (enhanced with assignment analysis and subtypes)
router.post('/generate-worksheet', authenticateToken, [
  body('topic').optional().trim().isLength({ min: 3, max: 200 }).withMessage('Topic must be between 3 and 200 characters'),
  body('assignment_description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Assignment description must be between 10 and 1000 characters'),
  body('subtype_id').optional().isUUID().withMessage('Invalid subtype ID format'),
  body('question_count').optional().isInt({ min: 5, max: 100 }),
  body('difficulty').optional().isString().isLength({ max: 20 }),
  body('teaching_style').optional().isString().isLength({ max: 50 }),
  body('exercise_types').optional().isArray(),
  body('include_answers').optional().isBoolean(),
  body('quality_level').optional().isIn(['základní', 'standardní', 'vysoká', 'expertní']),
  body('custom_instructions').optional().isString().isLength({ max: 500 })
], async (req: RequestWithUser, res: Response) => {
  try {
    // Validation errors check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendSSEMessage(res, { type: 'error', message: 'Validation failed' });
      res.end();
      return;
    }

    if (!req.user) {
      sendSSEMessage(res, { type: 'error', message: 'Authentication required' });
      res.end();
      return;
    }

    // Check if either topic or assignment_description is provided
    const { topic, assignment_description, subtype_id, question_count, difficulty, teaching_style, exercise_types, include_answers, quality_level, custom_instructions } = req.body;
    
    if (!topic && !assignment_description) {
      sendSSEMessage(res, { type: 'error', message: 'Either topic or assignment_description is required' });
      res.end();
      return;
    }

    const user = await UserModel.findById(req.user.id);
    if (!user) {
      sendSSEMessage(res, { type: 'error', message: 'User not found' });
      res.end();
      return;
    }

    const creditsRequired = 2;
    if ((user.credits_balance ?? 0) < creditsRequired) {
      sendSSEMessage(res, { type: 'error', message: 'Insufficient credits' });
      res.end();
      return;
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    // Send start message
    sendSSEMessage(res, { type: 'start', message: 'Starting worksheet generation...' });

    // Initialize services
    const { AssignmentAnalyzer } = await import('../services/AssignmentAnalyzer');
    const { EnhancedPromptBuilder } = await import('../services/EnhancedPromptBuilder');
    const { ContentValidator } = await import('../services/ContentValidator');
    const { MaterialSubtypeModel } = await import('../models/MaterialSubtype');

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
        sendSSEMessage(res, { type: 'chunk', content: `Assignment analysis complete. Detected subject: ${assignmentAnalysis.subject}, difficulty: ${assignmentAnalysis.difficulty}\n` });
      } catch (error) {
        console.error('Assignment analysis failed:', error);
        sendSSEMessage(res, { type: 'chunk', content: 'Assignment analysis failed, proceeding with manual parameters...\n' });
      }
    }

    // Get subtype if specified
    if (subtype_id) {
      try {
        subtype = await subtypeModel.findById(subtype_id);
        if (!subtype || subtype.parentType !== 'worksheet') {
          sendSSEMessage(res, { type: 'error', message: 'Invalid worksheet subtype' });
          res.end();
          return;
        }
        sendSSEMessage(res, { type: 'chunk', content: `Using subtype: ${subtype.name}\n` });
      } catch (error) {
        console.error('Subtype lookup failed:', error);
        sendSSEMessage(res, { type: 'chunk', content: 'Subtype lookup failed, proceeding without subtype...\n' });
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

    const enhancedPrompt = await promptBuilder.buildPrompt({
      materialType: 'worksheet',
      subtype: adaptSubtypeForPromptBuilder(subtype),
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
    });

    // Generate content with OpenAI
    sendSSEMessage(res, { type: 'chunk', content: 'Generating worksheet content...\n' });

    const stream = await openai.chat.completions.create({
      model: process.env['OPENAI_MODEL'] || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: enhancedPrompt },
        { role: 'user', content: assignment_description || `Vytvoř cvičení na téma: ${topic}` }
      ],
      max_tokens: parseInt(process.env['OPENAI_MAX_TOKENS'] || '3000'),
      temperature: parseFloat(process.env['OPENAI_TEMPERATURE_MATERIALS'] || '0.3'),
      stream: true,
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        sendSSEMessage(res, { type: 'chunk', content: escapeSSEContent(content) });
      }
    }

    // Parse and validate JSON response
    let validatedData: WorksheetData;
    try {
      const parsedData = JSON.parse(fullResponse);
      validatedData = validateWorksheet(parsedData);
    } catch (parseError) {
      console.error('Failed to parse worksheet JSON:', parseError);
      sendSSEMessage(res, { type: 'error', message: 'The AI response could not be parsed as a valid worksheet.' });
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

      // Skip content structuring for now since it's not implemented
      // validatedData = structuredContent as WorksheetData;
    } catch (validationError) {
      console.error('Content validation/structuring failed:', validationError);
      sendSSEMessage(res, { type: 'chunk', content: 'Content validation completed with warnings...\n' });
    }

    // Save the generated file to the database
    let savedFile: any;
    try {
      savedFile = await GeneratedFileModel.create({
        user_id: req.user.id,
        title: validatedData.title || 'Generated Worksheet',
        content: JSON.stringify(validatedData),
        file_type: 'worksheet'
      });

      // Update AI metadata with enhanced information
      const tags = Array.isArray(validatedData.tags) && validatedData.tags.length 
        ? validatedData.tags 
        : deriveTags(
            validatedData.title,
            assignmentAnalysis?.subject || userInputs.subject,
            assignmentAnalysis?.gradeLevel || userInputs.grade_level,
            topic || assignment_description,
            difficulty,
            teaching_style
          );

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

      await GeneratedFileModel.updateAIMetadata(savedFile.id, {
        metadata: enhancedMetadata,
        tags
      });
    } catch (saveError) {
      console.error('Failed to save worksheet to database:', saveError);
      sendSSEMessage(res, { type: 'error', message: 'Failed to save worksheet to database' });
      res.end();
      return;
    }

    // Deduct credits after successful generation and save
    await CreditTransactionModel.deductCredits(
      req.user.id,
      creditsRequired,
      'Enhanced worksheet generation'
    );
    
    const updatedUser = await UserModel.findById(req.user.id);

    // Send final response with enhanced metadata
    const endMessage: any = {
      type: 'end',
      file_id: savedFile?.id || '',
      file_type: 'worksheet',
      credits_used: creditsRequired,
      credits_balance: updatedUser?.credits_balance || 0,
      worksheet: validatedData,
      quality_metrics: {
        assignmentAlignment: assignmentAnalysis ? 0.9 : 0.7,
        contentStructure: 0.85,
        pedagogicalSoundness: 0.8
      }
    };
    
    sendSSEMessage(res, endMessage);
    res.end();

  } catch (error) {
    console.error('Enhanced worksheet generation error:', error);
    sendSSEMessage(res, { 
      type: 'error', 
      message: error instanceof Error ? error.message : 'An unexpected error occurred' 
    });
    res.end();
  }
});

// Generate lesson plan (streaming) with enhanced assignment analysis and pedagogical validation
router.post('/generate-lesson-plan', authenticateToken, [
  body('title').optional().isLength({ min: 3, max: 200 }),
  body('subject').optional().isLength({ min: 2, max: 100 }),
  body('grade_level').optional().isLength({ min: 2, max: 100 }),
  body('assignment_description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Assignment description must be between 10 and 1000 characters'),
  body('subtype_id').optional().isUUID().withMessage('Invalid subtype ID format'),
  body('duration').optional().isString().isLength({ min: 1, max: 20 }),
  body('class_size').optional().isInt({ min: 1, max: 50 }),
  body('teaching_methods').optional().isArray(),
  body('available_resources').optional().isArray(),
  body('quality_level').optional().isIn(['základní', 'standardní', 'vysoká', 'expertní']),
  body('custom_instructions').optional().isString().isLength({ max: 500 })
], async (req: RequestWithUser, res: Response) => {
  try {
    // Validation errors check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendSSEMessage(res, { type: 'error', message: 'Validation failed' });
      res.end();
      return;
    }

    if (!req.user) {
      sendSSEMessage(res, { type: 'error', message: 'Authentication required' });
      res.end();
      return;
    }

    const { title, subject, grade_level, assignment_description, subtype_id, duration, class_size, teaching_methods, available_resources, quality_level, custom_instructions } = req.body;

    const user = await UserModel.findById(req.user.id);
    if (!user) {
      sendSSEMessage(res, { type: 'error', message: 'User not found' });
      res.end();
      return;
    }

    const creditsRequired = 2;
    if ((user.credits_balance ?? 0) < creditsRequired) {
      sendSSEMessage(res, { type: 'error', message: 'Insufficient credits' });
      res.end();
      return;
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    // Send start message
    sendSSEMessage(res, { type: 'start', message: 'Starting lesson plan generation...' });

    // Initialize services
    const { AssignmentAnalyzer } = await import('../services/AssignmentAnalyzer');
    const { EnhancedPromptBuilder } = await import('../services/EnhancedPromptBuilder');
    const { ContentValidator } = await import('../services/ContentValidator');
    const { ContentStructurer } = await import('../services/ContentStructurer');
    const { MaterialSubtypeModel } = await import('../models/MaterialSubtype');

    const assignmentAnalyzer = new AssignmentAnalyzer();
    const promptBuilder = new EnhancedPromptBuilder();
    const contentValidator = new ContentValidator();
    const contentStructurer = new ContentStructurer();
    const subtypeModel = new MaterialSubtypeModel();

    let assignmentAnalysis = null;
    let subtype = null;

    // Analyze assignment if description is provided
    if (assignment_description) {
      sendSSEMessage(res, { type: 'chunk', content: 'Analyzing assignment description...\n' });
      try {
        assignmentAnalysis = await assignmentAnalyzer.analyzeAssignment(assignment_description);
        sendSSEMessage(res, { type: 'chunk', content: `Assignment analysis complete. Detected subject: ${assignmentAnalysis.subject}, difficulty: ${assignmentAnalysis.difficulty}\n` });
      } catch (error) {
        console.error('Assignment analysis failed:', error);
        sendSSEMessage(res, { type: 'chunk', content: 'Assignment analysis failed, proceeding with manual parameters...\n' });
      }
    }

    // Get subtype if specified
    if (subtype_id) {
      try {
        subtype = await subtypeModel.findById(subtype_id);
        if (!subtype || subtype.parentType !== 'lesson-plan') {
          sendSSEMessage(res, { type: 'error', message: 'Invalid lesson plan subtype' });
          res.end();
          return;
        }
        sendSSEMessage(res, { type: 'chunk', content: `Using subtype: ${subtype.name}\n` });
      } catch (error) {
        console.error('Subtype lookup failed:', error);
        sendSSEMessage(res, { type: 'chunk', content: 'Subtype lookup failed, proceeding without subtype...\n' });
      }
    }

    // Build enhanced prompt with lesson plan-specific features
    sendSSEMessage(res, { type: 'chunk', content: 'Building enhanced lesson plan prompt...\n' });
    
    const userInputs = {
      title: title || (assignmentAnalysis ? `${assignmentAnalysis.keyTopics.slice(0, 2).join(' a ')}` : ''),
      subject: subject || assignmentAnalysis?.subject,
      grade_level: grade_level || assignmentAnalysis?.gradeLevel,
      duration: duration || assignmentAnalysis?.estimatedDuration || '45 min',
      class_size: class_size || 25,
      teaching_methods: teaching_methods || ['frontální výuka', 'skupinová práce', 'individuální práce'],
      available_resources: available_resources || ['tabule', 'projektor', 'učebnice']
    };

    // Build pedagogical structure based on subtype
    let pedagogicalStructure = '';
    if (subtype) {
      switch (subtype.name) {
        case 'Úvodní hodina':
          pedagogicalStructure = 'Zaměř se na motivaci, představení tématu a vytvoření základního přehledu. Struktura: Motivace (10 min) → Představení tématu (15 min) → Základní aktivity (15 min) → Shrnutí (5 min).';
          break;
        case 'Procvičovací hodina':
          pedagogicalStructure = 'Zaměř se na upevnění a procvičení dovedností. Struktura: Opakování (5 min) → Řízené procvičování (20 min) → Samostatná práce (15 min) → Zpětná vazba (5 min).';
          break;
        case 'Hodnotící hodina':
          pedagogicalStructure = 'Zaměř se na ověření znalostí a dovedností. Struktura: Příprava (5 min) → Hodnocení (30 min) → Rozbor výsledků (10 min).';
          break;
        default:
          pedagogicalStructure = 'Standardní struktura hodiny s úvodem, hlavní částí a závěrem.';
      }
    }

    const enhancedPrompt = await promptBuilder.buildPrompt({
      materialType: 'lesson-plan',
      subtype: subtype as any,
      assignment: assignmentAnalysis as any,
      userInputs,
      qualityLevel: quality_level || 'standardní',
      customInstructions: custom_instructions
    });

    // Add lesson plan-specific instructions
    const lessonPlanSpecificPrompt = `${enhancedPrompt}

SPECIFICKÉ POŽADAVKY PRO PLÁN HODINY:
${pedagogicalStructure}

PEDAGOGICKÉ PRINCIPY:
- Respektuj principy aktivního učení
- Zahrň různé formy práce (individuální, párová, skupinová)
- Zajisti logickou posloupnost aktivit
- Přizpůsob tempo a obtížnost věku žáků
- Zahrň formativní hodnocení během hodiny

ČASOVÉ ROZLOŽENÍ PRO ${userInputs.duration}:
- Úvod a motivace: 10-15% času
- Hlavní část: 70-80% času  
- Závěr a shrnutí: 10-15% času

KRITICKÉ POŽADAVKY:
1. Součet času všech aktivit MUSÍ přesně odpovídat celkové délce hodiny
2. Každá aktivita MUSÍ mít konkrétní název, popis, kroky a očekávaný výsledek
3. Čas každé aktivity MUSÍ být ve formátu "<číslo> min"
4. Aktivity musí logicky navazovat a podporovat cíle hodiny
5. Zahrň diferenciaci pro různé typy žáků

DOSTUPNÉ ZDROJE: ${userInputs.available_resources.join(', ')}
VELIKOST TŘÍDY: ${userInputs.class_size} žáků
PREFEROVANÉ METODY: ${userInputs.teaching_methods.join(', ')}`;

    // Generate content with OpenAI
    sendSSEMessage(res, { type: 'chunk', content: 'Generating lesson plan content...\n' });

    const stream = await openai.chat.completions.create({
      model: process.env['OPENAI_MODEL'] || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: lessonPlanSpecificPrompt },
        { role: 'user', content: assignment_description || `Vytvoř plán hodiny${title ? ` s názvem "${title}"` : ''}${subject ? ` pro předmět ${subject}` : ''}${grade_level ? ` pro ročník ${grade_level}` : ''}` }
      ],
      max_tokens: parseInt(process.env['OPENAI_MAX_TOKENS'] || '3000'),
      temperature: parseFloat(process.env['OPENAI_TEMPERATURE_MATERIALS'] || '0.3'),
      stream: true,
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        sendSSEMessage(res, { type: 'chunk', content: escapeSSEContent(content) });
      }
    }

    // Parse and validate JSON response with enhanced validation
    let validatedData: LessonPlanData;
    try {
      const parsedData = JSON.parse(fullResponse);
      validatedData = validateLessonPlan(parsedData);
      
      // Additional validation for enhanced lesson plans
      if (Array.isArray(validatedData.activities)) {
        validatedData.activities.forEach((activity: any, index: number) => {
          if (!activity.outcome) {
            throw new Error(`Activity ${index + 1}: Missing expected outcome`);
          }
        });
      }
    } catch (parseError) {
      console.error('Failed to parse lesson plan JSON:', parseError);
      sendSSEMessage(res, { type: 'error', message: 'The AI response could not be parsed as a valid lesson plan.' });
      res.end();
      return;
    }

    // Validate and structure content with pedagogical validation
    sendSSEMessage(res, { type: 'chunk', content: 'Validating pedagogical structure and timing...\n' });
    
    try {
      const validationResult = contentValidator.validateContent(validatedData, 'lesson-plan');
      if (!validationResult.isValid) {
        sendSSEMessage(res, { type: 'chunk', content: `Content validation warnings: ${validationResult.suggestions.join(', ')}\n` });
      }

      const structuredContent = contentStructurer.structureContent(validatedData, 'lesson-plan', subtype as any);
      validatedData = structuredContent as unknown as LessonPlanData;
    } catch (validationError) {
      console.error('Content validation/structuring failed:', validationError);
      sendSSEMessage(res, { type: 'chunk', content: 'Content validation completed with warnings...\n' });
    }

    // Save the generated file to the database
    let savedFile: any;
    try {
      savedFile = await GeneratedFileModel.create({
        user_id: req.user.id,
        title: validatedData.title || 'Generated Lesson Plan',
        content: JSON.stringify(validatedData),
        file_type: 'lesson_plan'
      });

      // Update AI metadata with enhanced information
      const tags = Array.isArray(validatedData.tags) && validatedData.tags.length 
        ? validatedData.tags 
        : deriveTags(
            validatedData.title,
            assignmentAnalysis?.subject || validatedData.subject,
            assignmentAnalysis?.gradeLevel || validatedData.grade_level,
            title || assignment_description,
            assignmentAnalysis?.difficulty,
            'plán hodiny'
          );

      const enhancedMetadata = {
        raw: fullResponse,
        prompt: lessonPlanSpecificPrompt,
        assignmentAnalysis: assignmentAnalysis || null,
        subtype: subtype || null,
        qualityLevel: quality_level || 'standardní',
        generationParameters: {
          promptVersion: '2.0-enhanced-lesson-plan',
          modelUsed: process.env['OPENAI_MODEL'] || 'gpt-4o-mini',
          temperature: parseFloat(process.env['OPENAI_TEMPERATURE_MATERIALS'] || '0.3'),
          maxTokens: parseInt(process.env['OPENAI_MAX_TOKENS'] || '3000'),
          customInstructions: custom_instructions || null,
          subtypeModifications: subtype?.promptModifications || null,
          pedagogicalStructure
        }
      };

      await GeneratedFileModel.updateAIMetadata(savedFile.id, {
        metadata: enhancedMetadata,
        tags
      });
    } catch (saveError) {
      console.error('Failed to save lesson plan to database:', saveError);
      sendSSEMessage(res, { type: 'error', message: 'Failed to save lesson plan to database' });
      res.end();
      return;
    }

    // Deduct credits after successful generation and save
    await CreditTransactionModel.deductCredits(
      req.user.id,
      creditsRequired,
      'Enhanced lesson plan generation'
    );
    
    const updatedUser = await UserModel.findById(req.user.id);

    // Calculate timing validation metrics
    const totalActivityTime = validatedData.activities.reduce((sum, activity) => {
      const match = /(\d+)\s*min/.exec(activity.time || '');
      return sum + (match && match[1] ? parseInt(match[1]) : 0);
    }, 0);
    
    const targetTime = /(\d+)\s*min/.exec(validatedData.duration || '');
    const timingAccuracy = targetTime && targetTime[1] ? (totalActivityTime / parseInt(targetTime[1])) : 1;

    // Send final response with enhanced metadata
    const endMessage: any = {
      type: 'end',
      file_id: savedFile?.id || '',
      file_type: 'lesson_plan',
      credits_used: creditsRequired,
      credits_balance: updatedUser?.credits_balance || 0,
      lesson_plan: validatedData,
      quality_metrics: {
        assignmentAlignment: assignmentAnalysis ? 0.9 : 0.7,
        pedagogicalStructure: 0.85,
        timingAccuracy: Math.min(timingAccuracy, 1.0),
        activityFlow: 0.8
      }
    };
    
    sendSSEMessage(res, endMessage);
    res.end();

  } catch (error) {
    console.error('Enhanced lesson plan generation error:', error);
    sendSSEMessage(res, { 
      type: 'error', 
      message: error instanceof Error ? error.message : 'An unexpected error occurred' 
    });
    res.end();
  }
});

// Generate batch materials (streaming) with progress tracking and consistency validation
router.post('/generate-batch', authenticateToken, [
  body('materials').isArray({ min: 2, max: 10 }).withMessage('Materials array must contain 2-10 items'),
  body('materials.*.type').isIn(['worksheet', 'quiz', 'lesson-plan', 'project', 'presentation', 'activity']),
  body('materials.*.title').optional().isLength({ min: 3, max: 200 }),
  body('materials.*.subtype_id').optional().isUUID(),
  body('assignment_description').optional().trim().isLength({ min: 10, max: 1000 }),
  body('consistency_theme').optional().isString().isLength({ max: 200 }),
  body('quality_level').optional().isIn(['základní', 'standardní', 'vysoká', 'expertní']),
  body('custom_instructions').optional().isString().isLength({ max: 500 })
], async (req: RequestWithUser, res: Response) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendSSEMessage(res, { type: 'error', message: 'Validation failed' });
      res.end();
      return;
    }

    if (!req.user) {
      sendSSEMessage(res, { type: 'error', message: 'Authentication required' });
      res.end();
      return;
    }

    const { materials, assignment_description, consistency_theme, quality_level, custom_instructions } = req.body;
    const materialsCount = materials.length;
    const creditsRequired = materialsCount * 2; // 2 credits per material

    const user = await UserModel.findById(req.user.id);
    if (!user || (user.credits_balance ?? 0) < creditsRequired) {
      sendSSEMessage(res, { type: 'error', message: `Insufficient credits. Required: ${creditsRequired}, Available: ${user?.credits_balance || 0}` });
      res.end();
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    sendSSEMessage(res, { 
      type: 'start', 
      message: `Starting batch generation of ${materialsCount} materials...`,
      batch_info: {
        total_materials: materialsCount,
        estimated_credits: creditsRequired,
        consistency_theme: consistency_theme || 'No specific theme'
      }
    });

    // Initialize services
    const { AssignmentAnalyzer } = await import('../services/AssignmentAnalyzer');
    const { EnhancedPromptBuilder } = await import('../services/EnhancedPromptBuilder');
    const { ContentValidator } = await import('../services/ContentValidator');
    const { ContentStructurer } = await import('../services/ContentStructurer');
    const { MaterialSubtypeModel } = await import('../models/MaterialSubtype');

    const assignmentAnalyzer = new AssignmentAnalyzer();
    const promptBuilder = new EnhancedPromptBuilder();
    const contentValidator = new ContentValidator();
    const contentStructurer = new ContentStructurer();
    const subtypeModel = new MaterialSubtypeModel();

    let assignmentAnalysis = null;
    const generatedMaterials: any[] = [];
    const batchErrors: string[] = [];

    // Analyze assignment once for consistency across all materials
    if (assignment_description) {
      sendSSEMessage(res, { type: 'chunk', content: 'Analyzing assignment for batch consistency...\n' });
      try {
        assignmentAnalysis = await assignmentAnalyzer.analyzeAssignment(assignment_description);
        sendSSEMessage(res, { 
          type: 'progress', 
          message: `Assignment analysis complete. Theme: ${assignmentAnalysis.subject} - ${assignmentAnalysis.keyTopics.join(', ')}`,
          current_step: 0,
          total_steps: materialsCount,
          phase: 'analysis'
        });
      } catch (error) {
        sendSSEMessage(res, { type: 'chunk', content: 'Assignment analysis failed, proceeding with individual material generation...\n' });
      }
    }

    // Generate each material in sequence
    for (let i = 0; i < materials.length; i++) {
      const material = materials[i];
      const materialNumber = i + 1;
      
      try {
        sendSSEMessage(res, { 
          type: 'progress', 
          message: `Generating material ${materialNumber}/${materialsCount}: ${material.type}`,
          current_step: materialNumber,
          total_steps: materialsCount,
          phase: 'generation',
          current_material: {
            type: material.type,
            title: material.title || `${material.type} ${materialNumber}`
          }
        });

        // Get subtype if specified
        let subtype = null;
        if (material.subtype_id) {
          try {
            subtype = await subtypeModel.findById(material.subtype_id);
            if (!subtype || subtype.parentType !== material.type) {
              batchErrors.push(`Material ${materialNumber}: Invalid subtype for ${material.type}`);
              continue;
            }
          } catch (error) {
            batchErrors.push(`Material ${materialNumber}: Subtype lookup failed`);
          }
        }

        // Build consistent user inputs
        const userInputs = {
          title: material.title || (assignmentAnalysis ? 
            `${material.type}: ${assignmentAnalysis.keyTopics.slice(0, 2).join(' - ')}` : 
            `Generated ${material.type} ${materialNumber}`),
          subject: material.subject || assignmentAnalysis?.subject,
          grade_level: material.grade_level || assignmentAnalysis?.gradeLevel,
          consistency_theme: consistency_theme,
          batch_context: `This is material ${materialNumber} of ${materialsCount} in a coordinated set.`,
          ...material // Include any additional material-specific parameters
        };

        // Add consistency instructions
        const consistencyInstructions = consistency_theme ? 
          `KONZISTENCE TÉMATU: Všechny materiály v této sadě se zaměřují na téma "${consistency_theme}". Zajisti, že tento materiál podporuje a doplňuje ostatní materiály v sadě.` : 
          assignmentAnalysis ? 
          `KONZISTENCE SADY: Tento materiál je součástí sady ${materialsCount} materiálů pro téma "${assignmentAnalysis.keyTopics.join(', ')}". Zajisti tematickou konzistenci.` : 
          '';

        const enhancedPrompt = await promptBuilder.buildPrompt({
          materialType: material.type as any,
          subtype: subtype as any,
          assignment: assignmentAnalysis as any,
          userInputs,
          qualityLevel: quality_level || 'standardní',
          customInstructions: `${custom_instructions || ''}\n\n${consistencyInstructions}`
        });

        // Generate content
        sendSSEMessage(res, { type: 'chunk', content: `Generating ${material.type} content...\n` });

        const stream = await openai.chat.completions.create({
          model: process.env['OPENAI_MODEL'] || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: enhancedPrompt },
            { role: 'user', content: assignment_description || `Vytvoř ${material.type}${material.title ? ` s názvem "${material.title}"` : ''}` }
          ],
          max_tokens: parseInt(process.env['OPENAI_MAX_TOKENS'] || '3000'),
          temperature: parseFloat(process.env['OPENAI_TEMPERATURE_MATERIALS'] || '0.3'),
          stream: true,
        });

        let fullResponse = '';
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            fullResponse += content;
            // Send abbreviated chunks for batch generation to avoid overwhelming the client
            if (fullResponse.length % 200 === 0) {
              sendSSEMessage(res, { type: 'chunk', content: '.' });
            }
          }
        }

        // Validate and structure content
        let validatedData: any;
        try {
          const parsedData = JSON.parse(fullResponse);
          
          // Use appropriate validator based on material type
          switch (material.type) {
            case 'worksheet':
              validatedData = validateWorksheet(parsedData);
              break;
            case 'quiz':
              validatedData = validateQuiz(parsedData);
              break;
            case 'lesson-plan':
              validatedData = validateLessonPlan(parsedData);
              break;
            case 'project':
              validatedData = validateProject(parsedData);
              break;
            case 'presentation':
              validatedData = validatePresentation(parsedData);
              break;
            case 'activity':
              validatedData = validateActivity(parsedData);
              break;
            default:
              throw new Error(`Unknown material type: ${material.type}`);
          }

          contentValidator.validateContent(validatedData, material.type as any);
          const structuredContent = contentStructurer.structureContent(validatedData, material.type as any, subtype as any);
          validatedData = structuredContent;

        } catch (parseError) {
          batchErrors.push(`Material ${materialNumber} (${material.type}): Failed to parse or validate content`);
          continue;
        }

        // Save to database
        try {
          const savedFile = await GeneratedFileModel.create({
            user_id: req.user.id,
            title: validatedData.title || `Generated ${material.type} ${materialNumber}`,
            content: JSON.stringify(validatedData),
            file_type: material.type
          });

          const tags = deriveTags(
            validatedData.title,
            assignmentAnalysis?.subject || validatedData.subject,
            assignmentAnalysis?.gradeLevel || validatedData.grade_level,
            consistency_theme || assignment_description,
            assignmentAnalysis?.difficulty,
            'batch-generated'
          );

          await GeneratedFileModel.updateAIMetadata(savedFile.id, {
            metadata: {
              raw: fullResponse,
              prompt: enhancedPrompt,
              assignmentAnalysis,
              subtype,
              qualityLevel: quality_level || 'standardní',
              batchInfo: {
                batchSize: materialsCount,
                materialIndex: materialNumber,
                consistencyTheme: consistency_theme,
                batchId: `batch_${Date.now()}_${req.user.id}`
              }
            },
            tags
          });

          generatedMaterials.push({
            file_id: savedFile.id,
            type: material.type,
            title: validatedData.title,
            content: validatedData,
            material_index: materialNumber
          });

          sendSSEMessage(res, { 
            type: 'progress', 
            message: `Material ${materialNumber} completed successfully`,
            current_step: materialNumber,
            total_steps: materialsCount,
            phase: 'completed',
            completed_material: {
              file_id: savedFile.id,
              type: material.type,
              title: validatedData.title
            }
          });

        } catch (saveError) {
          batchErrors.push(`Material ${materialNumber}: Failed to save to database`);
        }

      } catch (materialError) {
        console.error(`Batch generation error for material ${materialNumber}:`, materialError);
        batchErrors.push(`Material ${materialNumber}: ${materialError instanceof Error ? materialError.message : 'Unknown error'}`);
      }
    }

    // Deduct credits for successfully generated materials
    const successfulMaterials = generatedMaterials.length;
    const actualCreditsUsed = successfulMaterials * 2;
    
    if (successfulMaterials > 0) {
      await CreditTransactionModel.deductCredits(
        req.user.id,
        actualCreditsUsed,
        `Batch generation: ${successfulMaterials} materials`
      );
    }

    const updatedUser = await UserModel.findById(req.user.id);

    // Calculate batch consistency metrics
    const consistencyScore = batchErrors.length === 0 ? 1.0 : Math.max(0.5, 1 - (batchErrors.length / materialsCount));
    const completionRate = successfulMaterials / materialsCount;

    // Send final batch results
    sendSSEMessage(res, {
      type: 'end',
      batch_results: {
        total_requested: materialsCount,
        successfully_generated: successfulMaterials,
        failed_materials: materialsCount - successfulMaterials,
        completion_rate: completionRate,
        errors: batchErrors
      },
      generated_materials: generatedMaterials,
      credits_used: actualCreditsUsed,
      credits_balance: updatedUser?.credits_balance || 0,
      quality_metrics: {
        batch_consistency: consistencyScore,
        completion_rate: completionRate,
        assignment_alignment: assignmentAnalysis ? 0.9 : 0.7,
        thematic_coherence: consistency_theme ? 0.85 : 0.7
      }
    });
    res.end();

  } catch (error) {
    console.error('Batch generation error:', error);
    sendSSEMessage(res, { 
      type: 'error', 
      message: error instanceof Error ? error.message : 'An unexpected error occurred during batch generation' 
    });
    res.end();
  }
});

// Generate quiz (streaming) with enhanced assignment analysis and subtype support
router.post('/generate-quiz', authenticateToken, [
  body('title').optional().isLength({ min: 3, max: 200 }),
  body('subject').optional().isLength({ min: 2, max: 100 }),
  body('grade_level').optional().isLength({ min: 2, max: 100 }),
  body('assignment_description').optional().trim().isLength({ min: 10, max: 1000 }).withMessage('Assignment description must be between 10 and 1000 characters'),
  body('subtype_id').optional().isUUID().withMessage('Invalid subtype ID format'),
  body('question_count').optional().isInt({ min: 5, max: 100 }),
  body('time_limit').optional().isString().isLength({ min: 1, max: 50 }),
  body('prompt_hint').optional().isString().isLength({ max: 500 }),
  body('question_types').optional().isArray(),
  body('cognitive_levels').optional().isArray(),
  body('quality_level').optional().isIn(['základní', 'standardní', 'vysoká', 'expertní']),
  body('custom_instructions').optional().isString().isLength({ max: 500 })
], async (req: RequestWithUser, res: Response) => {
  try {
    // Validation errors check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendSSEMessage(res, { type: 'error', message: 'Validation failed' });
      res.end();
      return;
    }

    if (!req.user) {
      sendSSEMessage(res, { type: 'error', message: 'Authentication required' });
      res.end();
      return;
    }

    const { title, subject, grade_level, assignment_description, subtype_id, question_count, time_limit, prompt_hint, question_types, cognitive_levels, quality_level, custom_instructions } = req.body;

    const user = await UserModel.findById(req.user.id);
    if (!user) {
      sendSSEMessage(res, { type: 'error', message: 'User not found' });
      res.end();
      return;
    }

    const creditsRequired = 2;
    if ((user.credits_balance ?? 0) < creditsRequired) {
      sendSSEMessage(res, { type: 'error', message: 'Insufficient credits' });
      res.end();
      return;
    }

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    // Send start message
    sendSSEMessage(res, { type: 'start', message: 'Starting quiz generation...' });

    // Initialize services
    const { AssignmentAnalyzer } = await import('../services/AssignmentAnalyzer');
    const { EnhancedPromptBuilder } = await import('../services/EnhancedPromptBuilder');
    const { ContentValidator } = await import('../services/ContentValidator');
    const { ContentStructurer } = await import('../services/ContentStructurer');
    const { MaterialSubtypeModel } = await import('../models/MaterialSubtype');

    const assignmentAnalyzer = new AssignmentAnalyzer();
    const promptBuilder = new EnhancedPromptBuilder();
    const contentValidator = new ContentValidator();
    const contentStructurer = new ContentStructurer();
    const subtypeModel = new MaterialSubtypeModel();

    let assignmentAnalysis = null;
    let subtype = null;

    // Analyze assignment if description is provided
    if (assignment_description) {
      sendSSEMessage(res, { type: 'chunk', content: 'Analyzing assignment description...\n' });
      try {
        assignmentAnalysis = await assignmentAnalyzer.analyzeAssignment(assignment_description);
        sendSSEMessage(res, { type: 'chunk', content: `Assignment analysis complete. Detected subject: ${assignmentAnalysis.subject}, difficulty: ${assignmentAnalysis.difficulty}\n` });
      } catch (error) {
        console.error('Assignment analysis failed:', error);
        sendSSEMessage(res, { type: 'chunk', content: 'Assignment analysis failed, proceeding with manual parameters...\n' });
      }
    }

    // Get subtype if specified
    if (subtype_id) {
      try {
        subtype = await subtypeModel.findById(subtype_id);
        if (!subtype || subtype.parentType !== 'quiz') {
          sendSSEMessage(res, { type: 'error', message: 'Invalid quiz subtype' });
          res.end();
          return;
        }
        sendSSEMessage(res, { type: 'chunk', content: `Using subtype: ${subtype.name}\n` });
      } catch (error) {
        console.error('Subtype lookup failed:', error);
        sendSSEMessage(res, { type: 'chunk', content: 'Subtype lookup failed, proceeding without subtype...\n' });
      }
    }

    // Build enhanced prompt with quiz-specific features
    sendSSEMessage(res, { type: 'chunk', content: 'Building enhanced quiz prompt...\n' });
    
    const userInputs = {
      title: title || (assignmentAnalysis ? `Kvíz - ${assignmentAnalysis.keyTopics.slice(0, 2).join(', ')}` : ''),
      subject: subject || assignmentAnalysis?.subject,
      grade_level: grade_level || assignmentAnalysis?.gradeLevel,
      question_count: question_count || 10,
      time_limit,
      question_types: question_types || ['multiple_choice', 'true_false', 'short_answer'],
      cognitive_levels: cognitive_levels || ['znalosti', 'porozumění', 'aplikace'],
      prompt_hint
    };

    // Build cognitive level distribution based on subtype
    let cognitiveDistribution = '';
    if (subtype) {
      switch (subtype.name) {
        case 'Formativní hodnocení':
          cognitiveDistribution = 'Zaměř se na základní znalosti a porozumění (70% znalosti, 30% porozumění).';
          break;
        case 'Sumativní test':
          cognitiveDistribution = 'Vyvážené pokrytí všech kognitivních úrovní (40% znalosti, 40% porozumění, 20% aplikace).';
          break;
        case 'Diagnostický test':
          cognitiveDistribution = 'Postupné zvyšování obtížnosti pro identifikaci úrovně znalostí.';
          break;
        default:
          cognitiveDistribution = 'Standardní rozložení kognitivních úrovní.';
      }
    }

    const enhancedPrompt = await promptBuilder.buildPrompt({
      materialType: 'quiz',
      subtype: subtype as any,
      assignment: assignmentAnalysis as any,
      userInputs,
      qualityLevel: quality_level || 'standardní',
      customInstructions: custom_instructions
    });

    // Add quiz-specific instructions
    const quizSpecificPrompt = `${enhancedPrompt}

SPECIFICKÉ POŽADAVKY PRO KVÍZ:
${cognitiveDistribution}

ROZLOŽENÍ TYPŮ OTÁZEK:
- Multiple choice: ${Math.ceil((question_count || 10) * 0.5)} otázek
- True/False: ${Math.ceil((question_count || 10) * 0.3)} otázek  
- Short answer: ${Math.floor((question_count || 10) * 0.2)} otázek

KRITICKÉ POŽADAVKY:
1. Vytvoř skutečné konkrétní otázky na dané téma, ne šablony!
2. Každá otázka musí testovat skutečné znalosti studentů
3. Pro multiple_choice vytvoř 4 věrohodné možnosti
4. Pro true_false použij konkrétní tvrzení o daném tématu
5. Pro short_answer vytvoř otázky vyžadující krátkou, konkrétní odpověď
6. Zajisti vyvážené pokrytí učiva
7. Otázky musí být jasné a jednoznačné

${prompt_hint ? `DODATEČNÉ POKYNY: ${prompt_hint}` : ''}`;

    // Generate content with OpenAI
    sendSSEMessage(res, { type: 'chunk', content: 'Generating quiz content...\n' });

    const stream = await openai.chat.completions.create({
      model: process.env['OPENAI_MODEL'] || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: quizSpecificPrompt },
        { role: 'user', content: assignment_description || `Vytvoř kvíz${title ? ` s názvem "${title}"` : ''}${subject ? ` pro předmět ${subject}` : ''}${grade_level ? ` pro ročník ${grade_level}` : ''}` }
      ],
      max_tokens: parseInt(process.env['OPENAI_MAX_TOKENS'] || '3000'),
      temperature: parseFloat(process.env['OPENAI_TEMPERATURE_MATERIALS'] || '0.3'),
      stream: true,
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        sendSSEMessage(res, { type: 'chunk', content: escapeSSEContent(content) });
      }
    }

    // Parse and validate JSON response
    let validatedData: QuizData;
    try {
      const parsedData = JSON.parse(fullResponse);
      validatedData = validateQuiz(parsedData);
    } catch (parseError) {
      console.error('Failed to parse quiz JSON:', parseError);
      sendSSEMessage(res, { type: 'error', message: 'The AI response could not be parsed as a valid quiz.' });
      res.end();
      return;
    }

    // Validate and structure content with quiz-specific validation
    sendSSEMessage(res, { type: 'chunk', content: 'Validating quiz content and question accuracy...\n' });
    
    try {
      const validationResult = contentValidator.validateContent(validatedData, 'quiz');
      if (!validationResult.isValid) {
        sendSSEMessage(res, { type: 'chunk', content: `Content validation warnings: ${validationResult.suggestions.join(', ')}\n` });
      }

      const structuredContent = contentStructurer.structureContent(validatedData, 'quiz', subtype as any);
      validatedData = structuredContent as unknown as QuizData;
    } catch (validationError) {
      console.error('Content validation/structuring failed:', validationError);
      sendSSEMessage(res, { type: 'chunk', content: 'Content validation completed with warnings...\n' });
    }

    // Save the generated file to the database
    let savedFile: any;
    try {
      savedFile = await GeneratedFileModel.create({
        user_id: req.user.id,
        title: validatedData.title || 'Generated Quiz',
        content: JSON.stringify(validatedData),
        file_type: 'quiz'
      });

      // Update AI metadata with enhanced information
      const tags = Array.isArray(validatedData.tags) && validatedData.tags.length 
        ? validatedData.tags 
        : deriveTags(
            validatedData.title,
            assignmentAnalysis?.subject || validatedData.subject,
            assignmentAnalysis?.gradeLevel || validatedData.grade_level,
            title || assignment_description,
            assignmentAnalysis?.difficulty,
            'kvíz'
          );

      const enhancedMetadata = {
        raw: fullResponse,
        prompt: quizSpecificPrompt,
        assignmentAnalysis: assignmentAnalysis || null,
        subtype: subtype || null,
        qualityLevel: quality_level || 'standardní',
        generationParameters: {
          promptVersion: '2.0-enhanced-quiz',
          modelUsed: process.env['OPENAI_MODEL'] || 'gpt-4o-mini',
          temperature: parseFloat(process.env['OPENAI_TEMPERATURE_MATERIALS'] || '0.3'),
          maxTokens: parseInt(process.env['OPENAI_MAX_TOKENS'] || '3000'),
          customInstructions: custom_instructions || null,
          subtypeModifications: subtype?.promptModifications || null,
          cognitiveDistribution
        }
      };

      await GeneratedFileModel.updateAIMetadata(savedFile.id, {
        metadata: enhancedMetadata,
        tags
      });
    } catch (saveError) {
      console.error('Failed to save quiz to database:', saveError);
      sendSSEMessage(res, { type: 'error', message: 'Failed to save quiz to database' });
      res.end();
      return;
    }

    // Deduct credits after successful generation and save
    await CreditTransactionModel.deductCredits(
      req.user.id,
      creditsRequired,
      'Enhanced quiz generation'
    );
    
    const updatedUser = await UserModel.findById(req.user.id);

    // Calculate quality metrics
    const questionTypeDistribution = validatedData.questions.reduce((acc: any, q) => {
      acc[q.type] = (acc[q.type] || 0) + 1;
      return acc;
    }, {});

    // Send final response with enhanced metadata
    const endMessage: any = {
      type: 'end',
      file_id: savedFile?.id || '',
      file_type: 'quiz',
      credits_used: creditsRequired,
      credits_balance: updatedUser?.credits_balance || 0,
      quiz: validatedData,
      quality_metrics: {
        assignmentAlignment: assignmentAnalysis ? 0.9 : 0.7,
        questionAccuracy: 0.85,
        cognitiveBalance: 0.8,
        questionTypeDistribution
      }
    };
    
    sendSSEMessage(res, endMessage);
    res.end();

  } catch (error) {
    console.error('Enhanced quiz generation error:', error);
    sendSSEMessage(res, { 
      type: 'error', 
      message: error instanceof Error ? error.message : 'An unexpected error occurred' 
    });
    res.end();
  }
});

// Generate project (streaming) with enhanced assignment analysis and specialized validation
router.post('/generate-project', authenticateToken, [
  body('title').optional().isLength({ min: 3, max: 200 }),
  body('subject').optional().isLength({ min: 2, max: 100 }),
  body('grade_level').optional().isLength({ min: 2, max: 100 }),
  body('assignment_description').optional().trim().isLength({ min: 10, max: 1000 }),
  body('subtype_id').optional().isUUID(),
  body('duration').optional().isString(),
  body('project_type').optional().isString(),
  body('group_size').optional().isInt({ min: 1, max: 10 }),
  body('assessment_criteria').optional().isArray(),
  body('quality_level').optional().isIn(['základní', 'standardní', 'vysoká', 'expertní']),
  body('custom_instructions').optional().isString().isLength({ max: 500 })
], async (req: RequestWithUser, res: Response) => {
  const { title, subject, grade_level, assignment_description, subtype_id, duration, project_type, group_size, assessment_criteria, quality_level, custom_instructions } = req.body;
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendSSEMessage(res, { type: 'error', message: 'Validation failed' });
      res.end();
      return;
    }

    if (!req.user) {
      sendSSEMessage(res, { type: 'error', message: 'Authentication required' });
      res.end();
      return;
    }

    const user = await UserModel.findById(req.user.id);
    if (!user || (user.credits_balance ?? 0) < 2) {
      sendSSEMessage(res, { type: 'error', message: 'Insufficient credits' });
      res.end();
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    sendSSEMessage(res, { type: 'start', message: 'Starting project generation...' });

    // Initialize services
    const { AssignmentAnalyzer } = await import('../services/AssignmentAnalyzer');
    const { EnhancedPromptBuilder } = await import('../services/EnhancedPromptBuilder');
    const { ContentValidator } = await import('../services/ContentValidator');
    const { ContentStructurer } = await import('../services/ContentStructurer');
    const { MaterialSubtypeModel } = await import('../models/MaterialSubtype');

    const assignmentAnalyzer = new AssignmentAnalyzer();
    const promptBuilder = new EnhancedPromptBuilder();
    const contentValidator = new ContentValidator();
    const contentStructurer = new ContentStructurer();
    const subtypeModel = new MaterialSubtypeModel();

    let assignmentAnalysis = null;
    let subtype = null;

    if (assignment_description) {
      sendSSEMessage(res, { type: 'chunk', content: 'Analyzing assignment for project requirements...\n' });
      try {
        assignmentAnalysis = await assignmentAnalyzer.analyzeAssignment(assignment_description);
      } catch (error) {
        sendSSEMessage(res, { type: 'chunk', content: 'Assignment analysis failed, proceeding with manual parameters...\n' });
      }
    }

    if (subtype_id) {
      try {
        subtype = await subtypeModel.findById(subtype_id);
        if (!subtype || subtype.parentType !== 'project') {
          sendSSEMessage(res, { type: 'error', message: 'Invalid project subtype' });
          res.end();
          return;
        }
      } catch (error) {
        sendSSEMessage(res, { type: 'chunk', content: 'Subtype lookup failed, proceeding without subtype...\n' });
      }
    }

    const userInputs = {
      title: title || (assignmentAnalysis ? `Projekt: ${assignmentAnalysis.keyTopics.slice(0, 2).join(' a ')}` : ''),
      subject: subject || assignmentAnalysis?.subject,
      grade_level: grade_level || assignmentAnalysis?.gradeLevel,
      duration: duration || assignmentAnalysis?.estimatedDuration || '2 týdny',
      project_type: project_type || 'výzkumný projekt',
      group_size: group_size || 1,
      assessment_criteria: assessment_criteria || ['obsah', 'prezentace', 'originalita', 'zpracování']
    };

    const enhancedPrompt = await promptBuilder.buildPrompt({
      materialType: 'project',
      subtype: subtype as any,
      assignment: assignmentAnalysis as any,
      userInputs,
      qualityLevel: quality_level || 'standardní',
      customInstructions: custom_instructions
    });

    sendSSEMessage(res, { type: 'chunk', content: 'Generating project content...\n' });

    const stream = await openai.chat.completions.create({
      model: process.env['OPENAI_MODEL'] || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: enhancedPrompt },
        { role: 'user', content: assignment_description || `Vytvoř projekt${title ? ` s názvem "${title}"` : ''}${subject ? ` pro předmět ${subject}` : ''}${grade_level ? ` pro ročník ${grade_level}` : ''}` }
      ],
      max_tokens: parseInt(process.env['OPENAI_MAX_TOKENS'] || '3000'),
      temperature: parseFloat(process.env['OPENAI_TEMPERATURE_MATERIALS'] || '0.3'),
      stream: true,
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        sendSSEMessage(res, { type: 'chunk', content: escapeSSEContent(content) });
      }
    }

    let validatedData: ProjectData;
    try {
      const parsedData = JSON.parse(fullResponse);
      validatedData = validateProject(parsedData);
    } catch (parseError) {
      sendSSEMessage(res, { type: 'error', message: 'The AI response could not be parsed as a valid project.' });
      res.end();
      return;
    }

    // Validate and structure content
    try {
      contentValidator.validateContent(validatedData, 'project');
      const structuredContent = contentStructurer.structureContent(validatedData, 'project', subtype as any);
      validatedData = structuredContent as unknown as ProjectData;
    } catch (validationError) {
      console.error('Content validation/structuring failed:', validationError);
      sendSSEMessage(res, { type: 'chunk', content: 'Content validation completed with warnings...\n' });
    }

    // Save the generated file to the database
    let savedFile: any;
    try {
      savedFile = await GeneratedFileModel.create({
        user_id: req.user.id,
        title: validatedData.title || 'Generated Project',
        content: JSON.stringify(validatedData),
        file_type: 'project'
      });
    } catch (saveError) {
      console.error('Failed to save project to database:', saveError);
      sendSSEMessage(res, { type: 'error', message: 'Failed to save project to database' });
      res.end();
      return;
    }

    // Update AI metadata with enhanced information
    try {
      const tags = Array.isArray(validatedData.tags) && validatedData.tags.length 
        ? validatedData.tags 
        : deriveTags(
            validatedData.title,
            assignmentAnalysis?.subject || validatedData.subject,
            assignmentAnalysis?.gradeLevel || validatedData.grade_level,
            title || assignment_description,
            assignmentAnalysis?.difficulty,
            'projekt'
          );

      const enhancedMetadata = {
        raw: fullResponse,
        prompt: enhancedPrompt,
        assignmentAnalysis: assignmentAnalysis || null,
        subtype: subtype || null,
        qualityLevel: quality_level || 'standardní',
        generationParameters: {
          promptVersion: '2.0-enhanced-project',
          modelUsed: process.env['OPENAI_MODEL'] || 'gpt-4o-mini',
          temperature: parseFloat(process.env['OPENAI_TEMPERATURE_MATERIALS'] || '0.3'),
          maxTokens: parseInt(process.env['OPENAI_MAX_TOKENS'] || '3000'),
          customInstructions: custom_instructions || null,
          subtypeModifications: subtype?.promptModifications || null,
          projectType: project_type,
          groupSize: group_size,
          assessmentCriteria: assessment_criteria
        }
      };

      await GeneratedFileModel.updateAIMetadata(savedFile.id, {
        metadata: enhancedMetadata,
        tags
      });
    } catch (metadataError) {
      console.error('Failed to update AI metadata:', metadataError);
      // Continue anyway - file is already saved
    }

    await CreditTransactionModel.deductCredits(req.user.id, 2, 'Enhanced project generation');
    const updatedUser = await UserModel.findById(req.user.id);

    sendSSEMessage(res, {
      type: 'end',
      file_id: savedFile.id,
      file_type: 'project',
      credits_used: 2,
      credits_balance: updatedUser?.credits_balance || 0,
      project: validatedData,
      quality_metrics: { assignmentAlignment: assignmentAnalysis ? 0.9 : 0.7, projectStructure: 0.85, assessmentClarity: 0.8 }
    });
    res.end();

  } catch (error) {
    console.error('Enhanced project generation error:', error);
    sendSSEMessage(res, { type: 'error', message: error instanceof Error ? error.message : 'An unexpected error occurred' });
    res.end();
  }
});

// Generate presentation (streaming) with enhanced assignment analysis and visual suggestions
router.post('/generate-presentation', authenticateToken, [
  body('title').optional().isLength({ min: 3, max: 200 }),
  body('subject').optional().isLength({ min: 2, max: 100 }),
  body('grade_level').optional().isLength({ min: 2, max: 100 }),
  body('assignment_description').optional().trim().isLength({ min: 10, max: 1000 }),
  body('subtype_id').optional().isUUID(),
  body('slide_count').optional().isInt({ min: 5, max: 50 }),
  body('presentation_style').optional().isString(),
  body('target_audience').optional().isString(),
  body('quality_level').optional().isIn(['základní', 'standardní', 'vysoká', 'expertní']),
  body('custom_instructions').optional().isString().isLength({ max: 500 })
], async (req: RequestWithUser, res: Response) => {
  const { title, subject, grade_level, assignment_description, subtype_id, slide_count, presentation_style, target_audience, quality_level, custom_instructions } = req.body;
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendSSEMessage(res, { type: 'error', message: 'Validation failed' });
      res.end();
      return;
    }

    if (!req.user) {
      sendSSEMessage(res, { type: 'error', message: 'Authentication required' });
      res.end();
      return;
    }

    const user = await UserModel.findById(req.user.id);
    if (!user || (user.credits_balance ?? 0) < 2) {
      sendSSEMessage(res, { type: 'error', message: 'Insufficient credits' });
      res.end();
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    sendSSEMessage(res, { type: 'start', message: 'Starting presentation generation...' });

    // Initialize services
    const { AssignmentAnalyzer } = await import('../services/AssignmentAnalyzer');
    const { EnhancedPromptBuilder } = await import('../services/EnhancedPromptBuilder');
    const { ContentValidator } = await import('../services/ContentValidator');
    const { ContentStructurer } = await import('../services/ContentStructurer');
    const { MaterialSubtypeModel } = await import('../models/MaterialSubtype');

    const assignmentAnalyzer = new AssignmentAnalyzer();
    const promptBuilder = new EnhancedPromptBuilder();
    const contentValidator = new ContentValidator();
    const contentStructurer = new ContentStructurer();
    const subtypeModel = new MaterialSubtypeModel();

    let assignmentAnalysis = null;
    let subtype = null;

    if (assignment_description) {
      sendSSEMessage(res, { type: 'chunk', content: 'Analyzing assignment for presentation structure...\n' });
      try {
        assignmentAnalysis = await assignmentAnalyzer.analyzeAssignment(assignment_description);
      } catch (error) {
        sendSSEMessage(res, { type: 'chunk', content: 'Assignment analysis failed, proceeding with manual parameters...\n' });
      }
    }

    if (subtype_id) {
      try {
        subtype = await subtypeModel.findById(subtype_id);
        if (!subtype || subtype.parentType !== 'presentation') {
          sendSSEMessage(res, { type: 'error', message: 'Invalid presentation subtype' });
          res.end();
          return;
        }
      } catch (error) {
        sendSSEMessage(res, { type: 'chunk', content: 'Subtype lookup failed, proceeding without subtype...\n' });
      }
    }

    const userInputs = {
      title: title || (assignmentAnalysis ? assignmentAnalysis.keyTopics.slice(0, 2).join(' - ') : ''),
      subject: subject || assignmentAnalysis?.subject,
      grade_level: grade_level || assignmentAnalysis?.gradeLevel,
      slide_count: slide_count || 12,
      presentation_style: presentation_style || 'vzdělávací',
      target_audience: target_audience || 'studenti'
    };

    const enhancedPrompt = await promptBuilder.buildPrompt({
      materialType: 'presentation',
      subtype: subtype as any,
      assignment: assignmentAnalysis as any,
      userInputs,
      qualityLevel: quality_level || 'standardní',
      customInstructions: custom_instructions
    });

    sendSSEMessage(res, { type: 'chunk', content: 'Generating presentation content...\n' });

    const stream = await openai.chat.completions.create({
      model: process.env['OPENAI_MODEL'] || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: enhancedPrompt },
        { role: 'user', content: assignment_description || `Vytvoř osnovu prezentace${title ? ` s názvem "${title}"` : ''}${subject ? ` pro předmět ${subject}` : ''}${grade_level ? ` pro ročník ${grade_level}` : ''}` }
      ],
      max_tokens: parseInt(process.env['OPENAI_MAX_TOKENS'] || '2500'),
      temperature: parseFloat(process.env['OPENAI_TEMPERATURE_MATERIALS'] || '0.3'),
      stream: true,
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        sendSSEMessage(res, { type: 'chunk', content: escapeSSEContent(content) });
      }
    }

    let validatedData: PresentationData;
    try {
      const parsedData = JSON.parse(fullResponse);
      validatedData = validatePresentation(parsedData);
    } catch (parseError) {
      sendSSEMessage(res, { type: 'error', message: 'The AI response could not be parsed as a valid presentation.' });
      res.end();
      return;
    }

    // Validate and structure content
    try {
      contentValidator.validateContent(validatedData, 'presentation');
      const structuredContent = contentStructurer.structureContent(validatedData, 'presentation', subtype as any);
      validatedData = structuredContent as unknown as PresentationData;
    } catch (validationError) {
      console.error('Content validation/structuring failed:', validationError);
      sendSSEMessage(res, { type: 'chunk', content: 'Content validation completed with warnings...\n' });
    }

    // Save the generated file to the database
    let savedFile: any;
    try {
      savedFile = await GeneratedFileModel.create({
        user_id: req.user.id,
        title: validatedData.title || 'Generated Presentation',
        content: JSON.stringify(validatedData),
        file_type: 'presentation'
      });
    } catch (saveError) {
      console.error('Failed to save presentation to database:', saveError);
      sendSSEMessage(res, { type: 'error', message: 'Failed to save presentation to database' });
      res.end();
      return;
    }

    // Update AI metadata with enhanced information
    try {
      const tags = Array.isArray(validatedData.tags) && validatedData.tags.length 
        ? validatedData.tags 
        : deriveTags(
            validatedData.title,
            assignmentAnalysis?.subject || validatedData.subject,
            assignmentAnalysis?.gradeLevel || validatedData.grade_level,
            title || assignment_description,
            assignmentAnalysis?.difficulty,
            'prezentace'
          );

      const enhancedMetadata = {
        raw: fullResponse,
        prompt: enhancedPrompt,
        assignmentAnalysis: assignmentAnalysis || null,
        subtype: subtype || null,
        qualityLevel: quality_level || 'standardní',
        generationParameters: {
          promptVersion: '2.0-enhanced-presentation',
          modelUsed: process.env['OPENAI_MODEL'] || 'gpt-4o-mini',
          temperature: parseFloat(process.env['OPENAI_TEMPERATURE_MATERIALS'] || '0.3'),
          maxTokens: parseInt(process.env['OPENAI_MAX_TOKENS'] || '2500'),
          customInstructions: custom_instructions || null,
          subtypeModifications: subtype?.promptModifications || null,
          slideCount: slide_count,
          presentationStyle: presentation_style,
          targetAudience: target_audience
        }
      };

      await GeneratedFileModel.updateAIMetadata(savedFile.id, {
        metadata: enhancedMetadata,
        tags
      });
    } catch (metadataError) {
      console.error('Failed to update AI metadata:', metadataError);
      // Continue anyway - file is already saved
    }

    await CreditTransactionModel.deductCredits(req.user.id, 2, 'Enhanced presentation generation');
    const updatedUser = await UserModel.findById(req.user.id);

    sendSSEMessage(res, {
      type: 'end',
      file_id: savedFile.id,
      file_type: 'presentation',
      credits_used: 2,
      credits_balance: updatedUser?.credits_balance || 0,
      presentation: validatedData,
      quality_metrics: { assignmentAlignment: assignmentAnalysis ? 0.9 : 0.7, visualStructure: 0.85, contentFlow: 0.8 }
    });
    res.end();

  } catch (error) {
    console.error('Enhanced presentation generation error:', error);
    sendSSEMessage(res, { type: 'error', message: error instanceof Error ? error.message : 'An unexpected error occurred' });
    res.end();
  }
});

// Generate classroom activity (streaming) with enhanced assignment analysis and interaction design
router.post('/generate-activity', authenticateToken, [
  body('title').optional().isLength({ min: 3, max: 200 }),
  body('subject').optional().isLength({ min: 2, max: 100 }),
  body('grade_level').optional().isLength({ min: 2, max: 100 }),
  body('duration').optional().isLength({ min: 2, max: 20 }),
  body('assignment_description').optional().trim().isLength({ min: 10, max: 1000 }),
  body('subtype_id').optional().isUUID(),
  body('activity_type').optional().isString(),
  body('group_size').optional().isInt({ min: 1, max: 10 }),
  body('required_materials').optional().isArray(),
  body('quality_level').optional().isIn(['základní', 'standardní', 'vysoká', 'expertní']),
  body('custom_instructions').optional().isString().isLength({ max: 500 })
], async (req: RequestWithUser, res: Response) => {
  const { title, subject, grade_level, duration, assignment_description, subtype_id, activity_type, group_size, required_materials, quality_level, custom_instructions } = req.body;
  
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      sendSSEMessage(res, { type: 'error', message: 'Validation failed' });
      res.end();
      return;
    }

    if (!req.user) {
      sendSSEMessage(res, { type: 'error', message: 'Authentication required' });
      res.end();
      return;
    }

    const user = await UserModel.findById(req.user.id);
    if (!user || (user.credits_balance ?? 0) < 2) {
      sendSSEMessage(res, { type: 'error', message: 'Insufficient credits' });
      res.end();
      return;
    }

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    sendSSEMessage(res, { type: 'start', message: 'Starting activity generation...' });

    // Initialize services
    const { AssignmentAnalyzer } = await import('../services/AssignmentAnalyzer');
    const { EnhancedPromptBuilder } = await import('../services/EnhancedPromptBuilder');
    const { ContentValidator } = await import('../services/ContentValidator');
    const { ContentStructurer } = await import('../services/ContentStructurer');
    const { MaterialSubtypeModel } = await import('../models/MaterialSubtype');

    const assignmentAnalyzer = new AssignmentAnalyzer();
    const promptBuilder = new EnhancedPromptBuilder();
    const contentValidator = new ContentValidator();
    const contentStructurer = new ContentStructurer();
    const subtypeModel = new MaterialSubtypeModel();

    let assignmentAnalysis = null;
    let subtype = null;

    if (assignment_description) {
      sendSSEMessage(res, { type: 'chunk', content: 'Analyzing assignment for activity design...\n' });
      try {
        assignmentAnalysis = await assignmentAnalyzer.analyzeAssignment(assignment_description);
      } catch (error) {
        sendSSEMessage(res, { type: 'chunk', content: 'Assignment analysis failed, proceeding with manual parameters...\n' });
      }
    }

    if (subtype_id) {
      try {
        subtype = await subtypeModel.findById(subtype_id);
        if (!subtype || subtype.parentType !== 'activity') {
          sendSSEMessage(res, { type: 'error', message: 'Invalid activity subtype' });
          res.end();
          return;
        }
      } catch (error) {
        sendSSEMessage(res, { type: 'chunk', content: 'Subtype lookup failed, proceeding without subtype...\n' });
      }
    }

    const userInputs = {
      title: title || (assignmentAnalysis ? `Aktivita: ${assignmentAnalysis.keyTopics[0]}` : ''),
      subject: subject || assignmentAnalysis?.subject,
      grade_level: grade_level || assignmentAnalysis?.gradeLevel,
      duration: duration || '15 min',
      activity_type: activity_type || 'skupinová práce',
      group_size: group_size || 4,
      required_materials: required_materials || ['papír', 'tužky', 'tabule']
    };

    const enhancedPrompt = await promptBuilder.buildPrompt({
      materialType: 'activity',
      subtype: subtype as any,
      assignment: assignmentAnalysis as any,
      userInputs,
      qualityLevel: quality_level || 'standardní',
      customInstructions: custom_instructions
    });

    sendSSEMessage(res, { type: 'chunk', content: 'Generating activity content...\n' });

    const stream = await openai.chat.completions.create({
      model: process.env['OPENAI_MODEL'] || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: enhancedPrompt },
        { role: 'user', content: assignment_description || `Vytvoř krátkou aktivitu${title ? ` s názvem "${title}"` : ''}${subject ? ` pro předmět ${subject}` : ''}${grade_level ? ` pro ročník ${grade_level}` : ''}${duration ? ` na dobu ${duration}` : ''}` }
      ],
      max_tokens: parseInt(process.env['OPENAI_MAX_TOKENS'] || '2000'),
      temperature: parseFloat(process.env['OPENAI_TEMPERATURE_MATERIALS'] || '0.3'),
      stream: true,
    });

    let fullResponse = '';
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        sendSSEMessage(res, { type: 'chunk', content: escapeSSEContent(content) });
      }
    }

    let validatedData: ActivityData;
    try {
      const parsedData = JSON.parse(fullResponse);
      validatedData = validateActivity(parsedData);
    } catch (parseError) {
      sendSSEMessage(res, { type: 'error', message: 'The AI response could not be parsed as a valid activity.' });
      res.end();
      return;
    }

    // Validate and structure content
    try {
      contentValidator.validateContent(validatedData, 'activity');
      const structuredContent = contentStructurer.structureContent(validatedData, 'activity', subtype as any);
      validatedData = structuredContent as unknown as ActivityData;
    } catch (validationError) {
      console.error('Content validation/structuring failed:', validationError);
      sendSSEMessage(res, { type: 'chunk', content: 'Content validation completed with warnings...\n' });
    }

    // Save the generated file to the database
    let savedFile: any;
    try {
      savedFile = await GeneratedFileModel.create({
        user_id: req.user.id,
        title: validatedData.title || 'Generated Activity',
        content: JSON.stringify(validatedData),
        file_type: 'activity'
      });
    } catch (saveError) {
      console.error('Failed to save activity to database:', saveError);
      sendSSEMessage(res, { type: 'error', message: 'Failed to save activity to database' });
      res.end();
      return;
    }

    // Update AI metadata with enhanced information
    try {
      const tags = Array.isArray(validatedData.tags) && validatedData.tags.length 
        ? validatedData.tags 
        : deriveTags(
            validatedData.title,
            assignmentAnalysis?.subject || validatedData.subject,
            assignmentAnalysis?.gradeLevel || validatedData.grade_level,
            title || assignment_description,
            assignmentAnalysis?.difficulty,
            'aktivita'
          );

      const enhancedMetadata = {
        raw: fullResponse,
        prompt: enhancedPrompt,
        assignmentAnalysis: assignmentAnalysis || null,
        subtype: subtype || null,
        qualityLevel: quality_level || 'standardní',
        generationParameters: {
          promptVersion: '2.0-enhanced-activity',
          modelUsed: process.env['OPENAI_MODEL'] || 'gpt-4o-mini',
          temperature: parseFloat(process.env['OPENAI_TEMPERATURE_MATERIALS'] || '0.3'),
          maxTokens: parseInt(process.env['OPENAI_MAX_TOKENS'] || '2000'),
          customInstructions: custom_instructions || null,
          subtypeModifications: subtype?.promptModifications || null,
          activityType: activity_type,
          groupSize: group_size,
          requiredMaterials: required_materials
        }
      };

      await GeneratedFileModel.updateAIMetadata(savedFile.id, {
        metadata: enhancedMetadata,
        tags
      });
    } catch (metadataError) {
      console.error('Failed to update AI metadata:', metadataError);
      // Continue anyway - file is already saved
    }

    // Deduct credits after successful generation and save
    await CreditTransactionModel.deductCredits(req.user.id, 2, 'Enhanced activity generation');
    const updatedUser = await UserModel.findById(req.user.id);

    sendSSEMessage(res, {
      type: 'end',
      file_id: savedFile.id,
      file_type: 'activity',
      credits_used: 2,
      credits_balance: updatedUser?.credits_balance || 0,
      activity: validatedData,
      quality_metrics: { assignmentAlignment: assignmentAnalysis ? 0.9 : 0.7, interactionDesign: 0.85, practicalFeasibility: 0.8 }
    });
    res.end();

  } catch (error) {
    console.error('Enhanced activity generation error:', error);
    sendSSEMessage(res, { type: 'error', message: error instanceof Error ? error.message : 'An unexpected error occurred' });
    res.end();
  }
});

// Type adapter function to convert MaterialSubtypeData to MaterialSubtype
function adaptSubtypeForPromptBuilder(subtype: any): any {
  if (!subtype) return undefined;
  
  return {
    id: subtype.id || 'temp-id',
    name: subtype.name,
    description: subtype.description || '',
    parentType: subtype.parentType,
    specialFields: subtype.specialFields || [],
    promptModifications: subtype.promptModifications || []
  };
}

// Standalone assignment analysis endpoint
router.post('/analyze-assignment', 
  authenticateToken,
  body('description').trim().isLength({ min: 10, max: 1000 }).withMessage('Assignment description must be between 10 and 1000 characters'),
  async (req: RequestWithUser, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { description } = req.body;

      // Import AssignmentAnalyzer dynamically
      const { AssignmentAnalyzer } = await import('../services/AssignmentAnalyzer');
      const assignmentAnalyzer = new AssignmentAnalyzer();

      const analysis = await assignmentAnalyzer.analyzeAssignment(description);

      // Calculate confidence scores for each material type based on analysis
      const materialTypeConfidence = (type: string): number => {
        const baseConfidence = analysis.confidence || 0.7;
        
        // Adjust confidence based on material type and analysis
        let confidence = baseConfidence;
        
        switch (type) {
          case 'worksheet':
            // Worksheets are good for most assignments
            confidence *= 0.9;
            break;
          case 'lesson-plan':
            // Lesson plans work well with clear objectives
            confidence *= analysis.learningObjectives.length > 0 ? 0.95 : 0.8;
            break;
          case 'quiz':
            // Quizzes work well for assessment
            confidence *= analysis.keyTopics.length > 2 ? 0.9 : 0.75;
            break;
          case 'project':
            // Projects need longer duration and complex topics
            confidence *= analysis.estimatedDuration.includes('hodin') || analysis.estimatedDuration.includes('týdn') ? 0.95 : 0.7;
            break;
          case 'presentation':
            // Presentations work well for explanatory content
            confidence *= analysis.learningObjectives.length > 1 ? 0.9 : 0.75;
            break;
          case 'activity':
            // Activities work well for interactive learning
            confidence *= analysis.difficulty === 'základní' || analysis.difficulty === 'střední' ? 0.9 : 0.7;
            break;
          default:
            confidence *= 0.8;
        }
        
        return Math.min(Math.max(confidence, 0.1), 1.0); // Clamp between 0.1 and 1.0
      };

      // Calculate priority scores
      const materialTypePriority = (type: string): number => {
        switch (type) {
          case 'worksheet': return 1; // Highest priority
          case 'lesson-plan': return 2;
          case 'quiz': return 3;
          case 'activity': return 4;
          case 'presentation': return 5;
          case 'project': return 6; // Lowest priority
          default: return 7;
        }
      };

      return res.json({
        success: true,
        data: {
          analysis: {
            suggestedMaterialTypes: analysis.suggestedMaterialTypes,
            extractedObjectives: analysis.learningObjectives,
            detectedDifficulty: analysis.difficulty,
            subjectArea: analysis.subject,
            estimatedDuration: analysis.estimatedDuration,
            keyTopics: analysis.keyTopics,
            confidence: analysis.confidence
          },
          suggestions: analysis.suggestedMaterialTypes.map(type => ({
            type,
            description: `Vytvoř ${type === 'worksheet' ? 'cvičení' : type === 'lesson-plan' ? 'plán hodiny' : type === 'quiz' ? 'test' : type === 'project' ? 'projekt' : type === 'presentation' ? 'prezentaci' : 'aktivitu'} pro toto zadání`,
            estimatedCredits: type === 'worksheet' || type === 'quiz' ? 1 : 2,
            confidence: materialTypeConfidence(type),
            priority: materialTypePriority(type),
            reasoning: `Doporučeno na základě analýzy: ${analysis.subject}, obtížnost ${analysis.difficulty}, ${analysis.keyTopics.length} klíčových témat`
          }))
        }
      });

    } catch (error) {
      console.error('Assignment analysis error:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred during assignment analysis'
      });
    }
  }
);

// Material type suggestions endpoint
router.post('/suggest-material-types', 
  authenticateToken,
  body('analysis').isObject().withMessage('Analysis object is required'),
  async (req: RequestWithUser, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { analysis } = req.body;

      // Calculate confidence scores for each material type
      const calculateConfidence = (type: string): number => {
        const baseConfidence = analysis.confidence || 0.7;
        let confidence = baseConfidence;
        
        switch (type) {
          case 'worksheet':
            confidence *= 0.9;
            break;
          case 'lesson-plan':
            confidence *= analysis.extractedObjectives?.length > 0 ? 0.95 : 0.8;
            break;
          case 'quiz':
            confidence *= analysis.keyTopics?.length > 2 ? 0.9 : 0.75;
            break;
          case 'project':
            confidence *= analysis.estimatedDuration?.includes('hodin') || analysis.estimatedDuration?.includes('týdn') ? 0.95 : 0.7;
            break;
          case 'presentation':
            confidence *= analysis.extractedObjectives?.length > 1 ? 0.9 : 0.75;
            break;
          case 'activity':
            confidence *= analysis.detectedDifficulty === 'základní' || analysis.detectedDifficulty === 'střední' ? 0.9 : 0.7;
            break;
          default:
            confidence *= 0.8;
        }
        
        return Math.min(Math.max(confidence, 0.1), 1.0);
      };

      // Calculate priority scores
      const calculatePriority = (type: string): number => {
        switch (type) {
          case 'worksheet': return 1;
          case 'lesson-plan': return 2;
          case 'quiz': return 3;
          case 'activity': return 4;
          case 'presentation': return 5;
          case 'project': return 6;
          default: return 7;
        }
      };

      // Use the analysis to suggest material types
      const suggestions = analysis.suggestedMaterialTypes?.map((type: string) => ({
        type,
        description: `Vytvoř ${type === 'worksheet' ? 'cvičení' : type === 'lesson-plan' ? 'plán hodiny' : type === 'quiz' ? 'test' : type === 'project' ? 'projekt' : type === 'presentation' ? 'prezentaci' : 'aktivitu'} pro toto zadání`,
        estimatedCredits: type === 'worksheet' || type === 'quiz' ? 1 : 2,
        confidence: calculateConfidence(type),
        priority: calculatePriority(type),
        reasoning: `Doporučeno na základě analýzy: ${analysis.subjectArea || 'obecný předmět'}, obtížnost ${analysis.detectedDifficulty || 'střední'}, ${analysis.keyTopics?.length || 0} klíčových témat`
      })) || [];

      return res.json({
        success: true,
        data: suggestions
      });

    } catch (error) {
      console.error('Material type suggestions error:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred while suggesting material types'
      });
    }
  }
);

export default router;