# Data Directory

This directory contains your documentation files and processed chunks for the RAG system.

## Directory Structure

```
data/
├── raw/                    # ← Place your source documents here
│   ├── *.md               # Markdown files (recommended)
│   ├── *.pdf              # PDF files
│   └── *.html             # HTML files
├── processed/             # Generated chunks (auto-created)
└── README.md              # This file
```

## Important Notes

⚠️ **These directories are not tracked by git** - you must add your own documentation files.

## Quick Start

### Option 1: Demo with React Documentation

```bash
# From packages/rag-engine directory

# 1. Clone React documentation
git clone --depth 1 https://github.com/reactjs/react.dev.git temp-react-docs

# 2. Copy markdown files
cp -r temp-react-docs/src/content/learn/*.md data/raw/
cp -r temp-react-docs/src/content/reference/react/*.md data/raw/

# 3. Clean up
rm -rf temp-react-docs

# 4. Ingest
npm run ingest:docs
```

### Option 2: Add Your Own Documentation

```bash
# From packages/rag-engine/data/raw directory

# Add your files
cp /path/to/your/docs/*.md .
cp /path/to/your/docs/*.pdf .
cp /path/to/your/docs/*.html .

# Then ingest
cd ../..
npm run ingest:docs
```

## Supported Formats

| Format | Extension | Best For |
|--------|-----------|----------|
| **Markdown** | `.md` | Code documentation, API docs, guides |
| **PDF** | `.pdf` | Manuals, research papers, reports |
| **HTML** | `.html` | Web documentation, blog posts |

## Best Practices

1. **Use Markdown when possible** - Best preservation of code blocks and structure
2. **Organize in subdirectories** - Group related docs (e.g., `api/`, `guides/`)
3. **Use descriptive filenames** - `user-authentication.md` not `doc1.md`
4. **Keep files under 10MB** - For optimal processing
5. **Use clear headings** - H1, H2, H3 help with semantic chunking

## Example Structure

```
data/raw/
├── getting-started/
│   ├── installation.md
│   ├── quickstart.md
│   └── configuration.md
├── api-reference/
│   ├── authentication.md
│   ├── endpoints.md
│   └── webhooks.md
├── guides/
│   ├── best-practices.md
│   ├── troubleshooting.md
│   └── deployment.md
└── changelog.md
```

## Ingestion Process

When you run `npm run ingest:docs`, the system:

1. **Loads** all files from `data/raw/`
2. **Chunks** them into ~500 token pieces
3. **Generates embeddings** using OpenAI
4. **Indexes** vectors in Pinecone

Processed chunks are saved to `data/processed/` for reference.

## Re-ingesting

If you update or add documents:

```bash
# Option 1: Full re-index (recommended for major changes)
npm run delete:index
npm run setup:vectordb
npm run ingest:docs

# Option 2: Incremental (adds to existing index)
npm run ingest:docs
```

## Troubleshooting

### "No documents found"
- Check that files are in `data/raw/`
- Verify file extensions (`.md`, `.pdf`, `.html`)
- Ensure files are not empty

### "Embedding API error"
- Verify OpenAI API key in `.env`
- Check API credits balance
- Ensure access to `text-embedding-3-small` model

### "Out of memory"
- Process large documents in smaller batches
- Reduce `CHUNK_SIZE` in `.env`
- Increase Node.js memory: `NODE_OPTIONS=--max-old-space-size=4096 npm run ingest:docs`

## Cost Estimation

**One-time ingestion costs** (using OpenAI text-embedding-3-small):

| Documents | Chunks | Embedding Cost | Pinecone Storage |
|-----------|--------|----------------|------------------|
| 10 files | ~50 | ~$0.001 | Free tier |
| 50 files | ~250 | ~$0.005 | Free tier |
| 100 files | ~500 | ~$0.010 | Free tier |
| 1000 files | ~5000 | ~$0.100 | Free tier |

*Pinecone free tier supports 100K vectors*

## Need Help?

See the main [README.md](../../../README.md) for detailed documentation and examples.
