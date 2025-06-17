// Validation utilities for Smart Import

import { ImportOptions, FileUpload, ParsedContent } from '../../types/smart-import';

/**
 * Validate URL format and accessibility
 */
export function validateUrl(url: string): { isValid: boolean; error?: string } {
  if (!url || !url.trim()) {
    return { isValid: false, error: 'URL is required' };
  }

  try {
    const urlObj = new URL(url.trim());
    
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: 'Only HTTP and HTTPS URLs are supported' };
    }

    // Check for common problematic patterns
    if (urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1') {
      return { isValid: false, error: 'Local URLs are not accessible for import' };
    }

    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: 'Invalid URL format' };
  }
}

/**
 * Validate text content for import
 */
export function validateTextContent(text: string): { isValid: boolean; error?: string } {
  if (!text || !text.trim()) {
    return { isValid: false, error: 'Text content is required' };
  }

  const trimmedText = text.trim();
  
  if (trimmedText.length < 50) {
    return { isValid: false, error: 'Text content must be at least 50 characters long' };
  }

  if (trimmedText.length > 100000) {
    return { isValid: false, error: 'Text content exceeds maximum length of 100,000 characters' };
  }

  // Check for minimum word count
  const wordCount = trimmedText.split(/\s+/).filter(word => word.length > 0).length;
  if (wordCount < 10) {
    return { isValid: false, error: 'Text content must contain at least 10 words' };
  }

  return { isValid: true };
}

/**
 * Validate file upload
 */
