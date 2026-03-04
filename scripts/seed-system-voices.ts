/**
 * Seed System Voices Script
 *
 * Populates the database with the canonical set of built-in TTS voices.
 * For each voice:
 *   1. Reads the reference .wav file from scripts/system-voices/<Name>.wav.
 *   2. Uploads it to R2 at voices/system/<voiceId>.
 *   3. Creates or updates the Voice record in the database with metadata
 *      (description, category, language).
 *
 * Usage: npx tsx scripts/seed-system-voices.ts
 * Requires: DATABASE_URL, R2_* env vars (loaded via dotenv).
 */

import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PutObjectCommand,
  S3Client,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";

import {
  PrismaClient,
  type VoiceCategory,
} from "../src/generated/prisma/client";

import { CANONICAL_SYSTEM_VOICE_NAMES } from "../src/features/voices/data/voice-scoping";

/** Directory containing the reference .wav files for each system voice. */
const SYSTEM_VOICES_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "system-voices",
);

// ── Environment variable validation ──
const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  R2_ACCOUNT_ID: z.string().min(1),
  R2_ACCESS_KEY_ID: z.string().min(1),
  R2_SECRET_ACCESS_KEY: z.string().min(1),
  R2_BUCKET_NAME: z.string().min(1),
});

const env = envSchema.parse(process.env);

