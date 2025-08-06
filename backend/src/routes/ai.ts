import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { CreditTransactionModel } from '../models/CreditTransaction';
import { UserModel } from '../models/User';
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

    const { message, session_id } = req.body;
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
    if (user.credits_balance < creditsRequired) {
      return res.status(402).json({
        success: false,
        error: 'Insufficient credits',
        data: {
          credits_balance: user.credits_balance,
          credits_required: creditsRequired
        }
      });
    }

    // Call OpenAI API
    const completion = await openai.chat.completions.create({
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
    });

    // Extract the AI response
    const aiResponse = completion.choices[0]?.message?.content || 'Omlouvám se, ale momentálně nemohu zpracovat váš dotaz. Zkuste to prosím znovu.';

    // Deduct credits only after successful API call
    await CreditTransactionModel.deductCredits(
      userId, 
      creditsRequired, 
      `AI chat message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`
    );

    // Get updated user balance
    const updatedUser = await UserModel.findById(userId);

    return res.status(200).json({
      success: true,
      data: {
        response: aiResponse,
        credits_used: creditsRequired,
        credits_balance: updatedUser?.credits_balance || 0,
        session_id: session_id || null
      },
      message: 'AI response generated successfully'
    });

  } catch (error) {
    console.error('AI chat error:', error);
    
    // Handle OpenAI API errors specifically
    if (error instanceof OpenAI.APIError) {
      return res.status(500).json({
        success: false,
        error: 'OpenAI API error',
        details: error.message
      });
    }
    
    return res.status(500).json({
      success: false,
      error: 'Failed to process AI request'
    });
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
      data: {
        features: [
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
        ]
      },
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

export default router; 