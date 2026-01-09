import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug, generateUniqueSlug, validateImageUrl, generateLocationSlug } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Helper function to check if user has edit permission (owner, admin, or original creator)
async function canEditCompany(companyId: string, userId: string): Promise<boolean> {
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

// Helper function to check if user is the original owner (for delete operations)
async function isCompanyOwner(companyId: string, userId: string): Promise<boolean> {
  const company = await prisma.company.findUnique({
    where: { id: companyId },
    select: { userId: true },
  });

  return company?.userId === userId;
}

// GET /api/companies/[id] - Get a single company
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const company = await prisma.company.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        projects: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
            _count: {
              select: {
                upvotes: true,
                comments: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                slug: true,
                headline: true,
              },
            },
          },
          orderBy: [
            { role: "asc" },
            { createdAt: "asc" },
          ],
        },
        _count: {
          select: {
            projects: true,
            members: true,
          },
        },
      },
    });

    if (!company) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error("Error fetching company:", error);
    return NextResponse.json(
      { error: "Failed to fetch company" },
      { status: 500 }
    );
  }
}

// PATCH /api/companies/[id] - Update a company
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

    // Get existing company
    const existingCompany = await prisma.company.findUnique({
      where: { id },
      select: { userId: true, slug: true },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    // Check if user has edit permission (owner, admin, or original creator)
    const hasPermission = await canEditCompany(id, session.user.id);
    if (!hasPermission) {
      return NextResponse.json(
        { error: "You don't have permission to edit this company" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      name,
      logo,
      location,
      category,
      about,
      website,
      size,
      yearFounded,
      slug,
      // New opportunity hub fields
      techStack,
      tools,
      customerCount,
      revenueRange,
      userCount,
      isBootstrapped,
      isProfitable,
      hasRaisedFunding,
      fundingStage,
      isHiring,
      acceptsContracts,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    // Validate logo URL
    const logoError = validateImageUrl(logo);
    if (logoError) {
      return NextResponse.json(
        { error: logoError },
        { status: 400 }
      );
    }

    // Handle slug update
    let finalSlug = existingCompany.slug;
    if (slug !== undefined) {
      const newSlug = generateSlug(slug || name);

      // Only check for conflicts if slug is actually changing
      if (newSlug !== existingCompany.slug) {
        const slugConflict = await prisma.company.findFirst({
          where: {
            slug: newSlug,
            id: { not: id },
          },
        });

        if (slugConflict) {
          return NextResponse.json(
            { error: "This URL slug is already taken. Please choose a different one." },
            { status: 400 }
          );
        }
        finalSlug = newSlug;
      }
    } else if (!existingCompany.slug) {
      // Generate slug if company doesn't have one yet (migration case)
      finalSlug = generateSlug(name);
      const slugConflict = await prisma.company.findFirst({
        where: { slug: finalSlug },
      });
      if (slugConflict) {
        finalSlug = generateUniqueSlug(name);
      }
    }

    // Generate location slug for Builders Local
    const locationSlug = generateLocationSlug(location);

    const company = await prisma.company.update({
      where: { id },
      data: {
        name,
        slug: finalSlug,
        logo,
        location,
        locationSlug,
        category,
        about,
        website,
        size,
        yearFounded: yearFounded ? parseInt(yearFounded) : null,
        // New opportunity hub fields
        ...(techStack !== undefined && { techStack }),
        ...(tools !== undefined && { tools }),
        ...(customerCount !== undefined && { customerCount: customerCount || null }),
        ...(revenueRange !== undefined && { revenueRange: revenueRange || null }),
        ...(userCount !== undefined && { userCount: userCount || null }),
        ...(isBootstrapped !== undefined && { isBootstrapped }),
        ...(isProfitable !== undefined && { isProfitable }),
        ...(hasRaisedFunding !== undefined && { hasRaisedFunding }),
        ...(fundingStage !== undefined && { fundingStage: hasRaisedFunding ? (fundingStage || null) : null }),
        ...(isHiring !== undefined && { isHiring }),
        ...(acceptsContracts !== undefined && { acceptsContracts }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            projects: true,
          },
        },
      },
    });

    return NextResponse.json(company);
  } catch (error) {
    console.error("Error updating company:", error);
    return NextResponse.json(
      { error: "Failed to update company" },
      { status: 500 }
    );
  }
}

// DELETE /api/companies/[id] - Delete a company
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

    // Check ownership
    const existingCompany = await prisma.company.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!existingCompany) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      );
    }

    if (existingCompany.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You don't have permission to delete this company" },
        { status: 403 }
      );
    }

    await prisma.company.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting company:", error);
    return NextResponse.json(
      { error: "Failed to delete company" },
      { status: 500 }
    );
  }
}
