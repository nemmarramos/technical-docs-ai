#!/usr/bin/env node
/**
 * Delete Pinecone index to recreate with correct dimensions
 */

import { config, validateConfig } from '../config/index.js';
import { Pinecone } from '@pinecone-database/pinecone';

async function main(): Promise<void> {
  console.log('🗑️  Deleting Pinecone Index\n');
  console.log('═'.repeat(60));

  try {
    validateConfig();

    const client = new Pinecone({
      apiKey: config.pinecone.apiKey,
    });

    // Check if index exists
    const existingIndexes = await client.listIndexes();
    const indexExists = existingIndexes.indexes?.some(
      (index) => index.name === config.pinecone.indexName
    );

    if (!indexExists) {
      console.log(`ℹ️  Index "${config.pinecone.indexName}" does not exist. Nothing to delete.\n`);
      return;
    }

    console.log(`⚠️  About to delete index: ${config.pinecone.indexName}`);
    console.log('   This action cannot be undone!');
    console.log('   All vectors will be permanently deleted.\n');

    // Get index stats before deletion
    try {
      const index = client.index(config.pinecone.indexName);
      const stats = await index.describeIndexStats();
      console.log('📊 Current Index Stats:');
      console.log(`   Total vectors: ${stats.totalRecordCount || 0}`);
      console.log(`   Namespaces: ${Object.keys(stats.namespaces || {}).join(', ') || 'none'}`);
    } catch (error) {
      console.log('   (Could not retrieve stats)');
    }

    console.log('\n🔥 Deleting index...');
    await client.deleteIndex(config.pinecone.indexName);

    console.log('✅ Index deleted successfully!\n');
    console.log('Next steps:');
    console.log('   1. Run: npm run setup:vectordb');
    console.log('   2. Run: npm run ingest:docs\n');

  } catch (error) {
    console.error('\n❌ Failed to delete index:', error);
    process.exit(1);
  }
}

void main();
