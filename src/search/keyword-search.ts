/**
 * BM25 keyword-based search implementation
 */

import natural from 'natural';
import { SearchResult } from '../types/search.js';
import { DocumentChunk } from '../types/document.js';

export interface BM25Config {
  k1?: number; // Term frequency saturation parameter (default: 1.2)
  b?: number; // Length normalization parameter (default: 0.75)
}

export class KeywordSearch {
  private tfidf: natural.TfIdf;
  private documents: DocumentChunk[];

  constructor(_config: BM25Config = {}) {
    this.tfidf = new natural.TfIdf();
    this.documents = [];
  }

  /**
   * Index documents for keyword search
   */
  indexDocuments(documents: DocumentChunk[]): void {
    this.documents = documents;
    this.tfidf = new natural.TfIdf();

    for (const doc of documents) {
      // Combine content with metadata for better search
      const searchableText = this.createSearchableText(doc);
      this.tfidf.addDocument(searchableText);
    }

    console.log(`Indexed ${documents.length} documents for keyword search`);
  }

  /**
   * Search documents using BM25 algorithm
   */
  search(query: string, topK: number = 10): SearchResult[] {
    if (this.documents.length === 0) {
      return [];
    }

    const scores: Array<{ index: number; score: number }> = [];

    // Calculate BM25 score for each document
    this.tfidf.tfidfs(query, (i, score) => {
      if (score > 0) {
        scores.push({ index: i, score });
      }
    });

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    // Take top K results
    const topResults = scores.slice(0, topK);

    // Convert to SearchResult format
    return topResults.map(({ index, score }) => {
      const doc = this.documents[index];
      return {
        id: doc.id,
        content: doc.content,
        score: this.normalizeScore(score),
        metadata: {
          source: doc.metadata.source,
          sourceType: doc.metadata.sourceType,
          title: doc.metadata.title,
          heading: doc.metadata.heading,
          chunkIndex: doc.metadata.chunkIndex,
          startLine: doc.metadata.startLine,
          endLine: doc.metadata.endLine,
          tokens: doc.metadata.tokens,
        },
      };
    });
  }

  /**
   * Create searchable text from document chunk
   */
  private createSearchableText(doc: DocumentChunk): string {
    const parts: string[] = [doc.content];

    if (doc.metadata.title) {
      // Weight title more heavily by repeating it
      parts.push(doc.metadata.title.repeat(3));
    }

    if (doc.metadata.heading) {
      // Weight heading moderately
      parts.push(doc.metadata.heading.repeat(2));
    }

    return parts.join(' ').toLowerCase();
  }

  /**
   * Normalize BM25 scores to 0-1 range
   */
  private normalizeScore(score: number): number {
    // TF-IDF scores can vary widely, normalize using sigmoid-like function
    return 1 / (1 + Math.exp(-score / 2));
  }

  /**
   * Get document count
   */
  getDocumentCount(): number {
    return this.documents.length;
  }

  /**
   * Clear all indexed documents
   */
  clear(): void {
    this.documents = [];
    this.tfidf = new natural.TfIdf();
  }
}
