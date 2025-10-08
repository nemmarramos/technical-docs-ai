/**
 * RAG Q&A Engine - Combines search, re-ranking, and LLM generation
 */

import { HybridSearch, HybridSearchConfig, SearchStrategy, SearchOptions } from '../search/index.js';
import { Reranker, RerankerConfig } from '../reranking/index.js';
import { PromptBuilder, PromptBuilderConfig } from '../prompts/index.js';
import { OpenAIClient } from '../llm/index.js';
import { LLMConfig, LLMResponse, StreamCallback } from '../types/llm.js';
import { SearchResult } from '../types/search.js';
import { Citation } from '../types/prompt.js';
import { DocumentChunk } from '../types/document.js';

export interface QAEngineConfig {
  search: HybridSearchConfig;
  reranker?: RerankerConfig;
  promptBuilder?: PromptBuilderConfig;
  llm: LLMConfig;
}

export interface QAOptions {
  searchStrategy?: SearchStrategy;
  searchOptions?: SearchOptions;
  useReranking?: boolean;
  stream?: boolean | StreamCallback;
}

export interface QAResult {
  question: string;
  answer: string;
  sources: Citation[];
  searchResults: SearchResult[];
  metadata: {
    searchTime: number;
    rerankTime?: number;
    llmTime: number;
    totalTime: number;
    tokensUsed: {
      prompt: number;
      completion: number;
      total: number;
    };
    model: string;
  };
}

export class QAEngine {
  private hybridSearch: HybridSearch;
  private reranker: Reranker;
  private promptBuilder: PromptBuilder;
  private llmClient: OpenAIClient;

  constructor(config: QAEngineConfig) {
    this.hybridSearch = new HybridSearch(config.search);
    this.reranker = new Reranker(config.reranker);
    this.promptBuilder = new PromptBuilder(config.promptBuilder);
    this.llmClient = new OpenAIClient(config.llm);
  }

  /**
   * Index documents for keyword search
   */
  async initialize(documents: DocumentChunk[]): Promise<void> {
    await this.hybridSearch.indexDocuments(documents);
  }

  /**
   * Answer a question using RAG pipeline
   */
  async ask(question: string, options: QAOptions = {}): Promise<QAResult> {
    const startTime = Date.now();

    // Default options
    const searchStrategy = options.searchStrategy ?? 'hybrid';
    const useReranking = options.useReranking ?? true;
    const stream = options.stream ?? false;

    // Step 1: Search
    console.log('🔍 Searching documentation...');
    const searchStartTime = Date.now();
    const searchResults = await this.hybridSearch.search(
      question,
      searchStrategy,
      options.searchOptions
    );
    const searchTime = Date.now() - searchStartTime;
    console.log(`   Found ${searchResults.results.length} results in ${searchTime}ms`);

    // Step 2: Re-rank (optional)
    let finalResults = searchResults.results;
    let rerankTime = 0;

    if (useReranking && searchResults.results.length > 0) {
      console.log('📊 Re-ranking results...');
      const rerankStartTime = Date.now();
      const reranked = this.reranker.rerank(
        searchResults.results,
        question,
        options.searchOptions?.topK ?? 5
      );
      finalResults = reranked.results;
      rerankTime = Date.now() - rerankStartTime;
      console.log(`   Re-ranked to ${finalResults.length} results in ${rerankTime}ms`);
    }

    // Step 3: Build prompts with context
    console.log('📝 Building prompts...');
    const generatedPrompt = this.promptBuilder.buildPrompt({
      query: question,
      searchResults: finalResults,
    });

    if (generatedPrompt.truncated) {
      console.log('   ⚠️  Context truncated to fit token limit');
    }

    // Step 4: Generate answer
    console.log('🤖 Generating answer...');
    const llmStartTime = Date.now();
    let llmResponse: LLMResponse;

    if (stream && typeof options.stream === 'function') {
      // Streaming response
      llmResponse = await this.llmClient.generateStreamingResponse(
        generatedPrompt.systemPrompt,
        generatedPrompt.userPrompt,
        options.stream
      );
    } else {
      // Non-streaming response
      llmResponse = await this.llmClient.generateResponse(
        generatedPrompt.systemPrompt,
        generatedPrompt.userPrompt
      );
    }

    const llmTime = Date.now() - llmStartTime;
    const totalTime = Date.now() - startTime;

    console.log(`   Generated answer in ${llmTime}ms`);
    console.log(`✅ Total time: ${totalTime}ms\n`);

    // Extract citations
    const sources = this.promptBuilder.extractCitations(generatedPrompt.contextUsed);

    return {
      question,
      answer: llmResponse.answer,
      sources,
      searchResults: finalResults,
      metadata: {
        searchTime,
        rerankTime: useReranking ? rerankTime : undefined,
        llmTime,
        totalTime,
        tokensUsed: llmResponse.tokensUsed,
        model: llmResponse.model,
      },
    };
  }

  /**
   * Answer with streaming response
   */
  async askStreaming(
    question: string,
    onChunk: StreamCallback,
    options: Omit<QAOptions, 'stream'> = {}
  ): Promise<QAResult> {
    return this.ask(question, {
      ...options,
      stream: onChunk as never,
    });
  }

  /**
   * Format answer with citations
   */
  formatAnswerWithCitations(result: QAResult): string {
    const parts: string[] = [];

    // Add answer
    parts.push(result.answer);
    parts.push('');

    // Add citations
    const citationsMarkdown = this.promptBuilder.formatCitations(result.sources);
    parts.push(citationsMarkdown);

    return parts.join('\n');
  }

  /**
   * Get components for fine-tuning
   */
  getComponents(): {
    search: HybridSearch;
    reranker: Reranker;
    promptBuilder: PromptBuilder;
    llm: OpenAIClient;
  } {
    return {
      search: this.hybridSearch,
      reranker: this.reranker,
      promptBuilder: this.promptBuilder,
      llm: this.llmClient,
    };
  }
}
