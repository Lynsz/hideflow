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
