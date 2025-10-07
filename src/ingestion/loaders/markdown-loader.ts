/**
 * Markdown document loader with metadata extraction
 */

import fs from 'fs/promises';
import path from 'path';
import { BaseLoader } from './base-loader.js';
import { Document, LoaderOptions } from '../../types/document.js';

export class MarkdownLoader extends BaseLoader {
  constructor(options: LoaderOptions = {}) {
    super(options);
  }

  supports(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return ext === '.md' || ext === '.markdown';
  }

  async load(filePath: string): Promise<Document> {
    const content = await fs.readFile(filePath, this.options.encoding as BufferEncoding);
    const metadata = this.extractMetadata(content);

    return {
      id: this.generateId(filePath),
      content,
      metadata: {
        source: filePath,
        sourceType: 'markdown',
        ...metadata,
      },
    };
  }

  async loadDirectory(dirPath: string): Promise<Document[]> {
    const documents: Document[] = [];
    const files = await this.getAllMarkdownFiles(dirPath);

    for (const file of files) {
      try {
        const doc = await this.load(file);
        documents.push(doc);
      } catch (error) {
        console.error(`Error loading ${file}:`, error);
      }
    }

    return documents;
  }

  private async getAllMarkdownFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const subFiles = await this.getAllMarkdownFiles(fullPath);
        files.push(...subFiles);
      } else if (this.supports(entry.name)) {
        files.push(fullPath);
      }
    }

    return files;
  }

  private extractMetadata(content: string) {
    const metadata: Record<string, unknown> = {
      title: this.extractTitle(content),
      createdAt: new Date(),
    };

    // Extract frontmatter if present (YAML between --- markers)
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      const lines = frontmatter.split('\n');

      for (const line of lines) {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
          const value = valueParts.join(':').trim();
          metadata[key.trim()] = value;
        }
      }
    }

    return metadata;
  }

  private extractTitle(content: string): string {
    // Look for first H1 heading
    const h1Match = content.match(/^#\s+(.+)$/m);
    if (h1Match) {
      return h1Match[1].trim();
    }

    // Fallback to first line if non-empty
    const firstLine = content.split('\n')[0];
    return firstLine.trim() || 'Untitled';
  }
}
