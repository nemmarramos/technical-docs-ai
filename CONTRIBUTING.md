# Contributing to Technical Docs AI

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- OpenAI API key (for testing)
- Pinecone API key (for testing)

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/yourusername/technical-docs-ai.git
cd technical-docs-ai

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
# Add your API keys to .env

# Run tests
npm run test:ingestion
```

## 📝 How to Contribute

### Reporting Bugs

1. Check if the issue already exists in [GitHub Issues](https://github.com/yourusername/technical-docs-ai/issues)
2. If not, create a new issue with:
   - Clear title and description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Node version, etc.)
   - Error logs (redact API keys!)

### Suggesting Enhancements

1. Open an issue with the `enhancement` label
2. Describe the feature and use case
3. Explain why it would be useful
4. Consider implementation approach

### Pull Requests

1. **Fork** the repository
2. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** following the code style
4. **Test your changes**:
   ```bash
   npm run lint
   npm run format
   npm run test:ingestion
   ```
5. **Commit** with clear messages:
   ```bash
   git commit -m "feat: add support for PDF tables"
   ```
6. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
7. **Open a Pull Request** with:
   - Description of changes
   - Related issue number
   - Test results
   - Screenshots (if UI changes)

## 🎨 Code Style

### TypeScript

- Use TypeScript strict mode
- Define proper types (avoid `any`)
- Document public APIs with JSDoc comments

### Formatting

```bash
# Auto-format code
npm run format

# Check linting
npm run lint
```

### File Structure

```typescript
// Good
src/
  feature/
    feature.ts           # Implementation
    feature.test.ts      # Tests
    index.ts            # Exports

// Bad
src/
  all-in-one-file.ts   # Don't mix concerns
```

## ✅ Testing Guidelines

### Running Tests

```bash
# Test without API calls
npm run test:ingestion

# Test with OpenAI (costs ~$0.01)
npm run test:embedding

# Full pipeline test
npm run ingest:docs
```

### Writing Tests

- Add tests for new features
- Test edge cases
- Mock external APIs when possible
- Use descriptive test names

## 📋 Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): subject

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

**Examples:**
```bash
feat(chunker): add support for LaTeX math blocks
fix(embedding): handle empty chunks validation
docs(readme): update installation instructions
refactor(loader): extract common parsing logic
```

## 🏗️ Project Structure

```
src/
├── types/              # TypeScript types
├── config/             # Configuration
├── ingestion/
│   ├── loaders/        # Document loaders
│   ├── chunkers/       # Chunking strategies
│   └── embeddings/     # Embedding generation
├── vectordb/           # Vector database clients
├── scripts/            # CLI scripts
└── utils/              # Shared utilities
```

## 🎯 Areas for Contribution

### High Priority

- [ ] Query interface implementation
- [ ] Hybrid search (vector + BM25)
- [ ] Response generation with citations
- [ ] Re-ranking with cross-encoder

### Medium Priority

- [ ] Additional document formats (DOCX, etc.)
- [ ] Cost tracking dashboard
- [ ] Redis caching layer
- [ ] Multi-language support

### Good First Issues

- [ ] Improve error messages
- [ ] Add more test cases
- [ ] Documentation improvements
- [ ] Code examples in docs

## 🔍 Code Review Process

1. **Automated checks** must pass:
   - TypeScript compilation
   - Linting
   - Tests

2. **Manual review** by maintainers:
   - Code quality
   - Test coverage
   - Documentation
   - Performance impact

3. **Feedback** will be provided:
   - Be open to suggestions
   - Address review comments
   - Update PR as needed

## 📚 Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [OpenAI API Docs](https://platform.openai.com/docs/api-reference)
- [Pinecone Docs](https://docs.pinecone.io/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## 💬 Communication

- **GitHub Issues** - Bug reports and feature requests
- **Pull Requests** - Code contributions
- **Discussions** - General questions and ideas

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing!** 🎉

Every contribution, no matter how small, helps make this project better.
