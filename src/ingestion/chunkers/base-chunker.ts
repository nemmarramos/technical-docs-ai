/**
 * Base text chunker interface
 */

import { Document, DocumentChunk, ChunkerOptions } from '../../types/document.js';
import { countTokens } from '../../utils/token-counter.js';

export abstract class BaseChunker {
  protected options: ChunkerOptions;

  constructor(options: Partial<ChunkerOptions> = {}) {
    this.options = {
      chunkSize: 500,
      chunkOverlap: 50,
      preserveCodeBlocks: true,
      preserveMarkdownStructure: true,
      ...options,
    };
  }

  /**
   * Split a document into chunks
   */
  abstract chunk(document: Document): DocumentChunk[];

  /**
   * Create a chunk with metadata
   */
  protected createChunk(
    content: string,
    document: Document,
    chunkIndex: number,
    additionalMetadata: Record<string, unknown> = {}
  ): DocumentChunk | null {
    // Validate content
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      console.warn(`Skipping empty chunk for document: ${document.id}`);
      return null;
    }

    return {
      id: `${document.id}_chunk_${chunkIndex}`,
      content: trimmedContent,
      metadata: {
        ...document.metadata,
        chunkIndex,
        tokens: countTokens(trimmedContent),
        parentDocumentId: document.id,
        ...additionalMetadata,
      },
    };
  }

  /**
   * Split text by token count
   */
  protected splitByTokens(text: string, maxTokens: number, overlap: number): string[] {
    const chunks: string[] = [];
    const words = text.split(/\s+/);
    let currentChunk: string[] = [];
    let currentTokens = 0;

    for (const word of words) {
      const wordTokens = countTokens(word);

      if (currentTokens + wordTokens > maxTokens && currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));

        // Keep overlap
        const overlapWords = this.getOverlapWords(currentChunk, overlap);
        currentChunk = overlapWords;
        currentTokens = countTokens(currentChunk.join(' '));
      }

      currentChunk.push(word);
      currentTokens += wordTokens;
    }

    if (currentChunk.length > 0) {
      chunks.push(currentChunk.join(' '));
    }

    return chunks;
  }

  /**
   * Get overlap words from the end of a chunk
   */
  private getOverlapWords(words: string[], overlapTokens: number): string[] {
    const overlapWords: string[] = [];
    let tokens = 0;

    for (let i = words.length - 1; i >= 0; i--) {
      const wordTokens = countTokens(words[i]);
      if (tokens + wordTokens > overlapTokens) break;

      overlapWords.unshift(words[i]);
      tokens += wordTokens;
    }

    return overlapWords;
  }
}
