import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarClock,
  CircleX,
  FileCheck2,
  Plus,
  Send,
  Trophy,
} from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { formatDate } from "@/features/applications/services/application-formatters";
import { StatusBadge } from "@/features/dashboard/components/status-badge";
import { getDashboardData } from "@/features/dashboard/services/get-dashboard-data";
import type { MetricKey } from "@/features/dashboard/types/dashboard";

const metricIcons = {
  applications: BriefcaseBusiness,
  active: Send,
  interviews: CalendarClock,
  offers: FileCheck2,
  hired: Trophy,
  rejected: CircleX,
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
          <p className="text-muted-foreground text-xs font-medium">
            Visão geral
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            Olá, {firstName}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Aqui está o panorama real da sua busca por emprego.
          </p>
        </div>
        <Link href="/dashboard/candidaturas/nova" className={buttonStyles()}>
          <Plus className="size-4" aria-hidden="true" />
          Nova candidatura
        </Link>
      </header>

      <section
        className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
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

      <section className="border-border bg-surface mt-4 overflow-hidden rounded-xl border">
        <div className="border-border flex items-center justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-sm font-medium">Candidaturas recentes</h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Últimas atualizações no pipeline
            </p>
          </div>
          <Link
            href="/dashboard/candidaturas"
            className="text-accent text-xs hover:underline"
          >
            Ver todas
          </Link>
        </div>

        {data.recentApplications.length === 0 ? (
          <EmptyState
            title="Nenhuma candidatura ainda"
            description="Quando você adicionar sua primeira candidatura, ela aparecerá aqui."
          />
        ) : (
          <div className="divide-border divide-y">
            {data.recentApplications.map((application) => (
              <Link
                key={application.id}
                href={`/dashboard/candidaturas/${application.id}`}
                className="hover:bg-muted/40 flex items-center gap-3 px-4 py-4 transition-colors sm:px-5"
              >
                <span className="border-border bg-background text-muted-foreground grid size-9 shrink-0 place-items-center rounded-lg border text-xs font-semibold">
                  {application.company.name.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {application.job_title}
                  </p>
                  <p className="text-muted-foreground mt-0.5 truncate text-xs">
                    {application.company.name}
                  </p>
                </div>
                <div className="hidden sm:block">
                  <StatusBadge status={application.status} />
                </div>
                <time className="text-muted-foreground hidden w-28 text-right text-[11px] lg:block">
                  {formatDate(application.applied_at)}
                </time>
                <ArrowUpRight
                  className="text-muted-foreground size-3.5"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
