import type { Metadata } from "next";

import {
  DashboardMobileNavigation,
  DashboardSidebar,
} from "@/components/layout/dashboard-navigation";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  return (
    <div className="bg-background min-h-dvh">
      <DashboardSidebar />
      <DashboardMobileNavigation />
      <div className="pt-16 pb-16 md:ml-64 md:pt-0 md:pb-0">{children}</div>
    </div>
  );
}
