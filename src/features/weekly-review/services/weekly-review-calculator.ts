import { WEEKLY_REVIEW_SECTIONS } from "@/features/weekly-review/constants";
import type { WeeklyReviewValues } from "@/features/weekly-review/schemas/weekly-review-schema";
import type { WeeklyReviewProgress } from "@/features/weekly-review/types/weekly-review";

export const EMPTY_WEEKLY_REVIEW: WeeklyReviewValues = {
  overallRating: "",
  wins: "",
  challenges: "",
  lessons: "",
  nextWeekFocus: "",
  completed: false,
};

export function calculateWeeklyReviewProgress(
  values: WeeklyReviewValues,
): WeeklyReviewProgress {
  const completedSections = WEEKLY_REVIEW_SECTIONS.filter(
    (section) => values[section.name].trim().length > 0,
  ).length;
  const completed = completedSections + (values.overallRating ? 1 : 0);
  const total = WEEKLY_REVIEW_SECTIONS.length + 1;
  return {
    completed,
    total,
    percentage: Math.round((completed / total) * 100),
  };
}
