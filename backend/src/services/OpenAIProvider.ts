import OpenAI from 'openai';
import { AIProvider } from './AIProvider';
import { MCPRequest, MCPResponse, StreamingResponse, GPT5_MODEL_CONFIGS } from '../types/mcp';

/**
 * OpenAI provider implementation for the MCP server
 * Supports GPT-4 models with intelligent routing and optimization
 */
export class OpenAIProvider extends AIProvider {
  readonly name = 'OpenAI';
  readonly type = 'openai';
  readonly models = ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4'];
  
  private openai: OpenAI;
  private rateLimitInfo: {
    requestsRemaining: number;
    tokensRemaining?: number;
    resetTime: Date;
  };
  
  constructor(config: {
    apiKey: string;
    baseUrl?: string;
    timeout?: number;
  }) {
    super(config);
    
    this.openai = new OpenAI({
      apiKey: this.apiKey,
      baseURL: this.baseUrl,
      timeout: this.timeout
    });
    
    // Initialize rate limit info
    this.rateLimitInfo = {
      requestsRemaining: 100,
      tokensRemaining: 200000,
      resetTime: new Date(Date.now() + 60000) // 1 minute from now
    };
  }
  
  async processRequest(request: MCPRequest): Promise<MCPResponse> {
    const startTime = Date.now();
    
    // Validate the request
    const validation = this.validateRequest(request);
    if (!validation.valid) {
      return this.createErrorResponse(request, validation.error!, 'VALIDATION_ERROR');
    }
    
    try {
      // Determine the model to use
      const model = this.selectOptimalModel(request);
      
      // Check rate limits
      if (this.rateLimitInfo.requestsRemaining <= 0) {
        const retryAfter = Math.ceil((this.rateLimitInfo.resetTime.getTime() - Date.now()) / 1000);
        return this.createErrorResponse(
          request,
          'Rate limit exceeded',
          'RATE_LIMIT_EXCEEDED',
          retryAfter
        );
      }
      
      // Process the request based on type
      let response: any;
      let tokensUsed = 0;
      
      switch (request.type) {
        case 'chat': {
          const chatResult = await this.processChatRequest(request, model);
          response = chatResult.response;
          tokensUsed = chatResult.tokensUsed;
          break;
        }
          
        case 'generation': {
          const genResult = await this.processGenerationRequest(request, model);
          response = genResult.response;
          tokensUsed = genResult.tokensUsed;
          break;
        }
          
        case 'analysis': {
          const analysisResult = await this.processAnalysisRequest(request, model);
          response = analysisResult.response;
          tokensUsed = analysisResult.tokensUsed;
          break;
        }
          
        default:
          return this.createErrorResponse(
            request,
            `Unsupported request type: ${request.type}`,
            'UNSUPPORTED_REQUEST_TYPE'
          );
      }
      
      const processingTime = Date.now() - startTime;
      const cost = this.calculateCost(request, tokensUsed);
      
      // Update rate limit info (simulated - in real implementation, get from headers)
      this.rateLimitInfo.requestsRemaining--;
      this.rateLimitInfo.tokensRemaining = Math.max(0, (this.rateLimitInfo.tokensRemaining || 0) - tokensUsed);
      
      return this.createSuccessResponse(request, response, {
        model_used: model,
        tokens_used: tokensUsed,
        processing_time_ms: processingTime,
        cost
      });
      
    } catch (error: any) {
      const _processingTime = Date.now() - startTime;
      
      // Handle specific OpenAI errors
      if (error.status === 429) {
        return this.createErrorResponse(
          request,
          'Rate limit exceeded',
          'RATE_LIMIT_EXCEEDED',
          60
        );
      }
      
      if (error.status === 401) {
        return this.createErrorResponse(
          request,
          'Invalid API key',
          'AUTHENTICATION_ERROR'
        );
      }
      
      if (error.status >= 500) {
        return this.createErrorResponse(
          request,
          'OpenAI service unavailable',
          'SERVICE_UNAVAILABLE',
          30
        );
      }
      
      return this.createErrorResponse(
        request,
        error.message || 'Unknown error occurred',
        'PROVIDER_ERROR'
      );
    }
  }
  
