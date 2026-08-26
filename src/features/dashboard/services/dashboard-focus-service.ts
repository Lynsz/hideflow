import "server-only";

import { buildDashboardFocusData } from "@/features/dashboard/services/dashboard-focus-calculator";
import type { DashboardFocusData } from "@/features/dashboard/types/dashboard-focus";
import { getPriorities } from "@/features/priorities/services/priority-service";
import { parseWeeklyReviewPeriod } from "@/features/weekly-review/services/weekly-review-period";
import { createClient } from "@/lib/supabase/server";

const DASHBOARD_REVIEW_SELECT =
  "overall_rating, wins, challenges, lessons, next_week_focus, completed_at" as const;

export async function getDashboardFocus(
  userId: string,
  now = new Date().toISOString(),
): Promise<DashboardFocusData> {
  const supabase = await createClient();
  const { period } = parseWeeklyReviewPeriod(undefined, now);
  const prioritiesRequest = getPriorities(userId, now);
  const reviewRequest = supabase
    .from("weekly_reviews")
    .select(DASHBOARD_REVIEW_SELECT)
    .eq("user_id", userId)
    .eq("week_start", period.startDate)
    .maybeSingle();
  const [priorities, review] = await Promise.all([
    prioritiesRequest,
    reviewRequest,
  ]);
  if (review.error) {
    throw new Error("Não foi possível carregar o foco operacional.");
  }

  return buildDashboardFocusData({
    priorities,
    review: review.data,
    weekStart: period.startDate,
  });
}
