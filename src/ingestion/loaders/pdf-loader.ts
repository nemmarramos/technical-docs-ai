/**
 * PDF document loader
 */

import fs from 'fs/promises';
import path from 'path';
import { BaseLoader } from './base-loader.js';
import { Document } from '../../types/document.js';

export class PDFLoader extends BaseLoader {
  supports(filePath: string): boolean {
    return path.extname(filePath).toLowerCase() === '.pdf';
  }

  async load(filePath: string): Promise<Document> {
    // Lazy load pdf-parse to avoid import-time errors
    const pdfParse = (await import('pdf-parse')).default;
    const buffer = await fs.readFile(filePath);
    const data = await pdfParse(buffer);

    return {
      id: this.generateId(filePath),
      content: data.text,
      metadata: {
        source: filePath,
        sourceType: 'pdf',
        title: data.info?.Title || path.basename(filePath, '.pdf'),
        author: data.info?.Author,
        createdAt: data.info?.CreationDate ? new Date(data.info.CreationDate) : new Date(),
        pages: data.numpages,
      },
    };
  }

  async loadDirectory(dirPath: string): Promise<Document[]> {
    const documents: Document[] = [];
    const files = await this.getAllPDFFiles(dirPath);

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

  private async getAllPDFFiles(dirPath: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        const subFiles = await this.getAllPDFFiles(fullPath);
        files.push(...subFiles);
      } else if (this.supports(entry.name)) {
        files.push(fullPath);
      }
    }

    return files;
  }
}
