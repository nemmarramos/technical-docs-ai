#!/usr/bin/env node
/**
 * Test hybrid search functionality
 */

import { config } from '../config/index.js';
import { HybridSearch } from '../search/index.js';
import { PineconeClient } from '../vectordb/index.js';

async function main(): Promise<void> {
  console.log('🔍 Testing Hybrid Search System\n');
  console.log('═'.repeat(70));

  try {
    // Initialize hybrid search
    console.log('\n📦 Initializing hybrid search...');
    const hybridSearch = new HybridSearch({
      vector: {
        pineconeApiKey: config.pinecone.apiKey,
        openaiApiKey: config.openai.apiKey,
        indexName: config.pinecone.indexName,
        namespace: config.pinecone.namespace,
        embeddingModel: config.openai.embeddingModel,
      },
      fusion: {
        vectorWeight: 0.6,
        keywordWeight: 0.4,
      },
    });

    // Get all documents from Pinecone for keyword indexing
    console.log('📥 Fetching documents from Pinecone...');
    const pinecone = new PineconeClient({
      apiKey: config.pinecone.apiKey,
      indexName: config.pinecone.indexName,
      namespace: config.pinecone.namespace,
    });

    // Get stats to see how many documents we have
    const stats = await pinecone.getStats();
    console.log(`   Found ${stats.totalVectorCount} total vectors in index`);

    // For testing, we'll fetch a sample of documents
    // In production, you'd fetch all documents or use a separate keyword index
    const sampleQuery = 'React hooks useState useEffect';
    const sampleResults = await pinecone.search(
      await hybridSearch.getVectorSearch().getEmbeddingsGenerator().generateEmbedding(sampleQuery),
      100 // Fetch more documents for keyword indexing
    );

    const documents = sampleResults.map((result) => ({
      id: result.id,
      content: (result.metadata.content as string) || '',
      metadata: {
        source: result.metadata.source as string,
        sourceType: (result.metadata.sourceType as 'markdown' | 'pdf' | 'html' | 'text') || 'markdown',
        title: result.metadata.title as string | undefined,
        heading: result.metadata.heading as string | undefined,
        chunkIndex: result.metadata.chunkIndex as number,
        startLine: result.metadata.startLine as number | undefined,
        endLine: result.metadata.endLine as number | undefined,
        tokens: result.metadata.tokens as number,
        parentDocumentId: result.id,
      },
      embedding: [] as number[],
    }));

    console.log(`   Indexing ${documents.length} documents for keyword search...\n`);
    await hybridSearch.indexDocuments(documents);

    // Test queries
    const testQueries = [
      'How do I use React hooks?',
      'useState and useEffect examples',
      'What is the difference between props and state?',
    ];

    for (const query of testQueries) {
      console.log('─'.repeat(70));
      console.log(`\n🔎 Query: "${query}"\n`);

      // Test vector search
      console.log('📊 Vector Search Results:');
      const vectorResults = await hybridSearch.search(query, 'vector', { topK: 5 });
      displayResults(vectorResults.results, 3);

      // Test keyword search
      console.log('\n📊 Keyword Search Results:');
      const keywordResults = await hybridSearch.search(query, 'keyword', { topK: 5 });
      displayResults(keywordResults.results, 3);

      // Test hybrid search
      console.log('\n📊 Hybrid Search Results:');
      const hybridResults = await hybridSearch.search(query, 'hybrid', { topK: 5 });
      displayResults(hybridResults.results, 5);

      console.log('\n📈 Search Metrics:');
      console.log(`   Total Results: ${hybridResults.searchMetrics.totalResults}`);
      console.log(`   Vector Results: ${hybridResults.searchMetrics.vectorResults}`);
      console.log(`   Keyword Results: ${hybridResults.searchMetrics.keywordResults}`);
      console.log(`   Search Time: ${hybridResults.searchMetrics.searchTime}ms`);
      console.log(`   Vector Weight: ${hybridResults.searchMetrics.vectorWeight.toFixed(2)}`);
      console.log(`   Keyword Weight: ${hybridResults.searchMetrics.keywordWeight.toFixed(2)}`);
      console.log();
    }

    console.log('═'.repeat(70));
    console.log('\n✅ Hybrid search tests completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

function displayResults(results: Array<{ content: string; score: number; metadata: { source?: string; heading?: string } }>, limit: number): void {
  results.slice(0, limit).forEach((result, index) => {
    console.log(`   ${index + 1}. Score: ${result.score.toFixed(4)}`);
    console.log(`      Source: ${result.metadata.source || 'N/A'}`);
    if (result.metadata.heading) {
      console.log(`      Heading: ${result.metadata.heading}`);
    }
    console.log(`      Content: ${result.content.substring(0, 100)}...`);
    console.log();
  });
}

void main();
