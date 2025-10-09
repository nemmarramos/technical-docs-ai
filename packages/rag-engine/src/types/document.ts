/**
 * Core document types for the ingestion pipeline
 */

export interface Document {
  id: string;
  content: string;
  metadata: DocumentMetadata;
}

export interface DocumentMetadata {
  source: string;
  sourceType: 'markdown' | 'pdf' | 'html' | 'text';
  title?: string;
  url?: string;
  author?: string;
  createdAt?: Date;
  updatedAt?: Date;
  tags?: string[];
  [key: string]: unknown;
}

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: ChunkMetadata;
  embedding?: number[];
}

export interface ChunkMetadata extends DocumentMetadata {
  chunkIndex: number;
  startLine?: number;
  endLine?: number;
  tokens: number;
  heading?: string;
  parentDocumentId: string;
}

export interface LoaderOptions {
  encoding?: string;
  maxFileSize?: number;
}

export interface ChunkerOptions {
  chunkSize: number;
  chunkOverlap: number;
  preserveCodeBlocks?: boolean;
  preserveMarkdownStructure?: boolean;
}
