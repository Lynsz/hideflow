import {
  ArrowUpRight,
  BookOpenCheck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Gauge,
  MailCheck,
  SlidersHorizontal,
  Star,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { inputStyles } from "@/components/ui/form-styles";
import { LocalDateTime } from "@/components/ui/local-date-time";
import { getCurrentUser } from "@/features/auth/services/get-current-user";
import {
  INTERVIEW_LEARNING_RATINGS,
  INTERVIEW_LEARNING_SORTS,
  INTERVIEW_LEARNING_THANK_YOU_FILTERS,
} from "@/features/interview-learning/constants";
import {
  buildInterviewLearningUrl,
  parseInterviewLearningFilters,
} from "@/features/interview-learning/services/interview-learning-filters";
import { getInterviewLearningCenter } from "@/features/interview-learning/services/interview-learning-service";
import type { InterviewLearningMetrics } from "@/features/interview-learning/types/interview-learning";
import {
  formatInterviewResult,
  formatInterviewType,
  INTERVIEW_TYPES,
} from "@/features/interviews/constants";

export const metadata: Metadata = { title: "Aprendizados de entrevistas" };

type InterviewLearningsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function MetricCards({ metrics }: { metrics: InterviewLearningMetrics }) {
  const cards = [
    {
      label: "Retrospectivas",
      value: String(metrics.totalDebriefs),
      supportingText: "registros privados criados",
      icon: BookOpenCheck,
    },
    {
      label: "Cobertura",
      value: `${metrics.coveragePercentage}%`,
      supportingText: `${metrics.completedInterviews} entrevistas finalizadas`,
      icon: Gauge,
    },
    {
      label: "Avaliação média",
      value: metrics.averageRating?.toLocaleString("pt-BR") ?? "—",
      supportingText: "escala pessoal de 1 a 5",
      icon: Star,
    },
    {
      label: "Agradecimentos",
      value: String(metrics.pendingThankYous),
      supportingText: "ainda não marcados como enviados",
      icon: MailCheck,
    },
  ];

  return (
    <section
      className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Resumo dos aprendizados"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <article
            key={card.label}
            className="border-border bg-surface rounded-xl border p-5"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-muted-foreground text-xs">{card.label}</p>
              <span className="bg-muted text-muted-foreground grid size-8 place-items-center rounded-lg">
                <Icon className="size-4" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-semibold tracking-[-0.04em]">
              {card.value}
            </p>
            <p className="text-muted-foreground mt-1.5 text-[11px]">
              {card.supportingText}
            </p>
          </article>
        );
      })}
    </section>
  );
}

