/**
 * Dashboard Header Component
 *
 * Displays a personalised greeting using the signed-in user's name
 * and action buttons (Feedback, Help) visible on desktop viewports.
 */
"use client";

import { useUser } from "@clerk/nextjs";
import { Headphones, ThumbsUp } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export function DashboardHeader() {
  const { isLoaded, user } = useUser();

  return (
    <div className="flex items-start justify-between">
      {/* Greeting section */}
      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Nice to see you
        </p>
        {/* Show the user's name once Clerk has loaded, with graceful fallback */}
        <h1 className="text-2xl lg:text-3xl font-semibold tracking-tight">
          {isLoaded ? (user?.fullName ?? user?.firstName ?? "there") : "..."}
        </h1>
      </div>

      {/* Action buttons — hidden on mobile */}
      <div className="lg:flex items-center gap-3 hidden">
        <ThemeToggle />
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