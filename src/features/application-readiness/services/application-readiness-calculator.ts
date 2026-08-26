import {
  ACTIVE_APPLICATION_STATUSES,
  INTERVIEW_APPLICATION_STATUSES,
} from "@/features/applications/constants";
import type {
  ApplicationReadinessInput,
  ApplicationReadinessItem,
  ApplicationReadinessResult,
} from "@/features/application-readiness/types/application-readiness";

const ACTIVE_STATUSES = new Set(ACTIVE_APPLICATION_STATUSES);
const INTERVIEW_STATUSES = new Set(INTERVIEW_APPLICATION_STATUSES);
const FUTURE_INTERVIEW_RESULTS = new Set(["scheduled", "rescheduled"]);

function hasText(value: string | null) {
  return Boolean(value?.trim());
}

function isFutureInterview(
  interview: ApplicationReadinessInput["interviews"][number],
  now: string,
) {
  const scheduledAt = Date.parse(interview.scheduledAt);
  const reference = Date.parse(now);

  return (
    FUTURE_INTERVIEW_RESULTS.has(interview.result) &&
    Number.isFinite(scheduledAt) &&
    Number.isFinite(reference) &&
    scheduledAt >= reference
  );
}

function item(
  values: Omit<ApplicationReadinessItem, "action">,
  incompleteAction = "Completar",
): ApplicationReadinessItem {
  return {
    ...values,
    action: values.complete ? "Revisar" : incompleteAction,
  };
}

export function calculateApplicationReadiness(
  input: ApplicationReadinessInput,
): ApplicationReadinessResult | null {
  if (input.archivedAt || !ACTIVE_STATUSES.has(input.status)) return null;

  const editHref = `/dashboard/candidaturas/${input.id}/editar`;
  const contextComplete =
    hasText(input.jobUrl) &&
    (hasText(input.description) || hasText(input.notes));
  const hasPendingReminder = input.reminders.some(
    (reminder) => reminder.completedAt === null,
  );
  const hasFutureInterview = input.interviews.some((interview) =>
    isFutureInterview(interview, input.now),
  );
  const hasNextStep = hasPendingReminder || hasFutureInterview;
  const hasResume = input.documents.some(
    (document) => document.documentType === "resume",
  );

  const items: ApplicationReadinessItem[] = [
    item({
      key: "context",
      label: "Contexto da vaga",
      description: contextComplete
        ? "Link e contexto da oportunidade registrados."
        : "Adicione o link da vaga e uma descrição ou observação útil.",
      complete: contextComplete,
      href: editHref,
    }),
    item({
      key: "technologies",
      label: "Competências principais",
      description: input.technologiesCount
        ? "Tecnologias relevantes vinculadas à candidatura."
        : "Mapeie as competências principais desta vaga.",
      complete: input.technologiesCount > 0,
      href: "#tecnologias",
    }),
    item({
      key: "contact",
      label: "Contato do processo",
      description: input.contactsCount
        ? "Há pelo menos um contato vinculado ao processo."
        : "Vincule recrutador, gestor ou entrevistador quando disponível.",
      complete: input.contactsCount > 0,
      href: "#contatos",
    }),
    item({
      key: "resume",
      label: "Currículo utilizado",
      description: hasResume
        ? "O currículo desta candidatura está anexado."
        : "Anexe o currículo usado nesta candidatura.",
      complete: hasResume,
      href: "#documentos",
    }),
    item(
      {
        key: "next_step",
        label: "Próximo passo",
        description: hasNextStep
          ? "Há um lembrete pendente ou uma entrevista futura."
          : "Defina um lembrete ou agende a próxima entrevista.",
        complete: hasNextStep,
        href: hasPendingReminder
          ? "#lembretes"
          : hasFutureInterview
            ? "#entrevistas"
            : `/dashboard/lembretes/novo?application=${input.id}`,
      },
      "Criar lembrete",
    ),
  ];

  if (INTERVIEW_STATUSES.has(input.status)) {
    items.push(
      item({
        key: "interview",
        label: "Entrevista registrada",
        description: input.interviews.length
          ? "A etapa de entrevista possui registro no processo."
          : "Registre a entrevista correspondente ao estágio atual.",
        complete: input.interviews.length > 0,
        href: "#entrevistas",
      }),
    );
  }

  if (input.status === "offer") {
    items.push(
      item({
        key: "offer",
        label: "Proposta estruturada",
        description: input.hasOffer
          ? "Remuneração e condições da proposta estão registradas."
          : "Registre remuneração, prazo e condições da proposta.",
        complete: input.hasOffer,
        href: "#proposta",
      }),
    );
  }

  const completed = items.filter(
    (readinessItem) => readinessItem.complete,
  ).length;
  const percentage = Math.round((completed / items.length) * 100);

  return {
    items,
    completed,
    total: items.length,
    percentage,
    state:
      percentage === 100
        ? "ready"
        : completed > 0
          ? "in_progress"
          : "needs_attention",
  };
}
