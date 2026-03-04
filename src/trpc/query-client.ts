/**
 * React Query Client Factory
 *
 * Creates a QueryClient with custom defaults:
 *   - 30-second stale time (avoids refetching too aggressively).
 *   - superjson serialisation for SSR hydration (preserves rich types).
 *   - Dehydrates pending queries so they can be completed on the client.
 */

import {
  defaultShouldDehydrateQuery,
  QueryClient,
} from '@tanstack/react-query';

import superjson from 'superjson';

/** Create a new QueryClient with project-wide defaults. */
export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data is considered fresh for 30 seconds before background refetch
        staleTime: 30 * 1000,
      },
      dehydrate: {
        // Use superjson to preserve Dates, Maps, Sets, etc. across SSR boundary
        serializeData: superjson.serialize,
        // Also dehydrate queries that are still pending (in-flight on the server)
        shouldDehydrateQuery: (query) =>
          defaultShouldDehydrateQuery(query) ||
          query.state.status === 'pending',
      },
      hydrate: {
        // Deserialise back from superjson on the client side
        deserializeData: superjson.deserialize,
      },
    },
  });
}