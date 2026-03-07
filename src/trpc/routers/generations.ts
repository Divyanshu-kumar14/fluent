/**
 * Generations Router
 *
 * Handles TTS audio generation lifecycle:
 *   - `getById`: Fetch a single generation by ID (org-scoped).
 *   - `getAll`: List all generations for the current org.
 *   - `create`: Generate speech audio via the Chatterbox API, store in R2, and
 *               persist the metadata in the database.
 *
 * All procedures require an active Clerk organisation (orgProcedure).
 */

import * as Sentry from "@sentry/nextjs";
import { z } from "zod";
// import { polar } from "@/lib/polar";
import { TRPCError } from "@trpc/server";
import { chatterbox } from "@/lib/chatterbox-client";
import { prisma } from "@/lib/db";
import { uploadAudio } from "@/lib/r2";
import { TEXT_MAX_LENGTH } from "@/features/text-to-speech/data/constants";
import { createTRPCRouter, orgProcedure } from "../init";

export const generationsRouter = createTRPCRouter({
  /**
   * Fetch a single generation by ID.
   * Returns the generation metadata plus a proxied audio URL.
   */
  getById: orgProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const generation = await prisma.generation.findUnique({
        where: { id: input.id, orgId: ctx.orgId },
        omit: {
          orgId: true,       // Don't leak internal org ID to the client
          r2ObjectKey: true,  // Don't expose raw R2 keys
        },
      });

      if (!generation) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return {
        ...generation,
        // Return a proxied URL so the client never sees the R2 signed URL
        audioUrl: `/api/audio/${generation.id}`,
      };
    }),
  
  /** List all generations for the current org, newest first. */
  getAll: orgProcedure.query(async ({ ctx }) => {
    const generations = await prisma.generation.findMany({
      where: { orgId: ctx.orgId },
      orderBy: { createdAt: "desc" },
      omit: {
        orgId: true,
        r2ObjectKey: true,
      },
    });

    return generations;
  }),

  /**
   * Create a new TTS generation.
   *
   * Flow:
   *   1. (Disabled) Check for an active subscription via Polar.
   *   2. Validate the voice exists and is accessible by this org.
   *   3. Call the Chatterbox TTS API to synthesise audio.
   *   4. Create a Generation record in the database.
   *   5. Upload the audio buffer to R2.
   *   6. Update the Generation with the R2 key.
   *   7. (Disabled) Ingest a usage event to Polar for metering.
   *
   * If the R2 upload fails, the Generation record is rolled back (deleted).
   */
  create: orgProcedure
    .input(
      z.object({
        text: z.string().min(1).max(TEXT_MAX_LENGTH),
        voiceId: z.string().min(1),
        temperature: z.number().min(0).max(2).default(0.8),
        topP: z.number().min(0).max(1).default(0.95),
        topK: z.number().min(1).max(10000).default(1000),
        repetitionPenalty: z.number().min(1).max(2).default(1.2),
      })
    )
    .mutation(async ({ input, ctx }) => {

      // ── (Disabled) Subscription check ──
      //   try {
      //     const customerState = await polar.customers.getStateExternal({
      //       externalId: ctx.orgId,
      //     });
      //     const hasActiveSubscription =
      //       (customerState.activeSubscriptions ?? []).length > 0;
      //     if (!hasActiveSubscription) {
      //       throw new TRPCError({
      //         code: "FORBIDDEN",
      //         message: "SUBSCRIPTION_REQUIRED",
      //       });
      //     }
      //   } catch (err) {
      //     if (err instanceof TRPCError) throw err;
      //     // Customer doesn't exist in Polar yet -> no subscription
      //     throw new TRPCError({
      //       code: "FORBIDDEN",
      //       message: "SUBSCRIPTION_REQUIRED",
      //     });
      //   }

      // Step 1: Validate voice exists and is accessible (SYSTEM or own CUSTOM)

      const voice = await prisma.voice.findUnique({
        where: {
          id: input.voiceId,
          OR: [
            { variant: "SYSTEM" },
            { variant: "CUSTOM", orgId: ctx.orgId, }
          ],
        },
        select: {
          id: true,
          name: true,
          r2ObjectKey: true,
        },
      });

      if (!voice) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Voice not found",
        });
      }

      if (!voice.r2ObjectKey) {
        throw new TRPCError({
          code: "PRECONDITION_FAILED",
          message: "Voice audio not available",
        });
      }

      // Step 2: Call the Chatterbox TTS API to generate audio
      const { data, error } = await chatterbox.POST("/generate", {
        body: {
          prompt: input.text,
          voice_key: voice.r2ObjectKey,
          temperature: input.temperature,
          top_p: input.topP,
          top_k: input.topK,
          repetition_penalty: input.repetitionPenalty,
          norm_loudness: true,
        },
        parseAs: "arrayBuffer",
      });

      Sentry.captureMessage("Generation started", {
        level: "info",
        extra: {
          orgId: ctx.orgId,
          voiceId: input.voiceId,
          textLength: input.text.length,
        },
      });

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to generate audio",
        });
      }

      // Verify we received a valid binary response
      if (!(data instanceof ArrayBuffer)) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Invalid audio response",
        });
      }

      const buffer = Buffer.from(data);
      let generationId: string | null = null;
      let r2ObjectKey: string | null = null;

      try {
        // Step 3: Persist the generation metadata
        const generation = await prisma.generation.create({
          data: {
            orgId: ctx.orgId,
            text: input.text,
            voiceName: voice.name,  // Snapshot the voice name at generation time
            voiceId: voice.id,
            temperature: input.temperature,
            topP: input.topP,
            topK: input.topK,
            repetitionPenalty: input.repetitionPenalty,
          },
          select: {
            id: true,
          },
        });

        generationId = generation.id;
        // R2 key follows pattern: generations/orgs/<orgId>/<generationId>
        r2ObjectKey = `generations/orgs/${ctx.orgId}/${generation.id}`;

        // Step 4: Upload the audio file to R2
        await uploadAudio({ buffer, key: r2ObjectKey });

        // Step 5: Link the R2 key back to the generation record
        await prisma.generation.update({
          where: {
            id: generation.id,
          },
          data: {
            r2ObjectKey,
          },
        });

        Sentry.captureMessage("Audio generated", {
          level: "info",
          extra: {
            orgId: ctx.orgId,
            generationId: generation.id,
          },
        });
      } catch {
        // Rollback: delete the orphaned generation record if R2 upload failed
        if (generationId) {
          await prisma.generation
            .delete({
              where: {
                id: generationId,
              },
            })
            .catch(() => {});
        }

        Sentry.captureException(new Error("Generation failed"), {
          extra: {
            orgId: ctx.orgId,
            voiceId: input.voiceId,
          },
        });

        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to store generated audio",
        });
      }

      // Final safety check
      if (!generationId || !r2ObjectKey) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to store generated audio",
        });
      }

      // ── (Disabled) Ingest usage event to Polar for billing ──
      // Fire-and-forget — don't block the response for metering
      //   polar.events
      //     .ingest({
      //       events: [
      //         {
      //           name: "tts_generation",
      //           externalCustomerId: ctx.orgId,
      //           metadata: { characters: input.text.length },
      //           timestamp: new Date(),
      //         },
      //       ],
      //     })
          // .catch(() => {
          //   // Silently fail - don't break the user experience for metering errors
          // });

      return {
        id: generationId,
      };
    }),
});