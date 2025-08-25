import { Pool } from 'pg';
import { MCPRequest, ModelRoutingRule, AIProviderConfig } from '../types/mcp';

/**
 * Intelligent model routing service
 * Selects the optimal AI provider and model based on request characteristics and routing rules
 */
export class ModelRouter {
  private db: Pool;
  private routingRules: ModelRoutingRule[] = [];
  private providers: AIProviderConfig[] = [];
  private lastRulesUpdate = 0;
  private lastProvidersUpdate = 0;
  private cacheTimeout = 300000; // 5 minutes
  
  constructor(database: Pool) {
    this.db = database;
  }
  
  /**
   * Route a request to the optimal provider and model
   */
  async routeRequest(request: MCPRequest): Promise<{
    provider: AIProviderConfig;
    model: string;
    reasoning: string;
  }> {
    await this.refreshCacheIfNeeded();
    
    // Apply routing rules in priority order
    const matchingRule = await this.findMatchingRule(request);
    
    if (matchingRule) {
      const provider = this.providers.find(p => p.id === matchingRule.provider_id);
      if (provider && provider.enabled) {
        return {
          provider,
          model: matchingRule.target_model,
          reasoning: `Matched routing rule: ${matchingRule.name}`
        };
      }
    }
    
    // Fallback to default provider selection
    const fallbackResult = await this.selectFallbackProvider(request);
    
    if (!fallbackResult) {
      throw new Error('No suitable provider available');
    }
    
    return fallbackResult;
  }
  
  /**
   * Get all available providers with their health status
   */
  async getAvailableProviders(): Promise<{
    provider: AIProviderConfig;
    healthy: boolean;
    models: string[];
  }[]> {
    await this.refreshCacheIfNeeded();
    
    const healthStatuses = await this.getProviderHealthStatuses();
    
    return this.providers
      .filter(p => p.enabled)
      .map(provider => ({
        provider,
        healthy: healthStatuses[provider.id]?.healthy || false,
        models: provider.models
      }));
  }
  
  /**
   * Add or update a routing rule
   */
  async upsertRoutingRule(rule: Omit<ModelRoutingRule, 'id'>): Promise<string> {
    const query = `
      INSERT INTO model_routing_rules (name, priority, enabled, conditions, target_model, provider_id, description)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (name) DO UPDATE SET
        priority = EXCLUDED.priority,
        enabled = EXCLUDED.enabled,
        conditions = EXCLUDED.conditions,
        target_model = EXCLUDED.target_model,
        provider_id = EXCLUDED.provider_id,
        description = EXCLUDED.description,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id
    `;
    
    const result = await this.db.query(query, [
      rule.name,
      rule.priority,
      rule.enabled,
      JSON.stringify(rule.conditions),
      rule.target_model,
      rule.provider_id,
      rule.description ?? null
    ]);
    
    // Invalidate cache
    this.lastRulesUpdate = 0;
    
    return result.rows[0].id;
  }
  
  /**
   * Delete a routing rule
   */
  async deleteRoutingRule(ruleId: string): Promise<boolean> {
    const query = 'DELETE FROM model_routing_rules WHERE id = $1';
    const result = await this.db.query(query, [ruleId]);
    
    // Invalidate cache
    this.lastRulesUpdate = 0;
    
    return (result.rowCount ?? 0) > 0;
  }
  
