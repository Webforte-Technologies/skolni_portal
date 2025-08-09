import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { CreditTransactionModel } from '../models/CreditTransaction';
import { UserModel } from '../models/User';
import { ConversationModel } from '../models/Conversation';
import { MessageModel } from '../models/Message';
import { GeneratedFileModel } from '../models/GeneratedFile';
import OpenAI from 'openai';

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

// Specialized system prompt for worksheet generation
const WORKSHEET_SYSTEM_PROMPT = `Jsi zkušený český učitel matematiky na střední škole. Tvým úkolem je vytvořit kvalitní cvičení pro studenty.

PRAVIDLA PRO VYTVÁŘENÍ CVIČENÍ:
1. **Vždy odpovídej v čistém JSON formátu** - Používej přesně tuto strukturu:
{
  "title": "Název cvičení",
  "instructions": "Instrukce pro studenty",
  "questions": [
    {
      "problem": "Zadání úlohy",
      "answer": "Správná odpověď"
    }
  ]
}

2. **Vytvoř 10 otázek** - Každá otázka by měla být jiná a testovat různé aspekty tématu
3. **Používej českou terminologii** - Všechny texty musí být v češtině
4. **Správné obtížnosti** - Otázky by měly být přiměřené středoškolské úrovni
5. **Praktické příklady** - Používej reálné situace a praktické aplikace
6. **Krok za krokem** - U složitějších úloh uveď postup řešení

PAMATUJ: Odpověď musí být platný JSON bez dodatečného textu!`;

// Validation middleware
const validateChatMessage = [
  body('message').trim().isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters'),
  body('session_id').optional().isUUID().withMessage('Invalid session ID format')
];

// Send message to AI assistant (live OpenAI implementation)
router.post('/chat', authenticateToken, validateChatMessage, async (req: Request, res: Response) => {
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
router.get('/stats', authenticateToken, async (req: Request, res: Response) => {
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

// Generate worksheet endpoint with streaming
router.post('/generate-worksheet', authenticateToken, [
  body('topic').trim().isLength({ min: 3, max: 200 }).withMessage('Topic must be between 3 and 200 characters')
], async (req: Request, res: Response) => {
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

    const { topic } = req.body;
    const userId = req.user.id;

    // Check if user has enough credits (2 credits per worksheet)
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    const creditsRequired = 2;
    
    // Critical fix: Ensure user has > 0 credits before proceeding
    if (user.credits_balance <= 0) {
      return res.status(402).json({
        success: false,
        error: 'Insufficient credits',
        data: {
          credits_balance: user.credits_balance,
          credits_required: creditsRequired,
          message: 'You need at least 2 credits to generate a worksheet. Please add more credits to continue.'
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
          message: `You have ${user.credits_balance} credits but need ${creditsRequired} credits for worksheet generation.`
        }
      });
    }

    // Deduct credits before starting the stream
    await CreditTransactionModel.deductCredits(
      userId, 
      creditsRequired, 
      `Worksheet generation: "${topic}"`
    );

    // Set headers for streaming
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    // Send initial response
    res.write('data: {"type":"start","message":"Starting worksheet generation..."}\n\n');

    // Call OpenAI API with streaming for worksheet generation
    const stream = await openai.chat.completions.create({
      model: process.env['OPENAI_MODEL'] || 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: WORKSHEET_SYSTEM_PROMPT
        },
        {
          role: 'user',
          content: `Vytvoř cvičení na téma: ${topic}. Vytvoř 10 různých otázek s odpověďmi.`
        }
      ],
      max_tokens: parseInt(process.env['OPENAI_MAX_TOKENS'] || '3000'),
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

    // Parse JSON response
    let worksheetData;
    try {
      worksheetData = JSON.parse(fullResponse);
      
      // Validate the structure
      if (!worksheetData.title || !worksheetData.instructions || !Array.isArray(worksheetData.questions)) {
        throw new Error('Invalid worksheet structure');
      }
    } catch (parseError) {
      console.error('Failed to parse worksheet JSON:', parseError);
      res.write('data: {"type":"error","message":"The AI response could not be parsed as a valid worksheet."}\n\n');
      res.end();
      return;
    }

    // Save the generated worksheet to the database
    try {
      await GeneratedFileModel.create({
        user_id: userId,
        title: worksheetData.title,
        content: JSON.stringify(worksheetData),
        file_type: 'worksheet'
      });
      console.log('✅ Worksheet saved to database successfully');
    } catch (saveError) {
      console.error('Failed to save worksheet to database:', saveError);
      // Don't fail the request if database save fails, but log the error
    }

    // Get updated user balance
    const updatedUser = await UserModel.findById(userId);

    // Send final response with metadata
    res.write(`data: {"type":"end","worksheet":${JSON.stringify(worksheetData)},"credits_used":${creditsRequired},"credits_balance":${updatedUser?.credits_balance || 0}}\n\n`);
    res.end();
    return;

  } catch (error) {
    console.error('Worksheet generation error:', error);
    
    // Send error through stream
    res.write(`data: {"type":"error","message":"${error instanceof Error ? error.message : 'An unexpected error occurred'}"}\n\n`);
    res.end();
    return;
  }
});

export default router; 