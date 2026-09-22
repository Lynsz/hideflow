import {
  ArrowLeft,
  BriefcaseBusiness,
  ExternalLink,
  LinkIcon,
  MapPin,
  Pencil,
  Plus,
  Trophy,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { FormFeedback } from "@/components/ui/form-feedback";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import {
  formatDate,
  formatWorkMode,
} from "@/features/applications/services/application-formatters";
import { DeleteCompanyButton } from "@/features/companies/components/delete-company-button";
import { getCompanyDetail } from "@/features/companies/services/company-service";
import { formatContactType } from "@/features/contacts/constants";
import { StatusBadge } from "@/features/dashboard/components/status-badge";

const FEEDBACK: Record<string, string> = {
  created: "Empresa criada com sucesso.",
  updated: "Empresa atualizada com sucesso.",
};

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof BriefcaseBusiness;
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

export default async function CompanyDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ feedback?: string }>;
}) {
  const [{ id }, { feedback }, user] = await Promise.all([
    params,
    searchParams,
    getCurrentUser(),
  ]);
  const detail = await getCompanyDetail(user!.id, id);
  if (!detail) notFound();

  const { company, applications, contacts, applicationSummary } = detail;

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 md:px-8 md:py-8 lg:px-10">
      <Link
        href="/dashboard/empresas"
        className={buttonStyles({ variant: "ghost", className: "-ml-3" })}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar para empresas
      </Link>

      {FEEDBACK[feedback ?? ""] ? (
        <div className="mt-5">
          <FormFeedback kind="success" message={FEEDBACK[feedback ?? ""]} />
        </div>
      ) : null}

      <header className="mt-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs font-medium">
            Relacionamento com empresa
          </p>
          <h1 className="mt-1.5 truncate text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            {company.name}
          </h1>
          {company.location ? (
            <p className="text-muted-foreground mt-2 flex items-center gap-1.5 text-sm">
              <MapPin className="size-4" aria-hidden="true" />
              {company.location}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {company.website ? (
            <a
              href={company.website}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles({ variant: "ghost" })}
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              Website
            </a>
          ) : null}
          {company.linkedin_url ? (
            <a
              href={company.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles({ variant: "ghost" })}
            >
              <LinkIcon className="size-4" aria-hidden="true" />
              LinkedIn
            </a>
          ) : null}
          <Link
            href={`/dashboard/empresas/${company.id}/editar`}
            className={buttonStyles({ variant: "secondary" })}
          >
            <Pencil className="size-4" aria-hidden="true" />
            Editar
          </Link>
          <DeleteCompanyButton
            companyId={company.id}
            companyName={company.name}
          />
        </div>
      </header>

      <section
        className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Resumo da empresa"
      >
        <MetricCard
          label={
            detail.isApplicationListLimited
              ? "Candidaturas totais"
              : "Candidaturas"
          }
          value={detail.totalApplications}
          icon={BriefcaseBusiness}
        />
        <MetricCard
          label="Processos ativos"
          value={applicationSummary.active}
          icon={UserRound}
        />
        <MetricCard
          label="Em entrevista"
          value={applicationSummary.interviewStage}
          icon={Users}
        />
        <MetricCard
          label="Contratações"
          value={applicationSummary.hired}
          icon={Trophy}
        />
      </section>

      {detail.isApplicationListLimited ? (
        <p className="border-border bg-muted/30 text-muted-foreground mt-3 rounded-lg border px-4 py-3 text-xs">
          Os indicadores de estágio consideram as {applicationSummary.analyzed}{" "}
          candidaturas atualizadas mais recentemente. O total inclui todos os
          registros da empresa.
        </p>
      ) : null}

      <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.85fr)]">
        <section className="border-border bg-surface rounded-xl border p-5 sm:p-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-medium">Candidaturas</h2>
              <p className="text-muted-foreground mt-1 text-xs">
                Oportunidades vinculadas a {company.name}.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href={`/dashboard/candidaturas?company=${company.id}&archive=all`}
                className={buttonStyles({ variant: "ghost", size: "sm" })}
              >
                Ver lista filtrada
              </Link>
              <Link
                href={`/dashboard/candidaturas/nova?company=${company.id}`}
                className={buttonStyles({ variant: "secondary", size: "sm" })}
              >
                <Plus className="size-4" aria-hidden="true" />
                Nova candidatura
              </Link>
            </div>
          </div>

          {applications.length ? (
            <ul className="divide-border mt-5 divide-y">
              {applications.map((application) => (
                <li key={application.id}>
                  <Link
                    href={`/dashboard/candidaturas/${application.id}`}
                    className="hover:bg-muted/50 -mx-2 flex flex-col gap-3 rounded-lg px-2 py-4 transition sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-medium">
                          {application.job_title}
                        </p>
                        {application.archived_at ? (
                          <span className="border-border bg-muted text-muted-foreground rounded-full border px-2 py-1 text-[10px] font-medium">
                            Arquivada
                          </span>
                        ) : null}
                      </div>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {application.location || "Localização não informada"} ·{" "}
                        {formatWorkMode(application.work_mode)} · Aplicada em{" "}
                        {formatDate(application.applied_at)}
                      </p>
                    </div>
                    <StatusBadge status={application.status} />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState
              title="Nenhuma candidatura vinculada"
              description="Registre a primeira oportunidade desta empresa para iniciar o acompanhamento."
            />
          )}
        </section>

        <div className="space-y-5">
          <section className="border-border bg-surface rounded-xl border p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="font-medium">Contatos</h2>
                <p className="text-muted-foreground mt-1 text-xs">
                  Pessoas relacionadas à empresa.
                </p>
              </div>
              <Link
                href={`/dashboard/contatos/novo?company=${company.id}`}
                className={buttonStyles({ variant: "ghost", size: "sm" })}
              >
                <Plus className="size-4" aria-hidden="true" />
                Adicionar
              </Link>
            </div>

            {contacts.length ? (
              <ul className="divide-border mt-4 divide-y">
                {contacts.map((contact) => (
                  <li key={contact.id}>
                    <Link
                      href={`/dashboard/contatos/${contact.id}`}
                      className="hover:bg-muted/50 -mx-2 block rounded-lg px-2 py-3 transition"
                    >
                      <p className="text-sm font-medium">{contact.name}</p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        {contact.role ||
                          formatContactType(contact.contact_type)}
                        {contact.email ? ` · ${contact.email}` : ""}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground mt-4 text-sm">
                Nenhum contato cadastrado para esta empresa.
              </p>
            )}
          </section>

          <section className="border-border bg-surface rounded-xl border p-5 sm:p-6">
            <h2 className="font-medium">Contexto</h2>
            {company.notes ? (
              <p className="text-muted-foreground mt-4 text-sm leading-6 whitespace-pre-wrap">
                {company.notes}
              </p>
            ) : (
              <p className="text-muted-foreground mt-4 text-sm">
                Nenhuma observação registrada sobre esta empresa.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
