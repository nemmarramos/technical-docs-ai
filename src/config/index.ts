/**
 * Configuration management
 */

import dotenv from 'dotenv';

dotenv.config();

export interface Config {
  openai: {
    apiKey: string;
    model: string;
    embeddingModel: string;
  };
  pinecone: {
    apiKey: string;
    indexName: string;
    namespace: string;
    cloud: string;
    region: string;
  };
  search: {
    vectorWeight: number;
    keywordWeight: number;
    chunkSize: number;
    chunkOverlap: number;
    topKResults: number;
  };
  data: {
    sourceDir: string;
    processedDir: string;
  };
}

function getEnvVar(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvNumber(key: string, defaultValue: number): number {
  const value = process.env[key];
  if (!value) return defaultValue;

  const num = parseFloat(value);
  if (isNaN(num)) {
    throw new Error(`Invalid number for environment variable ${key}: ${value}`);
  }
  return num;
}

export const config: Config = {
  openai: {
    apiKey: getEnvVar('OPENAI_API_KEY'),
    model: getEnvVar('OPENAI_MODEL', 'gpt-4-turbo-preview'),
    embeddingModel: getEnvVar('EMBEDDING_MODEL', 'text-embedding-3-small'),
  },
  pinecone: {
    apiKey: getEnvVar('PINECONE_API_KEY'),
    indexName: getEnvVar('PINECONE_INDEX', 'technical-docs'),
    namespace: getEnvVar('PINECONE_NAMESPACE', 'default'),
    cloud: getEnvVar('PINECONE_CLOUD', 'aws'),
    region: getEnvVar('PINECONE_REGION', 'us-east-1'), // Free tier default
  },
  search: {
    vectorWeight: getEnvNumber('VECTOR_WEIGHT', 0.7),
    keywordWeight: getEnvNumber('KEYWORD_WEIGHT', 0.3),
    chunkSize: getEnvNumber('CHUNK_SIZE', 500),
    chunkOverlap: getEnvNumber('CHUNK_OVERLAP', 50),
    topKResults: getEnvNumber('TOP_K_RESULTS', 10),
  },
  data: {
    sourceDir: getEnvVar('DATA_SOURCE_DIR', './data/raw'),
    processedDir: getEnvVar('DATA_PROCESSED_DIR', './data/processed'),
  },
};

export function validateConfig(): void {
  console.log('🔍 Validating configuration...\n');

  const errors: string[] = [];

  // Validate OpenAI config
  if (!config.openai.apiKey.startsWith('sk-')) {
    errors.push('OPENAI_API_KEY appears to be invalid (should start with sk-)');
  }

  // Validate weights
  if (config.search.vectorWeight + config.search.keywordWeight !== 1.0) {
    errors.push(
      `VECTOR_WEIGHT (${config.search.vectorWeight}) + KEYWORD_WEIGHT (${config.search.keywordWeight}) must equal 1.0`
    );
  }

  // Validate chunk settings
  if (config.search.chunkSize <= config.search.chunkOverlap) {
    errors.push('CHUNK_SIZE must be greater than CHUNK_OVERLAP');
  }

  if (errors.length > 0) {
    console.error('❌ Configuration validation failed:\n');
    errors.forEach((error) => console.error(`   - ${error}`));
    console.error('\n');
    throw new Error('Invalid configuration');
  }

  console.log('✅ Configuration validated successfully\n');
}
