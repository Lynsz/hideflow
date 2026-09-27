import {
  Activity,
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  ExternalLink,
  Mail,
  Pencil,
  Phone,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonStyles } from "@/components/ui/button";
import { FormFeedback } from "@/components/ui/form-feedback";
import { LocalDateTime } from "@/components/ui/local-date-time";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { DeleteContactButton } from "@/features/contacts/components/delete-contact-button";
import { formatContactType } from "@/features/contacts/constants";
import { getContactDetail } from "@/features/contacts/services/contact-service";
import { StatusBadge } from "@/features/dashboard/components/status-badge";
import {
  formatInterviewResult,
  formatInterviewType,
} from "@/features/interviews/constants";

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
    <article className="border-border bg-surface rounded-xl border p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">{label}</p>
        <Icon className="text-accent size-4" aria-hidden="true" />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{value}</p>
    </article>
  );
}

export default async function ContactDetailPage({
  params,
  searchParams,
}: PageProps<"/dashboard/contatos/[id]">) {
  const [{ id }, { feedback }, user] = await Promise.all([
    params,
    searchParams,
    getCurrentUser(),
  ]);
  const contact = await getContactDetail(user!.id, id);
  if (!contact) notFound();

  const interviewApplication = contact.applications.find(
    (application) => application.archived_at === null,
  );
  const isLimited =
    contact.isApplicationListLimited || contact.isInterviewListLimited;

  return (
    <main className="mx-auto max-w-[1280px] px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <Link
        href="/dashboard/contatos"
        className={buttonStyles({ variant: "ghost", className: "-ml-3" })}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar para contatos
      </Link>

      {feedback ? (
        <div className="mt-5">
          <FormFeedback
            kind="success"
            message={
              feedback === "created"
                ? "Contato criado com sucesso."
                : "Contato atualizado com sucesso."
            }
          />
        </div>
      ) : null}

      <header className="mt-6 flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div>
          <p className="text-muted-foreground text-xs font-medium">
            Hub de relacionamento
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            {contact.name}
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {contact.role || formatContactType(contact.contact_type)} ·{" "}
            <Link
              href={`/dashboard/empresas/${contact.company.id}`}
              className="hover:text-foreground underline-offset-4 hover:underline"
            >
              {contact.company.name}
            </Link>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {interviewApplication ? (
            <Link
              href={`/dashboard/entrevistas/nova?application=${interviewApplication.id}&contact=${contact.id}`}
              className={buttonStyles()}
            >
              <Plus className="size-4" aria-hidden="true" />
              Nova entrevista
            </Link>
          ) : null}
          <Link
            href={`/dashboard/contatos/${id}/editar`}
            className={buttonStyles({ variant: "secondary" })}
          >
            <Pencil className="size-4" aria-hidden="true" />
            Editar
          </Link>
          <DeleteContactButton contactId={id} name={contact.name} />
        </div>
      </header>

      <section
        className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
        aria-label="Resumo do relacionamento"
      >
        <MetricCard
          label="Candidaturas vinculadas"
          value={contact.totalApplications}
          icon={BriefcaseBusiness}
        />
        <MetricCard
          label="Processos ativos"
          value={contact.summary.activeApplications}
          icon={Activity}
        />
        <MetricCard
          label="Entrevistas"
          value={contact.totalInterviews}
          icon={CalendarClock}
        />
        <MetricCard
          label="Próximas entrevistas"
          value={contact.summary.upcomingInterviews}
          icon={CalendarClock}
        />
      </section>

      {isLimited ? (
        <p className="border-border bg-muted/30 text-muted-foreground mt-3 rounded-lg border px-4 py-3 text-xs">
          Os totais permanecem exatos, mas os indicadores e listas consideram os
          200 vínculos mais recentes de cada categoria.
        </p>
      ) : null}

      <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(260px,0.8fr)_minmax(0,1.7fr)]">
        <section className="border-border bg-surface self-start rounded-xl border p-5">
          <h2 className="font-medium">Dados do contato</h2>
          <dl className="mt-5 space-y-4 text-sm">
            <div>
              <dt className="text-muted-foreground text-xs">Tipo</dt>
              <dd className="mt-1">
                {formatContactType(contact.contact_type)}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">Empresa</dt>
              <dd className="mt-1">
                <Link
                  className="text-accent inline-flex items-center gap-2 hover:underline"
                  href={`/dashboard/empresas/${contact.company.id}`}
                >
                  <Building2 className="size-4" aria-hidden="true" />
                  {contact.company.name}
                </Link>
              </dd>
            </div>
            {contact.email ? (
              <div>
                <dt className="text-muted-foreground text-xs">Email</dt>
                <dd className="mt-1">
                  <a
                    className="text-accent inline-flex items-center gap-2 break-all hover:underline"
                    href={`mailto:${contact.email}`}
                  >
                    <Mail className="size-4 shrink-0" aria-hidden="true" />
                    {contact.email}
                  </a>
                </dd>
              </div>
            ) : null}
            {contact.phone ? (
              <div>
                <dt className="text-muted-foreground text-xs">Telefone</dt>
                <dd className="mt-1">
                  <a
                    className="text-accent inline-flex items-center gap-2 hover:underline"
                    href={`tel:${contact.phone}`}
                  >
                    <Phone className="size-4" aria-hidden="true" />
                    {contact.phone}
                  </a>
                </dd>
              </div>
            ) : null}
            {contact.linkedin_url ? (
              <div>
                <dt className="text-muted-foreground text-xs">LinkedIn</dt>
                <dd className="mt-1">
                  <a
                    className="text-accent inline-flex items-center gap-2 hover:underline"
                    href={contact.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Abrir perfil
                    <ExternalLink className="size-4" aria-hidden="true" />
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
          {contact.notes ? (
            <p className="border-border text-muted-foreground mt-5 border-t pt-5 text-sm whitespace-pre-wrap">
              {contact.notes}
            </p>
          ) : null}
        </section>

        <div className="space-y-5">
          <section className="border-border bg-surface rounded-xl border p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-medium">Candidaturas associadas</h2>
              <span className="text-muted-foreground text-xs">
                {contact.totalApplications} no total
              </span>
            </div>
            {contact.applications.length ? (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {contact.applications.map((application) => (
                  <li key={application.id}>
                    <Link
                      className="border-border hover:bg-muted/40 flex h-full items-center justify-between gap-3 rounded-lg border p-3 transition"
                      href={`/dashboard/candidaturas/${application.id}`}
                    >
                      <span className="min-w-0 truncate text-sm font-medium">
                        {application.job_title}
                      </span>
                      <StatusBadge status={application.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground mt-4 text-sm">
                Nenhuma candidatura associada.
              </p>
            )}
          </section>

          <section className="border-border bg-surface rounded-xl border p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-medium">Histórico de entrevistas</h2>
              <span className="text-muted-foreground text-xs">
                {contact.totalInterviews} no total
              </span>
            </div>
            {contact.interviews.length ? (
              <ul className="mt-4 space-y-3">
                {contact.interviews.map((interview) => (
                  <li
                    key={interview.id}
                    className="border-border rounded-lg border p-4"
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Link
                            href={`/dashboard/entrevistas/${interview.id}`}
                            className="truncate text-sm font-medium hover:underline"
                          >
                            {interview.application.job_title}
                          </Link>
                          <span className="bg-muted text-muted-foreground rounded-full px-2 py-1 text-[10px]">
                            {formatInterviewResult(interview.result)}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-1 text-xs">
                          {formatInterviewType(interview.type)}
                        </p>
                        <LocalDateTime
                          value={interview.scheduled_at}
                          className="mt-3 block text-xs font-medium"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {interview.meeting_url ? (
                          <a
                            href={interview.meeting_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={buttonStyles({
                              variant: "ghost",
                              size: "sm",
                            })}
                          >
                            Reunião
                            <ExternalLink
                              className="size-3.5"
                              aria-hidden="true"
                            />
                          </a>
                        ) : null}
                        <Link
                          href={`/dashboard/entrevistas/${interview.id}/preparacao`}
                          className={buttonStyles({
                            variant: "secondary",
                            size: "sm",
                          })}
                        >
                          Preparar
                        </Link>
                        <Link
                          href={`/dashboard/entrevistas/${interview.id}/retrospectiva`}
                          className={buttonStyles({
                            variant: "ghost",
                            size: "sm",
                          })}
                        >
                          Retrospectiva
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground mt-4 text-sm">
                Nenhuma entrevista registrada com este contato.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
