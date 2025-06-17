# Smart Import Technical Guide

## Overview

This guide provides technical information for developers and administrators working with the Smart Import feature in Forge Journal.

## Architecture Overview

Smart Import follows a modular architecture with clear separation of concerns:

```
Frontend (React/Next.js)
├── UI Components (/components/SmartImport/)
├── Admin Interface (/pages/admin/smart-import.tsx)
└── Type Definitions (/types/smart-import.ts)

Backend (Next.js API Routes)
├── API Routes (/pages/api/smart-import/)
├── Core Libraries (/lib/smart-import/)
└── Validation (/lib/smart-import/validators.ts)

External Services
├── OpenAI API (AI processing)
├── Supabase (content storage)
└── File Processing Libraries
```

## API Endpoints

### Authentication

All API endpoints require authentication via Bearer token:

```http
Authorization: Bearer {SANITY_API_WRITE_TOKEN}
```

### POST /api/smart-import/parse-url

Extract content from a URL.

**Request:**
```json
{
  "url": "https://example.com/article",
  "options": {
    "generateExcerpt": true,
    "detectAuthor": true,
    "extractImages": true,
    "suggestCategories": true,
    "customPrompt": "Focus on leadership principles"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "title": "Article Title",
    "content": "Article content...",
    "excerpt": "Brief summary...",
    "author": "Author Name",
    "publishedAt": "2024-01-01T00:00:00Z",
    "images": [...],
    "categories": ["Leadership", "Ministry"],
    "metadata": {...}
  }
}
```

### POST /api/smart-import/parse-text

Process raw text content.

**Request:**
```json
{
  "text": "Content to process...",
  "title": "Optional title",
  "options": {...}
}
```

### POST /api/smart-import/parse-file

Upload and process a file.

**Request:** Multipart form data with file upload

### POST /api/smart-import/preview

Generate preview data for content.

**Request:**
```json
{
  "parsedContent": {...},
  "options": {...}
}
```

### POST /api/smart-import/create-post

Create final blog post in Sanity.

**Request:**
```json
{
  "parsedContent": {...},
  "createAuthor": true,
  "authorName": "Author Name",
  "generateSlug": true
}
```

## Core Libraries

### Content Extractor (`lib/smart-import/content-extractor.ts`)

Handles content extraction from various sources:

```typescript
// URL extraction
const content = await extractFromUrl(url);

// Text processing
const content = await extractFromText(text, title);

// File processing
const content = await extractFromFile(fileUpload);
```

**Key Functions:**
- `extractFromUrl()` - Web scraping with Cheerio
- `extractFromText()` - Text processing and metadata generation
- `extractFromFile()` - PDF, Word, and text file parsing
- `validateFileUpload()` - File validation and security checks

### AI Processor (`lib/smart-import/ai-processor.ts`)

Integrates with OpenAI for content enhancement:

```typescript
const enhancedContent = await processWithAI(parsedContent, options);
```

**Features:**
- GPT-4 integration for content analysis
- Fallback processing when AI unavailable
- Content adaptation for Christian leadership contexts
- Structured prompt engineering

### Supabase Formatter (`lib/smart-import/supabase-formatter.ts`)

Converts content to Supabase database format:

```typescript
const supabaseData = await formatForSupabase(parsedContent, options);
const createdPost = await createSupabasePost(supabaseData);
```

**Key Functions:**
- `formatForSupabase()` - Convert to Supabase schema
- `createSupabasePost()` - Create post in Supabase
- `convertToStructuredContent()` - Transform text to structured JSON
- `createOrGetAuthor()` - Author management

### Validators (`lib/smart-import/validators.ts`)

Comprehensive input validation and security:

```typescript
const urlValidation = validateUrl(url);
const textValidation = validateTextContent(text);
const fileValidation = validateFileUpload(file);
```

## Configuration

### Environment Variables

