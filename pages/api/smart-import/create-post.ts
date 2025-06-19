// Smart Import - Create Post API Route

import type { NextApiRequest, NextApiResponse } from 'next';

import { createSupabasePost, formatForSupabase, validateSupabaseConfig } from '../../../lib/smart-import/supabase-formatter';
import { CreatePostResponse, ParsedContent, PreviewFormData } from '../../../types/smart-import';
import { withAdminAuth, AuthenticatedRequest, validateMethod, ErrorResponses } from '../../../lib/auth/middleware';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<CreatePostResponse>
) {
  if (!validateMethod(req, ['POST'])) {
    return res.status(405).json(ErrorResponses.METHOD_NOT_ALLOWED);
  }

  try {

    // Validate Supabase configuration
    if (!validateSupabaseConfig()) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'SUPABASE_CONFIG_ERROR',
          message: 'Supabase configuration is incomplete',
        },
      });
    }

    // Parse request body
    const requestData = req.body;
    
    // Check if this is parsed content or preview form data
    let parsedContent: ParsedContent;
    let options: any = {};

    if (requestData.parsedContent) {
      // Request from preview form
      const formData: PreviewFormData = requestData;
      parsedContent = formData.parsedContent;
      options = {
        generateSlug: formData.generateSlug,
        createAuthor: formData.createAuthor,
        authorName: formData.authorName,
      };
    } else {
      // Direct parsed content
      parsedContent = requestData as ParsedContent;
    }

    if (!parsedContent || !parsedContent.title || !parsedContent.content) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Valid parsed content with title and content is required',
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

    // Format content for Supabase
    let supabaseData;
    try {
      supabaseData = await formatForSupabase(parsedContent, {
        ...options,
        status: 'published' // Default to published for Smart Import
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FORMAT_FAILED',
          message: `Failed to format content for Supabase: ${error.message}`,
        },
      });
    }

    // Create post in Supabase
    let createdPost;
    try {
      createdPost = await createSupabasePost(supabaseData);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'SUPABASE_CREATE_FAILED',
          message: `Failed to create post in Supabase: ${error.message}`,
        },
      });
    }

    // Return successful response
    return res.status(201).json({
      success: true,
      data: {
        success: true,
        postId: createdPost.id,
        slug: createdPost.slug,
      },
      message: 'Post created successfully',
    });

  } catch (error) {
    console.error('Create post error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_POST_FAILED',
        message: 'Internal server error during post creation',
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
  const maxRequests = 10; // 10 post creations per hour

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

export default withAdminAuth(handler);
