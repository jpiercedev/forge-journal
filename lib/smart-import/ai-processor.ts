// AI Processing for Smart Import

import OpenAI from 'openai';

import { AIProcessingRequest, AIProcessingResponse, ImportOptions,ParsedContent } from '../../types/smart-import';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Process content using AI to enhance and structure it
 */
export async function processWithAI(
  parsedContent: ParsedContent,
  options: ImportOptions = {}
): Promise<ParsedContent> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn('OpenAI API key not found, using fallback processing');
    return processFallback(parsedContent, options);
  }

  try {
    const prompt = buildPrompt(parsedContent, options);
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content editor for a Christian leadership blog called Forge Journal. Your task is to analyze and enhance blog post content for pastors and church leaders.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.3,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error('No response from AI');
    }

    return parseAIResponse(response, parsedContent);
  } catch (error) {
    console.error('AI processing failed:', error);
    return processFallback(parsedContent, options);
  }
}

/**
 * Build the AI prompt based on content and options
 */
function buildPrompt(content: ParsedContent, options: ImportOptions): string {
  const sections = [];

  sections.push('Please analyze the following content and provide structured output:');
  sections.push('');
  sections.push('CONTENT TO ANALYZE:');
  sections.push('Title: ' + content.title);
  sections.push('Content: ' + content.content.substring(0, 3000)); // Limit content length
  
  if (content.author) {
    sections.push('Detected Author: ' + content.author);
  }

  sections.push('');
  sections.push('REQUIREMENTS:');
  sections.push('1. Provide an improved title if the current one is unclear or could be better');
  sections.push('2. Clean and format the content for a professional blog');
  sections.push('3. Generate a compelling 2-3 sentence excerpt');
  
  if (options.detectAuthor !== false) {
    sections.push('4. Identify the author if mentioned in the content');
  }
  
  if (options.suggestCategories !== false) {
    sections.push('5. Suggest 2-3 relevant categories for this content (focus on Christian leadership, ministry, pastoral care, church growth, theology, etc.)');
  }

  sections.push('');
  sections.push('RESPONSE FORMAT (JSON):');
  sections.push('{');
  sections.push('  "title": "improved or original title",');
  sections.push('  "content": "cleaned and formatted content",');
  sections.push('  "excerpt": "compelling 2-3 sentence summary",');
  sections.push('  "author": "author name if detected, null otherwise",');
  sections.push('  "categories": ["category1", "category2", "category3"],');
  sections.push('  "confidence": 0.95');
  sections.push('}');

  if (options.customPrompt) {
    sections.push('');
    sections.push('ADDITIONAL INSTRUCTIONS:');
    sections.push(options.customPrompt);
  }

  return sections.join('\n');
}

/**
 * Parse AI response and merge with original content
 */
function parseAIResponse(response: string, originalContent: ParsedContent): ParsedContent {
  try {
    // Extract JSON from response (handle cases where AI adds extra text)
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }

    const aiResult = JSON.parse(jsonMatch[0]) as AIProcessingResponse;

    return {
      ...originalContent,
      title: aiResult.title || originalContent.title,
      content: aiResult.content || originalContent.content,
      excerpt: aiResult.excerpt,
      author: aiResult.author || originalContent.author,
      categories: aiResult.categories || [],
    };
  } catch (error) {
    console.error('Failed to parse AI response:', error);
    return originalContent;
  }
}

/**
 * Fallback processing when AI is not available
 */
function processFallback(content: ParsedContent, options: ImportOptions): ParsedContent {
  const enhanced = { ...content };

  // Generate excerpt if not provided
  if (options.generateExcerpt !== false && !enhanced.excerpt) {
    enhanced.excerpt = generateExcerptFallback(content.content);
  }

  // Clean up title
  enhanced.title = cleanTitleFallback(content.title);

  // Clean up content
  enhanced.content = cleanContentFallback(content.content);

  // Suggest basic categories
  if (options.suggestCategories !== false) {
    enhanced.categories = suggestCategoriesFallback(content.content);
  }

  return enhanced;
}

/**
 * Generate excerpt using simple text processing
 */
function generateExcerptFallback(content: string): string {
  // Remove extra whitespace and get first few sentences
  const cleaned = content.replace(/\s+/g, ' ').trim();
  const sentences = cleaned.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length === 0) {
    return 'No excerpt available.';
  }

  // Take first 2-3 sentences, up to 200 characters
  let excerpt = sentences[0];
  let i = 1;
  
  while (i < sentences.length && i < 3 && excerpt.length < 150) {
    excerpt += '. ' + sentences[i];
    i++;
  }

  // Ensure it ends with punctuation
  if (!excerpt.match(/[.!?]$/)) {
    excerpt += '.';
  }

  return excerpt.length > 200 ? excerpt.substring(0, 197) + '...' : excerpt;
}

/**
 * Clean up title using simple rules
 */
function cleanTitleFallback(title: string): string {
  return title
    .replace(/^\s*[-•]\s*/, '') // Remove leading bullets
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .replace(/^(.{100}).*/, '$1...'); // Truncate if too long
}

/**
 * Clean up content using simple rules
 */
function cleanContentFallback(content: string): string {
  return content
    .replace(/\n{3,}/g, '\n\n') // Normalize line breaks
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/^\s+|\s+$/g, '') // Trim
    .replace(/(.{5000})[\s\S]*/, '$1...'); // Truncate if extremely long
}

/**
 * Suggest categories based on keyword matching
 */
function suggestCategoriesFallback(content: string): string[] {
  const categories: string[] = [];
  const lowerContent = content.toLowerCase();

  const categoryKeywords = {
    'Leadership': ['leader', 'leadership', 'manage', 'vision', 'strategy'],
    'Ministry': ['ministry', 'minister', 'serve', 'service', 'mission'],
    'Pastoral Care': ['pastoral', 'pastor', 'care', 'counsel', 'shepherd'],
    'Church Growth': ['growth', 'evangelism', 'outreach', 'community', 'discipleship'],
    'Theology': ['theology', 'biblical', 'scripture', 'doctrine', 'faith'],
    'Preaching': ['preach', 'sermon', 'teaching', 'message', 'pulpit'],
    'Prayer': ['prayer', 'pray', 'intercession', 'worship'],
    'Family Ministry': ['family', 'marriage', 'children', 'youth', 'parenting'],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    const matches = keywords.filter(keyword => lowerContent.includes(keyword));
    if (matches.length >= 2) {
      categories.push(category);
    }
  }

  // Default categories if none found
  if (categories.length === 0) {
    categories.push('Ministry', 'Leadership');
  }

  return categories.slice(0, 3); // Limit to 3 categories
}

/**
 * Validate AI processing configuration
 */
export function validateAIConfig(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Get AI processing status
 */
export function getAIStatus(): { available: boolean; model: string } {
  return {
    available: validateAIConfig(),
    model: 'gpt-4',
  };
}
