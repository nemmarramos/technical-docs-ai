/**
 * Relevance-based re-ranker
 * Enhances relevance scores based on metadata and content features
 */

import { SearchResult } from '../types/search.js';
import { RerankedResult } from '../types/reranker.js';

export interface RelevanceConfig {
  titleBoost?: number; // Boost for results with query terms in title (default: 0.2)
  headingBoost?: number; // Boost for results with query terms in heading (default: 0.1)
  recencyBoost?: boolean; // Boost more recent results (not implemented yet)
}

export class RelevanceReranker {
  private titleBoost: number;
  private headingBoost: number;

  constructor(config: RelevanceConfig = {}) {
    this.titleBoost = config.titleBoost ?? 0.2;
    this.headingBoost = config.headingBoost ?? 0.1;
  }

  /**
   * Re-rank results by enhancing relevance scores
   */
  rerank(results: SearchResult[], query: string, topK?: number): RerankedResult[] {
    const queryTerms = new Set(
      query
        .toLowerCase()
        .split(/\s+/)
        .filter((term) => term.length > 2) // Filter out very short terms
    );

    const reranked = results.map((result) => {
      let boost = 0;
      const reasons: string[] = [];

      // Title boost
      if (result.metadata.title) {
        const titleBoost = this.calculateTitleBoost(result.metadata.title, queryTerms);
        if (titleBoost > 0) {
          boost += titleBoost;
          reasons.push(`title match (+${titleBoost.toFixed(3)})`);
        }
      }

      // Heading boost
      if (result.metadata.heading) {
        const headingBoost = this.calculateHeadingBoost(result.metadata.heading, queryTerms);
        if (headingBoost > 0) {
          boost += headingBoost;
          reasons.push(`heading match (+${headingBoost.toFixed(3)})`);
        }
      }

      // Position boost (earlier chunks are often more important)
      const positionBoost = this.calculatePositionBoost(result.metadata.chunkIndex);
      if (positionBoost > 0) {
        boost += positionBoost;
        reasons.push(`early chunk (+${positionBoost.toFixed(3)})`);
      }

      const rerankedScore = result.score + boost;

      return {
        ...result,
        originalScore: result.score,
        rerankedScore,
        score: rerankedScore,
        rerankerReason: reasons.length > 0 ? reasons.join(', ') : 'No boost applied',
      };
    });

    // Sort by reranked score
    reranked.sort((a, b) => b.rerankedScore - a.rerankedScore);

    // Return top K if specified
    return topK ? reranked.slice(0, topK) : reranked;
  }

  /**
   * Calculate title boost based on query term matches
   */
  private calculateTitleBoost(title: string, queryTerms: Set<string>): number {
    const titleWords = new Set(title.toLowerCase().split(/\s+/));
    let matchCount = 0;

    for (const term of queryTerms) {
      if (titleWords.has(term)) {
        matchCount++;
      }
    }

    // Boost proportional to match percentage
    const matchRatio = matchCount / queryTerms.size;
    return matchRatio * this.titleBoost;
  }

  /**
   * Calculate heading boost based on query term matches
   */
  private calculateHeadingBoost(heading: string, queryTerms: Set<string>): number {
    const headingWords = new Set(heading.toLowerCase().split(/\s+/));
    let matchCount = 0;

    for (const term of queryTerms) {
      if (headingWords.has(term)) {
        matchCount++;
      }
    }

    const matchRatio = matchCount / queryTerms.size;
    return matchRatio * this.headingBoost;
  }

  /**
   * Calculate position boost (earlier chunks get slight boost)
   */
  private calculatePositionBoost(chunkIndex?: number): number {
    if (chunkIndex === undefined || chunkIndex === null) {
      return 0;
    }

    // First chunk gets max boost, diminishing returns after
    // Max boost of 0.05 for first chunk, approaching 0 for later chunks
    return 0.05 / (1 + chunkIndex * 0.1);
  }

  /**
   * Update boost values
   */
  setBoosts(config: { titleBoost?: number; headingBoost?: number }): void {
    if (config.titleBoost !== undefined) {
      this.titleBoost = config.titleBoost;
    }
    if (config.headingBoost !== undefined) {
      this.headingBoost = config.headingBoost;
    }
  }

  /**
   * Get current boost configuration
   */
  getBoosts(): { titleBoost: number; headingBoost: number } {
    return {
      titleBoost: this.titleBoost,
      headingBoost: this.headingBoost,
    };
  }
}
