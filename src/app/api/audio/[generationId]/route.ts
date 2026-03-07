/**
 * Audio Proxy API Route
 *
 * Serves generated audio files via a proxied, authenticated endpoint.
 * Instead of exposing R2 signed URLs directly to the client, this route:
 *   1. Verifies the user is signed in and belongs to an org.
 *   2. Checks the generation exists and belongs to the user's org.
 *   3. Generates a temporary R2 signed URL and streams the audio through.
 *
 * This keeps R2 credentials server-side and enables caching headers.
 */

import { auth } from "@clerk/nextjs/server";
import { getSignedAudioUrl } from "@/lib/r2";
import { GenerationService } from "@/features/text-to-speech/services/generation.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ generationId: string }> },
) {
  // Authenticate the request
  const { userId, orgId } = await auth();

  if (!userId || !orgId) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { generationId } = await params;

  // Look up the generation scoped to the user's org
  const generation = await GenerationService.getById(generationId, orgId);

  if (!generation) {
    return new Response("Not found", { status: 404 });
  }

  // The R2 key is set after audio upload completes — may be null briefly
  if (!generation.r2ObjectKey) {
    return new Response("Audio is not available yet", { status: 409 });
  }

  // Fetch the audio from R2 using a short-lived signed URL
  const signedUrl = await getSignedAudioUrl(generation.r2ObjectKey);
  const audioResponse = await fetch(signedUrl);

  if (!audioResponse.ok) {
    return new Response("Failed to fetch audio", { status: 502 });
  }

  // Stream the audio back to the client with a 1-hour private cache
  return new Response(audioResponse.body, {
    headers: {
      "Content-Type": "audio/wav",
      "Cache-Control": "private, max-age=3600",
    },
  });
};