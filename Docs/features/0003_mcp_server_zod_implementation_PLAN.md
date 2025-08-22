# Feature Plan: MCP Server Implementation with Zod Validation

## Brief Description

Implement a Model Context Protocol (MCP) server to abstract and enhance AI model interactions, replacing direct OpenAI API calls with a unified interface. Simultaneously migrate from express-validator to Zod for comprehensive type-safe validation across the entire backend. The MCP server will provide a foundation for future multi-model support, intelligent routing, caching, and enhanced error handling while maintaining the existing OpenAI-only approach.

## GPT-5 Models Integration

### Available GPT-5 Models:
- **gpt-5o** - Latest flagship model with enhanced reasoning and multimodal capabilities
- **gpt-5o-mini** - Faster, more cost-effective version for simpler tasks
- **gpt-5o-flash** - Ultra-fast model for real-time applications
- **gpt-5o-turbo** - Balanced performance and cost for general use cases

### Model Selection Strategy:
- **Complex Educational Content**: gpt-5o for advanced lesson planning, curriculum development
- **Real-time Chat**: gpt-5o-flash for immediate student interactions
- **Standard Tasks**: gpt-5o-turbo for general material generation
- **Simple Queries**: gpt-5o-mini for basic questions and explanations
- **Cost Optimization**: Automatic fallback to cheaper models when appropriate

### Enhanced Capabilities:
- **Multimodal Support**: gpt-5o can process images, diagrams, and mathematical notation
- **Improved Reasoning**: Better problem-solving for complex educational scenarios
- **Enhanced Context**: Longer context windows for comprehensive lesson planning
- **Real-time Processing**: gpt-5o-flash enables instant feedback for students

## Files and Functions to be Changed/Created

### Phase 1: Foundation & Type System

#### New Files to Create:
- `backend/src/services/MCPServer.ts` - Core MCP server implementation
- `backend/src/services/AIProvider.ts` - Abstract AI provider interface
- `backend/src/services/OpenAIProvider.ts` - OpenAI-specific provider implementation
- `backend/src/services/ModelRouter.ts` - Intelligent model selection logic
- `backend/src/services/ResponseCache.ts` - AI response caching service
- `backend/src/schemas/` - Directory for all Zod schemas
- `backend/src/schemas/auth.ts` - Authentication request/response schemas
- `backend/src/schemas/ai.ts` - AI generation request/response schemas
- `backend/src/schemas/conversations.ts` - Conversation and message schemas
- `backend/src/schemas/users.ts` - User management schemas
- `backend/src/schemas/common.ts` - Shared utility schemas
- `backend/src/middleware/zodValidation.ts` - Zod-based validation middleware
- `backend/src/types/mcp.ts` - MCP-specific type definitions

#### Database Changes:
- `backend/src/database/migrations/phase19_mcp_infrastructure.sql` - New tables for MCP
  - `ai_providers` table - Store AI provider configurations
  - `ai_requests` table - Log all AI requests for analytics
  - `ai_response_cache` table - Cache AI responses
  - `model_routing_rules` table - Rules for model selection
  - `gpt5_model_configs` table - GPT-5 specific model configurations and parameters
  - `model_performance_metrics` table - Track performance of different GPT-5 variants

#### Files to Modify:
- `backend/src/routes/ai.ts` - Replace OpenAI calls with MCP server
- `backend/src/routes/auth.ts` - Replace express-validator with Zod
- `backend/src/routes/conversations.ts` - Replace express-validator with Zod
- `backend/src/routes/users.ts` - Replace express-validator with Zod
- `backend/src/routes/schools.ts` - Replace express-validator with Zod
- `backend/src/index.ts` - Initialize MCP server
- `backend/package.json` - Add zod dependency, remove express-validator

### Phase 2A: MCP Server Core Implementation

#### MCPServer Class Algorithm:
1. **Initialization**: Load AI provider configurations from database
2. **Request Processing**: 
   - Validate request using Zod schemas
   - Route to appropriate AI provider based on rules
   - Apply rate limiting per provider
   - Check cache for existing responses
3. **Response Handling**:
   - Stream responses from AI provider
   - Cache successful responses
   - Log request/response for analytics
   - Handle provider-specific errors with fallbacks

#### Key Methods:
- `MCPServer.initialize()` - Load providers and routing rules
- `MCPServer.processRequest(request: AIRequest)` - Main request handler
- `MCPServer.routeToProvider(request: AIRequest)` - Model selection logic
- `MCPServer.handleStreaming(provider, request)` - Streaming response handler
- `MCPServer.cacheResponse(request, response)` - Cache management

### Phase 2B: Zod Schema Migration

#### Current express-validator patterns to replace:
- `backend/src/routes/ai.ts:256-259` - Chat message validation
- `backend/src/routes/ai.ts:806-818` - Lesson plan validation
- `backend/src/routes/auth.ts:12-17` - Registration validation
- `backend/src/routes/auth.ts:19-22` - Login validation
- `backend/src/routes/conversations.ts:10-18` - Conversation validation

#### Zod Schema Structure:
```typescript
// Example schema structure (not actual code)
export const ChatMessageSchema = z.object({
  message: z.string().min(1).max(2000).trim(),
  session_id: z.string().uuid().optional(),
  conversation_id: z.string().uuid().optional()
});
```

