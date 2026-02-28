import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateApiKey } from "@/lib/api-key-auth";

// GET /api/settings/api-keys - List API keys (prefix and metadata only)
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const keys = await prisma.userApiKey.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        createdAt: true,
        lastUsedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ keys });
  } catch (error) {
    console.error("Error listing API keys:", error);
    return NextResponse.json(
      { error: "Failed to list API keys" },
      { status: 500 }
    );
  }
}

// POST /api/settings/api-keys - Create a new API key
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "API Key";
    if (!name || name.length > 100) {
      return NextResponse.json(
        { error: "Name must be 1–100 characters" },
        { status: 400 }
      );
    }

    const { key, keyHash, keyPrefix } = generateApiKey();

    await prisma.userApiKey.create({
      data: {
        name,
        keyHash,
        keyPrefix,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      key,
      keyPrefix,
      message: "Copy your API key now. It won’t be shown again.",
    });
  } catch (error) {
    console.error("Error creating API key:", error);
    return NextResponse.json(
      { error: "Failed to create API key" },
      { status: 500 }
    );
  }
}
