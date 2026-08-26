import type {
  DEFAULT_WEEKLY_EVOLUTION_PERIOD,
  WEEKLY_EVOLUTION_METRICS,
  WEEKLY_EVOLUTION_PERIOD_OPTIONS,
} from "@/features/weekly-evolution/constants";

export type WeeklyEvolutionPeriod =
  (typeof WEEKLY_EVOLUTION_PERIOD_OPTIONS)[number]["value"];

export type DefaultWeeklyEvolutionPeriod =
  typeof DEFAULT_WEEKLY_EVOLUTION_PERIOD;

export type WeeklyEvolutionMetricKey =
  (typeof WEEKLY_EVOLUTION_METRICS)[number]["key"];

export type WeeklyEvolutionWeek = {
  startDate: string;
  label: string;
  applications: number;
  followUps: number;
  outreach: number;
  interviews: number;
  offers: number;
  totalActivity: number;
  reviewCompleted: boolean;
  overallRating: number | null;
  isCurrent: boolean;
};

export type WeeklyEvolutionTargets = {
  applications: number;
  followUps: number;
  outreach: number;
};

export type WeeklyEvolutionSummary = {
  activeWeeks: number;
  completedReviews: number;
  averageRating: number | null;
  applications: number;
  interviews: number;
  offers: number;
};

export type WeeklyEvolutionPageData = {
  weeks: WeeklyEvolutionWeek[];
  targets: WeeklyEvolutionTargets;
  summary: WeeklyEvolutionSummary;
};

export type WeeklyEvolutionSources = {
  applications: { applied_at: string | null }[];
  followUps: { completed_at: string | null }[];
  outreach: { occurred_at: string }[];
  interviews: { scheduled_at: string }[];
  offers: { received_at: string }[];
  reviews: {
    week_start: string;
    overall_rating: number | null;
    completed_at: string | null;
  }[];
};
