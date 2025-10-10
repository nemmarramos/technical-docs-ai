# Technical Docs AI - Full-Stack RAG Application

> Production-ready Retrieval-Augmented Generation system with React frontend for semantic documentation search

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://reactjs.org/)

## 🎯 Overview

A complete **full-stack RAG (Retrieval-Augmented Generation)** application combining:
- 🎨 **Modern React Frontend** - Beautiful UI with real-time search, conversation history, and cost tracking
- ⚡ **Express API Backend** - RESTful API with hybrid search and Q&A endpoints
- 🔍 **Hybrid Search Engine** - Vector (semantic) + keyword (BM25) search with fusion
- 🤖 **LLM Integration** - GPT-4o-mini with streaming support for real-time responses
- 📚 **Smart Citations** - Automatic source document highlighting and references

### ✨ Latest Updates

#### 🏗️ Milestone 4 - Layered Architecture (October 2025) ✅
**NEW:** Backend refactored with clean architecture principles following 2025 best practices!

**Architecture Improvements**:
- 📐 **Layered Architecture** - Presentation, Application, Domain, Infrastructure layers
- 🔧 **Dependency Injection** - Centralized DI container for all dependencies
- 📦 **Repository Pattern** - Abstract data access (easy to swap memory → PostgreSQL)
- 🎯 **Service Layer** - Business logic separated from HTTP concerns
- 🏭 **Factory Pattern** - Clean creation of complex domain objects
- ✅ **Testable** - Mock interfaces, test layers in isolation
- 🔄 **Flexible** - Swap implementations without changing business logic

See [ARCHITECTURE_SUMMARY.md](./ARCHITECTURE_SUMMARY.md) for details.

#### ✅ Milestone 3 - Frontend Complete
**Full-stack application with React frontend is now live!**

**Frontend Features**:
- 🎨 **Beautiful Dark UI** - Modern design with Tailwind CSS
- 🔍 **Real-time Search** - Instant Q&A with streaming responses
- 📝 **Conversation History** - Track all your queries and answers
- 📊 **Cost Analytics** - Live tracking of API costs per query
- 📚 **Source Highlighting** - View and explore source documents
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile

**Backend Features**:
- 🚀 **Express API Server** - RESTful endpoints for search and Q&A
- 🔄 **Streaming Support** - Server-Sent Events for real-time responses
- 💾 **Repository Pattern** - Pluggable storage (memory/database)
- 🔍 **Hybrid Search** - Combines vector + keyword search
- 📊 **Re-ranking** - MMR for optimal result ordering

## 🎬 Demo

![Technical Docs AI Demo](./assets/technical-docs-ai-ui.gif)

