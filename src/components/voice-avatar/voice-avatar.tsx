/**
 * Voice Avatar Component
 *
 * Renders a small, deterministically-generated avatar based on a seed string.
 * Used throughout the app to visually represent voices in selectors and previews.
 */
"use client";

import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage
} from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useVoiceAvatar } from "./use-voice-avatar";

interface VoiceAvatarProps {
  /** Seed string used to deterministically generate the avatar (typically the voice ID). */
  seed: string;
  /** Display name of the voice (used for alt text and fallback initials). */
  name: string;
  className?: string;
};

export function VoiceAvatar({ 
  seed, 
  name, 
  className
}: VoiceAvatarProps) {
  const avatarUrl = useVoiceAvatar(seed);

  return (
    <Avatar
      className={cn("size-4 border-white shadow-xs", className)}
    >
      <AvatarImage src={avatarUrl} alt={name} />
      {/* Fallback: show first two initials while the avatar loads */}
      <AvatarFallback className="text-[8px]">
        {name.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
};