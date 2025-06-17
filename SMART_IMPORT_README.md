# 🚀 Smart Import for Forge Journal

## Quick Start

Smart Import is now fully configured and ready to use! Your OpenAI API key has been added to the environment configuration.

### Access Smart Import

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to Smart Import:**
   ```
   http://localhost:3000/admin/smart-import
   ```

3. **Authenticate:**
   - Enter your Sanity API write token: `skJNZhvOpGq0rX9kykU8Saf3qKddEJQQ4kH7Dp048VQMI1EW5QrCmpUC5n9GKrAfcUAM9AGNpbf3qAJ4pf9d8hvuRYc55w79qQxuifpJCpByzaopIBlZE9ZG27a7vYLlgKtqTTAoxiiRGq2JBq5Sw0Xq4rIbN0Ri8nhJvNKCNL4J4dQ6WLq0`

4. **Start importing content!**

## ✅ Setup Status

All components are installed and configured:

- ✅ **OpenAI API Key**: Configured for AI processing
- ✅ **Sanity Integration**: Connected to your CMS
- ✅ **Dependencies**: All required packages installed
- ✅ **API Routes**: 5 endpoints ready for import operations
- ✅ **UI Components**: Complete user interface built
- ✅ **File Processing**: PDF, Word, and text file support
- ✅ **Security**: Input validation and rate limiting active

## 🎯 What You Can Import

### 1. **URL Import**
- Blog posts and articles from any public website
- Automatic content extraction and formatting
- Image detection and import
- Author and metadata detection

### 2. **Text Import** 
- Raw text content from emails, documents, or notes
- AI-powered structuring and enhancement
- Automatic title and excerpt generation
- Category suggestions for ministry content

### 3. **File Import**
- PDF documents and research papers
- Word documents (.doc, .docx)
- Plain text files
- Up to 10MB file size

## 🤖 AI Features

Smart Import uses **GPT-4** to:
- **Enhance content** for Christian leadership contexts
- **Generate compelling titles** and excerpts
- **Detect authors** and publication dates
- **Suggest relevant categories** for ministry topics
- **Structure content** with proper formatting
- **Adapt tone** for pastoral and leadership audiences

## 📋 Import Process

1. **Select Method**: Choose URL, Text, or File import
2. **Configure Options**: Set processing preferences
3. **AI Processing**: Content is analyzed and enhanced
4. **Preview & Edit**: Review and refine the results
5. **Publish**: Create the final blog post in Sanity

## 🔒 Security Features

- **Rate Limiting**: Prevents abuse with hourly limits
- **Input Validation**: All content is sanitized and validated
- **File Security**: Safe file upload with type and size restrictions
- **Authentication**: Requires valid Sanity API token
- **Content Filtering**: Removes malicious scripts and unsafe content

## 📊 Rate Limits

- **URL Imports**: 10 per hour
- **Text Imports**: 20 per hour  
- **File Imports**: 5 per hour
- **Post Creation**: 10 per hour

## 🛠️ Troubleshooting

### Common Issues

**"Invalid API token"**
- Use the Sanity write token provided above
- Ensure the token has "Editor" permissions

**"Failed to extract content"**
- Check that URLs are publicly accessible
- Try copying text and using Text Import instead

**"File too large"**
- Maximum file size is 10MB
- Compress files or extract text manually

### Test Your Setup

Run the setup verification script:
```bash
node scripts/test-smart-import.js
```

## 📚 Documentation

- **[User Guide](SMART_IMPORT_USER_GUIDE.md)**: Complete instructions for content creators
- **[Technical Guide](SMART_IMPORT_TECHNICAL_GUIDE.md)**: Developer documentation and API reference  
- **[Architecture](SMART_IMPORT_ARCHITECTURE.md)**: System design and implementation details

## 🎉 Ready to Use!

Smart Import is fully configured and ready to help you efficiently import high-quality content for Forge Journal. The AI will automatically adapt content for Christian leadership and ministry contexts while maintaining the original meaning and value.

**Start importing content now at:** `http://localhost:3000/admin/smart-import`

---

*Smart Import - Transforming content discovery into published excellence for Christian leaders.*
