import {
  CalendarClock,
  ClipboardCheck,
  History,
  MessageSquareText,
  Plus,
  RotateCcw,
  Search,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormFeedback } from "@/components/ui/form-feedback";
import { inputStyles } from "@/components/ui/form-styles";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { getCompanyOptions } from "@/features/companies/services/company-service";
import { InterviewCard } from "@/features/interviews/components/interview-card";
import { INTERVIEW_TYPES } from "@/features/interviews/constants";
import { parseInterviewPortfolioFilters } from "@/features/interviews/services/interview-portfolio-rules";
import { getInterviewPortfolio } from "@/features/interviews/services/interview-service";

const FEEDBACKS: Record<string, string> = {
  created: "Entrevista criada com sucesso.",
  updated: "Entrevista atualizada com sucesso.",
  result: "Resultado da entrevista atualizado.",
  deleted: "Entrevista excluída com sucesso.",
};

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

export default async function InterviewsPage({
  searchParams,
}: PageProps<"/dashboard/entrevistas">) {
  const [rawFilters, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const filters = parseInterviewPortfolioFilters(rawFilters);
  const [result, companies] = await Promise.all([
    getInterviewPortfolio(user!.id, filters),
    getCompanyOptions(user!.id),
  ]);
  const feedback =
    typeof rawFilters.feedback === "string" ? rawFilters.feedback : "";
  const hasFilters = Boolean(
    filters.query ||
    filters.companyId ||
    filters.type ||
    filters.state !== "all" ||
    filters.focus !== "all" ||
    filters.sort !== "next",
  );

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-muted-foreground text-xs font-medium">
            Agenda e evolução
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            Portfólio de entrevistas
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Priorize preparação, retrospectiva e acompanhamento de cada
            conversa.
          </p>
        </div>
        <Link href="/dashboard/entrevistas/nova" className={buttonStyles()}>
          <Plus className="size-4" aria-hidden="true" />
          Nova entrevista
        </Link>
      </header>

      {FEEDBACKS[feedback] ? (
        <div className="mt-6">
          <FormFeedback kind="success" message={FEEDBACKS[feedback]} />
        </div>
      ) : null}

      <section
        className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Resumo do portfólio"
      >
        <MetricCard
          label="Entrevistas no recorte"
          value={result.summary.totalInterviews}
          icon={History}
        />
        <MetricCard
          label="Próximas entrevistas"
          value={result.summary.upcomingInterviews}
          icon={CalendarClock}
        />
        <MetricCard
          label="Preparações pendentes"
          value={result.summary.preparationPending}
          icon={ClipboardCheck}
        />
        <MetricCard
          label="Retrospectivas pendentes"
          value={result.summary.debriefPending}
          icon={MessageSquareText}
        />
      </section>

      {result.isLimited ? (
        <p className="border-border bg-muted/30 text-muted-foreground mt-3 rounded-lg border px-4 py-3 text-xs">
          Os indicadores e filtros consideram até 300 entrevistas e os 1.000
          registros mais recentes de preparação e retrospectiva. Refine a busca
          para analisar um conjunto menor.
        </p>
      ) : null}

      <form
        className="border-border bg-surface mt-6 rounded-xl border p-4"
        role="search"
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_190px_170px_180px_190px_170px_auto]">
          <label className="relative">
            <span className="sr-only">Buscar entrevistas</span>
            <Search
              className="text-muted-foreground absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              name="q"
              defaultValue={filters.query}
              className={`${inputStyles} pl-10`}
              placeholder="Cargo, empresa ou entrevistador"
            />
          </label>
          <select
            name="company"
            defaultValue={filters.companyId}
            className={inputStyles}
            aria-label="Filtrar por empresa"
          >
            <option value="">Todas as empresas</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          <select
            name="type"
            defaultValue={filters.type}
            className={inputStyles}
            aria-label="Filtrar por tipo"
          >
            <option value="">Todos os tipos</option>
            {INTERVIEW_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <select
            name="state"
            defaultValue={filters.state}
            className={inputStyles}
            aria-label="Filtrar por momento"
          >
            <option value="all">Todos os momentos</option>
            <option value="upcoming">Próximas</option>
            <option value="awaiting">Aguardando atualização</option>
            <option value="finished">Finalizadas</option>
          </select>
          <select
            name="focus"
            defaultValue={filters.focus}
            className={inputStyles}
            aria-label="Filtrar por pendência"
          >
            <option value="all">Todas as pendências</option>
            <option value="preparation">Preparação pendente</option>
            <option value="debrief">Retrospectiva pendente</option>
            <option value="thank_you">Agradecimento pendente</option>
          </select>
          <select
            name="sort"
            defaultValue={filters.sort}
            className={inputStyles}
            aria-label="Ordenar entrevistas"
          >
            <option value="next">Próximas ações</option>
            <option value="recent">Mais recentes</option>
            <option value="company">Empresa</option>
          </select>
          <div className="flex gap-2">
            <button
              className={buttonStyles({ variant: "secondary" })}
              type="submit"
            >
              Aplicar
            </button>
            {hasFilters ? (
              <Link
                href="/dashboard/entrevistas"
                className={buttonStyles({
                  variant: "ghost",
                  size: "sm",
                  className: "px-3",
                })}
                aria-label="Limpar filtros"
              >
                <RotateCcw className="size-4" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </div>
      </form>

      <section className="mt-6" aria-label="Lista de entrevistas">
        {result.items.length === 0 ? (
          <div className="border-border bg-surface rounded-xl border">
            <EmptyState
              title={
                hasFilters
                  ? "Nenhuma entrevista encontrada neste recorte"
                  : "Nenhuma entrevista cadastrada"
              }
              description={
                hasFilters
                  ? "Ajuste ou limpe os filtros para ampliar o portfólio."
                  : "Agende uma entrevista para acompanhar sua preparação e evolução."
              }
            />
          </div>
        ) : (
          <div className="grid gap-3 xl:grid-cols-2">
            {result.items.map((interview) => (
              <InterviewCard key={interview.id} interview={interview} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
