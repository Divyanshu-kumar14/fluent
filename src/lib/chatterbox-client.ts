/**
 * Chatterbox TTS API Client
 *
 * Creates a type-safe HTTP client for the Chatterbox TTS Modal API
 * using openapi-fetch with auto-generated TypeScript types.
 */

import createClient from "openapi-fetch";
import type { paths } from "@/types/chatterbox-api";
import { env } from "./env";

/** Pre-configured client for the Chatterbox TTS API (server-side only). */
export const chatterbox = createClient<paths>({
  baseUrl: env.CHATTERBOX_API_URL,
  headers: {
    "x-api-key": env.CHATTERBOX_API_KEY,
  },
});