/**
 * Document ingestion pipeline orchestrator
 */

import path from 'path';
import { Document, DocumentChunk } from '../types/document.js';
import { BaseLoader, MarkdownLoader, PDFLoader, HTMLLoader } from './loaders/index.js';
import { MarkdownChunker, TextChunker } from './chunkers/index.js';
import { EmbeddingsGenerator } from './embeddings/index.js';
import { PineconeClient } from '../vectordb/index.js';

export interface PipelineConfig {
  openaiApiKey: string;
  pineconeApiKey: string;
  pineconeIndex: string;
  embeddingModel?: string;
  chunkSize?: number;
  chunkOverlap?: number;
  namespace?: string;
  cloud?: string;
  region?: string;
}

export interface PipelineStats {
  documentsProcessed: number;
  chunksGenerated: number;
  totalTokens: number;
  estimatedCost: number;
  startTime: Date;
  endTime?: Date;
  duration?: number;
}

export class IngestionPipeline {
  private loaders: Map<string, BaseLoader>;
  private markdownChunker: MarkdownChunker;
  private textChunker: TextChunker;
  private embeddingsGenerator: EmbeddingsGenerator;
  private vectorDb: PineconeClient;
  private stats: PipelineStats;

  constructor(config: PipelineConfig) {
    // Initialize loaders
    this.loaders = new Map<string, BaseLoader>([
      ['markdown', new MarkdownLoader()],
      ['pdf', new PDFLoader()],
      ['html', new HTMLLoader()],
    ]);

    // Initialize chunkers
    this.markdownChunker = new MarkdownChunker({
      chunkSize: config.chunkSize || 500,
      chunkOverlap: config.chunkOverlap || 50,
      preserveCodeBlocks: true,
      preserveMarkdownStructure: true,
    });

    this.textChunker = new TextChunker({
      chunkSize: config.chunkSize || 500,
      chunkOverlap: config.chunkOverlap || 50,
    });

    // Initialize embeddings generator
    this.embeddingsGenerator = new EmbeddingsGenerator({
      apiKey: config.openaiApiKey,
      model: config.embeddingModel || 'text-embedding-3-small',
      batchSize: 100,
    });

    // Initialize vector database
    this.vectorDb = new PineconeClient({
      apiKey: config.pineconeApiKey,
      indexName: config.pineconeIndex,
      namespace: config.namespace,
      cloud: config.cloud,
      region: config.region,
    });

    // Initialize stats
    this.stats = {
      documentsProcessed: 0,
      chunksGenerated: 0,
      totalTokens: 0,
      estimatedCost: 0,
      startTime: new Date(),
    };
  }

  /**
   * Run the complete ingestion pipeline for a directory
   */
  async ingestDirectory(dirPath: string): Promise<PipelineStats> {
    console.log(`\n🚀 Starting ingestion pipeline for: ${dirPath}\n`);
    this.stats.startTime = new Date();

    try {
      // Step 1: Load documents
      console.log('📄 Step 1: Loading documents...');
      const documents = await this.loadAllDocuments(dirPath);
      console.log(`   Loaded ${documents.length} documents\n`);

      // Step 2: Chunk documents
      console.log('✂️  Step 2: Chunking documents...');
      const chunks = await this.chunkDocuments(documents);
      console.log(`   Generated ${chunks.length} chunks\n`);

      // Step 3: Generate embeddings
      console.log('🔢 Step 3: Generating embeddings...');
      const embeddedChunks = await this.embeddingsGenerator.embedChunks(chunks);
      console.log(`   Generated embeddings for ${embeddedChunks.length} chunks\n`);

      // Step 4: Upsert to vector database
      console.log('💾 Step 4: Uploading to vector database...');
      await this.vectorDb.upsertChunks(embeddedChunks);
      console.log(`   Uploaded ${embeddedChunks.length} chunks\n`);

      // Calculate final stats
      this.stats.documentsProcessed = documents.length;
      this.stats.chunksGenerated = chunks.length;
      this.stats.totalTokens = chunks.reduce(
        (sum, chunk) => sum + chunk.metadata.tokens,
        0
      );
      this.stats.estimatedCost = this.embeddingsGenerator.estimateCost(
        this.stats.totalTokens
      );
      this.stats.endTime = new Date();
      this.stats.duration =
        this.stats.endTime.getTime() - this.stats.startTime.getTime();

      this.printStats();
      return this.stats;
    } catch (error) {
      console.error('❌ Pipeline failed:', error);
      throw error;
    }
  }

