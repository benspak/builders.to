import { SocialPlatform, CrossPost, CrossPostStatus, CrossPlatformPost } from '@prisma/client';
import prisma from '@/lib/prisma';
import { getUserConnections } from './platforms.service';
import { postTweet } from './twitter.service';
import { postToLinkedIn } from './linkedin.service';
import { createPostReward } from './rewards.service';

export interface CreatePostInput {
  content: string;
  platforms: SocialPlatform[];
  scheduledAt?: Date;
  mediaUrls?: string[];
}

export interface PostWithPlatformPosts extends CrossPost {
  platformPosts: CrossPlatformPost[];
}

/**
 * Create a new post (draft or scheduled)
 */
export async function createPost(
  userId: string,
  input: CreatePostInput
): Promise<PostWithPlatformPosts> {
  const { content, platforms, scheduledAt, mediaUrls } = input;

  // Validate platforms are connected (except BUILDERS which is always available)
  const connections = await getUserConnections(userId);
  const connectedPlatforms = connections.map((c) => c.platform);

  const externalPlatforms = platforms.filter((p) => p !== SocialPlatform.BUILDERS);
  const invalidPlatforms = externalPlatforms.filter((p) => !connectedPlatforms.includes(p));

  if (invalidPlatforms.length > 0) {
    throw new Error(`Platforms not connected: ${invalidPlatforms.join(', ')}`);
  }

  // Determine status
  const status = scheduledAt ? CrossPostStatus.SCHEDULED : CrossPostStatus.DRAFT;

  // Create post with platform posts
  const post = await prisma.crossPost.create({
    data: {
      userId,
      content,
      platforms,
      status,
      scheduledAt,
      media: mediaUrls?.length
        ? {
            create: mediaUrls.map((url, index) => ({
              type: 'IMAGE',
              url,
              order: index,
            })),
          }
        : undefined,
      platformPosts: {
        create: platforms.map((platform) => ({
          platform,
          status: CrossPostStatus.DRAFT,
        })),
      },
    },
    include: {
      platformPosts: true,
      media: true,
    },
  });

  return post;
}

/**
 * Update an existing post
 */
export async function updatePost(
  userId: string,
  postId: string,
  updates: Partial<CreatePostInput>
): Promise<PostWithPlatformPosts> {
  // Verify ownership
  const existingPost = await prisma.crossPost.findFirst({
    where: { id: postId, userId },
  });

  if (!existingPost) {
    throw new Error('Post not found');
  }

  if (existingPost.status === CrossPostStatus.PUBLISHED) {
    throw new Error('Cannot edit published post');
  }

  // Update post
  const post = await prisma.crossPost.update({
    where: { id: postId },
    data: {
      content: updates.content,
      platforms: updates.platforms,
      scheduledAt: updates.scheduledAt,
    },
    include: {
      platformPosts: true,
      media: true,
    },
  });

  // Update platform posts if platforms changed
  if (updates.platforms) {
    // Delete removed platforms
    await prisma.crossPlatformPost.deleteMany({
      where: {
        crossPostId: postId,
        platform: { notIn: updates.platforms },
      },
    });

    // Add new platforms
    const existingPlatforms = post.platformPosts.map((pp) => pp.platform);
    const newPlatforms = updates.platforms.filter((p) => !existingPlatforms.includes(p));

    if (newPlatforms.length > 0) {
      await prisma.crossPlatformPost.createMany({
        data: newPlatforms.map((platform) => ({
          crossPostId: postId,
          platform,
          status: CrossPostStatus.DRAFT,
        })),
      });
    }
  }

  return prisma.crossPost.findUnique({
    where: { id: postId },
    include: { platformPosts: true, media: true },
  }) as Promise<PostWithPlatformPosts>;
}

/**
 * Delete a post
 */
export async function deletePost(userId: string, postId: string): Promise<boolean> {
  const post = await prisma.crossPost.findFirst({
    where: { id: postId, userId },
  });

  if (!post) {
    return false;
  }

  await prisma.crossPost.delete({
    where: { id: postId },
  });

  return true;
}

/**
 * Get user's posts
 */
