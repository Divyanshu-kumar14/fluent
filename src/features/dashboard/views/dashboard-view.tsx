/**
 * Dashboard View Component
 *
 * The main dashboard page layout that composes:
 *   - PageHeader (mobile only)
 *   - HeroPattern (decorative wavy background, desktop only)
 *   - DashboardHeader (personalised greeting)
 *   - TextInputPanel (quick text entry)
 *   - QuickActionsPanel (sample TTS use-case cards)
 */

import { PageHeader } from "@/components/page-header";
import { HeroPattern } from "@/features/dashboard/components/hero-pattern";
import { DashboardHeader } from "@/features/dashboard/components/dashboard-header";
import { TextInputPanel } from "@/features/dashboard/components/text-input-panel";
import { QuickActionsPanel } from "@/features/dashboard/components/quick-actions-panel";

export function DashboardView() {
  return (
    <div className="relative">
        {/* Mobile-only page header with sidebar trigger */}
        <PageHeader title="Dashboard" className="lg:hidden" />
      {/* Decorative animated background (desktop only) */}
      <HeroPattern />
      <div className="relative space-y-8 p-4 lg:p-16">
        <DashboardHeader />
        <TextInputPanel />
        <QuickActionsPanel />
      </div>
    </div>
  );
};