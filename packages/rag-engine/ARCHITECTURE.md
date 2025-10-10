# RAG Engine - Layered Architecture Documentation

## Overview

This document describes the layered architecture implemented in the RAG Engine backend, following clean architecture principles and 2025 best practices for production RAG systems.

## Architecture Layers

```
┌─────────────────────────────────────────────────────────────┐
│                   Presentation Layer                        │
│  (Controllers, Routes, Middlewares - HTTP Interface)        │
├─────────────────────────────────────────────────────────────┤
│                   Application Layer                         │
│  (Services, Use Cases, Interfaces - Business Orchestration) │
├─────────────────────────────────────────────────────────────┤
│                     Domain Layer                            │
│  (RAG Engine, Search, Re-ranking - Core Business Logic)     │
├─────────────────────────────────────────────────────────────┤
│                  Infrastructure Layer                       │
│  (Repositories, External APIs - Data & External Services)   │
└─────────────────────────────────────────────────────────────┘
```

## Layer Descriptions

### 1. Presentation Layer (`src/presentation/`)

**Purpose**: Handle HTTP requests and responses

**Components**:
- **Controllers** (`presentation/controllers/`):
  - `QAController.ts` - Handles Q&A and search endpoints
  - `ConversationController.ts` - Manages conversation history
  - `AnalyticsController.ts` - Provides cost analytics
  - `HealthController.ts` - Health check endpoint

- **Routes** (`presentation/routes/`):
  - `index.ts` - Route definitions and endpoint mappings

**Responsibilities**:
- Parse HTTP requests
- Validate request data
- Call appropriate application services
- Format responses
- Handle HTTP-specific concerns (status codes, headers)

**Dependencies**: Application Layer (Services)

### 2. Application Layer (`src/application/`)

**Purpose**: Orchestrate business operations and coordinate between layers

**Components**:
- **Interfaces** (`application/interfaces/`):
  - `IQAService.ts` - Q&A service contract
  - `IConversationRepository.ts` - Conversation storage contract
  - `IAnalyticsService.ts` - Analytics service contract

- **Services** (`application/services/`):
  - `QAService.ts` - Orchestrates RAG operations
  - `ConversationService.ts` - Manages conversation lifecycle
  - `AnalyticsService.ts` - Computes analytics from data

**Responsibilities**:
- Define application use cases
- Coordinate between domain and infrastructure
- Implement business workflows
- Handle application-level concerns (cost calculation, timestamps)

**Dependencies**: Domain Layer (RAG Engine), Infrastructure Layer (Repositories)

### 3. Domain Layer

**Purpose**: Core business logic - the heart of the RAG system

**Components** (existing modules):
- **RAG** (`src/rag/`):
  - `qa-engine.ts` - Main RAG orchestration engine

- **Search** (`src/search/`):
  - `hybrid-search.ts` - Combines vector + keyword search
  - `vector-search.ts` - Semantic search via embeddings
  - `keyword-search.ts` - BM25 keyword search
  - `fusion.ts` - Result fusion strategies

- **Re-ranking** (`src/reranking/`):
  - MMR, diversity, and relevance-based re-ranking

- **Prompts** (`src/prompts/`):
  - Prompt building and citation extraction

- **LLM** (`src/llm/`):
  - LLM client abstraction

**Responsibilities**:
- Implement core RAG algorithms
- Define search strategies
- Execute re-ranking logic
- Build prompts and extract citations
- No dependencies on external frameworks or infrastructure

**Dependencies**: None (pure business logic)

### 4. Infrastructure Layer (`src/infrastructure/`)

**Purpose**: Handle external concerns - data persistence and external services

**Components**:
- **Persistence** (`infrastructure/persistence/`):
  - `InMemoryConversationRepository.ts` - In-memory conversation storage
  - (Future: `PostgresConversationRepository.ts`)

- **External** (`infrastructure/external/`):
  - `QAEngineFactory.ts` - Factory for creating configured QAEngine instances

- **DI Container** (`infrastructure/di/`):
  - `container.ts` - Dependency injection container

**Responsibilities**:
- Implement repository interfaces
- Integrate with external APIs (OpenAI, Pinecone)
- Manage database connections
- Handle infrastructure configuration
- Provide dependency injection

**Dependencies**: Application Layer (Interfaces), Domain Layer (for integration)

## Dependency Flow

```
Presentation → Application → Domain
                ↓
           Infrastructure
```

- Presentation depends on Application
- Application depends on Domain and Infrastructure (via interfaces)
- Infrastructure depends on Domain (for implementation)
- Domain depends on nothing (pure business logic)

## Key Design Patterns

### 1. **Dependency Injection**
All dependencies are injected via the `Container` class, making the system:
- Testable (easy to mock dependencies)
- Flexible (swap implementations)
- Maintainable (clear dependency graph)

```typescript
// container.ts
const container = new Container();
// All dependencies wired in one place
```

### 2. **Repository Pattern**
Data access is abstracted behind repository interfaces:

```typescript
interface IConversationRepository {
  save(message: ConversationMessage): Promise<void>;
  getAll(): Promise<ConversationMessage[]>;
  // ...
}
```

This allows swapping storage implementations:
- Development: `InMemoryConversationRepository`
- Production: `PostgresConversationRepository` (future)

### 3. **Service Layer**
Business orchestration is separated from HTTP concerns:

