import { describe, expect, it } from "vitest";

import {
  filterAndSortWeeklyReviewPortfolio,
  parseWeeklyReviewPortfolioFilter,
  summarizeWeeklyReviewPortfolio,
} from "@/features/weekly-review/services/weekly-review-portfolio-rules";
import type { WeeklyReviewPortfolioItem } from "@/features/weekly-review/types/weekly-review-portfolio";

function review(
  id: string,
  weekStart: string,
  options: {
    completed?: boolean;
    rating?: number | null;
    focus?: string | null;
  } = {},
): WeeklyReviewPortfolioItem {
  return {
    id,
    week_start: weekStart,
    overall_rating: options.rating ?? null,
    wins: null,
    challenges: null,
    lessons: null,
    next_week_focus: options.focus ?? null,
    completed_at: options.completed ? "2026-10-19T12:00:00.000Z" : null,
  };
}

describe("weekly review portfolio rules", () => {
  const items = [
    review("old-completed", "2026-10-05", { completed: true, rating: 4 }),
    review("new-progress", "2026-10-19", { focus: "Retomar contatos" }),
    review("new-completed", "2026-10-19", {
      completed: true,
      rating: 5,
      focus: "Preparar entrevistas",
    }),
  ];

  it("normalizes URL filters", () => {
    expect(parseWeeklyReviewPortfolioFilter("completed")).toBe("completed");
    expect(parseWeeklyReviewPortfolioFilter("invalid")).toBe("all");
    expect(parseWeeklyReviewPortfolioFilter(["in_progress"])).toBe("all");
  });

  it("filters review states and keeps a deterministic newest-first order", () => {
    expect(
      filterAndSortWeeklyReviewPortfolio(items, "completed").map(
        (item) => item.id,
      ),
    ).toEqual(["new-completed", "old-completed"]);
    expect(
      filterAndSortWeeklyReviewPortfolio(items, "in_progress").map(
        (item) => item.id,
      ),
    ).toEqual(["new-progress"]);
  });

  it("summarizes completion, ratings and chosen focus", () => {
    expect(summarizeWeeklyReviewPortfolio(items)).toEqual({
      total: 3,
      completed: 2,
      rated: 2,
      focused: 2,
    });
  });
});
