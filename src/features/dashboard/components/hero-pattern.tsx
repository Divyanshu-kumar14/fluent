"use client";

/**
 * Hero Pattern Component
 *
 * Renders a decorative animated wavy background behind the dashboard header.
 * Only visible on desktop (lg+) — hidden on mobile to save rendering cost.
 * Uses pointer-events-none so it doesn't interfere with interactive elements.
 */

import { useTheme } from "next-themes";
import { WavyBackground } from "@/components/ui/wavy-background";

export function HeroPattern() {
  const { theme } = useTheme();

  return (
    <div className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
      <WavyBackground
        colors={["#2DD4BF", "#22D3EE", "#38BDF8", "#818CF8"]}
        backgroundFill={theme === "dark" ? "hsl(var(--background))" : "hsl(0 0% 100%)"}
        blur={3}
        speed="slow"
        waveOpacity={0.1}
        waveWidth={60}
        waveYOffset={250}
        containerClassName="h-full"
        className="hidden"
      />
    </div>
  );
}