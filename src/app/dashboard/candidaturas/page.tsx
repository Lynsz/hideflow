import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormFeedback } from "@/components/ui/form-feedback";
import { inputStyles } from "@/components/ui/form-styles";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import {
  APPLICATION_STATUSES,
  APPLICATION_STATUS_LABELS,
  EMPLOYMENT_TYPES,
  EMPLOYMENT_TYPE_LABELS,
  WORK_MODES,
  WORK_MODE_LABELS,
} from "@/features/applications/constants";
import {
  formatDate,
  formatEmploymentType,
  formatSalary,
  formatWorkMode,
} from "@/features/applications/services/application-formatters";
import {
  buildApplicationListUrl,
  parseApplicationFilters,
} from "@/features/applications/services/application-filters";
import { getApplications } from "@/features/applications/services/application-service";
import type { ApplicationWithCompany } from "@/features/applications/types/application";
import { StatusBadge } from "@/features/dashboard/components/status-badge";
import { getCompanyOptions } from "@/features/companies/services/company-service";

type ApplicationsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const FEEDBACK: Record<string, string> = {
  deleted: "Candidatura excluída com sucesso.",
  archived: "Candidatura arquivada sem excluir seus dados.",
  restored: "Candidatura restaurada para a lista ativa.",
};

function ArchivedBadge() {
  return (
    <span className="border-border bg-muted text-muted-foreground rounded-full border px-2 py-1 text-[10px] font-medium">
      Arquivada
    </span>
  );
}

function ApplicationMobileCard({
  application,
}: {
  application: ApplicationWithCompany;
}) {
  return (
    <Link
      href={`/dashboard/candidaturas/${application.id}`}
      className="border-border bg-surface block rounded-xl border p-4 transition hover:border-[#3a414b] md:hidden"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {application.job_title}
          </p>
          <p className="text-muted-foreground mt-1 truncate text-xs">
            {application.company.name}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {application.archived_at ? <ArchivedBadge /> : null}
          <StatusBadge status={application.status} />
        </div>
      </div>
      <dl className="text-muted-foreground mt-4 grid grid-cols-2 gap-3 text-xs">
        <div>
          <dt className="sr-only">Modalidade</dt>
          <dd>{formatWorkMode(application.work_mode)}</dd>
        </div>
        <div>
          <dt className="sr-only">Contrato</dt>
          <dd>{formatEmploymentType(application.employment_type)}</dd>
        </div>
        <div>
          <dt className="sr-only">Localização</dt>
          <dd>{application.location || "Não informada"}</dd>
        </div>
        <div>
          <dt className="sr-only">Data</dt>
          <dd>{formatDate(application.applied_at)}</dd>
        </div>
      </dl>
    </Link>
  );
}

