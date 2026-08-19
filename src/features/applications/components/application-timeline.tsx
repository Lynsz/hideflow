import {
  CalendarClock,
  CircleDot,
  GitCommitHorizontal,
  MessageSquareText,
} from "lucide-react";
import { LocalDateTime } from "@/components/ui/local-date-time";
import { DeleteActivityButton } from "@/features/activities/components/delete-activity-button";
import type { TimelineEvent } from "@/features/applications/services/application-timeline";

export function ApplicationTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="mt-5 space-y-5">
      {events.map((event) => {
        const icons = {
          application_created: CircleDot,
          status_changed: GitCommitHorizontal,
          interview_event: CalendarClock,
          manual_activity: MessageSquareText,
        } as const;
        const Icon = icons[event.kind];
        return (
          <li key={event.id} className="relative pl-8">
            <span className="bg-accent/10 text-accent absolute top-0 left-0 grid size-6 place-items-center rounded-full">
              <Icon className="size-3.5" />
            </span>
            <p className="text-sm font-medium">{event.title}</p>
            {event.description && (
              <p className="text-muted-foreground mt-1 text-xs whitespace-pre-wrap">
                {event.description}
              </p>
            )}
            <LocalDateTime
              value={event.occurredAt}
              className="text-muted-foreground mt-1 block text-xs"
            />
            {event.activity ? (
              <DeleteActivityButton
                activityId={event.activity.id}
                applicationId={event.activity.application_id}
                title={event.title}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
