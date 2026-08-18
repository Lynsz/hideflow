import { CalendarDays, CalendarPlus, Download, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { inputStyles } from "@/components/ui/form-styles";
import { AgendaEventCard } from "@/features/agenda/components/agenda-event-card";
import { AGENDA_KINDS, AGENDA_PERIODS } from "@/features/agenda/constants";
import {
  buildAgendaCalendarUrl,
  parseAgendaFilters,
} from "@/features/agenda/services/agenda-filters";
import { getAgendaData } from "@/features/agenda/services/agenda-service";
import { getCurrentUser } from "@/features/auth/services/get-current-user";

export const metadata: Metadata = { title: "Agenda" };

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [rawFilters, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const filters = parseAgendaFilters(rawFilters);
  const result = await getAgendaData(user!.id, filters);
  const overdueCount = result.items.filter((item) => item.isOverdue).length;

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-muted-foreground text-xs font-medium">
            Próximos compromissos
          </p>
          <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            Agenda
            <CalendarDays className="text-accent size-5" aria-hidden="true" />
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Entrevistas agendadas e lembretes pendentes em uma única linha do
            tempo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/lembretes/novo"
            className={buttonStyles({ variant: "secondary" })}
          >
            <Plus className="size-4" aria-hidden="true" />
            Lembrete
          </Link>
          <Link href="/dashboard/entrevistas/nova" className={buttonStyles()}>
            <CalendarPlus className="size-4" aria-hidden="true" />
            Entrevista
          </Link>
        </div>
      </header>

      <form
        className="border-border bg-surface mt-6 rounded-xl border p-4"
        aria-label="Filtros da agenda"
      >
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="text-xs font-medium">
            Período
            <select
              name="period"
              defaultValue={filters.period}
              className={`${inputStyles} mt-2`}
            >
              {AGENDA_PERIODS.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-medium">
            Tipo
            <select
              name="type"
              defaultValue={filters.kind}
              className={`${inputStyles} mt-2`}
            >
              {AGENDA_KINDS.map((kind) => (
                <option key={kind.value} value={kind.value}>
                  {kind.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            className={buttonStyles({ variant: "secondary" })}
          >
            Aplicar
          </button>
        </div>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">
            {result.total} {result.total === 1 ? "item ativo" : "itens ativos"}
          </p>
          {overdueCount > 0 ? (
            <p className="mt-1 text-xs text-red-300">
              {overdueCount} {overdueCount === 1 ? "atrasado" : "atrasados"}
              {result.isLimited ? " entre os itens exibidos" : ""}
            </p>
          ) : null}
        </div>
        {result.items.length > 0 ? (
          <a
            href={buildAgendaCalendarUrl(filters)}
            download
            className={buttonStyles({ variant: "ghost", size: "sm" })}
          >
            <Download className="size-4" aria-hidden="true" />
            Baixar calendário (.ics)
          </a>
        ) : null}
      </div>

      <section className="mt-4" aria-label="Itens da agenda">
        {result.items.length > 0 ? (
          <div className="space-y-3">
            {result.items.map((event) => (
              <AgendaEventCard
                key={`${event.kind}-${event.id}`}
                event={event}
              />
            ))}
          </div>
        ) : (
          <div className="border-border bg-surface rounded-xl border">
            <EmptyState
              title="Nenhum item ativo neste recorte"
              description="Ajuste os filtros ou crie uma entrevista ou lembrete."
            />
          </div>
        )}
      </section>

      {result.isLimited ? (
        <p className="text-muted-foreground mt-4 text-center text-xs">
          Exibindo os primeiros 300 itens deste recorte. Use um período menor
          para refinar a agenda e o calendário.
        </p>
      ) : null}
    </main>
  );
}
