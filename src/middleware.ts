import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Cookie name for storing referral code
export const REFERRAL_CODE_COOKIE = "builders_ref";

// Main domain (without www)
const MAIN_DOMAIN = "builders.to";
const MAIN_DOMAINS = ["builders.to", "www.builders.to", "localhost"];

// Check if the hostname is a custom domain (not our main domain)
function isCustomDomain(hostname: string): boolean {
  // Remove port if present
  const host = hostname.split(":")[0];
  
  // Check if it's our main domain or localhost
  if (MAIN_DOMAINS.includes(host)) {
    return false;
  }
  
  // Check if it's a subdomain of our main domain
  if (host.endsWith(`.${MAIN_DOMAIN}`)) {
    return false;
  }
  
  return true;
}

export default auth(async (req) => {
  const hostname = req.headers.get("host") || "";
  
  // Handle custom domain routing
  // Custom domains should redirect to an API endpoint that looks up the user slug
  // and then rewrites to their profile page
  if (isCustomDomain(hostname)) {
    const pathname = req.nextUrl.pathname;
    
    // Only rewrite the root path for custom domains
    // This allows the user's profile to be shown at their custom domain root
    if (pathname === "/" || pathname === "") {
      // Rewrite to the custom domain lookup endpoint
      // This endpoint will look up the domain and redirect/rewrite appropriately
      const url = new URL(`/api/pro/domains/lookup`, req.url);
      url.searchParams.set("domain", hostname.split(":")[0]);
      
      // Fetch the user slug for this domain
      try {
        const response = await fetch(url.toString());
        if (response.ok) {
          const data = await response.json();
          if (data.slug) {
            // Rewrite to the user's profile page
            const rewriteUrl = new URL(`/${data.slug}`, req.url);
            return NextResponse.rewrite(rewriteUrl);
          }
        }
      } catch (error) {
        console.error("[Middleware] Custom domain lookup failed:", error);
      }
      
      // If lookup fails, redirect to main site
      return NextResponse.redirect(new URL("/", `https://${MAIN_DOMAIN}`));
    }
    
    // For other paths on custom domains, redirect to main site with the path
    return NextResponse.redirect(new URL(pathname, `https://${MAIN_DOMAIN}`));
  }

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