```env
# AI Processing
OPENAI_API_KEY=sk-...

# Supabase Integration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Optional: Custom configuration
SMART_IMPORT_MAX_FILE_SIZE=10485760
SMART_IMPORT_RATE_LIMIT_REQUESTS=10
SMART_IMPORT_RATE_LIMIT_WINDOW=3600000
```

### Rate Limiting

Default rate limits per IP address:
- URL imports: 10 requests/hour
- Text imports: 20 requests/hour
- File imports: 5 requests/hour
- Post creation: 10 requests/hour

## Error Handling

### Error Types

```typescript
type ImportErrorCode = 
  | 'INVALID_URL'
  | 'FETCH_FAILED'
  | 'PARSE_FAILED'
  | 'AI_PROCESSING_FAILED'
  | 'FILE_TOO_LARGE'
  | 'UNSUPPORTED_FILE_TYPE'
  | 'SANITY_CREATE_FAILED'
  | 'RATE_LIMIT_EXCEEDED'
  | 'AUTHENTICATION_FAILED';
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "PARSE_FAILED",
    "message": "Failed to extract content",
    "details": "Additional error information"
  }
}
```

## Security Considerations

### Input Validation
- All inputs are validated and sanitized
- File uploads are restricted by type and size
- URLs are validated for protocol and accessibility

### Authentication
- Requires valid Sanity API token
- Tokens are validated on each request
- No persistent session storage

### Rate Limiting
- IP-based rate limiting prevents abuse
- Different limits for different operations
- Configurable limits via environment variables

### Content Security
- HTML content is sanitized
- Script tags and event handlers are removed
- File uploads are scanned for malicious content

## Monitoring and Logging

### Key Metrics
- Request volume by endpoint
- Success/failure rates
- Processing times
- AI API usage and costs
- Error frequency and types

### Logging Points
```typescript
// API request logging
console.log('Smart Import request:', { method, clientIp, timestamp });

// Processing status
console.log('AI processing:', { success, processingTime, model });

// Error logging
console.error('Import failed:', { error, context, userId });
```

## Troubleshooting

### Common Issues

**AI Processing Failures**
- Check OpenAI API key validity
- Monitor API usage limits
- Verify network connectivity
- Review content length limits

**File Upload Issues**
- Check file size limits (10MB default)
- Verify supported file types
- Ensure proper multipart encoding
- Check server disk space

**Sanity Integration Problems**
- Verify API token permissions
- Check project ID and dataset
- Ensure schema compatibility
- Monitor Sanity API limits

**URL Extraction Failures**
- Check URL accessibility
- Verify HTTPS/HTTP protocols
- Handle rate limiting from source sites
- Consider user agent restrictions

### Debug Mode

Enable debug logging:

```env
NODE_ENV=development
DEBUG=smart-import:*
```

### Health Checks

Monitor system health:

```typescript
// Check AI service availability
const aiStatus = getAIStatus();

// Verify Sanity connection
const sanityStatus = validateSanityConfig();

// Test file processing
const fileStatus = await testFileProcessing();
```

## Performance Optimization

### Caching Strategies
- Cache URL extraction results (1 hour TTL)
- Cache AI processing for identical content
- Implement Redis for distributed caching

### Processing Optimization
- Limit content length for AI processing
- Use streaming for large file uploads
- Implement background job processing

### Resource Management
- Monitor memory usage during file processing
- Implement cleanup for temporary files
- Use connection pooling for external APIs

## Deployment

### Production Checklist
- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Rate limiting configured
- [ ] Monitoring and alerting setup
- [ ] Backup and recovery procedures
- [ ] Security scanning completed

### Scaling Considerations
- Horizontal scaling for API routes
- Load balancing for file uploads
- CDN for static assets
- Database connection pooling

## Maintenance

### Regular Tasks
- Monitor API usage and costs
- Review error logs and patterns
- Update dependencies and security patches
- Backup configuration and data

### Updates and Upgrades
- Test in staging environment first
- Monitor performance after deployments
- Maintain backward compatibility
- Document breaking changes

### Support Procedures
- Log analysis for user issues
- Performance monitoring and alerts
- Escalation procedures for critical failures
- User communication during outages
