import type { WeeklyReview } from "@/features/weekly-review/types/weekly-review";

export type WeeklyReviewPortfolioFilter = "all" | "completed" | "in_progress";

export type WeeklyReviewPortfolioItem = Pick<
  WeeklyReview,
  | "id"
  | "week_start"
  | "overall_rating"
  | "wins"
  | "challenges"
  | "lessons"
  | "next_week_focus"
  | "completed_at"
>;

export type WeeklyReviewPortfolioSummary = {
  total: number;
  completed: number;
  rated: number;
  focused: number;
};

export type WeeklyReviewPortfolioResult = {
  items: WeeklyReviewPortfolioItem[];
  summary: WeeklyReviewPortfolioSummary;
  isLimited: boolean;
};
