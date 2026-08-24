import {
  ClipboardCheck,
  ExternalLink,
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
import type { InterviewListItem } from "@/features/interviews/types/interview";

export function InterviewCard({ interview }: { interview: InterviewListItem }) {
  return (
    <article className="border-border bg-surface rounded-xl border p-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">{interview.application.job_title}</h3>
            <span className="bg-muted text-muted-foreground rounded-full px-2 py-1 text-[10px]">
              {formatInterviewResult(interview.result)}
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
        </div>
        <div className="flex shrink-0 flex-wrap items-start gap-1">
          <Link
            href={`/dashboard/candidaturas/${interview.application_id}`}
            className={buttonStyles({ variant: "ghost", size: "sm" })}
          >
            Candidatura
          </Link>
          <Link
            href={`/dashboard/entrevistas/${interview.id}/preparacao`}
            className={buttonStyles({ variant: "secondary", size: "sm" })}
          >
            <ClipboardCheck className="size-3.5" aria-hidden="true" />
            Preparar
          </Link>
          <Link
            href={`/dashboard/entrevistas/${interview.id}/retrospectiva`}
            className={buttonStyles({ variant: "secondary", size: "sm" })}
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
