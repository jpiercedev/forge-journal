// Smart Import - Parse File API Route

import multer from 'multer';
import type { NextApiRequest, NextApiResponse } from 'next';

import { processWithAI } from '../../../lib/smart-import/ai-processor';
import { extractFromFile, validateFileUpload } from '../../../lib/smart-import/content-extractor';
import { FileUpload,ParseFileResponse } from '../../../types/smart-import';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain',
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
  },
});

// Disable Next.js body parser for file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ParseFileResponse>
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

    // Handle file upload
    const uploadedFile = await handleFileUpload(req);
    
    if (!uploadedFile) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: 'No file uploaded',
        },
      });
    }

    // Validate file
    try {
      validateFileUpload(uploadedFile);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FILE',
          message: error.message,
        },
      });
    }

    // Extract content from file
    let parsedContent;
    try {
      parsedContent = await extractFromFile(uploadedFile);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'PARSE_FAILED',
          message: `Failed to extract content from file: ${error.message}`,
        },
      });
    }

    // Get options from form data or query params
    const options = {
      generateExcerpt: true,
      detectAuthor: true,
      suggestCategories: true,
    };

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
      message: 'File content parsed successfully',
    });

  } catch (error) {
    console.error('Parse file error:', error);
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FILE_TOO_LARGE',
          message: 'File size exceeds 10MB limit',
        },
      });
    }

    if (error.message?.includes('Unsupported file type')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'UNSUPPORTED_FILE_TYPE',
          message: error.message,
        },
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        code: 'PARSE_FAILED',
        message: 'Internal server error during file parsing',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    });
  }
}

// Handle file upload using multer
function handleFileUpload(req: NextApiRequest): Promise<FileUpload | null> {
  return new Promise((resolve, reject) => {
    const uploadSingle = upload.single('file');
    
    uploadSingle(req as any, {} as any, (error) => {
      if (error) {
        reject(error);
        return;
      }

      const file = (req as any).file;
      if (!file) {
        resolve(null);
        return;
      }

      resolve({
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer,
      });
    });
  });
}

// Simple rate limiting implementation
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

async function isRateLimited(clientIp: string): Promise<boolean> {
  const now = Date.now();
  const windowMs = 60 * 60 * 1000; // 1 hour
  const maxRequests = 5; // 5 file uploads per hour (more restrictive)

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
