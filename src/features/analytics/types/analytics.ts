import type {
  AnalyticsPeriod as DatabaseAnalyticsPeriod,
  ApplicationStatus,
} from "@/types/database";

export type AnalyticsPeriod = DatabaseAnalyticsPeriod;

export type AnalyticsFilters = {
  period: AnalyticsPeriod;
  companyId: string;
};

export type AnalyticsApplication = {
  id: string;
  company_id: string;
  status: ApplicationStatus;
  source: string | null;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  applied_at: string | null;
  created_at: string;
  company: { id: string; name: string };
};

export type AnalyticsHistory = {
  application_id: string;
  to_status: ApplicationStatus;
  created_at: string;
};

export type AnalyticsInterview = {
  application_id: string;
  created_at: string;
};

export type AnalyticsMetric = {
  key:
    | "applications"
    | "response"
    | "interview"
    | "offer"
    | "hired"
    | "response_time";
  label: string;
  value: string;
  supportingText: string;
};

export type AnalyticsBarDatum = {
  key: string;
  label: string;
  value: number;
  percentage: number;
};

export type MonthlyApplicationDatum = {
  key: string;
  label: string;
  value: number;
};

export type AnalyticsCoverageDatum = {
  key: "source" | "salary" | "applied_at" | "response_time";
  label: string;
  value: number;
  covered: number;
  total: number;
};

export type SalaryAverage = {
  currency: string;
  average: number;
  sampleSize: number;
};

export type AnalyticsData = {
  metrics: AnalyticsMetric[];
  monthlyApplications: MonthlyApplicationDatum[];
  funnel: AnalyticsBarDatum[];
  statusBreakdown: AnalyticsBarDatum[];
  sourceBreakdown: AnalyticsBarDatum[];
  salaryAverages: SalaryAverage[];
  coverage: AnalyticsCoverageDatum[];
  companies: Array<{ id: string; name: string }>;
  totalApplications: number;
  submittedApplications: number;
  periodLabel: string;
  generatedAt: string;
};
