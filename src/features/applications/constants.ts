import type {
  ApplicationStatus,
  EmploymentType,
  WorkMode,
} from "@/types/database";

export const APPLICATION_STATUSES = [
  "saved",
  "applied",
  "screening",
  "hr_interview",
  "technical_interview",
  "technical_challenge",
  "final_interview",
  "offer",
  "hired",
  "rejected",
  "withdrawn",
] as const satisfies readonly ApplicationStatus[];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  saved: "Salva",
  applied: "Aplicada",
  screening: "Triagem",
  hr_interview: "Entrevista RH",
  technical_interview: "Entrevista técnica",
  technical_challenge: "Desafio técnico",
  final_interview: "Entrevista final",
  offer: "Proposta",
  hired: "Contratada",
  rejected: "Rejeitada",
  withdrawn: "Desisti",
};

export const WORK_MODES = [
  "remote",
  "hybrid",
  "onsite",
] as const satisfies readonly WorkMode[];

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  remote: "Remoto",
  hybrid: "Híbrido",
  onsite: "Presencial",
};

export const EMPLOYMENT_TYPES = [
  "clt",
  "pj",
  "internship",
  "freelance",
  "temporary",
  "other",
] as const satisfies readonly EmploymentType[];

export const EMPLOYMENT_TYPE_LABELS: Record<EmploymentType, string> = {
  clt: "CLT",
  pj: "PJ",
  internship: "Estágio",
  freelance: "Freelancer",
  temporary: "Temporário",
  other: "Outro",
};

export const APPLICATION_SOURCES = [
  "LinkedIn",
  "Gupy",
  "Indeed",
  "Glassdoor",
  "Site da empresa",
  "Indicação",
  "Outro",
] as const;

export const ACTIVE_APPLICATION_STATUSES: readonly ApplicationStatus[] = [
  "saved",
  "applied",
  "screening",
  "hr_interview",
  "technical_interview",
  "technical_challenge",
  "final_interview",
  "offer",
];

export const FINAL_APPLICATION_STATUSES: readonly ApplicationStatus[] = [
  "hired",
  "rejected",
  "withdrawn",
];

export const INTERVIEW_APPLICATION_STATUSES: readonly ApplicationStatus[] = [
  "hr_interview",
  "technical_interview",
  "technical_challenge",
  "final_interview",
];

export const APPLICATION_PAGE_SIZE = 10;
export const KANBAN_APPLICATION_LIMIT = 300;
