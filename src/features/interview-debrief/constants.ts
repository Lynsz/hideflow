export const DEBRIEF_SECTION_MAX_LENGTH = 4000;
export const DEBRIEF_FOLLOW_UP_MAX_LENGTH = 2000;

export const INTERVIEW_RATING_OPTIONS = [
  { value: "1", label: "Muito difícil" },
  { value: "2", label: "Difícil" },
  { value: "3", label: "Regular" },
  { value: "4", label: "Boa" },
  { value: "5", label: "Excelente" },
] as const;

export const INTERVIEW_DEBRIEF_SECTIONS = [
  {
    name: "wentWell",
    label: "O que funcionou bem",
    description: "Respostas, exemplos e atitudes que você deseja repetir.",
    placeholder:
      "Ex.: contextualizei o problema, apresentei métricas e fiz boas perguntas…",
    maxLength: DEBRIEF_SECTION_MAX_LENGTH,
  },
  {
    name: "improveNextTime",
    label: "O que melhorar",
    description: "Pontos concretos para praticar antes do próximo encontro.",
    placeholder:
      "Ex.: responder com mais objetividade e preparar um exemplo sobre conflitos…",
    maxLength: DEBRIEF_SECTION_MAX_LENGTH,
  },
  {
    name: "questionsReceived",
    label: "Perguntas recebidas",
    description: "Temas e perguntas que podem reaparecer nas próximas etapas.",
    placeholder:
      "Ex.: conte sobre uma decisão técnica difícil; como você prioriza dívida técnica?",
    maxLength: DEBRIEF_SECTION_MAX_LENGTH,
  },
  {
    name: "followUpNotes",
    label: "Follow-up e próximos passos",
    description:
      "Contexto para agradecimento, retorno prometido ou novo contato.",
    placeholder:
      "Ex.: enviar portfólio, agradecer pela conversa e acompanhar retorno na sexta…",
    maxLength: DEBRIEF_FOLLOW_UP_MAX_LENGTH,
  },
] as const;
