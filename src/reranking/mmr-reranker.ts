/**
 * Maximal Marginal Relevance (MMR) Re-ranker
 * Balances relevance and diversity in search results
 */

import { SearchResult } from '../types/search.js';
import { RerankedResult } from '../types/reranker.js';

export interface MMRConfig {
  lambda?: number; // Trade-off between relevance and diversity (0-1, default: 0.5)
  topK?: number; // Number of results to return
}

export class MMRReranker {
  private lambda: number;

  constructor(config: MMRConfig = {}) {
    this.lambda = config.lambda ?? 0.5; // Default: equal balance
  }

  /**
   * Re-rank results using MMR algorithm
   * MMR = λ * relevance - (1-λ) * max_similarity_to_selected
   */
  rerank(results: SearchResult[], topK?: number): RerankedResult[] {
    if (results.length === 0) {
      return [];
    }

    const k = topK ?? results.length;
    const selected: RerankedResult[] = [];
    const remaining = [...results];

    // Always select the top result first
    if (remaining.length > 0) {
      const first = remaining.shift()!;
      selected.push(this.toRerankedResult(first, first.score, 'First result (highest relevance)'));
    }

    // Select remaining results using MMR
    while (selected.length < k && remaining.length > 0) {
      let maxMmrScore = -Infinity;
      let maxMmrIndex = 0;

      // Calculate MMR score for each remaining result
      for (let i = 0; i < remaining.length; i++) {
        const result = remaining[i];
        const relevanceScore = result.score;

        // Calculate max similarity to already selected results
        const maxSimilarity = this.calculateMaxSimilarity(result, selected);

        // MMR formula: λ * relevance - (1-λ) * max_similarity
        const mmrScore = this.lambda * relevanceScore - (1 - this.lambda) * maxSimilarity;

        if (mmrScore > maxMmrScore) {
          maxMmrScore = mmrScore;
          maxMmrIndex = i;
        }
      }

      // Add the result with highest MMR score
      const selectedResult = remaining.splice(maxMmrIndex, 1)[0];
      selected.push(
        this.toRerankedResult(
          selectedResult,
          maxMmrScore,
          `MMR score: ${maxMmrScore.toFixed(4)} (λ=${this.lambda})`
        )
      );
    }

    return selected;
  }

  /**
   * Calculate maximum similarity between a result and all selected results
   * Uses content-based similarity (simple approach without embeddings)
   */
  private calculateMaxSimilarity(result: SearchResult, selected: RerankedResult[]): number {
    if (selected.length === 0) {
      return 0;
    }

    let maxSim = 0;

    for (const selectedResult of selected) {
      const similarity = this.calculateTextSimilarity(result.content, selectedResult.content);
      maxSim = Math.max(maxSim, similarity);
    }

    return maxSim;
  }

  /**
   * Calculate text similarity using Jaccard similarity on words
   */
  private calculateTextSimilarity(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Convert SearchResult to RerankedResult
   */
  private toRerankedResult(
    result: SearchResult,
    rerankedScore: number,
    reason?: string
  ): RerankedResult {
    return {
      ...result,
      originalScore: result.score,
      rerankedScore,
      score: rerankedScore,
      rerankerReason: reason,
    };
  }

  /**
   * Update lambda value
   */
  setLambda(lambda: number): void {
    if (lambda < 0 || lambda > 1) {
      throw new Error('Lambda must be between 0 and 1');
    }
    this.lambda = lambda;
  }

  /**
   * Get current lambda value
   */
  getLambda(): number {
    return this.lambda;
  }
}
