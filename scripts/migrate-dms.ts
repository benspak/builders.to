/**
 * DM Migration Script
 * Migrates existing Conversation/Message/ConversationParticipant records
 * to the new ChatChannel/ChatMessage/ChatChannelMember system.
 *
 * Usage: npx tsx scripts/migrate-dms.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function migrateDMs() {
  console.log("Starting DM migration...");

  const conversations = await prisma.conversation.findMany({
    include: {
      participants: { include: { user: { select: { id: true } } } },
      messages: { orderBy: { createdAt: "asc" } },
    },
  });

  console.log(`Found ${conversations.length} conversations to migrate`);

  let migrated = 0;
  let skipped = 0;

  for (const conv of conversations) {
    const participantIds = conv.participants.map((p) => p.userId).sort();

    // Check if a DM channel already exists for these participants
    const existingChannel = await prisma.chatChannel.findFirst({
      where: {
        type: "DM",
        AND: participantIds.map((uid) => ({
          members: { some: { userId: uid } },
        })),
      },
    });

    if (existingChannel) {
      skipped++;
      continue;
    }

    const slug = `dm-migrated-${conv.id}`;

    try {
      // Create the new ChatChannel
      const channel = await prisma.chatChannel.create({
        data: {
          name: `dm-${participantIds.join("-")}`,
          slug,
          type: "DM",
          createdById: participantIds[0],
          createdAt: conv.createdAt,
          updatedAt: conv.updatedAt,
          members: {
            create: conv.participants.map((p) => ({
              userId: p.userId,
              role: "MEMBER",
              notificationPreference: p.mutedUntil ? "NONE" : "ALL",
              joinedAt: p.createdAt,
            })),
          },
        },
      });

      // Migrate messages
      if (conv.messages.length > 0) {
        await prisma.chatMessage.createMany({
          data: conv.messages.map((msg) => ({
            content: msg.content,
            gifUrl: msg.gifUrl,
            imageUrl: msg.imageUrl,
            senderId: msg.senderId,
            channelId: channel.id,
            editedAt: msg.editedAt,
            createdAt: msg.createdAt,
          })),
        });
      }

      // Update lastReadAt to lastReadMessageId
      for (const participant of conv.participants) {
        if (participant.lastReadAt) {
          const lastReadMsg = await prisma.chatMessage.findFirst({
            where: {
              channelId: channel.id,
              createdAt: { lte: participant.lastReadAt },
            },
            orderBy: { createdAt: "desc" },
            select: { id: true },
          });
          if (lastReadMsg) {
            await prisma.chatChannelMember.update({
              where: {
                userId_channelId: {
                  userId: participant.userId,
                  channelId: channel.id,
                },
              },
              data: { lastReadMessageId: lastReadMsg.id },
            });
          }
        }
      }

      migrated++;
      if (migrated % 100 === 0) {
        console.log(`Migrated ${migrated} conversations...`);
      }
    } catch (error) {
      console.error(`Failed to migrate conversation ${conv.id}:`, error);
    }
  }

  console.log(`\nMigration complete:`);
  console.log(`  Migrated: ${migrated}`);
  console.log(`  Skipped (already exists): ${skipped}`);
  console.log(`  Total: ${conversations.length}`);
}

migrateDMs()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
