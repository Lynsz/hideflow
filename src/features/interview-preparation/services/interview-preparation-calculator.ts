import {
  INTERVIEW_PREPARATION_SECTIONS,
  type InterviewPreparationSectionName,
} from "@/features/interview-preparation/constants";
import type { InterviewPreparationValues } from "@/features/interview-preparation/schemas/interview-preparation-schema";
import type { InterviewPreparationProgress } from "@/features/interview-preparation/types/interview-preparation";

export const EMPTY_INTERVIEW_PREPARATION: InterviewPreparationValues = {
  companyResearch: "",
  roleAlignment: "",
  starStories: "",
  questionsToAsk: "",
  logisticsNotes: "",
};

export function calculateInterviewPreparationProgress(
  values: InterviewPreparationValues,
): InterviewPreparationProgress {
  const completed = INTERVIEW_PREPARATION_SECTIONS.filter(
    (section) => values[section.name].trim().length > 0,
  ).length;
  const total = INTERVIEW_PREPARATION_SECTIONS.length;

  return {
    completed,
    total,
    percentage: Math.round((completed / total) * 100),
  };
}

export function getCompletedPreparationSections(
  values: InterviewPreparationValues,
): InterviewPreparationSectionName[] {
  return INTERVIEW_PREPARATION_SECTIONS.flatMap((section) =>
    values[section.name].trim() ? [section.name] : [],
  );
}
