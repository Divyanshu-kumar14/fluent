/**
 * Dashboard Layout
 *
 * Wraps all dashboard pages with the collapsible sidebar and main content area.
 * Reads the sidebar state from cookies to preserve the user's collapse preference.
 */

import { cookies } from "next/headers";

import { 
  SidebarInset, 
  SidebarProvider
} from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/features/dashboard/components/dashboard-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Restore sidebar open/closed state from a cookie
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value === "true";

  return (
    <SidebarProvider defaultOpen={defaultOpen} className="h-svh">
      <DashboardSidebar />
      <SidebarInset className="min-h-0 min-w-0">
        <main className="flex min-h-0 flex-1 flex-col">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
};