export function validateFileUpload(file: FileUpload): { isValid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const supportedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
  ];

  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  if (!file.filename || !file.mimetype || !file.buffer) {
    return { isValid: false, error: 'Invalid file data' };
  }

  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size is 10MB` 
    };
  }

  if (!supportedTypes.includes(file.mimetype)) {
    return { 
      isValid: false, 
      error: `Unsupported file type: ${file.mimetype}. Supported types: PDF, Word documents, and text files` 
    };
  }

  // Check for suspicious file names
  const suspiciousPatterns = [
    /\.(exe|bat|cmd|scr|vbs|js|jar)$/i,
    /[<>:"|?*]/,
  ];

  for (const pattern of suspiciousPatterns) {
    if (pattern.test(file.filename)) {
      return { isValid: false, error: 'Invalid or potentially unsafe filename' };
    }
  }

  return { isValid: true };
}

/**
 * Validate import options
 */
export function validateImportOptions(options: ImportOptions): { isValid: boolean; error?: string } {
  if (!options || typeof options !== 'object') {
    return { isValid: false, error: 'Invalid import options' };
  }

  // Validate custom prompt if provided
  if (options.customPrompt && typeof options.customPrompt !== 'string') {
    return { isValid: false, error: 'Custom prompt must be a string' };
  }

  if (options.customPrompt && options.customPrompt.length > 1000) {
    return { isValid: false, error: 'Custom prompt exceeds maximum length of 1000 characters' };
  }

  return { isValid: true };
}

/**
 * Validate parsed content before processing
 */
export function validateParsedContent(content: ParsedContent): { isValid: boolean; error?: string } {
  if (!content || typeof content !== 'object') {
    return { isValid: false, error: 'Invalid content data' };
  }

  if (!content.title || typeof content.title !== 'string' || !content.title.trim()) {
    return { isValid: false, error: 'Title is required' };
  }

  if (content.title.length > 200) {
    return { isValid: false, error: 'Title exceeds maximum length of 200 characters' };
  }

  if (!content.content || typeof content.content !== 'string' || !content.content.trim()) {
    return { isValid: false, error: 'Content is required' };
  }

  if (content.content.length > 100000) {
    return { isValid: false, error: 'Content exceeds maximum length of 100,000 characters' };
  }

  // Validate optional fields
  if (content.excerpt && content.excerpt.length > 500) {
    return { isValid: false, error: 'Excerpt exceeds maximum length of 500 characters' };
  }

  if (content.author && content.author.length > 100) {
    return { isValid: false, error: 'Author name exceeds maximum length of 100 characters' };
  }

  if (content.publishedAt) {
    try {
      const date = new Date(content.publishedAt);
      if (isNaN(date.getTime())) {
        return { isValid: false, error: 'Invalid publication date format' };
      }
      
      // Check if date is too far in the future
      const futureLimit = new Date();
      futureLimit.setFullYear(futureLimit.getFullYear() + 1);
      if (date > futureLimit) {
        return { isValid: false, error: 'Publication date cannot be more than 1 year in the future' };
      }
    } catch (error) {
      return { isValid: false, error: 'Invalid publication date' };
    }
  }

  return { isValid: true };
}

/**
 * Validate authentication token
 */
export function validateAuthToken(token: string): { isValid: boolean; error?: string } {
  if (!token || typeof token !== 'string') {
    return { isValid: false, error: 'Authentication token is required' };
  }

  const trimmedToken = token.trim();
  
  if (trimmedToken.length < 10) {
    return { isValid: false, error: 'Authentication token is too short' };
  }

  if (trimmedToken.length > 200) {
    return { isValid: false, error: 'Authentication token is too long' };
  }

  // Basic format validation for Sanity tokens
  if (!trimmedToken.startsWith('sk') && !trimmedToken.includes('_')) {
    return { isValid: false, error: 'Invalid token format' };
  }

  return { isValid: true };
}

/**
 * Sanitize text input to prevent XSS and other attacks
 */
export function sanitizeTextInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove script tags
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: URLs
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim();
}

/**
 * Validate and sanitize author name
 */
export function validateAuthorName(name: string): { isValid: boolean; sanitized: string; error?: string } {
  if (!name || typeof name !== 'string') {
    return { isValid: false, sanitized: '', error: 'Author name must be a string' };
  }

  const sanitized = sanitizeTextInput(name);
  
  if (!sanitized.trim()) {
    return { isValid: false, sanitized: '', error: 'Author name cannot be empty' };
  }

  if (sanitized.length > 100) {
    return { isValid: false, sanitized: '', error: 'Author name exceeds maximum length of 100 characters' };
  }

  // Check for valid name patterns
  if (!/^[a-zA-Z\s\-'.]+$/.test(sanitized)) {
    return { isValid: false, sanitized: '', error: 'Author name contains invalid characters' };
  }

  return { isValid: true, sanitized };
}

/**
 * Validate slug format
 */
export function validateSlug(slug: string): { isValid: boolean; error?: string } {
  if (!slug || typeof slug !== 'string') {
    return { isValid: false, error: 'Slug is required' };
  }

  const trimmedSlug = slug.trim();
  
  if (trimmedSlug.length < 1) {
    return { isValid: false, error: 'Slug cannot be empty' };
  }

  if (trimmedSlug.length > 96) {
    return { isValid: false, error: 'Slug exceeds maximum length of 96 characters' };
  }

  // Check slug format
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(trimmedSlug)) {
    return { isValid: false, error: 'Slug must contain only lowercase letters, numbers, and hyphens' };
  }

  if (trimmedSlug.startsWith('-') || trimmedSlug.endsWith('-')) {
    return { isValid: false, error: 'Slug cannot start or end with a hyphen' };
  }

  return { isValid: true };
}

/**
 * Comprehensive validation for import request
 */
export function validateImportRequest(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data || typeof data !== 'object') {
    return { isValid: false, errors: ['Invalid request data'] };
  }

  // Validate method
  if (!data.method || !['url', 'text', 'file'].includes(data.method)) {
    errors.push('Invalid import method');
  }

  // Method-specific validation
  switch (data.method) {
    case 'url':
      const urlValidation = validateUrl(data.url);
      if (!urlValidation.isValid) {
        errors.push(urlValidation.error!);
      }
      break;

    case 'text':
      const textValidation = validateTextContent(data.text);
      if (!textValidation.isValid) {
        errors.push(textValidation.error!);
      }
      break;

    case 'file':
      if (!data.file) {
        errors.push('File is required for file import');
      }
      break;
  }

  // Validate options if provided
  if (data.options) {
    const optionsValidation = validateImportOptions(data.options);
    if (!optionsValidation.isValid) {
      errors.push(optionsValidation.error!);
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Rate limiting validation
 */
export function validateRateLimit(clientId: string, action: string): { isAllowed: boolean; error?: string } {
  // This is a simple in-memory rate limiter
  // In production, you'd want to use Redis or a proper rate limiting service
  
  const rateLimits = {
    'parse-url': { requests: 10, window: 3600000 }, // 10 requests per hour
    'parse-text': { requests: 20, window: 3600000 }, // 20 requests per hour
    'parse-file': { requests: 5, window: 3600000 }, // 5 requests per hour
    'create-post': { requests: 10, window: 3600000 }, // 10 requests per hour
  };

  const limit = rateLimits[action];
  if (!limit) {
    return { isAllowed: true };
  }

  // Implementation would check against stored rate limit data
  // For now, just return allowed
  return { isAllowed: true };
}
