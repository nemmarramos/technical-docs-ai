/**
 * Analytics Service interface
 * Defines the contract for cost and usage analytics
 */

export interface CostAnalytics {
  totalQueries: number;
  totalCost: number;
  averageCostPerQuery: number;
  breakdown: {
    searchCost: number;
    llmCost: number;
  };
}

export interface IAnalyticsService {
  /**
   * Get cost analytics summary
   */
  getCostAnalytics(): Promise<CostAnalytics>;

  /**
   * Track a query cost
   */
  trackQueryCost(searchCost: number, llmCost: number): Promise<void>;

  /**
   * Reset analytics data
   */
  reset(): Promise<void>;
}
