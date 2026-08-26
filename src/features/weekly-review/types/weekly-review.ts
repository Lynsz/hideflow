import type { Database } from "@/types/database";

export type WeeklyReview =
  Database["public"]["Tables"]["weekly_reviews"]["Row"];

export type WeeklyReviewPeriod = {
  start: string;
  endExclusive: string;
  startDate: string;
  endDateExclusive: string;
};

export type WeeklyReviewMetric = {
  key: "applications" | "follow_ups" | "outreach" | "interviews" | "offers";
  label: string;
  value: number;
  target: number | null;
};

export type WeeklyReviewPageData = {
  review: WeeklyReview | null;
  metrics: WeeklyReviewMetric[];
};

export type WeeklyReviewActionResult = {
  success: boolean;
  message: string;
};

export type WeeklyReviewSaveResult = "saved" | "error";

export type WeeklyReviewProgress = {
  completed: number;
  total: number;
  percentage: number;
};
