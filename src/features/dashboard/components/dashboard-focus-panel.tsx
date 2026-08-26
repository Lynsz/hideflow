import {
  ArrowUpRight,
  CalendarCheck2,
  CircleCheckBig,
  ListChecks,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { LocalDateTime } from "@/components/ui/local-date-time";
import type { DashboardFocusData } from "@/features/dashboard/types/dashboard-focus";
import { formatOfferDate } from "@/features/offers/services/offer-formatters";
import { PRIORITY_KIND_LABELS } from "@/features/priorities/constants";
import type {
  PriorityItem,
  PrioritySeverity,
} from "@/features/priorities/types/priority";
import { cn } from "@/lib/utils";

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

const REVIEW_STATUS = {
  not_started: {
    label: "Não iniciada",
    action: "Iniciar revisão",
    style: "bg-muted text-muted-foreground",
  },
  in_progress: {
    label: "Em andamento",
    action: "Continuar revisão",
    style: "bg-amber-400/10 text-amber-300",
  },
  completed: {
    label: "Concluída",
    action: "Abrir revisão",
    style: "bg-emerald-400/10 text-emerald-300",
  },
} as const;

function PriorityDate({ item }: { item: PriorityItem }) {
  return item.dateKind === "civil" ? (
    <span>{formatOfferDate(item.scheduledAt)}</span>
  ) : (
    <LocalDateTime value={item.scheduledAt} />
  );
}

export function DashboardFocusPanel({ data }: { data: DashboardFocusData }) {
  const reviewStatus = REVIEW_STATUS[data.review.status];

  return (
    <section
      className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.75fr)]"
      aria-label="Foco operacional"
    >
      <article className="border-border bg-surface overflow-hidden rounded-xl border">
        <header className="border-border flex flex-col justify-between gap-3 border-b px-5 py-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <span className="bg-muted text-muted-foreground grid size-9 shrink-0 place-items-center rounded-lg">
              <ListChecks className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-medium">Atenção agora</h2>
              <p className="text-muted-foreground mt-1 text-xs">
                Próximos itens da fila deduplicada de prioridades.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className="rounded-full bg-red-400/10 px-2 py-1 text-red-300">
              {data.priorities.counts.critical} críticas
            </span>
            <span className="rounded-full bg-amber-400/10 px-2 py-1 text-amber-300">
              {data.priorities.counts.attention} em atenção
            </span>
          </div>
        </header>

        {data.priorities.preview.length ? (
          <div className="divide-border divide-y">
            {data.priorities.preview.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="hover:bg-muted/40 flex items-center gap-3 px-5 py-4 transition-colors"
              >
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2 py-1 text-[9px]",
                    SEVERITY_STYLES[item.severity],
                  )}
                >
                  {SEVERITY_LABELS[item.severity]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
                    {PRIORITY_KIND_LABELS[item.kind]}
                  </p>
                  <p className="mt-1 truncate text-xs font-medium">
                    {item.title}
                  </p>
                  <p className="text-muted-foreground mt-0.5 truncate text-[11px]">
                    {item.description} · <PriorityDate item={item} />
                  </p>
                </div>
                <ArrowUpRight
                  className="text-muted-foreground size-3.5 shrink-0"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-3 px-5 py-6">
            <CircleCheckBig
              className="size-5 shrink-0 text-emerald-300"
              aria-hidden="true"
            />
            <div>
              <p className="text-sm font-medium">Nenhuma prioridade agora</p>
              <p className="text-muted-foreground mt-1 text-xs">
                Seus próximos prazos e processos parados aparecerão aqui.
              </p>
            </div>
          </div>
        )}

        <footer className="border-border bg-muted/20 flex items-center justify-between gap-3 border-t px-5 py-3">
          <p className="text-muted-foreground text-[10px]">
            {data.priorities.total} itens no total
            {data.priorities.isLimited ? " · leitura limitada" : ""}
          </p>
          <Link
            href="/dashboard/prioridades"
            className="text-accent text-xs hover:underline"
          >
            Ver todas
          </Link>
        </footer>
      </article>

      <article className="border-border bg-surface rounded-xl border p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="bg-muted text-muted-foreground grid size-9 shrink-0 place-items-center rounded-lg">
              <CalendarCheck2 className="size-4" aria-hidden="true" />
            </span>
            <div>
              <h2 className="text-sm font-medium">Fechamento da semana</h2>
              <p className="text-muted-foreground mt-1 text-xs">
                Reflexão da semana civil atual.
              </p>
            </div>
          </div>
          <span
            className={cn(
              "shrink-0 rounded-full px-2 py-1 text-[10px]",
              reviewStatus.style,
            )}
          >
            {reviewStatus.label}
          </span>
        </div>

        <div className="mt-6 flex items-end justify-between gap-4">
          <div>
            <p className="text-3xl font-semibold tracking-[-0.04em]">
              {data.review.progress.percentage}%
            </p>
            <p className="text-muted-foreground mt-1 text-[11px]">
              {data.review.progress.completed} de {data.review.progress.total}{" "}
              pontos registrados
            </p>
          </div>
          {data.review.overallRating !== null ? (
            <p className="text-right text-xs">
              <span className="text-muted-foreground block text-[10px]">
                Avaliação
              </span>
              {data.review.overallRating}/5
            </p>
          ) : null}
        </div>
        <div className="bg-muted mt-3 h-2 overflow-hidden rounded-full">
          <div
            className="bg-accent h-full rounded-full"
            style={{ width: `${data.review.progress.percentage}%` }}
            role="progressbar"
            aria-label="Progresso da revisão semanal"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={data.review.progress.percentage}
          />
        </div>

        {data.review.nextWeekFocus ? (
          <div className="border-border bg-muted/25 mt-5 rounded-lg border p-3">
            <p className="text-muted-foreground text-[10px] font-medium tracking-wide uppercase">
              Foco registrado
            </p>
            <p className="mt-1.5 line-clamp-3 text-xs leading-5">
              {data.review.nextWeekFocus}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground mt-5 text-xs leading-5">
            Registre aprendizados e um foco concreto para orientar a próxima
            semana.
          </p>
        )}

        <div className="mt-5 grid gap-2 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
          <Link
            href={`/dashboard/revisao-semanal?week=${data.review.weekStart}`}
            className={buttonStyles({ size: "sm" })}
          >
            <CalendarCheck2 className="size-4" aria-hidden="true" />
            {reviewStatus.action}
          </Link>
          <Link
            href="/dashboard/evolucao"
            className={buttonStyles({ variant: "secondary", size: "sm" })}
          >
            <TrendingUp className="size-4" aria-hidden="true" />
            Ver evolução
          </Link>
        </div>
      </article>
    </section>
  );
}
