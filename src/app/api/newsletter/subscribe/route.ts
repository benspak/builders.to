import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const SEGMENT_ID = "b28188cc-ef83-43e3-9e85-5dbaf2951e34";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error("RESEND_API_KEY is not configured");
      return NextResponse.json(
        { error: "Email service is not configured" },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);

    // Step 1: Create the contact (upserts if already exists) and add to segment
    const { data: createData, error: createError } = await resend.contacts.create({
      email,
      unsubscribed: false,
      segments: [{ id: SEGMENT_ID }],
    });

    if (createError) {
      // If contact already exists, try adding to the segment directly
      console.warn("Resend create contact warning:", createError);

      const { data: segmentData, error: segmentError } = await resend.contacts.segments.add({
        email,
        segmentId: SEGMENT_ID,
      });

      if (segmentError) {
        console.error("Resend add contact to segment error:", segmentError);
        return NextResponse.json(
          { error: "Failed to subscribe. Please try again." },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        id: segmentData?.id,
      });
    }

    return NextResponse.json({
      success: true,
      id: createData?.id,
    });
  } catch (error) {
    console.error("Newsletter subscribe error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred. Please try again." },
      { status: 500 }
    );
  }
}
