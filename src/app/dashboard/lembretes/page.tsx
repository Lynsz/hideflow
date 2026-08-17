import { Plus } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormFeedback } from "@/components/ui/form-feedback";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import {
  REMINDER_FILTERS,
  type ReminderFilter,
} from "@/features/reminders/constants";
import { ReminderCard } from "@/features/reminders/components/reminder-card";
import { normalizeReminderFilter } from "@/features/reminders/services/reminder-filters";
import { getReminders } from "@/features/reminders/services/reminder-service";
import { cn } from "@/lib/utils";

const feedbacks: Record<string, string> = {
  created: "Lembrete criado com sucesso.",
  updated: "Lembrete atualizado com sucesso.",
  deleted: "Lembrete excluído com sucesso.",
};

const emptyMessages: Record<
  ReminderFilter,
  { title: string; description: string }
> = {
  pending: {
    title: "Nenhum lembrete próximo",
    description:
      "Crie um follow-up para manter seus próximos passos organizados.",
  },
  overdue: {
    title: "Nenhum lembrete atrasado",
    description: "Ótimo: não há pendências fora do prazo.",
  },
  completed: {
    title: "Nenhum lembrete concluído",
    description: "Lembretes finalizados aparecerão aqui.",
  },
  all: {
    title: "Nenhum lembrete ainda",
    description: "Crie seu primeiro lembrete vinculado a uma candidatura.",
  },
};

export default async function RemindersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; feedback?: string }>;
}) {
  const [{ status, feedback = "" }, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const filter = normalizeReminderFilter(status);
  const { items, now } = await getReminders(user!.id, filter);
  const empty = emptyMessages[filter];

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-muted-foreground text-xs font-medium">
            Próximos passos
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold sm:text-3xl">
            Lembretes
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Organize follow-ups e tarefas de cada processo seletivo.
          </p>
        </div>
        <Link href="/dashboard/lembretes/novo" className={buttonStyles()}>
          <Plus className="size-4" aria-hidden="true" />
          Novo lembrete
        </Link>
      </header>

      {feedbacks[feedback] ? (
        <div className="mt-6">
          <FormFeedback kind="success" message={feedbacks[feedback]} />
        </div>
      ) : null}

      <nav
        className="mt-7 flex gap-2 overflow-x-auto pb-1"
        aria-label="Filtrar lembretes"
      >
        {REMINDER_FILTERS.map((item) => (
          <Link
            key={item.value}
            href={`/dashboard/lembretes?status=${item.value}`}
            aria-current={filter === item.value ? "page" : undefined}
            className={cn(
              "border-border shrink-0 rounded-lg border px-3 py-2 text-xs transition-colors",
              filter === item.value
                ? "bg-muted text-foreground"
                : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {items.length ? (
        <section className="mt-5 space-y-3" aria-label="Lista de lembretes">
          {items.map((reminder) => (
            <ReminderCard key={reminder.id} reminder={reminder} now={now} />
          ))}
        </section>
      ) : (
        <section className="border-border bg-surface mt-5 rounded-xl border">
          <EmptyState title={empty.title} description={empty.description} />
        </section>
      )}
    </main>
  );
}
