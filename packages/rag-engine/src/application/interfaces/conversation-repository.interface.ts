/**
 * Repository interface for conversation storage
 * Enables swapping storage implementations (memory, PostgreSQL, etc.)
 */

import { Citation } from '../../types/prompt.js';

export interface ConversationMessage {
  id: string;
  query: string;
  answer: string;
  sources: Citation[];
  cost: {
    searchCost: number;
    llmCost: number;
    totalCost: number;
  };
  timestamp: number;
}

export interface IConversationRepository {
  /**
   * Save a conversation message
   */
  save(message: ConversationMessage): Promise<void>;

  /**
   * Get all conversation messages
   */
  getAll(): Promise<ConversationMessage[]>;

  /**
   * Get a conversation message by ID
   */
  getById(id: string): Promise<ConversationMessage | null>;

  /**
   * Clear all conversation messages
   */
  clear(): Promise<void>;

  /**
   * Get total number of messages
   */
  count(): Promise<number>;
}
