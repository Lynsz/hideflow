import type { AnalyticsPeriod, SupportedCurrency } from "@/types/database";

export const SUPPORTED_CURRENCIES = [
  "BRL",
  "USD",
  "EUR",
] as const satisfies readonly SupportedCurrency[];

export const CURRENCY_LABELS: Record<SupportedCurrency, string> = {
  BRL: "BRL — Real brasileiro",
  USD: "USD — Dólar americano",
  EUR: "EUR — Euro",
};

export const SETTINGS_ANALYTICS_PERIODS = [
  "3m",
  "6m",
  "12m",
  "all",
] as const satisfies readonly AnalyticsPeriod[];

export const SETTINGS_ANALYTICS_PERIOD_LABELS: Record<AnalyticsPeriod, string> =
  {
    "3m": "Últimos 3 meses",
    "6m": "Últimos 6 meses",
    "12m": "Últimos 12 meses",
    all: "Todo o período",
  };
