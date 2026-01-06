import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/company-roles/[id] - Get a single role
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const role = await prisma.companyRole.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            slug: true,
            name: true,
            logo: true,
            location: true,
            category: true,
            size: true,
          },
        },
      },
    });

    if (!role) {
      return NextResponse.json(
        { error: "Role not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(role);
  } catch (error) {
    console.error("Error fetching role:", error);
    return NextResponse.json(
      { error: "Failed to fetch role" },
      { status: 500 }
    );
  }
}

// PATCH /api/company-roles/[id] - Update a role
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

    // Get the role and verify ownership through company
    const existingRole = await prisma.companyRole.findUnique({
      where: { id },
      include: {
        company: {
          select: { id: true, userId: true },
        },
      },
    });

    if (!existingRole) {
      return NextResponse.json(
        { error: "Role not found" },
        { status: 404 }
      );
    }

    // Check if user is owner or admin
    const membership = await prisma.companyMember.findUnique({
      where: {
        companyId_userId: { companyId: existingRole.companyId, userId: session.user.id },
      },
      select: { role: true },
    });

    const canManageRoles =
      existingRole.company.userId === session.user.id ||
      membership?.role === "OWNER" ||
      membership?.role === "ADMIN";

    if (!canManageRoles) {
      return NextResponse.json(
        { error: "You don't have permission to edit this role" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      type,
      category,
      location,
      isRemote,
      timezone,
      compensationType,
      salaryMin,
      salaryMax,
      currency,
      equityMin,
      equityMax,
      skills,
      experienceMin,
      experienceMax,
      isActive,
      applicationUrl,
      applicationEmail,
      expiresAt,
    } = body;

    if (title !== undefined && title.trim().length === 0) {
      return NextResponse.json(
        { error: "Role title cannot be empty" },
        { status: 400 }
      );
    }

    if (title !== undefined && title.length > 100) {
      return NextResponse.json(
        { error: "Role title must be 100 characters or less" },
        { status: 400 }
      );
    }

    // Validate salary range if both provided
    const finalSalaryMin = salaryMin !== undefined ? salaryMin : existingRole.salaryMin;
    const finalSalaryMax = salaryMax !== undefined ? salaryMax : existingRole.salaryMax;
    if (finalSalaryMin !== null && finalSalaryMax !== null && finalSalaryMin > finalSalaryMax) {
      return NextResponse.json(
        { error: "Minimum salary cannot be greater than maximum salary" },
        { status: 400 }
      );
    }

    // Validate equity range if both provided
    const finalEquityMin = equityMin !== undefined ? equityMin : existingRole.equityMin;
    const finalEquityMax = equityMax !== undefined ? equityMax : existingRole.equityMax;
    if (finalEquityMin !== null && finalEquityMax !== null && finalEquityMin > finalEquityMax) {
      return NextResponse.json(
        { error: "Minimum equity cannot be greater than maximum equity" },
        { status: 400 }
      );
    }

    const role = await prisma.companyRole.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description: description?.trim() || null }),
        ...(type !== undefined && { type }),
        ...(category !== undefined && { category }),
        ...(location !== undefined && { location: location?.trim() || null }),
        ...(isRemote !== undefined && { isRemote }),
        ...(timezone !== undefined && { timezone: timezone?.trim() || null }),
        ...(compensationType !== undefined && { compensationType: compensationType || null }),
        ...(salaryMin !== undefined && { salaryMin: salaryMin !== null ? parseInt(salaryMin) : null }),
        ...(salaryMax !== undefined && { salaryMax: salaryMax !== null ? parseInt(salaryMax) : null }),
        ...(currency !== undefined && { currency: currency || "USD" }),
        ...(equityMin !== undefined && { equityMin: equityMin !== null ? parseFloat(equityMin) : null }),
        ...(equityMax !== undefined && { equityMax: equityMax !== null ? parseFloat(equityMax) : null }),
        ...(skills !== undefined && { skills }),
        ...(experienceMin !== undefined && { experienceMin: experienceMin !== null ? parseInt(experienceMin) : null }),
        ...(experienceMax !== undefined && { experienceMax: experienceMax !== null ? parseInt(experienceMax) : null }),
        ...(isActive !== undefined && { isActive }),
        ...(applicationUrl !== undefined && { applicationUrl: applicationUrl?.trim() || null }),
        ...(applicationEmail !== undefined && { applicationEmail: applicationEmail?.trim() || null }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
      },
    });

    return NextResponse.json(role);
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 }
    );
  }
}

// DELETE /api/company-roles/[id] - Delete a role
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

    // Get the role and verify ownership through company
    const existingRole = await prisma.companyRole.findUnique({
      where: { id },
      include: {
        company: {
          select: { id: true, userId: true },
        },
      },
    });

    if (!existingRole) {
      return NextResponse.json(
        { error: "Role not found" },
        { status: 404 }
      );
    }

    // Check if user is owner or admin
    const membership = await prisma.companyMember.findUnique({
      where: {
        companyId_userId: { companyId: existingRole.companyId, userId: session.user.id },
      },
      select: { role: true },
    });

    const canManageRoles =
      existingRole.company.userId === session.user.id ||
      membership?.role === "OWNER" ||
      membership?.role === "ADMIN";

    if (!canManageRoles) {
      return NextResponse.json(
        { error: "You don't have permission to delete this role" },
        { status: 403 }
      );
    }

    await prisma.companyRole.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json(
      { error: "Failed to delete role" },
      { status: 500 }
    );
  }
}
