import type { Database } from "@/types/database";

export type InterviewPreparation =
  Database["public"]["Tables"]["interview_preparations"]["Row"];

export type InterviewPreparationProgress = {
  completed: number;
  total: number;
  percentage: number;
};

export type InterviewPreparationActionResult = {
  success: boolean;
  message: string;
};

export type InterviewPreparationSaveResult =
  | { status: "saved"; applicationId: string }
  | { status: "not_found" }
  | { status: "error" };
