/**
 * In-Memory Conversation Repository Implementation
 * Stores conversations in memory (suitable for development/demo)
 * Can be swapped with PostgreSQL or other persistent storage
 */

import { IConversationRepository, ConversationMessage } from '../../application/interfaces/conversation-repository.interface.js';

export class InMemoryConversationRepository implements IConversationRepository {
  private messages: Map<string, ConversationMessage> = new Map();

  /**
   * Save a conversation message
   */
  async save(message: ConversationMessage): Promise<void> {
    this.messages.set(message.id, message);
  }

  /**
   * Get all conversation messages
   */
  async getAll(): Promise<ConversationMessage[]> {
    return Array.from(this.messages.values()).sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get a conversation message by ID
   */
  async getById(id: string): Promise<ConversationMessage | null> {
    return this.messages.get(id) || null;
  }

  /**
   * Clear all conversation messages
   */
  async clear(): Promise<void> {
    this.messages.clear();
  }

  /**
   * Get total number of messages
   */
  async count(): Promise<number> {
    return this.messages.size;
  }
}
