/**
 * Dependency Injection Container
 * Centralized place for creating and wiring dependencies
 */

import { QAService } from '../../application/services/qa.service.js';
import { ConversationService } from '../../application/services/conversation.service.js';
import { AnalyticsService } from '../../application/services/analytics.service.js';
import { InMemoryConversationRepository } from '../persistence/in-memory-conversation.repository.js';
import { QAEngineFactory } from '../external/qa-engine.factory.js';
import { QAController } from '../../presentation/controllers/qa.controller.js';
import { ConversationController } from '../../presentation/controllers/conversation.controller.js';
import { AnalyticsController } from '../../presentation/controllers/analytics.controller.js';
import { HealthController } from '../../presentation/controllers/health.controller.js';
import { IConversationRepository } from '../../application/interfaces/conversation-repository.interface.js';
import { IQAService } from '../../application/interfaces/qa-service.interface.js';
import { IAnalyticsService } from '../../application/interfaces/analytics-service.interface.js';

/**
 * Application container holding all dependencies
 */
export class Container {
  // Repositories
  private conversationRepository: IConversationRepository;

  // Services
  private qaService: IQAService;
  private conversationService: ConversationService;
  private analyticsService: IAnalyticsService;

  // Controllers
  public qaController: QAController;
  public conversationController: ConversationController;
  public analyticsController: AnalyticsController;
  public healthController: HealthController;

  constructor() {
    // Initialize repositories
    this.conversationRepository = new InMemoryConversationRepository();

    // Initialize domain services
    const qaEngine = QAEngineFactory.create();

    // Initialize application services
    this.qaService = new QAService(qaEngine);
    this.conversationService = new ConversationService(this.conversationRepository);
    this.analyticsService = new AnalyticsService(this.conversationRepository);

    // Initialize controllers
    this.qaController = new QAController(this.qaService, this.conversationService);
    this.conversationController = new ConversationController(this.conversationService);
    this.analyticsController = new AnalyticsController(this.analyticsService);
    this.healthController = new HealthController();
  }

  /**
   * Initialize all services
   */
  async initialize(): Promise<void> {
    console.log('🔧 Initializing application services...');
    await this.qaService.initialize();
    console.log('✅ Application services initialized\n');
  }

  /**
   * Get services (for testing or advanced use cases)
   */
  getServices() {
    return {
      qaService: this.qaService,
      conversationService: this.conversationService,
      analyticsService: this.analyticsService,
    };
  }

  /**
   * Get repositories (for testing or advanced use cases)
   */
  getRepositories() {
    return {
      conversationRepository: this.conversationRepository,
    };
  }
}