function RatingDistribution({
  metrics,
}: {
  metrics: InterviewLearningMetrics;
}) {
  return (
    <section className="border-border bg-surface mt-4 rounded-xl border p-5 sm:p-6">
      <div>
        <h2 className="font-medium">Distribuição das avaliações</h2>
        <p className="text-muted-foreground mt-1 text-xs">
          Percepção registrada pelo próprio usuário após cada entrevista.
        </p>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-5">
        {metrics.ratingDistribution.map((item) => (
          <div key={item.rating}>
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="flex items-center gap-1 font-medium">
                {item.rating}
                <Star className="text-accent size-3" aria-hidden="true" />
              </span>
              <span className="text-muted-foreground">{item.count}</span>
            </div>
            <div className="bg-muted mt-2 h-2 overflow-hidden rounded-full">
              <div
                className="bg-accent h-full rounded-full"
                style={{ width: `${item.percentage}%` }}
                aria-hidden="true"
              />
            </div>
            <p className="text-muted-foreground mt-1.5 text-[10px]">
              {item.percentage}% das avaliadas
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

function LearningText({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  if (!value) return null;

  return (
    <div className="bg-muted/40 rounded-lg p-3">
      <dt className="text-muted-foreground text-[10px] tracking-wide uppercase">
        {label}
      </dt>
      <dd className="mt-1.5 line-clamp-3 text-xs leading-5 whitespace-pre-wrap">
        {value}
      </dd>
    </div>
  );
}

export default async function InterviewLearningsPage({
  searchParams,
}: InterviewLearningsPageProps) {
  const [rawFilters, user] = await Promise.all([
    searchParams,
    getCurrentUser(),
  ]);
  const filters = parseInterviewLearningFilters(rawFilters);
  const { metrics, learnings } = await getInterviewLearningCenter(
    user!.id,
    filters,
  );
  const hasFilters = Boolean(
    filters.interviewType ||
    filters.rating ||
    filters.thankYou !== "all" ||
    filters.sort !== "recent",
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 md:px-8 md:py-8">
      <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-muted-foreground text-xs font-medium">
            Evolução profissional
          </p>
          <h1 className="mt-1.5 flex items-center gap-2 text-2xl font-semibold tracking-[-0.035em] sm:text-3xl">
            Central de aprendizados
            <BookOpenCheck className="text-accent size-5" aria-hidden="true" />
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Compare suas retrospectivas e leve evidências para a próxima
            conversa.
          </p>
        </div>
        <Link
          href="/dashboard/entrevistas"
          className={buttonStyles({ variant: "secondary" })}
        >
          Abrir entrevistas
        </Link>
      </header>

      <MetricCards metrics={metrics} />
      <RatingDistribution metrics={metrics} />

      <form className="border-border bg-surface mt-4 rounded-xl border p-4">
        <div className="flex items-center gap-2 text-sm font-medium">
          <SlidersHorizontal
            className="text-accent size-4"
            aria-hidden="true"
          />
          Filtros das retrospectivas
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <select
            name="type"
            defaultValue={filters.interviewType}
            className={inputStyles}
            aria-label="Tipo de entrevista"
          >
            <option value="">Todos os tipos</option>
            {INTERVIEW_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
          <select
            name="rating"
            defaultValue={filters.rating}
            className={inputStyles}
            aria-label="Avaliação da entrevista"
          >
            <option value="">Todas as avaliações</option>
            {INTERVIEW_LEARNING_RATINGS.map((rating) => (
              <option key={rating} value={rating}>
                Nota {rating}
              </option>
            ))}
          </select>
          <select
            name="thankYou"
            defaultValue={filters.thankYou}
            className={inputStyles}
            aria-label="Situação do agradecimento"
          >
            {INTERVIEW_LEARNING_THANK_YOU_FILTERS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            name="sort"
            defaultValue={filters.sort}
            className={inputStyles}
            aria-label="Ordenação"
          >
            {INTERVIEW_LEARNING_SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-3 flex justify-end gap-2">
          {hasFilters ? (
            <Link
              href="/dashboard/aprendizados"
              className={buttonStyles({ variant: "ghost" })}
            >
              Limpar
            </Link>
          ) : null}
          <button
            type="submit"
            className={buttonStyles({ variant: "secondary" })}
          >
            Aplicar filtros
          </button>
        </div>
      </form>

      <section className="mt-6" aria-label="Retrospectivas registradas">
        {learnings.items.length ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {learnings.items.map((learning) => {
              const application = learning.interview.application;
              return (
                <article
                  key={learning.id}
                  className="border-border bg-surface rounded-xl border p-5"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate text-sm font-medium">
                          {application.job_title}
                        </h2>
                        {application.archived_at ? (
                          <span className="border-border bg-muted text-muted-foreground rounded-full border px-2 py-1 text-[10px]">
                            Arquivada
                          </span>
                        ) : null}
                      </div>
                      <p className="text-muted-foreground mt-1 truncate text-xs">
                        {application.company.name} ·{" "}
                        {formatInterviewType(learning.interview.type)}
                      </p>
                    </div>
                    <span className="bg-muted flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium">
                      {learning.overall_rating ?? "—"}
                      <Star className="text-accent size-3" aria-hidden="true" />
                    </span>
                  </div>

                  <div className="text-muted-foreground mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px]">
                    <span>
                      {formatInterviewResult(learning.interview.result)} em{" "}
                      <LocalDateTime value={learning.interview.scheduled_at} />
                    </span>
                    <span>
                      Atualizada em{" "}
                      <LocalDateTime value={learning.updated_at} />
                    </span>
                  </div>

                  <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                    <LearningText
                      label="Funcionou bem"
                      value={learning.went_well}
                    />
                    <LearningText
                      label="Melhorar"
                      value={learning.improve_next_time}
                    />
                  </dl>

                  <div className="border-border mt-4 flex flex-col justify-between gap-3 border-t pt-4 sm:flex-row sm:items-center">
                    <p className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
                      {learning.thank_you_sent_at ? (
                        <>
                          <CheckCircle2
                            className="size-3.5 text-emerald-300"
                            aria-hidden="true"
                          />
                          Agradecimento marcado como enviado
                        </>
                      ) : (
                        <>
                          <ClipboardList
                            className="size-3.5"
                            aria-hidden="true"
                          />
                          Agradecimento ainda não marcado
                        </>
                      )}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/dashboard/candidaturas/${application.id}`}
                        className={buttonStyles({
                          variant: "ghost",
                          size: "sm",
                        })}
                      >
                        Candidatura
                      </Link>
                      <Link
                        href={`/dashboard/entrevistas/${learning.interview_id}/retrospectiva`}
                        className={buttonStyles({
                          variant: "secondary",
                          size: "sm",
                        })}
                      >
                        Abrir retrospectiva
                        <ArrowUpRight className="size-3.5" aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="border-border bg-surface rounded-xl border">
            <EmptyState
              title={
                hasFilters
                  ? "Nenhuma retrospectiva corresponde aos filtros"
                  : "Nenhuma retrospectiva registrada"
              }
              description={
                hasFilters
                  ? "Ajuste ou limpe os filtros para ampliar a consulta."
                  : "Abra uma entrevista e registre os primeiros aprendizados."
              }
            />
          </div>
        )}
      </section>

      {learnings.total > 0 ? (
        <nav
          className="mt-5 flex items-center justify-between gap-3"
          aria-label="Paginação"
        >
          <p className="text-muted-foreground text-xs">
            {learnings.total}{" "}
            {learnings.total === 1 ? "retrospectiva" : "retrospectivas"} ·
            página {learnings.page} de {learnings.totalPages}
          </p>
          <div className="flex gap-2">
            {learnings.page > 1 ? (
              <Link
                href={buildInterviewLearningUrl(filters, {
                  page: learnings.page - 1,
                })}
                className={buttonStyles({ variant: "secondary", size: "sm" })}
              >
                <ChevronLeft className="size-4" aria-hidden="true" />
                Anterior
              </Link>
            ) : null}
            {learnings.page < learnings.totalPages ? (
              <Link
                href={buildInterviewLearningUrl(filters, {
                  page: learnings.page + 1,
                })}
                className={buttonStyles({ variant: "secondary", size: "sm" })}
              >
                Próxima
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            ) : null}
          </div>
        </nav>
      ) : null}
    </main>
  );
}
