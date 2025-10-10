# Place Your Documentation Here

This directory is where you add your source documentation files for the RAG system to ingest.

## Supported File Types

- **Markdown** (`.md`) - Recommended for code documentation
- **PDF** (`.pdf`) - For manuals and reports
- **HTML** (`.html`) - For web documentation

## Quick Start - React Documentation Demo

The demo shown in the project GIF uses official React documentation. To replicate it:

```bash
# Run from packages/rag-engine directory

# Clone React docs
git clone --depth 1 https://github.com/reactjs/react.dev.git temp-react-docs

# Copy markdown files
cp -r temp-react-docs/src/content/learn/*.md data/raw/
cp -r temp-react-docs/src/content/reference/react/*.md data/raw/

# Clean up
rm -rf temp-react-docs

# Ingest
npm run ingest:docs
```

## Add Your Own Documentation

```bash
# Copy your files here
cp /path/to/your/docs/*.md .
cp /path/to/your/docs/*.pdf .

# Then ingest from rag-engine directory
cd ../..
npm run ingest:docs
```

## Example Files

Here are some examples you can create:

### Example 1: Simple Markdown

```bash
cat > example-guide.md << 'EOF'
# Example Guide

## Getting Started

This is a sample documentation file.

## Usage

Use the following command:

```bash
npm install my-package
```
EOF
```

### Example 2: API Documentation

```bash
cat > api-reference.md << 'EOF'
# API Reference

## Authentication

All API requests require an API key:

```javascript
const client = new APIClient({ apiKey: 'your-key' });
```

## Endpoints

### GET /users

Returns a list of users.

**Response:**
```json
{
  "users": [
    { "id": 1, "name": "Alice" },
    { "id": 2, "name": "Bob" }
  ]
}
```
EOF
```

## Next Steps

1. Add your documentation files to this directory
2. Run `npm run ingest:docs` from the `packages/rag-engine` directory
3. Start the application with `npm run dev` from the root directory
4. Ask questions about your documentation at http://localhost:3000

## Directory Structure

Your files can be organized in subdirectories:

```
data/raw/
├── getting-started/
│   ├── installation.md
│   └── quickstart.md
├── api/
│   ├── authentication.md
│   └── endpoints.md
└── guides/
    └── best-practices.md
```

The ingestion process will find all files recursively.

## Best Practices

1. **Use descriptive filenames**: `user-authentication.md` not `doc1.md`
2. **Add clear headings**: Use H1, H2, H3 for better chunking
3. **Include code examples**: They'll be preserved in the knowledge base
4. **Keep files focused**: One topic per file for better retrieval
5. **Update regularly**: Re-ingest when you update documentation

## Need More Help?

See [../README.md](../README.md) for detailed ingestion documentation.
