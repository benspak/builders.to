import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

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

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
