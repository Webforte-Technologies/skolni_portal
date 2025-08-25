import { Router, Response } from 'express';
import { authenticateToken, RequestWithUser } from '../middleware/auth';
import { validateBody } from '../middleware/zodValidation';
import { ConversationModel } from '../models/Conversation';
import { MessageModel } from '../models/Message';
import { CreateConversationSchema, CreateMessageSchema, UpdateConversationSchema } from '../schemas/conversations';

const router = Router();



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
router.post('/', authenticateToken, validateBody(CreateConversationSchema), async (req: RequestWithUser, res: Response) => {
  try {
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
router.put('/:id', authenticateToken, validateBody(UpdateConversationSchema), async (req: RequestWithUser, res: Response) => {
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
router.post('/:id/messages', authenticateToken, validateBody(CreateMessageSchema), async (req: RequestWithUser, res: Response) => {
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