```typescript
class QAService {
  async ask(request: QARequest): Promise<QAResponse> {
    // Orchestrates RAG pipeline
    // Independent of HTTP/Express
  }
}
```

### 4. **Factory Pattern**
Complex object creation is encapsulated:

```typescript
class QAEngineFactory {
  static create(): QAEngine {
    // Creates fully configured QAEngine
  }
}
```

## Benefits of This Architecture

### 1. **Separation of Concerns**
Each layer has a clear responsibility:
- Presentation: HTTP handling
- Application: Business orchestration
- Domain: Core algorithms
- Infrastructure: External integrations

### 2. **Testability**
- Unit test domain logic without dependencies
- Mock interfaces for integration tests
- Test controllers without starting a server

### 3. **Maintainability**
- Changes in one layer don't cascade
- Clear boundaries between components
- Easy to locate and fix issues

### 4. **Flexibility**
- Swap storage implementations (memory → PostgreSQL)
- Replace external services (OpenAI → other LLMs)
- Add new endpoints without changing business logic
- Support multiple frontends (REST, GraphQL, gRPC)

### 5. **Scalability**
- Services can be extracted into microservices
- Layers can be deployed independently
- Clear interfaces enable distributed systems

## Migration Guide

### Old Architecture (server.ts)
```typescript
// Everything in one file
app.post('/api/qa', async (req, res) => {
  const qaEngine = new QAEngine({ /* config */ });
  const result = await qaEngine.ask(query);
  conversationHistory.push(result);
  res.json(result);
});
```

### New Architecture
```typescript
// Layered approach
// 1. Controller (Presentation)
class QAController {
  askQuestion(req, res) {
    const result = await this.qaService.ask(req.body);
    await this.conversationService.addMessage(result);
    res.json(result);
  }
}

// 2. Service (Application)
class QAService {
  async ask(request) {
    const result = await this.qaEngine.ask(request.query);
    return this.formatResponse(result);
  }
}

// 3. Domain (unchanged)
class QAEngine { /* existing logic */ }

// 4. Infrastructure
class Container {
  constructor() {
    // Wire dependencies
  }
}
```

## File Structure

```
src/
├── presentation/          # Layer 1: HTTP Interface
│   ├── controllers/       # Request handlers
│   ├── routes/           # Route definitions
│   └── middlewares/      # Express middlewares (future)
│
├── application/          # Layer 2: Business Orchestration
│   ├── interfaces/       # Service contracts
│   ├── services/         # Service implementations
│   └── use-cases/        # Complex workflows (future)
│
├── domain/              # Layer 3: Core Business Logic
│   └── README.md        # Points to existing modules
│   # (Existing: rag/, search/, reranking/, prompts/, llm/)
│
├── infrastructure/      # Layer 4: External Concerns
│   ├── persistence/     # Data repositories
│   ├── external/        # External API integrations
│   └── di/             # Dependency injection
│
└── server.ts           # Application entry point
```

## Best Practices

### 1. **Follow the Dependency Rule**
- Outer layers depend on inner layers
- Inner layers never depend on outer layers
- Domain layer has no external dependencies

### 2. **Use Interfaces**
- Define contracts in the application layer
- Implement in infrastructure layer
- Enable easy mocking and testing

### 3. **Keep Controllers Thin**
- Controllers only handle HTTP concerns
- Delegate business logic to services
- No domain logic in controllers

### 4. **Keep Domain Pure**
- No framework dependencies
- No infrastructure concerns
- Only core business logic

### 5. **Centralize Configuration**
- Use dependency injection container
- Single place to wire dependencies
- Easy to understand system composition

## Future Enhancements

### Short Term
1. Add request validation middleware
2. Implement error handling middleware
3. Add logging middleware
4. Create shared types package

### Medium Term
1. Add PostgreSQL repository implementation
2. Implement Redis caching layer
3. Add observability (metrics, tracing)
4. Create API documentation (Swagger)

### Long Term
1. Extract services into microservices
2. Add event-driven architecture
3. Implement CQRS pattern
4. Add GraphQL layer

## Testing Strategy

### Unit Tests
```typescript
// Test domain logic in isolation
describe('QAEngine', () => {
  it('should generate answer from context', async () => {
    const engine = new QAEngine(mockConfig);
    const result = await engine.ask('test query');
    expect(result.answer).toBeDefined();
  });
});
```

### Integration Tests
```typescript
// Test service integration
describe('QAService', () => {
  it('should orchestrate RAG pipeline', async () => {
    const mockEngine = createMockEngine();
    const service = new QAService(mockEngine);
    const result = await service.ask({ query: 'test' });
    expect(result.id).toBeDefined();
  });
});
```

### E2E Tests
```typescript
// Test full HTTP flow
describe('POST /api/qa', () => {
  it('should return answer and save to history', async () => {
    const response = await request(app)
      .post('/api/qa')
      .send({ query: 'test' });
    expect(response.status).toBe(200);
    expect(response.body.answer).toBeDefined();
  });
});
```

## Conclusion

This layered architecture provides a solid foundation for building and scaling production RAG systems. It follows industry best practices, ensures maintainability, and enables the system to evolve with changing requirements.

The architecture is designed to be:
- **Clear**: Easy to understand and navigate
- **Testable**: Components can be tested in isolation
- **Flexible**: Easy to swap implementations
- **Scalable**: Ready for growth and evolution

---

**Last Updated**: October 2025
**Version**: 1.0.0
