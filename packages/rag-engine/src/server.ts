/**
 * Express API Server for RAG Engine
 * Refactored with Layered Architecture Pattern
 *
 * Architecture:
 * - Presentation Layer: Controllers and Routes (HTTP handlers)
 * - Application Layer: Services and Use Cases (business orchestration)
 * - Domain Layer: RAG Engine, Search, Re-ranking (core business logic)
 * - Infrastructure Layer: Repositories, External APIs (data access & external services)
 */

import express from 'express';
import cors from 'cors';
import { Container } from './infrastructure/di/container.js';
import { setupRoutes } from './presentation/routes/index.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize dependency injection container
const container = new Container();

// Setup routes with controllers
const router = setupRoutes({
  qaController: container.qaController,
  conversationController: container.conversationController,
  analyticsController: container.analyticsController,
  healthController: container.healthController,
});

// Mount routes
app.use(router);

// Start server and initialize services
app.listen(PORT, async () => {
  console.log(`\n🚀 RAG Engine API Server running on http://localhost:${PORT}`);
  console.log(`\n📐 Architecture:`);
  console.log(`   ✓ Presentation Layer: Controllers & Routes`);
  console.log(`   ✓ Application Layer: Services & Use Cases`);
  console.log(`   ✓ Domain Layer: RAG Engine, Search, Re-ranking`);
  console.log(`   ✓ Infrastructure Layer: Repositories & External APIs`);
  console.log(`\n📍 Endpoints:`);
  console.log(`  GET  /health              - Health check`);
  console.log(`  POST /api/search          - Vector search`);
  console.log(`  POST /api/qa              - Q&A with RAG pipeline`);
  console.log(`  GET  /api/history         - Get conversation history`);
  console.log(`  DELETE /api/history       - Clear conversation history`);
  console.log(`  GET  /api/analytics/cost  - Get cost analytics`);
  console.log();

  // Initialize services
  try {
    await container.initialize();
  } catch (error) {
    console.error('Failed to initialize services:', error);
  }
});

export default app;
