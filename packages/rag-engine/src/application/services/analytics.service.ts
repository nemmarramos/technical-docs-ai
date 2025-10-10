/**
 * Analytics Service Implementation
 * Tracks and computes cost analytics from conversation history
 */

import { IAnalyticsService, CostAnalytics } from '../interfaces/analytics-service.interface.js';
import { IConversationRepository } from '../interfaces/conversation-repository.interface.js';

export class AnalyticsService implements IAnalyticsService {
  constructor(private conversationRepository: IConversationRepository) {}

  /**
   * Get cost analytics summary
   */
  async getCostAnalytics(): Promise<CostAnalytics> {
    const messages = await this.conversationRepository.getAll();

    const totalCost = messages.reduce((sum, msg) => sum + msg.cost.totalCost, 0);
    const totalSearchCost = messages.reduce((sum, msg) => sum + msg.cost.searchCost, 0);
    const totalLlmCost = messages.reduce((sum, msg) => sum + msg.cost.llmCost, 0);

    const avgCost = messages.length > 0 ? totalCost / messages.length : 0;

    return {
      totalQueries: messages.length,
      totalCost: parseFloat(totalCost.toFixed(4)),
      averageCostPerQuery: parseFloat(avgCost.toFixed(4)),
      breakdown: {
        searchCost: parseFloat(totalSearchCost.toFixed(4)),
        llmCost: parseFloat(totalLlmCost.toFixed(4)),
      },
    };
  }

  /**
   * Track a query cost (implemented via conversation repository)
   */
  async trackQueryCost(_searchCost: number, _llmCost: number): Promise<void> {
    // This is implicitly handled when messages are saved via ConversationService
    // This method is here for interface compliance and future enhancements
  }

  /**
   * Reset analytics data
   */
  async reset(): Promise<void> {
    await this.conversationRepository.clear();
  }
}
