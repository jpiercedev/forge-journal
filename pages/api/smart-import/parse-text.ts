// Smart Import - Parse Text API Route

import type { NextApiRequest, NextApiResponse } from 'next';

import { processWithAI } from '../../../lib/smart-import/ai-processor';
import { extractFromText } from '../../../lib/smart-import/content-extractor';
import { ParseTextResponse, TextImportRequest } from '../../../types/smart-import';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ParseTextResponse>
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
    const { text, title, options = {} }: TextImportRequest = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Text content is required',
        },
      });
    }

    // Validate text length
    const maxLength = 50000; // 50k characters
    if (text.length > maxLength) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CONTENT_TOO_LONG',
          message: `Text content exceeds maximum length of ${maxLength} characters`,
        },
      });
    }

    // Rate limiting check
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

    // Extract content from text
    let parsedContent;
    try {
      parsedContent = await extractFromText(text, title);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PARSE_FAILED',
          message: `Failed to parse text content: ${error.message}`,
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
      message: 'Text content parsed successfully',
    });

  } catch (error) {
    console.error('Parse text error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'PARSE_FAILED',
        message: 'Internal server error during text parsing',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    });
  }
}

// Simple rate limiting implementation (shared with other routes)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

async function isRateLimited(clientIp: string): Promise<boolean> {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 20; // 20 requests per hour for text (more lenient than URL)

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
