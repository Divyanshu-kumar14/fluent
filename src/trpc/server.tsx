/**
 * tRPC Server-Side Utilities
 *
 * Provides the server-side tRPC proxy, hydration helpers, and prefetch utility
 * for use in React Server Components. This file must never be imported from
 * client components (enforced by the 'server-only' package).
 */

import 'server-only'; // <-- ensure this file cannot be imported from the client
import { createTRPCOptionsProxy } from '@trpc/tanstack-react-query';
import { cache } from 'react';
import { createTRPCContext } from './init';
import { makeQueryClient } from './query-client';
import { appRouter } from './routers/_app';
import { HydrationBoundary, dehydrate } from '@tanstack/react-query';
import { TRPCQueryOptions } from '@trpc/tanstack-react-query';

/**
 * Stable, per-request QueryClient getter.
 * React's `cache()` ensures the same client is returned within a single request,
 * preventing duplicate fetches while still isolating between requests.
 */
export const getQueryClient = cache(makeQueryClient);

/**
 * Server-side tRPC proxy for building query options.
 * Usage: `trpc.voices.getAll.queryOptions()` inside a Server Component.
 */
export const trpc = createTRPCOptionsProxy({
  ctx: createTRPCContext,
  router: appRouter,
  queryClient: getQueryClient,
});

/**
 * Dehydrates the server-side query cache into the client via React Query's
 * HydrationBoundary, enabling seamless SSR → client handoff.
 */
export function HydrateClient(props: { children: React.ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      {props.children}
    </HydrationBoundary>
  );
}

/**
 * Prefetch a tRPC query on the server so it's already cached when
 * the client renders. Automatically handles both regular and infinite queries.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function prefetch<T extends ReturnType<TRPCQueryOptions<any>>>(
  queryOptions: T,
) {
  const queryClient = getQueryClient();
  if (queryOptions.queryKey[1]?.type === 'infinite') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void queryClient.prefetchInfiniteQuery(queryOptions as any);
  } else {
    void queryClient.prefetchQuery(queryOptions);
  }
}