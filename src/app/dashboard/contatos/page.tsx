import {
  Activity,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  ExternalLink,
  Mail,
  Plus,
  RotateCcw,
  Search,
  UserRoundCheck,
  Users,
  UserX,
} from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormFeedback } from "@/components/ui/form-feedback";
import { inputStyles } from "@/components/ui/form-styles";
import { LocalDateTime } from "@/components/ui/local-date-time";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { getCompanyOptions } from "@/features/companies/services/company-service";
import {
  CONTACT_TYPES,
  formatContactType,
} from "@/features/contacts/constants";
import { parseContactPortfolioFilters } from "@/features/contacts/services/contact-portfolio-rules";
import { getContactPortfolio } from "@/features/contacts/services/contact-service";
import { StatusBadge } from "@/features/dashboard/components/status-badge";

const FEEDBACKS: Record<string, string> = {
  deleted: "Contato excluído com sucesso.",
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
  icon: typeof Users;
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

export default async function ContactsPage({
  searchParams,
}: PageProps<"/dashboard/contatos">) {
  const [rawFilters, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const filters = parseContactPortfolioFilters(rawFilters);
  const [result, companies] = await Promise.all([
    getContactPortfolio(user!.id, filters),
    getCompanyOptions(user!.id),
  ]);
  const feedback =
    typeof rawFilters.feedback === "string" ? rawFilters.feedback : "";
  const hasFilters = Boolean(
    filters.query ||
    filters.companyId ||
    filters.contactType ||
    filters.relationship !== "all" ||
    filters.sort !== "name",
  );

  return (
    <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-muted-foreground text-xs font-medium">
            Relacionamentos
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            Portfólio de contatos
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Acompanhe cobertura, oportunidades e entrevistas da sua rede.
          </p>
        </div>
        <Link href="/dashboard/contatos/novo" className={buttonStyles()}>
          <Plus className="size-4" aria-hidden="true" />
          Novo contato
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
          label="Contatos no recorte"
          value={result.summary.totalContacts}
          icon={Users}
        />
        <MetricCard
          label="Com processo ativo"
          value={result.summary.contactsWithActiveApplications}
          icon={Activity}
        />
        <MetricCard
          label="Participaram de entrevistas"
          value={result.summary.interviewers}
          icon={UserRoundCheck}
        />
        <MetricCard
          label="Sem vínculos"
          value={result.summary.unlinkedContacts}
          icon={UserX}
        />
      </section>

      {result.isLimited ? (
        <p className="border-border bg-muted/30 text-muted-foreground mt-3 rounded-lg border px-4 py-3 text-xs">
          Os indicadores e filtros consideram até 300 contatos, 100 empresas
          correspondentes à busca e os 1.000 vínculos mais recentes de
          candidaturas e entrevistas. Refine a busca para analisar um conjunto
          menor.
        </p>
      ) : null}

      <form
        className="border-border bg-surface mt-6 rounded-xl border p-4"
        role="search"
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(220px,1fr)_200px_190px_190px_190px_auto]">
          <label className="relative">
            <span className="sr-only">Buscar contatos</span>
            <Search
              className="text-muted-foreground absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              name="q"
              defaultValue={filters.query}
              className={`${inputStyles} pl-10`}
              placeholder="Nome, cargo, empresa ou email"
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
            defaultValue={filters.contactType}
            className={inputStyles}
            aria-label="Filtrar por tipo"
          >
            <option value="">Todos os tipos</option>
            {CONTACT_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <select
            name="relationship"
            defaultValue={filters.relationship}
            className={inputStyles}
            aria-label="Filtrar por relacionamento"
          >
            <option value="all">Todos os vínculos</option>
            <option value="active">Com processo ativo</option>
            <option value="interviewer">Com entrevista</option>
            <option value="unlinked">Sem vínculos</option>
          </select>
          <select
            name="sort"
            defaultValue={filters.sort}
            className={inputStyles}
            aria-label="Ordenar contatos"
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
                href="/dashboard/contatos"
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

      <section className="mt-6" aria-label="Lista de contatos">
        {result.items.length === 0 ? (
          <div className="border-border bg-surface rounded-xl border">
            <EmptyState
              title={
                hasFilters
                  ? "Nenhum contato encontrado neste recorte"
                  : "Nenhum contato cadastrado"
              }
              description={
                hasFilters
                  ? "Ajuste ou limpe os filtros para ampliar o portfólio."
                  : "Adicione recruiters, entrevistadores e outros contatos relacionados às suas oportunidades."
              }
            />
          </div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
            {result.items.map((contact) => (
              <article
                key={contact.id}
                className="border-border bg-surface rounded-xl border p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link
                      href={`/dashboard/contatos/${contact.id}`}
                      className="font-medium hover:underline"
                    >
                      {contact.name}
                    </Link>
                    <p className="text-muted-foreground mt-1 truncate text-xs">
                      {contact.role || formatContactType(contact.contact_type)}
                    </p>
                  </div>
                  <span className="bg-muted text-muted-foreground rounded-full px-2 py-1 text-[10px]">
                    {formatContactType(contact.contact_type)}
                  </span>
                </div>

                <Link
                  href={`/dashboard/empresas/${contact.company.id}`}
                  className="text-muted-foreground mt-4 flex items-center gap-2 text-xs hover:underline"
                >
                  <Building2 className="size-3.5" aria-hidden="true" />
                  {contact.company.name}
                </Link>

                <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="bg-muted/40 rounded-lg px-2 py-3">
                    <dt className="text-muted-foreground text-[10px]">
                      Candidaturas
                    </dt>
                    <dd className="mt-1 text-sm font-semibold">
                      {contact.applicationCount}
                    </dd>
                  </div>
                  <div className="bg-muted/40 rounded-lg px-2 py-3">
                    <dt className="text-muted-foreground text-[10px]">
                      Ativas
                    </dt>
                    <dd className="mt-1 text-sm font-semibold">
                      {contact.activeApplicationCount}
                    </dd>
                  </div>
                  <div className="bg-muted/40 rounded-lg px-2 py-3">
                    <dt className="text-muted-foreground text-[10px]">
                      Entrevistas
                    </dt>
                    <dd className="mt-1 text-sm font-semibold">
                      {contact.interviewCount}
                    </dd>
                  </div>
                </dl>

                {contact.latestApplication ? (
                  <Link
                    href={`/dashboard/candidaturas/${contact.latestApplication.id}`}
                    className="border-border hover:bg-muted/40 mt-4 flex items-center justify-between gap-3 rounded-lg border px-3 py-3 transition"
                  >
                    <div className="min-w-0">
                      <p className="text-muted-foreground text-[10px]">
                        Candidatura mais recente
                      </p>
                      <p className="mt-1 truncate text-xs font-medium">
                        {contact.latestApplication.job_title}
                      </p>
                    </div>
                    <StatusBadge status={contact.latestApplication.status} />
                  </Link>
                ) : (
                  <p className="border-border text-muted-foreground mt-4 rounded-lg border border-dashed px-3 py-3 text-xs">
                    Nenhuma candidatura vinculada.
                  </p>
                )}

                {contact.nextInterviewAt ? (
                  <p className="text-muted-foreground mt-3 flex items-center gap-2 text-xs">
                    <CalendarClock
                      className="text-accent size-3.5"
                      aria-hidden="true"
                    />
                    Próxima entrevista:
                    <LocalDateTime value={contact.nextInterviewAt} />
                  </p>
                ) : (
                  <p className="text-muted-foreground mt-3 flex items-center gap-2 text-xs">
                    <BriefcaseBusiness
                      className="size-3.5"
                      aria-hidden="true"
                    />
                    Atividade em{" "}
                    {dateFormatter.format(new Date(contact.lastActivityAt))}
                  </p>
                )}

                <div className="border-border mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
                  <Link
                    href={`/dashboard/contatos/${contact.id}`}
                    className={buttonStyles({
                      variant: "secondary",
                      size: "sm",
                    })}
                  >
                    Abrir hub
                  </Link>
                  {contact.email ? (
                    <a
                      className={buttonStyles({ variant: "ghost", size: "sm" })}
                      href={`mailto:${contact.email}`}
                    >
                      <Mail className="size-3.5" aria-hidden="true" />
                      Email
                    </a>
                  ) : null}
                  {contact.linkedin_url ? (
                    <a
                      className={buttonStyles({ variant: "ghost", size: "sm" })}
                      href={contact.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LinkedIn
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
