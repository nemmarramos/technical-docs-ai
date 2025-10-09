/**
 * Prompt template types for RAG
 */

import { SearchResult } from './search.js';

export interface PromptTemplate {
  system: string;
  user: string;
}

export interface PromptContext {
  query: string;
  searchResults: SearchResult[];
  maxContextLength?: number;
  includeMetadata?: boolean;
}

export interface GeneratedPrompt {
  systemPrompt: string;
  userPrompt: string;
  contextUsed: SearchResult[];
  totalTokens: number;
  truncated: boolean;
}

export interface Citation {
  source: string;
  title?: string;
  heading?: string;
  startLine?: number;
  endLine?: number;
  chunkIndex?: number;
}
