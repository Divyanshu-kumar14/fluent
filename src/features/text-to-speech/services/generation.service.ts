import * as Sentry from "@sentry/nextjs";
import { TRPCError } from "@trpc/server";
import { chatterbox } from "@/lib/chatterbox-client";
import { prisma } from "@/lib/db";
import { uploadAudio } from "@/lib/r2";
import { type GenerationInput } from "../data/schemas";

export class GenerationService {
  static async getById(id: string, orgId: string) {
    return await prisma.generation.findUnique({
      where: { id, orgId }
    });
  }

  static async getAll(orgId: string) {
    return await prisma.generation.findMany({
      where: { orgId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        text: true,
        voiceName: true,
        voiceId: true,
        createdAt: true,
        temperature: true,
      },
    });
  }

  /**
   * Orchestrates the audio generation process:
   * 1. Validates the voice.
   * 2. Pings Chatterbox API.
   * 3. Creates a database record.
   * 4. Uploads audio to R2.
   * 5. Updates the record with the R2 key.
   * 6. Cleanup on failure.
   */
  static async generateAudio(input: GenerationInput, orgId: string) {
    // 1. Validate Voice
    const voice = await prisma.voice.findUnique({
      where: {
        id: input.voiceId,
        OR: [{ variant: "SYSTEM" }, { variant: "CUSTOM", orgId }],
      },
      select: { id: true, name: true, r2ObjectKey: true },
    });

    if (!voice || !voice.r2ObjectKey) {
      throw new TRPCError({
        code: voice ? "PRECONDITION_FAILED" : "NOT_FOUND",
        message: voice ? "Voice audio not available" : "Voice not found",
      });
    }

    // 2. Generate Audio via Chatterbox
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

    if (error || !(data instanceof ArrayBuffer)) {
      Sentry.logger.error("Chatterbox generation failed", { orgId, error });
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to generate audio",
      });
    }

    const buffer = Buffer.from(data);
    let generationId: string | null = null;

    try {
      // 3. Create initial database record
      const generation = await prisma.generation.create({
        data: {
          orgId,
          text: input.text,
          voiceName: voice.name,
          voiceId: voice.id,
          temperature: input.temperature,
          topP: input.topP,
          topK: input.topK,
          repetitionPenalty: input.repetitionPenalty,
        },
        select: { id: true },
      });

      generationId = generation.id;
      const r2ObjectKey = `generations/orgs/${orgId}/${generationId}`;

      // 4. Upload to R2 & Update record
      await uploadAudio({ buffer, key: r2ObjectKey });
      
      return await prisma.generation.update({
        where: { id: generationId },
        data: { r2ObjectKey },
        select: { id: true },
      });
    } catch (e) {
      Sentry.logger.error("Failed to store generated audio", { orgId, generationId, error: e });

      // 5. Cleanup on failure
      if (generationId) {
        await prisma.generation.delete({ where: { id: generationId } }).catch(() => {});
      }

      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to store generated audio",
      });
    }
  }
}
