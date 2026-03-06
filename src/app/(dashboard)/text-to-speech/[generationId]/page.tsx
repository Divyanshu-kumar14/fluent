/**
 * Generation Detail Page
 *
 * Displays a previously-generated TTS result. Prefetches both the
 * generation data and the voices list on the server so the client
 * can render immediately with cached data.
 */

import { TextToSpeechDetailView } from "@/features/text-to-speech/views/text-to-speech-detail-view";
import { trpc, HydrateClient, prefetch } from "@/trpc/server";

export default async function TextToSpeechDetailPage({
  params,
}: {
  params: Promise<{ generationId: string }>;
}) {
  const { generationId } = await params;

  // Prefetch the generation and voices data on the server
  prefetch(trpc.generations.getById.queryOptions({ id: generationId }));
  prefetch(trpc.voices.getAll.queryOptions());
  prefetch(trpc.generations.getAll.queryOptions());

  return (
    <HydrateClient>
      <TextToSpeechDetailView generationId={generationId} />
    </HydrateClient>
  );
};