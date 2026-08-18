import { AGENDA_EVENT_LIMIT } from "@/features/agenda/constants";
import type { AgendaEvent } from "@/features/agenda/types/agenda";

export function orderAgendaEvents(
  events: AgendaEvent[],
  descending = false,
  limit = AGENDA_EVENT_LIMIT,
) {
  const direction = descending ? -1 : 1;
  return events
    .toSorted(
      (left, right) =>
        left.scheduledAt.localeCompare(right.scheduledAt) * direction ||
        left.kind.localeCompare(right.kind) ||
        left.id.localeCompare(right.id),
    )
    .slice(0, limit);
}
