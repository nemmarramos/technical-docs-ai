/**
 * Route definitions
 * Maps HTTP endpoints to controller actions
 */

import { Router } from 'express';
import { QAController } from '../controllers/qa.controller.js';
import { ConversationController } from '../controllers/conversation.controller.js';
import { AnalyticsController } from '../controllers/analytics.controller.js';
import { HealthController } from '../controllers/health.controller.js';

export interface RouteControllers {
  qaController: QAController;
  conversationController: ConversationController;
  analyticsController: AnalyticsController;
  healthController: HealthController;
}

export function setupRoutes(controllers: RouteControllers): Router {
  const router = Router();

  // Health check
  router.get('/health', controllers.healthController.healthCheck);

  // Q&A endpoints
  router.post('/api/search', controllers.qaController.search);
  router.post('/api/qa', controllers.qaController.askQuestion);

  // Conversation history endpoints
  router.get('/api/history', controllers.conversationController.getHistory);
  router.delete('/api/history', controllers.conversationController.clearHistory);

  // Analytics endpoints
  router.get('/api/analytics/cost', controllers.analyticsController.getCostAnalytics);

  return router;
}
