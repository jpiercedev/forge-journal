// Smart Import - Preview API Route

import type { NextApiRequest, NextApiResponse } from 'next';

import { formatForSupabase } from '../../../lib/smart-import/supabase-formatter';
import { ImportPreview,ParsedContent, PreviewResponse } from '../../../types/smart-import';
import { withAdminAuth, AuthenticatedRequest, validateMethod, ErrorResponses } from '../../../lib/auth/middleware';

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<PreviewResponse>
) {
  if (!validateMethod(req, ['POST'])) {
    return res.status(405).json(ErrorResponses.METHOD_NOT_ALLOWED);
  }

  try {

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
    let supabaseData;
    const warnings: string[] = [];
    const suggestions: string[] = [];

    try {
      supabaseData = await formatForSupabase(parsedContent, options);
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
    if (supabaseData.slug.length > 96) {
      warnings.push('Generated slug is quite long. Consider shortening the title.');
    }

    // Check content structure
    const hasHeadings = supabaseData.content.content && Array.isArray(supabaseData.content.content)
      ? supabaseData.content.content.some((block: any) => block.type === 'heading')
      : false;

    if (!hasHeadings && parsedContent.content.length > 1000) {
      suggestions.push('Consider adding headings to improve content structure and readability.');
    }

    // Create preview object
    const preview: ImportPreview = {
      parsedContent,
      supabaseData,
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

export default withAdminAuth(handler);
