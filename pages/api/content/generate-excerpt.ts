// Generate Excerpt API Route - /api/content/generate-excerpt
// Uses OpenAI to generate an excerpt from provided content

import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';
import { withAdminAuth, AuthenticatedRequest, validateMethod, ErrorResponses } from '../../../lib/auth/middleware';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface GenerateExcerptRequest {
  title?: string;
  content: any;
}

interface GenerateExcerptResponse {
  success: boolean;
  data?: {
    excerpt: string;
  };
  error?: {
    code: string;
    message: string;
    details?: string;
  };
}

/**
 * Extract plain text from Lexical editor content
 */
function extractPlainTextFromContent(content: any): string {
  console.log('Extracting text from content:', JSON.stringify(content, null, 2));

  if (!content) {
    console.log('No content provided');
    return '';
  }

  // Handle string content
  if (typeof content === 'string') {
    console.log('Content is string:', content.substring(0, 100));
    // Try to parse as JSON first
    try {
      const parsed = JSON.parse(content);
      return extractPlainTextFromContent(parsed);
    } catch {
      // If not JSON, return as is
      return content;
    }
  }

  // Handle ProseMirror/TipTap format (type: "doc")
  if (content.type === 'doc' && content.content) {
    console.log('Found ProseMirror doc with content:', content.content.length);
    return extractTextFromProseMirrorContent(content.content);
  }

  // Handle Lexical format
  if (content.root && content.root.children) {
    console.log('Found Lexical root with children:', content.root.children.length);
    return extractTextFromChildren(content.root.children);
  }

  // Handle direct children array
  if (Array.isArray(content)) {
    console.log('Content is array with length:', content.length);
    return extractTextFromChildren(content);
  }

  console.log('Unknown content format, returning empty string');
  return '';
}

function extractTextFromChildren(children: any[]): string {
  if (!Array.isArray(children)) {
    console.log('Children is not an array:', typeof children);
    return '';
  }

  const texts = children.map(child => {
    if (!child) return '';

    // Handle text nodes
    if (child.type === 'text') {
      return child.text || '';
    }

    // Handle paragraph nodes
    if (child.type === 'paragraph' && child.children) {
      return extractTextFromChildren(child.children);
    }

    // Handle heading nodes
    if (child.type === 'heading' && child.children) {
      return extractTextFromChildren(child.children);
    }

    // Handle quote nodes
    if (child.type === 'quote' && child.children) {
      return extractTextFromChildren(child.children);
    }

    // Handle list nodes
    if (child.type === 'list' && child.children) {
      return extractTextFromChildren(child.children);
    }

    // Handle list item nodes
    if (child.type === 'listitem' && child.children) {
      return extractTextFromChildren(child.children);
    }

    // Handle any other nodes with children
    if (child.children && Array.isArray(child.children)) {
      return extractTextFromChildren(child.children);
    }

    return '';
  });

  const result = texts.filter(text => text.trim()).join(' ').trim();
  console.log('Extracted text result:', result.substring(0, 200));
  return result;
}

function extractTextFromProseMirrorContent(content: any[]): string {
  if (!Array.isArray(content)) {
    console.log('ProseMirror content is not an array:', typeof content);
    return '';
  }

  const texts = content.map(node => {
    if (!node) return '';

    // Handle text nodes
    if (node.type === 'text') {
      return node.text || '';
    }

    // Handle paragraph nodes
    if (node.type === 'paragraph' && node.content) {
      return extractTextFromProseMirrorContent(node.content);
    }

    // Handle heading nodes
    if (node.type === 'heading' && node.content) {
      return extractTextFromProseMirrorContent(node.content);
    }

    // Handle blockquote nodes
    if (node.type === 'blockquote' && node.content) {
      return extractTextFromProseMirrorContent(node.content);
    }

    // Handle list nodes
    if (node.type === 'bulletList' && node.content) {
      return extractTextFromProseMirrorContent(node.content);
    }

    if (node.type === 'orderedList' && node.content) {
      return extractTextFromProseMirrorContent(node.content);
    }

    // Handle list item nodes
    if (node.type === 'listItem' && node.content) {
      return extractTextFromProseMirrorContent(node.content);
    }

    // Handle any other nodes with content
    if (node.content && Array.isArray(node.content)) {
      return extractTextFromProseMirrorContent(node.content);
    }

    return '';
  });

  const result = texts.filter(text => text.trim()).join(' ').trim();
  console.log('Extracted ProseMirror text result:', result.substring(0, 200));
  return result;
}

async function handler(
  req: AuthenticatedRequest,
  res: NextApiResponse<GenerateExcerptResponse>
) {
  if (!validateMethod(req, ['POST'])) {
    return res.status(405).json(ErrorResponses.METHOD_NOT_ALLOWED);
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'OPENAI_NOT_CONFIGURED',
        message: 'OpenAI API key is not configured',
      },
    });
  }

  const { title, content }: GenerateExcerptRequest = req.body;

  if (!content) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'NO_CONTENT',
        message: 'Content is required to generate excerpt',
      },
    });
  }

  try {
    // Extract plain text from content
    const plainText = extractPlainTextFromContent(content);
    
    if (!plainText.trim()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EMPTY_CONTENT',
          message: 'Content is empty - cannot generate excerpt',
        },
      });
    }

    // Generate excerpt using OpenAI
    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at creating compelling, concise excerpts for blog posts. Create a brief, engaging summary that captures the essence and main message of the content. The excerpt should be 1-2 sentences, around 100-150 characters, and make readers want to read the full post. Focus on the key insight or main point.'
          },
          {
            role: 'user',
            content: `Create an excerpt for this blog post:

${title ? `Title: ${title}\n\n` : ''}Content:
${plainText.substring(0, 3000)} ${plainText.length > 3000 ? '...' : ''}`
          },
        ],
        temperature: 0.3,
        max_tokens: 100,
      });

      const generatedExcerpt = completion.choices[0]?.message?.content?.trim();
      
      if (!generatedExcerpt) {
        throw new Error('No excerpt generated from AI');
      }

      return res.status(200).json({
        success: true,
        data: {
          excerpt: generatedExcerpt,
        },
      });

    } catch (aiError) {
      console.error('OpenAI error:', aiError);
      return res.status(500).json({
        success: false,
        error: {
          code: 'AI_GENERATION_FAILED',
          message: 'Failed to generate excerpt with AI',
          details: aiError.message,
        },
      });
    }

  } catch (error) {
    console.error('Generate excerpt error:', error);
    return res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error during excerpt generation',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      },
    });
  }
}

export default withAdminAuth(handler);
