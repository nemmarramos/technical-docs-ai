#!/usr/bin/env node
/**
 * Document ingestion script
 */

import fs from 'fs/promises';
import { config, validateConfig } from '../config/index.js';
import { IngestionPipeline } from '../ingestion/index.js';

async function main(): Promise<void> {
  console.log('🚀 Technical Docs AI - Document Ingestion\n');
  console.log('═'.repeat(60));

  try {
    // Validate configuration
    validateConfig();

    // Check if source directory exists
    try {
      await fs.access(config.data.sourceDir);
    } catch {
      console.error(`❌ Source directory not found: ${config.data.sourceDir}`);
      console.log('\nPlease create the directory and add your documentation files:');
      console.log(`   mkdir -p ${config.data.sourceDir}\n`);
      process.exit(1);
    }

    // Parse command line arguments
    const args = process.argv.slice(2);
    const shouldClear = args.includes('--clear');
    const filePath = args.find((arg) => !arg.startsWith('--'));

    // Initialize pipeline
    const pipeline = new IngestionPipeline({
      openaiApiKey: config.openai.apiKey,
      pineconeApiKey: config.pinecone.apiKey,
      pineconeIndex: config.pinecone.indexName,
      embeddingModel: config.openai.embeddingModel,
      chunkSize: config.search.chunkSize,
      chunkOverlap: config.search.chunkOverlap,
      namespace: config.pinecone.namespace,
      cloud: config.pinecone.cloud,
      region: config.pinecone.region,
    });

    // Clear database if requested
    if (shouldClear) {
      console.log('⚠️  Clearing existing data...\n');
      await pipeline.clearVectorDatabase();
    }

    // Check current stats
    const statsBefore = await pipeline.getVectorDbStats();
    console.log('📊 Current Vector Database Stats:');
    console.log('─'.repeat(60));
    console.log(`Total Vectors: ${statsBefore.totalVectorCount.toLocaleString()}`);
    console.log('─'.repeat(60));

    // Run ingestion
    if (filePath) {
      console.log(`\n📄 Ingesting single file: ${filePath}\n`);
      await pipeline.ingestFile(filePath);
    } else {
      console.log(`\n📁 Ingesting directory: ${config.data.sourceDir}\n`);
      await pipeline.ingestDirectory(config.data.sourceDir);
    }

    // Show final stats
    const statsAfter = await pipeline.getVectorDbStats();
    console.log('\n📊 Final Vector Database Stats:');
    console.log('─'.repeat(60));
    console.log(`Total Vectors: ${statsAfter.totalVectorCount.toLocaleString()}`);
    console.log(
      `Added: ${(statsAfter.totalVectorCount - statsBefore.totalVectorCount).toLocaleString()}`
    );
    console.log('─'.repeat(60));

    console.log('\n✨ Ingestion complete! Your vector database is ready.\n');
  } catch (error) {
    console.error('\n❌ Ingestion failed:', error);
    process.exit(1);
  }
}

main();
