import { z } from "zod";

import { isHttpUrl } from "@/lib/validation/url";

const optionalUrl = z
  .string()
  .trim()
  .refine((value) => value === "" || isHttpUrl(value), {
    message: "Informe uma URL completa e válida.",
  });

export const companySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Informe o nome da empresa.")
    .max(160, "Use no máximo 160 caracteres."),
  website: optionalUrl,
  linkedinUrl: optionalUrl,
  location: z.string().trim().max(160, "Use no máximo 160 caracteres."),
  notes: z.string().trim().max(5000, "Use no máximo 5.000 caracteres."),
});

export type CompanyFormValues = z.infer<typeof companySchema>;
