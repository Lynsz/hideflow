import "server-only";

import { AGENDA_EVENT_LIMIT } from "@/features/agenda/constants";
import { orderAgendaEvents } from "@/features/agenda/services/agenda-events";
import { getAgendaRange } from "@/features/agenda/services/agenda-filters";
import type {
  AgendaEvent,
  AgendaFilters,
  AgendaResult,
} from "@/features/agenda/types/agenda";
import { formatInterviewType } from "@/features/interviews/constants";
import { createClient } from "@/lib/supabase/server";

const AGENDA_INTERVIEW_SELECT =
  "id, application_id, type, scheduled_at, meeting_url, application:applications!interviews_application_owner_fkey(id, job_title, company:companies!applications_company_owner_fkey(id, name))" as const;
const AGENDA_REMINDER_SELECT =
  "id, application_id, title, due_at, application:applications!reminders_application_owner_fkey(id, job_title, company:companies!applications_company_owner_fkey(id, name))" as const;

export async function getAgendaData(
  userId: string,
  filters: AgendaFilters,
  now = new Date().toISOString(),
): Promise<AgendaResult> {
  const supabase = await createClient();
  const range = getAgendaRange(filters.period, now);
  const descending = filters.period === "overdue";

  let interviewsQuery = supabase
    .from("interviews")
    .select(AGENDA_INTERVIEW_SELECT, { count: "exact" })
    .eq("user_id", userId)
    .in("result", ["scheduled", "rescheduled"]);
  let remindersQuery = supabase
    .from("reminders")
    .select(AGENDA_REMINDER_SELECT, { count: "exact" })
    .eq("user_id", userId)
    .is("completed_at", null);

  if (range.from) {
    interviewsQuery = interviewsQuery.gte("scheduled_at", range.from);
    remindersQuery = remindersQuery.gte("due_at", range.from);
  }
  if (range.to) {
    interviewsQuery = interviewsQuery.lt("scheduled_at", range.to);
    remindersQuery = remindersQuery.lt("due_at", range.to);
  }

  const interviewsRequest =
    filters.kind === "reminder"
      ? Promise.resolve({ data: [], count: 0, error: null })
      : interviewsQuery
          .order("scheduled_at", { ascending: !descending })
          .order("id")
          .limit(AGENDA_EVENT_LIMIT);
  const remindersRequest =
    filters.kind === "interview"
      ? Promise.resolve({ data: [], count: 0, error: null })
      : remindersQuery
          .order("due_at", { ascending: !descending })
          .order("id")
          .limit(AGENDA_EVENT_LIMIT);

  const [interviews, reminders] = await Promise.all([
    interviewsRequest,
    remindersRequest,
  ]);
  if (interviews.error || reminders.error) {
    throw new Error("Não foi possível carregar a agenda.");
  }

  const interviewEvents: AgendaEvent[] = interviews.data.map((interview) => ({
    id: interview.id,
    kind: "interview",
    title: `Entrevista ${formatInterviewType(interview.type).toLowerCase()}`,
    description: `${interview.application.job_title} · ${interview.application.company.name}`,
    scheduledAt: interview.scheduled_at,
    href: `/dashboard/entrevistas/${interview.id}/editar`,
    applicationHref: `/dashboard/candidaturas/${interview.application_id}`,
    meetingUrl: interview.meeting_url,
    interviewType: interview.type,
    isOverdue: interview.scheduled_at < now,
  }));
  const reminderEvents: AgendaEvent[] = reminders.data.map((reminder) => ({
    id: reminder.id,
    kind: "reminder",
    title: reminder.title,
    description: `${reminder.application.job_title} · ${reminder.application.company.name}`,
    scheduledAt: reminder.due_at,
    href: `/dashboard/lembretes/${reminder.id}/editar`,
    applicationHref: `/dashboard/candidaturas/${reminder.application_id}`,
    meetingUrl: null,
    interviewType: null,
    isOverdue: reminder.due_at < now,
  }));
  const items = orderAgendaEvents(
    [...interviewEvents, ...reminderEvents],
    descending,
  );
  const total = (interviews.count ?? 0) + (reminders.count ?? 0);

  return {
    items,
    total,
    isLimited: total > items.length,
    now,
  };
}
