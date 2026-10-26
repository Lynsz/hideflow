import type {
  WeeklyReviewPortfolioFilter,
  WeeklyReviewPortfolioItem,
  WeeklyReviewPortfolioSummary,
} from "@/features/weekly-review/types/weekly-review-portfolio";

const FILTERS: readonly WeeklyReviewPortfolioFilter[] = [
  "all",
  "completed",
  "in_progress",
];

function first(value: string | string[] | undefined) {
  return typeof value === "string" ? value : "";
}

export function parseWeeklyReviewPortfolioFilter(
  value: string | string[] | undefined,
): WeeklyReviewPortfolioFilter {
  const filter = first(value);
  return FILTERS.includes(filter as WeeklyReviewPortfolioFilter)
    ? (filter as WeeklyReviewPortfolioFilter)
    : "all";
}

export function filterAndSortWeeklyReviewPortfolio(
  items: WeeklyReviewPortfolioItem[],
  filter: WeeklyReviewPortfolioFilter,
) {
  return items
    .filter((item) => {
      if (filter === "all") return true;
      return filter === "completed"
        ? item.completed_at !== null
        : item.completed_at === null;
    })
    .toSorted((left, right) => {
      const byWeek = right.week_start.localeCompare(left.week_start);
      return byWeek || right.id.localeCompare(left.id);
    });
}

export function summarizeWeeklyReviewPortfolio(
  items: WeeklyReviewPortfolioItem[],
): WeeklyReviewPortfolioSummary {
  let completed = 0;
  let rated = 0;
  let focused = 0;

  for (const item of items) {
    if (item.completed_at !== null) completed += 1;
    if (item.overall_rating !== null) rated += 1;
    if (item.next_week_focus !== null) focused += 1;
  }

  return { total: items.length, completed, rated, focused };
}
