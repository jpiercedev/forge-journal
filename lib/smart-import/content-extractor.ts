// Content Extraction Utilities for Smart Import

import * as cheerio from 'cheerio';
import { convert } from 'html-to-text';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse';

import { ContentMetadata, ExtractedImage, FileUpload,ParsedContent } from '../../types/smart-import';

/**
 * Extract content from a URL
 */
export async function extractFromUrl(url: string): Promise<ParsedContent> {
  try {
    // Validate URL
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      throw new Error('Invalid URL protocol. Only HTTP and HTTPS are supported.');
    }

    // Fetch the webpage
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; ForgeJournal-SmartImport/1.0)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract title
    const title = extractTitle($);

    // Extract main content
    const content = extractMainContent($);

    // Extract images
    const images = extractImages($, url);

    // Extract metadata
    const metadata = extractMetadata($, url);

    // Extract potential author
    const author = extractAuthor($);

    // Extract publication date
    const publishedAt = extractPublishedDate($);

    return {
      title,
      content,
      author,
      publishedAt,
      images,
      metadata,
    };
  } catch (error) {
    throw new Error(`URL extraction failed: ${error.message}`);
  }
}

/**
 * Extract content from plain text
 */
export async function extractFromText(text: string, title?: string): Promise<ParsedContent> {
  const cleanText = text.trim();
  
  if (!cleanText) {
    throw new Error('Text content is empty');
  }

  // If no title provided, try to extract from first line or generate
  const extractedTitle = title || extractTitleFromText(cleanText);

  // Calculate metadata
  const wordCount = cleanText.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200); // Average reading speed

  const metadata: ContentMetadata = {
    wordCount,
    readingTime,
    extractedAt: new Date().toISOString(),
  };

  return {
    title: extractedTitle,
    content: cleanText,
    metadata,
  };
}

/**
 * Extract content from uploaded file
 */
export async function extractFromFile(file: FileUpload): Promise<ParsedContent> {
  const { filename, mimetype, buffer } = file;

  try {
    let content: string;
    let title = filename.replace(/\.[^/.]+$/, ''); // Remove extension

    switch (mimetype) {
      case 'application/pdf':
        const pdfData = await pdfParse(buffer);
        content = pdfData.text;
        break;

      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
      case 'application/msword':
        const docResult = await mammoth.extractRawText({ buffer });
        content = docResult.value;
        break;

      case 'text/plain':
        content = buffer.toString('utf-8');
        break;

      default:
        throw new Error(`Unsupported file type: ${mimetype}`);
    }

    if (!content.trim()) {
      throw new Error('No text content found in file');
    }

    // Calculate metadata
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200);

    const metadata: ContentMetadata = {
      wordCount,
      readingTime,
      extractedAt: new Date().toISOString(),
    };

    return {
      title,
      content: content.trim(),
      metadata,
    };
  } catch (error) {
    throw new Error(`File extraction failed: ${error.message}`);
  }
}

// Helper functions for URL extraction

function extractTitle($: cheerio.CheerioAPI): string {
  // Try multiple selectors for title
  const selectors = [
    'h1',
    'title',
    '[property="og:title"]',
    '[name="twitter:title"]',
    '.entry-title',
    '.post-title',
    '.article-title',
  ];

  for (const selector of selectors) {
    const element = $(selector).first();
    if (element.length) {
      const title = element.attr('content') || element.text();
      if (title && title.trim()) {
        return title.trim();
      }
    }
  }

  return 'Untitled Article';
}

function extractMainContent($: cheerio.CheerioAPI): string {
  // Remove unwanted elements
  $('script, style, nav, header, footer, aside, .sidebar, .advertisement').remove();

  // Try to find main content area
  const contentSelectors = [
    'article',
    '.entry-content',
    '.post-content',
    '.article-content',
    '.content',
    'main',
    '.main-content',
  ];

  for (const selector of contentSelectors) {
    const element = $(selector).first();
    if (element.length) {
      return convert(element.html() || '', {
        wordwrap: false,
        preserveNewlines: true,
      });
    }
  }

  // Fallback to body content
  return convert($('body').html() || '', {
    wordwrap: false,
    preserveNewlines: true,
  });
}

function extractImages($: cheerio.CheerioAPI, baseUrl: string): ExtractedImage[] {
  const images: ExtractedImage[] = [];
  
  $('img').each((_, element) => {
    const $img = $(element);
    const src = $img.attr('src');
    
    if (src) {
      try {
        const imageUrl = new URL(src, baseUrl).href;
        images.push({
          url: imageUrl,
          alt: $img.attr('alt') || '',
          width: parseInt($img.attr('width') || '0') || undefined,
          height: parseInt($img.attr('height') || '0') || undefined,
        });
      } catch (error) {
        // Skip invalid URLs
      }
    }
  });

  return images;
}

function extractMetadata($: cheerio.CheerioAPI, sourceUrl: string): ContentMetadata {
  const text = $('body').text();
  const wordCount = text.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  return {
    wordCount,
    readingTime,
    sourceUrl,
    extractedAt: new Date().toISOString(),
  };
}

function extractAuthor($: cheerio.CheerioAPI): string | undefined {
  const authorSelectors = [
    '[rel="author"]',
    '.author',
    '.byline',
    '[property="article:author"]',
    '[name="author"]',
    '.post-author',
    '.entry-author',
  ];

  for (const selector of authorSelectors) {
    const element = $(selector).first();
    if (element.length) {
      const author = element.attr('content') || element.text();
      if (author && author.trim()) {
        return author.trim();
      }
    }
  }

  return undefined;
}

function extractPublishedDate($: cheerio.CheerioAPI): string | undefined {
  const dateSelectors = [
    '[property="article:published_time"]',
    '[property="article:modified_time"]',
    'time[datetime]',
    '.published',
    '.post-date',
    '.entry-date',
  ];

  for (const selector of dateSelectors) {
    const element = $(selector).first();
    if (element.length) {
      const dateStr = element.attr('content') || element.attr('datetime') || element.text();
      if (dateStr && dateStr.trim()) {
        try {
          const date = new Date(dateStr.trim());
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
        } catch (error) {
          // Continue to next selector
        }
      }
    }
  }

  return undefined;
}

function extractTitleFromText(text: string): string {
  const lines = text.split('\n').filter(line => line.trim());
  
  if (lines.length === 0) {
    return 'Untitled';
  }

  // Use first non-empty line as title, truncate if too long
  const firstLine = lines[0].trim();
  return firstLine.length > 100 ? firstLine.substring(0, 97) + '...' : firstLine;
}

/**
 * Validate file upload
 */
export function validateFileUpload(file: FileUpload): void {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const supportedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
  ];

  if (file.size > maxSize) {
    throw new Error(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`);
  }

  if (!supportedTypes.includes(file.mimetype)) {
    throw new Error(`Unsupported file type: ${file.mimetype}`);
  }
}
