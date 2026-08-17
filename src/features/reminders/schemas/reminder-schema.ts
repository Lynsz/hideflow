import { z } from "zod";

const common = {
  applicationId: z.uuid("Selecione uma candidatura."),
  title: z
    .string()
    .trim()
    .min(1, "Informe o que precisa ser feito.")
    .max(160, "Use no máximo 160 caracteres."),
  notes: z.string().trim().max(2000, "Use no máximo 2.000 caracteres."),
};

export const reminderFormSchema = z.object({
  ...common,
  dueAt: z
    .string()
    .refine(
      (value) => value !== "" && !Number.isNaN(new Date(value).getTime()),
      "Informe uma data e hora válidas.",
    ),
});

export const reminderMutationSchema = z.object({
  ...common,
  dueAt: z.iso.datetime({ offset: true }),
});

export type ReminderFormValues = z.infer<typeof reminderFormSchema>;
export type ReminderMutationValues = z.infer<typeof reminderMutationSchema>;
