/**
 * Settings Panel — History Tab (Empty State)
 *
 * Shown when a user switches to the History tab but has no past generations.
 * Displays a visual placeholder with stacked icons and a helpful message.
 */
"use client";

import { AudioLines, AudioWaveform, Clock } from "lucide-react";

export function SettingsPanelHistory() {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-2 p-8">
        {/* Decorative icon stack */}
        <div className="relative flex w-25 items-center justify-center">

          <div className="absolute left-0 -rotate-30 rounded-full bg-muted p-3">
            <AudioLines className="size-4 text-muted-foreground" />
          </div>

          <div className="relative z-10 rounded-full bg-foreground p-3">
            <AudioWaveform className="size-4 text-background" />
          </div>

          <div className="absolute right-0 rotate-30 rounded-full bg-muted p-3">
            <Clock className="size-4 text-muted-foreground" />
          </div>

        </div>
        <p className="font-semibold tracking-tight text-foreground">
          No generations yet
        </p>
        <p className="max-w-48 text-center text-xs text-muted-foreground">
          Generate some audio and it will appear here
        </p>
      </div>
    );
};