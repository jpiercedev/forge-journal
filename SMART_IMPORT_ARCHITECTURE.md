# Smart Import Architecture for Forge Journal

## Overview
The Smart Import feature enables users to import blog posts from various sources using AI-powered content analysis and structuring. This document outlines the complete architecture for implementing this feature.

## User Experience Flow

### Access Points
- Standalone admin interface at `/admin/smart-import`
- Sanity Studio plugin integration (future enhancement)

### Import Methods
1. **URL Import**: Extract content from web articles
2. **Text Import**: Structure raw text content
3. **File Import**: Process documents (PDF, Word, etc.)

### Processing Workflow
1. Input validation and preprocessing
2. AI-powered content analysis and extraction
3. Preview with editable fields
4. Final review and import to Sanity CMS

## API Architecture

### Core API Routes
```
/pages/api/smart-import/
├── parse-url.ts      # Extract content from URLs
├── parse-text.ts     # Process raw text input
├── parse-file.ts     # Handle file uploads and extraction
├── create-post.ts    # Create final Sanity document
└── preview.ts        # Generate preview data
```

### Data Flow
```
Input → Preprocessing → AI Analysis → Structured Data → Preview → Sanity Creation
```

### AI Integration
- **Primary**: OpenAI GPT-4 for content analysis
- **Fallback**: Rule-based parsing when AI unavailable
- **Capabilities**:
  - Title extraction/generation
  - Content formatting (Sanity block content)
  - Excerpt generation
  - Author detection
  - Date extraction
  - Category/tag suggestions

## Component Structure

### Main Components
```
/components/SmartImport/
├── SmartImportInterface.tsx    # Main container
├── ImportMethodSelector.tsx    # Method selection
├── UrlImportForm.tsx          # URL input form
├── TextImportForm.tsx         # Text input form
├── FileImportForm.tsx         # File upload form
├── ImportPreview.tsx          # Preview with editing
├── ImportProgress.tsx         # Progress indicator
└── ImportResults.tsx          # Success/error feedback
```

### Page Integration
- New page: `/pages/admin/smart-import.tsx`
- Uses existing `ForgeLayout` for consistency

## Data Processing Pipeline

### Content Extraction
- **URL**: Web scraping with Cheerio
- **Text**: Direct processing
- **File**: PDF-parse, Mammoth for documents

### AI Processing
```javascript
// Example AI prompt structure
const prompt = `
Analyze this content and extract:
1. Title (generate if missing)
2. Main content (convert to structured format)
3. Excerpt (generate 2-3 sentences)
4. Author (detect from content)
5. Publication date
6. Suggested categories

Content: ${rawContent}
`;
```

### Data Transformation
- Convert to Sanity post schema format
- Transform rich text to block content
- Handle image processing and upload
- Generate URL-friendly slugs

## Integration Points

### Sanity CMS Integration
- Use existing client configuration
- Follow current post schema
- Integrate with author system
- Maintain existing image patterns

### Security & Authentication
- Require Sanity write token
- Rate limiting for AI API calls
- Input validation and sanitization
- Secure file upload handling

### Error Handling
- Comprehensive logging
- User-friendly error messages
- Graceful degradation
- Retry mechanisms

## Technical Requirements

### New Dependencies
```json
{
  "openai": "^4.0.0",
  "cheerio": "^1.0.0",
  "pdf-parse": "^1.1.1",
  "mammoth": "^1.6.0",
  "multer": "^1.4.5",
  "node-html-to-text": "^9.0.5"
}
```

### Environment Variables
```env
OPENAI_API_KEY=your_openai_key
SMART_IMPORT_SECRET=your_import_secret
# Existing Sanity variables will be reused
```

### File Structure
```
/lib/smart-import/
├── content-extractor.ts    # Content extraction utilities
├── ai-processor.ts         # AI integration logic
├── sanity-formatter.ts     # Data transformation
└── validators.ts           # Input validation

/types/smart-import.ts      # TypeScript definitions
```

## Configuration Options

### AI Settings
- Model selection (GPT-4 recommended)
- Temperature and token limits
- Fallback strategies

### Import Limits
- File size limits (10MB default)
- Rate limiting (10 imports/hour)
- Supported file types

### Content Processing
- Minimum content length
- Image handling preferences
- Author matching strategies

## Implementation Strategy

### Development Phases
1. **Phase 1**: Core API routes and text import
2. **Phase 2**: URL import with web scraping
3. **Phase 3**: File import capabilities
4. **Phase 4**: UI components and preview
5. **Phase 5**: Sanity Studio integration
6. **Phase 6**: Advanced features and optimizations

