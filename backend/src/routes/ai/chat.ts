import { Router, Response } from 'express';
import { authenticateToken, RequestWithUser } from '../../middleware/auth';
import { validateBody } from '../../middleware/zodValidation';
import { ChatMessageSchema } from '../../schemas/ai';
import { ConversationModel } from '../../models/Conversation';
import { MessageModel } from '../../models/Message';
import { SYSTEM_PROMPT } from '../../services/ai-generation/system-prompts';
import { sendSSEMessage, setupSSEHeaders } from '../../services/ai-generation/sse-utils';
import { validateAndDeductCredits } from '../../services/ai-generation/credit-handler';
import { AIService } from '../../services/AIService';
import { logUserAction } from '../../middleware/activity-logger';

/**
 * Create chat routes with AIService injection
 */
export default function createChatRoutes(aiService: AIService): Router {
  const router = Router();

  // Chat endpoint
  router.post('/chat', authenticateToken, validateBody(ChatMessageSchema), async (req: RequestWithUser, res: Response) => {
    try {
      // Setup SSE headers
      setupSSEHeaders(res);
      
      const { message, conversation_id } = req.body;
      
      // Validate credits
      const creditResult = await validateAndDeductCredits(req, 'chat', 'Chat message');
      if (!creditResult.success) {
        sendSSEMessage(res, { type: 'error', message: creditResult.error || 'Nedostatek kreditů' });
        res.end();
        return;
      }
      
      // Get or create conversation
      let conversation;
      if (conversation_id) {
        conversation = await ConversationModel.findById(conversation_id);
        if (!conversation || conversation.user_id !== req.user!.id) {
          sendSSEMessage(res, { type: 'error', message: 'Konverzace nebyla nalezena' });
          res.end();
          return;
        }
      } else {
        conversation = await ConversationModel.create({
          user_id: req.user!.id,
          title: message.substring(0, 50) + '...'
        });
      }
      
      // Save user message
      const _userMessage = await MessageModel.create({
        conversation_id: conversation.id,
        role: 'user',
        content: message
      });
      
      // Prepare messages for AI
      const conversationMessages = await MessageModel.findByConversationId(conversation.id);
      const _messages = [
        { role: 'system' as const, content: SYSTEM_PROMPT },
        ...conversationMessages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }))
      ];
      
      // Send initial response
      sendSSEMessage(res, { type: 'chunk', content: 'Generuji odpověď...\n' });
      
      // Use AIService for streaming chat
      let assistantResponse = '';
      const metadata: any = {
        user_role: req.user!.role
      };
      
      if (req.ip) metadata.ip_address = req.ip;
      if (req.get('User-Agent')) metadata.user_agent = req.get('User-Agent');
      
      const chatResult = await aiService.streamChat({
        message: message,
        userId: req.user!.id,
        conversationId: conversation.id,
        sessionId: (req as any).sessionID,
        metadata
      }, (chunk) => {
        if (chunk.content) {
          assistantResponse += chunk.content;
          sendSSEMessage(res, { type: 'chunk', content: chunk.content });
        }
      });
      
      if (!chatResult.success) {
        sendSSEMessage(res, { type: 'error', message: chatResult.error || 'Chyba při generování odpovědi' });
        res.end();
        return;
      }
      
      // Save assistant message
      await MessageModel.create({
        conversation_id: conversation.id,
        role: 'assistant',
        content: assistantResponse || ''
      });
      
      // Log the chat activity
      await logUserAction(
        req.user!.id,
        'conversation_started',
        {
          conversation_id: conversation.id,
          message_length: message.length,
          response_length: assistantResponse.length,
          credits_used: creditResult.creditsUsed || 0,
          ai_model: chatResult.metadata?.model_used || 'unknown'
        },
        req
      );

      // Send completion message
      sendSSEMessage(res, { 
        type: 'end', 
        content: assistantResponse,
        credits_used: creditResult.creditsUsed || 0,
        credits_balance: creditResult.newBalance || 0
      });
      res.end();
      
    } catch (error) {
      console.error('Chat error:', error);
      sendSSEMessage(res, { type: 'error', message: 'Chyba při zpracování požadavku' });
      res.end();
    }
  });

  return router;
}
