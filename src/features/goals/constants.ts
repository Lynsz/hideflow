import type { ApplicationActivityType } from "@/types/database";

export const PRODUCTIVITY_WINDOW_DAYS = 7;
export const MAX_PRODUCTIVITY_TARGET = 100;

export const OUTREACH_ACTIVITY_TYPES = [
  "email",
  "phone_call",
  "linkedin",
] as const satisfies readonly ApplicationActivityType[];
