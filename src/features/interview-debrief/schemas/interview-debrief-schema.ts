import { z } from "zod";

import {
  DEBRIEF_FOLLOW_UP_MAX_LENGTH,
  DEBRIEF_SECTION_MAX_LENGTH,
} from "@/features/interview-debrief/constants";

const section = z
  .string()
  .trim()
  .max(
    DEBRIEF_SECTION_MAX_LENGTH,
    `Use no máximo ${DEBRIEF_SECTION_MAX_LENGTH} caracteres.`,
  );

export const interviewDebriefSchema = z.object({
  overallRating: z.enum(["", "1", "2", "3", "4", "5"]),
  wentWell: section,
  improveNextTime: section,
  questionsReceived: section,
  followUpNotes: z
    .string()
    .trim()
    .max(
      DEBRIEF_FOLLOW_UP_MAX_LENGTH,
      `Use no máximo ${DEBRIEF_FOLLOW_UP_MAX_LENGTH} caracteres.`,
    ),
  thankYouSent: z.boolean(),
});

export type InterviewDebriefValues = z.infer<typeof interviewDebriefSchema>;
