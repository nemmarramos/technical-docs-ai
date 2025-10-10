# Technical Docs AI - Architecture Summary

## Architecture Overview

This project implements a **Layered Architecture Pattern** following clean architecture principles and 2025 best practices for production RAG systems.

## Architecture Diagram

```
┌───────────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                              │
│                     React Frontend (Port 3000)                        │
└──────────────────────────────┬────────────────────────────────────────┘
                               │ HTTP/REST API
                               ▼
┌───────────────────────────────────────────────────────────────────────┐
│                    BACKEND (Express Server - Port 3001)               │
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │              PRESENTATION LAYER                                  │ │
│  │  • Controllers (QA, Conversation, Analytics, Health)            │ │
│  │  • Routes (HTTP endpoint mappings)                              │ │
│  │  • Middlewares (CORS, JSON parsing)                             │ │
│  └────────────────────────┬────────────────────────────────────────┘ │
│                           │                                            │
│  ┌─────────────────────────▼────────────────────────────────────────┐ │
│  │              APPLICATION LAYER                                   │ │
│  │  • Services (QAService, ConversationService, AnalyticsService)  │ │
│  │  • Interfaces (IQAService, IConversationRepository, etc.)       │ │
│  │  • Use Cases (Business orchestration)                           │ │
│  └────────────┬─────────────────────────────┬──────────────────────┘ │
│               │                             │                         │
│  ┌────────────▼──────────────┐   ┌──────────▼─────────────────────┐ │
│  │     DOMAIN LAYER          │   │   INFRASTRUCTURE LAYER         │ │
│  │  • RAG Engine             │   │  • Repositories (Memory/DB)    │ │
│  │  • Hybrid Search          │   │  • External APIs Factory       │ │
│  │    - Vector Search        │   │  • DI Container                │ │
│  │    - Keyword Search       │   │  • Persistence Layer           │ │
│  │    - Fusion               │◄──┤                                │ │
│  │  • Re-ranking (MMR)       │   └────────────────────────────────┘ │
│  │  • Prompt Building        │                                       │
│  │  • LLM Client             │                                       │
│  └───────────────────────────┘                                       │
│                                                                        │
└─────────────────────────────┬──────────────────────────────────────┘
                              │
                              ▼
               ┌──────────────────────────────┐
               │    EXTERNAL SERVICES         │
               │  • Pinecone (Vector DB)      │
               │  • OpenAI (Embeddings + LLM) │
               └──────────────────────────────┘
```

## Layer Responsibilities

### 1. **Presentation Layer** (`packages/rag-engine/src/presentation/`)
- **What**: HTTP interface (Controllers, Routes, Middlewares)
- **Responsibility**: Handle HTTP requests/responses
- **Example**: `QAController.askQuestion()` handles POST `/api/qa`

### 2. **Application Layer** (`packages/rag-engine/src/application/`)
- **What**: Business orchestration (Services, Use Cases, Interfaces)
- **Responsibility**: Coordinate business workflows
- **Example**: `QAService.ask()` orchestrates RAG pipeline and cost calculation

### 3. **Domain Layer** (`packages/rag-engine/src/rag|search|reranking|prompts|llm/`)
- **What**: Core business logic (RAG algorithms)
- **Responsibility**: Pure business logic, no external dependencies
- **Example**: `QAEngine` executes search → rerank → prompt → LLM

### 4. **Infrastructure Layer** (`packages/rag-engine/src/infrastructure/`)
- **What**: External integrations (Repositories, APIs, DI)
- **Responsibility**: Handle data persistence and external services
- **Example**: `InMemoryConversationRepository` stores conversation history

## Key Design Patterns Applied

### ✅ **1. Dependency Injection**
```typescript
// All dependencies wired in DI container
const container = new Container();
const qaController = container.qaController; // Fully wired
```

### ✅ **2. Repository Pattern**
```typescript
// Abstract storage behind interfaces
interface IConversationRepository {
  save(message: ConversationMessage): Promise<void>;
  getAll(): Promise<ConversationMessage[]>;
}

// Easy to swap implementations
// Development: InMemoryConversationRepository
// Production: PostgresConversationRepository
```

### ✅ **3. Service Layer**
```typescript
// Business logic separated from HTTP
class QAService implements IQAService {
  async ask(request: QARequest): Promise<QAResponse> {
    // Pure business orchestration
  }
}
```

### ✅ **4. Factory Pattern**
```typescript
// Encapsulate complex object creation
class QAEngineFactory {
  static create(): QAEngine {
    return new QAEngine(/* fully configured */);
  }
}
```

## Architecture Benefits

| Benefit | Description |
|---------|-------------|
| **Separation of Concerns** | Each layer has clear responsibilities |
| **Testability** | Mock interfaces, test layers in isolation |
| **Maintainability** | Changes isolated to specific layers |
| **Flexibility** | Swap implementations (memory → PostgreSQL) |
| **Scalability** | Extract services into microservices |

## Data Flow Example: Q&A Request

