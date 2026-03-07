/**
 * WaveSurfer.js Hook
 *
 * Manages a WaveSurfer instance for audio waveform visualisation.
 * Handles lifecycle (create, load, destroy), playback state, and seeking.
 *
 * Features:
 *   - Creates a WaveSurfer instance in a container ref.
 *   - Tracks isReady, isPlaying, currentTime, and duration.
 *   - Provides togglePlayPause, seekForward, and seekBackward actions.
 *   - Optionally auto-plays on load (catches browser autoplay blocks).
 *   - Recreates the instance when the URL or mobile state changes.
 */
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { useIsMobile } from "@/hooks/use-mobile";

interface UseWaveSurferOptions {
  /** URL of the audio file to load. */
  url?: string;
  /** Whether to auto-play once the audio is ready. */
  autoplay?: boolean;
  /** Callback fired when the audio is decoded and ready to play. */
  onReady?: () => void;
  /** Callback fired on any loading or playback error. */
  onError?: (error: Error) => void;
}



export function useWaveSurfer({
  url,
  autoplay,
  onReady,
  onError,
}: UseWaveSurferOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const isMobile = useIsMobile();

  // Store callbacks in refs so changes don't trigger effect re-runs
  const onReadyRef = useRef(onReady);
  const onErrorRef = useRef(onError);

  useEffect(() => { onReadyRef.current = onReady; }, [onReady]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // ── Create and manage the WaveSurfer instance ──
  useEffect(() => {
    if (!containerRef.current || !url) return;

    // Destroy any existing instance before creating a new one
    if (wavesurferRef.current) {
      wavesurferRef.current.destroy();
      wavesurferRef.current = null;
    }

    // Track whether the effect has been cleaned up (prevents stale callbacks)
    let destroyed = false;

    // Create a new WaveSurfer instance with styling that matches the app theme
    const ws = WaveSurfer.create({
      container: containerRef.current,
      waveColor: "rgba(255, 69, 0, 0.4)",
      progressColor: "#ff4500",
      cursorColor: "#ff4500",
      cursorWidth: 2,
      barWidth: 3,
      barGap: 3,
      barRadius: 3,
      barMinHeight: 4,
      height: "auto",
      normalize: true,
    });

    wavesurferRef.current = ws;

    // ── Event listeners ──
    ws.on("ready", () => {
      setIsReady(true);
      setDuration(ws.getDuration());

      // Catch NotAllowedError when browser blocks autoplay without user interaction
      if (autoplay) ws.play().catch(() => {});
      onReadyRef.current?.();
    });

    ws.on("play", () => setIsPlaying(true));
    ws.on("pause", () => setIsPlaying(false));
    ws.on("finish", () => setIsPlaying(false));
    ws.on("timeupdate", (time) => setCurrentTime(time));

    ws.on("error", (error) => {
      if (destroyed) return;
      console.error("WaveSurfer error:", error);
      onErrorRef.current?.(new Error(String(error)));
    });

    // Load the audio URL
    ws.load(url).catch((error) => {
      if (destroyed) return;
      console.error("WaveSurfer load error:", error);
      onErrorRef.current?.(new Error(String(error)));
    });

    // ── Cleanup ──
    return () => {
      destroyed = true;
      ws.destroy();
    };
  }, [url, autoplay, isMobile]);

  /** Toggle between play and pause. */
  const togglePlayPause = useCallback(() => {
    wavesurferRef.current?.playPause();
  }, []);

  /** Seek forward by the given number of seconds (default: 5). */
  const seekForward = useCallback((seconds = 5) => {
    const ws = wavesurferRef.current;
    if (!ws) return;
    const dur = ws.getDuration();
    if (dur <= 0) return;

    const newTime = Math.min(ws.getCurrentTime() + seconds, dur);
    ws.seekTo(newTime / dur);
  }, []);

  /** Seek backward by the given number of seconds (default: 5). */
  const seekBackward = useCallback((seconds = 5) => {
    const ws = wavesurferRef.current;
    if (!ws) return;
    const dur = ws.getDuration();
    if (dur <= 0) return;

    const newTime = Math.max(ws.getCurrentTime() - seconds, 0);
    ws.seekTo(newTime / dur);
  }, []);

  return {
    containerRef,
    isPlaying,
    isReady,
    currentTime,
    duration,
    togglePlayPause,
    seekForward,
    seekBackward,
  };
};