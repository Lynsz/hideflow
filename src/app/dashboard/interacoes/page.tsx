import {
  CalendarDays,
  ClipboardList,
  Linkedin,
  MessageSquareText,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { LocalDateTime } from "@/components/ui/local-date-time";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { formatActivityType } from "@/features/activities/constants";
import { parseActivityPortfolioFilter } from "@/features/activities/services/activity-portfolio-rules";
import { getActivityPortfolio } from "@/features/activities/services/activity-service";
import type { ActivityPortfolioFilter } from "@/features/activities/types/activity";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Interações" };

const FILTERS: Array<{ value: ActivityPortfolioFilter; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "outreach", label: "Contatos" },
  { value: "notes", label: "Anotações" },
  { value: "linkedin", label: "LinkedIn" },
];

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <article className="border-border bg-surface rounded-xl border p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">{label}</p>
        <Icon className="text-accent size-4" aria-hidden="true" />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{value}</p>
    </article>
  );
}

export default async function ActivitiesPage({
  searchParams,
}: PageProps<"/dashboard/interacoes">) {
  const [rawFilters, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const filter = parseActivityPortfolioFilter(rawFilters.type);
  const result = await getActivityPortfolio(user!.id, filter);

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10">
      <header>
        <p className="text-muted-foreground text-xs font-medium">
          Histórico de relacionamento
        </p>
        <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
          Central de interações
          <MessageSquareText
            className="text-accent size-5"
            aria-hidden="true"
          />
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Revise contatos e anotações de todos os processos em um só lugar.
        </p>
      </header>

      <section
        className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Resumo das interações"
      >
        <MetricCard
          label="Registros realizados"
          value={result.summary.total}
          icon={MessageSquareText}
        />
        <MetricCard
          label="Contatos enviados"
          value={result.summary.outreach}
          icon={Linkedin}
        />
        <MetricCard
          label="Processos com histórico"
          value={result.summary.applications}
          icon={ClipboardList}
        />
        <MetricCard
          label="Últimos 7 dias"
          value={result.summary.recent}
          icon={CalendarDays}
        />
      </section>

      {result.isLimited ? (
        <p className="border-border bg-muted/30 text-muted-foreground mt-3 rounded-lg border px-4 py-3 text-xs">
          A central considera as 300 interações mais recentes. Consulte a
          candidatura para revisar registros anteriores.
        </p>
      ) : null}

      <nav
        className="mt-6 flex gap-2 overflow-x-auto pb-1"
        aria-label="Filtrar interações"
      >
        {FILTERS.map((item) => (
          <Link
            key={item.value}
            href={
              item.value === "all"
                ? "/dashboard/interacoes"
                : `/dashboard/interacoes?type=${item.value}`
            }
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

      {result.items.length ? (
        <section className="mt-5 space-y-3" aria-label="Lista de interações">
          {result.items.map((activity) => (
            <article
              key={activity.id}
              className="border-border bg-surface rounded-xl border p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-muted text-muted-foreground rounded-full px-2 py-1 text-[10px]">
                      {formatActivityType(activity.activity_type)}
                    </span>
                    {activity.application.archived_at ? (
                      <span className="border-border text-muted-foreground rounded-full border px-2 py-1 text-[10px]">
                        Arquivada
                      </span>
                    ) : null}
                  </div>
                  <h2 className="mt-3 text-sm font-medium">{activity.title}</h2>
                </div>
                <LocalDateTime
                  value={activity.occurred_at}
                  className="text-muted-foreground text-xs"
                />
              </div>

              {activity.notes ? (
                <p className="text-muted-foreground mt-3 text-sm leading-6 whitespace-pre-wrap">
                  {activity.notes}
                </p>
              ) : null}

              <Link
                href={`/dashboard/candidaturas/${activity.application.id}`}
                className="text-accent mt-4 inline-block text-xs hover:underline"
              >
                {activity.application.job_title} ·{" "}
                {activity.application.company.name}
              </Link>
            </article>
          ))}
        </section>
      ) : (
        <section className="border-border bg-surface mt-5 rounded-xl border">
          <EmptyState
            title={
              filter === "all"
                ? "Nenhuma interação registrada"
                : "Nenhuma interação neste recorte"
            }
            description={
              filter === "all"
                ? "Registre contatos e anotações dentro de cada candidatura."
                : "Selecione outro filtro para revisar o histórico."
            }
          />
        </section>
      )}
    </main>
  );
}
