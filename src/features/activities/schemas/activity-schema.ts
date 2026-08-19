import { z } from "zod";

const activityTypeSchema = z.enum([
  "note",
  "email",
  "phone_call",
  "linkedin",
  "other",
]);

const common = {
  applicationId: z.uuid("Candidatura inválida."),
  activityType: activityTypeSchema,
  title: z
    .string()
    .trim()
    .min(1, "Informe um título para a interação.")
    .max(120, "Use no máximo 120 caracteres."),
  notes: z.string().trim().max(2000, "Use no máximo 2.000 caracteres."),
};

export const activityFormSchema = z.object({
  ...common,
  occurredAt: z
    .string()
    .refine(
      (value) => value !== "" && !Number.isNaN(new Date(value).getTime()),
      "Informe uma data e hora válidas.",
    ),
});

export const activityMutationSchema = z.object({
  ...common,
  occurredAt: z.iso.datetime({ offset: true }),
});

export const activityDeleteSchema = z.object({
  activityId: z.uuid("Interação inválida."),
  applicationId: z.uuid("Candidatura inválida."),
});

export type ActivityFormValues = z.infer<typeof activityFormSchema>;
export type ActivityMutationValues = z.infer<typeof activityMutationSchema>;
