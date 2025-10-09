# Troubleshooting Guide

## Common Issues and Solutions

### 1. Pinecone Region Error

**Error:**
```
Your free plan does not support indexes in the us-west-2 region
```

**Solution:**
Update `.env` to use the free tier region:
```bash
PINECONE_REGION=us-east-1
```

Then recreate the index:
```bash
npm run setup:vectordb
```

---

### 2. Dimension Mismatch Error

**Error:**
```
Vector dimension 1536 does not match the dimension of the index 1024
```

**Solution:**
The index was created with wrong dimensions. Delete and recreate:
```bash
npm run delete:index
npm run setup:vectordb
npm run ingest:docs
```

---

### 3. Empty Chunk Validation Error

**Error:**
```
'$.input' is invalid
```

**Solution:**
This has been fixed in the current version. If you encounter it:
1. Pull latest code
2. Re-run ingestion: `npm run ingest:docs`

---

### 4. PDF Parse Error

**Error:**
```
ENOENT: no such file or directory, open './test/data/05-versions-space.pdf'
```

**Solution:**
This is a known issue with `pdf-parse` library. The code now uses lazy loading to avoid this. Update to latest version.

---

### 5. OpenAI API Key Invalid

**Error:**
```
Invalid API key
```

**Solution:**
1. Check your `.env` file has correct key
2. Key should start with `sk-`
3. Verify key is active at https://platform.openai.com/api-keys

---

### 6. Pinecone API Key Invalid

**Error:**
```
Authentication failed
```

**Solution:**
1. Check your `.env` file
2. Get API key from https://app.pinecone.io/
3. Ensure key is copied correctly (no spaces)

---

## Pinecone Free Tier Limitations

### Supported Configuration

✅ **Works with free tier:**
```bash
PINECONE_CLOUD=aws
PINECONE_REGION=us-east-1
```

❌ **Not supported on free tier:**
- `us-west-2` region
- Pod-based indexes
- Multiple indexes

### Capacity

| Resource | Free Limit | Your Usage |
|----------|-----------|------------|
| Vectors | 100,000 | ~3,754 (3.7%) |
| Storage | 5 GB | ~22 MB (0.4%) |
| Indexes | 1 | 1 |

---

## Debugging Tips

### Enable Verbose Logging

The pipeline automatically logs progress. Watch for:
```
✅ Documents loaded
✅ Chunks generated
✅ Embeddings created
✅ Uploaded to Pinecone
```

### Check Configuration

Verify your settings:
```bash
npm run setup:vectordb
```

Should show:
```
📐 Embedding Model: text-embedding-3-small
📐 Vector Dimension: 1536
```

### Test Components Individually

```bash
# Test document loading (no API calls)
npm run test:ingestion

# Test embeddings (uses OpenAI)
npm run test:embedding
```

---

## Performance Issues

### Ingestion Too Slow

**Symptoms:** Taking more than 15 minutes for 216 docs

**Solutions:**
1. Check internet connection
2. Verify OpenAI API rate limits
3. Try smaller batch size (edit `src/ingestion/embeddings/embeddings-generator.ts`)

### High Costs

**Expected costs:**
- Embedding 216 React docs: ~$0.01-0.02
- Re-ingestion: Same cost

**To reduce costs:**
1. Use `text-embedding-3-small` (cheapest)
2. Don't re-ingest unnecessarily
3. Use `--clear` flag only when needed

---

## Getting Help

1. Check this troubleshooting guide
2. Review [README.md](../README.md)
3. Check [GitHub Issues](https://github.com/yourusername/technical-docs-ai/issues)
4. Open a new issue with:
   - Error message
   - `.env` config (redact API keys!)
   - Steps to reproduce

---

## Quick Reference

### Delete and Recreate Index

```bash
npm run delete:index      # Delete index
npm run setup:vectordb    # Create new index
npm run ingest:docs       # Re-upload data
```

### Check Index Status

```bash
npm run setup:vectordb
# Shows current stats and dimensions
```

### Clear Data Only (Keep Index)

```bash
npm run ingest:docs -- --clear
```

---

**Still having issues?** Open an issue on GitHub with detailed error logs.
