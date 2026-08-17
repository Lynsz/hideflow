import type { ReminderFilter } from "@/features/reminders/constants";
import type { Reminder } from "@/features/reminders/types/reminder";

const FILTERS = new Set<ReminderFilter>([
  "pending",
  "overdue",
  "completed",
  "all",
]);

export function normalizeReminderFilter(value?: string): ReminderFilter {
  return FILTERS.has(value as ReminderFilter)
    ? (value as ReminderFilter)
    : "pending";
}

export function getReminderState(
  reminder: Pick<Reminder, "completed_at" | "due_at">,
  now: string,
) {
  if (reminder.completed_at) return "completed" as const;
  return new Date(reminder.due_at).getTime() < new Date(now).getTime()
    ? ("overdue" as const)
    : ("pending" as const);
}
