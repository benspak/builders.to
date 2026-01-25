import OpenAI from 'openai';
import prisma from '@/lib/prisma';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Tone presets for content generation
export const TONE_PRESETS = {
  professional: 'Write in a professional, authoritative tone suitable for business audiences',
  casual: 'Write in a friendly, conversational tone with a personal touch',
  witty: 'Write with humor and wit, using clever observations and wordplay',
  inspirational: 'Write in an inspiring, motivational tone that encourages action',
  educational: 'Write in an informative, teaching tone that explains concepts clearly',
  provocative: 'Write in a thought-provoking tone that challenges assumptions',
} as const;

export type TonePreset = keyof typeof TONE_PRESETS;

// Platform-specific constraints
const PLATFORM_CONSTRAINTS = {
  TWITTER: {
    maxLength: 280,
    style: 'concise and punchy, optimized for engagement. Use hashtags sparingly.',
  },
  LINKEDIN: {
    maxLength: 3000,
    style: 'professional and value-driven, with clear takeaways. Can be longer-form.',
  },
  BUILDERS: {
    maxLength: 5000,
    style: 'founder-focused, sharing genuine insights and progress updates.',
  },
};

export interface ContentGenerationOptions {
  topic?: string;
  tone?: TonePreset;
  platform?: keyof typeof PLATFORM_CONSTRAINTS;
  context?: string;
  interests?: string[];
  originalContent?: string; // For remix
  action?: 'generate' | 'remix' | 'expand' | 'shorten' | 'improve';
  maxLength?: number; // Custom max character limit (default: platform limit or 500)
}

export interface GeneratedContent {
  content: string;
  platform?: string;
  hashtags?: string[];
  estimatedEngagement?: 'low' | 'medium' | 'high';
}

/**
 * Generate content using OpenAI
 */
export async function generateContent(
  options: ContentGenerationOptions
): Promise<GeneratedContent> {
  const {
    topic,
    tone = 'professional',
    platform,
    context,
    interests = [],
    originalContent,
    action = 'generate',
    maxLength,
  } = options;

  const toneInstruction = TONE_PRESETS[tone];
  const platformConfig = platform ? PLATFORM_CONSTRAINTS[platform] : null;
  
  // Use custom maxLength if provided, otherwise use platform limit, default to 500
  const effectiveMaxLength = maxLength || platformConfig?.maxLength || 500;

  let systemPrompt = `You are a social media content expert helping solo founders and indie hackers create engaging content. ${toneInstruction}.`;

  // Always enforce the character limit
  systemPrompt += ` IMPORTANT: Keep the content under ${effectiveMaxLength} characters. Be concise and impactful.`;

  if (platformConfig) {
    systemPrompt += ` Write content optimized for ${platform}: ${platformConfig.style}`;
  }

  if (interests.length > 0) {
    systemPrompt += ` The user is interested in: ${interests.join(', ')}.`;
  }

  if (context) {
    systemPrompt += ` Additional context about the user: ${context}`;
  }

  let userPrompt = '';

  switch (action) {
    case 'generate':
      userPrompt = topic
        ? `Create an engaging social media post about: ${topic}`
        : 'Create an engaging social media post that would resonate with the startup/indie hacker community';
      break;

    case 'remix':
      userPrompt = `Rewrite this content with a fresh angle while keeping the core message:\n\n"${originalContent}"`;
      break;

    case 'expand':
      userPrompt = `Expand on this content, adding more detail and value:\n\n"${originalContent}"`;
      break;

    case 'shorten':
      userPrompt = `Make this content more concise while keeping the key message${platformConfig ? ` (max ${platformConfig.maxLength} chars)` : ''}:\n\n"${originalContent}"`;
      break;

    case 'improve':
      userPrompt = `Improve this content to be more engaging and impactful:\n\n"${originalContent}"`;
      break;
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    let content = completion.choices[0]?.message?.content || '';
    content = content.trim();
    
    // Enforce character limit as a safety net
    if (content.length > effectiveMaxLength) {
      // Try to truncate at a sentence boundary
      const truncated = content.slice(0, effectiveMaxLength);
      const lastSentenceEnd = Math.max(
        truncated.lastIndexOf('. '),
        truncated.lastIndexOf('! '),
        truncated.lastIndexOf('? ')
      );
      
      if (lastSentenceEnd > effectiveMaxLength * 0.7) {
        content = truncated.slice(0, lastSentenceEnd + 1);
      } else {
        // Fall back to word boundary
        const lastSpace = truncated.lastIndexOf(' ');
        content = lastSpace > effectiveMaxLength * 0.8 
          ? truncated.slice(0, lastSpace) + '...'
          : truncated.slice(0, effectiveMaxLength - 3) + '...';
      }
    }

    // Extract hashtags if present
    const hashtagRegex = /#\w+/g;
    const hashtags = content.match(hashtagRegex) || [];

    return {
      content: content,
      platform: platform,
      hashtags: hashtags.map((h) => h.slice(1)), // Remove # prefix
      estimatedEngagement: estimateEngagement(content),
    };
  } catch (error) {
    console.error('OpenAI content generation error:', error);
    throw new Error('Failed to generate content');
  }
}

