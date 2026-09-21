import type {
  ApplicationReadinessItemKey,
  ApplicationReadinessResult,
} from "@/features/application-readiness/types/application-readiness";
import type { ApplicationStatus, InterviewResult } from "@/types/database";

export type ReadinessCenterApplicationSource = {
  id: string;
  job_title: string;
  job_url: string | null;
  description: string | null;
  notes: string | null;
  status: ApplicationStatus;
  archived_at: string | null;
  updated_at: string;
  company: { id: string; name: string };
};

export type ReadinessCenterSources = {
  applications: ReadinessCenterApplicationSource[];
  contacts: Array<{ application_id: string }>;
  technologies: Array<{ application_id: string }>;
  resumes: Array<{ application_id: string }>;
  reminders: Array<{ application_id: string }>;
  interviews: Array<{
    application_id: string;
    result: InterviewResult;
    scheduled_at: string;
  }>;
  offers: Array<{ application_id: string }>;
};

export type ReadinessCenterItem = {
  application: {
    id: string;
    jobTitle: string;
    status: ApplicationStatus;
    updatedAt: string;
    company: { id: string; name: string };
  };
  readiness: ApplicationReadinessResult;
};

export type ReadinessCenterSummary = {
  total: number;
  incomplete: number;
  ready: number;
  averagePercentage: number;
};

export type ReadinessGapFilter = ApplicationReadinessItemKey | "all";

export type ReadinessGapSummary = {
  key: ApplicationReadinessItemKey;
  label: string;
  missing: number;
  applicable: number;
  percentage: number;
};

export type ReadinessCenterResult = {
  items: ReadinessCenterItem[];
  isLimited: boolean;
};
