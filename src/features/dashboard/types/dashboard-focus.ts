import type {
  PriorityItem,
  PrioritySeverity,
} from "@/features/priorities/types/priority";

export type DashboardReviewSource = {
  overall_rating: number | null;
  wins: string | null;
  challenges: string | null;
  lessons: string | null;
  next_week_focus: string | null;
  completed_at: string | null;
};

export type DashboardPrioritySummary = {
  total: number;
  counts: Record<PrioritySeverity, number>;
  preview: PriorityItem[];
  isLimited: boolean;
};

export type DashboardReviewSummary = {
  weekStart: string;
  status: "not_started" | "in_progress" | "completed";
  progress: {
    completed: number;
    total: number;
    percentage: number;
  };
  overallRating: number | null;
  nextWeekFocus: string | null;
};

export type DashboardFocusData = {
  priorities: DashboardPrioritySummary;
  review: DashboardReviewSummary;
};
