export const INTERVIEW_LEARNING_PAGE_SIZE = 9;

export const INTERVIEW_LEARNING_RATINGS = ["1", "2", "3", "4", "5"] as const;

export const INTERVIEW_LEARNING_THANK_YOU_FILTERS = [
  { value: "all", label: "Todos os agradecimentos" },
  { value: "pending", label: "Não marcados" },
  { value: "sent", label: "Marcados como enviados" },
] as const;

export const INTERVIEW_LEARNING_SORTS = [
  { value: "recent", label: "Atualizadas recentemente" },
  { value: "oldest", label: "Atualizadas há mais tempo" },
  { value: "rating_high", label: "Maior avaliação" },
  { value: "rating_low", label: "Menor avaliação" },
] as const;
