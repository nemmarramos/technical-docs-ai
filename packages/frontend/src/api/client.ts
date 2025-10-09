import type { QAResponse, SearchResult, ConversationMessage, CostAnalytics } from '../types';

const API_BASE_URL = '/api';

export class ApiClient {
  /**
   * Search for documents using hybrid search
   */
  async search(query: string, topK: number = 10): Promise<SearchResult[]> {
    const response = await fetch(`${API_BASE_URL}/search`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, topK }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Search failed');
    }

    const data = await response.json();
    return data.results;
  }

  /**
   * Ask a question and get an AI-generated answer
   */
  async askQuestion(query: string): Promise<QAResponse> {
    const response = await fetch(`${API_BASE_URL}/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, stream: false }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Q&A failed');
    }

    return response.json();
  }

  /**
   * Ask a question with streaming response
   */
  async* askQuestionStream(query: string): AsyncGenerator<{
    type: 'token' | 'complete';
    content?: string;
    answer?: string;
    sources?: SearchResult[];
    cost?: QAResponse['cost'];
  }> {
    const response = await fetch(`${API_BASE_URL}/qa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, stream: true }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Q&A streaming failed');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No response body');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = JSON.parse(line.slice(6));
          yield data;
        }
      }
    }
  }

  /**
   * Get conversation history
   */
  async getHistory(): Promise<ConversationMessage[]> {
    const response = await fetch(`${API_BASE_URL}/history`);
    if (!response.ok) throw new Error('Failed to fetch history');

    const data = await response.json();
    return data.messages;
  }

  /**
   * Clear conversation history
   */
  async clearHistory(): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/history`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to clear history');
  }

  /**
   * Get cost analytics
   */
  async getCostAnalytics(): Promise<CostAnalytics> {
    const response = await fetch(`${API_BASE_URL}/analytics/cost`);
    if (!response.ok) throw new Error('Failed to fetch cost analytics');

    return response.json();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch('/health');
    if (!response.ok) throw new Error('Health check failed');

    return response.json();
  }
}

export const apiClient = new ApiClient();
