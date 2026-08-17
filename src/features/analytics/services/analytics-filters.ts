import { ANALYTICS_PERIODS } from "@/features/analytics/constants";
import type {
  AnalyticsFilters,
  AnalyticsPeriod,
} from "@/features/analytics/types/analytics";

type RawFilters = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function parseAnalyticsFilters(raw: RawFilters): AnalyticsFilters {
  const period = first(raw.period);
  const companyId = first(raw.company);

  return {
    period: ANALYTICS_PERIODS.includes(period as AnalyticsPeriod)
      ? (period as AnalyticsPeriod)
      : "12m",
    companyId: isUuid(companyId) ? companyId : "",
  };
}

export function buildAnalyticsUrl(filters: AnalyticsFilters) {
  const params = new URLSearchParams();
  if (filters.period !== "12m") params.set("period", filters.period);
  if (filters.companyId) params.set("company", filters.companyId);
  const query = params.toString();
  return `/dashboard/analytics${query ? `?${query}` : ""}`;
}
