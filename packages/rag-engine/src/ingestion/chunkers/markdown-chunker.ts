/**
 * Markdown-aware chunker that preserves structure and code blocks
 */

import { Document, DocumentChunk } from '../../types/document.js';
import { BaseChunker } from './base-chunker.js';
import { countTokens } from '../../utils/token-counter.js';

interface MarkdownSection {
  type: 'text' | 'code' | 'heading';
  content: string;
  heading?: string;
  level?: number;
  startLine?: number;
  endLine?: number;
}

export class MarkdownChunker extends BaseChunker {
  chunk(document: Document): DocumentChunk[] {
    const sections = this.parseMarkdownSections(document.content);
    const chunks: DocumentChunk[] = [];
    let currentSections: MarkdownSection[] = [];
    let currentTokens = 0;
    let currentHeading = '';
    let chunkIndex = 0;

    for (const section of sections) {
      const sectionTokens = countTokens(section.content);

      // Handle headings
      if (section.type === 'heading') {
        currentHeading = section.content;

        // Start new chunk on heading if current chunk has content
        if (currentSections.length > 0) {
          const chunk = this.createChunkFromSections(
            currentSections,
            document,
            chunkIndex++,
            currentHeading
          );
          if (chunk) chunks.push(chunk);
          currentSections = [];
          currentTokens = 0;
        }

        currentSections.push(section);
        currentTokens += sectionTokens;
        continue;
      }

      // Handle code blocks (don't split)
      if (section.type === 'code' && this.options.preserveCodeBlocks) {
        if (sectionTokens > this.options.chunkSize) {
          // Code block is too large, create dedicated chunk
          if (currentSections.length > 0) {
            const chunk = this.createChunkFromSections(
              currentSections,
              document,
              chunkIndex++,
              currentHeading
            );
            if (chunk) chunks.push(chunk);
            currentSections = [];
            currentTokens = 0;
          }

          // Add code block as its own chunk
          const chunk = this.createChunkFromSections(
            [section],
            document,
            chunkIndex++,
            currentHeading
          );
          if (chunk) chunks.push(chunk);
        } else if (currentTokens + sectionTokens > this.options.chunkSize) {
          // Create chunk and start new one with code block
          if (currentSections.length > 0) {
            const chunk = this.createChunkFromSections(
              currentSections,
              document,
              chunkIndex++,
              currentHeading
            );
            if (chunk) chunks.push(chunk);
          }
          currentSections = [section];
          currentTokens = sectionTokens;
        } else {
          currentSections.push(section);
          currentTokens += sectionTokens;
        }
        continue;
      }

      // Handle regular text
      if (currentTokens + sectionTokens > this.options.chunkSize) {
        // Need to split
        if (currentSections.length > 0) {
          const chunk = this.createChunkFromSections(
            currentSections,
            document,
            chunkIndex++,
            currentHeading
          );
          if (chunk) chunks.push(chunk);
          currentSections = [];
          currentTokens = 0;
        }

        // If section itself is too large, split by tokens
        if (sectionTokens > this.options.chunkSize) {
          const textChunks = this.splitByTokens(
            section.content,
            this.options.chunkSize,
            this.options.chunkOverlap
          );

          for (const textChunk of textChunks) {
            const chunk = this.createChunk(textChunk, document, chunkIndex++, {
              heading: currentHeading,
            });
            if (chunk) chunks.push(chunk);
          }
        } else {
          currentSections.push(section);
          currentTokens += sectionTokens;
        }
      } else {
        currentSections.push(section);
        currentTokens += sectionTokens;
      }
    }

    // Add remaining sections
    if (currentSections.length > 0) {
      const chunk = this.createChunkFromSections(
        currentSections,
        document,
        chunkIndex,
        currentHeading
      );
      if (chunk) chunks.push(chunk);
    }

    return chunks;
  }

  private parseMarkdownSections(content: string): MarkdownSection[] {
    const sections: MarkdownSection[] = [];
    const lines = content.split('\n');
    let currentSection: string[] = [];
    let currentType: 'text' | 'code' | 'heading' = 'text';
    let inCodeBlock = false;
    let lineNumber = 0;
    let sectionStartLine = 0;

    for (const line of lines) {
      lineNumber++;

      // Detect code block boundaries
      if (line.trim().startsWith('```')) {
        if (inCodeBlock) {
          // End code block
          currentSection.push(line);
          sections.push({
            type: 'code',
            content: currentSection.join('\n'),
            startLine: sectionStartLine,
            endLine: lineNumber,
          });
          currentSection = [];
          inCodeBlock = false;
          currentType = 'text';
          sectionStartLine = lineNumber + 1;
        } else {
          // Start code block
          if (currentSection.length > 0) {
            sections.push({
              type: currentType,
              content: currentSection.join('\n'),
              startLine: sectionStartLine,
              endLine: lineNumber - 1,
            });
          }
          currentSection = [line];
          inCodeBlock = true;
          currentType = 'code';
          sectionStartLine = lineNumber;
        }
        continue;
      }

      // Inside code block
      if (inCodeBlock) {
        currentSection.push(line);
        continue;
      }

      // Detect headings
      const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headingMatch && !inCodeBlock) {
        // Save previous section
        if (currentSection.length > 0) {
          sections.push({
            type: currentType,
            content: currentSection.join('\n'),
            startLine: sectionStartLine,
            endLine: lineNumber - 1,
          });
        }

        // Add heading as section
        sections.push({
          type: 'heading',
          content: headingMatch[2],
          level: headingMatch[1].length,
          startLine: lineNumber,
          endLine: lineNumber,
        });

        currentSection = [];
        currentType = 'text';
        sectionStartLine = lineNumber + 1;
        continue;
      }

      // Regular text
      currentSection.push(line);
    }

    // Add final section
    if (currentSection.length > 0) {
      sections.push({
        type: currentType,
        content: currentSection.join('\n'),
        startLine: sectionStartLine,
        endLine: lineNumber,
      });
    }

    return sections;
  }

  private createChunkFromSections(
    sections: MarkdownSection[],
    document: Document,
    chunkIndex: number,
    heading: string
  ): DocumentChunk | null {
    const content = sections.map((s) => s.content).join('\n\n');
    const startLine = sections[0]?.startLine;
    const endLine = sections[sections.length - 1]?.endLine;

    return this.createChunk(content, document, chunkIndex, {
      heading,
      startLine,
      endLine,
    });
  }
}
