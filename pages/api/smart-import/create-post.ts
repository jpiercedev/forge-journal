// Smart Import - Create Post API Route

import type { NextApiRequest, NextApiResponse } from 'next';
import { formatForSanity, createSanityPost, validateSanityConfig } from '../../../lib/smart-import/sanity-formatter';
import { CreatePostResponse, ParsedContent, PreviewFormData } from '../../../types/smart-import';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<CreatePostResponse>
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
    if (token !== process.env.SANITY_API_WRITE_TOKEN) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'AUTHENTICATION_FAILED',
          message: 'Invalid authorization token',
        },
      });
    }

    // Validate Sanity configuration
    if (!validateSanityConfig()) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'SANITY_CONFIG_ERROR',
          message: 'Sanity configuration is incomplete',
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

    // Format content for Sanity
    let sanityData;
    try {
      sanityData = await formatForSanity(parsedContent, options);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FORMAT_FAILED',
          message: `Failed to format content for Sanity: ${error.message}`,
        },
      });
    }

    // Create post in Sanity
    let createdPost;
    try {
      createdPost = await createSanityPost(sanityData);
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          code: 'SANITY_CREATE_FAILED',
          message: `Failed to create post in Sanity: ${error.message}`,
        },
      });
    }

    // Return successful response
    return res.status(201).json({
      success: true,
      data: {
        success: true,
        postId: createdPost._id,
        slug: createdPost.slug.current,
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
