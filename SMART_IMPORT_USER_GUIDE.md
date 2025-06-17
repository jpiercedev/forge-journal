# Smart Import User Guide

## Overview

Smart Import is an AI-powered content import feature for Forge Journal that allows you to quickly import blog posts from various sources including URLs, text content, and files. The system uses advanced AI to analyze, structure, and format content specifically for Christian leadership and ministry contexts.

## Getting Started

### Accessing Smart Import

1. Navigate to `/admin/smart-import` in your browser
2. Enter your Sanity API token when prompted
3. Click "Access Smart Import" to begin

### Getting Your Sanity API Token

1. Go to [manage.sanity.io](https://manage.sanity.io)
2. Select your Forge Journal project
3. Navigate to **API → Tokens**
4. Create a new token with **"Editor"** permissions
5. Copy the token and paste it into Smart Import

## Import Methods

### 1. URL Import

Import content directly from web articles and blog posts.

**Best for:**
- Blog posts and articles
- News articles
- Medium posts
- WordPress sites

**How to use:**
1. Select "Import from URL"
2. Paste the article URL
3. Configure import options
4. Click "Import from URL"

**Tips:**
- Use direct links to articles, not homepage URLs
- Ensure content is publicly accessible (not behind paywalls)
- Some sites may block automated access

### 2. Text Import

Structure and format raw text content using AI.

**Best for:**
- Copied text from documents
- Email content
- Notes and drafts
- Transcribed content

**How to use:**
1. Select "Import from Text"
2. Paste your text content (minimum 100 words)
3. Optionally provide a title
4. Configure processing options
5. Click "Process Text"

**Tips:**
- Include at least 100 words for meaningful analysis
- Paste clean text without excessive formatting
- Include author information in the text if you want it detected

### 3. File Import

Upload and extract content from documents.

**Supported formats:**
- PDF documents
- Word documents (.doc, .docx)
- Plain text files (.txt)
- Maximum file size: 10MB

**How to use:**
1. Select "Import from File"
2. Upload your file (drag & drop or click to browse)
3. Configure processing options
4. Click "Process File"

## Import Options

### Standard Options

- **Generate excerpt automatically**: Creates a 2-3 sentence summary
- **Detect author from content**: Attempts to identify the author
- **Extract and import images**: Downloads and imports images (URL import only)
- **Suggest relevant categories**: Provides category suggestions based on content

### Custom Instructions

You can provide additional instructions to guide the AI processing:

**Examples:**
- "Focus on leadership principles"
- "Structure as a sermon outline"
- "Emphasize practical ministry applications"
- "Adapt for youth ministry context"

## Preview and Editing

After processing, you'll see a preview of your imported content:

### Content Preview
- **Title**: Edit the generated or extracted title
- **Excerpt**: Review and modify the summary
- **Content**: Edit the main article content
- **Categories**: Review suggested categories

### Author Settings
- **Create author if not exists**: Automatically create new author profiles
- **Author Name**: Specify or override the detected author

### Warnings and Suggestions
The system provides helpful feedback:
- **Warnings**: Issues that should be addressed (e.g., missing excerpt)
- **Suggestions**: Recommendations for improvement (e.g., add cover image)

## Publishing

Once you're satisfied with the preview:

1. Review all content and settings
2. Click "Create Blog Post"
3. Wait for the post to be created in Sanity
4. View the published post or edit in Sanity Studio

## Best Practices

### Content Quality
- Use high-quality source material
- Ensure content is relevant to Christian leadership
- Review and edit AI-generated content before publishing
- Add appropriate categories and tags

### SEO Optimization
- Review generated titles for clarity and SEO
- Ensure excerpts are compelling and informative
- Add relevant categories for better organization
- Consider adding a cover image

### Author Management
- Use consistent author names across posts
- Provide author information in source content when possible
- Create author profiles with proper images and bios

## Troubleshooting

### Common Issues

**"Failed to extract content from URL"**
- Check that the URL is accessible and public
- Try copying the text instead and using Text Import
- Some sites block automated access

**"File too large"**
- Maximum file size is 10MB
- Try compressing the file or extracting text manually

**"Invalid API token"**
- Ensure your Sanity token has "Editor" permissions
- Check that the token hasn't expired
- Generate a new token if needed

**"AI processing failed"**
- The system will fall back to basic processing
- Content will still be imported but may need more manual editing
- Check your internet connection and try again

### Getting Help

If you encounter persistent issues:

1. Check the browser console for error messages
2. Verify your Sanity project configuration
3. Try importing smaller content pieces
4. Contact support with specific error details

## Advanced Features

### Batch Processing
- Import multiple pieces of content in sequence
- Use consistent settings across imports
- Review each import before publishing

### Content Adaptation
- AI automatically adapts content for Christian leadership contexts
- Maintains original meaning while improving relevance
- Suggests appropriate categories for ministry content

### Integration with Sanity
- Seamlessly integrates with existing Sanity CMS
- Maintains content relationships and references
- Preserves existing author and category structures

## Security and Privacy

### Data Handling
- Content is processed securely using encrypted connections
- No content is stored permanently during processing
- AI processing uses OpenAI's secure infrastructure

### Authentication
- Requires valid Sanity API token for access
- Tokens are stored locally in your browser
- No credentials are transmitted to third parties

### Rate Limiting
- URL imports: 10 per hour
- Text imports: 20 per hour
- File imports: 5 per hour
- Post creation: 10 per hour

## Limitations

### Content Sources
- Some websites may block automated access
- Paywalled content cannot be accessed
- Dynamic content may not be fully captured

### File Processing
- Complex formatting may not be preserved
- Images in documents may not be extracted
- Very large files may timeout during processing

### AI Processing
- AI suggestions may need human review
- Content adaptation is optimized for Christian leadership
- Processing quality depends on source content quality

## Updates and Maintenance

Smart Import is regularly updated with:
- Improved AI processing capabilities
- Better content extraction algorithms
- Enhanced error handling and user feedback
- Support for additional file formats

Check the system status and updates in the Sanity Studio or contact your administrator for the latest features and improvements.
