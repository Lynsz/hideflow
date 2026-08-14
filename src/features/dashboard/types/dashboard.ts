import type { ApplicationWithCompany } from "@/features/applications/types/application";

export type MetricKey =
  "applications" | "active" | "interviews" | "offers" | "hired" | "rejected";

export type DashboardMetric = {
  key: MetricKey;
  label: string;
  value: number;
  supportingText: string;
};

export type DashboardData = {
  metrics: DashboardMetric[];
  recentApplications: ApplicationWithCompany[];
};
