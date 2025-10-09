#!/usr/bin/env node
/**
 * Demo RAG Q&A System
 * Complete pipeline: Hybrid Search → Re-ranking → LLM Generation
 */

import { config } from '../config/index.js';
import { QAEngine } from '../rag/index.js';
import { PineconeClient } from '../vectordb/index.js';

async function main(): Promise<void> {
  console.log('🚀 Technical Docs AI - RAG Q&A Demo\n');
  console.log('═'.repeat(70));

  try {
    // Initialize QA Engine
    console.log('\n📦 Initializing RAG pipeline...');
    const qaEngine = new QAEngine({
      search: {
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
      },
      reranker: {
        strategy: 'relevance',
        diversityLambda: 0.5,
      },
      promptBuilder: {
        maxContextTokens: 3000,
        maxResultsInContext: 5,
        templateType: 'default',
      },
      llm: {
        apiKey: config.openai.apiKey,
        model: 'gpt-4o-mini',
        temperature: 0.3,
        maxTokens: 2000,
      },
    });

    // Fetch documents from Pinecone for keyword indexing
    console.log('📥 Loading documents for keyword search...');
    const pinecone = new PineconeClient({
      apiKey: config.pinecone.apiKey,
      indexName: config.pinecone.indexName,
      namespace: config.pinecone.namespace,
    });

    // Get sample documents (in production, you'd load all or use a separate index)
    const sampleQuery = 'React hooks components state';
    const sampleResults = await pinecone.search(
      await qaEngine.getComponents().search.getVectorSearch().getEmbeddingsGenerator().generateEmbedding(sampleQuery),
      100
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

    await qaEngine.initialize(documents);
    console.log(`   Indexed ${documents.length} documents\n`);

    console.log('═'.repeat(70));

    // Demo questions
    const questions = [
      'How do I use React hooks?',
      'What is the difference between useState and useReducer?',
      'How can I optimize React component performance?',
    ];

    for (const question of questions) {
      console.log(`\n${'═'.repeat(70)}`);
      console.log(`\n❓ Question: ${question}\n`);
      console.log('─'.repeat(70));

      // Get answer
      const result = await qaEngine.ask(question, {
        searchStrategy: 'hybrid',
        searchOptions: { topK: 10 },
        useReranking: true,
      });

      // Display answer
      console.log('\n💬 Answer:\n');
      console.log(result.answer);

      // Display citations
      console.log('\n' + '─'.repeat(70));
      const formattedCitations = qaEngine.formatAnswerWithCitations(result);
      const citationsOnly = formattedCitations.split('\n\n').slice(1).join('\n\n');
      console.log(citationsOnly);

      // Display metadata
      console.log('\n' + '─'.repeat(70));
      console.log('\n📊 Metadata:\n');
      console.log(`   Search Time: ${result.metadata.searchTime}ms`);
      if (result.metadata.rerankTime) {
        console.log(`   Re-rank Time: ${result.metadata.rerankTime}ms`);
      }
      console.log(`   LLM Time: ${result.metadata.llmTime}ms`);
      console.log(`   Total Time: ${result.metadata.totalTime}ms`);
      console.log(`   Tokens Used: ${result.metadata.tokensUsed.total} (${result.metadata.tokensUsed.prompt} prompt + ${result.metadata.tokensUsed.completion} completion)`);
      console.log(`   Model: ${result.metadata.model}`);
      console.log(`   Sources: ${result.sources.length} documents`);
    }

    console.log('\n' + '═'.repeat(70));
    console.log('\n✅ RAG demo completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Demo failed:', error);
    process.exit(1);
  }
}

void main();
