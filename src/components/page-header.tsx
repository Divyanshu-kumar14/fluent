/**
 * Page Header Component
 *
 * Shared page header used across dashboard sub-pages.
 * Renders the sidebar toggle, page title, and action buttons (Feedback, Help).
 */

import { Headphones, ThumbsUp } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  className,
}: {
  title: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-between border-b px-4 py-4",
        className,
      )}
    >
      {/* Left side: sidebar toggle + page title */}
      <div className="flex items-center gap-2">
        <SidebarTrigger />
        <h1 className="text-lg font-semibold tracking-tight">{title}</h1>
      </div>

      {/* Right side: action buttons */}
      <div className="flex items-center gap-3">
         <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ThumbsUp />
              <span className="hidden lg:block">Feedback</span>
            </Link>
         </Button>
         <Button variant="outline" size="sm" asChild>
          <Link href="/">
            <Headphones />
            <span className="hidden lg:block">Need help?</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};