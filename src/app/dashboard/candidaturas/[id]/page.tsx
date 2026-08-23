import {
  ArrowLeft,
  ClipboardCheck,
  ExternalLink,
  Pencil,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonStyles } from "@/components/ui/button";
import { FormFeedback } from "@/components/ui/form-feedback";
import { LocalDateTime } from "@/components/ui/local-date-time";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { ActivityForm } from "@/features/activities/components/activity-form";
import {
  ArchiveApplicationButton,
  DeleteApplicationButton,
} from "@/features/applications/components/application-actions";
import { ApplicationTimeline } from "@/features/applications/components/application-timeline";
import { StatusSelect } from "@/features/applications/components/status-select";
import {
  formatDate,
  formatEmploymentType,
  formatSalary,
  formatStatus,
  formatWorkMode,
} from "@/features/applications/services/application-formatters";
import { getApplicationById } from "@/features/applications/services/application-service";
import { buildApplicationTimeline } from "@/features/applications/services/application-timeline";
import { ApplicationContactManager } from "@/features/contacts/components/application-contact-manager";
import { getContactsByCompany } from "@/features/contacts/services/contact-service";
import { StatusBadge } from "@/features/dashboard/components/status-badge";
import { DocumentManager } from "@/features/documents/components/document-manager";
import {
  formatInterviewResult,
  formatInterviewType,
} from "@/features/interviews/constants";
import { ReminderCard } from "@/features/reminders/components/reminder-card";
import { OfferManager } from "@/features/offers/components/offer-manager";
import { ApplicationTechnologyManager } from "@/features/technologies/components/application-technology-manager";
import { getTechnologyOptions } from "@/features/technologies/services/technology-service";

type ApplicationDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ feedback?: string }>;
};

const FEEDBACK: Record<string, string> = {
  created: "Candidatura criada com sucesso.",
  updated: "Candidatura atualizada com sucesso.",
};

function DetailItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-muted-foreground text-xs">{label}</dt>
      <dd className="mt-1.5 text-sm">{children}</dd>
    </div>
  );
}

