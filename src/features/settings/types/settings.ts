import type { AnalyticsPeriod, SupportedCurrency } from "@/types/database";

export type UserSettings = {
  fullName: string;
  defaultCurrency: SupportedCurrency;
  analyticsPeriod: AnalyticsPeriod;
};

export type SettingsActionResult = {
  success: boolean;
  message: string;
  redirectTo?: string;
};
