# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.0] - 2025-10-10

### Added

#### 🏗️ Layered Architecture (Clean Architecture)
- **Presentation Layer**: HTTP controllers and routes
  - QAController for Q&A and search endpoints
  - ConversationController for history management
  - AnalyticsController for cost tracking
  - HealthController for health checks
  - Centralized route definitions in `presentation/routes/index.ts`

- **Application Layer**: Business orchestration services
  - QAService for RAG pipeline orchestration
  - ConversationService for conversation management
  - AnalyticsService for cost analytics computation
  - Interface contracts: IQAService, IConversationRepository, IAnalyticsService

- **Domain Layer**: Core RAG business logic (organized existing code)
  - RAG Q&A engine
  - Hybrid search (vector + keyword + fusion)
  - Re-ranking strategies (MMR, diversity, relevance)
  - Prompt building and citation extraction
  - LLM client abstraction

- **Infrastructure Layer**: External integrations
  - InMemoryConversationRepository (swappable to PostgreSQL)
  - QAEngineFactory for creating configured QAEngine instances
  - Dependency Injection Container for centralized dependency management

#### 📚 Documentation
- `ARCHITECTURE.md` - Comprehensive architecture documentation with design patterns
- `ARCHITECTURE_SUMMARY.md` - Quick reference with diagrams and data flow
- `MIGRATION_GUIDE.md` - Before/after comparison and migration details
- `FILE_NAMING_CONVENTIONS.md` - Complete file naming guide with rationale
- `FILE_NAMING_SUMMARY.md` - Quick reference for naming patterns
- Updated `README.md` with architecture section and latest updates

### Changed

#### 🔧 Backend Refactoring
- Refactored `server.ts` from 274 lines to 64 lines (77% reduction)
- Separated HTTP handling from business logic
- Extracted all endpoints into dedicated controllers
- Implemented dependency injection pattern
- Added repository pattern for data access abstraction

#### 📝 File Naming Standardization
All files standardized to **kebab-case** following 2025 TypeScript best practices:

**Backend (12 files renamed)**:
- `IAnalyticsService.ts` → `analytics-service.interface.ts`
- `IConversationRepository.ts` → `conversation-repository.interface.ts`
- `IQAService.ts` → `qa-service.interface.ts`
- `AnalyticsService.ts` → `analytics.service.ts`
- `ConversationService.ts` → `conversation.service.ts`
- `QAService.ts` → `qa.service.ts`
- `AnalyticsController.ts` → `analytics.controller.ts`
- `ConversationController.ts` → `conversation.controller.ts`
- `HealthController.ts` → `health.controller.ts`
- `QAController.ts` → `qa.controller.ts`
- `InMemoryConversationRepository.ts` → `in-memory-conversation.repository.ts`
- `QAEngineFactory.ts` → `qa-engine.factory.ts`

**Frontend (7 files renamed)**:
- `App.tsx` → `app.tsx`
- `SearchInput.tsx` → `search-input.tsx`
- `AnswerDisplay.tsx` → `answer-display.tsx`
- `ConversationHistory.tsx` → `conversation-history.tsx`
- `CostTracker.tsx` → `cost-tracker.tsx`
- `SourceCard.tsx` → `source-card.tsx`
- `useApi.ts` → `use-api.ts`

#### 📋 Naming Conventions
- Interfaces: `*.interface.ts`
- Services: `*.service.ts`
- Controllers: `*.controller.ts`
- Repositories: `*.repository.ts`
- Factories: `*.factory.ts`
- All files use kebab-case for consistency

### Removed
- `server.old.ts` - Removed backup file (dead code)

### Benefits

#### Architecture Benefits
- ✅ **Separation of Concerns**: Each layer has clear responsibilities
- ✅ **Testability**: Mock interfaces, test layers in isolation
- ✅ **Maintainability**: Changes isolated to specific layers
- ✅ **Flexibility**: Easy to swap implementations (memory → PostgreSQL)
- ✅ **Scalability**: Ready to extract services into microservices

#### File Naming Benefits
- ✅ **Cross-platform Compatibility**: Works on all filesystems
- ✅ **Zero Ambiguity**: One rule for all files
- ✅ **No Git Conflicts**: Case-sensitivity safe
- ✅ **Industry Standard**: Follows 2025 TypeScript/JavaScript best practices
- ✅ **Professional**: Clean, predictable file organization

### Technical Details

#### Files Created
- 17 new architecture files (services, controllers, repositories, etc.)
- 5 documentation files

#### Code Metrics
- Total changes: 30 files
- Insertions: +2,471 lines
- Deletions: -265 lines
- server.ts: 274 → 64 lines (-77%)

#### Testing
- ✅ Type check passed (backend & frontend)
- ✅ Build succeeded (both packages)
- ✅ Runtime tests passed (server starts, all endpoints working)
- ✅ Dead code check clean (knip)
- ✅ Zero breaking changes (100% backward compatible)

### Migration Notes

#### For Developers
1. **Imports**: Update imports to use new file names (kebab-case)
2. **No Breaking Changes**: All API endpoints remain the same
3. **New Architecture**: Familiarize yourself with layered architecture
4. **Documentation**: Read ARCHITECTURE.md for detailed guide

#### For Production
- All changes are backward compatible
- No database migrations required
- No environment variable changes needed
- Frontend works without any modifications

### Commit
- Commit: `e289333`
- Author: Nemmar Ramos
- Co-Authored-By: Claude
- Date: 2025-10-10

---

## Previous Releases

### [0.0.3] - Milestone 3: Frontend Complete
- Full-stack application with React frontend
- Real-time search with streaming support
- Conversation history tracking
- Cost analytics dashboard
- Source document highlighting

### [0.0.2] - Milestone 2: RAG Pipeline
- Hybrid search (vector + keyword)
- Re-ranking layer (MMR, Diversity, Relevance)
- Prompt templates with context injection
- LLM integration with streaming
- Complete Q&A engine with citations

### [0.0.1] - Milestone 1: Core Infrastructure
- Document ingestion pipeline
- Markdown/PDF/HTML support
- Intelligent chunking
- Vector embeddings
- Pinecone integration

---

**Last Updated**: October 10, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
