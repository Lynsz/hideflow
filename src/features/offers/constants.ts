import type { OfferSalaryPeriod } from "@/types/database";

export const OFFER_SALARY_PERIODS = ["monthly", "annual"] as const;

export const OFFER_SALARY_PERIOD_LABELS: Record<OfferSalaryPeriod, string> = {
  monthly: "Por mês",
  annual: "Por ano",
};
