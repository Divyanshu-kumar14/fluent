/**
 * Generations Router
 *
 * Orchestrates Text-to-Speech (TTS) generation requests. This router handles
 * querying existing generations and triggering new ones via the GenerationService.
 *
 * All routes require a valid organization context (orgProcedure).
 */

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, orgProcedure } from "../init";
import { GenerationInputSchema } from "@/features/text-to-speech/data/schemas";
import { GenerationService } from "@/features/text-to-speech/services/generation.service";

export const generationsRouter = createTRPCRouter({
  /**
   * Retrieves a specific generation by ID for the current organization.
   */
  getById: orgProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const generation = await GenerationService.getById(input.id, ctx.orgId);

      if (!generation) {
        throw new TRPCError({ 
          code: "NOT_FOUND",
          message: "Generation not found"
        });
      }

      return {
        id: generation.id,
        text: generation.text,
        voiceId: generation.voiceId,
        voiceName: generation.voiceName,
        temperature: generation.temperature,
        topP: generation.topP,
        topK: generation.topK,
        repetitionPenalty: generation.repetitionPenalty,
        createdAt: generation.createdAt,
        audioUrl: `/api/audio/${generation.id}`,
      };
    }),

  /**
   * Lists all generations for the current organization, ordered by recency.
   */
  getAll: orgProcedure.query(async ({ ctx }) => {
    return await GenerationService.getAll(ctx.orgId);
  }),

  /**
   * Triggers a new audio generation pipeline.
   * Logic is delegated to GenerationService for transactional integrity.
   */
  create: orgProcedure
    .input(GenerationInputSchema)
    .mutation(async ({ input, ctx }) => {
      const result = await GenerationService.generateAudio(input, ctx.orgId);
      
      return {
        id: result.id,
      };
    }),
});