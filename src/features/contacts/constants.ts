import type { ContactType } from "@/types/database";

export const CONTACT_TYPES = [
  { value: "recruiter", label: "Recruiter" },
  { value: "tech_recruiter", label: "Tech Recruiter" },
  { value: "hr", label: "RH" },
  { value: "hiring_manager", label: "Hiring Manager" },
  { value: "technical_interviewer", label: "Entrevistador técnico" },
  { value: "developer", label: "Desenvolvedor" },
  { value: "manager", label: "Gestor" },
  { value: "other", label: "Outro" },
] as const satisfies ReadonlyArray<{ value: ContactType; label: string }>;

export function formatContactType(value: ContactType | null) {
  return (
    CONTACT_TYPES.find((option) => option.value === value)?.label ??
    "Não informado"
  );
}
