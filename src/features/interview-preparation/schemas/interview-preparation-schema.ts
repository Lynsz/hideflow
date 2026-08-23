import { z } from "zod";

import {
  LOGISTICS_NOTES_MAX_LENGTH,
  PREPARATION_SECTION_MAX_LENGTH,
} from "@/features/interview-preparation/constants";

const section = z
  .string()
  .trim()
  .max(
    PREPARATION_SECTION_MAX_LENGTH,
    `Use no máximo ${PREPARATION_SECTION_MAX_LENGTH} caracteres.`,
  );

export const interviewPreparationSchema = z.object({
  companyResearch: section,
  roleAlignment: section,
  starStories: section,
  questionsToAsk: section,
  logisticsNotes: z
    .string()
    .trim()
    .max(
      LOGISTICS_NOTES_MAX_LENGTH,
      `Use no máximo ${LOGISTICS_NOTES_MAX_LENGTH} caracteres.`,
    ),
});

export type InterviewPreparationValues = z.infer<
  typeof interviewPreparationSchema
>;
