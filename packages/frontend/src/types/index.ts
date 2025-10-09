export interface SearchResult {
  id: string;
  content: string;
  metadata: {
    source: string;
    heading?: string;
    lineStart?: number;
    lineEnd?: number;
  };
  score: number;
}

export interface ConversationMessage {
  id: string;
  query: string;
  answer: string;
  sources: SearchResult[];
  cost: {
    searchCost: number;
    llmCost: number;
    totalCost: number;
  };
  timestamp: number;
}

export interface CostAnalytics {
  totalQueries: number;
  totalCost: number;
  averageCostPerQuery: number;
  breakdown: {
    searchCost: number;
    llmCost: number;
  };
}

export interface QAResponse {
  id: string;
  query: string;
  answer: string;
  sources: SearchResult[];
  cost: {
    searchCost: number;
    llmCost: number;
    totalCost: number;
  };
  timestamp: number;
}
