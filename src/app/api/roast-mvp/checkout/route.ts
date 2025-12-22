import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, ROAST_MVP_PRICE_CENTS } from "@/lib/stripe";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be signed in to submit your MVP for roasting" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { projectId } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }

    // Verify the project exists and belongs to the user
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { roastMVP: true },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    if (project.userId !== session.user.id) {
      return NextResponse.json(
        { error: "You can only submit your own projects" },
        { status: 403 }
      );
    }

    // Check if project is already in the roast queue
    if (project.roastMVP) {
      const status = project.roastMVP.status;
      if (status === "PAID" || status === "FEATURED") {
        return NextResponse.json(
          { error: "This project is already in the Roast my MVP queue" },
          { status: 400 }
        );
      }
      // If it's pending payment, we'll create a new checkout session
      // Delete the old pending entry
      if (status === "PENDING_PAYMENT") {
        await prisma.roastMVP.delete({
          where: { id: project.roastMVP.id },
        });
      }
    }

    // Create Stripe Checkout Session
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const stripe = getStripe();

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: "Roast my MVP - Featured Spot",
              description: `Feature "${project.title}" for 1 week in the Roast my MVP section`,
            },
            unit_amount: ROAST_MVP_PRICE_CENTS,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${baseUrl}/projects/${project.slug || project.id}?roast=success`,
      cancel_url: `${baseUrl}/projects/${project.slug || project.id}?roast=cancelled`,
      metadata: {
        projectId: project.id,
        userId: session.user.id,
        type: "roast_mvp",
      },
      customer_email: session.user.email || undefined,
    });

    // Create RoastMVP entry with pending status
    await prisma.roastMVP.create({
      data: {
        projectId: project.id,
        userId: session.user.id,
        stripeSessionId: checkoutSession.id,
        status: "PENDING_PAYMENT",
      },
    });

    return NextResponse.json({
      url: checkoutSession.url,
      sessionId: checkoutSession.id,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
