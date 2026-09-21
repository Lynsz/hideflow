import {
  ArrowUpRight,
  CheckCircle2,
  CircleAlert,
  ClipboardList,
  Gauge,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LocalDateTime } from "@/components/ui/local-date-time";
import {
  READINESS_CENTER_FILTER_LABELS,
  READINESS_CENTER_FILTERS,
  type ReadinessCenterFilter,
} from "@/features/application-readiness/constants";
import {
  filterReadinessCenterByGap,
  filterReadinessCenterItems,
  getReadinessActionGap,
  normalizeReadinessCenterFilter,
  normalizeReadinessGapFilter,
  summarizeReadinessCenter,
  summarizeReadinessGaps,
} from "@/features/application-readiness/services/readiness-center-rules";
import { getReadinessCenter } from "@/features/application-readiness/services/readiness-center-service";
import type {
  ReadinessCenterItem,
  ReadinessGapFilter,
} from "@/features/application-readiness/types/readiness-center";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { StatusBadge } from "@/features/dashboard/components/status-badge";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Prontidão" };

function filterHref(filter: ReadinessCenterFilter) {
  return filter === "all"
    ? "/dashboard/prontidao"
    : `/dashboard/prontidao?estado=${filter}`;
}

function gapHref(gap: ReadinessGapFilter) {
  return gap === "all"
    ? "/dashboard/prontidao?estado=incomplete"
    : `/dashboard/prontidao?estado=incomplete&lacuna=${gap}`;
}

