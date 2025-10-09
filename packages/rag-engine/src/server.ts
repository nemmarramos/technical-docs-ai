/**
 * Express API Server for RAG Engine
 * Provides HTTP endpoints for document search and Q&A
 */

import express, { Request, Response } from 'express';
import cors from 'cors';
import { QAEngine } from './rag/qa-engine.js';
import { config } from './config/index.js';
import type { Citation } from './types/prompt.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize RAG engine
const qaEngine = new QAEngine({
  search: {
    vector: {
      pineconeApiKey: config.pinecone.apiKey,
      openaiApiKey: config.openai.apiKey,
      indexName: config.pinecone.indexName,
      namespace: config.pinecone.namespace,
      embeddingModel: config.openai.embeddingModel,
    },
    bm25: {
      k1: 1.2,
      b: 0.75,
    },
    fusion: {
      vectorWeight: config.search.vectorWeight,
      keywordWeight: config.search.keywordWeight,
    },
  },
  reranker: {
    strategy: 'mmr',
    diversityLambda: 0.5,
  },
  llm: {
    apiKey: config.openai.apiKey,
    model: config.openai.model,
  },
});

// Store conversation history in memory (for demo - use database in production)
interface ConversationMessage {
  id: string;
  query: string;
  answer: string;
  sources: Citation[];
  cost: {
    searchCost: number;
    llmCost: number;
    totalCost: number;
  };
  timestamp: number;
}

const conversationHistory: ConversationMessage[] = [];

// Initialize the keyword index with documents from vector DB
let isIndexReady = false;

async function initializeKeywordIndex(): Promise<void> {
  try {
    console.log('🔤 Initializing keyword search index...');
    // For now, we'll initialize with an empty array and rely only on vector search
    // In production, you would load documents from Pinecone and index them
    await qaEngine.initialize([]);
    isIndexReady = true;
    console.log('✅ Keyword index initialized (using vector-only search)');
  } catch (error) {
    console.error('⚠️  Warning: Could not initialize keyword index:', error);
    console.log('   Using vector-only search mode');
    isIndexReady = true; // Allow server to continue
  }
}

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Search endpoint - returns search results only (no Q&A)
app.post('/api/search', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query is required and must be a string' });
      return;
    }

    // Check if index is ready
    if (!isIndexReady) {
      res.status(503).json({
        error: 'Service initializing',
        message: 'Search index is still being initialized. Please try again in a moment.'
      });
      return;
    }

    // Run Q&A to get search results (use vector-only search)
    const result = await qaEngine.ask(query, { searchStrategy: 'vector' });

    // Transform to frontend format
    const transformedResults = result.searchResults.map((searchResult, index) => ({
      id: searchResult.id || `result_${index}`,
      content: searchResult.content,
      metadata: {
        source: searchResult.metadata?.source || 'Unknown',
        heading: searchResult.metadata?.heading,
        lineStart: searchResult.metadata?.lineStart,
        lineEnd: searchResult.metadata?.lineEnd,
      },
      score: searchResult.score,
    }));

    res.json({
      query,
      results: transformedResults,
      metadata: {
        resultCount: transformedResults.length,
        searchTimeMs: result.metadata.searchTime,
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Q&A endpoint - full RAG pipeline
app.post('/api/qa', async (req: Request, res: Response) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      res.status(400).json({ error: 'Query is required and must be a string' });
      return;
    }

    // Check if index is ready
    if (!isIndexReady) {
      res.status(503).json({
        error: 'Service initializing',
        message: 'Keyword index is still being initialized. Please try again in a moment.'
      });
      return;
    }

    // Run Q&A pipeline (use vector-only since keyword index may not have documents)
    const result = await qaEngine.ask(query, { searchStrategy: 'vector' });

    // Calculate costs (simplified)
    const searchCost = 0.0001; // Embedding API cost
    const llmCost = (result.metadata.tokensUsed.total / 1000000) * 0.15; // GPT-4o-mini pricing
    const totalCost = searchCost + llmCost;

    // Transform Citations and SearchResults to frontend format
    const transformedSources = result.searchResults.map((searchResult, index) => ({
      id: searchResult.id || `source_${index}`,
      content: searchResult.content,
      metadata: {
        source: searchResult.metadata?.source || 'Unknown',
        heading: searchResult.metadata?.heading,
        lineStart: searchResult.metadata?.lineStart,
        lineEnd: searchResult.metadata?.lineEnd,
      },
      score: searchResult.score,
    }));

    // Store in conversation history
    const message: ConversationMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      query,
      answer: result.answer,
      sources: result.sources,
      cost: {
        searchCost,
        llmCost,
        totalCost,
      },
      timestamp: Date.now(),
    };
    conversationHistory.push(message);

    res.json({
      id: message.id,
      query,
      answer: result.answer,
      sources: transformedSources,
      cost: message.cost,
      timestamp: message.timestamp,
    });
  } catch (error) {
    console.error('Q&A error:', error);
    res.status(500).json({
      error: 'Q&A failed',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Get conversation history
app.get('/api/history', (_req: Request, res: Response) => {
  // Transform citations to frontend format for each message
  const transformedHistory = conversationHistory.map((msg) => ({
    ...msg,
    sources: msg.sources.map((citation, index) => ({
      id: `${msg.id}_source_${index}`,
      content: citation.title || '',
      metadata: {
        source: citation.source,
        heading: citation.heading,
        lineStart: citation.startLine,
        lineEnd: citation.endLine,
      },
      score: 1.0,
    })),
  }));

  res.json({
    messages: transformedHistory,
    totalMessages: transformedHistory.length,
  });
});

// Clear conversation history
app.delete('/api/history', (_req: Request, res: Response) => {
  conversationHistory.length = 0;
  res.json({ message: 'Conversation history cleared' });
});

// Get cost analytics
app.get('/api/analytics/cost', (_req: Request, res: Response) => {
  const totalCost = conversationHistory.reduce((sum, msg) => sum + msg.cost.totalCost, 0);
  const avgCost =
    conversationHistory.length > 0 ? totalCost / conversationHistory.length : 0;

  res.json({
    totalQueries: conversationHistory.length,
    totalCost: parseFloat(totalCost.toFixed(4)),
    averageCostPerQuery: parseFloat(avgCost.toFixed(4)),
    breakdown: {
      searchCost: conversationHistory.reduce((sum, msg) => sum + msg.cost.searchCost, 0),
      llmCost: conversationHistory.reduce((sum, msg) => sum + msg.cost.llmCost, 0),
    },
  });
});

// Start server and initialize
app.listen(PORT, async () => {
  console.log(`\n🚀 RAG Engine API Server running on http://localhost:${PORT}`);
  console.log(`\nEndpoints:`);
  console.log(`  GET  /health              - Health check`);
  console.log(`  POST /api/search          - Vector search`);
  console.log(`  POST /api/qa              - Q&A with RAG pipeline`);
  console.log(`  GET  /api/history         - Get conversation history`);
  console.log(`  DELETE /api/history       - Clear conversation history`);
  console.log(`  GET  /api/analytics/cost  - Get cost analytics`);
  console.log();

  // Initialize keyword index in background
  initializeKeywordIndex().catch(console.error);
});

export default app;
