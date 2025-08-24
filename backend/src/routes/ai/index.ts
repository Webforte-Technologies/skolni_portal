import { Router } from 'express';
import { MCPServer } from '../../services/MCPServer';
import { AIService } from '../../services/AIService';
import chatRoutes from './chat';
import statisticsRoutes from './statistics';
import analysisRoutes from './analysis';
import generatorRoutes from './generators';

/**
 * Factory function to create AI routes with MCP server
 */
export function createAIRoutes(mcpServer: MCPServer): Router {
  const router = Router();
  
  // Create AIService instance
  const aiService = new AIService(mcpServer);
  
  // Mount sub-routers with AIService injection
  router.use('/', chatRoutes(aiService));
  router.use('/', statisticsRoutes);
  router.use('/', analysisRoutes(aiService));
  router.use('/', generatorRoutes(mcpServer, aiService));
  
  return router;
}

// Create a default export for backward compatibility (without MCP server)
// This should be replaced with the factory function usage
export default createAIRoutes;
