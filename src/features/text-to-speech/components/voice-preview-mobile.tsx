/**
 * Voice Preview Mobile Component
 *
 * A compact audio player shown on mobile viewports (hidden on desktop).
 * Uses the native HTML5 <audio> element instead of WaveSurfer for a
 * lightweight mobile experience. Supports play/pause and download.
 */
"use client";

import { useRef, useState, useEffect } from "react";
import { Pause, Play, Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { VoiceAvatar } from "@/components/voice-avatar/voice-avatar";
import { useIsMobile } from "@/hooks/use-mobile";

type VoicePreviewMobileVoice = {
  id?: string;
  name: string;
};

export function VoicePreviewMobile({
  audioUrl,
  voice,
  text,
}: {
  audioUrl: string;
  voice: VoicePreviewMobileVoice | null;
  text: string;
}) {
  const isMobile = useIsMobile();
  const selectedVoiceName = voice?.name ?? null;
  const selectedVoiceSeed = voice?.id ?? null;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Sync play/pause/ended state with the native audio element
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("ended", handleEnded);

    // Reset on URL change
    audio.pause();
    audio.currentTime = 0;

    return () => {
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [audioUrl]);

  // Pause playback when switching from mobile to desktop viewport
  useEffect(() => {
    if (!isMobile) {
      audioRef.current?.pause();
    }
  }, [isMobile]);

  /** Toggle between play and pause states. */
  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  /** Trigger a download of the audio file with a sanitised filename. */
  const handleDownload = () => {
    const safeName =
      text
        .slice(0, 50)
        .trim()
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase() || "speech";

    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `${safeName}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!audioUrl) return null;

  return (
    <div className="border-t lg:hidden p-4">
      {/* Hidden native audio element */}
      <audio ref={audioRef} src={audioUrl} />

      <div className="grid grid-cols-[1fr_auto] items-center gap-4">
        {/* Metadata: text snippet + voice name */}
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">{text}</p>
          {selectedVoiceName && (
            <div className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
              <VoiceAvatar
                seed={selectedVoiceSeed ?? selectedVoiceName}
                name={selectedVoiceName}
                className="shrink-0"
              />
              <span className="truncate">{selectedVoiceName}</span>
            </div>
          )}
        </div>

        {/* Controls: download + play/pause */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleDownload}>
            <Download className="size-4" />
          </Button>
          <Button
            variant="default"
            size="icon"
            className="rounded-full"
            onClick={togglePlayPause}
          >
            {isPlaying ? (
              <Pause className="fill-background" />
            ) : (
              <Play className="fill-background" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