  /**
   * Ingest a single file
   */
  async ingestFile(filePath: string): Promise<PipelineStats> {
    console.log(`\n🚀 Starting ingestion for: ${filePath}\n`);
    this.stats.startTime = new Date();

    try {
      // Load document
      const document = await this.loadDocument(filePath);

      // Chunk document
      const chunks = this.chunkDocument(document);

      // Generate embeddings
      const embeddedChunks = await this.embeddingsGenerator.embedChunks(chunks);

      // Upload to vector database
      await this.vectorDb.upsertChunks(embeddedChunks);

      // Calculate stats
      this.stats.documentsProcessed = 1;
      this.stats.chunksGenerated = chunks.length;
      this.stats.totalTokens = chunks.reduce(
        (sum, chunk) => sum + chunk.metadata.tokens,
        0
      );
      this.stats.estimatedCost = this.embeddingsGenerator.estimateCost(
        this.stats.totalTokens
      );
      this.stats.endTime = new Date();
      this.stats.duration =
        this.stats.endTime.getTime() - this.stats.startTime.getTime();

      this.printStats();
      return this.stats;
    } catch (error) {
      console.error('❌ Pipeline failed:', error);
      throw error;
    }
  }

  /**
   * Load all documents from a directory
   */
  private async loadAllDocuments(dirPath: string): Promise<Document[]> {
    const allDocuments: Document[] = [];

    for (const [type, loader] of this.loaders) {
      console.log(`   Loading ${type} files...`);
      const docs = await loader.loadDirectory(dirPath);
      allDocuments.push(...docs);
    }

    return allDocuments;
  }

  /**
   * Load a single document
   */
  private async loadDocument(filePath: string): Promise<Document> {
    const ext = path.extname(filePath).toLowerCase();

    for (const loader of this.loaders.values()) {
      if (loader.supports(filePath)) {
        return await loader.load(filePath);
      }
    }

    throw new Error(`No loader found for file type: ${ext}`);
  }

  /**
   * Chunk all documents
   */
  private async chunkDocuments(documents: Document[]): Promise<DocumentChunk[]> {
    const allChunks: DocumentChunk[] = [];

    for (const doc of documents) {
      const chunks = this.chunkDocument(doc);
      allChunks.push(...chunks);
    }

    return allChunks;
  }

  /**
   * Chunk a single document
   */
  private chunkDocument(document: Document): DocumentChunk[] {
    // Use markdown-aware chunker for markdown files
    if (document.metadata.sourceType === 'markdown') {
      return this.markdownChunker.chunk(document);
    }

    // Use text chunker for other types
    return this.textChunker.chunk(document);
  }

  /**
   * Print pipeline statistics
   */
  private printStats(): void {
    console.log('\n📊 Pipeline Statistics:');
    console.log('─'.repeat(50));
    console.log(`Documents Processed: ${this.stats.documentsProcessed}`);
    console.log(`Chunks Generated:    ${this.stats.chunksGenerated}`);
    console.log(`Total Tokens:        ${this.stats.totalTokens.toLocaleString()}`);
    console.log(`Estimated Cost:      $${this.stats.estimatedCost.toFixed(4)}`);
    console.log(
      `Duration:            ${((this.stats.duration || 0) / 1000).toFixed(2)}s`
    );
    console.log('─'.repeat(50));
    console.log('✅ Pipeline completed successfully!\n');
  }

  /**
   * Get current pipeline statistics
   */
  getStats(): PipelineStats {
    return { ...this.stats };
  }

  /**
   * Clear all data from the vector database
   */
  async clearVectorDatabase(): Promise<void> {
    console.log('🗑️  Clearing vector database...');
    await this.vectorDb.clearNamespace();
    console.log('✅ Vector database cleared\n');
  }

  /**
   * Get vector database statistics
   */
  async getVectorDbStats(): Promise<{
    totalVectorCount: number;
    namespaces: Record<string, { recordCount: number }>;
  }> {
    return await this.vectorDb.getStats();
  }
}
