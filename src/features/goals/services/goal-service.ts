import "server-only";

import { OUTREACH_ACTIVITY_TYPES } from "@/features/goals/constants";
import { buildProductivityWindows } from "@/features/goals/services/goal-calculator";
import type {
  ProductivityGoalsResult,
  ProductivityGoalValues,
} from "@/features/goals/types/goal";
import { createClient } from "@/lib/supabase/server";

export async function getProductivityGoals(
  userId: string,
  now = new Date().toISOString(),
): Promise<ProductivityGoalsResult> {
  const supabase = await createClient();
  const { currentWindow, previousWindow } = buildProductivityWindows(now);

  const profileRequest = supabase
    .from("profiles")
    .select(
      "weekly_application_target, weekly_follow_up_target, weekly_outreach_target",
    )
    .eq("id", userId)
    .single();

  const applicationCount = (startDate: string, endDateExclusive: string) =>
    supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("applied_at", startDate)
      .lt("applied_at", endDateExclusive);

  const followUpCount = (start: string, endExclusive: string) =>
    supabase
      .from("reminders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("completed_at", start)
      .lt("completed_at", endExclusive);

  const outreachCount = (start: string, endExclusive: string) =>
    supabase
      .from("application_activities")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .in("activity_type", [...OUTREACH_ACTIVITY_TYPES])
      .gte("occurred_at", start)
      .lt("occurred_at", endExclusive);

  const [
    profile,
    currentApplications,
    previousApplications,
    currentFollowUps,
    previousFollowUps,
    currentOutreach,
    previousOutreach,
  ] = await Promise.all([
    profileRequest,
    applicationCount(currentWindow.startDate, currentWindow.endDateExclusive),
    applicationCount(previousWindow.startDate, previousWindow.endDateExclusive),
    followUpCount(currentWindow.start, currentWindow.endExclusive),
    followUpCount(previousWindow.start, previousWindow.endExclusive),
    outreachCount(currentWindow.start, currentWindow.endExclusive),
    outreachCount(previousWindow.start, previousWindow.endExclusive),
  ]);

  const requests = [
    profile,
    currentApplications,
    previousApplications,
    currentFollowUps,
    previousFollowUps,
    currentOutreach,
    previousOutreach,
  ];
  if (requests.some((request) => request.error)) {
    throw new Error("Não foi possível carregar as metas.");
  }

  return {
    currentWindow,
    previousWindow,
    metrics: [
      {
        key: "applications",
        label: "Candidaturas enviadas",
        description: "Registros com uma data de candidatura nesta janela.",
        href: "/dashboard/candidaturas/nova",
        current: currentApplications.count ?? 0,
        previous: previousApplications.count ?? 0,
        target: profile.data!.weekly_application_target,
      },
      {
        key: "follow_ups",
        label: "Follow-ups concluídos",
        description: "Lembretes marcados como concluídos nesta janela.",
        href: "/dashboard/lembretes",
        current: currentFollowUps.count ?? 0,
        previous: previousFollowUps.count ?? 0,
        target: profile.data!.weekly_follow_up_target,
      },
      {
        key: "outreach",
        label: "Contatos realizados",
        description: "E-mails, ligações e interações no LinkedIn registradas.",
        href: "/dashboard/candidaturas",
        current: currentOutreach.count ?? 0,
        previous: previousOutreach.count ?? 0,
        target: profile.data!.weekly_outreach_target,
      },
    ],
  };
}

export async function updateProductivityGoals(
  userId: string,
  values: ProductivityGoalValues,
) {
  const supabase = await createClient();
  return supabase
    .from("profiles")
    .update({
      weekly_application_target: values.applicationsTarget,
      weekly_follow_up_target: values.followUpsTarget,
      weekly_outreach_target: values.outreachTarget,
    })
    .eq("id", userId)
    .select("id")
    .maybeSingle();
}