  async processStreamingRequest(
    request: MCPRequest,
    onChunk: (chunk: StreamingResponse) => void
  ): Promise<MCPResponse> {
    const startTime = Date.now();
    
    try {
      const model = this.selectOptimalModel(request);
      const messages = this.buildMessages(request);
      const modelConfig = GPT5_MODEL_CONFIGS[model];
      
      const stream = await this.openai.chat.completions.create({
        model,
        messages,
        max_tokens: Math.min(request.parameters['max_tokens'] || modelConfig?.max_tokens || 4096, modelConfig?.max_tokens || 4096),
        temperature: request.parameters['temperature'] || modelConfig?.default_temperature || 0.7,
        stream: true
      });
      
      let fullResponse = '';
      let tokensUsed = 0;
      let chunkIndex = 0;
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          fullResponse += content;
          tokensUsed += this.estimateTokens(content);
          
          onChunk({
            id: crypto.randomUUID(),
            request_id: request.id,
            chunk_index: chunkIndex++,
            data: content,
            finished: false,
            metadata: {
              tokens_generated: tokensUsed
            }
          });
        }
      }
      
      // Send final chunk
      onChunk({
        id: crypto.randomUUID(),
        request_id: request.id,
        chunk_index: chunkIndex,
        data: '',
        finished: true,
        metadata: {
          tokens_generated: tokensUsed,
          processing_time_ms: Date.now() - startTime
        }
      });
      
      const processingTime = Date.now() - startTime;
      const cost = this.calculateCost(request, tokensUsed);
      