### Testing Strategy
- Unit tests for parsing functions
- Integration tests for API routes
- End-to-end workflow testing
- Manual testing with diverse content

### Performance Considerations
- Caching for repeated URL imports
- Smart batching for AI API calls
- Progress tracking for long operations
- Optimized image processing

## Future Enhancements

### Advanced Features
- Batch import capabilities
- Content scheduling
- Duplicate detection
- SEO optimization suggestions

### Integration Expansions
- Social media import
- RSS feed integration
- Email newsletter import
- CMS migration tools

## Success Metrics

### User Experience
- Import success rate > 95%
- Average import time < 30 seconds
- User satisfaction scores

### Technical Performance
- API response times < 5 seconds
- Error rates < 2%
- System uptime > 99.9%

This architecture provides a comprehensive foundation for building the Smart Import feature while maintaining integration with the existing Forge Journal system.

## Implementation Status

### ✅ Completed Components

#### Backend API Routes
- `/api/smart-import/parse-url.ts` - URL content extraction
- `/api/smart-import/parse-text.ts` - Text content processing
- `/api/smart-import/parse-file.ts` - File upload and extraction
- `/api/smart-import/create-post.ts` - Sanity post creation
- `/api/smart-import/preview.ts` - Content preview generation

#### Core Libraries
- `lib/smart-import/content-extractor.ts` - Content extraction utilities
- `lib/smart-import/ai-processor.ts` - AI integration and processing
- `lib/smart-import/sanity-formatter.ts` - Sanity data formatting
- `lib/smart-import/validators.ts` - Input validation and security

#### UI Components
- `components/SmartImport/SmartImportInterface.tsx` - Main interface
- `components/SmartImport/ImportMethodSelector.tsx` - Method selection
- `components/SmartImport/UrlImportForm.tsx` - URL import form
- `components/SmartImport/TextImportForm.tsx` - Text import form
- `components/SmartImport/FileImportForm.tsx` - File upload form
- `components/SmartImport/ImportPreview.tsx` - Content preview and editing
- `components/SmartImport/ImportProgress.tsx` - Progress indicator
- `components/SmartImport/ImportResults.tsx` - Success/error results

#### Admin Interface
- `pages/admin/smart-import.tsx` - Main admin page with authentication

#### Type Definitions
- `types/smart-import.ts` - Complete TypeScript definitions

### 🔧 Configuration Required

#### Environment Variables
```env
# Required for AI processing
OPENAI_API_KEY=your_openai_api_key

# Required for Sanity integration (existing)
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=your_dataset
SANITY_API_WRITE_TOKEN=your_write_token
```

#### Dependencies Installed
- `openai` - AI processing
- `cheerio` - Web scraping
- `pdf-parse` - PDF content extraction
- `mammoth` - Word document parsing
- `multer` - File upload handling
- `html-to-text` - HTML to text conversion

### 🚀 Deployment Checklist

1. **Environment Setup**
   - [ ] Add OpenAI API key to environment variables
   - [ ] Verify Sanity write token permissions
   - [ ] Configure rate limiting settings

2. **Security Configuration**
   - [ ] Review API authentication mechanisms
   - [ ] Configure CORS settings if needed
   - [ ] Set up monitoring and logging

3. **Testing**
   - [ ] Test URL import with various websites
   - [ ] Test file upload with different formats
   - [ ] Verify AI processing and fallback mechanisms
   - [ ] Test Sanity integration and post creation

4. **Documentation**
   - [ ] Share user guide with content creators
   - [ ] Document API endpoints for developers
   - [ ] Create troubleshooting guides

### 📊 Monitoring and Analytics

#### Key Metrics to Track
- Import success rates by method
- AI processing success/failure rates
- Average processing times
- User adoption and usage patterns
- Error rates and common issues

#### Logging Points
- API request/response cycles
- AI processing attempts and results
- File upload and processing status
- Sanity post creation success/failure
- User authentication events

### 🔄 Future Enhancements

#### Phase 2 Features
- Batch import capabilities
- Scheduled imports from RSS feeds
- Social media content import
- Enhanced image processing and optimization

#### Integration Expansions
- Sanity Studio plugin version
- Webhook-based automated imports
- Integration with external content sources
- Advanced content categorization

#### Performance Optimizations
- Caching layer for repeated URL imports
- Background processing for large files
- Progressive content loading
- Enhanced error recovery mechanisms
