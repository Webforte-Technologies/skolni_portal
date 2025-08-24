import { Router, Request, Response } from 'express';
import { authenticateToken, RequestWithUser } from '../../middleware/auth';
import { GeneratedFileModel } from '../../models/GeneratedFile';
import { CreditTransactionModel } from '../../models/CreditTransaction';

const router = Router();

// Statistics endpoint
router.get('/stats', authenticateToken, async (req: RequestWithUser, res: Response) => {
  try {
    const userId = req.user!.id;
    
    // Get user's generation statistics
    const stats = await GeneratedFileModel.getUserStats(userId);
    
    // Get credit usage statistics
    const creditStats = await CreditTransactionModel.getUserStats(userId);
    
    res.json({
      success: true,
      data: {
        total_generations: stats.total_generations || 0,
        recent_generations: stats.recent_generations || 0,
        total_credits_used: creditStats.total_credits_used || 0,
        recent_credits_used: creditStats.recent_credits_used || 0,
        generation_types: stats.generation_types || {},
        monthly_usage: creditStats.monthly_usage || []
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

// Features endpoint
router.get('/features', authenticateToken, async (_req: Request, res: Response) => {
  try {
    const features = [
      {
        id: 'math',
        name: 'Matematika',
        description: 'AI asistent pro matematiku - pomůže s výpočty, vysvětlením pojmů a řešením úloh',
        credits_per_use: 1,
        available: true
      },
      {
        id: 'czech',
        name: 'Český jazyk',
        description: 'AI asistent pro český jazyk - gramatika, literatura, slohové práce',
        credits_per_use: 1,
        available: true
      },
      {
        id: 'english',
        name: 'Anglický jazyk',
        description: 'AI asistent pro anglický jazyk - gramatika, konverzace, překlady',
        credits_per_use: 1,
        available: true
      },
      {
        id: 'physics',
        name: 'Fyzika',
        description: 'AI asistent pro fyziku - vysvětlení jevů, řešení úloh, experimenty',
        credits_per_use: 1,
        available: true
      },
      {
        id: 'chemistry',
        name: 'Chemie',
        description: 'AI asistent pro chemii - chemické reakce, výpočty, laboratorní práce',
        credits_per_use: 1,
        available: true
      },
      {
        id: 'history',
        name: 'Dějepis',
        description: 'AI asistent pro dějepis - historické události, osobnosti, souvislosti',
        credits_per_use: 1,
        available: true
      }
    ];
    
    res.json({
      success: true,
      data: features
    });
  } catch (error) {
    console.error('Features error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch features'
    });
  }
});

export default router;
