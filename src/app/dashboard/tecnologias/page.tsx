import { Braces, Layers3, Link2, Sparkles } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { parseTechnologyPortfolioFilter } from "@/features/technologies/services/technology-portfolio-rules";
import { getTechnologyPortfolio } from "@/features/technologies/services/technology-portfolio-service";
import type { TechnologyPortfolioFilter } from "@/features/technologies/types/technology-portfolio";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Tecnologias" };

const FILTERS: Array<{ value: TechnologyPortfolioFilter; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "active", label: "Processos ativos" },
  { value: "archived", label: "Arquivadas" },
];

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
}) {
  return (
    <article className="border-border bg-surface rounded-xl border p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">{label}</p>
        <Icon className="text-accent size-4" aria-hidden="true" />
      </div>
      <p className="mt-3 truncate text-2xl font-semibold tracking-[-0.04em]">
        {value}
      </p>
    </article>
  );
}

export default async function TechnologiesPage({
  searchParams,
}: PageProps<"/dashboard/tecnologias">) {
  const [rawFilters, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const filter = parseTechnologyPortfolioFilter(rawFilters.status);
  const result = await getTechnologyPortfolio(user!.id, filter);

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10">
      <header>
        <p className="text-muted-foreground text-xs font-medium">
          Competências mapeadas
        </p>
        <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
          Portfólio de tecnologias
          <Braces className="text-accent size-5" aria-hidden="true" />
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Identifique as tecnologias recorrentes e os processos onde elas são
          pedidas.
        </p>
      </header>

      <section
        className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Resumo das tecnologias"
      >
        <MetricCard
          label="Tecnologias mapeadas"
          value={result.summary.technologies}
          icon={Braces}
        />
        <MetricCard
          label="Vínculos registrados"
          value={result.summary.links}
          icon={Link2}
        />
        <MetricCard
          label="Processos ativos com tags"
          value={result.summary.activeApplications}
          icon={Layers3}
        />
        <MetricCard
          label="Mais recorrente"
          value={result.summary.topTechnology ?? "—"}
          icon={Sparkles}
        />
      </section>

      {result.isLimited ? (
        <p className="border-border bg-muted/30 text-muted-foreground mt-3 rounded-lg border px-4 py-3 text-xs">
          O portfólio considera os 300 vínculos mais recentes. Consulte cada
          candidatura para revisar tags anteriores.
        </p>
      ) : null}

      <nav
        className="mt-6 flex gap-2 overflow-x-auto pb-1"
        aria-label="Filtrar tecnologias"
      >
        {FILTERS.map((item) => (
          <Link
            key={item.value}
            href={
              item.value === "all"
                ? "/dashboard/tecnologias"
                : `/dashboard/tecnologias?status=${item.value}`
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
        <section
          className="mt-5 grid gap-3 lg:grid-cols-2"
          aria-label="Lista de tecnologias"
        >
          {result.items.map((technology) => (
            <article
              key={technology.id}
              className="border-border bg-surface rounded-xl border p-4 sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-base font-medium">{technology.name}</h2>
                  <p className="text-muted-foreground mt-1 text-xs">
                    {technology.applications.length} processo
                    {technology.applications.length === 1 ? "" : "s"} com esta
                    tecnologia
                  </p>
                </div>
                <Braces className="text-accent size-4" aria-hidden="true" />
              </div>
              <ul className="mt-4 space-y-2">
                {technology.applications.map((application) => (
                  <li key={application.id}>
                    <Link
                      href={`/dashboard/candidaturas/${application.id}`}
                      className="text-muted-foreground hover:text-foreground text-xs transition-colors"
                    >
                      {application.jobTitle} · {application.companyName}
                    </Link>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      ) : (
        <section className="border-border bg-surface mt-5 rounded-xl border">
          <EmptyState
            title={
              filter === "all"
                ? "Nenhuma tecnologia mapeada"
                : "Nenhuma tecnologia neste recorte"
            }
            description={
              filter === "all"
                ? "Adicione tecnologias nas candidaturas para acompanhar os requisitos recorrentes."
                : "Selecione outro filtro para revisar as tecnologias vinculadas."
            }
          />
        </section>
      )}
    </main>
  );
}
