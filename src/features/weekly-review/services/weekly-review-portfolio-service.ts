import "server-only";

import {
  filterAndSortWeeklyReviewPortfolio,
  summarizeWeeklyReviewPortfolio,
} from "@/features/weekly-review/services/weekly-review-portfolio-rules";
import type {
  WeeklyReviewPortfolioFilter,
  WeeklyReviewPortfolioItem,
  WeeklyReviewPortfolioResult,
} from "@/features/weekly-review/types/weekly-review-portfolio";
import { createClient } from "@/lib/supabase/server";

const WEEKLY_REVIEW_PORTFOLIO_LIMIT = 100;
const WEEKLY_REVIEW_PORTFOLIO_SELECT =
  "id, week_start, overall_rating, wins, challenges, lessons, next_week_focus, completed_at" as const;

export async function getWeeklyReviewPortfolio(
  userId: string,
  filter: WeeklyReviewPortfolioFilter,
): Promise<WeeklyReviewPortfolioResult> {
  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("weekly_reviews")
    .select(WEEKLY_REVIEW_PORTFOLIO_SELECT, { count: "exact" })
    .eq("user_id", userId)
    .order("week_start", { ascending: false })
    .order("id", { ascending: false })
    .range(0, WEEKLY_REVIEW_PORTFOLIO_LIMIT - 1);

  if (error) throw new Error("Não foi possível carregar as revisões semanais.");

  const reviews = data satisfies WeeklyReviewPortfolioItem[];
  return {
    items: filterAndSortWeeklyReviewPortfolio(reviews, filter),
    summary: summarizeWeeklyReviewPortfolio(reviews),
    isLimited: (count ?? reviews.length) > reviews.length,
  };
}
