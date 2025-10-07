/**
 * HTML document loader with content extraction
 */

import fs from 'fs/promises';
import path from 'path';
import * as cheerio from 'cheerio';
import { BaseLoader } from './base-loader.js';
import { Document } from '../../types/document.js';

export class HTMLLoader extends BaseLoader {
  supports(filePath: string): boolean {
    const ext = path.extname(filePath).toLowerCase();
    return ext === '.html' || ext === '.htm';
  }

  async load(filePath: string): Promise<Document> {
    const html = await fs.readFile(filePath, this.options.encoding as BufferEncoding);
    const $ = cheerio.load(html);

    // Remove script and style tags
    $('script, style, nav, footer, header').remove();

    // Extract main content (prioritize main, article, or body)
    const mainContent =
      $('main').text() || $('article').text() || $('body').text();

    // Clean up whitespace
    const content = mainContent
      .replace(/\s+/g, ' ')
      .replace(/\n+/g, '\n')
      .trim();

    const metadata = {
      source: filePath,
      sourceType: 'html' as const,
      title: $('title').text() || $('h1').first().text() || path.basename(filePath),
      url: $('meta[property="og:url"]').attr('content'),
      createdAt: new Date(),
    };

    return {
      id: this.generateId(filePath),
      content,
      metadata,
    };
  }

  async loadDirectory(dirPath: string): Promise<Document[]> {
    const documents: Document[] = [];
    const files = await this.getAllHTMLFiles(dirPath);

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

  private async getAllHTMLFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const subFiles = await this.getAllHTMLFiles(fullPath);
        files.push(...subFiles);
      } else if (this.supports(entry.name)) {
        files.push(fullPath);
      }
    }

    return files;
  }
}
