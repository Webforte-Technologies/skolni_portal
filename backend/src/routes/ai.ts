import { Router, Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { CreditTransactionModel } from '../models/CreditTransaction';
import { UserModel } from '../models/User';

const router = Router();

// Validation middleware
const validateChatMessage = [
  body('message').trim().isLength({ min: 1, max: 2000 }).withMessage('Message must be between 1 and 2000 characters'),
  body('session_id').optional().isUUID().withMessage('Invalid session ID format')
];

// Mock AI responses for different types of questions
const mockResponses = [
  {
    question: "matematika",
    response: "V matematice je důležité pochopit základní principy. Například pro sčítání: 2 + 3 = 5. Zkuste si to představit jako skupiny předmětů. Máte 2 jablka a přidáte 3 další, celkem máte 5 jablek."
  },
  {
    question: "fyzika",
    response: "Ve fyzice studujeme přírodní zákony. Newtonův zákon říká, že síla = hmotnost × zrychlení (F = m × a). Tento zákon pomáhá pochopit, jak se objekty pohybují."
  },
  {
    question: "chemie",
    response: "V chemii studujeme atomy a molekuly. Voda (H₂O) se skládá ze dvou atomů vodíku a jednoho atomu kyslíku. Tato struktura jí dává unikátní vlastnosti."
  },
  {
    question: "biologie",
    response: "V biologii studujeme živé organismy. Buňka je základní stavební jednotka života. Každá buňka obsahuje DNA, která nese genetické informace."
  },
  {
    question: "dějepis",
    response: "V dějepisu studujeme minulost lidstva. První světová válka (1914-1918) byla globálním konfliktem, který změnil mapu Evropy a vedl k významným společenským změnám."
  },
  {
    question: "český jazyk",
    response: "V českém jazyce máme různé slovní druhy: podstatná jména (dům), přídavná jména (velký), slovesa (běžet). Správné použití gramatiky je důležité pro jasné vyjadřování."
  }
];

// Get a mock response based on the user's message
function getMockResponse(userMessage: string): string {
  const lowerMessage = userMessage.toLowerCase();
  
  // Check for specific subjects
  for (const mock of mockResponses) {
    if (lowerMessage.includes(mock.question)) {
      return mock.response;
    }
  }
  
  // Default response for general questions
  return `Děkuji za váš dotaz: "${userMessage}". Jako AI asistent pro učitele vám mohu pomoci s přípravou výukových materiálů, vysvětlením složitých témat nebo vytvořením cvičení pro vaše studenty. Jaký předmět vás zajímá?`;
}

// Send message to AI assistant (mock implementation)
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

    // Deduct credits
    await CreditTransactionModel.deductCredits(
      userId, 
      creditsRequired, 
      `AI chat message: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`
    );

    // Generate mock AI response
    const aiResponse = getMockResponse(message);

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