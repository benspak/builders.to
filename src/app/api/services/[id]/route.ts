import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/services/[id]
 * Get a single service listing
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const service = await prisma.serviceListing.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            displayName: true,
            firstName: true,
            lastName: true,
            image: true,
            slug: true,
            headline: true,
            bio: true,
            stripeConnectOnboarded: true,
            _count: {
              select: {
                projects: { where: { status: "LAUNCHED" } },
                endorsementsReceived: true,
              },
            },
            projects: {
              where: { status: "LAUNCHED" },
              select: {
                id: true,
                title: true,
                _count: { select: { upvotes: true } },
              },
            },
          },
        },
        portfolioProjects: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                tagline: true,
                slug: true,
                imageUrl: true,
                status: true,
                url: true,
                _count: {
                  select: { upvotes: true, comments: true },
                },
              },
            },
          },
        },
        _count: {
          select: { orders: true },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Check if the user is the owner
    const session = await auth();
    const isOwner = session?.user?.id === service.userId;

    // Only owners can see non-active listings
    if (!isOwner && service.status !== "ACTIVE") {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    // Check if listing has expired
    if (!isOwner && service.expiresAt && new Date(service.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Service listing has expired" }, { status: 404 });
    }

    return NextResponse.json({ ...service, isOwner });
  } catch (error) {
    console.error("Error fetching service:", error);
    return NextResponse.json(
      { error: "Failed to fetch service" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/services/[id]
 * Update a service listing
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    const service = await prisma.serviceListing.findUnique({
      where: { id },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    if (service.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only edit your own services" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      category,
      priceInCents,
      deliveryDays,
      portfolioProjectIds,
      status,
    } = body;

    // Validate price if provided
    if (priceInCents !== undefined && priceInCents < 1000) {
      return NextResponse.json(
        { error: "Minimum price is $10" },
        { status: 400 }
      );
    }

    // Validate delivery days if provided
    if (deliveryDays !== undefined && (deliveryDays < 1 || deliveryDays > 365)) {
      return NextResponse.json(
        { error: "Delivery days must be between 1 and 365" },
        { status: 400 }
      );
    }

    // Only allow certain status transitions
    if (status) {
      const allowedTransitions: Record<string, string[]> = {
        DRAFT: ["PENDING_PAYMENT"],
        PENDING_PAYMENT: ["DRAFT"],
        ACTIVE: ["PAUSED"],
        PAUSED: ["ACTIVE"],
        EXPIRED: [],
      };

      if (!allowedTransitions[service.status]?.includes(status)) {
        return NextResponse.json(
          { error: `Cannot transition from ${service.status} to ${status}` },
          { status: 400 }
        );
      }
    }

    // Update portfolio projects if provided
    if (portfolioProjectIds !== undefined) {
      // Delete existing and create new
      await prisma.servicePortfolio.deleteMany({
        where: { serviceId: id },
      });

      if (portfolioProjectIds.length > 0) {
        await prisma.servicePortfolio.createMany({
          data: portfolioProjectIds.map((projectId: string) => ({
            serviceId: id,
            projectId,
          })),
        });
      }
    }

    // Update the service
    const updatedService = await prisma.serviceListing.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(category && { category }),
        ...(priceInCents && { priceInCents }),
        ...(deliveryDays && { deliveryDays }),
        ...(status && { status }),
      },
      include: {
        portfolioProjects: {
          include: {
            project: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        },
      },
    });

    return NextResponse.json(updatedService);
  } catch (error) {
    console.error("Error updating service:", error);
    return NextResponse.json(
      { error: "Failed to update service" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/services/[id]
 * Delete a service listing
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const session = await auth();
    const { id } = await params;

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in" },
        { status: 401 }
      );
    }

    const service = await prisma.serviceListing.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            orders: {
              where: {
                status: {
                  in: ["PENDING_ACCEPTANCE", "ACCEPTED", "IN_PROGRESS"],
                },
              },
            },
          },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    if (service.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only delete your own services" },
        { status: 403 }
      );
    }

    // Don't allow deletion if there are active orders
    if (service._count.orders > 0) {
      return NextResponse.json(
        { error: "Cannot delete service with active orders" },
        { status: 400 }
      );
    }

    await prisma.serviceListing.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting service:", error);
    return NextResponse.json(
      { error: "Failed to delete service" },
      { status: 500 }
    );
  }
}