/**
 * Generate multiple content variations
 */
export async function generateContentVariations(
  options: ContentGenerationOptions,
  count: number = 3
): Promise<GeneratedContent[]> {
  const {
    topic,
    tone = 'professional',
    platform,
    context,
    interests = [],
  } = options;

  const toneInstruction = TONE_PRESETS[tone];
  const platformConfig = platform ? PLATFORM_CONSTRAINTS[platform] : null;

  let systemPrompt = `You are a social media content expert helping solo founders. ${toneInstruction}.`;

  if (platformConfig) {
    systemPrompt += ` Optimize for ${platform}: ${platformConfig.style} Max ${platformConfig.maxLength} chars each.`;
  }

  const userPrompt = `Create ${count} different variations of a social media post about: ${topic || 'building in public and startup life'}.

${interests.length > 0 ? `User interests: ${interests.join(', ')}` : ''}
${context ? `Context: ${context}` : ''}

Return each variation on a new line, numbered 1-${count}. Each should have a unique angle or hook.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 2000,
      temperature: 0.8,
    });

    const response = completion.choices[0]?.message?.content || '';

    // Parse numbered variations
    const variations = response
      .split(/\n\d+\.\s*/)
      .filter((v) => v.trim())
      .map((content) => ({
        content: content.trim(),
        platform,
        hashtags: (content.match(/#\w+/g) || []).map((h) => h.slice(1)),
        estimatedEngagement: estimateEngagement(content),
      }));

    return variations.slice(0, count);
  } catch (error) {
    console.error('OpenAI variations error:', error);
    throw new Error('Failed to generate content variations');
  }
}

/**
 * Analyze and suggest improvements for content
 */
export async function analyzeContent(content: string, platform?: string): Promise<{
  score: number;
  suggestions: string[];
  improvedVersion?: string;
}> {
  const platformConfig = platform ? PLATFORM_CONSTRAINTS[platform as keyof typeof PLATFORM_CONSTRAINTS] : null;

  const systemPrompt = `You are a social media expert analyzing content for engagement potential. Be specific and actionable in your feedback.`;

  const userPrompt = `Analyze this social media post${platform ? ` for ${platform}` : ''}:

"${content}"

Provide:
1. A score from 1-10 for engagement potential
2. 3 specific suggestions to improve it
3. An improved version of the content

${platformConfig ? `Platform constraints: ${platformConfig.style}, max ${platformConfig.maxLength} chars` : ''}

Format your response as:
SCORE: [number]
SUGGESTIONS:
- [suggestion 1]
- [suggestion 2]
- [suggestion 3]
IMPROVED:
[improved content]`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1000,
      temperature: 0.5,
    });

    const response = completion.choices[0]?.message?.content || '';

    // Parse response
    const scoreMatch = response.match(/SCORE:\s*(\d+)/);
    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 5;

    const suggestionsMatch = response.match(/SUGGESTIONS:\n([\s\S]*?)(?=IMPROVED:|$)/);
    const suggestions = suggestionsMatch
      ? suggestionsMatch[1]
          .split('\n')
          .filter((l) => l.trim().startsWith('-'))
          .map((l) => l.replace(/^-\s*/, '').trim())
      : [];

    const improvedMatch = response.match(/IMPROVED:\n([\s\S]*?)$/);
    const improvedVersion = improvedMatch ? improvedMatch[1].trim() : undefined;

    return { score, suggestions, improvedVersion };
  } catch (error) {
    console.error('OpenAI analysis error:', error);
    throw new Error('Failed to analyze content');
  }
}

/**
 * Generate image with DALL-E (Pro feature)
 */
export async function generateImage(
  prompt: string,
  userId: string
): Promise<{ url: string; revisedPrompt?: string }> {
  // Check if user has Pro subscription
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { proSubscription: true },
  });

  if (user?.proSubscription?.status !== 'ACTIVE') {
    throw new Error('DALL-E image generation is a Pro feature');
  }

  try {
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `Create a professional, visually appealing image for social media: ${prompt}. Style: modern, clean, suitable for business/startup audience.`,
      n: 1,
      size: '1024x1024',
      quality: 'standard',
    });

    const imageData = response.data[0];

    if (!imageData?.url) {
      throw new Error('No image generated');
    }

    return {
      url: imageData.url,
      revisedPrompt: imageData.revised_prompt,
    };
  } catch (error) {
    console.error('DALL-E generation error:', error);
    if (error instanceof Error && error.message.includes('Pro feature')) {
      throw error;
    }
    throw new Error('Failed to generate image');
  }
}

/**
 * Generate content ideas based on user profile
 */
export async function generateContentIdeas(
  userId: string,
  count: number = 5,
  customPrompt?: string
): Promise<string[]> {
  // Get user AI profile
  const aiProfile = await prisma.userAIProfile.findUnique({
    where: { userId },
  });

  const interests = aiProfile?.interests || [];
  const toneContext = aiProfile?.toneContext as Record<string, unknown> | null;

  const systemPrompt = `You are a content strategist for indie hackers and solo founders. Generate unique, engaging content ideas.`;

  const userPrompt = `Generate ${count} specific content ideas for social media posts.

${interests.length > 0 ? `User interests: ${interests.join(', ')}` : 'Interests: startups, building in public, indie hacking'}
${toneContext?.preferredTone ? `Preferred tone: ${toneContext.preferredTone}` : ''}
${customPrompt ? `\nUser's specific guidance: ${customPrompt}` : ''}

Each idea should be specific enough to inspire a post. Include a mix of:
- Personal stories/lessons learned
- Tips and how-tos
- Industry observations
- Engagement hooks (questions, polls)

Format: Return each idea on a new line, numbered 1-${count}.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 1000,
      temperature: 0.9,
    });

    const response = completion.choices[0]?.message?.content || '';

    const ideas = response
      .split(/\n\d+\.\s*/)
      .filter((idea) => idea.trim())
      .slice(0, count);

    return ideas;
  } catch (error) {
    console.error('OpenAI ideas generation error:', error);
    throw new Error('Failed to generate content ideas');
  }
}

/**
 * Simple engagement estimation based on content characteristics
 */
function estimateEngagement(content: string): 'low' | 'medium' | 'high' {
  let score = 0;

  // Questions increase engagement
  if (content.includes('?')) score += 2;

  // Emojis can increase engagement
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]/gu;
  if (emojiRegex.test(content)) score += 1;

  // Numbers/lists are engaging
  if (/\d+\.|\d+\)/.test(content)) score += 1;

  // Hashtags help discoverability
  if (/#\w+/.test(content)) score += 1;

  // Call to action
  if (/share|comment|thoughts|let me know|what do you/i.test(content)) score += 2;

  // Optimal length (not too short, not too long)
  if (content.length >= 100 && content.length <= 280) score += 1;

  if (score >= 5) return 'high';
  if (score >= 3) return 'medium';
  return 'low';
}
