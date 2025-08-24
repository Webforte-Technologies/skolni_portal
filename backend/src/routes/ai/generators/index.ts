import { Router } from 'express';
import { MCPServer } from '../../../services/MCPServer';
import { AIService } from '../../../services/AIService';
import worksheetRoutes from './worksheet';
import lessonPlanRoutes from './lesson-plan';
import quizRoutes from './quiz';
import projectRoutes from './project';
import presentationRoutes from './presentation';
import activityRoutes from './activity';
import batchRoutes from './batch';

export function createGeneratorRoutes(mcpServer: MCPServer, aiService: AIService): Router {
  const router = Router();
  
  // Mount individual generator routes with AIService injection
  router.use('/', worksheetRoutes(aiService));
  router.use('/', lessonPlanRoutes(aiService));
  router.use('/', quizRoutes(aiService));
  router.use('/', projectRoutes(aiService));
  router.use('/', presentationRoutes(aiService));
  router.use('/', activityRoutes(aiService));
  router.use('/', batchRoutes(aiService));
  
  return router;
}

export default createGeneratorRoutes;
