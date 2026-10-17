import type {
  ActivityPortfolioFilter,
  ActivityPortfolioItem,
  ActivityPortfolioSummary,
} from "@/features/activities/types/activity";

const FILTERS: readonly ActivityPortfolioFilter[] = [
  "all",
  "outreach",
  "notes",
  "linkedin",
];
const OUTREACH_TYPES = new Set(["email", "phone_call", "linkedin"]);
const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1_000;

function first(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

function isOutreach(item: ActivityPortfolioItem) {
  return OUTREACH_TYPES.has(item.activity_type);
}

export function parseActivityPortfolioFilter(
  value: string | string[] | undefined,
): ActivityPortfolioFilter {
  const filter = first(value);
  return FILTERS.includes(filter as ActivityPortfolioFilter)
    ? (filter as ActivityPortfolioFilter)
    : "all";
}

export function filterAndSortActivityPortfolio(
  items: ActivityPortfolioItem[],
  filter: ActivityPortfolioFilter,
) {
  return items
    .filter((item) => {
      if (filter === "all") return true;
      if (filter === "outreach") return isOutreach(item);
      if (filter === "notes") return item.activity_type === "note";
      return item.activity_type === filter;
    })
    .toSorted((left, right) => {
      const byOccurredAt = right.occurred_at.localeCompare(left.occurred_at);
      return byOccurredAt || left.id.localeCompare(right.id);
    });
}

export function summarizeActivityPortfolio(
  items: ActivityPortfolioItem[],
  now: string,
): ActivityPortfolioSummary {
  const recentStart = new Date(new Date(now).getTime() - SEVEN_DAYS_IN_MS);
  const applicationIds = new Set<string>();
  let outreach = 0;
  let recent = 0;

  for (const item of items) {
    applicationIds.add(item.application_id);
    if (isOutreach(item)) outreach += 1;
    if (new Date(item.occurred_at) >= recentStart) recent += 1;
  }

  return {
    total: items.length,
    outreach,
    applications: applicationIds.size,
    recent,
  };
}
