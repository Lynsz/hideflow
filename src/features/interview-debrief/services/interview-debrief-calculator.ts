import { INTERVIEW_DEBRIEF_SECTIONS } from "@/features/interview-debrief/constants";
import type { InterviewDebriefValues } from "@/features/interview-debrief/schemas/interview-debrief-schema";
import type { InterviewDebriefProgress } from "@/features/interview-debrief/types/interview-debrief";

export const EMPTY_INTERVIEW_DEBRIEF: InterviewDebriefValues = {
  overallRating: "",
  wentWell: "",
  improveNextTime: "",
  questionsReceived: "",
  followUpNotes: "",
  thankYouSent: false,
};

export function calculateInterviewDebriefProgress(
  values: InterviewDebriefValues,
): InterviewDebriefProgress {
  const completedSections = INTERVIEW_DEBRIEF_SECTIONS.filter(
    (section) => values[section.name].trim().length > 0,
  ).length;
  const completed = completedSections + (values.overallRating ? 1 : 0);
  const total = INTERVIEW_DEBRIEF_SECTIONS.length + 1;

  return {
    completed,
    total,
    percentage: Math.round((completed / total) * 100),
  };
}
