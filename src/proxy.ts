/**
 * Clerk Middleware — Authentication & Organisation Guard
 *
 * This middleware runs on every non-static request and enforces:
 *   1. Public routes (sign-in, sign-up) are always accessible.
 *   2. All other routes require a signed-in user.
 *   3. Signed-in users without an active organisation are redirected
 *      to the /org-selection page (except when already on that page).
 */

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/** Routes that can be accessed without authentication. */
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

/** The organisation selection page — shown when no org is active. */
const isOrgSelectionRoute = createRouteMatcher(["/org-selection(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, orgId } = await auth();

  // Allow public routes (sign-in / sign-up) without any checks
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Protect non-public routes — redirect unauthenticated users to sign-in
  if (!userId) {
    await auth.protect();
  }

  // Allow the org-selection page itself so users can pick their org
  if (isOrgSelectionRoute(req)) {
    return NextResponse.next();
  }

  // If the user is signed in but has not selected an org, redirect them
  if (userId && !orgId) {
    const orgSelection = new URL("/org-selection", req.url);
    return NextResponse.redirect(orgSelection);
  }

  return NextResponse.next();
});

/**
 * Matcher config — tells Next.js which requests should invoke this middleware.
 * Excludes static assets / Next.js internals; always includes API & tRPC routes.
 */
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};