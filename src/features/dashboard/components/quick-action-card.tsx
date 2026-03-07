/**
 * Quick Action Card Component
 *
 * Displays a single quick-action card with a gradient thumbnail,
 * title, description, and a "Try now" CTA button that navigates
 * to the TTS page with pre-filled text.
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { QuickAction } from "@/features/dashboard/data/quick-actions";
import { IconMap } from "@/features/dashboard/components/quick-actions-icons";
import { cn } from "@/lib/utils";

type QuickActionCardProps = QuickAction;

export function QuickActionCard({
  title,
  description,
  iconName,
  iconColorClass,
  hoverBorderClass,
  href,
}: QuickActionCardProps) {
  const Icon = IconMap[iconName] || ArrowRight; // Fallback icon

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col gap-4 overflow-hidden rounded-xl border bg-card p-5 transition-all duration-300",
        "hover:-translate-y-1 hover:bg-accent/50",
        hoverBorderClass
      )}
    >
      {/* Icon Container */}
      <div
        className={cn(
          "flex size-12 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110",
          iconColorClass
        )}
      >
        <Icon className="size-6" />
      </div>

      {/* Text content */}
      <div className="flex flex-1 flex-col justify-between gap-4">
        <div className="space-y-1.5">
          <h3 className="font-semibold text-foreground tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
            {description}
          </p>
        </div>
        
        {/* Footer CTA */}
        <div className="mt-auto flex items-center text-sm font-medium text-muted-foreground transition-colors group-hover:text-foreground">
          Try now
          <ArrowRight className="ml-1 size-4 transition-transform duration-300 group-hover:translate-x-1" />
        </div>
      </div>
    </Link>
  );
};