*Full-stack RAG application in action: Real-time search, AI-generated answers with citations, conversation history, and cost tracking*

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Pinecone API key ([Get one here](https://www.pinecone.io/))

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/technical-docs-ai.git
cd technical-docs-ai

# Install all dependencies (monorepo)
npm install

# Configure backend environment
cd packages/rag-engine
cp .env.example .env
# Edit .env with your API keys

# Return to root
cd ../..
```

### Environment Configuration

Edit `packages/rag-engine/.env`:

```bash
# OpenAI
OPENAI_API_KEY=sk-...
EMBEDDING_MODEL=text-embedding-3-small
LLM_MODEL=gpt-4o-mini

# Pinecone
PINECONE_API_KEY=...
PINECONE_INDEX=technical-docs
PINECONE_REGION=us-east-1

# Server
PORT=3001
```

### Running the Application

```bash
# Option 1: Run both frontend and backend together
npm run dev

# Option 2: Run separately
npm run dev:backend    # Backend on http://localhost:3001
npm run dev:frontend   # Frontend on http://localhost:3000
```

### First Time Setup

```bash
# 1. Set up vector database (one-time)
cd packages/rag-engine
npm run setup:vectordb

# 2. Ingest documentation (React docs included)
npm run ingest:docs

# 3. Start the application
cd ../..
npm run dev
```

Then open your browser to **http://localhost:3000**

## 🏗️ Architecture

This project follows a **Layered Architecture Pattern** based on clean architecture principles:

```
┌─────────────────────────────────────────────┐
│         Presentation Layer                  │  ← HTTP Controllers & Routes
├─────────────────────────────────────────────┤
│         Application Layer                   │  ← Services & Use Cases
├─────────────────────────────────────────────┤
│         Domain Layer                        │  ← RAG Engine & Core Logic
├─────────────────────────────────────────────┤
│         Infrastructure Layer                │  ← Repositories & External APIs
└─────────────────────────────────────────────┘
```

**Key Benefits**:
- ✅ Separation of concerns
- ✅ Easy to test and maintain
- ✅ Flexible to swap implementations
- ✅ Ready for microservices

📖 See [ARCHITECTURE_SUMMARY.md](./ARCHITECTURE_SUMMARY.md) for detailed documentation.

## 📁 Project Structure

```
technical-docs-ai/                    # Monorepo root
├── packages/
│   ├── rag-engine/                   # Backend - RAG Engine & API
│   │   ├── src/
│   │   │   ├── presentation/        # Layer 1: Controllers & Routes
│   │   │   ├── application/         # Layer 2: Services & Interfaces
│   │   │   ├── infrastructure/      # Layer 4: Repositories & DI
│   │   │   ├── rag/                 # Layer 3: RAG Q&A engine
│   │   │   ├── search/              # Layer 3: Hybrid search system
│   │   │   ├── reranking/           # Layer 3: Re-ranking strategies
│   │   │   ├── prompts/             # Layer 3: Prompt templates
│   │   │   ├── llm/                 # Layer 3: LLM integration
│   │   │   ├── ingestion/           # Document loaders & chunkers
│   │   │   ├── vectordb/            # Pinecone client
│   │   │   ├── scripts/             # CLI tools
│   │   │   └── server.ts            # Express API server
│   │   ├── data/raw/                # Source documentation
│   │   ├── ARCHITECTURE.md          # Detailed architecture docs
│   │   └── package.json
│   │
│   └── frontend/                     # Frontend - React App
│       ├── src/
│       │   ├── App.tsx              # Main application
│       │   ├── components/          # React components
│       │   │   ├── SearchInput.tsx
│       │   │   ├── AnswerDisplay.tsx
│       │   │   ├── SourceCard.tsx
│       │   │   ├── ConversationHistory.tsx
│       │   │   └── CostTracker.tsx
│       │   ├── hooks/               # Custom React hooks
│       │   ├── api/                 # API client
│       │   └── types/               # TypeScript types
│       └── package.json
│
├── package.json                      # Root package (workspaces)
├── ARCHITECTURE_SUMMARY.md           # Architecture overview
└── README.md
```

## 🎨 Frontend Features

### Real-time Search
- **Instant Q&A** - Ask questions and get AI-generated answers with sources
- **Streaming Responses** - See answers appear in real-time (optional)
- **Smart Suggestions** - Example questions to get you started

### Conversation History
- **Track All Queries** - Never lose your previous questions
- **Quick Navigation** - Click any previous query to view its results
- **Clear History** - Remove all conversations with one click

### Source Documents
- **Highlighted Sources** - See exactly which documents were used
- **Relevance Scores** - Know how well each source matches your query
- **Context Display** - View source location, heading, and line numbers
- **Syntax Highlighting** - Code snippets displayed beautifully

### Cost Analytics
- **Real-time Tracking** - Monitor API costs as you use the app
- **Query Statistics** - Total queries, average cost per query
- **Cost Breakdown** - Separate search and LLM costs
- **Auto-refresh** - Updates every 5 seconds

## 🔌 API Endpoints

### Backend Server (Port 3001)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/search` | POST | Hybrid search (no AI answer) |
| `/api/qa` | POST | Full Q&A with RAG pipeline |
| `/api/history` | GET | Get conversation history |
| `/api/history` | DELETE | Clear conversation history |
| `/api/analytics/cost` | GET | Get cost analytics |

### Example API Usage

```bash
# Search for documents
curl -X POST http://localhost:3001/api/search \
  -H "Content-Type: application/json" \
  -d '{"query": "What are React hooks?", "topK": 10}'

# Ask a question
curl -X POST http://localhost:3001/api/qa \
  -H "Content-Type: application/json" \
  -d '{"query": "How do I use useEffect?", "stream": false}'

# Get cost analytics
curl http://localhost:3001/api/analytics/cost
```

## 🛠️ Tech Stack

### Frontend
| Component | Technology |
|-----------|-----------|
| **Framework** | React 18.3 |
| **Language** | TypeScript 5.9 |
| **Build Tool** | Vite 7.1 |
| **Styling** | Tailwind CSS 3.4 |
| **Icons** | Lucide React |
| **Markdown** | react-markdown |

### Backend
| Component | Technology |
|-----------|-----------|
| **Runtime** | Node.js 18+ |
| **Framework** | Express 4.18 |
| **Language** | TypeScript 5.3 |
| **LLM** | OpenAI GPT-4o-mini |
| **Embeddings** | text-embedding-3-small |
| **Vector DB** | Pinecone |
| **Keyword Search** | natural (BM25) |

## 📈 Performance

### Frontend
- **First Load** - < 2 seconds
- **Search Response** - 8-12 seconds (full RAG pipeline)
- **UI Updates** - Instant (React 18)
- **Bundle Size** - ~500 KB (optimized)

### Backend
- **Search Time** - 1.3-2.4 seconds
- **Re-ranking** - 2-5 ms
- **LLM Generation** - 5-10 seconds
- **Total End-to-End** - 7-12 seconds

### Costs
- **Per Query** - $0.01-0.03
- **Ingestion** - ~$0.02 (one-time)
- **Vector Storage** - Free tier (100K vectors)

## 📚 Available Scripts

### Root (Monorepo)
```bash
npm run dev                # Run both frontend & backend
npm run dev:frontend       # Run only frontend
npm run dev:backend        # Run only backend
npm run build              # Build both packages
npm run typecheck          # Type check all packages
npm run lint               # Lint all packages
```

### Backend (packages/rag-engine)
```bash
npm run dev                # Start API server (dev mode)
npm run build              # Build TypeScript
npm run start              # Start production server
npm run setup:vectordb     # Initialize Pinecone
npm run ingest:docs        # Ingest documentation
npm run demo:rag           # CLI demo (no server)
```

### Frontend (packages/frontend)
```bash
npm run dev                # Start dev server
npm run build              # Build for production
npm run preview            # Preview production build
npm run typecheck          # Type check
npm run lint               # Lint code
```

## 🎯 Usage Examples

### Basic Search
1. Open http://localhost:3000
2. Type a question like "What are React hooks?"
3. View the AI answer and source documents
4. Check cost analytics in the sidebar

### Conversation History
1. Ask multiple questions
2. View all queries in the right sidebar
3. Click any previous query to view it again
4. Clear history when done

### Cost Tracking
1. Monitor costs in real-time
2. View total queries and average cost
3. See breakdown of search vs LLM costs
4. Analytics update automatically

## 🔧 Configuration

### Backend Configuration
Edit `packages/rag-engine/.env`:
- `CHUNK_SIZE` - Tokens per chunk (default: 500)
- `CHUNK_OVERLAP` - Overlap between chunks (default: 50)
- `PORT` - API server port (default: 3001)

### Frontend Configuration
Edit `packages/frontend/vite.config.ts`:
- API proxy configuration
- Port settings
- Build optimizations

## 🚧 Development Roadmap

### ✅ Milestone 1 - Core Infrastructure (Completed)
- [x] Document ingestion pipeline
- [x] Markdown/PDF/HTML support
- [x] Intelligent chunking
- [x] Vector embeddings
- [x] Pinecone integration

### ✅ Milestone 2 - RAG Pipeline (Completed)
- [x] Hybrid search (vector + keyword)
- [x] Re-ranking layer (MMR, Diversity, Relevance)
- [x] Prompt templates with context injection
- [x] LLM integration with streaming
- [x] Complete Q&A engine with citations

### ✅ Milestone 3 - Full-Stack Application (Completed)
- [x] Express API server
- [x] React frontend with Tailwind CSS
- [x] Real-time search interface
- [x] Conversation history
- [x] Cost tracking dashboard
- [x] Source document highlighting

### 🔜 Milestone 4 - Production Enhancements (Coming Soon)
- [ ] Streaming responses in UI
- [ ] User authentication & sessions
- [ ] Redis caching layer
- [ ] Database persistence (PostgreSQL)
- [ ] Advanced analytics dashboard
- [ ] Error logging & monitoring

### 🔮 Milestone 5 - Advanced Features (Future)
- [ ] Multi-user support with permissions
- [ ] File upload for custom documentation
- [ ] Fine-tuned embeddings
- [ ] Multi-modal support (images, diagrams)
- [ ] Agentic workflows
- [ ] Custom model integration

## 🤝 Contributing

Contributions welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React documentation from [react.dev](https://react.dev)
- OpenAI for embeddings and LLM
- Pinecone for vector database
- Vite for blazing fast development

## 📞 Support

- 📧 Email: nemmar.ramos@gmail.com
- 🐛 Issues: [GitHub Issues](https://github.com/yourusername/technical-docs-ai/issues)
- 📖 Docs: [Project Wiki](https://github.com/yourusername/technical-docs-ai/wiki)

---

**Built with ❤️ by Nemmar Ramos**
