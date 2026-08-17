export const REMINDER_FILTERS = [
  { value: "pending", label: "Próximos" },
  { value: "overdue", label: "Atrasados" },
  { value: "completed", label: "Concluídos" },
  { value: "all", label: "Todos" },
] as const;

export type ReminderFilter = (typeof REMINDER_FILTERS)[number]["value"];
