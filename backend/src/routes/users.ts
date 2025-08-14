import { Router, Response } from 'express';
import { authenticateToken, RequestWithUser } from '../middleware/auth';
import { UserModel } from '../models/User';

const router = Router();

// GET /api/users/me - return current user's basic profile
router.get('/me', authenticateToken, async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    // Fetch fresh data from DB
    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const data = {
      id: user.id,
      name: `${user.first_name} ${user.last_name}`.trim(),
      email: user.email,
      credits: user.credits_balance,
      createdAt: user.created_at,
    };

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ success: false, error: 'Failed to get current user' });
  }
});

export default router;


