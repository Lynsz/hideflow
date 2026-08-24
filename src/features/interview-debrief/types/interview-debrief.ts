import type { Database } from "@/types/database";

export type InterviewDebrief =
  Database["public"]["Tables"]["interview_debriefs"]["Row"];

export type InterviewDebriefActionResult = {
  success: boolean;
  message: string;
};

export type InterviewDebriefSaveResult =
  | { status: "saved"; applicationId: string }
  | { status: "not_found" }
  | { status: "error" };

export type InterviewDebriefProgress = {
  completed: number;
  total: number;
  percentage: number;
};
