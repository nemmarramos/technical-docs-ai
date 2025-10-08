/**
 * Vector-based semantic search
 */

import { PineconeClient } from '../vectordb/pinecone-client.js';
import { EmbeddingsGenerator } from '../ingestion/embeddings/embeddings-generator.js';
import { SearchResult } from '../types/search.js';

export interface VectorSearchConfig {
  pineconeApiKey: string;
  openaiApiKey: string;
  indexName: string;
  namespace?: string;
  embeddingModel?: string;
}

export class VectorSearch {
  private pinecone: PineconeClient;
  private embeddings: EmbeddingsGenerator;

  constructor(config: VectorSearchConfig) {
    this.pinecone = new PineconeClient({
      apiKey: config.pineconeApiKey,
      indexName: config.indexName,
      namespace: config.namespace,
    });

    this.embeddings = new EmbeddingsGenerator({
      apiKey: config.openaiApiKey,
      model: config.embeddingModel || 'text-embedding-3-small',
    });
  }

  /**
   * Search using vector similarity
   */
  async search(
    query: string,
    topK: number = 10,
    filter?: Record<string, unknown>
  ): Promise<SearchResult[]> {
    // Generate query embedding
    const queryEmbedding = await this.embeddings.generateEmbedding(query);

    // Search Pinecone
    const results = await this.pinecone.search(queryEmbedding, topK, filter);

    // Convert to SearchResult format
    return results.map((result) => ({
      id: result.id,
      content: (result.metadata.content as string) || '',
      score: result.score,
      metadata: {
        source: result.metadata.source as string,
        sourceType: result.metadata.sourceType as string,
        title: result.metadata.title as string | undefined,
        heading: result.metadata.heading as string | undefined,
        chunkIndex: result.metadata.chunkIndex as number | undefined,
        startLine: result.metadata.startLine as number | undefined,
        endLine: result.metadata.endLine as number | undefined,
        tokens: result.metadata.tokens as number | undefined,
      },
    }));
  }

  /**
   * Get Pinecone client for direct access
   */
  getPineconeClient(): PineconeClient {
    return this.pinecone;
  }

  /**
   * Get embeddings generator for direct access
   */
  getEmbeddingsGenerator(): EmbeddingsGenerator {
    return this.embeddings;
  }
}
