/**
 * Root tRPC Router
 *
 * Merges all feature-level routers into a single `appRouter`.
 * The exported `AppRouter` type is used across client and server
 * for end-to-end type safety.
 */

import {  
  createTRPCRouter 
} from '../init';

import { voicesRouter } from './voices';
import { generationsRouter } from './generations';

/** The top-level tRPC router combining all sub-routers. */
export const appRouter = createTRPCRouter({
  voices: voicesRouter, 
  generations: generationsRouter,
});

/** Type definition of the full API — used for client-side type inference. */
export type AppRouter = typeof appRouter;