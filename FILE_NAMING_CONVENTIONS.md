# File Naming Conventions - Technical Docs AI

## Current State Analysis

### Backend (packages/rag-engine/src/)
**Current Patterns**:
- ❌ **Mixed conventions**: PascalCase for classes, kebab-case for utilities
- Examples:
  - PascalCase: `QAService.ts`, `AnalyticsController.ts`, `InMemoryConversationRepository.ts`
  - kebab-case: `qa-engine.ts`, `hybrid-search.ts`, `prompt-builder.ts`, `openai-client.ts`
  - Interface prefix: `IQAService.ts`, `IConversationRepository.ts`

### Frontend (packages/frontend/src/)
**Current Patterns**:
- ✅ **Mostly consistent**: PascalCase for React components
- Examples:
  - PascalCase: `App.tsx`, `SearchInput.tsx`, `AnswerDisplay.tsx`, `ConversationHistory.tsx`
  - camelCase: `useApi.ts`
  - kebab-case: None

## 2025 Best Practices (Based on Research)

### Recommended Standard: **kebab-case** for all files

**Reasons**:
1. ✅ **Cross-platform compatibility** - Works on all filesystems (case-sensitive and case-insensitive)
2. ✅ **No decision fatigue** - One rule for all files
3. ✅ **Industry standard** - Used by Angular, Vue, many TypeScript projects
4. ✅ **URL-friendly** - Safe for web deployments
5. ✅ **Git-friendly** - No case-sensitivity conflicts

### Alternative: **PascalCase for React Components**

Many React projects use PascalCase for component files:
- ✅ **Visual clarity** - Component files stand out
- ✅ **Matches export name** - `SearchInput.tsx` exports `SearchInput`
- ❌ **Decision overhead** - Need to decide per file
- ❌ **Potential filesystem issues** - Can cause problems on case-insensitive systems

## Recommended Conventions for This Project

### Option 1: **Full kebab-case** (Most Modern)

```
✅ Recommended for maximum consistency and safety

Backend:
- qa-service.ts (exports QAService class)
- analytics-controller.ts (exports AnalyticsController class)
- conversation-repository.interface.ts (exports IConversationRepository)
- qa-engine.ts (already correct!)
- hybrid-search.ts (already correct!)

Frontend:
- search-input.tsx (exports SearchInput component)
- answer-display.tsx (exports AnswerDisplay component)
- conversation-history.tsx (exports ConversationHistory component)
- use-api.ts (exports useApi hook)
```

### Option 2: **Hybrid Approach** (React-Friendly)

```
⚠️  Less consistent but React-conventional

Backend: kebab-case
- qa-service.ts
- analytics-controller.ts
- qa-engine.ts

Frontend React Components: PascalCase
- SearchInput.tsx
- AnswerDisplay.tsx
- ConversationHistory.tsx

Frontend Hooks/Utils: kebab-case
- use-api.ts
- api-client.ts
```

## Final Recommendation: **Option 1 (Full kebab-case)**

### Why Full kebab-case?
1. **Zero ambiguity** - Same rule everywhere
2. **Future-proof** - Works on any filesystem
3. **Monorepo consistency** - Backend and frontend follow same rules
4. **Easier tooling** - No special cases for linters/formatters
5. **Industry trend** - Modern frameworks moving this direction

### File Naming Rules

| File Type | Convention | Example |
|-----------|------------|---------|
| **All TypeScript files** | kebab-case | `qa-service.ts` |
| **All TypeScript React files** | kebab-case | `search-input.tsx` |
| **Interface files** | kebab-case + `.interface.ts` | `conversation-repository.interface.ts` |
| **Type-only files** | kebab-case + `.types.ts` | `search.types.ts` |
| **Test files** | kebab-case + `.test.ts` | `qa-service.test.ts` |
| **Config files** | kebab-case | `vite.config.ts` |
| **Index files** | `index.ts` | `index.ts` |

### Directory Naming

| Directory Type | Convention | Example |
|----------------|------------|---------|
| **All directories** | kebab-case | `application/`, `presentation/` |
| **No exceptions** | - | - |

## Migration Plan

