/**
 * Search types for hybrid search implementation
 */

export interface SearchResult {
  id: string;
  content: string;
  score: number;
  metadata: SearchMetadata;
}

export interface SearchMetadata {
  source: string;
  sourceType: string;
  title?: string;
  heading?: string;
  chunkIndex?: number;
  startLine?: number;
  endLine?: number;
  tokens?: number;
  [key: string]: unknown;
}

export interface SearchOptions {
  topK?: number;
  vectorWeight?: number;
  keywordWeight?: number;
  filter?: Record<string, unknown>;
  minScore?: number;
}

export interface HybridSearchResult {
  results: SearchResult[];
  searchMetrics: SearchMetrics;
}

export interface SearchMetrics {
  totalResults: number;
  vectorResults: number;
  keywordResults: number;
  fusedResults: number;
  searchTime: number;
  vectorWeight: number;
  keywordWeight: number;
}

export type SearchStrategy = 'vector' | 'keyword' | 'hybrid';
