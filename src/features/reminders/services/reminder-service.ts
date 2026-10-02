import "server-only";

import type { ReminderFilter } from "@/features/reminders/constants";
import type { ReminderMutationValues } from "@/features/reminders/schemas/reminder-schema";
import type { ReminderPortfolioResult } from "@/features/reminders/types/reminder";
import { createClient } from "@/lib/supabase/server";

const REMINDER_LIST_LIMIT = 300;
const SEVEN_DAYS_IN_MS = 7 * 24 * 60 * 60 * 1_000;
const REMINDER_SELECT =
  "id, application_id, title, notes, due_at, completed_at, application:applications!reminders_application_owner_fkey(id, job_title, company:companies!applications_company_owner_fkey(id, name))" as const;

const emptyToNull = (value: string) => (value === "" ? null : value);

export async function getReminders(
  userId: string,
  filter: ReminderFilter,
  now = new Date().toISOString(),
): Promise<ReminderPortfolioResult> {
  const supabase = await createClient();
  const dueSoonEnd = new Date(
    new Date(now).getTime() + SEVEN_DAYS_IN_MS,
  ).toISOString();
  let query = supabase
    .from("reminders")
    .select(REMINDER_SELECT, { count: "exact" })
    .eq("user_id", userId);

  if (filter === "pending") {
    query = query.is("completed_at", null).gte("due_at", now);
  } else if (filter === "overdue") {
    query = query.is("completed_at", null).lt("due_at", now);
  } else if (filter === "completed") {
    query = query.not("completed_at", "is", null);
  }

  const [
    listResult,
    openResult,
    overdueResult,
    dueSoonResult,
    completedResult,
  ] = await Promise.all([
    query
      .order("due_at", { ascending: filter !== "completed" })
      .order("id", { ascending: true })
      .range(0, REMINDER_LIST_LIMIT - 1),
    supabase
      .from("reminders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("completed_at", null),
    supabase
      .from("reminders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("completed_at", null)
      .lt("due_at", now),
    supabase
      .from("reminders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .is("completed_at", null)
      .gte("due_at", now)
      .lte("due_at", dueSoonEnd),
    supabase
      .from("reminders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .not("completed_at", "is", null),
  ]);

  if (
    listResult.error ||
    openResult.error ||
    overdueResult.error ||
    dueSoonResult.error ||
    completedResult.error
  ) {
    throw new Error("Não foi possível carregar os lembretes.");
  }

  const total = listResult.count ?? listResult.data.length;
  return {
    items: listResult.data,
    now,
    summary: {
      open: openResult.count ?? 0,
      overdue: overdueResult.count ?? 0,
      dueSoon: dueSoonResult.count ?? 0,
      completed: completedResult.count ?? 0,
    },
    isLimited: total > listResult.data.length,
  };
}

export async function getReminderById(userId: string, reminderId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reminders")
    .select(REMINDER_SELECT)
    .eq("user_id", userId)
    .eq("id", reminderId)
    .maybeSingle();

  if (error) throw new Error("Não foi possível carregar o lembrete.");
  return data;
}

export async function getReminderApplicationOptions(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select(
      "id, job_title, company:companies!applications_company_owner_fkey(id, name)",
    )
    .eq("user_id", userId)
    .order("job_title");

  if (error) throw new Error("Não foi possível carregar as candidaturas.");
  return data;
}

export async function insertReminder(
  userId: string,
  values: ReminderMutationValues,
) {
  const supabase = await createClient();
  return supabase
    .from("reminders")
    .insert({
      user_id: userId,
      application_id: values.applicationId,
      title: values.title,
      notes: emptyToNull(values.notes),
      due_at: values.dueAt,
    })
    .select("id, application_id")
    .single();
}

export async function updateReminderRecord(
  userId: string,
  reminderId: string,
  values: ReminderMutationValues,
) {
  const supabase = await createClient();
  return supabase
    .from("reminders")
    .update({
      title: values.title,
      notes: emptyToNull(values.notes),
      due_at: values.dueAt,
    })
    .eq("user_id", userId)
    .eq("id", reminderId)
    .eq("application_id", values.applicationId)
    .select("id, application_id")
    .maybeSingle();
}

export async function setReminderCompletion(
  userId: string,
  reminderId: string,
  completed: boolean,
) {
  const supabase = await createClient();
  return supabase
    .from("reminders")
    .update({ completed_at: completed ? new Date().toISOString() : null })
    .eq("user_id", userId)
    .eq("id", reminderId)
    .select("id, application_id")
    .maybeSingle();
}

export async function deleteReminderRecord(userId: string, reminderId: string) {
  const supabase = await createClient();
  return supabase
    .from("reminders")
    .delete()
    .eq("user_id", userId)
    .eq("id", reminderId)
    .select("id, application_id")
    .maybeSingle();
}
