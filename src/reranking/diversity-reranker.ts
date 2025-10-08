/**
 * Diversity-based re-ranker
 * Filters out overly similar results to ensure diverse perspectives
 */

import { SearchResult } from '../types/search.js';
import { RerankedResult } from '../types/reranker.js';

export interface DiversityConfig {
  similarityThreshold?: number; // Similarity threshold for filtering (0-1, default: 0.7)
  sourceWeighting?: boolean; // Prefer results from different sources
}

export class DiversityReranker {
  private similarityThreshold: number;
  private sourceWeighting: boolean;

  constructor(config: DiversityConfig = {}) {
    this.similarityThreshold = config.similarityThreshold ?? 0.7;
    this.sourceWeighting = config.sourceWeighting ?? true;
  }

  /**
   * Re-rank results by filtering similar duplicates
   */
  rerank(results: SearchResult[], topK?: number): RerankedResult[] {
    if (results.length === 0) {
      return [];
    }

    const selected: RerankedResult[] = [];
    const seenSources = new Set<string>();

    for (const result of results) {
      // Check if we've reached the desired number of results
      if (topK && selected.length >= topK) {
        break;
      }

      // Check similarity with already selected results
      const isSimilar = this.isSimilarToSelected(result, selected);

      if (!isSimilar) {
        // Calculate diversity bonus
        const sourceBonus = this.calculateSourceBonus(result, seenSources);
        const rerankedScore = result.score + sourceBonus;

        selected.push({
          ...result,
          originalScore: result.score,
          rerankedScore,
          score: rerankedScore,
          rerankerReason: `Diverse result (source bonus: +${sourceBonus.toFixed(3)})`,
        });

        seenSources.add(result.metadata.source);
      }
    }

    return selected;
  }

  /**
   * Check if result is too similar to already selected results
   */
  private isSimilarToSelected(result: SearchResult, selected: RerankedResult[]): boolean {
    for (const selectedResult of selected) {
      const similarity = this.calculateSimilarity(result, selectedResult);

      if (similarity > this.similarityThreshold) {
        return true;
      }
    }

    return false;
  }

  /**
   * Calculate similarity between two results
   */
  private calculateSimilarity(result1: SearchResult, result2: SearchResult): number {
    // If from exact same source and chunk, they're duplicates
    if (
      result1.metadata.source === result2.metadata.source &&
      result1.metadata.chunkIndex === result2.metadata.chunkIndex
    ) {
      return 1.0;
    }

    // Calculate content similarity using Jaccard
    const words1 = new Set(result1.content.toLowerCase().split(/\s+/));
    const words2 = new Set(result2.content.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Calculate bonus score for results from new sources
   */
  private calculateSourceBonus(result: SearchResult, seenSources: Set<string>): number {
    if (!this.sourceWeighting) {
      return 0;
    }

    // Give bonus to results from unseen sources
    return seenSources.has(result.metadata.source) ? 0 : 0.1;
  }

  /**
   * Update similarity threshold
   */
  setSimilarityThreshold(threshold: number): void {
    if (threshold < 0 || threshold > 1) {
      throw new Error('Similarity threshold must be between 0 and 1');
    }
    this.similarityThreshold = threshold;
  }

  /**
   * Get current similarity threshold
   */
  getSimilarityThreshold(): number {
    return this.similarityThreshold;
  }
}
