import { z } from "zod";

import { CONTACT_TYPES } from "@/features/contacts/constants";
import { isHttpUrl } from "@/lib/validation/url";

const optionalHttpUrlSchema = z
  .string()
  .trim()
  .refine(
    (value) => value === "" || isHttpUrl(value),
    "Informe uma URL válida.",
  );

const optionalEmail = z
  .string()
  .trim()
  .max(254, "Use no máximo 254 caracteres.")
  .refine(
    (value) => value === "" || z.email().safeParse(value).success,
    "Informe um email válido.",
  );

export const contactSchema = z.object({
  name: z.string().trim().min(1, "Informe o nome.").max(160),
  companyId: z.uuid("Selecione uma empresa."),
  role: z.string().trim().max(160),
  contactType: z
    .enum(CONTACT_TYPES.map((type) => type.value))
    .or(z.literal("")),
  email: optionalEmail,
  phone: z.string().trim().max(40),
  linkedinUrl: optionalHttpUrlSchema,
  notes: z.string().trim().max(5000),
});

export type ContactFormValues = z.infer<typeof contactSchema>;

export const contactLinkSchema = z.object({
  applicationId: z.uuid(),
  contactId: z.uuid(),
});
