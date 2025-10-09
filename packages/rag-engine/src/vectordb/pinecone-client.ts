/**
 * Pinecone vector database client
 */

import { Pinecone, RecordMetadata, ServerlessSpecCloudEnum } from '@pinecone-database/pinecone';
import { DocumentChunk } from '../types/document.js';

export interface PineconeConfig {
  apiKey: string;
  indexName: string;
  namespace?: string;
  cloud?: string;
  region?: string;
}

export interface PineconeSearchResult {
  id: string;
  score: number;
  metadata: RecordMetadata;
}

export class PineconeClient {
  private client: Pinecone;
  private indexName: string;
  private namespace: string;
  private cloud: ServerlessSpecCloudEnum;
  private region: string;

  constructor(config: PineconeConfig) {
    this.client = new Pinecone({
      apiKey: config.apiKey,
    });
    this.indexName = config.indexName;
    this.namespace = config.namespace || 'default';
    this.cloud = (config.cloud as ServerlessSpecCloudEnum) || 'aws';
    this.region = config.region || 'us-west-2';
  }

  /**
   * Initialize the index (create if doesn't exist)
   */
  async initializeIndex(dimension: number = 1536): Promise<void> {
    try {
      const existingIndexes = await this.client.listIndexes();
      const indexExists = existingIndexes.indexes?.some(
        (index) => index.name === this.indexName
      );

      if (!indexExists) {
        console.log(`Creating index: ${this.indexName}`);
        await this.client.createIndex({
          name: this.indexName,
          dimension,
          metric: 'cosine',
          spec: {
            serverless: {
              cloud: this.cloud,
              region: this.region,
            },
          },
        });

        // Wait for index to be ready
        console.log('Waiting for index to be ready...');
        await this.waitForIndex();
      } else {
        console.log(`Index ${this.indexName} already exists`);
      }
    } catch (error) {
      console.error('Error initializing index:', error);
      throw error;
    }
  }

  /**
   * Wait for index to be ready
   */
  private async waitForIndex(maxWaitTime: number = 60000): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < maxWaitTime) {
      try {
        const index = this.client.index(this.indexName);
        const stats = await index.describeIndexStats();

        if (stats) {
          console.log('Index is ready');
          return;
        }
      } catch (error) {
        // Index not ready yet
      }

      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    throw new Error('Index creation timeout');
  }

  /**
   * Upsert document chunks to the vector database
   */
  async upsertChunks(chunks: DocumentChunk[]): Promise<void> {
    const index = this.client.index(this.indexName);
    const batchSize = 100;

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const vectors = batch.map((chunk) => ({
        id: chunk.id,
        values: chunk.embedding || [],
        metadata: {
          content: chunk.content,
          source: chunk.metadata.source,
          sourceType: chunk.metadata.sourceType,
          title: chunk.metadata.title,
          chunkIndex: chunk.metadata.chunkIndex,
          tokens: chunk.metadata.tokens,
          heading: chunk.metadata.heading,
          startLine: chunk.metadata.startLine,
          endLine: chunk.metadata.endLine,
          parentDocumentId: chunk.metadata.parentDocumentId,
        } as RecordMetadata,
      }));

      await index.namespace(this.namespace).upsert(vectors);

      console.log(
        `Upserted ${Math.min(i + batchSize, chunks.length)}/${chunks.length} chunks`
      );
    }
  }

  /**
   * Search for similar vectors
   */
  async search(
    queryEmbedding: number[],
    topK: number = 10,
    filter?: Record<string, unknown>
  ): Promise<PineconeSearchResult[]> {
    const index = this.client.index(this.indexName);

    const results = await index.namespace(this.namespace).query({
      vector: queryEmbedding,
      topK,
      includeMetadata: true,
      filter,
    });

    return results.matches.map((match) => ({
      id: match.id,
      score: match.score || 0,
      metadata: match.metadata || {},
    }));
  }

  /**
   * Delete all vectors in the namespace
   */
  async clearNamespace(): Promise<void> {
    const index = this.client.index(this.indexName);
    await index.namespace(this.namespace).deleteAll();
    console.log(`Cleared namespace: ${this.namespace}`);
  }

  /**
   * Delete specific chunks by IDs
   */
  async deleteChunks(chunkIds: string[]): Promise<void> {
    const index = this.client.index(this.indexName);
    await index.namespace(this.namespace).deleteMany(chunkIds);
    console.log(`Deleted ${chunkIds.length} chunks`);
  }

  /**
   * Get index statistics
   */
  async getStats(): Promise<{
    totalVectorCount: number;
    namespaces: Record<string, { recordCount: number }>;
  }> {
    const index = this.client.index(this.indexName);
    const stats = await index.describeIndexStats();

    return {
      totalVectorCount: stats.totalRecordCount || 0,
      namespaces: stats.namespaces || {},
    };
  }

  /**
   * Check if index exists
   */
  async indexExists(): Promise<boolean> {
    try {
      const existingIndexes = await this.client.listIndexes();
      return (
        existingIndexes.indexes?.some((index) => index.name === this.indexName) || false
      );
    } catch (error) {
      return false;
    }
  }
}
