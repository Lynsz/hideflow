import "server-only";

import { OUTREACH_ACTIVITY_TYPES } from "@/features/goals/constants";
import { calculateWeeklyEvolution } from "@/features/weekly-evolution/services/weekly-evolution-calculator";
import type {
  WeeklyEvolutionPageData,
  WeeklyEvolutionSources,
} from "@/features/weekly-evolution/types/weekly-evolution";
import {
  parseWeeklyReviewPeriod,
  shiftWeeklyReviewPeriod,
} from "@/features/weekly-review/services/weekly-review-period";
import { createClient } from "@/lib/supabase/server";

const EVOLUTION_PAGE_SIZE = 500;

type PageResult<Row> = {
  data: Row[] | null;
  error: { message: string } | null;
};

async function fetchAllEvolutionRows<Row extends { id: string }>(
  loadPage: (cursor: string | null) => PromiseLike<PageResult<Row>>,
) {
  const rows: Row[] = [];
  let cursor: string | null = null;

  while (true) {
    const { data, error } = await loadPage(cursor);
    if (error || !data) {
      throw new Error("Não foi possível carregar a evolução semanal.");
    }
    rows.push(...data);
    if (data.length < EVOLUTION_PAGE_SIZE) return rows;
    cursor = data.at(-1)!.id;
  }
}

export async function getWeeklyEvolution(
  userId: string,
  weeksCount: number,
  now = new Date().toISOString(),
): Promise<WeeklyEvolutionPageData> {
  const supabase = await createClient();
  const currentPeriod = parseWeeklyReviewPeriod(undefined, now).period;
  const rangeStartDate = shiftWeeklyReviewPeriod(
    currentPeriod.startDate,
    -(weeksCount - 1),
  );

  const profileRequest = supabase
    .from("profiles")
    .select(
      "weekly_application_target, weekly_follow_up_target, weekly_outreach_target",
    )
    .eq("id", userId)
    .single();
  const applicationsRequest = fetchAllEvolutionRows((cursor) => {
    let request = supabase
      .from("applications")
      .select("id, applied_at")
      .eq("user_id", userId)
      .gte("applied_at", rangeStartDate)
      .lt("applied_at", currentPeriod.endDateExclusive)
      .order("id")
      .limit(EVOLUTION_PAGE_SIZE);
    if (cursor) request = request.gt("id", cursor);
    return request;
  });
  const followUpsRequest = fetchAllEvolutionRows((cursor) => {
    let request = supabase
      .from("reminders")
      .select("id, completed_at")
      .eq("user_id", userId)
      .gte("completed_at", `${rangeStartDate}T00:00:00.000Z`)
      .lt("completed_at", currentPeriod.endExclusive)
      .order("id")
      .limit(EVOLUTION_PAGE_SIZE);
    if (cursor) request = request.gt("id", cursor);
    return request;
  });
  const outreachRequest = fetchAllEvolutionRows((cursor) => {
    let request = supabase
      .from("application_activities")
      .select("id, occurred_at")
      .eq("user_id", userId)
      .in("activity_type", [...OUTREACH_ACTIVITY_TYPES])
      .gte("occurred_at", `${rangeStartDate}T00:00:00.000Z`)
      .lt("occurred_at", currentPeriod.endExclusive)
      .order("id")
      .limit(EVOLUTION_PAGE_SIZE);
    if (cursor) request = request.gt("id", cursor);
    return request;
  });
  const interviewsRequest = fetchAllEvolutionRows((cursor) => {
    let request = supabase
      .from("interviews")
      .select("id, scheduled_at")
      .eq("user_id", userId)
      .in("result", ["completed", "passed", "failed"])
      .gte("scheduled_at", `${rangeStartDate}T00:00:00.000Z`)
      .lt("scheduled_at", currentPeriod.endExclusive)
      .order("id")
      .limit(EVOLUTION_PAGE_SIZE);
    if (cursor) request = request.gt("id", cursor);
    return request;
  });
  const offersRequest = fetchAllEvolutionRows((cursor) => {
    let request = supabase
      .from("application_offers")
      .select("id, received_at")
      .eq("user_id", userId)
      .gte("received_at", rangeStartDate)
      .lt("received_at", currentPeriod.endDateExclusive)
      .order("id")
      .limit(EVOLUTION_PAGE_SIZE);
    if (cursor) request = request.gt("id", cursor);
    return request;
  });
  const reviewsRequest = fetchAllEvolutionRows((cursor) => {
    let request = supabase
      .from("weekly_reviews")
      .select("id, week_start, overall_rating, completed_at")
      .eq("user_id", userId)
      .gte("week_start", rangeStartDate)
      .lt("week_start", currentPeriod.endDateExclusive)
      .order("id")
      .limit(EVOLUTION_PAGE_SIZE);
    if (cursor) request = request.gt("id", cursor);
    return request;
  });

  const [
    profile,
    applications,
    followUps,
    outreach,
    interviews,
    offers,
    reviews,
  ] = await Promise.all([
    profileRequest,
    applicationsRequest,
    followUpsRequest,
    outreachRequest,
    interviewsRequest,
    offersRequest,
    reviewsRequest,
  ]);
  if (profile.error || !profile.data) {
    throw new Error("Não foi possível carregar a evolução semanal.");
  }

  return calculateWeeklyEvolution({
    rangeStartDate,
    weeksCount,
    targets: {
      applications: profile.data.weekly_application_target,
      followUps: profile.data.weekly_follow_up_target,
      outreach: profile.data.weekly_outreach_target,
    },
    sources: {
      applications,
      followUps,
      outreach,
      interviews,
      offers,
      reviews,
    } satisfies WeeklyEvolutionSources,
  });
}
