// Smart Import - Preview API Route

import type { NextApiRequest, NextApiResponse } from 'next';
import { formatForSanity } from '../../../lib/smart-import/sanity-formatter';
import { PreviewResponse, ParsedContent, ImportPreview } from '../../../types/smart-import';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PreviewResponse>
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

    // Parse request body
    const { parsedContent, options = {} }: { parsedContent: ParsedContent; options?: any } = req.body;

    if (!parsedContent || !parsedContent.title || !parsedContent.content) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Valid parsed content with title and content is required',
        },
      });
    }

    // Generate preview data
    let sanityData;
    const warnings: string[] = [];
    const suggestions: string[] = [];

    try {
      sanityData = await formatForSanity(parsedContent, options);
    } catch (error) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'FORMAT_FAILED',
          message: `Failed to format content for preview: ${error.message}`,
        },
      });
    }

    // Generate warnings and suggestions
    if (!parsedContent.excerpt) {
      warnings.push('No excerpt found. Consider adding a brief summary.');
    }

    if (!parsedContent.author) {
      warnings.push('No author detected. You may need to specify the author manually.');
    }

    if (!parsedContent.images || parsedContent.images.length === 0) {
      suggestions.push('Consider adding a cover image to make the post more engaging.');
    }

    if (parsedContent.content.length < 500) {
      warnings.push('Content is quite short. Consider expanding for better engagement.');
    }

    if (parsedContent.content.length > 10000) {
      suggestions.push('Content is quite long. Consider breaking it into multiple posts or adding subheadings.');
    }

    if (!parsedContent.categories || parsedContent.categories.length === 0) {
      suggestions.push('Consider adding categories to help organize your content.');
    }

    // Check for potential issues with the slug
    if (sanityData.slug.current.length > 96) {
      warnings.push('Generated slug is quite long. Consider shortening the title.');
    }

    // Check content structure
    const hasHeadings = sanityData.content.some((block: any) => 
      block._type === 'block' && block.style && block.style.startsWith('h')
    );
    
    if (!hasHeadings && parsedContent.content.length > 1000) {
      suggestions.push('Consider adding headings to improve content structure and readability.');
    }

    // Create preview object
    const preview: ImportPreview = {
      parsedContent,
      sanityData,
      warnings: warnings.length > 0 ? warnings : undefined,
      suggestions: suggestions.length > 0 ? suggestions : undefined,
    };

    // Return successful response
    return res.status(200).json({
      success: true,
      data: preview,
      message: 'Preview generated successfully',
    });

  } catch (error) {
    console.error('Preview generation error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'PREVIEW_FAILED',
        message: 'Internal server error during preview generation',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    });
  }
}
