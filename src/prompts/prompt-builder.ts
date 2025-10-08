/**
 * Prompt builder with context injection
 */

import { PromptTemplate, PromptContext, GeneratedPrompt, Citation } from '../types/prompt.js';
import { SearchResult } from '../types/search.js';
import { countTokens } from '../utils/token-counter.js';
import { getTemplate } from './templates.js';

export interface PromptBuilderConfig {
  maxContextTokens?: number; // Max tokens for context (default: 3000)
  maxResultsInContext?: number; // Max number of search results to include (default: 10)
  template?: PromptTemplate;
  templateType?: 'default' | 'concise' | 'code' | 'comparison' | 'tutorial';
}

export class PromptBuilder {
  private maxContextTokens: number;
  private maxResultsInContext: number;
  private template: PromptTemplate;

  constructor(config: PromptBuilderConfig = {}) {
    this.maxContextTokens = config.maxContextTokens ?? 3000;
    this.maxResultsInContext = config.maxResultsInContext ?? 10;

    if (config.template) {
      this.template = config.template;
    } else {
      this.template = getTemplate(config.templateType);
    }
  }

  /**
   * Build prompts with injected context
   */
  buildPrompt(context: PromptContext): GeneratedPrompt {
    const { query, searchResults } = context;

    // Limit number of results
    const resultsToUse = searchResults.slice(0, this.maxResultsInContext);

    // Build context string with token management
    const { contextString, contextUsed, truncated } = this.buildContextString(
      resultsToUse,
      context.includeMetadata ?? true
    );

    // Replace placeholders in templates
    const systemPrompt = this.template.system;
    const userPrompt = this.template.user
      .replace('{{QUERY}}', query)
      .replace('{{CONTEXT}}', contextString);

    // Calculate total tokens
    const totalTokens = countTokens(systemPrompt) + countTokens(userPrompt);

    return {
      systemPrompt,
      userPrompt,
      contextUsed,
      totalTokens,
      truncated,
    };
  }

  /**
   * Build context string from search results
   */
  private buildContextString(
    results: SearchResult[],
    includeMetadata: boolean
  ): {
    contextString: string;
    contextUsed: SearchResult[];
    truncated: boolean;
  } {
    const contextParts: string[] = [];
    const contextUsed: SearchResult[] = [];
    let currentTokens = 0;
    let truncated = false;

    for (const result of results) {
      const contextBlock = this.formatResultAsContext(result, includeMetadata);
      const blockTokens = countTokens(contextBlock);

      // Check if adding this block would exceed max tokens
      if (currentTokens + blockTokens > this.maxContextTokens) {
        truncated = true;
        break;
      }

      contextParts.push(contextBlock);
      contextUsed.push(result);
      currentTokens += blockTokens;
    }

    const contextString = contextParts.join('\n\n---\n\n');

    return {
      contextString,
      contextUsed,
      truncated,
    };
  }

  /**
   * Format a single search result as context
   */
  private formatResultAsContext(result: SearchResult, includeMetadata: boolean): string {
    const parts: string[] = [];

    // Add metadata header
    if (includeMetadata) {
      const metadataLines: string[] = [];

      if (result.metadata.source) {
        metadataLines.push(`Source: ${result.metadata.source}`);
      }

      if (result.metadata.title) {
        metadataLines.push(`Title: ${result.metadata.title}`);
      }

      if (result.metadata.heading) {
        metadataLines.push(`Section: ${result.metadata.heading}`);
      }

      if (metadataLines.length > 0) {
        parts.push(`[${metadataLines.join(' | ')}]`);
      }
    }

    // Add content
    parts.push(result.content);

    return parts.join('\n');
  }

  /**
   * Extract citations from search results
   */
  extractCitations(results: SearchResult[]): Citation[] {
    return results.map((result) => ({
      source: result.metadata.source,
      title: result.metadata.title,
      heading: result.metadata.heading,
      startLine: result.metadata.startLine,
      endLine: result.metadata.endLine,
      chunkIndex: result.metadata.chunkIndex,
    }));
  }

  /**
   * Format citations as markdown
   */
  formatCitations(citations: Citation[]): string {
    const lines = ['## Sources\n'];

    // Group by source file
    const bySource = new Map<string, Citation[]>();

    for (const citation of citations) {
      if (!bySource.has(citation.source)) {
        bySource.set(citation.source, []);
      }
      bySource.get(citation.source)!.push(citation);
    }

    // Format each source
    for (const [source, cites] of bySource.entries()) {
      const firstCite = cites[0];
      let line = `- **${source}**`;

      if (firstCite.title) {
        line += ` - ${firstCite.title}`;
      }

      // Add section info if multiple sections
      const sections = new Set(cites.map((c) => c.heading).filter(Boolean));
      if (sections.size > 0) {
        line += ` (${Array.from(sections).join(', ')})`;
      }

      lines.push(line);
    }

    return lines.join('\n');
  }

  /**
   * Update template
   */
  setTemplate(template: PromptTemplate): void {
    this.template = template;
  }

  /**
   * Get current template
   */
  getTemplate(): PromptTemplate {
    return { ...this.template };
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<PromptBuilderConfig>): void {
    if (config.maxContextTokens !== undefined) {
      this.maxContextTokens = config.maxContextTokens;
    }
    if (config.maxResultsInContext !== undefined) {
      this.maxResultsInContext = config.maxResultsInContext;
    }
    if (config.template) {
      this.template = config.template;
    }
  }
}
