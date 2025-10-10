/**
 * Conversation Controller
 * Handles HTTP requests for conversation history management
 */

import { Request, Response } from 'express';
import { ConversationService } from '../../application/services/conversation.service.js';

export class ConversationController {
  constructor(private conversationService: ConversationService) {}

  /**
   * Get conversation history
   */
  getHistory = async (_req: Request, res: Response): Promise<void> => {
    try {
      const messages = await this.conversationService.getAllMessages();

      // Transform citations to frontend format for each message
      const transformedHistory = messages.map((msg) => ({
        ...msg,
        sources: msg.sources.map((citation, index) => ({
          id: `${msg.id}_source_${index}`,
          content: citation.title || '',
          metadata: {
            source: citation.source,
            heading: citation.heading,
            lineStart: citation.startLine,
            lineEnd: citation.endLine,
          },
          score: 1.0,
        })),
      }));

      res.json({
        messages: transformedHistory,
        totalMessages: transformedHistory.length,
      });
    } catch (error) {
      console.error('Get history error:', error);
      res.status(500).json({
        error: 'Failed to fetch history',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Clear conversation history
   */
  clearHistory = async (_req: Request, res: Response): Promise<void> => {
    try {
      await this.conversationService.clearHistory();
      res.json({ message: 'Conversation history cleared' });
    } catch (error) {
      console.error('Clear history error:', error);
      res.status(500).json({
        error: 'Failed to clear history',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
