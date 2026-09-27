import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  ExternalLink,
  MessageSquareText,
  NotebookPen,
  Pencil,
  Send,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { buttonStyles } from "@/components/ui/button";
import { FormFeedback } from "@/components/ui/form-feedback";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import { calculateInterviewDebriefProgress } from "@/features/interview-debrief/services/interview-debrief-calculator";
import {
  getInterviewDebrief,
  toInterviewDebriefValues,
} from "@/features/interview-debrief/services/interview-debrief-service";
import { calculateInterviewPreparationProgress } from "@/features/interview-preparation/services/interview-preparation-calculator";
import {
  getInterviewPreparation,
  toInterviewPreparationValues,
} from "@/features/interview-preparation/services/interview-preparation-service";
import { InterviewWorkspaceContext } from "@/features/interviews/components/interview-workspace-context";
import { InterviewWorkspaceNavigation } from "@/features/interviews/components/interview-workspace-navigation";
import { getInterviewById } from "@/features/interviews/services/interview-service";

export const metadata: Metadata = { title: "Visão geral da entrevista" };

const interviewIdSchema = z.uuid();

const FEEDBACK: Record<string, string> = {
  created: "Entrevista criada com sucesso.",
  updated: "Entrevista atualizada com sucesso.",
  result: "Resultado da entrevista atualizado.",
};

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
}) {
  return (
    <article className="border-border bg-surface rounded-xl border p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">{label}</p>
        <Icon className="text-accent size-4" aria-hidden="true" />
      </div>
      <p className="mt-3 text-2xl font-semibold tracking-[-0.04em]">{value}</p>
      <p className="text-muted-foreground mt-1 text-xs">{detail}</p>
    </article>
  );
}

function ProgressCard({
  title,
  description,
  completed,
  total,
  percentage,
  href,
  action,
  icon: Icon,
}: {
  title: string;
  description: string;
  completed: number;
  total: number;
  percentage: number;
  href: string;
  action: string;
  icon: LucideIcon;
}) {
  return (
    <article className="border-border bg-surface rounded-xl border p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-medium">
            <Icon className="text-accent size-4" aria-hidden="true" />
            {title}
          </h2>
          <p className="text-muted-foreground mt-1.5 text-sm">{description}</p>
        </div>
        <span className="text-accent text-sm font-semibold">{percentage}%</span>
      </div>
      <div
        className="bg-muted mt-5 h-2 overflow-hidden rounded-full"
        role="progressbar"
        aria-label={`Progresso de ${title.toLowerCase()}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
      >
        <div
          className="bg-accent h-full rounded-full transition-[width]"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-xs">
          {completed} de {total} seções preenchidas
        </p>
        <Link
          href={href}
          className={buttonStyles({ variant: "secondary", size: "sm" })}
        >
          {action}
        </Link>
      </div>
    </article>
  );
}

export default async function InterviewDetailPage({
  params,
  searchParams,
}: PageProps<"/dashboard/entrevistas/[id]">) {
  const [{ id }, { feedback }, user] = await Promise.all([
    params,
    searchParams,
    getCurrentUser(),
  ]);
  const parsedId = interviewIdSchema.safeParse(id);
  if (!parsedId.success) notFound();

  const [interview, preparation, debrief] = await Promise.all([
    getInterviewById(user!.id, parsedId.data),
    getInterviewPreparation(user!.id, parsedId.data),
    getInterviewDebrief(user!.id, parsedId.data),
  ]);
  if (!interview) notFound();

  const preparationProgress = calculateInterviewPreparationProgress(
    toInterviewPreparationValues(preparation),
  );
  const debriefProgress = calculateInterviewDebriefProgress(
    toInterviewDebriefValues(debrief),
  );
  const thankYouSent = debrief?.thank_you_sent_at != null;
  const feedbackMessage =
    typeof feedback === "string" ? FEEDBACK[feedback] : undefined;

  return (
    <main className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <Link
        href="/dashboard/entrevistas"
        className={buttonStyles({ variant: "ghost", className: "-ml-3" })}
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar para entrevistas
      </Link>

      {feedbackMessage ? (
        <div className="mt-5">
          <FormFeedback kind="success" message={feedbackMessage} />
        </div>
      ) : null}

      <header className="mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
        <div>
          <p className="text-muted-foreground text-xs font-medium">
            Espaço da entrevista
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            Visão geral
          </h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Centralize contexto, preparação e aprendizados deste encontro.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {interview.meeting_url ? (
            <a
              href={interview.meeting_url}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonStyles()}
            >
              <ExternalLink className="size-4" aria-hidden="true" />
              Abrir reunião
            </a>
          ) : null}
          <Link
            href={`/dashboard/entrevistas/${interview.id}/editar`}
            className={buttonStyles({ variant: "secondary" })}
          >
            <Pencil className="size-4" aria-hidden="true" />
            Editar
          </Link>
        </div>
      </header>

      <InterviewWorkspaceContext interview={interview} />
      <InterviewWorkspaceNavigation
        interviewId={interview.id}
        active="overview"
      />

      <section
        className="mt-5 grid gap-3 sm:grid-cols-3"
        aria-label="Resumo do espaço da entrevista"
      >
        <MetricCard
          label="Preparação"
          value={`${preparationProgress.percentage}%`}
          detail={`${preparationProgress.completed} de ${preparationProgress.total} seções`}
          icon={ClipboardCheck}
        />
        <MetricCard
          label="Retrospectiva"
          value={`${debriefProgress.percentage}%`}
          detail={`${debriefProgress.completed} de ${debriefProgress.total} seções`}
          icon={MessageSquareText}
        />
        <MetricCard
          label="Agradecimento"
          value={thankYouSent ? "Enviado" : "Pendente"}
          detail={
            thankYouSent ? "Follow-up registrado" : "Revise após a conversa"
          }
          icon={thankYouSent ? CheckCircle2 : Send}
        />
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <ProgressCard
          title="Preparação"
          description="Organize pesquisa, alinhamento, histórias STAR, perguntas e logística."
          completed={preparationProgress.completed}
          total={preparationProgress.total}
          percentage={preparationProgress.percentage}
          href={`/dashboard/entrevistas/${interview.id}/preparacao`}
          action={preparation ? "Continuar" : "Começar"}
          icon={NotebookPen}
        />
        <ProgressCard
          title="Retrospectiva"
          description="Registre a avaliação, aprendizados, perguntas recebidas e próximos passos."
          completed={debriefProgress.completed}
          total={debriefProgress.total}
          percentage={debriefProgress.percentage}
          href={`/dashboard/entrevistas/${interview.id}/retrospectiva`}
          action={debrief ? "Continuar" : "Começar"}
          icon={MessageSquareText}
        />
      </section>

      <section className="border-border bg-surface mt-5 rounded-xl border p-5 sm:p-6">
        <h2 className="font-medium">Anotações da entrevista</h2>
        {interview.notes ? (
          <p className="text-muted-foreground mt-4 text-sm leading-6 whitespace-pre-wrap">
            {interview.notes}
          </p>
        ) : (
          <p className="text-muted-foreground mt-4 text-sm">
            Nenhuma anotação geral registrada. Use a edição para adicionar
            contexto rápido sobre este encontro.
          </p>
        )}
      </section>
    </main>
  );
}
