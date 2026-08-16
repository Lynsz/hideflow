import { CalendarClock, CircleDot, GitCommitHorizontal } from "lucide-react";
import { LocalDateTime } from "@/components/ui/local-date-time";
import type { TimelineEvent } from "@/features/applications/services/application-timeline";

export function ApplicationTimeline({ events }: { events: TimelineEvent[] }) {
  return (
    <ol className="mt-5 space-y-5">
      {events.map((event) => {
        const Icon =
          event.kind === "interview_event"
            ? CalendarClock
            : event.kind === "status_changed"
              ? GitCommitHorizontal
              : CircleDot;
        return (
          <li key={event.id} className="relative pl-8">
            <span className="bg-accent/10 text-accent absolute top-0 left-0 grid size-6 place-items-center rounded-full">
              <Icon className="size-3.5" />
            </span>
            <p className="text-sm font-medium">{event.title}</p>
            {event.description && (
              <p className="text-muted-foreground mt-1 text-xs">
                {event.description}
              </p>
            )}
            <LocalDateTime
              value={event.occurredAt}
              className="text-muted-foreground mt-1 block text-xs"
            />
          </li>
        );
      })}
    </ol>
  );
}
