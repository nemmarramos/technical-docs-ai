import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../api/client';
import type { ConversationMessage, CostAnalytics, QAResponse } from '../types';

export function useConversationHistory() {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const history = await apiClient.getHistory();
      setMessages(history);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load history');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearHistory = useCallback(async () => {
    try {
      await apiClient.clearHistory();
      setMessages([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear history');
    }
  }, []);

  const addMessage = useCallback((message: ConversationMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  return { messages, isLoading, error, loadHistory, clearHistory, addMessage };
}

export function useCostAnalytics() {
  const [analytics, setAnalytics] = useState<CostAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getCostAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load analytics');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  return { analytics, isLoading, error, loadAnalytics };
}

export function useQuestion() {
  const [isAsking, setIsAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askQuestion = useCallback(async (query: string): Promise<QAResponse | null> => {
    try {
      setIsAsking(true);
      setError(null);
      const response = await apiClient.askQuestion(query);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to ask question');
      return null;
    } finally {
      setIsAsking(false);
    }
  }, []);

  return { askQuestion, isAsking, error };
}
