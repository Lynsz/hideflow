import {
  CalendarCheck2,
  CircleCheckBig,
  ClipboardList,
  HandCoins,
  Send,
  Sparkles,
  TrendingUp,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { WEEKLY_EVOLUTION_PERIOD_OPTIONS } from "@/features/weekly-evolution/constants";
import { WeeklyActivityChart } from "@/features/weekly-evolution/components/weekly-activity-chart";
import {
  getWeeklyEvolutionWeeks,
  parseWeeklyEvolutionPeriod,
} from "@/features/weekly-evolution/services/weekly-evolution-filters";
import { getWeeklyEvolution } from "@/features/weekly-evolution/services/weekly-evolution-service";
import type {
  WeeklyEvolutionSummary,
  WeeklyEvolutionTargets,
} from "@/features/weekly-evolution/types/weekly-evolution";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Evolução semanal" };

type SummaryCard = {
  label: string;
  value: string | number;
  supportingText: string;
  icon: LucideIcon;
};

function buildSummaryCards(
  summary: WeeklyEvolutionSummary,
  weeksCount: number,
): SummaryCard[] {
  return [
    {
      label: "Semanas ativas",
      value: `${summary.activeWeeks}/${weeksCount}`,
      supportingText: "Com pelo menos um registro",
      icon: TrendingUp,
    },
    {
      label: "Revisões concluídas",
      value: `${summary.completedReviews}/${weeksCount}`,
      supportingText: "Marcações manuais no período",
      icon: CircleCheckBig,
    },
    {
      label: "Avaliação média",
      value: summary.averageRating === null ? "—" : summary.averageRating,
      supportingText: "Somente semanas avaliadas",
      icon: Sparkles,
    },
    {
      label: "Candidaturas",
      value: summary.applications,
      supportingText: "Enviadas no período",
      icon: Send,
    },
    {
      label: "Entrevistas",
      value: summary.interviews,
      supportingText: "Com resultado registrado",
      icon: UsersRound,
    },
    {
      label: "Propostas",
      value: summary.offers,
      supportingText: "Recebidas no período",
      icon: HandCoins,
    },
  ];
}

function GoalValue({ value, target }: { value: number; target: number }) {
  const reached = target > 0 && value >= target;
  return (
    <span
      className={cn(
        "tabular-nums",
        reached ? "text-emerald-300" : "text-foreground",
      )}
    >
      {value}
      {target > 0 ? (
        <span className="text-muted-foreground">/{target}</span>
      ) : null}
    </span>
  );
}

function EvolutionTable({
  weeks,
  targets,
}: {
  weeks: Awaited<ReturnType<typeof getWeeklyEvolution>>["weeks"];
  targets: WeeklyEvolutionTargets;
}) {
  return (
    <section className="border-border bg-surface mt-4 overflow-hidden rounded-xl border">
      <div className="px-5 py-4 sm:px-6">
        <h2 className="text-sm font-medium">Detalhamento por semana</h2>
        <p className="text-muted-foreground mt-1 text-xs">
          Valores exatos; as metas aparecem após a barra nas três ações de
          produtividade.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[850px] text-left text-xs">
          <thead className="bg-muted/50 text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-medium sm:px-6">Semana</th>
              <th className="px-3 py-3 font-medium">Candidaturas</th>
              <th className="px-3 py-3 font-medium">Follow-ups</th>
              <th className="px-3 py-3 font-medium">Contatos</th>
              <th className="px-3 py-3 font-medium">Entrevistas</th>
              <th className="px-3 py-3 font-medium">Propostas</th>
              <th className="px-5 py-3 font-medium sm:px-6">Revisão</th>
            </tr>
          </thead>
          <tbody className="divide-border divide-y">
            {weeks.map((week) => (
              <tr key={week.startDate}>
                <td className="px-5 py-3.5 sm:px-6">
                  <span className="font-medium">{week.label}</span>
                  {week.isCurrent ? (
                    <span className="bg-accent/10 text-accent ml-2 rounded-full px-2 py-0.5 text-[9px]">
                      atual
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-3.5">
                  <GoalValue
                    value={week.applications}
                    target={targets.applications}
                  />
                </td>
                <td className="px-3 py-3.5">
                  <GoalValue
                    value={week.followUps}
                    target={targets.followUps}
                  />
                </td>
                <td className="px-3 py-3.5">
                  <GoalValue value={week.outreach} target={targets.outreach} />
                </td>
                <td className="px-3 py-3.5 tabular-nums">{week.interviews}</td>
                <td className="px-3 py-3.5 tabular-nums">{week.offers}</td>
                <td className="px-5 py-3.5 sm:px-6">
                  <Link
                    href={`/dashboard/revisao-semanal?week=${week.startDate}`}
                    className="hover:text-accent inline-flex items-center gap-1.5 transition"
                  >
                    <CalendarCheck2
                      className={cn(
                        "size-3.5",
                        week.reviewCompleted
                          ? "text-emerald-300"
                          : "text-muted-foreground",
                      )}
                      aria-hidden="true"
                    />
                    {week.reviewCompleted ? "Concluída" : "Abrir"}
                    {week.overallRating !== null
                      ? ` · ${week.overallRating}/5`
                      : ""}
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default async function WeeklyEvolutionPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string | string[] }>;
}) {
  const [{ period: rawPeriod }, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const period = parseWeeklyEvolutionPeriod(rawPeriod);
  const weeksCount = getWeeklyEvolutionWeeks(period);
  const data = await getWeeklyEvolution(user!.id, weeksCount);
  const summaryCards = buildSummaryCards(data.summary, weeksCount);

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10">
      <header className="flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="text-muted-foreground text-xs font-medium">
            Ritmo com perspectiva
          </p>
          <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            Evolução semanal
            <TrendingUp className="text-accent size-5" aria-hidden="true" />
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Compare consistência, resultados e revisões sem transformar sua
            busca em uma corrida por volume.
          </p>
        </div>
        <Link
          href="/dashboard/revisao-semanal"
          className={buttonStyles({ variant: "secondary", size: "sm" })}
        >
          <ClipboardList className="size-4" aria-hidden="true" />
          Fazer revisão
        </Link>
      </header>

      <nav
        className="mt-6 flex flex-wrap gap-2"
        aria-label="Período da evolução"
      >
        {WEEKLY_EVOLUTION_PERIOD_OPTIONS.map((option) => (
          <Link
            key={option.value}
            href={`/dashboard/evolucao?period=${option.value}`}
            aria-current={period === option.value ? "page" : undefined}
            className={buttonStyles({
              variant: period === option.value ? "primary" : "secondary",
              size: "sm",
            })}
          >
            {option.label}
          </Link>
        ))}
      </nav>

      <section
        className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
        aria-label="Resumo do período"
      >
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.label}
              className="border-border bg-surface rounded-xl border p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-muted-foreground text-xs">{card.label}</p>
                <span className="bg-muted text-muted-foreground grid size-8 shrink-0 place-items-center rounded-lg">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-[-0.035em]">
                {card.value}
              </p>
              <p className="text-muted-foreground mt-1 text-[10px]">
                {card.supportingText}
              </p>
            </article>
          );
        })}
      </section>

      <div className="mt-4">
        <WeeklyActivityChart weeks={data.weeks} />
      </div>
      <EvolutionTable weeks={data.weeks} targets={data.targets} />
    </main>
  );
}
