/**
 * Embedding generation using OpenAI API
 */

import OpenAI from 'openai';
import { DocumentChunk } from '../../types/document.js';

export interface EmbeddingOptions {
  apiKey: string;
  model?: string;
  batchSize?: number;
  maxRetries?: number;
}

export class EmbeddingsGenerator {
  private client: OpenAI;
  private model: string;
  private batchSize: number;
  private maxRetries: number;

  constructor(options: EmbeddingOptions) {
    this.client = new OpenAI({
      apiKey: options.apiKey,
    });
    this.model = options.model || 'text-embedding-3-small';
    this.batchSize = options.batchSize || 100;
    this.maxRetries = options.maxRetries || 3;
  }

  /**
   * Generate embeddings for a single chunk
   */
  async generateEmbedding(text: string): Promise<number[]> {
    const embeddings = await this.generateEmbeddings([text]);
    return embeddings[0];
  }

  /**
   * Generate embeddings for multiple texts in batches
   */
  async generateEmbeddings(texts: string[]): Promise<number[][]> {
    const allEmbeddings: number[][] = [];

    // Process in batches
    for (let i = 0; i < texts.length; i += this.batchSize) {
      const batch = texts.slice(i, i + this.batchSize);
      const batchEmbeddings = await this.generateBatch(batch);
      allEmbeddings.push(...batchEmbeddings);

      // Log progress
      console.log(
        `Generated embeddings for ${Math.min(i + this.batchSize, texts.length)}/${texts.length} texts`
      );
    }

    return allEmbeddings;
  }

  /**
   * Generate embeddings for document chunks
   */
  async embedChunks(chunks: DocumentChunk[]): Promise<DocumentChunk[]> {
    // Filter out empty chunks and clean content
    const validChunks = chunks.filter((chunk) => {
      const cleanContent = chunk.content.trim();
      if (!cleanContent) {
        console.warn(`Skipping empty chunk: ${chunk.id}`);
        return false;
      }
      return true;
    });

    if (validChunks.length === 0) {
      console.warn('No valid chunks to embed');
      return [];
    }

    // Clean and normalize text content
    const texts = validChunks.map((chunk) => {
      // Remove null bytes and other invalid characters
      return chunk.content.replace(/\0/g, '').trim();
    });

    const embeddings = await this.generateEmbeddings(texts);

    return validChunks.map((chunk, index) => ({
      ...chunk,
      embedding: embeddings[index],
    }));
  }

  /**
   * Generate embeddings for a batch with retry logic
   */
  private async generateBatch(texts: string[]): Promise<number[][]> {
    // Validate and clean input
    if (!texts || texts.length === 0) {
      throw new Error('No texts provided for embedding generation');
    }

    // Filter out empty strings and validate content
    const validTexts = texts.filter((text) => {
      if (!text || typeof text !== 'string') {
        console.warn('Skipping invalid text input');
        return false;
      }
      const cleaned = text.trim();
      if (!cleaned) {
        console.warn('Skipping empty text input');
        return false;
      }
      return true;
    });

    if (validTexts.length === 0) {
      throw new Error('All texts were empty or invalid');
    }

    // Clean texts - remove null bytes and normalize whitespace
    const cleanedTexts = validTexts.map((text) =>
      text.replace(/\0/g, '').replace(/\s+/g, ' ').trim()
    );

    let lastError: Error | null = null;

    for (let attempt = 0; attempt < this.maxRetries; attempt++) {
      try {
        const response = await this.client.embeddings.create({
          model: this.model,
          input: cleanedTexts,
          encoding_format: 'float',
        });

        return response.data.map((item) => item.embedding);
      } catch (error) {
        lastError = error as Error;
        console.error(
          `Embedding generation attempt ${attempt + 1} failed:`,
          error
        );

        // Log first text sample for debugging
        if (attempt === 0) {
          console.error('Sample text (first 200 chars):', cleanedTexts[0]?.substring(0, 200));
          console.error('Number of texts in batch:', cleanedTexts.length);
        }

        if (attempt < this.maxRetries - 1) {
          // Exponential backoff
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error(
      `Failed to generate embeddings after ${this.maxRetries} attempts: ${lastError?.message}`
    );
  }

  /**
   * Get the embedding dimension for the current model
   */
  getEmbeddingDimension(): number {
    const dimensions: Record<string, number> = {
      'text-embedding-3-small': 1536,
      'text-embedding-3-large': 3072,
      'text-embedding-ada-002': 1536,
    };

    return dimensions[this.model] || 1536;
  }

  /**
   * Calculate cost estimate for embedding generation
   */
  estimateCost(numTokens: number): number {
    // Pricing per 1M tokens (as of 2024)
    const pricing: Record<string, number> = {
      'text-embedding-3-small': 0.02,
      'text-embedding-3-large': 0.13,
      'text-embedding-ada-002': 0.10,
    };

    const pricePerMillion = pricing[this.model] || 0.02;
    return (numTokens / 1_000_000) * pricePerMillion;
  }
}
