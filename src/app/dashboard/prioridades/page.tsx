import {
  AlarmClock,
  ArrowUpRight,
  BellRing,
  CalendarClock,
  CircleAlert,
  HandCoins,
  History,
  ListChecks,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LocalDateTime } from "@/components/ui/local-date-time";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { formatOfferDate } from "@/features/offers/services/offer-formatters";
import {
  PRIORITY_FILTER_LABELS,
  PRIORITY_FILTERS,
  PRIORITY_KIND_LABELS,
  type PriorityFilter,
} from "@/features/priorities/constants";
import {
  filterPriorityItems,
  normalizePriorityFilter,
} from "@/features/priorities/services/priority-rules";
import { getPriorities } from "@/features/priorities/services/priority-service";
import type {
  PriorityItem,
  PriorityKind,
  PrioritySeverity,
} from "@/features/priorities/types/priority";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Prioridades" };

const KIND_ICONS: Record<PriorityKind, LucideIcon> = {
  overdue_reminder: BellRing,
  offer_deadline: HandCoins,
  upcoming_interview: CalendarClock,
  stale_application: History,
};

const SEVERITY_LABELS: Record<PrioritySeverity, string> = {
  critical: "Crítica",
  attention: "Atenção",
  planned: "Planejada",
};

const SEVERITY_STYLES: Record<PrioritySeverity, string> = {
  critical: "bg-red-400/10 text-red-300",
  attention: "bg-amber-400/10 text-amber-300",
  planned: "bg-sky-400/10 text-sky-300",
};

const DATE_LABELS: Record<PriorityKind, string> = {
  overdue_reminder: "Prazo",
  offer_deadline: "Decisão até",
  upcoming_interview: "Agendada para",
  stale_application: "Última atualização",
};

function PriorityDate({ item }: { item: PriorityItem }) {
  return (
    <span>
      {DATE_LABELS[item.kind]}:{" "}
      {item.dateKind === "civil" ? (
        formatOfferDate(item.scheduledAt)
      ) : (
        <LocalDateTime value={item.scheduledAt} />
      )}
    </span>
  );
}

function filterHref(filter: PriorityFilter) {
  return filter === "all"
    ? "/dashboard/prioridades"
    : `/dashboard/prioridades?tipo=${filter}`;
}

export default async function PrioritiesPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string | string[] }>;
}) {
  const [{ tipo }, user] = await Promise.all([searchParams, getCurrentUser()]);
  const filter = normalizePriorityFilter(
    typeof tipo === "string" ? tipo : tipo?.[0],
  );
  const result = await getPriorities(user!.id);
  const visibleItems = filterPriorityItems(result.items, filter);
  const counts = {
    total: result.items.length,
    critical: result.items.filter((item) => item.severity === "critical")
      .length,
    attention: result.items.filter((item) => item.severity === "attention")
      .length,
    planned: result.items.filter((item) => item.severity === "planned").length,
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <header>
        <p className="text-muted-foreground text-xs font-medium">
          Foco da semana
        </p>
        <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
          Central de prioridades
          <ListChecks className="text-accent size-5" aria-hidden="true" />
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Reúna prazos e processos que pedem uma decisão ou próximo passo.
        </p>
      </header>

      <section
        className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Resumo das prioridades"
      >
        {[
          { label: "Total", value: counts.total, icon: ListChecks },
          { label: "Críticas", value: counts.critical, icon: CircleAlert },
          { label: "Atenção", value: counts.attention, icon: AlarmClock },
          { label: "Planejadas", value: counts.planned, icon: CalendarClock },
        ].map((summary) => {
          const Icon = summary.icon;
          return (
            <article
              key={summary.label}
              className="border-border bg-surface rounded-xl border p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-muted-foreground text-xs">{summary.label}</p>
                <Icon
                  className="text-muted-foreground size-4"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-3 text-2xl font-semibold">{summary.value}</p>
            </article>
          );
        })}
      </section>

      <nav
        className="mt-6 flex gap-2 overflow-x-auto pb-1"
        aria-label="Filtrar prioridades"
      >
        {PRIORITY_FILTERS.map((option) => {
          const active = filter === option;
          const count =
            option === "all"
              ? result.items.length
              : filterPriorityItems(result.items, option).length;
          return (
            <Link
              key={option}
              href={filterHref(option)}
              aria-current={active ? "page" : undefined}
              className={cn(
                "border-border shrink-0 rounded-full border px-3 py-2 text-xs transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "bg-surface text-muted-foreground hover:text-foreground",
              )}
            >
              {PRIORITY_FILTER_LABELS[option]} · {count}
            </Link>
          );
        })}
      </nav>

      {result.isLimited ? (
        <p className="border-border bg-muted/40 mt-5 rounded-lg border px-4 py-3 text-xs">
          A central atingiu o limite de leitura de uma categoria. Resolva ou
          arquive itens antigos para manter a fila objetiva.
        </p>
      ) : null}

      {visibleItems.length ? (
        <section className="mt-5 space-y-3" aria-label="Lista de prioridades">
          {visibleItems.map((item) => {
            const Icon = KIND_ICONS[item.kind];
            return (
              <article
                key={item.id}
                className="border-border bg-surface rounded-xl border p-4 sm:p-5"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 gap-3">
                    <span className="bg-muted grid size-10 shrink-0 place-items-center rounded-lg">
                      <Icon
                        className="text-muted-foreground size-4"
                        aria-hidden="true"
                      />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
                          {PRIORITY_KIND_LABELS[item.kind]}
                        </span>
                        <span
                          className={cn(
                            "rounded-full px-2 py-1 text-[10px]",
                            SEVERITY_STYLES[item.severity],
                          )}
                        >
                          {SEVERITY_LABELS[item.severity]}
                        </span>
                      </div>
                      <h2 className="mt-2 text-sm font-medium">{item.title}</h2>
                      <p className="text-muted-foreground mt-1 truncate text-xs">
                        {item.description}
                      </p>
                      <p className="text-muted-foreground mt-2 text-[11px]">
                        <PriorityDate item={item} />
                      </p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end">
                    {item.href !== item.applicationHref ? (
                      <Link
                        href={item.applicationHref}
                        className={buttonStyles({
                          variant: "ghost",
                          size: "sm",
                        })}
                      >
                        Candidatura
                      </Link>
                    ) : null}
                    <Link
                      href={item.href}
                      className={buttonStyles({
                        variant: "secondary",
                        size: "sm",
                      })}
                    >
                      Revisar
                      <ArrowUpRight className="size-3.5" aria-hidden="true" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="border-border bg-surface mt-5 rounded-xl border">
          <EmptyState
            title={
              filter === "all"
                ? "Nenhuma prioridade agora"
                : "Nenhuma prioridade neste filtro"
            }
            description={
              filter === "all"
                ? "Seus prazos próximos e processos parados aparecerão aqui."
                : "Escolha outro filtro para revisar os demais itens."
            }
          />
        </section>
      )}
    </main>
  );
}
