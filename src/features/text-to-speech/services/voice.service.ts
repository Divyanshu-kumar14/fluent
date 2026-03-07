import { TRPCError } from "@trpc/server";
import { prisma } from "@/lib/db";
import { deleteAudio } from "@/lib/r2";
import { VoiceQuery, VoiceDelete } from "../data/schemas";

export class VoiceService {
  constructor(private readonly orgId: string) {}

  /**
   * Fetch all voices accessible to the current org.
   * Returns { custom, system } — custom voices are org-owned,
   * system voices are shared across all orgs.
   * Supports optional text search across name and description.
   */
  async getAllVoices(input?: VoiceQuery) {
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

    const [custom, system] = await Promise.all([
      prisma.voice.findMany({
        where: {
          variant: "CUSTOM",
          orgId: this.orgId,
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
  }

  /**
   * Delete a custom voice owned by the current org.
   * Also removes the associated audio file from R2 (best-effort).
   */
  async deleteCustomVoice(input: VoiceDelete) {
    const voice = await prisma.voice.findUnique({
      where: {
        id: input.id,
        variant: "CUSTOM",
        orgId: this.orgId,
      },
      select: { id: true, r2ObjectKey: true },
    });

    if (!voice) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "Voice not found",
      });
    }

    await prisma.voice.delete({ where: { id: voice.id } });

    if (voice.r2ObjectKey) {
      await deleteAudio(voice.r2ObjectKey).catch(() => {});
    }

    return { success: true };
  }
}