```
1. Client sends POST /api/qa {"query": "What are React hooks?"}
   ↓
2. [Presentation] QAController.askQuestion() receives request
   ↓
3. [Application] QAService.ask() orchestrates:
   - Calls Domain Layer (QAEngine)
   - Calculates costs
   - Generates ID and timestamp
   ↓
4. [Domain] QAEngine.ask() executes RAG pipeline:
   - HybridSearch: vector + keyword fusion
   - Reranker: MMR re-ranking
   - PromptBuilder: builds context
   - LLMClient: generates answer
   ↓
5. [Application] ConversationService.addMessage()
   ↓
6. [Infrastructure] Repository.save() persists to storage
   ↓
7. [Presentation] QAController formats and returns response
```

## Technology Stack

### Frontend
- **Framework**: React 18.3 + TypeScript
- **Build**: Vite 7.1
- **Styling**: Tailwind CSS 3.4
- **State**: Custom hooks (useApi)

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express 4.18
- **Language**: TypeScript 5.3
- **Architecture**: Layered/Clean Architecture

### RAG Components
- **Vector DB**: Pinecone
- **Embeddings**: OpenAI text-embedding-3-small
- **LLM**: OpenAI GPT-4o-mini
- **Search**: Hybrid (Vector + BM25 keyword)
- **Re-ranking**: MMR (Maximal Marginal Relevance)

## Project Structure

```
technical-docs-ai/
├── packages/
│   ├── rag-engine/                 # Backend (Layered Architecture)
│   │   ├── src/
│   │   │   ├── presentation/       # Layer 1: HTTP Interface
│   │   │   │   ├── controllers/
│   │   │   │   └── routes/
│   │   │   ├── application/        # Layer 2: Business Orchestration
│   │   │   │   ├── interfaces/
│   │   │   │   └── services/
│   │   │   ├── domain/            # Layer 3: Core Logic (see below)
│   │   │   │   └── README.md
│   │   │   ├── infrastructure/    # Layer 4: External Concerns
│   │   │   │   ├── persistence/
│   │   │   │   ├── external/
│   │   │   │   └── di/
│   │   │   ├── rag/               # Domain: RAG Engine
│   │   │   ├── search/            # Domain: Hybrid Search
│   │   │   ├── reranking/         # Domain: Re-ranking
│   │   │   ├── prompts/           # Domain: Prompt Building
│   │   │   ├── llm/               # Domain: LLM Client
│   │   │   ├── types/             # Type definitions
│   │   │   ├── config/            # Configuration
│   │   │   └── server.ts          # Entry point
│   │   └── ARCHITECTURE.md        # Detailed architecture docs
│   │
│   └── frontend/                  # Frontend (Component-Based)
│       ├── src/
│       │   ├── components/        # React components
│       │   ├── hooks/            # Custom hooks
│       │   ├── api/              # API client
│       │   └── types/            # TypeScript types
│       └── package.json
│
└── ARCHITECTURE_SUMMARY.md        # This file
```

## Migration from Old Architecture

### Before (Monolithic server.ts)
```typescript
// Everything in server.ts
app.post('/api/qa', async (req, res) => {
  const qaEngine = new QAEngine({ /* config */ });
  const result = await qaEngine.ask(query);
  conversationHistory.push(result);
  res.json(result);
});
```

### After (Layered Architecture)
```typescript
// server.ts (orchestration only)
const container = new Container();
app.use(setupRoutes(container));

// QAController (presentation)
class QAController {
  askQuestion = async (req, res) => {
    const result = await this.qaService.ask(req.body);
    await this.conversationService.addMessage(result);
    res.json(result);
  };
}

// QAService (application)
class QAService {
  async ask(request: QARequest): Promise<QAResponse> {
    const result = await this.qaEngine.ask(request.query);
    return this.formatResponse(result);
  }
}

// QAEngine (domain) - unchanged
```

## Next Steps / Roadmap

### ✅ Phase 1: Layered Architecture (Completed)
- [x] Separate presentation, application, domain, infrastructure layers
- [x] Implement dependency injection
- [x] Create service layer with interfaces
- [x] Add repository pattern

### 🚧 Phase 2: Enhanced Services (Recommended Next)
- [ ] Add request validation middleware (Zod schemas)
- [ ] Implement logging service (Winston/Pino)
- [ ] Add error handling middleware
- [ ] Create shared types package

### 🔮 Phase 3: Production Hardening (Future)
- [ ] PostgreSQL repository implementation
- [ ] Redis caching layer
- [ ] Observability (metrics, tracing)
- [ ] API documentation (Swagger/OpenAPI)

### 🚀 Phase 4: Advanced Features (Future)
- [ ] Streaming responses in UI
- [ ] User authentication & sessions
- [ ] Advanced RAG optimizations
- [ ] Microservices extraction

## How to Run

```bash
# Install dependencies
npm install

# Backend development
npm run dev:backend

# Frontend development
npm run dev:frontend

# Run both
npm run dev

# Build for production
npm run build
```

## Documentation

- **[ARCHITECTURE.md](packages/rag-engine/ARCHITECTURE.md)** - Detailed architecture documentation
- **[README.md](README.md)** - Project overview and quick start
- **[Domain README](packages/rag-engine/src/domain/README.md)** - Domain layer explanation

---

**Last Updated**: October 2025
**Architecture Version**: 1.0.0
**Status**: ✅ Production Ready
