import { BarChart3, Info } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { LocalDateTime } from "@/components/ui/local-date-time";
import { AnalyticsCoverage } from "@/features/analytics/components/analytics-coverage";
import { AnalyticsFiltersForm } from "@/features/analytics/components/analytics-filters";
import { AnalyticsMetricCard } from "@/features/analytics/components/analytics-metric-card";
import { HorizontalBarChart } from "@/features/analytics/components/horizontal-bar-chart";
import { MonthlyApplicationsChart } from "@/features/analytics/components/monthly-applications-chart";
import { SalaryAverages } from "@/features/analytics/components/salary-averages";
import { parseAnalyticsFilters } from "@/features/analytics/services/analytics-filters";
import { getAnalyticsData } from "@/features/analytics/services/analytics-service";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { getUserSettings } from "@/features/settings/services/settings-service";

export const metadata: Metadata = { title: "Analytics" };

type AnalyticsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AnalyticsPage({
  searchParams,
}: AnalyticsPageProps) {
  const [user, rawFilters] = await Promise.all([
    getCurrentUser(),
    searchParams,
  ]);
  const settings = await getUserSettings(user!.id);
  const filters = parseAnalyticsFilters(rawFilters, settings.analyticsPeriod);
  const data = await getAnalyticsData(filters);

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-muted-foreground text-xs font-medium">
            Inteligência do processo
          </p>
          <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            Analytics
            <BarChart3 className="text-accent size-5" aria-hidden="true" />
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Entenda volume, conversão e qualidade dos dados da sua busca.
          </p>
        </div>
        <p className="text-muted-foreground text-xs">
          Calculado ao carregar · <LocalDateTime value={data.generatedAt} />
        </p>
      </header>

      <AnalyticsFiltersForm filters={filters} companies={data.companies} />

      {data.totalApplications === 0 ? (
        <section className="border-border bg-surface mt-6 rounded-xl border">
          <EmptyState
            title="Nenhuma candidatura neste recorte"
            description="Ajuste os filtros ou adicione candidaturas para começar a visualizar seus indicadores."
          />
          <div className="flex justify-center pb-6">
            <Link
              href="/dashboard/candidaturas/nova"
              className={buttonStyles({ variant: "secondary" })}
            >
              Adicionar candidatura
            </Link>
          </div>
        </section>
      ) : (
        <>
          <section
            className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
            aria-label={`Indicadores de ${data.periodLabel.toLowerCase()}`}
          >
            {data.metrics.map((metric) => (
              <AnalyticsMetricCard key={metric.key} metric={metric} />
            ))}
          </section>

          <div className="mt-4 grid gap-4 xl:grid-cols-[1.45fr_1fr]">
            <MonthlyApplicationsChart data={data.monthlyApplications} />
            <HorizontalBarChart
              title="Funil de avanço"
              subtitle="Percentual sobre candidaturas enviadas; etapas posteriores contam como alcance das anteriores."
              data={data.funnel}
              emptyMessage="Ainda não há candidaturas enviadas neste recorte."
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <HorizontalBarChart
              title="Status atual"
              subtitle="Distribuição das candidaturas no recorte selecionado."
              data={data.statusBreakdown}
              emptyMessage="Nenhum status disponível."
            />
            <HorizontalBarChart
              title="Principais fontes"
              subtitle="Participação entre candidaturas que possuem fonte informada."
              data={data.sourceBreakdown}
              emptyMessage="Informe a fonte nas candidaturas para comparar canais."
            />
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <HorizontalBarChart
              title="Tecnologias mais frequentes"
              subtitle="Percentual de candidaturas do recorte vinculadas a cada tecnologia; uma candidatura pode ter várias tags."
              data={data.technologyBreakdown}
              emptyMessage="Adicione tecnologias às candidaturas para identificar as mais frequentes."
            />
            <SalaryAverages data={data.salaryAverages} />
          </div>

          <div className="mt-4">
            <AnalyticsCoverage data={data.coverage} />
          </div>

          <section className="border-border bg-surface mt-4 rounded-xl border p-5 sm:p-6">
            <div className="flex gap-3">
              <Info
                className="text-accent mt-0.5 size-4 shrink-0"
                aria-hidden="true"
              />
              <div>
                <h2 className="text-sm font-medium">Definições e limites</h2>
                <ul className="text-muted-foreground mt-3 space-y-2 text-xs leading-5">
                  <li>
                    O período considera a data em que a candidatura foi criada
                    no HireFlow.
                  </li>
                  <li>
                    A resposta começa em triagem ou em um estágio posterior,
                    incluindo rejeição; entrevista também considera registros
                    reais de entrevistas.
                  </li>
                  <li>
                    O tempo de resposta usa a data da candidatura quando
                    informada, com a criação como fallback, até o primeiro
                    evento mensurável.
                  </li>
                  <li>
                    Tecnologias vêm somente das tags estruturadas vinculadas às
                    candidaturas; nenhuma informação é inferida de descrições
                    livres.
                  </li>
                </ul>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
