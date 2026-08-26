import { z } from "zod";

import {
  WEEKLY_REVIEW_FOCUS_MAX_LENGTH,
  WEEKLY_REVIEW_SECTION_MAX_LENGTH,
} from "@/features/weekly-review/constants";

const reviewText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Use no máximo ${max.toLocaleString("pt-BR")} caracteres.`);

export const weeklyReviewSchema = z.object({
  overallRating: z.enum(["", "1", "2", "3", "4", "5"]),
  wins: reviewText(WEEKLY_REVIEW_SECTION_MAX_LENGTH),
  challenges: reviewText(WEEKLY_REVIEW_SECTION_MAX_LENGTH),
  lessons: reviewText(WEEKLY_REVIEW_SECTION_MAX_LENGTH),
  nextWeekFocus: reviewText(WEEKLY_REVIEW_FOCUS_MAX_LENGTH),
  completed: z.boolean(),
});

export type WeeklyReviewValues = z.infer<typeof weeklyReviewSchema>;
