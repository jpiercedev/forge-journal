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
          content: `You are a formatting expert. Your job is to take existing text and make it visually appealing with natural, varied structure while preserving every single word exactly as written.

CORE RULE: Never add, remove, or change any words. Only change how the existing text is formatted and structured.

FORMATTING GUIDELINES:
1. **Preserve all text exactly** - every word, punctuation mark, and sentence must remain identical
2. **Use natural variety** - mix different formatting elements for engaging, readable content
3. **Use existing text only** - if you make something a heading, it must be text that's already there

NATURAL FORMATTING APPROACH:
- **Main title**: Use H1 only for the very first/main title (if there is one)
- **Author bylines**: Keep as regular paragraphs with italic emphasis (like "By Dr. Jason Nelson")
- **Section breaks**: Use H2 sparingly, only for major section divisions
- **Questions**: Most questions should be regular paragraphs with bold emphasis, not headings
- **Key statements**: Use bold text within paragraphs rather than making them headings
- **Quoted text**: Any text in quotation marks should become blockquotes
- **Lists**: Format numbered or bulleted content as proper lists
- **Emphasis**: Use bold and italic text liberally within paragraphs for key phrases

FORMATTING VARIETY TO USE (in order of preference):
1. **Regular paragraphs** with bold/italic emphasis - use this most often
2. **Blockquotes** for quoted content and important statements
3. **Bold text** for key phrases and important concepts within paragraphs
4. **Italic text** for author bylines, subtle emphasis, and references
5. **Lists** when content is clearly structured as numbered or bulleted items
6. **H2 headings** only for major section breaks (use sparingly)
7. **H1 heading** only for the main title at the very beginning

EXAMPLE INPUT: "Don't Hold Your Breath\nBy Dr. Jason Nelson\n\n\"I'm stressed out\" is what I hear..."
EXAMPLE OUTPUT: Make "Don't Hold Your Breath" an H1, keep "By Dr. Jason Nelson" as italic paragraph, put quoted text in blockquote, keep most other content as regular paragraphs with bold emphasis.

REMEMBER: Favor paragraphs with emphasis over headings. Use headings sparingly for true structural breaks only.

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
  let hasMainTitle = false; // Track if we've used the main title

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

    // Detect main title (only first segment, and only if it looks like a title)
    // Split title and byline if they're combined
    let titleText = trimmed;
    let bylineText = '';

    if (index === 0 && trimmed.includes('\nBy ')) {
      const parts = trimmed.split('\nBy ');
      titleText = parts[0].trim();
      bylineText = 'By ' + parts[1].trim();
    }

    const isMainTitle = !hasMainTitle && index === 0 && titleText.length < 100 && !titleText.endsWith('.') && !isQuote &&
      (titleText.match(/^[A-Z][a-zA-Z\s']+$/) || titleText.match(/^(Don't|How to|Why|What|When|Where)/)) &&
      !titleText.startsWith('By ');

    // Detect bylines - keep as regular paragraphs with emphasis
    const isByline = trimmed.startsWith('By ') && trimmed.length < 50;

    // Most content should be regular paragraphs - be very selective about headings
    const isMajorSectionBreak = !isQuote && !isList && !isMainTitle && !isByline &&
      trimmed.length < 80 && !trimmed.endsWith('.') && trimmed.match(/^[A-Z]/) &&
      (trimmed.includes('Chapter') || trimmed.includes('Part ') || trimmed.includes('Section'));

    if (isMainTitle) {
      // Only the very first title gets H1
      blocks.push({
        type: 'heading',
        attrs: { level: 1 },
        content: [{ type: 'text', text: titleText }]
      });
      hasMainTitle = true;

      // If there was a byline in the same segment, add it as a separate italic paragraph
      if (bylineText) {
        blocks.push({
          type: 'paragraph',
          content: [{
            type: 'text',
            text: bylineText,
            marks: [{ type: 'italic' }]
          }]
        });
      }
    } else if (isByline) {
      // Author byline as emphasized paragraph, not heading
      blocks.push({
        type: 'paragraph',
        content: [{
          type: 'text',
          text: trimmed,
          marks: [{ type: 'italic' }]
        }]
      });
    } else if (isMajorSectionBreak) {
      // Only true section breaks get H2 - very rare
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
      // Regular paragraph with natural emphasis detection
      const content = [];

      // Detect questions and key statements that should be emphasized (not made into headings)
      const isQuestion = trimmed.endsWith('?');
      const isKeyStatement = trimmed.length < 80 && !trimmed.endsWith('.') && trimmed.match(/^[A-Z]/);

      // Detect key phrases that should be emphasized
      const emphasisPatterns = [
        /\b(In a word|In other words|Instead|Nope!|Don't hold your breath)\b/gi,
        /\b(Christ|Jesus|Prince of Peace|King of Kings|Holy Spirit|Church|God)\b/g,
        /\b(anxiety|peace|breathe|purify|faith|hope|love|grace|mercy)\b/gi
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
        // Add natural emphasis for questions and key statements
        if (isQuestion || isKeyStatement) {
          // Questions and key statements get bold emphasis
          content.push({
            type: 'text',
            marks: [{ type: 'bold' }],
            text: trimmed
          });
          hasEmphasis = true;
        } else {
          // Add smart emphasis for key phrases (more frequently than before)
          const shouldAddEmphasis = Math.random() < 0.5; // 50% chance to add emphasis
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