      return this.createSuccessResponse(request, { content: fullResponse }, {
        model_used: model,
        tokens_used: tokensUsed,
        processing_time_ms: processingTime,
        cost
      });
      
    } catch (error: any) {
      return this.createErrorResponse(
        request,
        error.message || 'Streaming request failed',
        'STREAMING_ERROR'
      );
    }
  }
  
  async healthCheck(): Promise<{ healthy: boolean; responseTime: number; error?: string }> {
    const startTime = Date.now();
    
    try {
      // Simple health check with a minimal request
      await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 1
      });
      
      return {
        healthy: true,
        responseTime: Date.now() - startTime
      };
    } catch (error: any) {
      return {
        healthy: false,
        responseTime: Date.now() - startTime,
        error: error.message
      };
    }
  }
  
  async getRateLimitStatus() {
    return this.rateLimitInfo;
  }
  
  calculateCost(request: MCPRequest, tokensUsed: number): number {
    // Simplified cost calculation - in real implementation, use actual OpenAI pricing
    const baseCostPerToken = 0.00001; // $0.00001 per token (example)
    return tokensUsed * baseCostPerToken;
  }
  
  getModelCapabilities(model: string) {
    const config = GPT5_MODEL_CONFIGS[model];
    if (!config) {
      throw new Error(`Model ${model} not supported`);
    }
    
    return {
      maxTokens: config.max_tokens,
      contextWindow: config.context_window,
      supportsStreaming: true,
      supportsMultimodal: config.supports_multimodal,
      supportsFunctionCalling: true
    };
  }
  
  /**
   * Select the optimal GPT-4 model based on request characteristics
   */
  private selectOptimalModel(request: MCPRequest): string {
    // If model preference is specified and supported, use it
    if (request.model_preference && this.isModelSupported(request.model_preference)) {
      return request.model_preference;
    }
    
    const params = request.parameters;
    
    // Real-time requirements -> gpt-4o-mini
    if (params['real_time_required'] || request.priority === 'urgent') {
      return 'gpt-4o-mini';
    }
    
    // Multimodal content -> gpt-4o
    if (params['multimodal_content'] || params['image_analysis']) {
      return 'gpt-4o';
    }
    
    // Complex tasks -> gpt-4o
    if (params['complexity'] === 'complex' || request.type === 'analysis') {
      return 'gpt-4o';
    }
    
    // Chat requests -> gpt-4o-mini (fast real-time responses)
    if (request.type === 'chat') {
      return 'gpt-4o-mini';
    }
    
    // Simple tasks -> gpt-4o-mini
    if (params['complexity'] === 'simple') {
      return 'gpt-4o-mini';
    }
    
    // Default balanced option
    return 'gpt-4-turbo';
  }
  
  /**
   * Process chat requests
   */
  private async processChatRequest(request: MCPRequest, model: string) {
    const messages = this.buildMessages(request);
    const modelConfig = GPT5_MODEL_CONFIGS[model];
    
    const completion = await this.openai.chat.completions.create({
      model,
      messages,
      max_tokens: Math.min(request.parameters['max_tokens'] || modelConfig?.max_tokens || 4096, modelConfig?.max_tokens || 4096),
      temperature: request.parameters['temperature'] || modelConfig?.default_temperature || 0.7
    });
    
    const response = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || this.estimateTokens(response);
    
    return {
      response: { content: response },
      tokensUsed
    };
  }
  
  /**
   * Process generation requests (lesson plans, exercises, etc.)
   */
  private async processGenerationRequest(request: MCPRequest, model: string) {
    const messages = this.buildGenerationMessages(request);
    const modelConfig = GPT5_MODEL_CONFIGS[model];
    
    const completion = await this.openai.chat.completions.create({
      model,
      messages,
      max_tokens: Math.min(request.parameters['max_tokens'] || modelConfig?.max_tokens || 4096, modelConfig?.max_tokens || 4096),
      temperature: request.parameters['temperature'] || modelConfig?.default_temperature || 0.7
    });
    
    const response = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || this.estimateTokens(response);
    
    return {
      response: { content: response, generated_material: response },
      tokensUsed
    };
  }
  
  /**
   * Process analysis requests
   */
  private async processAnalysisRequest(request: MCPRequest, model: string) {
    const messages = this.buildAnalysisMessages(request);
    const modelConfig = GPT5_MODEL_CONFIGS[model];
    
    const completion = await this.openai.chat.completions.create({
      model,
      messages,
      max_tokens: Math.min(request.parameters['max_tokens'] || modelConfig?.max_tokens || 4096, modelConfig?.max_tokens || 4096),
      temperature: request.parameters['temperature'] || modelConfig?.default_temperature || 0.7
    });
    
    const response = completion.choices[0]?.message?.content || '';
    const tokensUsed = completion.usage?.total_tokens || this.estimateTokens(response);
    
    return {
      response: { analysis: response },
      tokensUsed
    };
  }
  
  /**
   * Build messages array for chat requests
   */
  private buildMessages(request: MCPRequest): any[] {
    const messages = [];
    
    if (request.parameters['system_prompt']) {
      messages.push({
        role: 'system',
        content: request.parameters['system_prompt']
      });
    }
    
    if (request.parameters['message']) {
      messages.push({
        role: 'user',
        content: request.parameters['message']
      });
    }
    
    if (request.parameters['conversation_history']) {
      messages.unshift(...request.parameters['conversation_history']);
    }
    
    return messages;
  }
  
  /**
   * Build messages for generation requests
   */
  private buildGenerationMessages(request: MCPRequest): any[] {
    const params = request.parameters;
    const systemPrompt = params['system_prompt'] || this.buildGenerationSystemPrompt(params);
    
    return [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: params['description'] || params['topic'] }
    ];
  }
  
  /**
   * Build messages for analysis requests
   */
  private buildAnalysisMessages(request: MCPRequest): any[] {
    const params = request.parameters;
    
    return [
      {
        role: 'system',
        content: 'You are an educational content analyst. Analyze the provided content and provide detailed insights.'
      },
      {
        role: 'user',
        content: params['content'] || params['text']
      }
    ];
  }
  
  /**
   * Build system prompt for generation requests
   */
  private buildGenerationSystemPrompt(params: any): string {
    let prompt = 'You are an AI assistant specialized in creating educational content for Czech schools and teachers.';
    
    if (params.subject) {
      prompt += ` You are creating content for ${params.subject}.`;
    }
    
    if (params.material_type) {
      prompt += ` Generate a ${params.material_type}.`;
    }
    
    if (params.difficulty_level) {
      prompt += ` The difficulty level should be ${params.difficulty_level}.`;
    }
    
    if (params.target_audience) {
      prompt += ` Target audience: ${params.target_audience}.`;
    }
    
    prompt += ' Always respond in Czech language. Be thorough, accurate, and pedagogically sound.';
    
    if (params.custom_instructions) {
      prompt += ` Additional instructions: ${params.custom_instructions}`;
    }
    
    return prompt;
  }
  
  /**
   * Estimate token count for text (simplified)
   */
  private estimateTokens(text: string): number {
    // Rough estimation: 1 token ≈ 4 characters for Czech text
    return Math.ceil(text.length / 4);
  }
}
