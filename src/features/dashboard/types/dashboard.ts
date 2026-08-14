export type MetricKey = "applications" | "sent" | "interviews" | "offers";

export type DashboardMetric = {
  key: MetricKey;
  label: string;
  value: number;
  supportingText: string;
};

export type PipelineItem = {
  label: string;
  value: number;
  percentage: number;
};

export type ApplicationStatus =
  "Aplicada" | "Triagem" | "Entrevista" | "Proposta";

export type RecentApplication = {
  id: string;
  company: string;
  role: string;
  status: ApplicationStatus;
  date: string;
};

export type DashboardData = {
  metrics: DashboardMetric[];
  pipeline: PipelineItem[];
  recentApplications: RecentApplication[];
};
