import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Cookie name for storing referral code
export const REFERRAL_CODE_COOKIE = "builders_ref";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  // Only protect project creation and editing routes
  // Dashboard is now public for viewing
  const isProtectedRoute =
    req.nextUrl.pathname.startsWith("/projects/new") ||
    req.nextUrl.pathname.match(/^\/projects\/[^/]+\/edit$/);

  if (isProtectedRoute && !isLoggedIn) {
    const signInUrl = new URL("/signin", req.nextUrl.origin);
    signInUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Capture referral code from URL and store in cookie
  const refCode = req.nextUrl.searchParams.get("ref");
  if (refCode && !isLoggedIn) {
    const response = NextResponse.next();
    // Store referral code in cookie (expires in 30 days)
    response.cookies.set(REFERRAL_CODE_COOKIE, refCode.toUpperCase(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
    return response;
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
