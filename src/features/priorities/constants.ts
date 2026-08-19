export const PRIORITY_WINDOW_DAYS = 7;
export const PRIORITY_OVERDUE_LOOKBACK_DAYS = 30;
export const STALE_APPLICATION_DAYS = 14;
export const PRIORITY_SOURCE_LIMIT = 100;

export const PRIORITY_FILTERS = [
  "all",
  "overdue",
  "offers",
  "interviews",
  "stale",
] as const;

export type PriorityFilter = (typeof PRIORITY_FILTERS)[number];

export const PRIORITY_FILTER_LABELS: Record<PriorityFilter, string> = {
  all: "Todas",
  overdue: "Atrasadas",
  offers: "Propostas",
  interviews: "Entrevistas",
  stale: "Paradas",
};

export const PRIORITY_KIND_LABELS = {
  overdue_reminder: "Lembrete atrasado",
  offer_deadline: "Prazo de proposta",
  upcoming_interview: "Entrevista próxima",
  stale_application: "Candidatura parada",
} as const;
