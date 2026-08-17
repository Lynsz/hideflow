import type { ApplicationStatus } from "@/types/database";

export const ANALYTICS_PERIODS = ["3m", "6m", "12m", "all"] as const;

export const ANALYTICS_PERIOD_LABELS = {
  "3m": "Últimos 3 meses",
  "6m": "Últimos 6 meses",
  "12m": "Últimos 12 meses",
  all: "Todo o período",
} as const;

export const RESPONSE_STATUSES = [
  "screening",
  "hr_interview",
  "technical_interview",
  "technical_challenge",
  "final_interview",
  "offer",
  "hired",
  "rejected",
] as const satisfies readonly ApplicationStatus[];

export const INTERVIEW_MILESTONE_STATUSES = [
  "hr_interview",
  "technical_interview",
  "technical_challenge",
  "final_interview",
  "offer",
  "hired",
] as const satisfies readonly ApplicationStatus[];

export const OFFER_MILESTONE_STATUSES = [
  "offer",
  "hired",
] as const satisfies readonly ApplicationStatus[];
