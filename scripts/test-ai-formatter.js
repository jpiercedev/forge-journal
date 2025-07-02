#!/usr/bin/env node

/**
 * Test script for AI Formatter to verify it preserves content
 * Run with: node scripts/test-ai-formatter.js
 */

const { formatContentWithAI } = require('../lib/ai-formatter/content-analyzer');

async function testAIFormatter() {
  console.log('🧪 Testing AI Formatter...\n');

  // Test content using the exact user input that had issues
  const testContent = `Don't Hold Your Breath
By Dr. Jason J. Nelson

More than any other time in my life, I hear people saying things like, "I'm stressed out. I can't relax. My mind's restless, my body's tense; my shoulders hurt, my back aches. I can't sleep and when I finally do get to sleep, I wake up in the middle of the night with my mind racing all over the place."

Does this sound familiar?
Why are so many people so restless these days? What's the problem? In a word, anxiety. Anxiety is in the air today and it is thick. Like smoke rising up and out of a chimney on a cold winter's day, anxiety billows up from the burning, anxiety filled and generating events around. This emotionally charged pollution engulfs our lives, heightens our emotions, and clouds our judgment. The result? An absence of peace. Watch the news, read the newspaper, or look to see what's trending on the vast array of different social media venues and you'll quickly see that this world has many issues. Additionally, we've got some highly anxious people using highly anxious language, which is taking the already existing, natural level of anxiety to an even higher level.
So yes, anxiety is definitely in the air. In fact, it has created an addictively potent atmosphere. Instead of staying below the fumes of anxiety, many individuals seem to uprightly enjoy inhaling them. It has become an addictive stimulus. Unlike physical breathing, however, which involves one thing in and another thing out, when anxiety is inhaled it's always exhaled as well. Is it any wonder then that people are suffocating from the emissions of anxiety?
What then do we do? We can't just hold our breath, can we?
Nope!  Don't hold your breath.
Instead, do your part to purify the air!
It's time to create real climate change. It's time to stop feeding our culture's fascination with negativity and gossip, time to extinguish the emotional toxins in the air. It's time to silence the airwaves of society's problem-finding-vernacular and start voicing, rather loudly, the one and only Answer to all of the hostilities in the world. It's time to put anxiety, fear, and paranoia in their proper place.
In other words, it's time to preach Christ, the Prince of Peace, more boldly than ever. It's time to proclaim Jesus as King of Kings and claim his peace in the midst of the most hostile and apprehensive of situations. It's time to breathe in the peace of Christ and then, breathe it out again, for our own sake and the edification of those around us.
We are, through the power of the Holy Spirit, God's breath of fresh air in our world today. We, as the Church, can breathe life into a dirty, decaying culture.`;

  try {
    console.log('📝 Original content:');
    console.log('---');
    console.log(testContent);
    console.log('---\n');

    console.log('🤖 Formatting with AI...\n');
    
    const formatted = await formatContentWithAI(testContent);
    
    console.log('✅ Formatted result:');
    console.log('---');
    console.log(JSON.stringify(formatted, null, 2));
    console.log('---\n');

    // Extract text from formatted content to compare
    const extractedText = extractAllText(formatted);
    
    console.log('📊 Extracted text from formatted content:');
    console.log('---');
    console.log(extractedText);
    console.log('---\n');

    // Simple comparison - check if key phrases are preserved and NO new headings added
    const keyPhrases = [
      'Don\'t Hold Your Breath',
      'By Dr. Jason J. Nelson',
      'I\'m stressed out. I can\'t relax',
      'Does this sound familiar?',
      'In a word, anxiety',
      'Don\'t hold your breath',
      'Instead, do your part to purify the air!',
      'preach Christ, the Prince of Peace',
      'We are, through the power of the Holy Spirit'
    ];

    // Check for phrases that should NOT be there (new headings the AI might add)
    const forbiddenPhrases = [
      'The Anxiety Epidemic',
      'Understanding the Problem',
      'Finding Solutions',
      'Our Role as the Church',
      'The Problem',
      'Solutions',
      'Introduction',
      'Conclusion'
    ];

    let allPhrasesFound = true;
    let noForbiddenPhrasesFound = true;

    console.log('🔍 Checking if key phrases are preserved:');
    keyPhrases.forEach(phrase => {
      const found = extractedText.includes(phrase);
      console.log(`  ${found ? '✅' : '❌'} "${phrase}"`);
      if (!found) allPhrasesFound = false;
    });

    console.log('\n🚫 Checking for forbidden phrases (new headings that shouldn\'t be added):');
    forbiddenPhrases.forEach(phrase => {
      const found = extractedText.includes(phrase);
      console.log(`  ${found ? '❌' : '✅'} "${phrase}" ${found ? '(FOUND - BAD!)' : '(not found - good)'}`);
      if (found) noForbiddenPhrasesFound = false;
    });

    // Check for good formatting elements
    console.log('\n✨ Checking for good formatting elements:');
    const goodFormattingChecks = [
      { check: formatted.content && formatted.content.length > 1, desc: 'Multiple content blocks created' },
      { check: formatted.content?.some(block => block.type === 'heading'), desc: 'Headings detected' },
      { check: formatted.content?.some(block => block.type === 'blockquote'), desc: 'Blockquotes for quoted text' },
      { check: formatted.content?.some(block => block.type === 'paragraph'), desc: 'Proper paragraphs' }
    ];

    goodFormattingChecks.forEach(({ check, desc }) => {
      console.log(`  ${check ? '✅' : '⚠️'} ${desc}`);
    });

    console.log('\n📋 Test Result:');
    if (allPhrasesFound && noForbiddenPhrasesFound) {
      console.log('✅ SUCCESS: All original content preserved and no new headings added!');
      const hasGoodFormatting = goodFormattingChecks.some(({ check }) => check);
      if (hasGoodFormatting) {
        console.log('✨ BONUS: Good formatting elements detected!');
      } else {
        console.log('⚠️ NOTE: Content preserved but minimal formatting applied');
      }
    } else {
      if (!allPhrasesFound) {
        console.log('❌ FAILURE: Some original content was lost');
      }
      if (!noForbiddenPhrasesFound) {
        console.log('❌ FAILURE: AI added new headings that weren\'t in the original');
      }
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
    console.error('Full error:', error);
  }
}

function extractAllText(content) {
  if (typeof content === 'string') {
    return content;
  }

  if (content && content.content && Array.isArray(content.content)) {
    return content.content.map(block => extractTextFromBlock(block)).join(' ').trim();
  }

  return '';
}

function extractTextFromBlock(block) {
  if (block.text) {
    return block.text;
  }

  if (block.content && Array.isArray(block.content)) {
    return block.content.map(item => {
      if (item.text) {
        return item.text;
      }
      if (item.content) {
        return extractTextFromBlock(item);
      }
      return '';
    }).join(' ');
  }

  return '';
}

// Run the test
testAIFormatter().catch(console.error);