function ReadinessCard({
  item,
  selectedGap,
}: {
  item: ReadinessCenterItem;
  selectedGap: ReadinessGapFilter;
}) {
  const applicationHref = `/dashboard/candidaturas/${item.application.id}`;
  const gaps = item.readiness.items.filter(
    (readinessItem) => !readinessItem.complete,
  );
  const primaryGap = getReadinessActionGap(item, selectedGap);

  return (
    <article className="border-border bg-surface rounded-xl border p-4 sm:p-5">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={item.application.status} />
            <span className="text-muted-foreground text-[10px]">
              Atualizada em <LocalDateTime value={item.application.updatedAt} />
            </span>
          </div>
          <h2 className="mt-3 text-base font-medium">
            {item.application.jobTitle}
          </h2>
          <p className="text-muted-foreground mt-1 text-xs">
            {item.application.company.name}
          </p>
        </div>

        <div className="w-full shrink-0 sm:w-48">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {item.readiness.completed}/{item.readiness.total} pontos
            </span>
            <span className="font-medium">{item.readiness.percentage}%</span>
          </div>
          <div className="bg-muted mt-2 h-2 overflow-hidden rounded-full">
            <div
              className="bg-accent h-full rounded-full"
              style={{ width: `${item.readiness.percentage}%` }}
              role="progressbar"
              aria-label={`Prontidão de ${item.application.jobTitle}`}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={item.readiness.percentage}
            />
          </div>
        </div>
      </div>

      <div className="border-border mt-5 border-t pt-4">
        {gaps.length ? (
          <>
            <div className="flex items-center gap-2">
              <CircleAlert
                className="size-4 shrink-0 text-amber-300"
                aria-hidden="true"
              />
              <p className="text-xs font-medium">
                {gaps.length} {gaps.length === 1 ? "pendência" : "pendências"}
              </p>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {gaps.slice(0, 3).map((gap) => (
                <span
                  key={gap.key}
                  className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-[11px]"
                >
                  {gap.label}
                </span>
              ))}
              {gaps.length > 3 ? (
                <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-1 text-[11px]">
                  +{gaps.length - 3}
                </span>
              ) : null}
            </div>
          </>
        ) : (
          <div className="flex items-center gap-2">
            <CheckCircle2
              className="text-accent size-4 shrink-0"
              aria-hidden="true"
            />
            <p className="text-xs font-medium">
              Registros essenciais preparados para este estágio.
            </p>
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2 sm:justify-end">
          <Link
            href={applicationHref}
            className={buttonStyles({ variant: "ghost", size: "sm" })}
          >
            Candidatura
          </Link>
          <Link
            href={primaryGap?.href ?? applicationHref}
            className={buttonStyles({ variant: "secondary", size: "sm" })}
          >
            {primaryGap
              ? selectedGap === "all"
                ? "Resolver próximo ponto"
                : `Resolver: ${primaryGap.label}`
              : "Revisar registros"}
            <ArrowUpRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function ReadinessPage({
  searchParams,
}: {
  searchParams: Promise<{
    estado?: string | string[];
    lacuna?: string | string[];
  }>;
}) {
  const [{ estado, lacuna }, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const filter = normalizeReadinessCenterFilter(
    typeof estado === "string" ? estado : estado?.[0],
  );
  const selectedGap = normalizeReadinessGapFilter(
    typeof lacuna === "string" ? lacuna : lacuna?.[0],
  );
  const result = await getReadinessCenter(user!.id);
  const summary = summarizeReadinessCenter(result.items);
  const gapSummaries = summarizeReadinessGaps(result.items);
  const visibleItems = filterReadinessCenterByGap(
    filterReadinessCenterItems(result.items, filter),
    selectedGap,
  );
  const filterCounts: Record<ReadinessCenterFilter, number> = {
    all: summary.total,
    incomplete: summary.incomplete,
    ready: summary.ready,
  };
  const summaries: Array<{
    label: string;
    value: number | string;
    icon: LucideIcon;
  }> = [
    { label: "Ativas analisadas", value: summary.total, icon: ClipboardList },
    { label: "Com pendências", value: summary.incomplete, icon: CircleAlert },
    { label: "Prontas", value: summary.ready, icon: CheckCircle2 },
    {
      label: "Média de prontidão",
      value: `${summary.averagePercentage}%`,
      icon: Gauge,
    },
  ];

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <header>
        <p className="text-muted-foreground text-xs font-medium">
          Organização do pipeline
        </p>
        <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
          Central de prontidão
          <ClipboardList className="text-accent size-5" aria-hidden="true" />
        </h1>
        <p className="text-muted-foreground mt-1.5 max-w-2xl text-sm leading-6">
          Encontre lacunas nos registros das candidaturas ativas e siga direto
          para o próximo ponto a preparar.
        </p>
      </header>

      <section
        className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
        aria-label="Resumo da prontidão"
      >
        {summaries.map((summaryItem) => {
          const Icon = summaryItem.icon;
          return (
            <article
              key={summaryItem.label}
              className="border-border bg-surface rounded-xl border p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-muted-foreground text-xs">
                  {summaryItem.label}
                </p>
                <Icon
                  className="text-muted-foreground size-4"
                  aria-hidden="true"
                />
              </div>
              <p className="mt-3 text-2xl font-semibold">{summaryItem.value}</p>
            </article>
          );
        })}
      </section>

      <p className="text-muted-foreground mt-4 text-xs leading-5">
        O percentual indica somente a completude dos registros úteis ao estágio
        atual; não avalia aderência à vaga ou chance de contratação.
      </p>

      {gapSummaries.length ? (
        <section
          className="border-border bg-surface mt-6 rounded-xl border p-5 sm:p-6"
          aria-labelledby="readiness-gaps-title"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 id="readiness-gaps-title" className="font-medium">
                Mapa de lacunas
              </h2>
              <p className="text-muted-foreground mt-1 text-xs leading-5">
                Candidaturas sem cada registro, entre as que precisam dele no
                estágio atual. Uma candidatura pode aparecer em mais de uma
                lacuna.
              </p>
            </div>
            <Link
              href={gapHref("all")}
              aria-current={selectedGap === "all" ? "true" : undefined}
              className={cn(
                "rounded-full border px-3 py-2 text-xs transition-colors",
                selectedGap === "all"
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              Todas as lacunas
            </Link>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {gapSummaries.map((gap) => {
              const active = selectedGap === gap.key;
              const content = (
                <>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-medium">{gap.label}</span>
                    <span className="text-muted-foreground shrink-0">
                      {gap.missing} de {gap.applicable}
                    </span>
                  </div>
                  <div className="bg-muted mt-3 h-2 overflow-hidden rounded-full">
                    <div
                      className="h-full rounded-full bg-amber-300"
                      style={{ width: `${gap.percentage}%` }}
                      role="progressbar"
                      aria-label={`Candidaturas sem ${gap.label.toLowerCase()}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={gap.percentage}
                    />
                  </div>
                </>
              );
              const className = cn(
                "border-border bg-muted/20 rounded-lg border p-4",
                active && "border-accent/60 bg-accent/5",
              );

              return gap.missing ? (
                <Link
                  key={gap.key}
                  href={gapHref(gap.key)}
                  aria-current={active ? "true" : undefined}
                  className={cn(
                    className,
                    "hover:border-accent/50 transition-colors",
                  )}
                >
                  {content}
                </Link>
              ) : (
                <div key={gap.key} className={className}>
                  {content}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <nav
        className="mt-6 flex gap-2 overflow-x-auto pb-1"
        aria-label="Filtrar prontidão"
      >
        {READINESS_CENTER_FILTERS.map((option) => {
          const active = option === filter;
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
              {READINESS_CENTER_FILTER_LABELS[option]} · {filterCounts[option]}
            </Link>
          );
        })}
      </nav>

      {result.isLimited ? (
        <p className="border-border bg-muted/40 mt-5 rounded-lg border px-4 py-3 text-xs">
          A central mostra as 200 candidaturas ativas menos recentes. Arquive
          processos encerrados para manter a leitura completa e objetiva.
        </p>
      ) : null}

      {visibleItems.length ? (
        <section
          className="mt-5 space-y-3"
          aria-label="Candidaturas por prontidão"
        >
          {visibleItems.map((item) => (
            <ReadinessCard
              key={item.application.id}
              item={item}
              selectedGap={selectedGap}
            />
          ))}
        </section>
      ) : (
        <section className="border-border bg-surface mt-5 rounded-xl border">
          <EmptyState
            title={
              result.items.length
                ? "Nenhuma candidatura neste filtro"
                : "Nenhuma candidatura ativa"
            }
            description={
              result.items.length
                ? "Escolha outro estado ou limpe a lacuna para revisar os processos atuais."
                : "Crie ou restaure uma candidatura para acompanhar sua prontidão."
            }
          />
        </section>
      )}
    </main>
  );
}
