/**
 * Base document loader interface
 */

import { Document, LoaderOptions } from '../../types/document.js';

export abstract class BaseLoader {
  protected options: LoaderOptions;

  constructor(options: LoaderOptions = {}) {
    this.options = {
      encoding: 'utf-8',
      maxFileSize: 10 * 1024 * 1024, // 10MB default
      ...options,
    };
  }

  /**
   * Load a document from a file path
   */
  abstract load(filePath: string): Promise<Document>;

  /**
   * Load multiple documents from a directory
   */
  abstract loadDirectory(dirPath: string): Promise<Document[]>;

  /**
   * Check if the loader supports the given file type
   */
  abstract supports(filePath: string): boolean;

  /**
   * Generate a unique document ID
   */
  protected generateId(filePath: string): string {
    return `doc_${Buffer.from(filePath).toString('base64').substring(0, 16)}_${Date.now()}`;
  }
}
