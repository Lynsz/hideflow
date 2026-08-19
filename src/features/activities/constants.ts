import type { ApplicationActivityType } from "@/types/database";

export const ACTIVITY_TYPE_OPTIONS = [
  { value: "note", label: "Anotação" },
  { value: "email", label: "E-mail" },
  { value: "phone_call", label: "Ligação" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "other", label: "Outra interação" },
] as const satisfies ReadonlyArray<{
  value: ApplicationActivityType;
  label: string;
}>;

const ACTIVITY_TYPE_LABELS = Object.fromEntries(
  ACTIVITY_TYPE_OPTIONS.map((option) => [option.value, option.label]),
) as Record<ApplicationActivityType, string>;

export function formatActivityType(type: ApplicationActivityType) {
  return ACTIVITY_TYPE_LABELS[type];
}
