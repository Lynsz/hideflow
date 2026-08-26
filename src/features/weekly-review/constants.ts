export const WEEKLY_REVIEW_SECTION_MAX_LENGTH = 4000;
export const WEEKLY_REVIEW_FOCUS_MAX_LENGTH = 2000;

export const WEEKLY_REVIEW_RATING_OPTIONS = [
  { value: "1", label: "Muito difícil" },
  { value: "2", label: "Difícil" },
  { value: "3", label: "Estável" },
  { value: "4", label: "Boa" },
  { value: "5", label: "Excelente" },
] as const;

export const WEEKLY_REVIEW_SECTIONS = [
  {
    name: "wins",
    label: "Conquistas da semana",
    description: "Ações, avanços e pequenas vitórias que merecem ser mantidos.",
    placeholder:
      "Ex.: mantive o ritmo de candidaturas e avancei para duas entrevistas…",
    maxLength: WEEKLY_REVIEW_SECTION_MAX_LENGTH,
  },
  {
    name: "challenges",
    label: "Desafios e bloqueios",
    description: "O que consumiu energia ou dificultou o avanço do processo.",
    placeholder:
      "Ex.: vagas pouco alinhadas e dificuldade para organizar os follow-ups…",
    maxLength: WEEKLY_REVIEW_SECTION_MAX_LENGTH,
  },
  {
    name: "lessons",
    label: "Aprendizados",
    description:
      "Padrões e decisões que você deseja levar para a próxima semana.",
    placeholder:
      "Ex.: candidaturas direcionadas geraram mais retornos do que envios genéricos…",
    maxLength: WEEKLY_REVIEW_SECTION_MAX_LENGTH,
  },
  {
    name: "nextWeekFocus",
    label: "Foco da próxima semana",
    description:
      "Uma direção curta e concreta para orientar as próximas ações.",
    placeholder:
      "Ex.: priorizar três vagas aderentes e concluir os retornos pendentes…",
    maxLength: WEEKLY_REVIEW_FOCUS_MAX_LENGTH,
  },
] as const;
