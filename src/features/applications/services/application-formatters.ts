import {
  APPLICATION_STATUS_LABELS,
  EMPLOYMENT_TYPE_LABELS,
  WORK_MODE_LABELS,
} from "@/features/applications/constants";
import type { Application } from "@/features/applications/types/application";
import type { ApplicationStatus } from "@/types/database";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export function formatDate(value: string | null) {
  return value
    ? dateFormatter.format(new Date(`${value}T00:00:00Z`))
    : "Não informada";
}

export function formatSalary(
  application: Pick<Application, "salary_min" | "salary_max" | "currency">,
) {
  if (application.salary_min === null && application.salary_max === null)
    return "Não informada";

  const formatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: application.currency,
    maximumFractionDigits: 0,
  });
  if (application.salary_min !== null && application.salary_max !== null) {
    return `${formatter.format(application.salary_min)} – ${formatter.format(application.salary_max)}`;
  }
  return formatter.format(
    application.salary_min ?? application.salary_max ?? 0,
  );
}

export function formatWorkMode(value: Application["work_mode"]) {
  return value ? WORK_MODE_LABELS[value] : "Não informada";
}

export function formatEmploymentType(value: Application["employment_type"]) {
  return value ? EMPLOYMENT_TYPE_LABELS[value] : "Não informado";
}

export function formatStatus(value: ApplicationStatus) {
  return APPLICATION_STATUS_LABELS[value];
}
