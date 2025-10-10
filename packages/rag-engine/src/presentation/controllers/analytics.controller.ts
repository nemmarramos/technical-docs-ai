/**
 * Analytics Controller
 * Handles HTTP requests for analytics and cost tracking
 */

import { Request, Response } from 'express';
import { IAnalyticsService } from '../../application/interfaces/analytics-service.interface.js';

export class AnalyticsController {
  constructor(private analyticsService: IAnalyticsService) {}

  /**
   * Get cost analytics
   */
  getCostAnalytics = async (_req: Request, res: Response): Promise<void> => {
    try {
      const analytics = await this.analyticsService.getCostAnalytics();
      res.json(analytics);
    } catch (error) {
      console.error('Get cost analytics error:', error);
      res.status(500).json({
        error: 'Failed to fetch cost analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
