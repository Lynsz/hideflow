import { ArrowLeft, ArrowRight, ExternalLink, Pencil } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { buttonStyles } from "@/components/ui/button";
import { FormFeedback } from "@/components/ui/form-feedback";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { DeleteApplicationButton } from "@/features/applications/components/application-actions";
import { StatusSelect } from "@/features/applications/components/status-select";
import {
  formatDate,
  formatDateTime,
  formatEmploymentType,
  formatSalary,
  formatStatus,
  formatWorkMode,
} from "@/features/applications/services/application-formatters";
import { getApplicationById } from "@/features/applications/services/application-service";
import { StatusBadge } from "@/features/dashboard/components/status-badge";

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
              {formatDateTime(application.created_at)}
            </DetailItem>
            <DetailItem label="Atualizada em">
              {formatDateTime(application.updated_at)}
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
            <h2 className="font-medium">Histórico</h2>
            {application.history.length === 0 ? (
              <p className="text-muted-foreground mt-4 text-sm">
                Nenhuma mudança de status registrada.
              </p>
            ) : (
              <ol className="mt-5 space-y-5">
                {application.history.map((event) => (
                  <li key={event.id} className="relative pl-5">
                    <span className="bg-accent absolute top-1.5 left-0 size-2 rounded-full" />
                    <div className="flex flex-wrap items-center gap-1.5 text-sm">
                      <span>
                        {event.from_status
                          ? formatStatus(event.from_status)
                          : "Início"}
                      </span>
                      <ArrowRight
                        className="text-muted-foreground size-3.5"
                        aria-hidden="true"
                      />
                      <span className="font-medium">
                        {formatStatus(event.to_status)}
                      </span>
                    </div>
                    <time className="text-muted-foreground mt-1 block text-xs">
                      {formatDateTime(event.created_at)}
                    </time>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
