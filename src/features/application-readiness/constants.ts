export const READINESS_CENTER_APPLICATION_LIMIT = 200;
export const READINESS_CENTER_PAGE_SIZE = 500;

export const READINESS_CENTER_FILTERS = ["all", "incomplete", "ready"] as const;

export type ReadinessCenterFilter = (typeof READINESS_CENTER_FILTERS)[number];

export const READINESS_CENTER_FILTER_LABELS: Record<
  ReadinessCenterFilter,
  string
> = {
  all: "Todas",
  incomplete: "Pendentes",
  ready: "Prontas",
};

export const READINESS_GAP_KEYS = [
  "context",
  "technologies",
  "contact",
  "resume",
  "next_step",
  "interview",
  "offer",
] as const;

export const READINESS_GAP_LABELS: Record<
  (typeof READINESS_GAP_KEYS)[number],
  string
> = {
  context: "Contexto da vaga",
  technologies: "Competências principais",
  contact: "Contato do processo",
  resume: "Currículo utilizado",
  next_step: "Próximo passo",
  interview: "Entrevista registrada",
  offer: "Proposta estruturada",
};
