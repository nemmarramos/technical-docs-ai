/**
 * Search result fusion algorithms
 */

import { SearchResult } from '../types/search.js';

export interface FusionConfig {
  k?: number; // RRF constant (default: 60)
  vectorWeight?: number; // Weight for vector search (0-1, default: 0.5)
  keywordWeight?: number; // Weight for keyword search (0-1, default: 0.5)
}

/**
 * Reciprocal Rank Fusion (RRF)
 * Combines rankings from multiple search methods
 */
export class SearchFusion {
  private config: Required<FusionConfig>;

  constructor(config: FusionConfig = {}) {
    const vectorWeight = config.vectorWeight ?? 0.5;
    const keywordWeight = config.keywordWeight ?? 0.5;

    // Normalize weights to sum to 1
    const totalWeight = vectorWeight + keywordWeight;

    this.config = {
      k: config.k ?? 60,
      vectorWeight: vectorWeight / totalWeight,
      keywordWeight: keywordWeight / totalWeight,
    };
  }

  /**
   * Fuse vector and keyword search results using RRF
   */
  fuseResults(
    vectorResults: SearchResult[],
    keywordResults: SearchResult[],
    topK: number = 10
  ): SearchResult[] {
    const scoreMap = new Map<string, { result: SearchResult; rrfScore: number }>();

    // Process vector search results
    vectorResults.forEach((result, rank) => {
      const rrfScore = this.config.vectorWeight / (this.config.k + rank + 1);
      scoreMap.set(result.id, {
        result,
        rrfScore,
      });
    });

    // Process keyword search results
    keywordResults.forEach((result, rank) => {
      const rrfScore = this.config.keywordWeight / (this.config.k + rank + 1);
      const existing = scoreMap.get(result.id);

      if (existing) {
        // Combine scores if result appears in both
        existing.rrfScore += rrfScore;
      } else {
        scoreMap.set(result.id, {
          result,
          rrfScore,
        });
      }
    });

    // Sort by combined RRF score and return top K
    const fusedResults = Array.from(scoreMap.values())
      .sort((a, b) => b.rrfScore - a.rrfScore)
      .slice(0, topK)
      .map(({ result, rrfScore }) => ({
        ...result,
        score: rrfScore,
      }));

    return fusedResults;
  }

  /**
   * Weighted score fusion (alternative to RRF)
   */
  fuseByWeightedScore(
    vectorResults: SearchResult[],
    keywordResults: SearchResult[],
    topK: number = 10
  ): SearchResult[] {
    const scoreMap = new Map<string, { result: SearchResult; combinedScore: number }>();

    // Process vector search results
    vectorResults.forEach((result) => {
      const weightedScore = result.score * this.config.vectorWeight;
      scoreMap.set(result.id, {
        result,
        combinedScore: weightedScore,
      });
    });

    // Process keyword search results
    keywordResults.forEach((result) => {
      const weightedScore = result.score * this.config.keywordWeight;
      const existing = scoreMap.get(result.id);

      if (existing) {
        existing.combinedScore += weightedScore;
      } else {
        scoreMap.set(result.id, {
          result,
          combinedScore: weightedScore,
        });
      }
    });

    // Sort by combined score and return top K
    const fusedResults = Array.from(scoreMap.values())
      .sort((a, b) => b.combinedScore - a.combinedScore)
      .slice(0, topK)
      .map(({ result, combinedScore }) => ({
        ...result,
        score: combinedScore,
      }));

    return fusedResults;
  }

  /**
   * Get current fusion configuration
   */
  getConfig(): Required<FusionConfig> {
    return { ...this.config };
  }
}
