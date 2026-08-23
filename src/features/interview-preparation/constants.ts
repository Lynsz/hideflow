export const PREPARATION_SECTION_MAX_LENGTH = 4000;
export const LOGISTICS_NOTES_MAX_LENGTH = 2000;

export const INTERVIEW_PREPARATION_SECTIONS = [
  {
    name: "companyResearch",
    label: "Empresa e contexto",
    description: "Produtos, mercado, cultura e acontecimentos relevantes.",
    placeholder:
      "Ex.: produto principal, clientes, concorrentes, valores e notícias recentes…",
    maxLength: PREPARATION_SECTION_MAX_LENGTH,
  },
  {
    name: "roleAlignment",
    label: "Aderência à vaga",
    description: "Responsabilidades-chave e como sua experiência se conecta.",
    placeholder:
      "Ex.: requisitos prioritários, experiências relacionadas e pontos a esclarecer…",
    maxLength: PREPARATION_SECTION_MAX_LENGTH,
  },
  {
    name: "starStories",
    label: "Histórias e evidências",
    description:
      "Exemplos concretos usando situação, tarefa, ação e resultado.",
    placeholder:
      "Ex.: desafio enfrentado, sua responsabilidade, ações tomadas e impacto mensurável…",
    maxLength: PREPARATION_SECTION_MAX_LENGTH,
  },
  {
    name: "questionsToAsk",
    label: "Perguntas para fazer",
    description:
      "Questões sobre time, expectativas, desafios e próximos passos.",
    placeholder:
      "Ex.: como o sucesso é medido nos primeiros 90 dias? Qual é o maior desafio do time?",
    maxLength: PREPARATION_SECTION_MAX_LENGTH,
  },
  {
    name: "logisticsNotes",
    label: "Logística e observações",
    description: "Link, local, equipamentos e lembretes para o encontro.",
    placeholder:
      "Ex.: testar câmera, chegar 10 minutos antes, separar documento…",
    maxLength: LOGISTICS_NOTES_MAX_LENGTH,
  },
] as const;

export type InterviewPreparationSectionName =
  (typeof INTERVIEW_PREPARATION_SECTIONS)[number]["name"];
