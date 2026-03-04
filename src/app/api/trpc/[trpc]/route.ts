/**
 * tRPC HTTP Handler
 *
 * Exposes the tRPC appRouter as Next.js API routes under /api/trpc/*.
 * Both GET (queries) and POST (mutations/batched queries) are handled
 * by the same fetchRequestHandler.
 */

import { 
    fetchRequestHandler 
} from '@trpc/server/adapters/fetch';

import { 
    createTRPCContext 
} from '@/trpc/init';

import { 
    appRouter 
} from '@/trpc/routers/_app';

/** Shared handler for GET (queries) and POST (mutations) requests. */
const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext: createTRPCContext,
  });

export { handler as GET, handler as POST };