import { MCPServer } from './MCPServer';
import { MCPRequest, MCPResponse } from '../types/mcp';
import { v4 as uuidv4 } from 'uuid';

/**
 * AI Service wrapper that provides a simplified interface to the MCP server
 * This service bridges the gap between existing code and the new MCP architecture
 */
export class AIService {
  private mcpServer: MCPServer;
  
  constructor(mcpServer: MCPServer) {
    this.mcpServer = mcpServer;
  }
  
  /**
   * Send a chat message to the AI assistant
   */
  async chat(options: {
    message: string;
    userId: string;
    conversationId?: string;
    sessionId?: string;
    subject?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    metadata?: {
      ip_address?: string;
      user_agent?: string;
      user_role?: string;
    };
  }): Promise<{
    success: boolean;
    content?: string;
    error?: string;
    metadata?: {
      model_used?: string;
      tokens_used?: number;
      cost?: number;
      cached?: boolean;
    };
  }> {
    try {
      const request: MCPRequest = {
        id: uuidv4(),
        type: 'chat',
        user_id: options.userId,
        ...(options.conversationId && { conversation_id: options.conversationId }),
        priority: options.priority || 'normal',
        parameters: {
          message: options.message,
          session_id: options.sessionId,
          subject: options.subject
        },
        metadata: {
          timestamp: new Date().toISOString(),
          ...(options.sessionId && { session_id: options.sessionId }),
          ...(options.metadata?.user_role && { user_role: options.metadata.user_role }),
          ...(options.metadata?.ip_address && { ip_address: options.metadata.ip_address }),
          ...(options.metadata?.user_agent && { user_agent: options.metadata.user_agent })
        }
      };
      
      const response = await this.mcpServer.processRequest(request);
      
      if (response.success) {
        return {
          success: true,
          content: response.data?.content,
          metadata: {
            ...(response.metadata.model_used && { model_used: response.metadata.model_used }),
            ...(response.metadata.tokens_used !== undefined && { tokens_used: response.metadata.tokens_used }),
            ...(response.metadata.cost !== undefined && { cost: response.metadata.cost }),
            cached: response.metadata.cached
          }
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'AI request failed'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Generate educational material
   */
  async generateMaterial(options: {
    type: 'lesson_plan' | 'exercise' | 'test' | 'worksheet' | 'quiz';
    subject: string;
    topic: string;
    description: string;
    userId: string;
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    customInstructions?: string;
    questionCount?: number;
    includeAnswers?: boolean;
    systemPrompt?: string;
    metadata?: {
      ip_address?: string;
      user_agent?: string;
      user_role?: string;
    };
  }): Promise<{
    success: boolean;
    content?: string;
    error?: string;
    metadata?: {
      model_used?: string;
      tokens_used?: number;
      cost?: number;
      cached?: boolean;
    };
  }> {
    try {
      const request: MCPRequest = {
        id: uuidv4(),
        type: 'generation',
        user_id: options.userId,
        priority: 'normal',
        parameters: {
          material_type: options.type,
          subject: options.subject,
          topic: options.topic,
          description: options.description,
          difficulty_level: options.difficulty || 'intermediate',
          custom_instructions: options.customInstructions,
          question_count: options.questionCount,
          include_answers: options.includeAnswers,
          language: 'cs-CZ',
          ...(options.systemPrompt && { system_prompt: options.systemPrompt })
        },
        metadata: {
          timestamp: new Date().toISOString(),
          ...(options.metadata?.user_role && { user_role: options.metadata.user_role }),
          ...(options.metadata?.ip_address && { ip_address: options.metadata.ip_address }),
          ...(options.metadata?.user_agent && { user_agent: options.metadata.user_agent })
        }
      };
      
      const response = await this.mcpServer.processRequest(request);
      
      if (response.success) {
        return {
          success: true,
          content: response.data?.content || response.data?.generated_material,
          metadata: {
            ...(response.metadata.model_used && { model_used: response.metadata.model_used }),
            ...(response.metadata.tokens_used !== undefined && { tokens_used: response.metadata.tokens_used }),
            ...(response.metadata.cost !== undefined && { cost: response.metadata.cost }),
            cached: response.metadata.cached
          }
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Material generation failed'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Analyze content or assignments
   */
  async analyzeContent(options: {
    content: string;
    analysisType: 'assignment' | 'content_quality' | 'difficulty' | 'general';
    userId: string;
    subject?: string;
    metadata?: {
      ip_address?: string;
      user_agent?: string;
      user_role?: string;
    };
  }): Promise<{
    success: boolean;
    analysis?: string;
    error?: string;
    metadata?: {
      model_used?: string;
      tokens_used?: number;
      cost?: number;
      cached?: boolean;
    };
  }> {
    try {
      const request: MCPRequest = {
        id: uuidv4(),
        type: 'analysis',
        user_id: options.userId,
        priority: 'normal',
        parameters: {
          content: options.content,
          analysis_type: options.analysisType,
          subject: options.subject,
          language: 'cs-CZ'
        },
        metadata: {
          timestamp: new Date().toISOString(),
          ...(options.metadata?.user_role && { user_role: options.metadata.user_role }),
          ...(options.metadata?.ip_address && { ip_address: options.metadata.ip_address }),
          ...(options.metadata?.user_agent && { user_agent: options.metadata.user_agent })
        }
      };
      
      const response = await this.mcpServer.processRequest(request);
      
      if (response.success) {
        return {
          success: true,
          analysis: response.data?.analysis,
          metadata: {
            ...(response.metadata.model_used && { model_used: response.metadata.model_used }),
            ...(response.metadata.tokens_used !== undefined && { tokens_used: response.metadata.tokens_used }),
            ...(response.metadata.cost !== undefined && { cost: response.metadata.cost }),
            cached: response.metadata.cached
          }
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Content analysis failed'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Stream a chat response
   */
  async streamChat(
    options: {
      message: string;
      userId: string;
      conversationId?: string;
      sessionId?: string;
      subject?: string;
      priority?: 'low' | 'normal' | 'high' | 'urgent';
      metadata?: {
        ip_address?: string;
        user_agent?: string;
        user_role?: string;
      };
    },
    onChunk: (chunk: { content: string; finished: boolean }) => void
  ): Promise<{
    success: boolean;
    error?: string;
    metadata?: {
      model_used?: string;
      tokens_used?: number;
      cost?: number;
    };
  }> {
    try {
      const request: MCPRequest = {
        id: uuidv4(),
        type: 'chat',
        user_id: options.userId,
        ...(options.conversationId && { conversation_id: options.conversationId }),
        priority: options.priority || 'normal',
        parameters: {
          message: options.message,
          session_id: options.sessionId,
          subject: options.subject,
          real_time_required: true
        },
        metadata: {
          timestamp: new Date().toISOString(),
          ...(options.sessionId && { session_id: options.sessionId }),
          ...(options.metadata?.user_role && { user_role: options.metadata.user_role }),
          ...(options.metadata?.ip_address && { ip_address: options.metadata.ip_address }),
          ...(options.metadata?.user_agent && { user_agent: options.metadata.user_agent })
        }
      };
      
      const response = await this.mcpServer.processStreamingRequest(request, (chunk) => {
        onChunk({
          content: chunk.data,
          finished: chunk.finished
        });
      });
      
      if (response.success) {
        return {
          success: true,
          metadata: {
            ...(response.metadata.model_used && { model_used: response.metadata.model_used }),
            ...(response.metadata.tokens_used !== undefined && { tokens_used: response.metadata.tokens_used }),
            ...(response.metadata.cost !== undefined && { cost: response.metadata.cost })
          }
        };
      } else {
        return {
          success: false,
          error: response.error?.message || 'Streaming chat failed'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Unknown error occurred'
      };
    }
  }
  
  /**
   * Get MCP server analytics
   */
  async getAnalytics(startDate: Date, endDate: Date) {
    return await this.mcpServer.getAnalytics({ startDate, endDate });
  }
  
  /**
   * Get provider health status
   */
  async getProviderHealth() {
    return await this.mcpServer.getProviderHealth();
  }
}
