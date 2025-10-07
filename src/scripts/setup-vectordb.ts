#!/usr/bin/env node
/**
 * Setup script for initializing the Pinecone vector database
 */

import { config, validateConfig } from '../config/index.js';
import { PineconeClient } from '../vectordb/index.js';
import { EmbeddingsGenerator } from '../ingestion/embeddings/index.js';

async function main(): Promise<void> {
  console.log('🚀 Technical Docs AI - Vector Database Setup\n');
  console.log('═'.repeat(60));

  try {
    // Validate configuration
    validateConfig();

    // Initialize embeddings generator to get dimension
    const embeddingsGenerator = new EmbeddingsGenerator({
      apiKey: config.openai.apiKey,
      model: config.openai.embeddingModel,
    });

    const dimension = embeddingsGenerator.getEmbeddingDimension();
    console.log(`📐 Embedding Model: ${config.openai.embeddingModel}`);
    console.log(`📐 Vector Dimension: ${dimension}\n`);

    // Initialize Pinecone client
    console.log('🔌 Connecting to Pinecone...\n');
    const pinecone = new PineconeClient({
      apiKey: config.pinecone.apiKey,
      indexName: config.pinecone.indexName,
      namespace: config.pinecone.namespace,
      cloud: config.pinecone.cloud,
      region: config.pinecone.region,
    });

    // Check if index exists
    const exists = await pinecone.indexExists();

    if (exists) {
      console.log(`ℹ️  Index "${config.pinecone.indexName}" already exists\n`);

      // Get stats
      const stats = await pinecone.getStats();
      console.log('📊 Current Index Statistics:');
      console.log('─'.repeat(60));
      console.log(`Total Vectors: ${stats.totalVectorCount.toLocaleString()}`);
      console.log('\nNamespaces:');
      for (const [ns, data] of Object.entries(stats.namespaces)) {
        console.log(`  - ${ns}: ${data.recordCount.toLocaleString()} vectors`);
      }
      console.log('─'.repeat(60));

      // Warn about dimension mismatch
      console.log('\n⚠️  IMPORTANT: If dimensions don\'t match, you must recreate the index:');
      console.log('   1. Delete: npm run delete:index');
      console.log('   2. Recreate: npm run setup:vectordb');
      console.log('   3. Re-ingest: npm run ingest:docs\n');
      console.log('   To clear data only: npm run ingest:docs -- --clear\n');
    } else {
      // Create new index
      console.log(`📝 Creating new index "${config.pinecone.indexName}"...\n`);
      await pinecone.initializeIndex(dimension);
      console.log('✅ Index created successfully!\n');
    }

    console.log('═'.repeat(60));
    console.log('\n✨ Setup complete! Next steps:');
    console.log('   1. Add your documentation files to:', config.data.sourceDir);
    console.log('   2. Run: npm run ingest:docs\n');
  } catch (error) {
    console.error('\n❌ Setup failed:', error);
    process.exit(1);
  }
}

main();
