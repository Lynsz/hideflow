import type { InterviewResult, InterviewType } from "@/types/database";

export const INTERVIEW_TYPES = [
  { value: "hr", label: "RH" },
  { value: "technical", label: "Técnica" },
  { value: "behavioral", label: "Comportamental" },
  { value: "culture", label: "Fit cultural" },
  { value: "manager", label: "Gestor" },
  { value: "pair_programming", label: "Pair programming" },
  { value: "technical_challenge", label: "Desafio técnico" },
  { value: "final", label: "Entrevista final" },
  { value: "other", label: "Outra" },
] as const satisfies ReadonlyArray<{ value: InterviewType; label: string }>;

export const INTERVIEW_RESULTS = [
  { value: "scheduled", label: "Agendada" },
  { value: "completed", label: "Realizada" },
  { value: "passed", label: "Aprovada" },
  { value: "failed", label: "Não aprovada" },
  { value: "cancelled", label: "Cancelada" },
  { value: "rescheduled", label: "Reagendada" },
] as const satisfies ReadonlyArray<{ value: InterviewResult; label: string }>;

export const formatInterviewType = (value: InterviewType) =>
  INTERVIEW_TYPES.find((item) => item.value === value)!.label;
export const formatInterviewResult = (value: InterviewResult) =>
  INTERVIEW_RESULTS.find((item) => item.value === value)!.label;
