/**
 * Unified re-ranker interface
 * Combines multiple re-ranking strategies
 */

import { SearchResult } from '../types/search.js';
import { RerankerConfig, RerankerStrategy, RerankedResult, RerankMetrics } from '../types/reranker.js';
import { MMRReranker } from './mmr-reranker.js';
import { DiversityReranker } from './diversity-reranker.js';
import { RelevanceReranker } from './relevance-reranker.js';

export class Reranker {
  private mmrReranker: MMRReranker;
  private diversityReranker: DiversityReranker;
  private relevanceReranker: RelevanceReranker;
  private strategy: RerankerStrategy;

  constructor(config: RerankerConfig = {}) {
    this.strategy = config.strategy ?? 'relevance';

    this.mmrReranker = new MMRReranker({
      lambda: config.diversityLambda,
    });

    this.diversityReranker = new DiversityReranker({
      similarityThreshold: config.similarityThreshold,
    });

    this.relevanceReranker = new RelevanceReranker();
  }

  /**
   * Re-rank search results using the configured strategy
   */
  rerank(
    results: SearchResult[],
    query: string,
    topK?: number
  ): {
    results: RerankedResult[];
    metrics: RerankMetrics;
  } {
    const startTime = Date.now();

    let reranked: RerankedResult[];

    switch (this.strategy) {
      case 'mmr':
        reranked = this.mmrReranker.rerank(results, topK);
        break;

      case 'diversity':
        reranked = this.diversityReranker.rerank(results, topK);
        break;

      case 'relevance':
        reranked = this.relevanceReranker.rerank(results, query, topK);
        break;

      default:
        // Default: just convert to RerankedResult without re-ranking
        reranked = results.slice(0, topK).map((r) => ({
          ...r,
          originalScore: r.score,
          rerankedScore: r.score,
        }));
    }

    const rerankTime = Date.now() - startTime;

    // Calculate diversity score for metrics
    const diversityScore = this.calculateDiversityScore(reranked);

    const metrics: RerankMetrics = {
      originalCount: results.length,
      rerankedCount: reranked.length,
      strategy: this.strategy,
      rerankTime,
      diversityScore,
    };

    return { results: reranked, metrics };
  }

  /**
   * Apply multiple re-ranking strategies in sequence
   */
  rerankPipeline(
    results: SearchResult[],
    query: string,
    strategies: RerankerStrategy[],
    topK?: number
  ): {
    results: RerankedResult[];
    metrics: RerankMetrics[];
  } {
    let currentResults = results;
    const allMetrics: RerankMetrics[] = [];

    for (const strategy of strategies) {
      const originalStrategy = this.strategy;
      this.strategy = strategy;

      const { results: rerankedResults, metrics } = this.rerank(
        currentResults,
        query,
        topK
      );

      currentResults = rerankedResults;
      allMetrics.push(metrics);

      this.strategy = originalStrategy;
    }

    return {
      results: currentResults as RerankedResult[],
      metrics: allMetrics,
    };
  }

  /**
   * Calculate diversity score (average pairwise similarity)
   */
  private calculateDiversityScore(results: RerankedResult[]): number {
    if (results.length < 2) {
      return 1.0;
    }

    let totalSimilarity = 0;
    let pairCount = 0;

    for (let i = 0; i < results.length; i++) {
      for (let j = i + 1; j < results.length; j++) {
        totalSimilarity += this.calculateSimilarity(results[i], results[j]);
        pairCount++;
      }
    }

    // Return diversity (1 - similarity)
    return 1 - totalSimilarity / pairCount;
  }

  /**
   * Calculate text similarity between two results
   */
  private calculateSimilarity(result1: RerankedResult, result2: RerankedResult): number {
    const words1 = new Set(result1.content.toLowerCase().split(/\s+/));
    const words2 = new Set(result2.content.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter((x) => words2.has(x)));
    const union = new Set([...words1, ...words2]);

    return intersection.size / union.size;
  }

  /**
   * Set re-ranking strategy
   */
  setStrategy(strategy: RerankerStrategy): void {
    this.strategy = strategy;
  }

  /**
   * Get current strategy
   */
  getStrategy(): RerankerStrategy {
    return this.strategy;
  }

  /**
   * Get individual re-rankers for fine-tuning
   */
  getRerankers(): {
    mmr: MMRReranker;
    diversity: DiversityReranker;
    relevance: RelevanceReranker;
  } {
    return {
      mmr: this.mmrReranker,
      diversity: this.diversityReranker,
      relevance: this.relevanceReranker,
    };
  }
}
