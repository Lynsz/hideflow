import type { ApplicationWithCompany } from "@/features/applications/types/application";

export type MetricKey =
  | "applications"
  | "active"
  | "interviews"
  | "upcoming_interviews"
  | "offers"
  | "hired"
  | "rejected";

export type DashboardMetric = {
  key: MetricKey;
  label: string;
  value: number;
  supportingText: string;
};

export type DashboardData = {
  metrics: DashboardMetric[];
  recentApplications: ApplicationWithCompany[];
  nextInterview: {
    id: string;
    scheduled_at: string;
    type: import("@/types/database").InterviewType;
    application_id: string;
    application: { job_title: string; company: { id: string; name: string } };
  } | null;
};
