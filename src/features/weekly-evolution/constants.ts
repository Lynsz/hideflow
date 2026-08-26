export const WEEKLY_EVOLUTION_PERIOD_OPTIONS = [
  { value: "4w", label: "4 semanas", weeks: 4 },
  { value: "8w", label: "8 semanas", weeks: 8 },
  { value: "12w", label: "12 semanas", weeks: 12 },
] as const;

export const DEFAULT_WEEKLY_EVOLUTION_PERIOD = "8w" as const;

export const WEEKLY_EVOLUTION_METRICS = [
  {
    key: "applications",
    label: "Candidaturas",
    color: "bg-sky-400",
  },
  {
    key: "followUps",
    label: "Follow-ups",
    color: "bg-violet-400",
  },
  {
    key: "outreach",
    label: "Contatos",
    color: "bg-amber-300",
  },
  {
    key: "interviews",
    label: "Entrevistas",
    color: "bg-emerald-400",
  },
  { key: "offers", label: "Propostas", color: "bg-rose-400" },
] as const;
