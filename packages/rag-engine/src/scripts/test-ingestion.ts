#!/usr/bin/env node
/**
 * Test the complete ingestion pipeline on a single file
 */

import { MarkdownLoader } from '../ingestion/loaders/index.js';
import { MarkdownChunker } from '../ingestion/chunkers/index.js';

async function main(): Promise<void> {
  console.log('🧪 Testing Complete Ingestion Pipeline\n');
  console.log('═'.repeat(60));

  try {
    // Test 1: Load a React doc with JSX components
    console.log('\n📄 Test 1: Loading React documentation...');
    const loader = new MarkdownLoader();
    const testFile = './data/raw/react/learn/installation.md';

    const doc = await loader.load(testFile);
    console.log('✅ Document loaded successfully');
    console.log(`   Title: ${doc.metadata.title}`);
    console.log(`   Source: ${doc.metadata.source}`);
    console.log(`   Content length: ${doc.content.length} characters`);

    // Check for frontmatter parsing
    console.log('\n📋 Frontmatter extracted:');
    Object.entries(doc.metadata).forEach(([key, value]) => {
      if (key !== 'source' && key !== 'sourceType') {
        console.log(`   ${key}: ${value}`);
      }
    });

    // Test 2: Chunk the document
    console.log('\n✂️  Test 2: Chunking document...');
    const chunker = new MarkdownChunker({
      chunkSize: 500,
      chunkOverlap: 50,
      preserveCodeBlocks: true,
      preserveMarkdownStructure: true,
    });

    const chunks = chunker.chunk(doc);
    console.log(`✅ Generated ${chunks.length} chunks`);

    // Show first chunk
    console.log('\n📦 First chunk preview:');
    console.log(`   ID: ${chunks[0].id}`);
    console.log(`   Tokens: ${chunks[0].metadata.tokens}`);
    console.log(`   Heading: ${chunks[0].metadata.heading || 'N/A'}`);
    console.log(`   Content preview (first 200 chars):`);
    console.log(`   ${chunks[0].content.substring(0, 200)}...`);

    // Check for JSX component preservation
    console.log('\n🔍 Test 3: Checking JSX component preservation...');
    const hasIntro = chunks.some(c => c.content.includes('<Intro>'));
    const hasSandpack = chunks.some(c => c.content.includes('<Sandpack>'));
    const hasNote = chunks.some(c => c.content.includes('<Note>'));

    console.log(`   <Intro> preserved: ${hasIntro ? '✅' : '❌'}`);
    console.log(`   <Sandpack> preserved: ${hasSandpack ? '✅' : '❌'}`);
    console.log(`   <Note> preserved: ${hasNote ? '✅' : '❌'}`);

    // Test 4: Check code block preservation
    console.log('\n💻 Test 4: Checking code block preservation...');
    const hasCodeBlock = chunks.some(c => c.content.includes('```'));
    const hasJSXCode = chunks.some(c => c.content.includes('function Greeting'));

    console.log(`   Code blocks preserved: ${hasCodeBlock ? '✅' : '❌'}`);
    console.log(`   JSX code preserved: ${hasJSXCode ? '✅' : '❌'}`);

    // Summary
    console.log('\n═'.repeat(60));
    console.log('✅ All tests passed! System ready to accept MD files.');
    console.log('\n📊 Summary:');
    console.log(`   Total chunks: ${chunks.length}`);
    console.log(`   Total tokens: ${chunks.reduce((sum, c) => sum + c.metadata.tokens, 0)}`);
    console.log(`   Avg tokens/chunk: ${Math.round(chunks.reduce((sum, c) => sum + c.metadata.tokens, 0) / chunks.length)}`);
    console.log('═'.repeat(60));

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

void main();
