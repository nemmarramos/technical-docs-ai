/**
 * Q&A Service Implementation
 * Application layer service that orchestrates RAG operations
 */

import { IQAService, QARequest, QAResponse } from '../interfaces/qa-service.interface.js';
import { QAEngine } from '../../rag/qa-engine.js';
import { SearchResult } from '../../types/search.js';

export class QAService implements IQAService {
  private qaEngine: QAEngine;
  private isInitialized: boolean = false;

  constructor(qaEngine: QAEngine) {
    this.qaEngine = qaEngine;
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      console.log('🔤 Initializing Q&A service...');
      // Initialize with empty documents for now (vector-only mode)
      // In production, you would load documents from the vector DB
      await this.qaEngine.initialize([]);
      this.isInitialized = true;
      console.log('✅ Q&A service initialized');
    } catch (error) {
      console.error('⚠️  Warning: Could not initialize keyword index:', error);
      console.log('   Using vector-only search mode');
      this.isInitialized = true; // Allow service to continue
    }
  }

  /**
   * Ask a question and get an AI-generated answer
   */
  async ask(request: QARequest): Promise<QAResponse> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized. Call initialize() first.');
    }

    const { query, searchStrategy = 'vector', useReranking = true, topK } = request;

    // Execute RAG pipeline
    const result = await this.qaEngine.ask(query, {
      searchStrategy,
      useReranking,
      searchOptions: { topK },
    });

    // Calculate costs
    const searchCost = 0.0001; // Embedding API cost (simplified)
    const llmCost = (result.metadata.tokensUsed.total / 1000000) * 0.15; // GPT-4o-mini pricing
    const totalCost = searchCost + llmCost;

    // Generate unique ID
    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const timestamp = Date.now();

    return {
      id,
      query: result.question,
      answer: result.answer,
      sources: result.sources,
      searchResults: result.searchResults,
      cost: {
        searchCost,
        llmCost,
        totalCost,
      },
      metadata: result.metadata,
      timestamp,
    };
  }

  /**
   * Perform search without generating an answer
   */
  async search(query: string, topK: number = 10): Promise<SearchResult[]> {
    if (!this.isInitialized) {
      throw new Error('Service not initialized. Call initialize() first.');
    }

    // Use vector-only search
    const result = await this.qaEngine.ask(query, {
      searchStrategy: 'vector',
      searchOptions: { topK },
    });

    return result.searchResults;
  }
}
