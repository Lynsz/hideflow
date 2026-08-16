import { z } from "zod";

import {
  INTERVIEW_RESULTS,
  INTERVIEW_TYPES,
} from "@/features/interviews/constants";
import { isHttpUrl } from "@/lib/validation/url";

const common = {
  applicationId: z.uuid("Selecione uma candidatura."),
  type: z.enum(INTERVIEW_TYPES.map((item) => item.value)),
  contactId: z.uuid().or(z.literal("")),
  interviewerName: z.string().trim().max(160),
  meetingUrl: z
    .string()
    .trim()
    .refine(
      (value) => value === "" || isHttpUrl(value),
      "Informe uma URL completa e válida.",
    ),
  notes: z.string().trim().max(5000),
  result: z.enum(INTERVIEW_RESULTS.map((item) => item.value)),
};

export const interviewFormSchema = z.object({
  ...common,
  scheduledAt: z
    .string()
    .refine(
      (value) => value !== "" && !Number.isNaN(new Date(value).getTime()),
      "Informe uma data e hora válidas.",
    ),
});
export const interviewMutationSchema = z.object({
  ...common,
  scheduledAt: z.iso.datetime({ offset: true }),
});
export type InterviewFormValues = z.infer<typeof interviewFormSchema>;
export type InterviewMutationValues = z.infer<typeof interviewMutationSchema>;