### Files to Rename (Backend)

#### Application Layer
```
IAnalyticsService.ts          → analytics-service.interface.ts
IConversationRepository.ts    → conversation-repository.interface.ts
IQAService.ts                 → qa-service.interface.ts
AnalyticsService.ts           → analytics.service.ts
ConversationService.ts        → conversation.service.ts
QAService.ts                  → qa.service.ts
```

#### Presentation Layer
```
AnalyticsController.ts        → analytics.controller.ts
ConversationController.ts     → conversation.controller.ts
HealthController.ts           → health.controller.ts
QAController.ts               → qa.controller.ts
```

#### Infrastructure Layer
```
InMemoryConversationRepository.ts  → in-memory-conversation.repository.ts
QAEngineFactory.ts                  → qa-engine.factory.ts
```

### Files to Rename (Frontend)

```
App.tsx                   → app.tsx
SearchInput.tsx           → search-input.tsx
AnswerDisplay.tsx         → answer-display.tsx
ConversationHistory.tsx   → conversation-history.tsx
CostTracker.tsx           → cost-tracker.tsx
SourceCard.tsx            → source-card.tsx
```

### Files Already Correct ✅

Backend:
- ✅ `qa-engine.ts`
- ✅ `hybrid-search.ts`
- ✅ `keyword-search.ts`
- ✅ `vector-search.ts`
- ✅ `prompt-builder.ts`
- ✅ `openai-client.ts`
- ✅ `pinecone-client.ts`
- ✅ All files in `ingestion/`, `search/`, `reranking/`, etc.

Frontend:
- ✅ `useApi.ts` → should be `use-api.ts`

## Implementation Steps

1. **Rename files** using git mv (preserves history)
2. **Update imports** in all files
3. **Update build scripts** if needed
4. **Update documentation** to reference new names
5. **Run tests** to ensure nothing broke

## Benefits After Migration

✅ **Consistency** - Same naming everywhere
✅ **Predictability** - Easy to find files
✅ **No conflicts** - Works on all systems
✅ **Professional** - Follows modern standards
✅ **Maintainable** - Clear conventions for team

## Example: Before vs After

### Before (Inconsistent)
```typescript
// Backend
import { QAService } from './application/services/QAService.js';
import { QAEngine } from './rag/qa-engine.js';
import { IQAService } from './application/interfaces/IQAService.js';

// Frontend
import { SearchInput } from './components/SearchInput.tsx';
import { useApi } from './hooks/useApi.ts';
```

### After (Consistent kebab-case)
```typescript
// Backend
import { QAService } from './application/services/qa.service.js';
import { QAEngine } from './rag/qa-engine.js';
import { IQAService } from './application/interfaces/qa-service.interface.js';

// Frontend
import { SearchInput } from './components/search-input.tsx';
import { useApi } from './hooks/use-api.ts';
```

## Naming Pattern Suffixes

To improve clarity, use suffixes:

| Suffix | Purpose | Example |
|--------|---------|---------|
| `.service.ts` | Application services | `qa.service.ts` |
| `.controller.ts` | HTTP controllers | `analytics.controller.ts` |
| `.repository.ts` | Data repositories | `conversation.repository.ts` |
| `.factory.ts` | Factory classes | `qa-engine.factory.ts` |
| `.interface.ts` | Interface definitions | `qa-service.interface.ts` |
| `.types.ts` | Type definitions | `search.types.ts` |
| `.test.ts` | Test files | `qa-service.test.ts` |
| `.config.ts` | Configuration files | `database.config.ts` |

## Edge Cases

### Q: What about App.tsx?
**A**: Rename to `app.tsx` for consistency

### Q: What about React component exports?
**A**: File name doesn't need to match export:
```typescript
// File: search-input.tsx
export function SearchInput() { ... }  // PascalCase export is fine
```

### Q: What about index files?
**A**: Keep as `index.ts` (standard convention)

### Q: What about server.ts?
**A**: Keep as `server.ts` (already kebab-case)

---

**Status**: Ready for implementation
**Estimated Impact**: ~30 file renames
**Breaking Changes**: None (only file names, not exports)
