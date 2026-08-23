import {
  ArrowUpRight,
  BellRing,
  CheckCircle2,
  Send,
  Target,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { ProductivityGoalsForm } from "@/features/goals/components/productivity-goals-form";
import {
  calculateGoalProgress,
  formatProductivityDate,
} from "@/features/goals/services/goal-calculator";
import { getProductivityGoals } from "@/features/goals/services/goal-service";
import type {
  ProductivityMetric,
  ProductivityMetricKey,
} from "@/features/goals/types/goal";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Metas" };

const METRIC_ICONS = {
  applications: Send,
  follow_ups: BellRing,
  outreach: UsersRound,
} satisfies Record<ProductivityMetricKey, LucideIcon>;

function previousPeriodLabel(metric: ProductivityMetric) {
  const difference = metric.current - metric.previous;
  if (difference === 0) return "Mesmo ritmo da janela anterior";
  if (difference > 0) return `+${difference} em relação à janela anterior`;
  return `${Math.abs(difference)} a menos que na janela anterior`;
}

function inclusiveEndDate(endDateExclusive: string) {
  return new Date(
    Date.parse(`${endDateExclusive}T00:00:00.000Z`) - 24 * 60 * 60 * 1000,
  )
    .toISOString()
    .slice(0, 10);
}

export default async function GoalsPage() {
  const user = await getCurrentUser();
  const result = await getProductivityGoals(user!.id);
  const metricByKey = Object.fromEntries(
    result.metrics.map((metric) => [metric.key, metric]),
  ) as Record<ProductivityMetricKey, ProductivityMetric>;
  const currentEndDate = inclusiveEndDate(
    result.currentWindow.endDateExclusive,
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-muted-foreground text-xs font-medium">
            Ritmo de busca
          </p>
          <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            Metas de produtividade
            <Target className="text-accent size-5" aria-hidden="true" />
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Acompanhe ações concretas sem transformar o processo em uma corrida.
          </p>
        </div>
        <p className="border-border bg-surface text-muted-foreground rounded-full border px-3 py-2 text-xs">
          {formatProductivityDate(result.currentWindow.startDate)} —{" "}
          {formatProductivityDate(currentEndDate)}
        </p>
      </header>

      <section
        className="mt-7 grid gap-4 lg:grid-cols-3"
        aria-label="Progresso das metas"
      >
        {result.metrics.map((metric) => {
          const Icon = METRIC_ICONS[metric.key];
          const progress = calculateGoalProgress(metric.current, metric.target);

          return (
            <article
              key={metric.key}
              className="border-border bg-surface flex flex-col rounded-xl border p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-muted-foreground text-xs">
                    {metric.label}
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">
                    {metric.current}
                    <span className="text-muted-foreground ml-1.5 text-sm font-normal">
                      / {metric.target}
                    </span>
                  </p>
                </div>
                <span className="bg-muted text-muted-foreground grid size-9 shrink-0 place-items-center rounded-lg">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
              </div>

              <div className="bg-muted mt-5 h-2 overflow-hidden rounded-full">
                <div
                  className={cn(
                    "h-full rounded-full transition-[width]",
                    progress.state === "reached"
                      ? "bg-emerald-400"
                      : progress.state === "paused"
                        ? "bg-muted"
                        : "bg-accent",
                  )}
                  style={{ width: `${progress.percentage}%` }}
                  role="progressbar"
                  aria-label={`Progresso de ${metric.label}`}
                  aria-valuemin={0}
                  aria-valuemax={metric.target || 1}
                  aria-valuenow={Math.min(metric.current, metric.target || 0)}
                />
              </div>

              <div className="mt-3 min-h-9">
                <p className="text-xs font-medium">
                  {progress.state === "paused" ? (
                    "Meta pausada"
                  ) : progress.state === "reached" ? (
                    <span className="inline-flex items-center gap-1.5 text-emerald-300">
                      <CheckCircle2 className="size-3.5" aria-hidden="true" />
                      Meta alcançada
                    </span>
                  ) : (
                    `Faltam ${progress.remaining}`
                  )}
                </p>
                <p className="text-muted-foreground mt-1 text-[11px]">
                  {previousPeriodLabel(metric)}
                </p>
              </div>

              <p className="text-muted-foreground mt-4 text-xs leading-relaxed">
                {metric.description}
              </p>
              <Link
                href={metric.href}
                className={buttonStyles({
                  variant: "ghost",
                  size: "sm",
                  className: "mt-4 self-start",
                })}
              >
                Registrar ação
                <ArrowUpRight className="size-3.5" aria-hidden="true" />
              </Link>
            </article>
          );
        })}
      </section>

      <div className="mt-5 grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)]">
        <ProductivityGoalsForm
          defaultValues={{
            applicationsTarget: metricByKey.applications.target,
            followUpsTarget: metricByKey.follow_ups.target,
            outreachTarget: metricByKey.outreach.target,
          }}
        />

        <aside className="border-border bg-muted/30 rounded-xl border p-5 sm:p-6">
          <h2 className="font-medium">Como a janela funciona</h2>
          <ul className="text-muted-foreground mt-3 space-y-2 text-sm leading-relaxed">
            <li>• Hoje e os seis dias anteriores formam a janela atual.</li>
            <li>• O comparativo usa os sete dias imediatamente anteriores.</li>
            <li>
              • Os limites civis são calculados em UTC para serem estáveis.
            </li>
            <li>
              • Registros arquivados continuam contando o esforço realizado.
            </li>
          </ul>
          <p className="text-muted-foreground mt-4 text-xs">
            As metas são privadas e apenas orientativas. O HireFlow não envia
            mensagens nem altera candidaturas automaticamente.
          </p>
        </aside>
      </div>
    </main>
  );
}
