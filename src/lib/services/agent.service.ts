import { SocialPlatform, SuggestionStatus, AgentSuggestion } from '@prisma/client';
import prisma from '@/lib/prisma';
import { generateContent, generateContentIdeas, TonePreset } from './openai.service';
import { getUserConnections } from './platforms.service';

export interface CreateSuggestionInput {
  content: string;
  platforms: SocialPlatform[];
  reasoning?: string;
}

export interface SuggestionWithFeedback extends AgentSuggestion {
  editDistance?: number;
}

export interface GenerateSuggestionsOptions {
  tone?: TonePreset;
  customPrompt?: string;
}

/**
 * Get user's pending suggestions
 */
export async function getPendingSuggestions(userId: string): Promise<AgentSuggestion[]> {
  return prisma.agentSuggestion.findMany({
    where: {
      userId,
      status: SuggestionStatus.PENDING,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get all suggestions for a user with optional filtering
 */
export async function getUserSuggestions(
  userId: string,
  options: {
    status?: SuggestionStatus;
    limit?: number;
    offset?: number;
  } = {}
): Promise<AgentSuggestion[]> {
  const { status, limit = 25, offset = 0 } = options;

  return prisma.agentSuggestion.findMany({
    where: {
      userId,
      ...(status && { status }),
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
}

/**
 * Create a new suggestion
 */
export async function createSuggestion(
  userId: string,
  input: CreateSuggestionInput
): Promise<AgentSuggestion> {
  return prisma.agentSuggestion.create({
    data: {
      userId,
      content: input.content,
      platforms: input.platforms,
      reasoning: input.reasoning,
      status: SuggestionStatus.PENDING,
    },
  });
}

/**
 * Approve a suggestion (optionally with edits)
 */
export async function approveSuggestion(
  userId: string,
  suggestionId: string,
  editedContent?: string
): Promise<AgentSuggestion> {
  const suggestion = await prisma.agentSuggestion.findFirst({
    where: { id: suggestionId, userId },
  });

  if (!suggestion) {
    throw new Error('Suggestion not found');
  }

  if (suggestion.status !== SuggestionStatus.PENDING) {
    throw new Error('Suggestion already processed');
  }

  // Track if content was edited for learning
  const wasEdited = editedContent && editedContent !== suggestion.content;
  const feedback = wasEdited
    ? {
        type: 'edited',
        originalLength: suggestion.content.length,
        editedLength: editedContent!.length,
        editDistance: calculateEditDistance(suggestion.content, editedContent!),
      }
    : { type: 'approved_as_is' };

  return prisma.agentSuggestion.update({
    where: { id: suggestionId },
    data: {
      status: SuggestionStatus.APPROVED,
      content: editedContent || suggestion.content,
      feedback,
      reviewedAt: new Date(),
    },
  });
}

/**
 * Reject a suggestion with optional feedback
 */
export async function rejectSuggestion(
  userId: string,
  suggestionId: string,
  reason?: string
): Promise<AgentSuggestion> {
  const suggestion = await prisma.agentSuggestion.findFirst({
    where: { id: suggestionId, userId },
  });

  if (!suggestion) {
    throw new Error('Suggestion not found');
  }

  if (suggestion.status !== SuggestionStatus.PENDING) {
    throw new Error('Suggestion already processed');
  }

  return prisma.agentSuggestion.update({
    where: { id: suggestionId },
    data: {
      status: SuggestionStatus.REJECTED,
      feedback: {
        type: 'rejected',
        reason: reason || 'No reason provided',
      },
      reviewedAt: new Date(),
    },
  });
}

/**
 * Mark a suggestion as published
 */
export async function markSuggestionPublished(
  suggestionId: string
): Promise<AgentSuggestion> {
  return prisma.agentSuggestion.update({
    where: { id: suggestionId },
    data: { status: SuggestionStatus.PUBLISHED },
  });
}

/**
 * Generate suggestions for a user based on their profile and history
 */
export async function generateSuggestionsForUser(
  userId: string,
  count: number = 3,
  options: GenerateSuggestionsOptions = {}
): Promise<AgentSuggestion[]> {
  // Check if user has Pro subscription (agentic features are Pro-only)
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { proSubscription: true, aiProfile: true },
  });

  if (!user || user.proSubscription?.status !== 'ACTIVE') {
    throw new Error('Agentic workflows require Pro subscription');
  }

  // Get user's connected platforms
  const connections = await getUserConnections(userId);
  // Include BUILDERS as always available
  const connectedPlatforms = [...connections.map((c) => c.platform), SocialPlatform.BUILDERS];
  
  if (connectedPlatforms.length === 0) {
    throw new Error('No connected platforms');
  }

  // Get user preferences from AI profile
  const interests = user.aiProfile?.interests || [];
  const toneContext = user.aiProfile?.toneContext as Record<string, unknown> | null;
  
  // Use provided tone or fall back to user's profile preference
  const preferredTone = options.tone || (toneContext?.preferredTone as TonePreset) || 'professional';

  // Get recent feedback to learn from
  const recentFeedback = await getRecentFeedback(userId);

  // Build context from feedback and custom prompt
  let contextString = buildContextFromFeedback(recentFeedback);
  if (options.customPrompt) {
    contextString = contextString 
      ? `${contextString}. User guidance: ${options.customPrompt}`
      : `User guidance: ${options.customPrompt}`;
  }

  // Generate content ideas first (passing custom prompt for better idea generation)
  const ideas = await generateContentIdeas(userId, count, options.customPrompt);

  // Generate full content for each idea
  const suggestions: AgentSuggestion[] = [];

  for (const idea of ideas) {
    try {
      // Determine best platform for this content
      const targetPlatform = selectBestPlatform(idea, connectedPlatforms);

      const result = await generateContent({
        topic: idea,
        tone: preferredTone,
        platform: targetPlatform,
        interests,
        context: contextString,
        maxLength: 500, // Enforce 500 character limit
      });

      const suggestion = await createSuggestion(userId, {
        content: result.content,
        platforms: [targetPlatform],
        reasoning: `Generated based on your interest in: ${idea.slice(0, 50)}...`,
      });

      suggestions.push(suggestion);
    } catch (error) {
      console.error('Error generating suggestion:', error);
    }
  }

  return suggestions;
}

/**
 * Get recent feedback for learning
 */
async function getRecentFeedback(userId: string): Promise<{
  approvedPatterns: string[];
  rejectedPatterns: string[];
  editPatterns: Array<{ original: string; edited: string }>;
}> {
  const recentSuggestions = await prisma.agentSuggestion.findMany({
    where: {
      userId,
      status: { in: [SuggestionStatus.APPROVED, SuggestionStatus.REJECTED, SuggestionStatus.PUBLISHED] },
      reviewedAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
    },
    orderBy: { reviewedAt: 'desc' },
    take: 50,
  });

  const approvedPatterns: string[] = [];
  const rejectedPatterns: string[] = [];
  const editPatterns: Array<{ original: string; edited: string }> = [];

  for (const suggestion of recentSuggestions) {
    if (!suggestion.feedback) continue;

    try {
      const feedback = suggestion.feedback as Record<string, unknown>;

      if (feedback.type === 'approved_as_is' || feedback.type === 'edited') {
        // Extract key phrases from approved content
        const keyPhrases = extractKeyPhrases(suggestion.content);
        approvedPatterns.push(...keyPhrases);
      }

      if (feedback.type === 'rejected') {
        const keyPhrases = extractKeyPhrases(suggestion.content);
        rejectedPatterns.push(...keyPhrases);
      }

      if (feedback.type === 'edited' && feedback.originalContent) {
        editPatterns.push({
          original: feedback.originalContent as string,
          edited: suggestion.content,
        });
      }
    } catch {
      // Skip invalid feedback
    }
  }

  return { approvedPatterns, rejectedPatterns, editPatterns };
}

/**
 * Build context string from feedback for AI
 */
function buildContextFromFeedback(feedback: {
  approvedPatterns: string[];
  rejectedPatterns: string[];
}): string {
  const parts: string[] = [];

  if (feedback.approvedPatterns.length > 0) {
    parts.push(
      `The user tends to approve content with themes like: ${feedback.approvedPatterns.slice(0, 10).join(', ')}`
    );
  }

  if (feedback.rejectedPatterns.length > 0) {
    parts.push(
      `Avoid themes like: ${feedback.rejectedPatterns.slice(0, 5).join(', ')}`
    );
  }

  return parts.join('. ');
}

/**
 * Extract key phrases from content for pattern learning
 */
function extractKeyPhrases(content: string): string[] {
  // Simple extraction - in production, use NLP
  const words = content.toLowerCase().split(/\s+/);
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been',
    'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
    'would', 'could', 'should', 'may', 'might', 'must', 'shall',
    'can', 'need', 'dare', 'ought', 'used', 'to', 'of', 'in',
    'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into',
    'through', 'during', 'before', 'after', 'above', 'below',
    'between', 'under', 'again', 'further', 'then', 'once',
    'here', 'there', 'when', 'where', 'why', 'how', 'all',
    'each', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than',
    'too', 'very', 'just', 'and', 'but', 'if', 'or', 'because',
    'until', 'while', 'about', 'against', 'up', 'down', 'out',
    'off', 'over', 'i', 'you', 'he', 'she', 'it', 'we', 'they',
    'my', 'your', 'his', 'her', 'its', 'our', 'their',
  ]);

  const meaningful = words.filter(
    (w) => w.length > 3 && !stopWords.has(w) && !/^\d+$/.test(w)
  );

  // Get unique phrases
  return [...new Set(meaningful)].slice(0, 20);
}

/**
 * Select the best platform for content based on characteristics
 */
function selectBestPlatform(content: string, availablePlatforms: SocialPlatform[]): SocialPlatform {
  // Default to first available platform
  if (availablePlatforms.length === 0) {
    return SocialPlatform.BUILDERS;
  }

  const contentLength = content.length;

  // Short content -> Twitter
  if (contentLength <= 280 && availablePlatforms.includes(SocialPlatform.TWITTER)) {
    return SocialPlatform.TWITTER;
  }

  // Business/professional content -> LinkedIn
  const professionalKeywords = ['career', 'business', 'professional', 'industry', 'leadership', 'strategy'];
  if (
    professionalKeywords.some((kw) => content.toLowerCase().includes(kw)) &&
    availablePlatforms.includes(SocialPlatform.LINKEDIN)
  ) {
    return SocialPlatform.LINKEDIN;
  }

  // Founder/startup content -> Builders
  const founderKeywords = ['startup', 'founder', 'bootstrapping', 'indie', 'building', 'launched'];
  if (
    founderKeywords.some((kw) => content.toLowerCase().includes(kw)) &&
    availablePlatforms.includes(SocialPlatform.BUILDERS)
  ) {
    return SocialPlatform.BUILDERS;
  }

  // Default to first available
  return availablePlatforms[0];
}

/**
 * Calculate simple edit distance (Levenshtein) for feedback tracking
 */
function calculateEditDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;

  // Use shorter strings for performance
  if (m > 500 || n > 500) {
    return Math.abs(m - n); // Approximate for long strings
  }

  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[m][n];
}

/**
 * Get suggestion statistics for a user
 */
export async function getSuggestionStats(userId: string): Promise<{
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  published: number;
  approvalRate: number;
}> {
  const [total, pending, approved, rejected, published] = await Promise.all([
    prisma.agentSuggestion.count({ where: { userId } }),
    prisma.agentSuggestion.count({ where: { userId, status: SuggestionStatus.PENDING } }),
    prisma.agentSuggestion.count({ where: { userId, status: SuggestionStatus.APPROVED } }),
    prisma.agentSuggestion.count({ where: { userId, status: SuggestionStatus.REJECTED } }),
    prisma.agentSuggestion.count({ where: { userId, status: SuggestionStatus.PUBLISHED } }),
  ]);

  const reviewed = approved + rejected + published;
  const approvalRate = reviewed > 0 ? ((approved + published) / reviewed) * 100 : 0;

  return {
    total,
    pending,
    approved,
    rejected,
    published,
    approvalRate: Math.round(approvalRate * 10) / 10,
  };
}

/**
 * Get pending suggestion count for notifications
 */
export async function getPendingSuggestionCount(userId: string): Promise<number> {
  return prisma.agentSuggestion.count({
    where: { userId, status: SuggestionStatus.PENDING },
  });
}
