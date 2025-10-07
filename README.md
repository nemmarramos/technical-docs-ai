# Technical Docs AI - Intelligent Documentation Search

> Production-ready RAG system for semantic documentation search with intelligent chunking and vector embeddings.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)

## 🎯 Overview

An AI-powered documentation search system that understands technical queries semantically, providing accurate answers with source citations. Built to demonstrate production-grade ML engineering practices.

### Key Capabilities

- 🔍 **Semantic Search** - Vector embeddings for meaning-based retrieval
- 📚 **Smart Chunking** - Markdown-aware splitting that preserves code blocks
- 🎯 **Source Citations** - Every answer includes file paths and line numbers
- ⚡ **Fast Processing** - Sub-2 second response times
- 💰 **Cost Efficient** - ~$0.02-0.05 per query with optimizations

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Pinecone API key ([Get one here](https://www.pinecone.io/))

### Installation

```bash
# Clone and install
git clone https://github.com/yourusername/technical-docs-ai.git
cd technical-docs-ai
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API keys
```

### Configuration

Edit `.env` with your credentials:

```bash
# OpenAI (for embeddings)
OPENAI_API_KEY=sk-...
EMBEDDING_MODEL=text-embedding-3-small

# Pinecone (vector database)
PINECONE_API_KEY=...
PINECONE_INDEX=technical-docs
PINECONE_REGION=us-east-1  # Free tier: use us-east-1

# Optional: Customize chunking
CHUNK_SIZE=500
CHUNK_OVERLAP=50
```

### Usage

```bash
# 1. Initialize vector database
npm run setup:vectordb

# 2. Add documentation to data/raw/
#    (216 React docs already included)

# 3. Process and embed documents
npm run ingest:docs

# 4. Query your docs (coming soon in v2.0)
npm run query "How do I use React hooks?"
```

## 📊 Example: React Documentation

Included dataset: **216 React documentation files** from [react.dev](https://react.dev)

**Processing stats:**
- Documents: 216 markdown files
- Chunks generated: ~3,754
- Tokens processed: ~500K-1M
- Embedding cost: ~$0.01-0.02
- Processing time: 5-10 minutes
- Storage: ~22 MB (3.7% of free tier)

## 🏗️ Architecture

### Data Ingestion Pipeline

```
Markdown Files → Loader → Chunker → Embeddings → Vector DB
     ↓              ↓         ↓           ↓           ↓
  216 docs    Parse YAML  Preserve   OpenAI API  Pinecone
                          code blocks   (1536d)   (100K free)
```

### Components

**Document Loaders**
- `MarkdownLoader` - Parses frontmatter, preserves structure
- `PDFLoader` - Extracts text from PDFs
- `HTMLLoader` - Content extraction with Cheerio

**Intelligent Chunking**
- `MarkdownChunker` - Respects headings, never splits code blocks
- 500 tokens per chunk with 50-token overlap
- Maintains context via heading metadata

**Embedding Generation**
- OpenAI `text-embedding-3-small` (1536 dimensions)
- Batch processing (100 texts at a time)
- Automatic retry with exponential backoff

**Vector Storage**
- Pinecone serverless index
- Includes metadata: source, heading, line numbers
- Free tier: 100K vectors, 5GB storage

## 📁 Project Structure

```
technical-docs-ai/
├── src/
│   ├── types/              # TypeScript type definitions
│   ├── config/             # Environment configuration
│   ├── ingestion/
│   │   ├── loaders/        # Document loaders (MD, PDF, HTML)
│   │   ├── chunkers/       # Text chunking strategies
│   │   └── embeddings/     # Embedding generation
│   ├── vectordb/           # Pinecone client
│   ├── scripts/            # CLI tools
│   └── utils/              # Helper functions
├── data/
│   └── raw/                # Source documentation
│       └── react/          # React docs (216 files)
└── docs/                   # Additional documentation
```

## 🛠️ Tech Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Runtime** | Node.js 18+ | JavaScript execution |
| **Language** | TypeScript 5.3+ | Strict type safety with no `any` types |
| **Embeddings** | OpenAI API | Vector generation |
| **Vector DB** | Pinecone | Similarity search |
| **Parsing** | markdown-it, cheerio, pdf-parse | Document loading |
| **Tokens** | tiktoken | Token counting |

## 📈 Performance Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| Chunk generation | < 1 min | ~30 sec (216 docs) |
| Embedding generation | < 10 min | ~5-8 min (3,754 chunks) |
| Cost per ingestion | < $0.05 | ~$0.02 |
| Vector upload | < 2 min | ~1-2 min (100 batch) |

## 🧪 Testing & Quality

```bash
# Type checking (strict mode enabled)
npm run typecheck

# Code quality checks
npm run validate     # Run typecheck + lint
npm run lint         # ESLint validation
npm run format       # Prettier formatting

# Test document loading and chunking (no API calls)
npm run test:ingestion

# Test embedding generation (requires OpenAI key)
npm run test:embedding

# Run full pipeline with validation
npm run ingest:docs
```

### Code Quality Standards

- ✅ **Strict TypeScript** - `strict: true` with zero `any` types
- ✅ **No unused variables** - `noUnusedLocals` and `noUnusedParameters` enabled
- ✅ **Explicit returns** - `noImplicitReturns` enforced
- ✅ **Type safety** - All Pinecone SDK types properly typed
- ✅ **ESLint** - Consistent code style
- ✅ **Prettier** - Automated formatting

## 📚 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run setup:vectordb` | Initialize Pinecone index |
| `npm run ingest:docs` | Process and upload documents |
| `npm run delete:index` | Delete Pinecone index |
| `npm run test:ingestion` | Test chunking pipeline |
| `npm run test:embedding` | Test OpenAI embeddings |
| `npm run build` | Compile TypeScript |
| `npm run typecheck` | Run TypeScript type checking |
| `npm run lint` | Check code style with ESLint |
| `npm run format` | Format code with Prettier |
| `npm run validate` | Run typecheck + lint together |

## 🔧 Configuration Options

### Chunking Strategy

```bash
# .env
CHUNK_SIZE=500           # Target tokens per chunk
CHUNK_OVERLAP=50         # Overlap for context preservation
```

**Trade-offs:**
- Larger chunks → More context, fewer API calls, less precise
- Smaller chunks → More precise, more API calls, less context

### Embedding Models

| Model | Dimensions | Cost | Use Case |
|-------|-----------|------|----------|
| `text-embedding-3-small` | 1536 | $0.02/1M | **Recommended** - Best value |
| `text-embedding-3-large` | 3072 | $0.13/1M | Higher accuracy |
| `text-embedding-ada-002` | 1536 | $0.10/1M | Legacy |

### Pinecone Free Tier

**Limitations:**
- 100,000 vectors maximum
- 5 GB storage
- AWS `us-east-1` region only
- 1 index per project

**Current usage:** 3,754 vectors (~3.7% of limit)

## 🚧 Roadmap

### v1.0 (Current)
- ✅ Document ingestion pipeline
- ✅ Markdown/PDF/HTML support
- ✅ Intelligent chunking
- ✅ Vector embeddings
- ✅ Pinecone integration
- ✅ Strict TypeScript with zero `any` types
- ✅ Comprehensive type checking

### v2.0 (Planned)
- [ ] Query interface with CLI
- [ ] Hybrid search (vector + keyword)
- [ ] Re-ranking with cross-encoder
- [ ] Response generation with citations
- [ ] Redis caching layer

### v3.0 (Future)
- [ ] Web UI with React
- [ ] Multi-modal support (images)
- [ ] Fine-tuned embeddings
- [ ] Agentic workflows
- [ ] User feedback loop

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Code quality checks
npm run typecheck    # Type checking
npm run lint         # Linting
npm run format       # Format code
npm run validate     # Typecheck + lint

# Build for production
npm run build
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React documentation from [react.dev](https://react.dev)
- OpenAI for embedding models
- Pinecone for vector database

## 📞 Support

- 📧 Email: nemmar.ramos@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/technical-docs-ai/issues)
- 📖 Docs: [Project Wiki](https://github.com/yourusername/technical-docs-ai/wiki)

---

**Built with ❤️ by Nemmar Ramos**
