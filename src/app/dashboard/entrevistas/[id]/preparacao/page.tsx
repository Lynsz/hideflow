import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  NotebookPen,
  UserRound,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { buttonStyles } from "@/components/ui/button";
import { LocalDateTime } from "@/components/ui/local-date-time";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { InterviewPreparationForm } from "@/features/interview-preparation/components/interview-preparation-form";
import {
  getInterviewPreparation,
  toInterviewPreparationValues,
} from "@/features/interview-preparation/services/interview-preparation-service";
import {
  formatInterviewResult,
  formatInterviewType,
} from "@/features/interviews/constants";
import { getInterviewById } from "@/features/interviews/services/interview-service";

export const metadata: Metadata = { title: "Preparação da entrevista" };

const interviewIdSchema = z.uuid();

export default async function InterviewPreparationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [{ id }, user] = await Promise.all([params, getCurrentUser()]);
  const parsedId = interviewIdSchema.safeParse(id);
  if (!parsedId.success) notFound();

  const [interview, preparation] = await Promise.all([
    getInterviewById(user!.id, parsedId.data),
    getInterviewPreparation(user!.id, parsedId.data),
  ]);
  if (!interview) notFound();

  const interviewer =
    interview.contact?.name ?? interview.interviewer_name ?? "Não informado";

  return (
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <Link
        href="/dashboard/entrevistas"
        className={buttonStyles({ variant: "ghost", className: "-ml-3" })}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar para entrevistas
      </Link>

      <header className="mt-5">
        <p className="text-muted-foreground text-xs font-medium">
          Preparação individual
        </p>
        <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
          Prepare sua entrevista
          <NotebookPen className="text-accent size-5" aria-hidden="true" />
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Organize fatos, exemplos e perguntas para chegar ao encontro com mais
          clareza.
        </p>
      </header>

      <section className="border-border bg-surface mt-7 rounded-xl border p-5 sm:p-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-medium">
                {interview.application.job_title}
              </h2>
              <span className="bg-muted text-muted-foreground rounded-full px-2 py-1 text-[10px]">
                {formatInterviewResult(interview.result)}
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-sm">
              {formatInterviewType(interview.type)}
            </p>
          </div>
          <LocalDateTime
            value={interview.scheduled_at}
            className="text-sm font-medium"
          />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="bg-muted/40 rounded-lg p-3">
            <p className="text-muted-foreground flex items-center gap-2 text-[11px]">
              <Building2 className="size-3.5" aria-hidden="true" />
              Empresa
            </p>
            <p className="mt-1.5 truncate text-sm">
              {interview.application.company.name}
            </p>
          </div>
          <div className="bg-muted/40 rounded-lg p-3">
            <p className="text-muted-foreground flex items-center gap-2 text-[11px]">
              <UserRound className="size-3.5" aria-hidden="true" />
              Entrevistador
            </p>
            <p className="mt-1.5 truncate text-sm">{interviewer}</p>
          </div>
          <div className="bg-muted/40 rounded-lg p-3">
            <p className="text-muted-foreground flex items-center gap-2 text-[11px]">
              <BriefcaseBusiness className="size-3.5" aria-hidden="true" />
              Candidatura
            </p>
            <Link
              href={`/dashboard/candidaturas/${interview.application_id}`}
              className="text-accent mt-1.5 inline-block text-sm hover:underline"
            >
              Abrir processo
            </Link>
          </div>
        </div>

        {interview.meeting_url ? (
          <a
            href={interview.meeting_url}
            target="_blank"
            rel="noreferrer"
            className="text-accent mt-4 inline-flex items-center gap-1.5 text-xs hover:underline"
          >
            Abrir link da reunião
            <ExternalLink className="size-3.5" aria-hidden="true" />
          </a>
        ) : null}
      </section>

      <div className="mt-4">
        <InterviewPreparationForm
          interviewId={parsedId.data}
          defaultValues={toInterviewPreparationValues(preparation)}
        />
      </div>
    </main>
  );
}