### Phase 3: Integration & Enhancement

#### Files to Enhance:
- `backend/src/services/AssignmentAnalyzer.ts` - Use MCP for analysis
- `backend/src/services/EnhancedPromptBuilder.ts` - Provider-aware prompts
- `backend/src/services/ContentValidator.ts` - Multi-model validation capability
- `backend/src/services/MaterialGenerationService.ts` - Route through MCP

#### New Analytics Features:
- `backend/src/routes/admin/mcp-analytics.ts` - MCP performance metrics
- `backend/src/services/MCPAnalytics.ts` - Usage tracking and optimization
- `backend/src/services/ModelPerformanceTracker.ts` - GPT-5 model performance comparison
- `backend/src/services/CostOptimizationService.ts` - Model cost analysis and recommendations

#### GPT-5 Specific Implementation:
- `backend/src/services/GPT5ModelManager.ts` - GPT-5 model configuration and management
- `backend/src/services/MultimodalProcessor.ts` - Handle image and diagram processing for gpt-5o
- `backend/src/services/RealTimeOptimizer.ts` - Optimize gpt-5o-flash for instant responses
- `backend/src/schemas/gpt5.ts` - GPT-5 specific request/response schemas

## Algorithms

### Model Routing Algorithm:
1. **Request Analysis**: Extract request type, complexity, and user context
2. **Rule Evaluation**: Check database routing rules in priority order
3. **Provider Selection**: Choose optimal AI provider based on:
   - Request complexity (simple tasks → gpt-5o-mini, complex → gpt-5o)
   - Real-time requirements (instant feedback → gpt-5o-flash)
   - Cost optimization preferences (balanced → gpt-5o-turbo)
   - Multimodal content needs (images/diagrams → gpt-5o)
   - Provider availability and rate limits
   - Historical performance data
4. **Fallback Logic**: If primary provider fails, route to backup provider
5. **Model-Specific Optimization**: Apply model-specific prompt engineering and parameters

### Caching Strategy:
1. **Cache Key Generation**: Hash of normalized request parameters
2. **Cache Lookup**: Check for existing response within TTL
3. **Cache Storage**: Store successful responses with metadata
4. **Cache Invalidation**: Remove stale entries based on content type and age

### Zod Validation Pipeline:
1. **Schema Selection**: Choose appropriate schema based on endpoint
2. **Request Validation**: Parse and validate request body/params
3. **Transform Data**: Apply Zod transforms for data normalization
4. **Error Handling**: Return structured validation errors
5. **Type Safety**: Pass validated data with full type inference

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
1. Create Zod schemas for all existing validation patterns
2. Implement zodValidation middleware
3. Create MCP type definitions and interfaces
4. Set up database schema for MCP infrastructure

### Phase 2A: MCP Server Core (Week 2-3)
1. Implement MCPServer base class
2. Create OpenAIProvider implementation with GPT-5 model support
3. Implement intelligent model routing logic for GPT-5 variants
4. Add response caching functionality
5. Configure model-specific parameters and prompt engineering

### Phase 2B: Zod Migration (Week 2-3) - Parallel to 2A
1. Replace express-validator in auth routes
2. Replace express-validator in AI routes
3. Replace express-validator in conversation routes
4. Replace express-validator in remaining routes

### Phase 3: Integration (Week 4)
1. Integrate MCP server into existing AI routes
2. Update all AI-related services to use MCP
3. Implement MCP analytics and monitoring
4. Add comprehensive error handling and logging

### Phase 4: Testing & Optimization (Week 5)
1. Update all existing tests for Zod validation
2. Add MCP-specific unit and integration tests
3. Performance testing and optimization
4. Documentation and deployment preparation

## Technical Benefits

### MCP Server Benefits:
- **Abstraction**: Clean separation between business logic and AI providers
- **Scalability**: Easy to add new AI providers in the future
- **Reliability**: Built-in fallback mechanisms and error handling
- **Analytics**: Comprehensive usage tracking and performance metrics
- **Caching**: Intelligent response caching for cost optimization
- **Consistency**: Unified interface for all AI interactions

### Zod Migration Benefits:
- **Type Safety**: Full TypeScript integration with automatic type inference
- **Runtime Safety**: Schema validation catches runtime type errors
- **Better DX**: Superior IntelliSense and debugging experience
- **Consistency**: Single validation library across the entire codebase
- **Maintainability**: Co-located schemas with type definitions
- **Performance**: Faster validation compared to express-validator

### GPT-5 Integration Benefits:
- **Enhanced Educational Content**: Better reasoning for complex educational scenarios
- **Real-time Interactions**: Ultra-fast responses for student engagement
- **Multimodal Learning**: Support for images, diagrams, and mathematical notation
- **Cost Optimization**: Intelligent model selection based on task complexity
- **Future-Proof Architecture**: Easy integration of new GPT-5 variants
- **Performance Monitoring**: Detailed analytics for model performance comparison

## Dependencies

- `zod` - Schema validation library
- `@types/node` - Updated for proper typing
- Current OpenAI library remains unchanged
- PostgreSQL for MCP infrastructure tables
- Existing Express.js middleware pattern compatibility
