/**
 * Voice Category Labels
 *
 * Maps the Prisma VoiceCategory enum values to human-readable display labels.
 * Used throughout the UI in voice selectors, cards, and metadata displays.
 */

import type { VoiceCategory } from "@/generated/prisma/client";

/** Human-readable label for each voice category. */
export const VOICE_CATEGORY_LABELS: Record<VoiceCategory, string> = {
  AUDIOBOOK: "Audiobook",
  CONVERSATIONAL: "Conversational",
  CUSTOMER_SERVICE: "Customer Service",
  GENERAL: "General",
  NARRATIVE: "Narrative",
  CHARACTERS: "Characters",
  MEDITATION: "Meditation",
  MOTIVATIONAL: "Motivational",
  PODCAST: "Podcast",
  ADVERTISING: "Advertising",
  VOICEOVER: "Voiceover",
  CORPORATE: "Corporate",
};

/** Array of all VoiceCategory enum values (derived from the labels map). */
export const VOICE_CATEGORIES = Object.keys(
  VOICE_CATEGORY_LABELS,
) as VoiceCategory[];