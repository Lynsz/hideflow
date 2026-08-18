import {
  AlertTriangle,
  BellRing,
  CalendarClock,
  ExternalLink,
  Pencil,
} from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { LocalDateTime } from "@/components/ui/local-date-time";
import type { AgendaEvent } from "@/features/agenda/types/agenda";
import { cn } from "@/lib/utils";

export function AgendaEventCard({ event }: { event: AgendaEvent }) {
  const isInterview = event.kind === "interview";
  const Icon = isInterview ? CalendarClock : BellRing;

  return (
    <article className="border-border bg-surface rounded-xl border p-4 sm:p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex min-w-0 gap-3">
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-lg",
              isInterview
                ? "bg-blue-400/10 text-blue-300"
                : "bg-accent/10 text-accent",
            )}
          >
            <Icon className="size-4" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-medium">{event.title}</h2>
              <span className="bg-muted text-muted-foreground rounded-full px-2 py-1 text-[10px]">
                {isInterview ? "Entrevista" : "Lembrete"}
              </span>
              {event.isOverdue ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-400/10 px-2 py-1 text-[10px] text-red-300">
                  <AlertTriangle className="size-3" aria-hidden="true" />
                  Atrasado
                </span>
              ) : null}
            </div>
            <Link
              href={event.applicationHref}
              className="text-muted-foreground mt-1 block truncate text-xs hover:underline"
            >
              {event.description}
            </Link>
            <LocalDateTime
              value={event.scheduledAt}
              className="mt-3 block text-sm font-medium"
            />
            {event.meetingUrl ? (
              <a
                href={event.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="text-accent mt-2 inline-flex items-center gap-1 text-xs hover:underline"
              >
                Abrir reunião
                <ExternalLink className="size-3" aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>
        <Link
          href={event.href}
          className={buttonStyles({ variant: "ghost", size: "sm" })}
        >
          <Pencil className="size-3.5" aria-hidden="true" />
          Editar
        </Link>
      </div>
    </article>
  );
}
