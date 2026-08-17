import { AlertCircle, CheckCircle2, Clock3, Pencil } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { LocalDateTime } from "@/components/ui/local-date-time";
import { ReminderCardActions } from "@/features/reminders/components/reminder-card-actions";
import { getReminderState } from "@/features/reminders/services/reminder-filters";
import type { ReminderListItem } from "@/features/reminders/types/reminder";
import { cn } from "@/lib/utils";

const stateDetails = {
  pending: {
    label: "Próximo",
    icon: Clock3,
    styles: "bg-blue-400/10 text-blue-300",
  },
  overdue: {
    label: "Atrasado",
    icon: AlertCircle,
    styles: "bg-red-400/10 text-red-300",
  },
  completed: {
    label: "Concluído",
    icon: CheckCircle2,
    styles: "bg-accent/10 text-accent",
  },
} as const;

export function ReminderCard({
  reminder,
  now,
  stayOnPage = false,
}: {
  reminder: ReminderListItem;
  now: string;
  stayOnPage?: boolean;
}) {
  const state = getReminderState(reminder, now);
  const details = stateDetails[state];
  const Icon = details.icon;

  return (
    <article
      className={cn(
        "border-border bg-surface rounded-xl border p-5",
        state === "completed" && "opacity-75",
      )}
    >
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className={cn(
                "font-medium",
                state === "completed" && "line-through",
              )}
            >
              {reminder.title}
            </h3>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-full px-2 py-1 text-[10px]",
                details.styles,
              )}
            >
              <Icon className="size-3" aria-hidden="true" />
              {details.label}
            </span>
          </div>
          <Link
            className="text-muted-foreground mt-1 inline-block text-xs hover:underline"
            href={`/dashboard/candidaturas/${reminder.application_id}`}
          >
            {reminder.application.job_title} ·{" "}
            {reminder.application.company.name}
          </Link>
          <p className="mt-4 text-sm font-medium">
            Prazo: <LocalDateTime value={reminder.due_at} />
          </p>
          {reminder.notes ? (
            <p className="text-muted-foreground mt-2 max-w-2xl text-xs leading-5 whitespace-pre-wrap">
              {reminder.notes}
            </p>
          ) : null}
        </div>

        <div className="flex shrink-0 flex-col items-start gap-2 sm:items-end">
          <Link
            href={`/dashboard/lembretes/${reminder.id}/editar`}
            className={buttonStyles({ variant: "ghost", size: "sm" })}
          >
            <Pencil className="size-3.5" aria-hidden="true" />
            Editar
          </Link>
          <ReminderCardActions
            reminderId={reminder.id}
            completed={state === "completed"}
            stayOnPage={stayOnPage}
          />
        </div>
      </div>
    </article>
  );
}
