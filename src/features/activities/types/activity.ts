import type { Database } from "@/types/database";

export type ApplicationActivity =
  Database["public"]["Tables"]["application_activities"]["Row"];

export type ActivityPortfolioFilter = "all" | "outreach" | "notes" | "linkedin";

export type ActivityPortfolioApplication = {
  id: string;
  job_title: string;
  archived_at: string | null;
  company: {
    id: string;
    name: string;
  };
};

export type ActivityPortfolioItem = Pick<
  ApplicationActivity,
  "id" | "application_id" | "activity_type" | "title" | "notes" | "occurred_at"
> & {
  application: ActivityPortfolioApplication;
};

export type ActivityPortfolioSummary = {
  total: number;
  outreach: number;
  applications: number;
  recent: number;
};

export type ActivityPortfolioResult = {
  items: ActivityPortfolioItem[];
  summary: ActivityPortfolioSummary;
  isLimited: boolean;
};
