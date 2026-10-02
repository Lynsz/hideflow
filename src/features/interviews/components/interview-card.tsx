import {
  AlertCircle,
  ClipboardCheck,
  ExternalLink,
  LayoutDashboard,
  MessageSquareText,
  Pencil,
} from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { LocalDateTime } from "@/components/ui/local-date-time";
import { DeleteInterviewButton } from "@/features/interviews/components/delete-interview-button";
import {
  formatInterviewResult,
  formatInterviewType,
} from "@/features/interviews/constants";
import type { InterviewPortfolioItem } from "@/features/interviews/types/interview";

const STATE_LABELS: Record<InterviewPortfolioItem["state"], string> = {
  upcoming: "Próxima",
  awaiting: "Aguardando atualização",
  finished: "Finalizada",
};

function ProgressIndicator({
  label,
  completed,
  total,
  percentage,
}: {
  label: string;
  completed: number;
  total: number;
  percentage: number;
}) {
  return (
    <div className="bg-muted/40 rounded-lg p-3">
      <div className="flex items-center justify-between gap-2 text-[10px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">
          {completed}/{total}
        </span>
      </div>
      <div
        className="bg-muted mt-2 h-1.5 overflow-hidden rounded-full"
        role="progressbar"
        aria-label={`Progresso de ${label.toLowerCase()}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percentage}
      >
        <div
          className="bg-accent h-full rounded-full"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

export function InterviewCard({
  interview,
}: {
  interview: InterviewPortfolioItem;
}) {
  return (
    <article className="border-border bg-surface rounded-xl border p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">{interview.application.job_title}</h3>
            <span className="bg-muted text-muted-foreground rounded-full px-2 py-1 text-[10px]">
              {formatInterviewResult(interview.result)}
            </span>
            <span className="border-border text-muted-foreground rounded-full border px-2 py-1 text-[10px]">
              {STATE_LABELS[interview.state]}
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-xs">
            {interview.application.company.name} ·{" "}
            {formatInterviewType(interview.type)}
          </p>
          <LocalDateTime
            value={interview.scheduled_at}
            className="mt-4 block text-sm font-medium"
          />
          <p className="text-muted-foreground mt-1 text-xs">
            Entrevistador:{" "}
            {interview.contact?.name ??
              interview.interviewer_name ??
              "Não informado"}
          </p>
          {interview.meeting_url && (
            <a
              href={interview.meeting_url}
              target="_blank"
              rel="noreferrer"
              className="text-accent mt-3 inline-flex items-center gap-1 text-xs hover:underline"
            >
              Abrir reunião
              <ExternalLink className="size-3" />
            </a>
          )}
          <div className="mt-4 grid max-w-xl gap-2 sm:grid-cols-2">
            <ProgressIndicator
              label="Preparação"
              completed={interview.preparationCompleted}
              total={interview.preparationTotal}
              percentage={interview.preparationPercentage}
            />
            <ProgressIndicator
              label="Retrospectiva"
              completed={interview.debriefCompleted}
              total={interview.debriefTotal}
              percentage={interview.debriefPercentage}
            />
          </div>
          {interview.thankYouPending ? (
            <p className="text-muted-foreground mt-3 flex items-center gap-1.5 text-xs">
              <AlertCircle
                className="text-accent size-3.5"
                aria-hidden="true"
              />
              Agradecimento ainda não registrado
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-wrap items-start gap-1">
          <Link
            href={`/dashboard/entrevistas/${interview.id}`}
            className={buttonStyles({ variant: "secondary", size: "sm" })}
          >
            <LayoutDashboard className="size-3.5" aria-hidden="true" />
            Visão geral
          </Link>
          <Link
            href={`/dashboard/entrevistas/${interview.id}/preparacao`}
            className={buttonStyles({ variant: "ghost", size: "sm" })}
          >
            <ClipboardCheck className="size-3.5" aria-hidden="true" />
            Preparar
          </Link>
          <Link
            href={`/dashboard/entrevistas/${interview.id}/retrospectiva`}
            className={buttonStyles({ variant: "ghost", size: "sm" })}
          >
            <MessageSquareText className="size-3.5" aria-hidden="true" />
            Retrospectiva
          </Link>
          <Link
            href={`/dashboard/entrevistas/${interview.id}/editar`}
            className={buttonStyles({ variant: "ghost", size: "sm" })}
          >
            <Pencil className="size-3.5" />
            Editar
          </Link>
          <DeleteInterviewButton
            interviewId={interview.id}
            applicationId={interview.application_id}
          />
        </div>
      </div>
    </article>
  );
}
