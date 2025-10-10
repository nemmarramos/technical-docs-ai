/**
 * Factory for creating QAEngine instances
 * Encapsulates configuration and dependency injection
 */

import { QAEngine } from '../../rag/qa-engine.js';
import { config } from '../../config/index.js';

export class QAEngineFactory {
  /**
   * Create a configured QAEngine instance
   */
  static create(): QAEngine {
    return new QAEngine({
      search: {
        vector: {
          pineconeApiKey: config.pinecone.apiKey,
          openaiApiKey: config.openai.apiKey,
          indexName: config.pinecone.indexName,
          namespace: config.pinecone.namespace,
          embeddingModel: config.openai.embeddingModel,
        },
        bm25: {
          k1: 1.2,
          b: 0.75,
        },
        fusion: {
          vectorWeight: config.search.vectorWeight,
          keywordWeight: config.search.keywordWeight,
        },
      },
      reranker: {
        strategy: 'mmr',
        diversityLambda: 0.5,
      },
      llm: {
        apiKey: config.openai.apiKey,
        model: config.openai.model,
      },
    });
  }
}
