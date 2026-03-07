/**
 * Voices Router
 *
 * Manages TTS voice profiles:
 *   - `getAll`: List all voices accessible to the current org
 *               (custom org voices + shared system voices), with optional search.
 *   - `delete`: Delete a custom voice (org-scoped) and clean up its R2 audio.
 *
 * All procedures require an active Clerk organisation (orgProcedure).
 */

import { VoiceService } from "@/features/text-to-speech/services/voice.service";
import { VoiceQuerySchema, VoiceDeleteSchema } from "@/features/text-to-speech/data/schemas";
import { createTRPCRouter, orgProcedure } from "../init";

export const voicesRouter = createTRPCRouter({
  /**
   * Fetch all voices accessible to the current org.
   * Returns { custom, system } — custom voices are org-owned,
   * system voices are shared across all orgs.
   * Supports optional text search across name and description.
   */
  getAll: orgProcedure
    .input(VoiceQuerySchema.optional())
    .query(async ({ ctx, input }) => {
      const voiceService = new VoiceService(ctx.orgId);
      return voiceService.getAllVoices(input ?? undefined);
    }),

    /**
     * Delete a custom voice owned by the current org.
     * Also removes the associated audio file from R2 (best-effort).
     */
    delete: orgProcedure
      .input(VoiceDeleteSchema)
      .mutation(async ({ ctx, input }) => {
        const voiceService = new VoiceService(ctx.orgId);
        return voiceService.deleteCustomVoice(input);
      }),
});