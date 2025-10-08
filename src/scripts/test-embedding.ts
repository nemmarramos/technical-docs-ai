#!/usr/bin/env node
/**
 * Test embedding generation with validation
 */

import { config } from '../config/index.js';
import { EmbeddingsGenerator } from '../ingestion/embeddings/index.js';

async function main(): Promise<void> {
  console.log('🧪 Testing Embedding Generation with Validation\n');

  try {
    const generator = new EmbeddingsGenerator({
      apiKey: config.openai.apiKey,
      model: config.openai.embeddingModel,
    });

    // Test 1: Normal text
    console.log('Test 1: Normal text...');
    const text1 = 'React is a JavaScript library for building user interfaces.';
    const embedding1 = await generator.generateEmbedding(text1);
    console.log(`✅ Generated embedding with ${embedding1.length} dimensions\n`);

    // Test 2: Multiple texts
    console.log('Test 2: Multiple texts...');
    const texts = [
      'useState is a React Hook.',
      'useEffect lets you perform side effects.',
      'Components are reusable pieces of UI.',
    ];
    const embeddings = await generator.generateEmbeddings(texts);
    console.log(`✅ Generated ${embeddings.length} embeddings\n`);

    // Test 3: Text with special characters
    console.log('Test 3: Text with JSX and code...');
    const jsxText = `
function App() {
  return <div>Hello World</div>;
}
    `;
    await generator.generateEmbedding(jsxText);
    console.log(`✅ JSX text embedded successfully\n`);

    console.log('✅ All embedding tests passed!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

void main();
