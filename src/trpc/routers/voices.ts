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

import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/db";
import { deleteAudio } from "@/lib/r2";
import { createTRPCRouter, orgProcedure } from "../init";

export const voicesRouter = createTRPCRouter({
  /**
   * Fetch all voices accessible to the current org.
   * Returns { custom, system } — custom voices are org-owned,
   * system voices are shared across all orgs.
   * Supports optional text search across name and description.
   */
  getAll: orgProcedure
    .input(
      z
        .object({
          query: z.string().trim().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      // Build a case-insensitive search filter if a query string is provided
      const searchFilter = input?.query
        ? {
          OR: [
            { 
              name: { 
                contains: input.query, mode: "insensitive" as const
              } 
            },
            {
              description: {
                contains: input.query,
                mode: "insensitive" as const,
              },
            },
          ],
        }
        : {};

      // Fetch custom and system voices in parallel for performance
      const [custom, system] = await Promise.all([
        // Custom voices — scoped to the current org, newest first
        prisma.voice.findMany({
          where: {
            variant: "CUSTOM",
            orgId: ctx.orgId,
            ...searchFilter,
          },
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            language: true,
            variant: true,
          },
        }),
        // System voices — shared across all orgs, sorted alphabetically
        prisma.voice.findMany({
          where: {
            variant: "SYSTEM",
            ...searchFilter,
          },
          orderBy: { name: "asc" },
          select: {
            id: true,
            name: true,
            description: true,
            category: true,
            language: true,
            variant: true,
          },
        }),
      ]);

      return { custom, system };
    }),

    /**
     * Delete a custom voice owned by the current org.
     * Also removes the associated audio file from R2 (best-effort).
     */
    delete: orgProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ ctx, input }) => {
        // Only custom voices owned by this org can be deleted
        const voice = await prisma.voice.findUnique({
          where: {
            id: input.id,
            variant: "CUSTOM",
            orgId: ctx.orgId,
          },
          select: { id: true, r2ObjectKey: true },
        });

        if (!voice) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Voice not found",
          });
        }

        // Delete the database record
        await prisma.voice.delete({ where: { id: voice.id } });

        // Clean up the R2 audio file (best-effort, don't block on failure)
        if (voice.r2ObjectKey) {
          // In production, consider background jobs, retries, cron jobs etc.
          await deleteAudio(voice.r2ObjectKey).catch(() => {});
        }

        return { success: true };
      }),
});