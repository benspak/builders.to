import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// POST /api/endorsements - Create a new endorsement
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { endorseeId, message, skill } = body;

    if (!endorseeId) {
      return NextResponse.json(
        { error: "Endorsee ID is required" },
        { status: 400 }
      );
    }

    // Can't endorse yourself
    if (endorseeId === session.user.id) {
      return NextResponse.json(
        { error: "You cannot endorse yourself" },
        { status: 400 }
      );
    }

    // Check if endorsee exists
    const endorsee = await prisma.user.findUnique({
      where: { id: endorseeId },
    });

    if (!endorsee) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if already endorsed
    const existingEndorsement = await prisma.endorsement.findUnique({
      where: {
        endorserId_endorseeId: {
          endorserId: session.user.id,
          endorseeId,
        },
      },
    });

    if (existingEndorsement) {
      return NextResponse.json(
        { error: "You have already endorsed this user" },
        { status: 400 }
      );
    }

    const endorsement = await prisma.endorsement.create({
      data: {
        endorserId: session.user.id,
        endorseeId,
        message: message?.trim() || null,
        skill: skill?.trim() || null,
      },
      include: {
        endorser: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            image: true,
            slug: true,
            headline: true,
          },
        },
      },
    });

    return NextResponse.json(endorsement, { status: 201 });
  } catch (error) {
    console.error("Error creating endorsement:", error);
    return NextResponse.json(
      { error: "Failed to create endorsement" },
      { status: 500 }
    );
  }
}

// GET /api/endorsements?userId=xxx - Get endorsements for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const endorsements = await prisma.endorsement.findMany({
      where: { endorseeId: userId },
      include: {
        endorser: {
          select: {
            id: true,
            name: true,
            firstName: true,
            lastName: true,
            image: true,
            slug: true,
            headline: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(endorsements);
  } catch (error) {
    console.error("Error fetching endorsements:", error);
    return NextResponse.json(
      { error: "Failed to fetch endorsements" },
      { status: 500 }
    );
  }
}
