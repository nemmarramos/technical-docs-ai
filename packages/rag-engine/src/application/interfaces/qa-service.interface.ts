/**
 * Q&A Service interface
 * Defines the contract for question-answering operations
 */

import { SearchResult } from '../../types/search.js';
import { Citation } from '../../types/prompt.js';

export interface QARequest {
  query: string;
  searchStrategy?: 'vector' | 'keyword' | 'hybrid';
  useReranking?: boolean;
  topK?: number;
}

export interface QAResponse {
  id: string;
  query: string;
  answer: string;
  sources: Citation[];
  searchResults: SearchResult[];
  cost: {
    searchCost: number;
    llmCost: number;
    totalCost: number;
  };
  metadata: {
    searchTime: number;
    rerankTime?: number;
    llmTime: number;
    totalTime: number;
    tokensUsed: {
      prompt: number;
      completion: number;
      total: number;
    };
    model: string;
  };
  timestamp: number;
}

export interface IQAService {
  /**
   * Ask a question and get an AI-generated answer
   */
  ask(request: QARequest): Promise<QAResponse>;

  /**
   * Perform search without generating an answer
   */
  search(query: string, topK?: number): Promise<SearchResult[]>;

  /**
   * Initialize the service (e.g., load keyword index)
   */
  initialize(): Promise<void>;
}
