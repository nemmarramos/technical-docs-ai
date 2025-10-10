/**
 * Health Controller
 * Handles health check requests
 */

import { Request, Response } from 'express';

export class HealthController {
  /**
   * Health check endpoint
   */
  healthCheck = (_req: Request, res: Response): void => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  };
}