  /**
   * Get routing rules with optional filtering
   */
  async getRoutingRules(filters: {
    enabled?: boolean;
    provider_id?: string;
  } = {}): Promise<ModelRoutingRule[]> {
    let query = 'SELECT * FROM model_routing_rules';
    const conditions = [];
    const values = [];
    let paramIndex = 1;
    
    if (filters.enabled !== undefined) {
      conditions.push(`enabled = $${paramIndex++}`);
      values.push(filters.enabled);
    }
    
    if (filters.provider_id) {
      conditions.push(`provider_id = $${paramIndex++}`);
      values.push(filters.provider_id);
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += ' ORDER BY priority DESC, created_at ASC';
    
    const result = await this.db.query(query, values);
    return result.rows;
  }
  
  /**
   * Refresh cached data if needed
   */
  private async refreshCacheIfNeeded(): Promise<void> {
    const now = Date.now();
    
    if (now - this.lastRulesUpdate > this.cacheTimeout) {
      await this.loadRoutingRules();
      this.lastRulesUpdate = now;
    }
    
    if (now - this.lastProvidersUpdate > this.cacheTimeout) {
      await this.loadProviders();
      this.lastProvidersUpdate = now;
    }
  }
  
  /**
   * Load routing rules from database
   */
  private async loadRoutingRules(): Promise<void> {
    try {
      const query = `
        SELECT * FROM model_routing_rules 
        WHERE enabled = true 
        ORDER BY priority DESC, created_at ASC
      `;
      
      const result = await this.db.query(query);
      this.routingRules = result.rows;
    } catch (error: any) {
      // If the model_routing_rules table doesn't exist yet, use empty array
      if (error.code === '42P01') { // relation does not exist
        this.routingRules = [];
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Load providers from database
   */
  private async loadProviders(): Promise<void> {
    try {
      const query = `
        SELECT * FROM ai_providers 
        WHERE enabled = true 
        ORDER BY priority DESC, created_at ASC
      `;
      
      const result = await this.db.query(query);
      this.providers = result.rows;
    } catch (error: any) {
      // If the ai_providers table doesn't exist yet, use empty array
      if (error.code === '42P01') { // relation does not exist
        this.providers = [];
      } else {
        throw error;
      }
    }
  }
  
  /**
   * Find the first matching routing rule for a request
   */
  private async findMatchingRule(request: MCPRequest): Promise<ModelRoutingRule | null> {
    for (const rule of this.routingRules) {
      if (await this.ruleMatches(rule, request)) {
        return rule;
      }
    }
    return null;
  }
  
  /**
   * Check if a routing rule matches a request
   */
  private async ruleMatches(rule: ModelRoutingRule, request: MCPRequest): Promise<boolean> {
    const conditions = rule.conditions;
    
    // Check request type
    if (conditions.request_type && conditions.request_type.length > 0) {
      if (!conditions.request_type.includes(request.type)) {
        return false;
      }
    }
    
    // Check subject
    if (conditions.subject && conditions.subject.length > 0) {
      const requestSubject = request.parameters['subject'];
      if (!requestSubject || !conditions.subject.includes(requestSubject)) {
        return false;
      }
    }
    
    // Check complexity
    if (conditions.complexity && conditions.complexity.length > 0) {
      const requestComplexity = this.determineComplexity(request);
      if (!conditions.complexity.includes(requestComplexity)) {
        return false;
      }
    }
    
    // Check real-time requirement
    if (conditions.real_time_required !== undefined) {
      const isRealTime = request.priority === 'urgent' || 
                        request.parameters['real_time_required'] === true;
      if (conditions.real_time_required !== isRealTime) {
        return false;
      }
    }
    
    // Check multimodal content
    if (conditions.multimodal_content !== undefined) {
      const hasMultimodal = request.parameters['multimodal_content'] === true ||
                           request.parameters['image_analysis'] === true ||
                           request.parameters['file_attachments']?.length > 0;
      if (conditions.multimodal_content !== hasMultimodal) {
        return false;
      }
    }
    
    // Check user role
    if (conditions.user_role && conditions.user_role.length > 0) {
      const userRole = request.metadata.user_role;
      if (!userRole || !conditions.user_role.includes(userRole)) {
        return false;
      }
    }
    
    // Check token limits
    if (conditions.token_limit) {
      const estimatedTokens = this.estimateRequestTokens(request);
      
      if (conditions.token_limit.min && estimatedTokens < conditions.token_limit.min) {
        return false;
      }
      
      if (conditions.token_limit.max && estimatedTokens > conditions.token_limit.max) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Determine request complexity based on parameters
   */
  private determineComplexity(request: MCPRequest): 'simple' | 'medium' | 'complex' {
    // Explicit complexity parameter
    if (request.parameters['complexity']) {
      return request.parameters['complexity'];
    }
    
    // Analyze request characteristics
    const params = request.parameters;
    let complexityScore = 0;
    
    // Request type complexity
    if (request.type === 'analysis') complexityScore += 2;
    if (request.type === 'generation') complexityScore += 1;
    
    // Content complexity indicators
    if (params['multimodal_content']) complexityScore += 2;
    if (params['custom_instructions']?.length > 100) complexityScore += 1;
    if (params['material_type'] === 'lesson_plan') complexityScore += 2;
    if (params['difficulty_level'] === 'advanced') complexityScore += 1;
    
    // Text length complexity
    const textLength = (params['message'] || params['description'] || '').length;
    if (textLength > 1000) complexityScore += 2;
    else if (textLength > 500) complexityScore += 1;
    
    // Determine final complexity
    if (complexityScore >= 4) return 'complex';
    if (complexityScore >= 2) return 'medium';
    return 'simple';
  }
  
  /**
   * Estimate token usage for a request
   */
  private estimateRequestTokens(request: MCPRequest): number {
    const params = request.parameters;
    let tokenCount = 0;
    
    // Base prompt tokens
    tokenCount += 100;
    
    // Message/content tokens
    if (params['message']) tokenCount += Math.ceil(params['message'].length / 4);
    if (params['description']) tokenCount += Math.ceil(params['description'].length / 4);
    if (params['content']) tokenCount += Math.ceil(params['content'].length / 4);
    
    // Conversation history
    if (params['conversation_history']?.length) {
      tokenCount += params['conversation_history'].reduce((sum: number, msg: any) => {
        return sum + Math.ceil((msg.content || '').length / 4);
      }, 0);
    }
    
    // Expected response tokens
    const maxTokens = params['max_tokens'] || 1000;
    tokenCount += maxTokens;
    
    return tokenCount;
  }
  
  /**
   * Select fallback provider when no routing rule matches
   */
  private async selectFallbackProvider(request: MCPRequest): Promise<{
    provider: AIProviderConfig;
    model: string;
    reasoning: string;
  } | null> {
    const healthStatuses = await this.getProviderHealthStatuses();
    
    // Find healthy providers, sorted by priority
    const healthyProviders = this.providers
      .filter(p => p.enabled && healthStatuses[p.id]?.healthy !== false)
      .sort((a, b) => b.priority - a.priority);
    
    if (healthyProviders.length === 0) {
      return null;
    }
    
    // Use the highest priority healthy provider
    const provider = healthyProviders[0];
    if (!provider) {
      return null;
    }
    
    // Select model based on request type and complexity
    const model = this.selectModelForProvider(provider, request);
    
    return {
      provider,
      model,
      reasoning: 'Fallback to highest priority healthy provider'
    };
  }
  
  /**
   * Select the best model for a provider based on request characteristics
   */
  private selectModelForProvider(provider: AIProviderConfig, request: MCPRequest): string {
    const availableModels = provider.models;
    
    // For OpenAI GPT-4 models, use intelligent selection
    if (provider.type === 'openai' && availableModels.some(m => m.startsWith('gpt-4'))) {
      const complexity = this.determineComplexity(request);
      const isRealTime = request.priority === 'urgent' || request.parameters['real_time_required'];
      const hasMultimodal = request.parameters['multimodal_content'] || request.parameters['image_analysis'];
      
      if (isRealTime && availableModels.includes('gpt-4o-mini')) {
        return 'gpt-4o-mini';
      }
      
      if (hasMultimodal && availableModels.includes('gpt-4o')) {
        return 'gpt-4o';
      }
      
      if (complexity === 'complex' && availableModels.includes('gpt-4o')) {
        return 'gpt-4o';
      }
      
      if (complexity === 'simple' && availableModels.includes('gpt-4o-mini')) {
        return 'gpt-4o-mini';
      }
      
      if (availableModels.includes('gpt-4-turbo')) {
        return 'gpt-4-turbo';
      }
    }
    
    // Default to first available model
    return availableModels[0] || 'gpt-4-turbo';
  }
  
  /**
   * Get provider health statuses
   */
  private async getProviderHealthStatuses(): Promise<Record<string, { healthy: boolean }>> {
    try {
      const query = `
        SELECT DISTINCT ON (provider_id) 
          provider_id, 
          status 
        FROM provider_health_status 
        ORDER BY provider_id, check_timestamp DESC
      `;
      
      const result = await this.db.query(query);
      
      const statuses: Record<string, { healthy: boolean }> = {};
      result.rows.forEach(row => {
        statuses[row.provider_id] = {
          healthy: row.status === 'healthy'
        };
      });
      
      return statuses;
    } catch (error: any) {
      // If the provider_health_status table doesn't exist yet, return empty object
      if (error.code === '42P01') { // relation does not exist
        return {};
      } else {
        throw error;
      }
    }
  }
}
