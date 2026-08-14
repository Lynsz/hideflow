import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarClock,
  FileCheck2,
  Plus,
  Search,
  Send,
} from "lucide-react";

import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StatusBadge } from "@/features/dashboard/components/status-badge";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { getDashboardData } from "@/features/dashboard/services/get-dashboard-data";
import type { MetricKey } from "@/features/dashboard/types/dashboard";

const metricIcons = {
  applications: BriefcaseBusiness,
  sent: Send,
  interviews: CalendarClock,
  offers: FileCheck2,
} satisfies Record<MetricKey, typeof BriefcaseBusiness>;

export default async function DashboardPage() {
  const [data, user] = await Promise.all([
    getDashboardData(),
    getCurrentUser(),
  ]);
  const firstName = user?.fullName.split(/\s+/)[0] || "Usuário";

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-muted-foreground text-xs font-medium">
              Visão geral
            </p>
            <span className="border-accent/20 bg-accent/5 text-accent rounded-full border px-2 py-0.5 text-[10px]">
              Dados de demonstração
            </span>
          </div>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            Olá, {firstName}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Aqui está o panorama da sua busca por emprego.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Buscar"
            className={buttonStyles({
              variant: "secondary",
              className: "size-10 px-0",
            })}
          >
            <Search className="size-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            disabled
            className={buttonStyles()}
            title="Disponível na próxima etapa"
          >
            <Plus className="size-4" aria-hidden="true" />
            Nova candidatura
          </button>
        </div>
      </header>

      <section
        className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Resumo das candidaturas"
      >
        {data.metrics.map((metric) => {
          const Icon = metricIcons[metric.key];

          return (
            <article
              key={metric.key}
              className="border-border bg-surface rounded-xl border p-5"
            >
              <div className="flex items-start justify-between">
                <p className="text-muted-foreground text-xs">{metric.label}</p>
                <span className="bg-muted text-muted-foreground grid size-8 place-items-center rounded-lg">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
              </div>
              <p className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
                {metric.value}
              </p>
              <p className="text-muted-foreground mt-1.5 text-[11px]">
                {metric.supportingText}
              </p>
            </article>
          );
        })}
      </section>

      <section className="mt-3 grid gap-3 xl:grid-cols-[1.5fr_1fr]">
        <article className="border-border bg-surface overflow-hidden rounded-xl border">
          <div className="border-border flex items-center justify-between border-b px-5 py-4">
            <div>
              <h2 className="text-sm font-medium">Candidaturas recentes</h2>
              <p className="text-muted-foreground mt-1 text-xs">
                Últimas movimentações no seu pipeline
              </p>
            </div>
            <span className="text-muted-foreground text-xs">Ver todas</span>
          </div>

          {data.recentApplications.length === 0 ? (
            <EmptyState
              title="Nenhuma candidatura ainda"
              description="Quando você adicionar sua primeira candidatura, ela aparecerá aqui."
            />
          ) : (
            <div className="divide-border divide-y">
              {data.recentApplications.map((application) => (
                <div
                  key={application.id}
                  className="hover:bg-muted/40 flex items-center gap-3 px-4 py-4 transition-colors sm:px-5"
                >
                  <span className="border-border bg-background text-muted-foreground grid size-9 shrink-0 place-items-center rounded-lg border text-xs font-semibold">
                    {application.company.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {application.role}
                    </p>
                    <p className="text-muted-foreground mt-0.5 truncate text-xs">
                      {application.company}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <StatusBadge status={application.status} />
                  </div>
                  <time className="text-muted-foreground hidden w-24 text-right text-[11px] lg:block">
                    {application.date}
                  </time>
                  <ArrowUpRight
                    className="text-muted-foreground size-3.5"
                    aria-hidden="true"
                  />
                </div>
              ))}
            </div>
          )}
        </article>

        <article className="border-border bg-surface rounded-xl border p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-medium">Funil de candidaturas</h2>
              <p className="text-muted-foreground mt-1 text-xs">
                Distribuição por etapa principal
              </p>
            </div>
            <span className="border-border bg-background text-muted-foreground rounded-full border px-2.5 py-1 text-[10px]">
              Agosto
            </span>
          </div>

          <div className="mt-7 space-y-5">
            {data.pipeline.map((item) => (
              <div key={item.label}>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{item.label}</span>
                  <span className="font-medium">{item.value}</span>
                </div>
                <div className="bg-muted h-1.5 overflow-hidden rounded-full">
                  <div
                    className="bg-accent h-full rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="border-border bg-background mt-7 flex items-center justify-between rounded-lg border p-3.5">
            <div>
              <p className="text-muted-foreground text-[11px]">
                Taxa de avanço
              </p>
              <p className="mt-1 text-lg font-semibold">31,2%</p>
            </div>
            <span className="bg-accent/10 text-accent rounded-md px-2 py-1 text-[11px] font-medium">
              +4,8%
            </span>
          </div>
        </article>
      </section>
    </main>
  );
}
