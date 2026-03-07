/**
 * Voice Avatar Generator Hook
 *
 * Uses DiceBear's "glass" style to generate a deterministic avatar
 * data URI from a seed string. The result is memoized so re-renders
 * with the same seed don't regenerate the SVG.
 */

import { useMemo } from "react";
import { createAvatar } from "@dicebear/core";
import { glass } from "@dicebear/collection";

/** Generate a data URI for a deterministic glass-style avatar from the given seed. */
export function useVoiceAvatar(seed: string) {
  return useMemo(() => {
    return createAvatar(glass, {
      seed,
      size: 128,
    }).toDataUri();
  }, [seed]);
};