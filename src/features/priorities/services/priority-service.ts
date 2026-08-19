import "server-only";

import {
  PRIORITY_SOURCE_LIMIT,
  PRIORITY_OVERDUE_LOOKBACK_DAYS,
  PRIORITY_WINDOW_DAYS,
  STALE_APPLICATION_DAYS,
} from "@/features/priorities/constants";
import { buildPriorityItems } from "@/features/priorities/services/priority-rules";
import type { PriorityResult } from "@/features/priorities/types/priority";
import { ACTIVE_APPLICATION_STATUSES } from "@/features/applications/constants";
import { createClient } from "@/lib/supabase/server";

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const REMINDER_SELECT =
  "id, title, due_at, application:applications!reminders_application_owner_fkey(id, job_title, status, archived_at, company:companies!applications_company_owner_fkey(id, name))" as const;
const OFFER_SELECT =
  "id, decision_deadline, application:applications!application_offers_application_owner_fkey(id, job_title, status, archived_at, company:companies!applications_company_owner_fkey(id, name))" as const;
const INTERVIEW_SELECT =
  "id, scheduled_at, type, application:applications!interviews_application_owner_fkey(id, job_title, status, archived_at, company:companies!applications_company_owner_fkey(id, name))" as const;
const STALE_APPLICATION_SELECT =
  "id, job_title, status, archived_at, updated_at, company:companies!applications_company_owner_fkey(id, name)" as const;

export async function getPriorities(
  userId: string,
  now = new Date().toISOString(),
): Promise<PriorityResult> {
  const supabase = await createClient();
  const nowTimestamp = Date.parse(now);
  const windowEnd = new Date(
    nowTimestamp + PRIORITY_WINDOW_DAYS * DAY_IN_MS,
  ).toISOString();
  const staleCutoff = new Date(
    nowTimestamp - STALE_APPLICATION_DAYS * DAY_IN_MS,
  ).toISOString();
  const offerWindowEnd = windowEnd.slice(0, 10);
  const offerWindowStart = new Date(
    nowTimestamp - PRIORITY_OVERDUE_LOOKBACK_DAYS * DAY_IN_MS,
  )
    .toISOString()
    .slice(0, 10);

  const [reminders, offers, interviews, staleApplications] = await Promise.all([
    supabase
      .from("reminders")
      .select(REMINDER_SELECT)
      .eq("user_id", userId)
      .is("completed_at", null)
      .lt("due_at", now)
      .order("due_at")
      .limit(PRIORITY_SOURCE_LIMIT),
    supabase
      .from("application_offers")
      .select(OFFER_SELECT)
      .eq("user_id", userId)
      .not("decision_deadline", "is", null)
      .gte("decision_deadline", offerWindowStart)
      .lte("decision_deadline", offerWindowEnd)
      .order("decision_deadline")
      .limit(PRIORITY_SOURCE_LIMIT),
    supabase
      .from("interviews")
      .select(INTERVIEW_SELECT)
      .eq("user_id", userId)
      .in("result", ["scheduled", "rescheduled"])
      .gte("scheduled_at", now)
      .lt("scheduled_at", windowEnd)
      .order("scheduled_at")
      .limit(PRIORITY_SOURCE_LIMIT),
    supabase
      .from("applications")
      .select(STALE_APPLICATION_SELECT)
      .eq("user_id", userId)
      .is("archived_at", null)
      .in("status", [...ACTIVE_APPLICATION_STATUSES])
      .lt("updated_at", staleCutoff)
      .order("updated_at")
      .limit(PRIORITY_SOURCE_LIMIT),
  ]);

  if (
    reminders.error ||
    offers.error ||
    interviews.error ||
    staleApplications.error
  ) {
    throw new Error("Não foi possível carregar as prioridades.");
  }

  const offerSources = offers.data.flatMap((offer) =>
    offer.decision_deadline
      ? [{ ...offer, decision_deadline: offer.decision_deadline }]
      : [],
  );

  return {
    items: buildPriorityItems(
      {
        reminders: reminders.data,
        offers: offerSources,
        interviews: interviews.data,
        staleApplications: staleApplications.data,
      },
      now,
    ),
    now,
    isLimited: [
      reminders.data,
      offers.data,
      interviews.data,
      staleApplications.data,
    ].some((rows) => rows.length === PRIORITY_SOURCE_LIMIT),
  };
}
