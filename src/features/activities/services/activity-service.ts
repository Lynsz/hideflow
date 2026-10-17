import "server-only";

import type { ActivityMutationValues } from "@/features/activities/schemas/activity-schema";
import {
  filterAndSortActivityPortfolio,
  summarizeActivityPortfolio,
} from "@/features/activities/services/activity-portfolio-rules";
import type {
  ActivityPortfolioFilter,
  ActivityPortfolioItem,
  ActivityPortfolioResult,
} from "@/features/activities/types/activity";
import { createClient } from "@/lib/supabase/server";

const ACTIVITY_PORTFOLIO_LIMIT = 300;
const ACTIVITY_PORTFOLIO_SELECT =
  "id, application_id, activity_type, title, notes, occurred_at, application:applications!application_activities_application_owner_fkey(id, job_title, archived_at, company:companies!applications_company_owner_fkey(id, name))" as const;

const emptyToNull = (value: string) => (value === "" ? null : value);

export async function getActivityPortfolio(
  userId: string,
  filter: ActivityPortfolioFilter,
  now = new Date().toISOString(),
): Promise<ActivityPortfolioResult> {
  const supabase = await createClient();
  const { data, count, error } = await supabase
    .from("application_activities")
    .select(ACTIVITY_PORTFOLIO_SELECT, { count: "exact" })
    .eq("user_id", userId)
    .order("occurred_at", { ascending: false })
    .order("id")
    .range(0, ACTIVITY_PORTFOLIO_LIMIT - 1);

  if (error) throw new Error("Não foi possível carregar as interações.");

  const activities = data satisfies ActivityPortfolioItem[];
  return {
    items: filterAndSortActivityPortfolio(activities, filter),
    summary: summarizeActivityPortfolio(activities, now),
    isLimited: (count ?? activities.length) > activities.length,
  };
}

export async function insertActivity(
  userId: string,
  values: ActivityMutationValues,
) {
  const supabase = await createClient();
  return supabase
    .from("application_activities")
    .insert({
      user_id: userId,
      application_id: values.applicationId,
      activity_type: values.activityType,
      title: values.title,
      notes: emptyToNull(values.notes),
      occurred_at: values.occurredAt,
    })
    .select("id, application_id")
    .single();
}

export async function deleteActivityRecord(
  userId: string,
  activityId: string,
  applicationId: string,
) {
  const supabase = await createClient();
  return supabase
    .from("application_activities")
    .delete()
    .eq("id", activityId)
    .eq("application_id", applicationId)
    .eq("user_id", userId)
    .select("id, application_id")
    .maybeSingle();
}
