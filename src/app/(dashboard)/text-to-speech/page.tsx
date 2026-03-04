/**
 * Text-to-Speech Page (New Generation)
 *
 * Renders the TTS editor for creating a new generation.
 * Accepts optional `text` and `voiceId` search params to pre-fill the form
 * (e.g. from quick-action links on the dashboard).
 * Prefetches the voices list on the server for instant hydration.
 */

import type { Metadata } from "next";
import { TextToSpeechView } from "@/features/text-to-speech/views/text-to-speech-view";
import { trpc, HydrateClient, prefetch } from "@/trpc/server";

export const metadata: Metadata = { title: "Text to Speech" };

export default async function TextToSpeechPage({
  searchParams,
}:{
  searchParams: Promise<{ text?: string; voiceId?: string }>; 
}) {
  const { text, voiceId } = await searchParams;

  // Prefetch voices on the server so the client gets cached data instantly
  prefetch(trpc.voices.getAll.queryOptions());

  return (
    <HydrateClient>
      <TextToSpeechView initialValues={{text, voiceId}} />
    </HydrateClient>
  );
}