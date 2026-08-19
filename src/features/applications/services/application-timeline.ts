import { formatStatus } from "@/features/applications/services/application-formatters";
import {
  formatInterviewResult,
  formatInterviewType,
} from "@/features/interviews/constants";
import type { ApplicationHistory } from "@/features/applications/types/application";
import type { InterviewEvent } from "@/features/interviews/types/interview";
import { formatActivityType } from "@/features/activities/constants";
import type { ApplicationActivity } from "@/features/activities/types/activity";

export type TimelineEvent = {
  id: string;
  occurredAt: string;
  kind:
    | "application_created"
    | "status_changed"
    | "interview_event"
    | "manual_activity";
  title: string;
  description?: string;
  activity?: Pick<ApplicationActivity, "id" | "application_id">;
};

export function buildApplicationTimeline(
  createdAt: string,
  history: ApplicationHistory[],
  interviewEvents: InterviewEvent[],
  activities: ApplicationActivity[],
): TimelineEvent[] {
  const events: TimelineEvent[] = [
    {
      id: "application-created",
      occurredAt: createdAt,
      kind: "application_created",
      title: "Candidatura criada",
    },
  ];
  for (const item of history)
    events.push({
      id: `status-${item.id}`,
      occurredAt: item.created_at,
      kind: "status_changed",
      title: `Status alterado para ${formatStatus(item.to_status)}`,
      description: item.from_status
        ? `De ${formatStatus(item.from_status)}`
        : undefined,
    });
  for (const item of interviewEvents) {
    const interview = `Entrevista ${formatInterviewType(item.interview_type)}`;
    const titles = {
      created: `${interview} agendada`,
      rescheduled: `${interview} reagendada`,
      completed: `${interview} realizada`,
      passed: `${interview} aprovada`,
      failed: `${interview} não aprovada`,
      cancelled: `${interview} cancelada`,
    } as const;
    events.push({
      id: `interview-${item.id}`,
      occurredAt: item.created_at,
      kind: "interview_event",
      title: titles[item.event_type],
      description: item.result
        ? `Resultado: ${formatInterviewResult(item.result)}`
        : undefined,
    });
  }
  for (const item of activities)
    events.push({
      id: `activity-${item.id}`,
      occurredAt: item.occurred_at,
      kind: "manual_activity",
      title: item.title,
      description: [formatActivityType(item.activity_type), item.notes]
        .filter(Boolean)
        .join(" · "),
      activity: { id: item.id, application_id: item.application_id },
    });
  const priorities = {
    manual_activity: 3,
    interview_event: 2,
    status_changed: 1,
    application_created: 0,
  } as const;
  return events.sort(
    (a, b) =>
      new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime() ||
      priorities[b.kind] - priorities[a.kind] ||
      a.id.localeCompare(b.id),
  );
}