export default async function ApplicationsPage({
  searchParams,
}: ApplicationsPageProps) {
  const rawFilters = await searchParams;
  const filters = parseApplicationFilters(rawFilters);
  const user = await getCurrentUser();
  const [result, companies] = await Promise.all([
    getApplications(user!.id, filters),
    getCompanyOptions(user!.id),
  ]);
  const feedback =
    typeof rawFilters.feedback === "string" ? rawFilters.feedback : "";
  const hasFilters = Boolean(
    filters.query ||
    filters.status ||
    filters.workMode ||
    filters.employmentType ||
    filters.companyId ||
    filters.archive !== "active",
  );

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-muted-foreground text-xs font-medium">Pipeline</p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            Candidaturas
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Pesquise, filtre e acompanhe todas as suas oportunidades.
          </p>
        </div>
        <Link href="/dashboard/candidaturas/nova" className={buttonStyles()}>
          <Plus className="size-4" aria-hidden="true" />
          Nova candidatura
        </Link>
      </header>

      {FEEDBACK[feedback] ? (
        <div className="mt-6">
          <FormFeedback kind="success" message={FEEDBACK[feedback]} />
        </div>
      ) : null}

      <form
        className="border-border bg-surface mt-6 rounded-xl border p-4"
        role="search"
      >
        <div className="flex items-center gap-2 text-sm font-medium">
          <SlidersHorizontal
            className="text-accent size-4"
            aria-hidden="true"
          />
          Busca e filtros
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
          <label className="relative sm:col-span-2">
            <span className="sr-only">Buscar por vaga ou empresa</span>
            <Search
              className="text-muted-foreground absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              name="q"
              defaultValue={filters.query}
              className={`${inputStyles} pl-10`}
              placeholder="Vaga ou empresa"
            />
          </label>
          <select
            name="status"
            defaultValue={filters.status}
            className={inputStyles}
            aria-label="Status"
          >
            <option value="">Todos os status</option>
            {APPLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {APPLICATION_STATUS_LABELS[status]}
              </option>
            ))}
          </select>
          <select
            name="workMode"
            defaultValue={filters.workMode}
            className={inputStyles}
            aria-label="Modalidade"
          >
            <option value="">Todas as modalidades</option>
            {WORK_MODES.map((mode) => (
              <option key={mode} value={mode}>
                {WORK_MODE_LABELS[mode]}
              </option>
            ))}
          </select>
          <select
            name="employmentType"
            defaultValue={filters.employmentType}
            className={inputStyles}
            aria-label="Tipo de contratação"
          >
            <option value="">Todos os contratos</option>
            {EMPLOYMENT_TYPES.map((type) => (
              <option key={type} value={type}>
                {EMPLOYMENT_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
          <select
            name="company"
            defaultValue={filters.companyId}
            className={inputStyles}
            aria-label="Empresa"
          >
            <option value="">Todas as empresas</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </select>
          <select
            name="archive"
            defaultValue={filters.archive}
            className={inputStyles}
            aria-label="Arquivamento"
          >
            <option value="active">Ativas</option>
            <option value="archived">Arquivadas</option>
            <option value="all">Ativas e arquivadas</option>
          </select>
        </div>
        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <select
            name="sort"
            defaultValue={filters.sort}
            className={`${inputStyles} sm:w-52`}
            aria-label="Ordenação"
          >
            <option value="recent">Mais recentes</option>
            <option value="oldest">Mais antigas</option>
            <option value="company">Nome da empresa</option>
            <option value="job">Nome da vaga</option>
          </select>
          <div className="flex gap-2">
            {hasFilters ? (
              <Link
                href="/dashboard/candidaturas"
                className={buttonStyles({ variant: "ghost" })}
              >
                Limpar
              </Link>
            ) : null}
            <button
              className={buttonStyles({ variant: "secondary" })}
              type="submit"
            >
              Aplicar filtros
            </button>
          </div>
        </div>
      </form>

      <section className="mt-6" aria-label="Lista de candidaturas">
        {result.items.length === 0 ? (
          <div className="border-border bg-surface rounded-xl border">
            <EmptyState
              title={
                hasFilters
                  ? "Nenhuma candidatura corresponde aos filtros selecionados"
                  : "Nenhuma candidatura encontrada"
              }
              description={
                hasFilters
                  ? "Ajuste ou limpe os filtros para ampliar a busca."
                  : "Comece cadastrando sua primeira oportunidade."
              }
            />
          </div>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {result.items.map((application) => (
                <ApplicationMobileCard
                  key={application.id}
                  application={application}
                />
              ))}
            </div>
            <div className="border-border bg-surface hidden overflow-hidden rounded-xl border md:block">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] text-left text-sm">
                  <thead className="border-border bg-background text-muted-foreground border-b text-xs">
                    <tr>
                      <th className="px-4 py-3 font-medium">Vaga e empresa</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium">Modalidade</th>
                      <th className="px-4 py-3 font-medium">Contrato</th>
                      <th className="px-4 py-3 font-medium">Localização</th>
                      <th className="px-4 py-3 font-medium">Data</th>
                      <th className="px-4 py-3 font-medium">Faixa salarial</th>
                    </tr>
                  </thead>
                  <tbody className="divide-border divide-y">
                    {result.items.map((application) => (
                      <tr key={application.id} className="hover:bg-muted/40">
                        <td className="px-4 py-4">
                          <Link
                            href={`/dashboard/candidaturas/${application.id}`}
                            className="font-medium hover:underline"
                          >
                            {application.job_title}
                          </Link>
                          <p className="text-muted-foreground mt-1 text-xs">
                            {application.company.name}
                          </p>
                          {application.archived_at ? (
                            <span className="mt-2 inline-block">
                              <ArchivedBadge />
                            </span>
                          ) : null}
                        </td>
                        <td className="px-4 py-4">
                          <StatusBadge status={application.status} />
                        </td>
                        <td className="text-muted-foreground px-4 py-4 text-xs">
                          {formatWorkMode(application.work_mode)}
                        </td>
                        <td className="text-muted-foreground px-4 py-4 text-xs">
                          {formatEmploymentType(application.employment_type)}
                        </td>
                        <td className="text-muted-foreground max-w-40 truncate px-4 py-4 text-xs">
                          {application.location || "—"}
                        </td>
                        <td className="text-muted-foreground px-4 py-4 text-xs">
                          {formatDate(application.applied_at)}
                        </td>
                        <td className="text-muted-foreground px-4 py-4 text-xs">
                          {formatSalary(application)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>

      {result.total > 0 ? (
        <nav
          className="mt-5 flex items-center justify-between"
          aria-label="Paginação"
        >
          <p className="text-muted-foreground text-xs">
            {result.total} {result.total === 1 ? "candidatura" : "candidaturas"}{" "}
            · página {result.page} de {result.totalPages}
          </p>
          <div className="flex gap-2">
            {result.page > 1 ? (
              <Link
                href={buildApplicationListUrl(filters, {
                  page: result.page - 1,
                })}
                className={buttonStyles({ variant: "secondary", size: "sm" })}
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                Anterior
              </Link>
            ) : null}
            {result.page < result.totalPages ? (
              <Link
                href={buildApplicationListUrl(filters, {
                  page: result.page + 1,
                })}
                className={buttonStyles({ variant: "secondary", size: "sm" })}
              >
                Próxima
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </main>
  );
}
