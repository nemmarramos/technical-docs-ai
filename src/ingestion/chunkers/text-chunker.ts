/**
 * Simple text chunker for plain text and other formats
 */

import { Document, DocumentChunk } from '../../types/document.js';
import { BaseChunker } from './base-chunker.js';

export class TextChunker extends BaseChunker {
  chunk(document: Document): DocumentChunk[] {
    const chunks: DocumentChunk[] = [];
    const textChunks = this.splitByTokens(
      document.content,
      this.options.chunkSize,
      this.options.chunkOverlap
    );

    for (let i = 0; i < textChunks.length; i++) {
      const chunk = this.createChunk(textChunks[i], document, i);
      if (chunk) {
        chunks.push(chunk);
      }
    }

    return chunks;
  }
}
