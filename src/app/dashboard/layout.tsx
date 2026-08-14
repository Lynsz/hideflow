import type { Metadata } from "next";
import { redirect } from "next/navigation";

import {
  DashboardMobileNavigation,
  DashboardSidebar,
} from "@/components/layout/dashboard-navigation";
import { getCurrentUser } from "@/features/auth/services/get-current-user";

export const metadata: Metadata = { title: "Dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="bg-background min-h-dvh">
      <DashboardSidebar user={user} />
      <DashboardMobileNavigation />
      <div className="pt-16 pb-16 md:ml-64 md:pt-0 md:pb-0">{children}</div>
    </div>
  );
}
