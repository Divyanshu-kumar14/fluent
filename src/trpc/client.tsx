/**
 * tRPC Client-Side Provider
 *
 * Sets up the tRPC + React Query provider tree for client components.
 * Key responsibilities:
 *   - Creates a singleton QueryClient (browser) or per-request one (server).
 *   - Creates a tRPC client with httpBatchLink for efficient request batching.
 *   - Wraps the app in QueryClientProvider + TRPCProvider.
 */
'use client';

import type { 
    QueryClient 
} from '@tanstack/react-query';

import { 
    QueryClientProvider 
} from '@tanstack/react-query';

import { 
    createTRPCClient, 
    httpBatchLink 
} from '@trpc/client';

import { 
    createTRPCContext 
} from '@trpc/tanstack-react-query';

import { 
    useState 
} from 'react';

import { 
    makeQueryClient 
} from './query-client';

import type { 
    AppRouter 
} from './routers/_app';

import superjson from "superjson";

/** Typed tRPC hooks and provider for the AppRouter. */
export const { 
    TRPCProvider, 
    useTRPC 
} = createTRPCContext<AppRouter>();

/** Singleton query client for the browser (survives re-renders). */
let browserQueryClient: QueryClient;

/**
 * Returns a QueryClient instance.
 * - Server: always creates a fresh client (each request is isolated).
 * - Browser: reuses a singleton to avoid losing cache during React suspense.
 */
function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  }
  // Browser: make a new query client if we don't already have one
  // This is very important, so we don't re-make a new client if React
  // suspends during the initial render. This may not be needed if we
  // have a suspense boundary BELOW the creation of the query client
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}

/** Resolve the tRPC API URL (relative on client, absolute on server). */
function getUrl() {
  const base = (() => {
    if (typeof window !== 'undefined') return '';
    if (process.env.APP_URL) return process.env.APP_URL;
    return 'http://localhost:3000';
  })();
  return `${base}/api/trpc`;
}

/**
 * Top-level provider component that wires up tRPC + React Query.
 * Mount this in the root layout so all client components can use `useTRPC`.
 */
export function TRPCReactProvider(
  props: Readonly<{
    children: React.ReactNode;
  }>,
) {
  // NOTE: Avoid useState when initializing the query client if you don't
  //       have a suspense boundary between this and the code that may
  //       suspend because React will throw away the client on the initial
  //       render if it suspends and there is no boundary
  const queryClient = getQueryClient();
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        httpBatchLink({
          transformer: superjson,
          url: getUrl(),
        }),
      ],
    }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {props.children}
      </TRPCProvider>
    </QueryClientProvider>
  );
}