// ── Database & R2 clients ──
const adapter = new PrismaPg({ connectionString: env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

// ── Voice metadata ──

/** Descriptive metadata for each built-in system voice. */
interface VoiceMetadata {
  description: string;
  category: VoiceCategory;
  language: string;
}

/** Human-curated descriptions, categories, and languages for all system voices. */
const systemVoiceMetadata: Record<string, VoiceMetadata> = {
  Aaron: {
    description: "Soothing and calm, like a self-help audiobook narrator",
    category: "AUDIOBOOK",
    language: "en-US",
  },
  Abigail: {
    description: "Friendly and conversational with a warm, approachable tone",
    category: "CONVERSATIONAL",
    language: "en-GB",
  },
  Anaya: {
    description: "Polite and professional, suited for customer service",
    category: "CUSTOMER_SERVICE",
    language: "en-IN",
  },
  Andy: {
    description: "Versatile and clear, a reliable all-purpose narrator",
    category: "GENERAL",
    language: "en-US",
  },
  Archer: {
    description: "Laid-back and reflective with a steady, storytelling pace",
    category: "NARRATIVE",
    language: "en-US",
  },
  Brian: {
    description: "Professional and helpful with a clear customer support tone",
    category: "CUSTOMER_SERVICE",
    language: "en-US",
  },
  Chloe: {
    description: "Bright and bubbly with a cheerful, outgoing personality",
    category: "CORPORATE",
    language: "en-AU",
  },
  Dylan: {
    description:
      "Thoughtful and intimate, like a quiet late-night conversation",
    category: "GENERAL",
    language: "en-US",
  },
  Emmanuel: {
    description: "Nasally and distinctive with a quirky, cartoon-like quality",
    category: "CHARACTERS",
    language: "en-US",
  },
  Ethan: {
    description: "Polished and warm with crisp, studio-quality delivery",
    category: "VOICEOVER",
    language: "en-US",
  },
  Evelyn: {
    description: "Warm Southern charm with a heartfelt, down-to-earth feel",
    category: "CONVERSATIONAL",
    language: "en-US",
  },
  Gavin: {
    description: "Calm and reassuring with a smooth, natural flow",
    category: "MEDITATION",
    language: "en-US",
  },
  Gordon: {
    description: "Warm and encouraging with an uplifting, motivational tone",
    category: "MOTIVATIONAL",
    language: "en-US",
  },
  Ivan: {
    description: "Deep and cinematic with a dramatic, movie-character presence",
    category: "CHARACTERS",
    language: "ru-RU",
  },
  Laura: {
    description: "Authentic and warm with a conversational Midwestern tone",
    category: "CONVERSATIONAL",
    language: "en-US",
  },
  Lucy: {
    description: "Direct and composed with a professional phone manner",
    category: "CUSTOMER_SERVICE",
    language: "en-US",
  },
  Madison: {
    description: "Energetic and unfiltered with a casual, chatty vibe",
    category: "PODCAST",
    language: "en-US",
  },
  Marisol: {
    description: "Confident and polished with a persuasive, ad-ready delivery",
    category: "ADVERTISING",
    language: "en-US",
  },
  Meera: {
    description: "Friendly and helpful with a clear, service-oriented tone",
    category: "CUSTOMER_SERVICE",
    language: "en-IN",
  },
  Walter: {
    description: "Old and raspy with deep gravitas, like a wise grandfather",
    category: "NARRATIVE",
    language: "en-US",
  },
};

// ── Helper functions ──

/** Read a system voice's .wav file from disk and return it as a Buffer. */
async function readSystemVoiceAudio(name: string) {
  const filePath = path.join(SYSTEM_VOICES_DIR, `${name}.wav`);
  const buffer = Buffer.from(await fs.readFile(filePath));
  return { buffer, contentType: "audio/wav" };
}

/** Upload a voice's reference audio to R2 under the given key. */
async function uploadSystemVoiceAudio({
  key,
  buffer,
  contentType,
}: {
  key: string;
  buffer: Buffer;
  contentType: string;
}) {
  const commandInput: PutObjectCommandInput = {
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    Body: buffer,
    ContentType: contentType,
  };

  await r2.send(new PutObjectCommand(commandInput));
}

/**
 * Seed a single system voice.
 * - If the voice already exists in the DB, update its audio and metadata.
 * - If it doesn't exist, create a new record, upload audio, then link them.
 *   On failure, the orphaned DB record is cleaned up.
 */
async function seedSystemVoice(name: string) {
  const { buffer, contentType } = await readSystemVoiceAudio(name);

  // Check if this system voice already exists
  const existingSystemVoice = await prisma.voice.findFirst({
    where: {
      variant: "SYSTEM",
      name,
    },
    select: { id: true },
  });

  if (existingSystemVoice) {
    // Update existing: re-upload audio and refresh metadata
    const r2ObjectKey = `voices/system/${existingSystemVoice.id}`;
    const meta = systemVoiceMetadata[name];

    await uploadSystemVoiceAudio({
      key: r2ObjectKey,
      buffer,
      contentType,
    });

    await prisma.voice.update({
      where: { id: existingSystemVoice.id },
      data: {
        r2ObjectKey,
        ...(meta && {
          description: meta.description,
          category: meta.category,
          language: meta.language,
        }),
      },
    });
    return;
  }

  // Create new voice record
  const meta = systemVoiceMetadata[name];

  const voice = await prisma.voice.create({
    data: {
      name,
      variant: "SYSTEM",
      orgId: null,  // System voices have no org owner
      ...(meta && {
        description: meta.description,
        category: meta.category,
        language: meta.language,
      }),
    },
    select: {
      id: true,
    },
  });

  const r2ObjectKey = `voices/system/${voice.id}`;

  try {
    // Upload the reference audio to R2
    await uploadSystemVoiceAudio({
      key: r2ObjectKey,
      buffer,
      contentType,
    });

    // Link the R2 key back to the voice record
    await prisma.voice.update({
      where: {
        id: voice.id,
      },
      data: {
        r2ObjectKey,
      },
    });
  } catch (error) {
    // Rollback: delete the orphaned voice record on upload failure
    await prisma.voice
      .delete({
        where: {
          id: voice.id,
        },
      })
      .catch(() => {});

    throw error;
  }
};

// ── Main entry point ──

async function main() {
  console.log(
    `Seeding ${CANONICAL_SYSTEM_VOICE_NAMES.length} system voices...`,
  );

  for (const name of CANONICAL_SYSTEM_VOICE_NAMES) {
    console.log(`- ${name}`);
    await seedSystemVoice(name);
  }

  console.log("System voice seed completed.");
}

main()
  .catch((error) => {
    console.error("Failed to seed system voices:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });