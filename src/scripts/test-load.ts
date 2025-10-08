#!/usr/bin/env node
/**
 * Test script to verify data loading
 */

import { MarkdownLoader } from '../ingestion/loaders/index.js';

async function main(): Promise<void> {
  console.log('🧪 Testing document loader...\n');

  try {
    const loader = new MarkdownLoader();
    const testFile = './data/raw/react/index.md';

    console.log(`Loading: ${testFile}`);
    const doc = await loader.load(testFile);

    console.log('\n✅ Successfully loaded document:');
    console.log(`   ID: ${doc.id}`);
    console.log(`   Source: ${doc.metadata.source}`);
    console.log(`   Title: ${doc.metadata.title}`);
    console.log(`   Content length: ${doc.content.length} characters`);
    console.log(`   Content preview: ${doc.content.substring(0, 100)}...`);

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

void main();
