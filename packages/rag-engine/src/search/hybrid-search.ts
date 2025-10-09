/**
 * Hybrid search engine combining vector and keyword search
 */

import { VectorSearch, VectorSearchConfig } from './vector-search.js';
import { KeywordSearch, BM25Config } from './keyword-search.js';
import { SearchFusion, FusionConfig } from './fusion.js';
import {
  SearchResult,
  SearchOptions,
  HybridSearchResult,
  SearchStrategy,
  SearchMetrics,
} from '../types/search.js';
import { DocumentChunk } from '../types/document.js';

export interface HybridSearchConfig {
  vector: VectorSearchConfig;
  bm25?: BM25Config;
  fusion?: FusionConfig;
}

export class HybridSearch {
  private vectorSearch: VectorSearch;
  private keywordSearch: KeywordSearch;
  private fusion: SearchFusion;
  private isKeywordIndexReady: boolean = false;

  constructor(config: HybridSearchConfig) {
    this.vectorSearch = new VectorSearch(config.vector);
    this.keywordSearch = new KeywordSearch(config.bm25);
    this.fusion = new SearchFusion(config.fusion);
  }

  /**
   * Index documents for keyword search
   * Must be called before using keyword or hybrid search
   */
  async indexDocuments(documents: DocumentChunk[]): Promise<void> {
    console.log('🔤 Indexing documents for keyword search...');
    this.keywordSearch.indexDocuments(documents);
    this.isKeywordIndexReady = true;
    console.log('✅ Keyword index ready\n');
  }

  /**
   * Search using specified strategy
   */
  async search(
    query: string,
    strategy: SearchStrategy = 'hybrid',
    options: SearchOptions = {}
  ): Promise<HybridSearchResult> {
    const startTime = Date.now();
    const topK = options.topK ?? 10;

    let results: SearchResult[];
    let vectorResults: SearchResult[] = [];
    let keywordResults: SearchResult[] = [];

    switch (strategy) {
      case 'vector':
        results = await this.vectorOnlySearch(query, topK, options);
        vectorResults = results;
        break;

      case 'keyword':
        results = this.keywordOnlySearch(query, topK);
        keywordResults = results;
        break;

      case 'hybrid':
      default: {
        const hybridResults = await this.hybridSearchImpl(query, topK, options);
        results = hybridResults.results;
        vectorResults = hybridResults.vectorResults;
        keywordResults = hybridResults.keywordResults;
        break;
      }
    }

    // Apply minimum score filter if specified
    if (options.minScore !== undefined) {
      results = results.filter((r) => r.score >= options.minScore!);
    }

    const searchTime = Date.now() - startTime;

    const metrics: SearchMetrics = {
      totalResults: results.length,
      vectorResults: vectorResults.length,
      keywordResults: keywordResults.length,
      fusedResults: strategy === 'hybrid' ? results.length : 0,
      searchTime,
      vectorWeight: this.fusion.getConfig().vectorWeight,
      keywordWeight: this.fusion.getConfig().keywordWeight,
    };

    return {
      results,
      searchMetrics: metrics,
    };
  }

  /**
   * Vector-only search
   */
  private async vectorOnlySearch(
    query: string,
    topK: number,
    options: SearchOptions
  ): Promise<SearchResult[]> {
    return await this.vectorSearch.search(query, topK, options.filter);
  }

  /**
   * Keyword-only search
   */
  private keywordOnlySearch(query: string, topK: number): SearchResult[] {
    if (!this.isKeywordIndexReady) {
      throw new Error(
        'Keyword index not ready. Call indexDocuments() first.'
      );
    }
    return this.keywordSearch.search(query, topK);
  }

  /**
   * Hybrid search implementation
   */
  private async hybridSearchImpl(
    query: string,
    topK: number,
    options: SearchOptions
  ): Promise<{
    results: SearchResult[];
    vectorResults: SearchResult[];
    keywordResults: SearchResult[];
  }> {
    if (!this.isKeywordIndexReady) {
      throw new Error(
        'Keyword index not ready. Call indexDocuments() first.'
      );
    }

    // Run both searches in parallel
    const [vectorResults, keywordResults] = await Promise.all([
      this.vectorSearch.search(query, topK * 2, options.filter), // Get more results for fusion
      Promise.resolve(this.keywordSearch.search(query, topK * 2)),
    ]);

    // Fuse results using RRF
    const fusedResults = this.fusion.fuseResults(
      vectorResults,
      keywordResults,
      topK
    );

    return {
      results: fusedResults,
      vectorResults,
      keywordResults,
    };
  }

  /**
   * Get vector search instance
   */
  getVectorSearch(): VectorSearch {
    return this.vectorSearch;
  }

  /**
   * Get keyword search instance
   */
  getKeywordSearch(): KeywordSearch {
    return this.keywordSearch;
  }

  /**
   * Get fusion instance
   */
  getFusion(): SearchFusion {
    return this.fusion;
  }

  /**
   * Check if keyword index is ready
   */
  isReady(): boolean {
    return this.isKeywordIndexReady;
  }
}
