// Smart Import - Parse URL API Route

import type { NextApiRequest, NextApiResponse } from 'next';

import { processWithAI } from '../../../lib/smart-import/ai-processor';
import { extractFromUrl } from '../../../lib/smart-import/content-extractor';
import { ParseUrlResponse, UrlImportRequest } from '../../../types/smart-import';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ParseUrlResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Only POST method is allowed',
      },
    });
  }

  try {
    // Validate authentication
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_FAILED',
          message: 'Valid authorization token required',
        },
      });
    }

    const token = authHeader.substring(7);
    if (token !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_FAILED',
          message: 'Invalid authorization token',
        },
      });
    }

    // Parse request body
    const { url, options = {} }: UrlImportRequest = req.body;

    if (!url) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_URL',
          message: 'URL is required',
        },
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_URL',
          message: 'Invalid URL format',
        },
      });
    }

    // Rate limiting check (simple implementation)
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    if (await isRateLimited(clientIp as string)) {
      return res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: 'Too many requests. Please try again later.',
        },
      });
    }

    // Extract content from URL
    let parsedContent;
    try {
      parsedContent = await extractFromUrl(url);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FETCH_FAILED',
          message: `Failed to extract content from URL: ${error.message}`,
        },
      });
    }

    // Process with AI if enabled
    try {
      parsedContent = await processWithAI(parsedContent, options);
    } catch (error) {
      console.warn('AI processing failed, using extracted content:', error);
      // Continue with extracted content even if AI fails
    }

    // Return successful response
    return res.status(200).json({
      success: true,
      data: parsedContent,
      message: 'URL content parsed successfully',
    });

  } catch (error) {
    console.error('Parse URL error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'PARSE_FAILED',
        message: 'Internal server error during URL parsing',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    });
  }
}

// Simple rate limiting implementation
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

async function isRateLimited(clientIp: string): Promise<boolean> {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 10; // 10 requests per hour

  const clientData = rateLimitMap.get(clientIp);

  if (!clientData) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (now > clientData.resetTime) {
    // Reset the window
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + windowMs });
    return false;
  }

  if (clientData.count >= maxRequests) {
    return true;
  }

  clientData.count++;
  return false;
}

// Clean up old rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [ip, data] of rateLimitMap.entries()) {
    if (now > data.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 60 * 60 * 1000); // Clean up every hour