export async function getUserPosts(
  userId: string,
  options: {
    status?: CrossPostStatus;
    platform?: SocialPlatform;
    limit?: number;
    offset?: number;
  } = {}
): Promise<PostWithPlatformPosts[]> {
  const { status, platform, limit = 25, offset = 0 } = options;

  return prisma.crossPost.findMany({
    where: {
      userId,
      ...(status && { status }),
      ...(platform && { platforms: { has: platform } }),
    },
    include: {
      platformPosts: true,
      media: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
}

/**
 * Get a single post
 */
export async function getPost(
  userId: string,
  postId: string
): Promise<PostWithPlatformPosts | null> {
  return prisma.crossPost.findFirst({
    where: { id: postId, userId },
    include: {
      platformPosts: true,
      media: true,
    },
  });
}

/**
 * Schedule a post for later
 */
export async function schedulePost(
  userId: string,
  postId: string,
  scheduledAt: Date
): Promise<PostWithPlatformPosts> {
  const post = await prisma.crossPost.findFirst({
    where: { id: postId, userId },
  });

  if (!post) {
    throw new Error('Post not found');
  }

  if (post.status === CrossPostStatus.PUBLISHED) {
    throw new Error('Cannot schedule published post');
  }

  if (scheduledAt < new Date()) {
    throw new Error('Scheduled time must be in the future');
  }

  return prisma.crossPost.update({
    where: { id: postId },
    data: {
      status: CrossPostStatus.SCHEDULED,
      scheduledAt,
    },
    include: {
      platformPosts: true,
      media: true,
    },
  });
}

/**
 * Publish a post immediately to all platforms
 */
export async function publishPost(
  userId: string,
  postId: string
): Promise<PostWithPlatformPosts> {
  const post = await prisma.crossPost.findFirst({
    where: { id: postId, userId },
    include: { platformPosts: true, media: true },
  });

  if (!post) {
    throw new Error('Post not found');
  }

  if (post.status === CrossPostStatus.PUBLISHED) {
    throw new Error('Post already published');
  }

  // Update status to publishing
  await prisma.crossPost.update({
    where: { id: postId },
    data: { status: CrossPostStatus.PUBLISHING },
  });

  // Publish to each platform
  const results = await Promise.allSettled(
    post.platforms.map((platform) =>
      publishToPlatform(userId, post, platform)
    )
  );

  // Update platform post statuses
  for (let i = 0; i < post.platforms.length; i++) {
    const platform = post.platforms[i];
    const result = results[i];

    const platformPost = post.platformPosts.find((pp) => pp.platform === platform);
    if (!platformPost) continue;

    if (result.status === 'fulfilled' && result.value) {
      await prisma.crossPlatformPost.update({
        where: { id: platformPost.id },
        data: {
          status: CrossPostStatus.PUBLISHED,
          platformPostId: result.value.id,
          url: result.value.url,
        },
      });
    } else {
      await prisma.crossPlatformPost.update({
        where: { id: platformPost.id },
        data: {
          status: CrossPostStatus.FAILED,
          error: result.status === 'rejected' ? result.reason?.message : 'Unknown error',
        },
      });
    }
  }

  // Check if any platform succeeded
  const anySuccess = results.some(
    (r) => r.status === 'fulfilled' && r.value !== null
  );

  const allFailed = results.every(
    (r) => r.status === 'rejected' || (r.status === 'fulfilled' && r.value === null)
  );

  // Collect per-platform errors for caller visibility
  const platformErrors: Record<string, string> = {};
  for (let i = 0; i < post.platforms.length; i++) {
    const platform = post.platforms[i];
    const result = results[i];
    if (result.status === 'rejected') {
      platformErrors[platform] = result.reason?.message || 'Unknown error';
    } else if (result.status === 'fulfilled' && result.value === null) {
      platformErrors[platform] = 'Platform returned no result';
    }
  }

  // Update post status
  const finalStatus = allFailed ? CrossPostStatus.FAILED : CrossPostStatus.PUBLISHED;
  await prisma.crossPost.update({
    where: { id: postId },
    data: {
      status: finalStatus,
      publishedAt: anySuccess ? new Date() : undefined,
    },
  });

  const updatedPost = await prisma.crossPost.findUnique({
    where: { id: postId },
    include: { platformPosts: true, media: true },
  }) as PostWithPlatformPosts;

  // If all platforms failed, throw an error so the API can return a proper error response
  if (allFailed) {
    const errorMessages = Object.entries(platformErrors)
      .map(([platform, error]) => `${platform}: ${error}`)
      .join('; ');
    const error = new Error(`Cross-posting failed: ${errorMessages}`);
    // Attach the post and platform errors for the API to include in the response
    (error as Error & { post: PostWithPlatformPosts; platformErrors: Record<string, string> }).post = updatedPost;
    (error as Error & { post: PostWithPlatformPosts; platformErrors: Record<string, string> }).platformErrors = platformErrors;
    throw error;
  }

  // If some platforms failed but others succeeded, attach warnings to the returned post
  if (Object.keys(platformErrors).length > 0) {
    (updatedPost as PostWithPlatformPosts & { platformErrors?: Record<string, string> }).platformErrors = platformErrors;
  }

  return updatedPost;
}

/**
 * Publish to a specific platform
 */
async function publishToPlatform(
  userId: string,
  post: CrossPost & { media?: { url: string }[] },
  platform: SocialPlatform
): Promise<{ id: string; url?: string } | null> {
  // Get media URLs if any
  const mediaUrls = post.media?.map((m) => m.url) || [];

  try {
    switch (platform) {
      case SocialPlatform.TWITTER: {
        const result = await postTweet(userId, post.content, {
          mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
        });
        if (result) {
          return {
            id: result.id,
            url: `https://twitter.com/i/status/${result.id}`,
          };
        }
        return null;
      }

      case SocialPlatform.LINKEDIN: {
        const result = await postToLinkedIn(userId, post.content, {
          mediaUrls: mediaUrls.length > 0 ? mediaUrls : undefined,
        });
        if (result) {
          return {
            id: result.id,
            url: `https://www.linkedin.com/feed/update/${result.id}`,
          };
        }
        return null;
      }

      case SocialPlatform.BUILDERS: {
        // Create a DailyUpdate on Builders.to
        const update = await prisma.dailyUpdate.create({
          data: {
            userId,
            content: post.content,
          },
        });

        // Update user streak
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { lastActivityDate: true, currentStreak: true, longestStreak: true },
        });

        if (user) {
          const lastActivity = user.lastActivityDate ? new Date(user.lastActivityDate) : null;
          lastActivity?.setHours(0, 0, 0, 0);

          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);

          let newStreak = 1;
          if (lastActivity) {
            if (lastActivity.getTime() === yesterday.getTime()) {
              newStreak = user.currentStreak + 1;
            } else if (lastActivity.getTime() === today.getTime()) {
              newStreak = user.currentStreak;
            }
          }

          await prisma.user.update({
            where: { id: userId },
            data: {
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, user.longestStreak),
              lastActivityDate: today,
            },
          });
        }

        // Try to create a post reward for eligible pro users
        // This runs async and doesn't block the post creation
        createPostReward(userId, update.id, post.content).catch((error) => {
          console.error('[Rewards] Error creating post reward:', error);
        });

        return {
          id: update.id,
          url: `/feed#update-${update.id}`,
        };
      }

      default:
        throw new Error(`Platform ${platform} not supported`);
    }
  } catch (error) {
    console.error(`Publish to ${platform} error:`, error);
    throw error;
  }
}

/**
 * Get scheduled posts that are due
 */
export async function getDueScheduledPosts(): Promise<PostWithPlatformPosts[]> {
  return prisma.crossPost.findMany({
    where: {
      status: CrossPostStatus.SCHEDULED,
      scheduledAt: { lte: new Date() },
    },
    include: {
      platformPosts: true,
      media: true,
    },
  });
}

/**
 * Process scheduled posts (called by background worker/cron)
 */
export async function processScheduledPosts(): Promise<void> {
  const duePosts = await getDueScheduledPosts();

  for (const post of duePosts) {
    try {
      await publishPost(post.userId, post.id);
      console.log(`Published scheduled post ${post.id}`);
    } catch (error) {
      console.error(`Failed to publish scheduled post ${post.id}:`, error);
    }
  }
}
