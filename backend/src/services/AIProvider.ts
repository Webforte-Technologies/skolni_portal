import { MCPRequest, MCPResponse, StreamingResponse } from '../types/mcp';

/**
 * Abstract base class for AI providers
 * Defines the interface that all AI providers must implement
 */
export abstract class AIProvider {
  abstract readonly name: string;
  abstract readonly type: string;
  abstract readonly models: string[];
  
  protected apiKey: string;
  protected baseUrl?: string;
  protected timeout: number;
  
  constructor(config: {
    apiKey: string;
    baseUrl?: string;
    timeout?: number;
  }) {
    this.apiKey = config.apiKey;
    if (config.baseUrl !== undefined) {
      this.baseUrl = config.baseUrl;
    }
    this.timeout = config.timeout || 30000;
  }
  
  /**
   * Process a request and return a response
   */
  abstract processRequest(request: MCPRequest): Promise<MCPResponse>;
  
  /**
   * Process a request with streaming response
   */
  abstract processStreamingRequest(
    request: MCPRequest,
    onChunk: (chunk: StreamingResponse) => void
  ): Promise<MCPResponse>;
  
  /**
   * Check if the provider is healthy and available
   */
  abstract healthCheck(): Promise<{
    healthy: boolean;
    responseTime: number;
    error?: string;
  }>;
  
  /**
   * Get the current rate limit status
   */
  abstract getRateLimitStatus(): Promise<{
    requestsRemaining: number;
    tokensRemaining?: number;
    resetTime: Date;
  }>;
  
  /**
   * Calculate the cost for a request
   */
  abstract calculateCost(request: MCPRequest, tokensUsed: number): number;
  
  /**
   * Check if a model is supported by this provider
   */
  isModelSupported(model: string): boolean {
    return this.models.includes(model);
  }
  
  /**
   * Get model capabilities and limitations
   */
  abstract getModelCapabilities(model: string): {
    maxTokens: number;
    contextWindow: number;
    supportsStreaming: boolean;
    supportsMultimodal: boolean;
    supportsFunctionCalling: boolean;
  };
  
  /**
   * Validate a request before processing
   */
  protected validateRequest(request: MCPRequest): { valid: boolean; error?: string } {
    if (!request.id) {
      return { valid: false, error: 'Request ID is required' };
    }
    
    if (!request.user_id) {
      return { valid: false, error: 'User ID is required' };
    }
    
    if (!request.parameters) {
      return { valid: false, error: 'Request parameters are required' };
    }
    
    return { valid: true };
  }
  
  /**
   * Create a standardized error response
   */
  protected createErrorResponse(
    request: MCPRequest,
    error: string,
    code: string = 'PROVIDER_ERROR',
    retryAfter?: number
  ): MCPResponse {
    return {
      id: crypto.randomUUID(),
      request_id: request.id,
      success: false,
      error: {
        code,
        message: error,
        ...(retryAfter !== undefined && { retry_after: retryAfter })
      },
      metadata: {
        processing_time_ms: 0,
        cached: false,
        provider_used: this.name
      },
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * Create a successful response
   */
  protected createSuccessResponse(
    request: MCPRequest,
    data: any,
    metadata: {
      model_used: string;
      tokens_used: number;
      processing_time_ms: number;
      cost?: number;
    }
  ): MCPResponse {
    return {
      id: crypto.randomUUID(),
      request_id: request.id,
      success: true,
      data,
      metadata: {
        ...metadata,
        cached: false,
        provider_used: this.name
      },
      timestamp: new Date().toISOString()
    };
  }
}
