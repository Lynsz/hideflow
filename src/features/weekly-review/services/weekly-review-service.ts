import "server-only";

import { OUTREACH_ACTIVITY_TYPES } from "@/features/goals/constants";
import type { WeeklyReviewValues } from "@/features/weekly-review/schemas/weekly-review-schema";
import { EMPTY_WEEKLY_REVIEW } from "@/features/weekly-review/services/weekly-review-calculator";
import type {
  WeeklyReview,
  WeeklyReviewPageData,
  WeeklyReviewPeriod,
  WeeklyReviewSaveResult,
} from "@/features/weekly-review/types/weekly-review";
import { createClient } from "@/lib/supabase/server";

const WEEKLY_REVIEW_SELECT =
  "id, user_id, week_start, overall_rating, wins, challenges, lessons, next_week_focus, completed_at, created_at, updated_at" as const;

function textToNull(value: string) {
  return value === "" ? null : value;
}

function toOverallRating(
  rating: number | null,
): WeeklyReviewValues["overallRating"] {
  switch (rating) {
    case 1:
      return "1";
    case 2:
      return "2";
    case 3:
      return "3";
    case 4:
      return "4";
    case 5:
      return "5";
    default:
      return "";
  }
}

export function toWeeklyReviewValues(
  review: WeeklyReview | null,
): WeeklyReviewValues {
  if (!review) return { ...EMPTY_WEEKLY_REVIEW };
  return {
    overallRating: toOverallRating(review.overall_rating),
    wins: review.wins ?? "",
    challenges: review.challenges ?? "",
    lessons: review.lessons ?? "",
    nextWeekFocus: review.next_week_focus ?? "",
    completed: review.completed_at !== null,
  };
}

export async function getWeeklyReviewPageData(
  userId: string,
  period: WeeklyReviewPeriod,
): Promise<WeeklyReviewPageData> {
  const supabase = await createClient();
  const profileRequest = supabase
    .from("profiles")
    .select(
      "weekly_application_target, weekly_follow_up_target, weekly_outreach_target",
    )
    .eq("id", userId)
    .single();
  const reviewRequest = supabase
    .from("weekly_reviews")
    .select(WEEKLY_REVIEW_SELECT)
    .eq("user_id", userId)
    .eq("week_start", period.startDate)
    .maybeSingle();
  const applicationsRequest = supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("applied_at", period.startDate)
    .lt("applied_at", period.endDateExclusive);
  const followUpsRequest = supabase
    .from("reminders")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("completed_at", period.start)
    .lt("completed_at", period.endExclusive);
  const outreachRequest = supabase
    .from("application_activities")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("activity_type", [...OUTREACH_ACTIVITY_TYPES])
    .gte("occurred_at", period.start)
    .lt("occurred_at", period.endExclusive);
  const interviewsRequest = supabase
    .from("interviews")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .in("result", ["completed", "passed", "failed"])
    .gte("scheduled_at", period.start)
    .lt("scheduled_at", period.endExclusive);
  const offersRequest = supabase
    .from("application_offers")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("received_at", period.startDate)
    .lt("received_at", period.endDateExclusive);

  const [
    profile,
    review,
    applications,
    followUps,
    outreach,
    interviews,
    offers,
  ] = await Promise.all([
    profileRequest,
    reviewRequest,
    applicationsRequest,
    followUpsRequest,
    outreachRequest,
    interviewsRequest,
    offersRequest,
  ]);

  if (
    profile.error ||
    !profile.data ||
    review.error ||
    applications.error ||
    followUps.error ||
    outreach.error ||
    interviews.error ||
    offers.error
  ) {
    throw new Error("Não foi possível carregar a revisão semanal.");
  }

  return {
    review: review.data,
    metrics: [
      {
        key: "applications",
        label: "Candidaturas enviadas",
        value: applications.count ?? 0,
        target: profile.data.weekly_application_target,
      },
      {
        key: "follow_ups",
        label: "Follow-ups concluídos",
        value: followUps.count ?? 0,
        target: profile.data.weekly_follow_up_target,
      },
      {
        key: "outreach",
        label: "Contatos realizados",
        value: outreach.count ?? 0,
        target: profile.data.weekly_outreach_target,
      },
      {
        key: "interviews",
        label: "Entrevistas realizadas",
        value: interviews.count ?? 0,
        target: null,
      },
      {
        key: "offers",
        label: "Propostas recebidas",
        value: offers.count ?? 0,
        target: null,
      },
    ],
  };
}

export async function saveWeeklyReviewRecord(
  userId: string,
  weekStart: string,
  values: WeeklyReviewValues,
): Promise<WeeklyReviewSaveResult> {
  const supabase = await createClient();
  const existing = await supabase
    .from("weekly_reviews")
    .select("id, completed_at")
    .eq("user_id", userId)
    .eq("week_start", weekStart)
    .maybeSingle();
  if (existing.error) return "error";

  const payload = {
    overall_rating:
      values.overallRating === "" ? null : Number(values.overallRating),
    wins: textToNull(values.wins),
    challenges: textToNull(values.challenges),
    lessons: textToNull(values.lessons),
    next_week_focus: textToNull(values.nextWeekFocus),
    completed_at: values.completed
      ? (existing.data?.completed_at ?? new Date().toISOString())
      : null,
  };
  const mutation = existing.data
    ? supabase
        .from("weekly_reviews")
        .update(payload)
        .eq("user_id", userId)
        .eq("id", existing.data.id)
        .select("id")
        .maybeSingle()
    : supabase
        .from("weekly_reviews")
        .insert({ user_id: userId, week_start: weekStart, ...payload })
        .select("id")
        .maybeSingle();
  const { data, error } = await mutation;
  return error || !data ? "error" : "saved";
}
