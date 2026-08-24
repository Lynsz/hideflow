import {
  BriefcaseBusiness,
  Building2,
  ExternalLink,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { LocalDateTime } from "@/components/ui/local-date-time";
import {
  formatInterviewResult,
  formatInterviewType,
} from "@/features/interviews/constants";
import type { InterviewListItem } from "@/features/interviews/types/interview";

export function InterviewWorkspaceContext({
  interview,
}: {
  interview: InterviewListItem;
}) {
  const interviewer =
    interview.contact?.name ?? interview.interviewer_name ?? "Não informado";

  return (
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
  );
}
