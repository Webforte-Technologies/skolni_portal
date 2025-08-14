import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { listNotificationsForUser, markNotificationRead } from '../models/Notification';

const router = express.Router();

router.get('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Authentication required' });
    const limit = Math.min(parseInt(String((req.query as any)['limit'] || '50')), 200);
    const offset = parseInt(String((req.query as any)['offset'] || '0'));
    const rows = await listNotificationsForUser(req.user.id, limit, offset);
    return res.json({ success: true, data: rows });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Failed to fetch notifications' });
  }
});

router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ success: false, error: 'Authentication required' });
    const id = req.params.id;
    const ok = await markNotificationRead(id, req.user.id);
    if (!ok) return res.status(404).json({ success: false, error: 'Notification not found' });
    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ success: false, error: 'Failed to mark as read' });
  }
});

export default router;


