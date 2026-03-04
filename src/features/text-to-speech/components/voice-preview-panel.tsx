/**
 * Voice Preview Panel Component (Desktop)
 *
 * Displays the audio player and waveform visualisation for a generated
 * TTS result. Desktop-only (hidden on mobile — see VoicePreviewMobile).
 *
 * Features:
 *   - WaveSurfer.js waveform with play/pause, seek ±10s controls.
 *   - Time display (current / duration) in mm:ss format.
 *   - Voice name + avatar metadata display.
 *   - One-click download of the .wav file.
 */
"use client";

import { useState } from "react";
import { Pause, Play, Download, Redo, Undo } from "lucide-react";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VoiceAvatar } from "@/components/voice-avatar/voice-avatar";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

import { useWaveSurfer } from "../hooks/use-wavesurfer";

type VoicePreviewPanelVoice = {
  id?: string;
  name: string;
};

/** Format seconds into mm:ss using date-fns. */
function formatTime(seconds: number): string {
  return format(new Date(seconds * 1000), "mm:ss");
};

export function VoicePreviewPanel({
  audioUrl,
  voice,
  text,
}: {
  audioUrl: string;
  voice: VoicePreviewPanelVoice | null;
  text: string;
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const selectedVoiceName = voice?.name ?? null;
  const selectedVoiceSeed = voice?.id ?? null;

  // Initialise WaveSurfer with autoplay enabled
  const {
    containerRef,
    isPlaying,
    isReady,
    currentTime,
    duration,
    togglePlayPause,
    seekBackward,
    seekForward,
  } = useWaveSurfer({
    url: audioUrl,
    autoplay: true,
  });

  /** Download the audio file with a sanitised filename derived from the text. */
  const handleDownload = () => {
    setIsDownloading(true);

    // Create a safe filename from the first 50 chars of the text
    const safeName =
      text
        .slice(0, 50)
        .trim()
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .toLowerCase() || "speech";

    // Trigger a download via a temporary <a> element
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `${safeName}.wav`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setTimeout(() => setIsDownloading(false), 1000);
  };

  return (
    <div className="h-full gap-8 flex-col border-t hidden flex-1 lg:flex">
      {/* Header */}
      <div className="p-6 pb-0">
        <h3 className="font-semibold text-foreground">Voice preview</h3>
      </div>

      {/* Waveform container with loading overlay */}
      <div className="relative flex flex-1 items-center justify-center">
        {!isReady && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <Badge
              variant="outline"
              className="gap-2 bg-background/90 px-3 py-1.5 text-sm text-muted-foreground shadow-sm"
            >
              <Spinner className="size-4" />
              <span>Loading audio...</span>
            </Badge>
          </div>
        )}
        <div
          ref={containerRef}
          className={cn(
            "w-full cursor-pointer transition-opacity duration-200",
            !isReady && "opacity-0",
          )}
        />
      </div>

       {/* Time display (current / duration) */}
       <div className="flex items-center justify-center">
        <p className="text-3xl font-semibold tabular-nums tracking-tight text-foreground">
          {formatTime(currentTime)}&nbsp;
          <span className="text-muted-foreground">
            /&nbsp;{formatTime(duration)}
          </span>
        </p>
       </div>

      {/* Footer: metadata, controls, and download */}
      <div className="flex flex-col items-center p-6">
        <div className="grid w-full grid-cols-3">
          {/* Left column: text snippet + voice name */}
          <div className="flex min-w-0 flex-col gap-0.5">
            <p className="truncate text-sm font-medium text-foreground">
              {text}
            </p>
            {selectedVoiceName && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <VoiceAvatar
                  seed={selectedVoiceSeed ?? selectedVoiceName}
                  name={selectedVoiceName}
                  className="shrink-0"
                />
                <span className="truncate">{selectedVoiceName}</span>
              </div>
            )}
          </div>

          {/* Center column: playback controls */}
          <div className="flex items-center justify-center gap-3">
            {/* Seek backward 10 seconds */}
            <Button
              variant="ghost"
              size="icon-lg"
              className="flex-col"
              onClick={() => seekBackward(10)}
              disabled={!isReady}
            >
              <Undo className="size-4 -mb-1" />
              <span className="text-[10px] font-medium">10</span>
            </Button>

            {/* Play / Pause */}
            <Button
              variant="default"
              size="icon-lg"
              className="rounded-full"
              onClick={togglePlayPause}
            >
              {isPlaying ? (
                <Pause className="fill-background" />
              ) : (
                <Play className="fill-background" />
              )}
            </Button>

            {/* Seek forward 10 seconds */}
            <Button
              variant="ghost"
              size="icon-lg"
              className="flex-col"
              onClick={() => seekForward(10)}
              disabled={!isReady}
            >
              <Redo className="size-4 -mb-1" />
              <span className="text-[10px] font-medium">10</span>
            </Button>
          </div>

          {/* Right column: download button */}
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <Download className="size-4" />
              Download
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};