export default async function ApplicationDetailPage({
  params,
  searchParams,
}: ApplicationDetailPageProps) {
  const [{ id }, { feedback = "" }, user] = await Promise.all([
    params,
    searchParams,
    getCurrentUser(),
  ]);
  const application = await getApplicationById(user!.id, id);
  if (!application) notFound();
  const [companyContacts, technologyOptions] = await Promise.all([
    getContactsByCompany(user!.id, application.company_id),
    getTechnologyOptions(user!.id),
  ]);
  const linkedIds = new Set(application.contacts.map((contact) => contact.id));
  const availableContacts = companyContacts.filter(
    (contact) => !linkedIds.has(contact.id),
  );
  const timeline = buildApplicationTimeline(
    application.created_at,
    application.history,
    application.interviewEvents,
    application.activities,
  );
  const now = new Date().toISOString();

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <Link
        href="/dashboard/candidaturas"
        className={buttonStyles({ variant: "ghost", className: "-ml-3" })}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar para candidaturas
      </Link>

      {FEEDBACK[feedback] ? (
        <div className="mt-5">
          <FormFeedback kind="success" message={FEEDBACK[feedback]} />
        </div>
      ) : null}

      {application.archived_at ? (
        <div className="border-border bg-muted/40 mt-5 rounded-xl border px-4 py-3 text-sm">
          <p className="font-medium">Candidatura arquivada</p>
          <p className="text-muted-foreground mt-1 text-xs">
            Fora da lista ativa e do Kanban desde{" "}
            <LocalDateTime value={application.archived_at} />. Histórico e
            registros continuam disponíveis.
          </p>
        </div>
      ) : null}

      <header className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
              {application.job_title}
            </h1>
            <StatusBadge status={application.status} />
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            {application.company.name}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ArchiveApplicationButton
            applicationId={application.id}
            jobTitle={application.job_title}
            archived={application.archived_at !== null}
          />
          <Link
            href={`/dashboard/candidaturas/${application.id}/editar`}
            className={buttonStyles({ variant: "secondary" })}
          >
            <Pencil className="size-4" aria-hidden="true" />
            Editar
          </Link>
          <DeleteApplicationButton
            applicationId={application.id}
            jobTitle={application.job_title}
            companyName={application.company.name}
          />
        </div>
      </header>

      <div className="mt-7 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <section className="border-border bg-surface rounded-xl border p-5 sm:p-6">
          <h2 className="font-medium">Informações da candidatura</h2>
          <dl className="mt-6 grid gap-6 sm:grid-cols-2">
            <DetailItem label="Empresa">{application.company.name}</DetailItem>
            <DetailItem label="Status">
              {formatStatus(application.status)}
            </DetailItem>
            <DetailItem label="Modalidade">
              {formatWorkMode(application.work_mode)}
            </DetailItem>
            <DetailItem label="Contratação">
              {formatEmploymentType(application.employment_type)}
            </DetailItem>
            <DetailItem label="Localização">
              {application.location || "Não informada"}
            </DetailItem>
            <DetailItem label="Faixa salarial">
              {formatSalary(application)}
            </DetailItem>
            <DetailItem label="Data da candidatura">
              {formatDate(application.applied_at)}
            </DetailItem>
            <DetailItem label="Fonte">
              {application.source || "Não informada"}
            </DetailItem>
            <DetailItem label="URL da vaga">
              {application.job_url ? (
                <a
                  href={application.job_url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent inline-flex items-center gap-1.5 hover:underline"
                >
                  Abrir vaga
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
              ) : (
                "Não informada"
              )}
            </DetailItem>
            <DetailItem label="Criada em">
              <LocalDateTime value={application.created_at} />
            </DetailItem>
            <DetailItem label="Atualizada em">
              <LocalDateTime value={application.updated_at} />
            </DetailItem>
          </dl>

          {application.description ? (
            <div className="border-border mt-7 border-t pt-6">
              <h3 className="text-muted-foreground text-xs">Descrição</h3>
              <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">
                {application.description}
              </p>
            </div>
          ) : null}
          {application.notes ? (
            <div className="border-border mt-6 border-t pt-6">
              <h3 className="text-muted-foreground text-xs">Observações</h3>
              <p className="mt-2 text-sm leading-6 whitespace-pre-wrap">
                {application.notes}
              </p>
            </div>
          ) : null}
        </section>

        <div className="space-y-4">
          <section className="border-border bg-surface rounded-xl border p-5">
            <h2 className="font-medium">Pipeline</h2>
            <div className="mt-5">
              <StatusSelect
                applicationId={application.id}
                currentStatus={application.status}
              />
            </div>
          </section>

          <section className="border-border bg-surface rounded-xl border p-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-medium">Contatos</h2>
              <Link
                className="text-accent text-xs hover:underline"
                href={`/dashboard/contatos/novo?company=${application.company_id}`}
              >
                Novo contato
              </Link>
            </div>
            <div className="mt-4">
              <ApplicationContactManager
                applicationId={application.id}
                linked={application.contacts}
                available={availableContacts}
              />
            </div>
          </section>

          <ApplicationTechnologyManager
            applicationId={application.id}
            linked={application.technologies}
            suggestions={technologyOptions}
          />
        </div>
      </div>

      <section className="border-border bg-surface mt-4 rounded-xl border p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-medium">Entrevistas</h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Agenda e resultados deste processo.
            </p>
          </div>
          <Link
            href={`/dashboard/entrevistas/nova?application=${application.id}`}
            className={buttonStyles({ variant: "secondary", size: "sm" })}
          >
            <Plus className="size-4" />
            Agendar entrevista
          </Link>
        </div>
        {application.interviews.length ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {application.interviews.map((interview) => (
              <article
                key={interview.id}
                className="bg-muted/40 rounded-lg p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">
                    {formatInterviewType(interview.type)}
                  </p>
                  <span className="bg-muted rounded-full px-2 py-1 text-[10px]">
                    {formatInterviewResult(interview.result)}
                  </span>
                </div>
                <LocalDateTime
                  value={interview.scheduled_at}
                  className="mt-3 block text-sm"
                />
                <p className="text-muted-foreground mt-1 text-xs">
                  {interview.contact?.name ??
                    interview.interviewer_name ??
                    "Entrevistador não informado"}
                </p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                  <Link
                    className="text-accent inline-flex items-center gap-1 hover:underline"
                    href={`/dashboard/entrevistas/${interview.id}/preparacao`}
                  >
                    <ClipboardCheck className="size-3.5" aria-hidden="true" />
                    Preparar
                  </Link>
                  <Link
                    className="text-muted-foreground hover:text-foreground hover:underline"
                    href={`/dashboard/entrevistas/${interview.id}/editar`}
                  >
                    Editar entrevista
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground mt-5 text-sm">
            Nenhuma entrevista agendada.
          </p>
        )}
      </section>

      <DocumentManager
        applicationId={application.id}
        documents={application.documents}
      />

      <OfferManager
        applicationId={application.id}
        offer={application.offer}
        defaultCurrency={application.currency}
        today={now.slice(0, 10)}
      />

      <section className="border-border bg-surface mt-4 rounded-xl border p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-medium">Lembretes</h2>
            <p className="text-muted-foreground mt-1 text-xs">
              Follow-ups e próximos passos deste processo.
            </p>
          </div>
          <Link
            href={`/dashboard/lembretes/novo?application=${application.id}`}
            className={buttonStyles({ variant: "secondary", size: "sm" })}
          >
            <Plus className="size-4" aria-hidden="true" />
            Novo lembrete
          </Link>
        </div>
        {application.reminders.length ? (
          <div className="mt-5 space-y-3">
            {application.reminders.map((reminder) => (
              <ReminderCard
                key={reminder.id}
                now={now}
                stayOnPage
                reminder={{
                  ...reminder,
                  application: {
                    id: application.id,
                    job_title: application.job_title,
                    company: application.company,
                  },
                }}
              />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground mt-5 text-sm">
            Nenhum lembrete criado para esta candidatura.
          </p>
        )}
      </section>

      <section className="border-border bg-surface mt-4 rounded-xl border p-5 sm:p-6">
        <div>
          <h2 className="font-medium">Registrar interação</h2>
          <p className="text-muted-foreground mt-1 text-xs">
            Anote manualmente contatos e acontecimentos deste processo.
          </p>
        </div>
        <ActivityForm applicationId={application.id} defaultOccurredAt={now} />
      </section>

      <section className="border-border bg-surface mt-4 rounded-xl border p-5 sm:p-6">
        <h2 className="font-medium">Timeline</h2>
        <p className="text-muted-foreground mt-1 text-xs">
          Status, entrevistas e interações mais recentes primeiro.
        </p>
        <ApplicationTimeline events={timeline} />
      </section>
    </main>
  );
}
