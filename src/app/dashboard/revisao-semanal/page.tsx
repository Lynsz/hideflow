import {
  BellRing,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  HandCoins,
  Send,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { calculateGoalProgress } from "@/features/goals/services/goal-calculator";
import { cn } from "@/lib/utils";
import { WeeklyReviewForm } from "@/features/weekly-review/components/weekly-review-form";
import {
  formatWeeklyReviewDate,
  parseWeeklyReviewPeriod,
  shiftWeeklyReviewPeriod,
} from "@/features/weekly-review/services/weekly-review-period";
import {
  getWeeklyReviewPageData,
  toWeeklyReviewValues,
} from "@/features/weekly-review/services/weekly-review-service";
import type { WeeklyReviewMetric } from "@/features/weekly-review/types/weekly-review";

export const metadata: Metadata = { title: "Revisão semanal" };

const METRIC_ICONS = {
  applications: Send,
  follow_ups: BellRing,
  outreach: UsersRound,
  interviews: CalendarCheck2,
  offers: HandCoins,
} satisfies Record<WeeklyReviewMetric["key"], LucideIcon>;

function MetricCard({ metric }: { metric: WeeklyReviewMetric }) {
  const Icon = METRIC_ICONS[metric.key];
  const progress =
    metric.target === null
      ? null
      : calculateGoalProgress(metric.value, metric.target);

  return (
    <article className="border-border bg-surface rounded-xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-muted-foreground text-xs">{metric.label}</p>
        <span className="bg-muted text-muted-foreground grid size-8 place-items-center rounded-lg">
          <Icon className="size-4" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-2xl font-semibold">
        {metric.value}
        {metric.target !== null ? (
          <span className="text-muted-foreground ml-1 text-xs font-normal">
            / {metric.target}
          </span>
        ) : null}
      </p>
      {progress ? (
        <>
          <div className="bg-muted mt-3 h-1.5 overflow-hidden rounded-full">
            <div
              className={cn(
                "h-full rounded-full",
                progress.state === "reached" ? "bg-emerald-400" : "bg-accent",
              )}
              style={{ width: `${progress.percentage}%` }}
              aria-hidden="true"
            />
          </div>
          <p className="text-muted-foreground mt-2 text-[10px]">
            {progress.state === "paused"
              ? "Meta pausada"
              : progress.state === "reached"
                ? "Meta alcançada"
                : `Faltam ${progress.remaining}`}
          </p>
        </>
      ) : (
        <p className="text-muted-foreground mt-2 text-[10px]">
          Resultado registrado na semana
        </p>
      )}
    </article>
  );
}

export default async function WeeklyReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string | string[] }>;
}) {
  const [{ week }, user] = await Promise.all([searchParams, getCurrentUser()]);
  const requestedWeek = typeof week === "string" ? week : week?.[0];
  const { period, currentWeekStart } = parseWeeklyReviewPeriod(requestedWeek);
  const data = await getWeeklyReviewPageData(user!.id, period);
  const previousWeek = shiftWeeklyReviewPeriod(period.startDate, -1);
  const nextWeek = shiftWeeklyReviewPeriod(period.startDate, 1);
  const endDate = new Date(
    Date.parse(period.endExclusive) - 24 * 60 * 60 * 1000,
  )
    .toISOString()
    .slice(0, 10);
  const isCurrentWeek = period.startDate === currentWeekStart;

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-muted-foreground text-xs font-medium">
            Consistência com contexto
          </p>
          <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            Revisão semanal
            <CalendarCheck2 className="text-accent size-5" aria-hidden="true" />
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Observe os resultados, registre o que aprendeu e escolha um foco
            realista para a próxima semana.
          </p>
        </div>
        <nav
          className="flex flex-wrap items-center gap-2"
          aria-label="Navegar entre semanas"
        >
          <Link
            href={`/dashboard/revisao-semanal?week=${previousWeek}`}
            className={buttonStyles({ variant: "secondary", size: "sm" })}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
            Anterior
          </Link>
          {!isCurrentWeek ? (
            <Link
              href={`/dashboard/revisao-semanal?week=${nextWeek}`}
              className={buttonStyles({ variant: "secondary", size: "sm" })}
            >
              Próxima
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          ) : null}
          {!isCurrentWeek ? (
            <Link
              href="/dashboard/revisao-semanal"
              className={buttonStyles({ variant: "ghost", size: "sm" })}
            >
              Semana atual
            </Link>
          ) : null}
        </nav>
      </header>

      <section className="border-border bg-muted/30 mt-6 rounded-xl border px-4 py-3 sm:px-5">
        <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium">
              {formatWeeklyReviewDate(period.startDate)} —{" "}
              {formatWeeklyReviewDate(endDate)}
            </p>
            <p className="text-muted-foreground mt-1 text-[11px]">
              Semana civil em UTC
            </p>
          </div>
          <span className="text-muted-foreground text-xs">
            {data.review?.completed_at
              ? "Revisão concluída"
              : data.review
                ? "Revisão em andamento"
                : "Ainda não iniciada"}
          </span>
        </div>
      </section>

      <section
        className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5"
        aria-label="Resultados da semana"
      >
        {data.metrics.map((metric) => (
          <MetricCard key={metric.key} metric={metric} />
        ))}
      </section>

      <div className="mt-4">
        <WeeklyReviewForm
          key={period.startDate}
          weekStart={period.startDate}
          defaultValues={toWeeklyReviewValues(data.review)}
          completedAt={data.review?.completed_at ?? null}
        />
      </div>
    </main>
  );
}
