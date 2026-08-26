import { calculateWeeklyReviewProgress } from "@/features/weekly-review/services/weekly-review-calculator";
import type { WeeklyReviewValues } from "@/features/weekly-review/schemas/weekly-review-schema";
import type {
  DashboardFocusData,
  DashboardReviewSource,
} from "@/features/dashboard/types/dashboard-focus";
import type { PriorityResult } from "@/features/priorities/types/priority";

function toRating(value: number | null): WeeklyReviewValues["overallRating"] {
  switch (value) {
    case 1:
      return "1";
    case 2:
      return "2";
    case 3:
      return "3";
    case 4:
      return "4";
    case 5:
      return "5";
    default:
      return "";
  }
}

export function buildDashboardFocusData({
  priorities,
  review,
  weekStart,
}: {
  priorities: PriorityResult;
  review: DashboardReviewSource | null;
  weekStart: string;
}): DashboardFocusData {
  const reviewValues: WeeklyReviewValues = {
    overallRating: toRating(review?.overall_rating ?? null),
    wins: review?.wins ?? "",
    challenges: review?.challenges ?? "",
    lessons: review?.lessons ?? "",
    nextWeekFocus: review?.next_week_focus ?? "",
    completed: review?.completed_at !== null && review !== null,
  };

  return {
    priorities: {
      total: priorities.items.length,
      counts: {
        critical: priorities.items.filter(
          (item) => item.severity === "critical",
        ).length,
        attention: priorities.items.filter(
          (item) => item.severity === "attention",
        ).length,
        planned: priorities.items.filter((item) => item.severity === "planned")
          .length,
      },
      preview: priorities.items.slice(0, 3),
      isLimited: priorities.isLimited,
    },
    review: {
      weekStart,
      status: review?.completed_at
        ? "completed"
        : review
          ? "in_progress"
          : "not_started",
      progress: calculateWeeklyReviewProgress(reviewValues),
      overallRating: review?.overall_rating ?? null,
      nextWeekFocus: review?.next_week_focus ?? null,
    },
  };
}
