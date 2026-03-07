/**
 * tRPC Initialisation & Procedure Definitions
 *
 * Sets up the core tRPC infrastructure:
 *   - `createTRPCContext`: empty context factory (cached per request).
 *   - `baseProcedure`: unprotected procedure for public endpoints.
 *   - `authProcedure`: requires a signed-in Clerk user.
 *   - `orgProcedure`: requires both a signed-in user AND an active org.
 */

import * as Sentry from "@sentry/node";
import { initTRPC } from '@trpc/server';
import { TRPCError } from '@trpc/server';
import { cache } from 'react';
import { auth } from '@clerk/nextjs/server';
import superjson from "superjson";

/** Cached context factory — returns an empty context for each request. */
export const createTRPCContext = cache(async () => {
  return {};
});

// Initialise tRPC with superjson for rich serialisation (Dates, Maps, etc.)
// Note: avoid exporting the full `t` object — its name clashes with i18n libs.
const t = initTRPC.create({
  /**
   * @see https://trpc.io/docs/server/data-transformers
   */
  transformer: superjson,
});

const sentryMiddleware = t.middleware(
  Sentry.trpcMiddleware({
    attachRpcInput: true,
  }),
);

// ── Exported helpers ───────────────────────────────────
export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure.use(sentryMiddleware);

/**
 * Auth-protected procedure.
 * Injects `ctx.userId` after verifying the Clerk session.
 */
export const authProcedure = baseProcedure.use(async ({ next }) => {
  const { userId } = await auth();

  if (!userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  
  return next({
    ctx: {
      userId,
    },
  });
});

/**
 * Organisation-scoped procedure.
 * Extends authProcedure — also requires an active Clerk organisation.
 * Injects both `ctx.userId` and `ctx.orgId`.
 */
export const orgProcedure = baseProcedure.use(async ({ next, ctx }) => {
  const { orgId } = await auth();

  if (!orgId) {
    throw new TRPCError({ 
      code: 'FORBIDDEN',
      message: "Organisation required!",
    });
  }

  return next({
    ctx: {
      ...ctx,
      orgId,
    },
  });
});