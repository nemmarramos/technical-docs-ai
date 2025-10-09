/**
 * Re-ranking types and interfaces
 */

import { SearchResult } from './search.js';

export interface RerankerConfig {
  strategy?: RerankerStrategy;
  diversityLambda?: number; // For MMR: 0 = max relevance, 1 = max diversity
  similarityThreshold?: number; // For diversity-based filtering
}

export type RerankerStrategy = 'relevance' | 'mmr' | 'diversity' | 'cross-encoder';

export interface RerankedResult extends SearchResult {
  originalScore: number;
  rerankedScore: number;
  rerankerReason?: string;
}

export interface RerankMetrics {
  originalCount: number;
  rerankedCount: number;
  strategy: RerankerStrategy;
  rerankTime: number;
  diversityScore?: number;
}
