/**
 * Q&A Controller
 * Handles HTTP requests for question-answering operations
 */

import { Request, Response } from 'express';
import { IQAService } from '../../application/interfaces/qa-service.interface.js';
import { ConversationService } from '../../application/services/conversation.service.js';
import { ConversationMessage } from '../../application/interfaces/conversation-repository.interface.js';

export class QAController {
  constructor(
    private qaService: IQAService,
    private conversationService: ConversationService
  ) {}

  /**
   * Search endpoint - returns search results only (no Q&A)
   */
  search = async (req: Request, res: Response): Promise<void> => {
    try {
      const { query } = req.body;

      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'Query is required and must be a string' });
        return;
      }

      // Run search
      const searchResults = await this.qaService.search(query);

      // Transform to frontend format
      const transformedResults = searchResults.map((searchResult, index) => ({
        id: searchResult.id || `result_${index}`,
        content: searchResult.content,
        metadata: {
          source: searchResult.metadata?.source || 'Unknown',
          heading: searchResult.metadata?.heading,
          lineStart: searchResult.metadata?.lineStart,
          lineEnd: searchResult.metadata?.lineEnd,
        },
        score: searchResult.score,
      }));

      res.json({
        query,
        results: transformedResults,
        metadata: {
          resultCount: transformedResults.length,
        },
      });
    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Q&A endpoint - full RAG pipeline
   */
  askQuestion = async (req: Request, res: Response): Promise<void> => {
    try {
      const { query } = req.body;

      if (!query || typeof query !== 'string') {
        res.status(400).json({ error: 'Query is required and must be a string' });
        return;
      }

      // Run Q&A pipeline
      const result = await this.qaService.ask({
        query,
        searchStrategy: 'vector',
      });

      // Transform SearchResults to frontend format
      const transformedSources = result.searchResults.map((searchResult, index) => ({
        id: searchResult.id || `source_${index}`,
        content: searchResult.content,
        metadata: {
          source: searchResult.metadata?.source || 'Unknown',
          heading: searchResult.metadata?.heading,
          lineStart: searchResult.metadata?.lineStart,
          lineEnd: searchResult.metadata?.lineEnd,
        },
        score: searchResult.score,
      }));

      // Store in conversation history
      const conversationMessage: ConversationMessage = {
        id: result.id,
        query: result.query,
        answer: result.answer,
        sources: result.sources,
        cost: result.cost,
        timestamp: result.timestamp,
      };
      await this.conversationService.addMessage(conversationMessage);

      res.json({
        id: result.id,
        query: result.query,
        answer: result.answer,
        sources: transformedSources,
        cost: result.cost,
        timestamp: result.timestamp,
      });
    } catch (error) {
      console.error('Q&A error:', error);
      res.status(500).json({
        error: 'Q&A failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
