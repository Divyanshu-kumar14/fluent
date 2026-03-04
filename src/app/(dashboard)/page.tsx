/**
 * Dashboard Home Page
 *
 * The default landing page after sign-in. Renders the DashboardView
 * which includes the greeting header, text input panel, and quick actions.
 */

import { DashboardView } from "@/features/dashboard/views/dashboard-view";

export default function Dashboard() {
    return <DashboardView />;
};