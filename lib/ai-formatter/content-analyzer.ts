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
          content: `You are a formatting expert. Your job is to take existing text and make it visually appealing with proper structure, while preserving every single word exactly as written.

CORE RULE: Never add, remove, or change any words. Only change how the existing text is formatted and structured.

FORMATTING GUIDELINES:
1. **Preserve all text exactly** - every word, punctuation mark, and sentence must remain identical
2. **Add visual structure** - use headings, blockquotes, emphasis, and lists to make it engaging
3. **Use existing text only** - if you make something a heading, it must be text that's already there

WHAT TO FORMAT:
- **Titles and names**: Short lines at the beginning often work as headings (like "Don't Hold Your Breath")
- **Author bylines**: Lines starting with "By" can stay as paragraphs or become smaller headings
- **Quoted text**: Any text in quotation marks should become blockquotes
- **Questions**: Standalone questions can be emphasized or become small headings
- **Key statements**: Important declarations can be emphasized with bold
- **Lists**: If you see numbered or bulleted content, format as proper lists

FORMATTING VARIETY TO USE:
- Heading level 1 for main titles
- Heading level 2 for section breaks (only if the text is already there)
- Blockquotes for quoted content and important statements
- Bold text for emphasis on key phrases
- Proper paragraph breaks for readability

EXAMPLE INPUT: "Don't Hold Your Breath\nBy Dr. Jason Nelson\n\n\"I'm stressed out\" is what I hear..."
EXAMPLE OUTPUT: Make "Don't Hold Your Breath" a heading, keep byline as paragraph, put quoted text in blockquote.

REMEMBER: Use the existing text creatively for structure, but never invent new headings or content.

Return as JSON:
{
  "type": "doc",
  "content": [
    {"type": "heading", "attrs": {"level": 1}, "content": [{"type": "text", "text": "existing title text"}]},
    {"type": "paragraph", "content": [{"type": "text", "text": "existing text"}, {"type": "text", "marks": [{"type": "bold"}], "text": "emphasized existing text"}]},
    {"type": "blockquote", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "existing quoted text"}]}]}
  ]
}

Content to format (make it visually engaging using only this existing text):

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
 * Enhanced fallback formatting when AI is not available
 */
function formatContentFallback(content: any): any {
  const plainText = extractPlainTextFromContent(content);
  const segments = plainText.split(/\n\s*\n/).filter(segment => segment.trim());

  const blocks: any[] = [];
  let headingLevel = 1; // Track heading hierarchy

  segments.forEach((segment, index) => {
    const trimmed = segment.trim();

    // Enhanced quote detection - MANDATORY RULE: anything in quotes becomes blockquote
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

    // Check for list patterns
    const isList =
      trimmed.match(/^(\d+\.|•|\*|-)\s/) || // Numbered or bulleted lists
      trimmed.match(/^(First|Second|Third|Fourth|Fifth|Next|Finally|Additionally|Moreover|Furthermore)/i) ||
      trimmed.split(/\n/).filter(line => line.trim().match(/^(\d+\.|•|\*|-)\s/)).length > 1;

    // Detect titles and headings from existing text only
    const isMainTitle = index === 0 && trimmed.length < 100 && !trimmed.endsWith('.') && !isQuote &&
      (trimmed.match(/^[A-Z][a-zA-Z\s']+$/) || trimmed.includes('By ') || trimmed.match(/^(Don't|How to|Why|What|When|Where)/));

    // Detect questions and short statements that could be subheadings
    const isSubHeading = !isQuote && !isList && !isMainTitle && (
      (trimmed.endsWith('?') && trimmed.length < 60) || // Questions as headings
      (trimmed.length < 50 && !trimmed.endsWith('.') && trimmed.match(/^[A-Z]/)) // Short statements
    );

    // Detect bylines
    const isByline = trimmed.startsWith('By ') && trimmed.length < 50;

    if (isMainTitle) {
      // First segment as main title
      blocks.push({
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: trimmed }]
      });
      headingLevel = 2; // Next headings will be level 2
    } else if (isByline) {
      // Author byline as smaller heading or emphasized paragraph
      blocks.push({
        type: 'heading',
        attrs: { level: 3 },
        content: [{ type: 'text', text: trimmed }]
      });
    } else if (isSubHeading) {
      // Questions and short statements as subheadings
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
          content: [{ type: 'text', text: trimmed }]
        }]
      });
    } else if (isList) {
      // Convert to proper list format
      const listItems = trimmed.split(/\n/).filter(line => line.trim());
      const isNumbered = trimmed.match(/^\d+\./);

      const listContent = listItems.map(item => {
        const cleanItem = item.replace(/^(\d+\.|•|\*|-)\s*/, '').trim();
        return {
          type: 'list_item',
          content: [{
            type: 'paragraph',
            content: [{ type: 'text', text: cleanItem }]
          }]
        };
      });

      blocks.push({
        type: isNumbered ? 'ordered_list' : 'bullet_list',
        content: listContent
      });
    } else {
      // Regular paragraph with smart emphasis detection
      const content = [];

      // Detect key phrases that should be emphasized
      const emphasisPatterns = [
        /\b(In a word|In other words|Instead|Nope!|Don't hold your breath)\b/gi,
        /\b(Christ|Jesus|Prince of Peace|King of Kings|Holy Spirit|Church|God)\b/g,
        /\b(anxiety|peace|breathe|purify)\b/gi
      ];

      let textWithEmphasis = trimmed;
      let hasEmphasis = false;

      // Check for existing markdown-style emphasis first
      if (trimmed.includes('**') || trimmed.includes('*')) {
        const parts = trimmed.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/);
        parts.forEach(part => {
          if (part.startsWith('**') && part.endsWith('**')) {
            content.push({
              type: 'text',
              marks: [{ type: 'bold' }],
              text: part.slice(2, -2)
            });
            hasEmphasis = true;
          } else if (part.startsWith('*') && part.endsWith('*')) {
            content.push({
              type: 'text',
              marks: [{ type: 'italic' }],
              text: part.slice(1, -1)
            });
            hasEmphasis = true;
          } else if (part.trim()) {
            content.push({ type: 'text', text: part });
          }
        });
      } else {
        // Add smart emphasis for key phrases (but only occasionally to avoid overdoing it)
        const shouldAddEmphasis = Math.random() < 0.3; // 30% chance to add emphasis
        if (shouldAddEmphasis) {
          for (const pattern of emphasisPatterns) {
            if (pattern.test(trimmed)) {
              textWithEmphasis = trimmed.replace(pattern, (match) => `**${match}**`);
              hasEmphasis = true;
              break; // Only apply one emphasis pattern
            }
          }
        }

        if (hasEmphasis) {
          // Parse the emphasized text
          const parts = textWithEmphasis.split(/(\*\*[^*]+\*\*)/);
          parts.forEach(part => {
            if (part.startsWith('**') && part.endsWith('**')) {
              content.push({
                type: 'text',
                marks: [{ type: 'bold' }],
                text: part.slice(2, -2)
              });
            } else if (part.trim()) {
              content.push({ type: 'text', text: part });
            }
          });
        } else {
          content.push({ type: 'text', text: trimmed });
        }
      }

      blocks.push({
        type: 'paragraph',
        content
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


