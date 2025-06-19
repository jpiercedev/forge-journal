// AI Content Formatter for Forge Journal
// Analyzes and formats blog post content without changing the actual text
//
// QUOTE FORMATTING RULE:
// Any text enclosed in quotation marks (", ", ', ') MUST be formatted as a blockquote.
// This is a mandatory rule for visual consistency and readability.

import OpenAI from 'openai';
// No complex types needed - simple and fast formatting

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Format content using AI - simple and fast like ChatGPT
 */
export async function formatContentWithAI(content: any): Promise<any> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OpenAI API key not found, using fallback formatting');
    return formatContentFallback(content);
  }

  try {
    const plainText = extractPlainTextFromContent(content);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o', // Use GPT-4o like you tested
      messages: [
        {
          role: 'user',
          content: `Format this for a blog without changing the content. Add appropriate headings, blockquotes, and structure to make it readable and engaging.

Return the result as a JSON object with this exact structure:
{
  "type": "doc",
  "content": [
    {"type": "paragraph", "content": [{"type": "text", "text": "paragraph text"}]},
    {"type": "heading", "attrs": {"level": 2}, "content": [{"type": "text", "text": "heading text"}]},
    {"type": "blockquote", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "quoted text"}]}]}
  ]
}

Content to format:

${plainText}`
        },
      ],
      temperature: 0.1,
      max_tokens: 4000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const formattedContent = JSON.parse(jsonMatch[0]);
    return formattedContent;

  } catch (error) {
    console.error('AI formatting failed:', error);
    return formatContentFallback(content);
  }
}

/**
 * Simple fallback formatting when AI is not available
 */
function formatContentFallback(content: any): any {
  const plainText = extractPlainTextFromContent(content);
  const segments = plainText.split(/\n\s*\n/).filter(segment => segment.trim());

  const blocks: any[] = [];

  segments.forEach((segment) => {
    const trimmed = segment.trim();

    // Enhanced quote detection for fallback - MANDATORY RULE: anything in quotes becomes blockquote
    const isQuote =
      // Direct quote detection - any text in quotation marks
      (trimmed.includes('"') && (trimmed.startsWith('"') || trimmed.endsWith('"'))) ||
      (trimmed.includes('"') && (trimmed.startsWith('"') || trimmed.endsWith('"'))) ||
      (trimmed.includes("'") && (trimmed.startsWith("'") || trimmed.endsWith("'"))) ||
      // Attribution patterns
      trimmed.match(/ - [A-Z][a-zA-Z\s]+$/) || // Ends with "- Author Name"
      trimmed.match(/ — [A-Z][a-zA-Z\s]+$/) || // Ends with "— Author Name"
      // Scripture and biblical references
      trimmed.match(/^(As the Bible says|Scripture tells us|The Bible says|Jesus said|Paul wrote|God says|As Jesus said|Christ said)/i) ||
      trimmed.match(/\b(verse|scripture|biblical|psalm|proverbs|matthew|mark|luke|john|romans|corinthians|genesis|exodus|deuteronomy)\b/i) ||
      // Dialogue and reported speech
      trimmed.match(/^(He said|She said|They said|I said|We said|You said)/i) ||
      // Famous quote patterns
      trimmed.match(/^".*".*-.*$/i) || // "Quote text" - Author
      // Any text containing quotes (even if not at start/end)
      (trimmed.includes('"') || trimmed.includes('"') || trimmed.includes('"'));

    // Simple heuristics for fallback
    if (trimmed.length < 80 && !trimmed.endsWith('.') && !trimmed.endsWith('!') && !trimmed.endsWith('?') && !isQuote) {
      // Likely a heading
      blocks.push({
        type: 'heading',
        attrs: { level: 2 },
        content: [{ type: 'text', text: trimmed }]
      });
    } else if (isQuote) {
      // Enhanced quote detection - preserve original text including quotation marks
      blocks.push({
        type: 'blockquote',
        content: [{
          type: 'paragraph',
          content: [{ type: 'text', text: trimmed }] // Keep original text with quotes
        }]
      });
    } else {
      // Regular paragraph
      blocks.push({
        type: 'paragraph',
        content: [{ type: 'text', text: trimmed }]
      });
    }
  });

  return {
    type: 'doc',
    content: blocks
  };
}





/**
 * Extract plain text from structured content
 */
function extractPlainTextFromContent(content: any): string {
  if (typeof content === 'string') {
    // Handle HTML content from Lexical editor
    if (content.includes('<')) {
      // Remove HTML tags and decode entities, preserve paragraph breaks
      const textContent = content
        .replace(/<\/p>/gi, '</p>\n\n') // Add double newlines after paragraphs
        .replace(/<\/h[1-6]>/gi, '</h>\n\n') // Add double newlines after headings
        .replace(/<\/li>/gi, '</li>\n') // Add newlines after list items
        .replace(/<\/blockquote>/gi, '</blockquote>\n\n') // Add double newlines after blockquotes
        .replace(/<br\s*\/?>/gi, '\n') // Convert line breaks to newlines
        .replace(/<[^>]*>/g, '') // Remove all HTML tags
        .replace(/&nbsp;/g, ' ') // Replace non-breaking spaces
        .replace(/&amp;/g, '&') // Replace HTML entities
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n\s*\n\s*\n/g, '\n\n') // Normalize multiple newlines to double newlines
        .trim();
      return textContent;
    }

    return content;
  }

  if (content && content.content && Array.isArray(content.content)) {
    const extractedBlocks = content.content.map((block: any) => extractPlainTextFromBlock(block));
    const result = extractedBlocks.join('\n\n');
    return result;
  }

  return '';
}

/**
 * Extract plain text from a content block
 */
function extractPlainTextFromBlock(block: any): string {
  if (block.text) {
    return block.text;
  }

  if (block.content && Array.isArray(block.content)) {
    const textParts = block.content.map((item: any) => {
      if (item.text) {
        return item.text;
      }
      // Handle nested content recursively
      if (item.content) {
        return extractPlainTextFromBlock(item);
      }
      return '';
    });
    return textParts.join('');
  }

  // Handle different block types
  if (block.type) {
    switch (block.type) {
      case 'heading':
      case 'paragraph':
      case 'blockquote':
        if (block.content) {
          return extractPlainTextFromBlock({ content: block.content });
        }
        break;
      case 'list_item':
      case 'ordered_list':
      case 'bullet_list':
        if (block.content) {
          return block.content.map((item: any) => extractPlainTextFromBlock(item)).join('\n');
        }
        break;
    }
  }

  return '';
}


