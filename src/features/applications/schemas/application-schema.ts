import { z } from "zod";

import {
  APPLICATION_STATUSES,
  EMPLOYMENT_TYPES,
  WORK_MODES,
} from "@/features/applications/constants";
import { SUPPORTED_CURRENCIES } from "@/features/settings/constants";
import { isHttpUrl } from "@/lib/validation/url";

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => value === "" || isHttpUrl(value), {
    message: "Informe uma URL completa e válida.",
  });

const optionalSalary = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" || (!Number.isNaN(Number(value)) && Number(value) >= 0),
    "O salário deve ser um número não negativo.",
  );

export const applicationSchema = z
  .object({
    companyId: z.uuid("Selecione uma empresa válida."),
    jobTitle: z
      .string()
      .trim()
      .min(1, "Informe o nome da vaga.")
      .max(180, "Use no máximo 180 caracteres."),
    jobUrl: optionalUrl,
    location: z.string().trim().max(160, "Use no máximo 160 caracteres."),
    workMode: z.enum(WORK_MODES).or(z.literal("")),
    employmentType: z.enum(EMPLOYMENT_TYPES).or(z.literal("")),
    salaryMin: optionalSalary,
    salaryMax: optionalSalary,
    currency: z.enum(SUPPORTED_CURRENCIES, "Selecione uma moeda válida."),
    appliedAt: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
        "Informe uma data válida.",
      ),
    source: z.string().trim().max(120, "Use no máximo 120 caracteres."),
    status: z.enum(APPLICATION_STATUSES),
    description: z
      .string()
      .trim()
      .max(10000, "Use no máximo 10.000 caracteres."),
    notes: z.string().trim().max(10000, "Use no máximo 10.000 caracteres."),
  })
  .superRefine((values, context) => {
    if (
      values.salaryMin !== "" &&
      values.salaryMax !== "" &&
      Number(values.salaryMax) < Number(values.salaryMin)
    ) {
      context.addIssue({
        code: "custom",
        path: ["salaryMax"],
        message: "O salário máximo não pode ser menor que o mínimo.",
      });
    }
  });

export const statusUpdateSchema = z.object({
  applicationId: z.uuid(),
  previousStatus: z.enum(APPLICATION_STATUSES),
  status: z.enum(APPLICATION_STATUSES),
});

export type ApplicationFormValues = z.infer<typeof applicationSchema>;
