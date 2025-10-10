/**
 * Conversation Service Implementation
 * Manages conversation history and retrieval
 */

import { IConversationRepository, ConversationMessage } from '../interfaces/conversation-repository.interface.js';

export class ConversationService {
  constructor(private conversationRepository: IConversationRepository) {}

  /**
   * Add a new conversation message
   */
  async addMessage(message: ConversationMessage): Promise<void> {
    await this.conversationRepository.save(message);
  }

  /**
   * Get all conversation messages
   */
  async getAllMessages(): Promise<ConversationMessage[]> {
    return await this.conversationRepository.getAll();
  }

  /**
   * Get a specific message by ID
   */
  async getMessageById(id: string): Promise<ConversationMessage | null> {
    return await this.conversationRepository.getById(id);
  }

  /**
   * Clear all conversation history
   */
  async clearHistory(): Promise<void> {
    await this.conversationRepository.clear();
  }

  /**
   * Get total message count
   */
  async getMessageCount(): Promise<number> {
    return await this.conversationRepository.count();
  }
}
