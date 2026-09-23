import {
  Activity,
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  LinkIcon,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  SquareArrowOutUpRight,
  Users,
} from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormFeedback } from "@/components/ui/form-feedback";
import { inputStyles } from "@/components/ui/form-styles";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { DeleteCompanyButton } from "@/features/companies/components/delete-company-button";
import { parseCompanyPortfolioFilters } from "@/features/companies/services/company-portfolio-rules";
import { getCompanyPortfolio } from "@/features/companies/services/company-service";
import { StatusBadge } from "@/features/dashboard/components/status-badge";

type CompaniesPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const FEEDBACK: Record<string, string> = {
  created: "Empresa criada com sucesso.",
  updated: "Empresa atualizada com sucesso.",
  deleted: "Empresa excluída com sucesso.",
};

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Building2;
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

export default async function CompaniesPage({
  searchParams,
}: CompaniesPageProps) {
  const [rawFilters, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const filters = parseCompanyPortfolioFilters(rawFilters);
  const result = await getCompanyPortfolio(user!.id, filters);
  const feedback =
    typeof rawFilters.feedback === "string" ? rawFilters.feedback : "";
  const hasFilters = Boolean(
    filters.query || filters.relationship !== "all" || filters.sort !== "name",
  );

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-muted-foreground text-xs font-medium">
            Relacionamentos
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            Portfólio de empresas
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Compare oportunidades, atividade e cobertura de contatos por
            empresa.
          </p>
        </div>
        <Link href="/dashboard/empresas/nova" className={buttonStyles()}>
          <Plus className="size-4" aria-hidden="true" />
          Nova empresa
        </Link>
      </header>

      {FEEDBACK[feedback] ? (
        <div className="mt-6">
          <FormFeedback kind="success" message={FEEDBACK[feedback]} />
        </div>
      ) : null}

      <section
        className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Resumo do portfólio"
      >
        <MetricCard
          label="Empresas no recorte"
          value={result.summary.totalCompanies}
          icon={Building2}
        />
        <MetricCard
          label="Com processo ativo"
          value={result.summary.companiesWithActiveApplications}
          icon={Activity}
        />
        <MetricCard
          label="Candidaturas ativas"
          value={result.summary.activeApplications}
          icon={BriefcaseBusiness}
        />
        <MetricCard
          label="Com contatos"
          value={result.summary.companiesWithContacts}
          icon={Users}
        />
      </section>

      {result.isLimited ? (
        <p className="border-border bg-muted/30 text-muted-foreground mt-3 rounded-lg border px-4 py-3 text-xs">
          Os indicadores e filtros consideram até 300 empresas e os 1.000
          registros mais recentes de candidaturas e contatos. Refine a busca
          para analisar um conjunto menor.
        </p>
      ) : null}

      <form
        className="border-border bg-surface mt-6 rounded-xl border p-4"
        role="search"
      >
        <div className="grid gap-3 md:grid-cols-[minmax(220px,1fr)_220px_220px_auto]">
          <label className="relative">
            <span className="sr-only">Pesquisar empresas</span>
            <Search
              className="text-muted-foreground absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              name="q"
              defaultValue={filters.query}
              className={`${inputStyles} pl-10`}
              placeholder="Pesquisar por nome"
            />
          </label>
          <select
            name="relationship"
            defaultValue={filters.relationship}
            className={inputStyles}
            aria-label="Situação do relacionamento"
          >
            <option value="all">Todos os relacionamentos</option>
            <option value="active">Com processo ativo</option>
            <option value="history">Somente histórico</option>
            <option value="untracked">Sem candidatura</option>
          </select>
          <select
            name="sort"
            defaultValue={filters.sort}
            className={inputStyles}
            aria-label="Ordenar empresas"
          >
            <option value="name">Nome</option>
            <option value="activity">Atividade recente</option>
            <option value="opportunities">Mais oportunidades</option>
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
                href="/dashboard/empresas"
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

      <section className="mt-6" aria-label="Lista de empresas">
        {result.items.length === 0 ? (
          <div className="border-border bg-surface rounded-xl border">
            <EmptyState
              title={
                hasFilters
                  ? "Nenhuma empresa encontrada neste recorte"
                  : "Você ainda não cadastrou nenhuma empresa"
              }
              description={
                hasFilters
                  ? "Ajuste ou limpe os filtros para ampliar o portfólio."
                  : "Cadastre uma empresa para começar a organizar suas candidaturas."
              }
            />
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {result.items.map((company) => (
              <article
                key={company.id}
                className="border-border bg-surface rounded-xl border p-5"
              >
                <div className="flex items-start gap-3">
                  <span className="bg-accent/10 text-accent grid size-10 shrink-0 place-items-center rounded-lg">
                    <Building2 className="size-4" aria-hidden="true" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-medium">
                      {company.name}
                    </h2>
                    <p className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                      {company.location ? (
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="size-3" aria-hidden="true" />
                          {company.location}
                        </span>
                      ) : null}
                      <span>
                        Atividade em{" "}
                        {dateFormatter.format(new Date(company.lastActivityAt))}
                      </span>
                    </p>
                  </div>
                </div>

                <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-muted/40 rounded-lg px-2 py-3">
                    <dt className="text-muted-foreground text-[10px]">
                      Candidaturas
                    </dt>
                    <dd className="mt-1 text-sm font-semibold">
                      {company.applicationCount}
                    </dd>
                  </div>
                  <div className="bg-muted/40 rounded-lg px-2 py-3">
                    <dt className="text-muted-foreground text-[10px]">
                      Ativas
                    </dt>
                    <dd className="mt-1 text-sm font-semibold">
                      {company.activeApplicationCount}
                    </dd>
                  </div>
                  <div className="bg-muted/40 rounded-lg px-2 py-3">
                    <dt className="text-muted-foreground text-[10px]">
                      Contatos
                    </dt>
                    <dd className="mt-1 text-sm font-semibold">
                      {company.contactCount}
                    </dd>
                  </div>
                </dl>

                {company.latestApplication ? (
                  <Link
                    href={`/dashboard/candidaturas/${company.latestApplication.id}`}
                    className="border-border hover:bg-muted/40 mt-4 flex items-center justify-between gap-3 rounded-lg border px-3 py-3 transition"
                  >
                    <div className="min-w-0">
                      <p className="text-muted-foreground text-[10px]">
                        Candidatura mais recente
                      </p>
                      <p className="mt-1 truncate text-xs font-medium">
                        {company.latestApplication.job_title}
                      </p>
                    </div>
                    <StatusBadge status={company.latestApplication.status} />
                  </Link>
                ) : (
                  <p className="border-border text-muted-foreground mt-4 rounded-lg border border-dashed px-3 py-3 text-xs">
                    Nenhuma candidatura vinculada.
                  </p>
                )}

                {company.notes ? (
                  <p className="text-muted-foreground mt-4 line-clamp-2 text-sm leading-6">
                    {company.notes}
                  </p>
                ) : null}

                <div className="border-border mt-5 flex flex-wrap items-center gap-2 border-t pt-4">
                  <Link
                    href={`/dashboard/empresas/${company.id}`}
                    className={buttonStyles({
                      variant: "secondary",
                      size: "sm",
                    })}
                  >
                    <SquareArrowOutUpRight
                      className="size-4"
                      aria-hidden="true"
                    />
                    Abrir
                  </Link>
                  {company.website ? (
                    <a
                      className={buttonStyles({ variant: "ghost", size: "sm" })}
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-4" aria-hidden="true" />
                      Website
                    </a>
                  ) : null}
                  {company.linkedin_url ? (
                    <a
                      className={buttonStyles({ variant: "ghost", size: "sm" })}
                      href={company.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <LinkIcon className="size-4" aria-hidden="true" />
                      LinkedIn
                    </a>
                  ) : null}
                  <div className="ml-auto flex items-start gap-1">
                    <Link
                      href={`/dashboard/empresas/${company.id}/editar`}
                      className={buttonStyles({ variant: "ghost", size: "sm" })}
                    >
                      <Pencil className="size-4" aria-hidden="true" />
                      Editar
                    </Link>
                    <DeleteCompanyButton
                      companyId={company.id}
                      companyName={company.name}
                    />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
