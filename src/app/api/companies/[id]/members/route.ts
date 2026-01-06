import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CompanyMemberRole } from "@prisma/client";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Helper function to check if user has permission to manage members
async function canManageMembers(companyId: string, userId: string): Promise<boolean> {
  // Check if user is the original company owner
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { userId: true },
  });

  if (company?.userId === userId) return true;

  // Check if user is OWNER or ADMIN in CompanyMember
  const membership = await prisma.companyMember.findUnique({
    where: {
      companyId_userId: { companyId, userId },
    },
    select: { role: true },
  });

  return membership?.role === "OWNER" || membership?.role === "ADMIN";
}

// GET /api/companies/[id]/members - List all members of a company
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const company = await prisma.company.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    const members = await prisma.companyMember.findMany({
      where: { companyId: id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            slug: true,
            headline: true,
          },
        },
      },
      orderBy: [
        { role: "asc" }, // OWNER first, then ADMIN, then MEMBER
        { createdAt: "asc" },
      ],
    });

    return NextResponse.json({ members });
  } catch (error) {
    console.error("Error fetching company members:", error);
    return NextResponse.json(
      { error: "Failed to fetch company members" },
      { status: 500 }
    );
  }
}

// POST /api/companies/[id]/members - Add a new member to the company
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check permission
    const hasPermission = await canManageMembers(id, session.user.id);
    if (!hasPermission) {
      return NextResponse.json(
        { error: "You don't have permission to manage members" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, role = "MEMBER" } = body;

    if (!email) {
      return NextResponse.json(
        { error: "User email is required" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["OWNER", "ADMIN", "MEMBER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be OWNER, ADMIN, or MEMBER" },
        { status: 400 }
      );
    }

    // Find user by email
    const userToAdd = await prisma.user.findUnique({
      where: { email },
      select: { id: true, name: true, email: true, image: true, slug: true },
    });

    if (!userToAdd) {
      return NextResponse.json(
        { error: "User not found. They must have an account on Builders.to first." },
        { status: 404 }
      );
    }

    // Check if user is already a member
    const existingMembership = await prisma.companyMember.findUnique({
      where: {
        companyId_userId: { companyId: id, userId: userToAdd.id },
      },
    });

    if (existingMembership) {
      return NextResponse.json(
        { error: "User is already a member of this company" },
        { status: 400 }
      );
    }

    // Create the membership
    const member = await prisma.companyMember.create({
      data: {
        companyId: id,
        userId: userToAdd.id,
        role: role as CompanyMemberRole,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            slug: true,
            headline: true,
          },
        },
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("Error adding company member:", error);
    return NextResponse.json(
      { error: "Failed to add company member" },
      { status: 500 }
    );
  }
}

// PATCH /api/companies/[id]/members - Update a member's role
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Check permission
    const hasPermission = await canManageMembers(id, session.user.id);
    if (!hasPermission) {
      return NextResponse.json(
        { error: "You don't have permission to manage members" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { memberId, role } = body;

    if (!memberId || !role) {
      return NextResponse.json(
        { error: "Member ID and role are required" },
        { status: 400 }
      );
    }

    // Validate role
    if (!["OWNER", "ADMIN", "MEMBER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be OWNER, ADMIN, or MEMBER" },
        { status: 400 }
      );
    }

    // Get the membership to update
    const membership = await prisma.companyMember.findUnique({
      where: { id: memberId },
      select: { companyId: true, userId: true, role: true },
    });

    if (!membership || membership.companyId !== id) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    // Prevent changing the original company owner's role
    const company = await prisma.company.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (company?.userId === membership.userId && role !== "OWNER") {
      return NextResponse.json(
        { error: "Cannot change the role of the original company creator" },
        { status: 400 }
      );
    }

    // Update the membership
    const updated = await prisma.companyMember.update({
      where: { id: memberId },
      data: { role: role as CompanyMemberRole },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            slug: true,
            headline: true,
          },
        },
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Error updating company member:", error);
    return NextResponse.json(
      { error: "Failed to update company member" },
      { status: 500 }
    );
  }
}

// DELETE /api/companies/[id]/members - Remove a member from the company
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");

    if (!memberId) {
      return NextResponse.json(
        { error: "Member ID is required" },
        { status: 400 }
      );
    }

    // Get the membership to delete
    const membership = await prisma.companyMember.findUnique({
      where: { id: memberId },
      select: { companyId: true, userId: true, role: true },
    });

    if (!membership || membership.companyId !== id) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    // Check permission - user can remove themselves or admins/owners can remove others
    const isSelf = membership.userId === session.user.id;
    const hasPermission = isSelf || await canManageMembers(id, session.user.id);

    if (!hasPermission) {
      return NextResponse.json(
        { error: "You don't have permission to remove this member" },
        { status: 403 }
      );
    }

    // Prevent removing the original company owner
    const company = await prisma.company.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (company?.userId === membership.userId) {
      return NextResponse.json(
        { error: "Cannot remove the original company creator" },
        { status: 400 }
      );
    }

    // Delete the membership
    await prisma.companyMember.delete({
      where: { id: memberId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error removing company member:", error);
    return NextResponse.json(
      { error: "Failed to remove company member" },
      { status: 500 }
    );
  }
}
