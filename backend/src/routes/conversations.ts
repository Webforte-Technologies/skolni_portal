import { Router, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { authenticateToken, RequestWithUser } from '../middleware/auth';
import { ConversationModel } from '../models/Conversation';
import { MessageModel } from '../models/Message';

const router = Router();

// Validation middleware
const validateConversationRequest = [
  body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters'),
  body('assistant_type').optional().isIn(['math_assistant', 'physics_assistant', 'chemistry_assistant', 'biology_assistant', 'history_assistant', 'language_assistant']).withMessage('Invalid assistant type')
];

const validateMessageRequest = [
  body('content').trim().isLength({ min: 1, max: 10000 }).withMessage('Content must be between 1 and 10000 characters'),
  body('role').isIn(['user', 'assistant']).withMessage('Role must be either user or assistant')
];

// Get all conversations for the authenticated user
router.get('/', authenticateToken, async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userId = req.user.id;
    const limit = parseInt(req.query['limit'] as string) || 50;
    const offset = parseInt(req.query['offset'] as string) || 0;

    const conversations = await ConversationModel.findByUserId(userId, limit, offset);
    const total = await ConversationModel.countByUserId(userId);

    return res.status(200).json({
      success: true,
      data: {
        conversations,
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + limit < total
        }
      },
      message: 'Conversations retrieved successfully'
    });

  } catch (error) {
    console.error('Get conversations error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversations'
    });
  }
});

// Get a specific conversation with its messages
router.get('/:id', authenticateToken, async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const conversationId = req.params['id'];
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: 'Conversation ID is required'
      });
    }
    
    const userId = req.user.id;

    // Get conversation with messages
    const conversation = await ConversationModel.findByIdWithMessages(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    // Check if the conversation belongs to the authenticated user
    if (conversation.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    return res.status(200).json({
      success: true,
      data: conversation,
      message: 'Conversation retrieved successfully'
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve conversation'
    });
  }
});

// Create a new conversation
router.post('/', authenticateToken, validateConversationRequest, async (req: RequestWithUser, res: Response) => {
  try {
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

    const { title, assistant_type = 'math_assistant' } = req.body;
    const userId = req.user.id;

    const conversation = await ConversationModel.create({
      user_id: userId,
      assistant_type,
      title
    });

    return res.status(201).json({
      success: true,
      data: conversation,
      message: 'Conversation created successfully'
    });

  } catch (error) {
    console.error('Create conversation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to create conversation'
    });
  }
});

// Update conversation title
router.put('/:id', authenticateToken, [
  body('title').trim().isLength({ min: 1, max: 255 }).withMessage('Title must be between 1 and 255 characters')
], async (req: RequestWithUser, res: Response) => {
  try {
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

    const conversationId = req.params['id'];
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: 'Conversation ID is required'
      });
    }
    
    const { title } = req.body;
    const userId = req.user.id;

    // Check if conversation exists and belongs to user
    const existingConversation = await ConversationModel.findById(conversationId);
    if (!existingConversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    if (existingConversation.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const updatedConversation = await ConversationModel.updateTitle(conversationId, title);

    return res.status(200).json({
      success: true,
      data: updatedConversation,
      message: 'Conversation updated successfully'
    });

  } catch (error) {
    console.error('Update conversation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update conversation'
    });
  }
});

// Delete a conversation
router.delete('/:id', authenticateToken, async (req: RequestWithUser, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const conversationId = req.params['id'];
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: 'Conversation ID is required'
      });
    }
    
    const userId = req.user.id;

    // Check if conversation exists and belongs to user
    const existingConversation = await ConversationModel.findById(conversationId);
    if (!existingConversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    if (existingConversation.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    await ConversationModel.delete(conversationId);

    return res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully'
    });

  } catch (error) {
    console.error('Delete conversation error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete conversation'
    });
  }
});

// Add a message to a conversation
router.post('/:id/messages', authenticateToken, validateMessageRequest, async (req: RequestWithUser, res: Response) => {
  try {
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

    const conversationId = req.params['id'];
    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: 'Conversation ID is required'
      });
    }
    
    const { role, content } = req.body;
    const userId = req.user.id;

    // Check if conversation exists and belongs to user
    const existingConversation = await ConversationModel.findById(conversationId);
    if (!existingConversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }

    if (existingConversation.user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    const message = await MessageModel.create({
      conversation_id: conversationId,
      role,
      content
    });

    return res.status(201).json({
      success: true,
      data: message,
      message: 'Message added successfully'
    });

  } catch (error) {
    console.error('Add message error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to add message'
    });
  }
});

export default router; 