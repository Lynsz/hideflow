export const AGENDA_EVENT_LIMIT = 300;

export const AGENDA_PERIODS = [
  { value: "7d", label: "Próximos 7 dias" },
  { value: "30d", label: "Próximos 30 dias" },
  { value: "90d", label: "Próximos 90 dias" },
  { value: "overdue", label: "Atrasados" },
  { value: "all", label: "Todos os itens ativos" },
] as const;

export const AGENDA_KINDS = [
  { value: "all", label: "Entrevistas e lembretes" },
  { value: "interview", label: "Somente entrevistas" },
  { value: "reminder", label: "Somente lembretes" },
] as const;

export type AgendaPeriod = (typeof AGENDA_PERIODS)[number]["value"];
export type AgendaKindFilter = (typeof AGENDA_KINDS)[number]["value"];
