/**
 * Server Environment Variables
 *
 * Uses @t3-oss/env-nextjs to define, validate, and type-check all required
 * server-side environment variables at startup. If any variable is missing
 * or malformed, the app will fail fast with a clear error message.
 */

import { z } from "zod";
import { createEnv } from "@t3-oss/env-nextjs";

export const env = createEnv({
  server: {
    /** PostgreSQL connection string for Prisma */
    DATABASE_URL: z.string().min(1),
    /** Public-facing URL of this Next.js app (used for tRPC URL resolution) */
     APP_URL: z.string().min(1),

    // ─── Cloudflare R2 ───
    R2_ACCOUNT_ID: z.string().min(1),
    R2_ACCESS_KEY_ID: z.string().min(1),
    R2_SECRET_ACCESS_KEY: z.string().min(1),
    R2_BUCKET_NAME: z.string().min(1),

    // ─── Chatterbox TTS API ───
    CHATTERBOX_API_URL: z.url(),
    CHATTERBOX_API_KEY: z.string().min(1),
  },

  /**
   * Server-only variables are not exposed to the client bundle.
   * `experimental__runtimeEnv` is left empty because all vars are server-side.
   */
  experimental__runtimeEnv: {},

  /** Allow skipping validation in CI / build environments. */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
});