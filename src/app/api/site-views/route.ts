import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Fetch view counts for month and year
export async function GET() {
  try {
    const now = new Date();

    // Start of current month
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Start of current year
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get counts in parallel
    const [monthlyViews, yearlyViews, totalViews] = await Promise.all([
      prisma.siteView.count({
        where: {
          createdAt: {
            gte: startOfMonth,
          },
        },
      }),
      prisma.siteView.count({
        where: {
          createdAt: {
            gte: startOfYear,
          },
        },
      }),
      prisma.siteView.count(),
    ]);

    return NextResponse.json({
      monthly: monthlyViews,
      yearly: yearlyViews,
      total: totalViews,
      month: now.toLocaleString('default', { month: 'long' }),
      year: now.getFullYear(),
    });
  } catch (error) {
    console.error("Error fetching site views:", error);
    return NextResponse.json(
      { error: "Failed to fetch site views" },
      { status: 500 }
    );
  }
}

// POST - Record a new page view
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, visitorId } = body;

    if (!path) {
      return NextResponse.json(
        { error: "Path is required" },
        { status: 400 }
      );
    }

    // Get user agent from headers
    const userAgent = request.headers.get("user-agent") || undefined;

    // Create the view record
    await prisma.siteView.create({
      data: {
        path,
        visitorId: visitorId || undefined,
        userAgent,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error recording site view:", error);
    return NextResponse.json(
      { error: "Failed to record view" },
      { status: 500 }
    );
  }
}
