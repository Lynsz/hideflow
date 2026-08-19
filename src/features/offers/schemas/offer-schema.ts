import { z } from "zod";

import { OFFER_SALARY_PERIODS } from "@/features/offers/constants";
import { SUPPORTED_CURRENCIES } from "@/features/settings/constants";

const optionalMoney = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" ||
      (!Number.isNaN(Number(value)) &&
        Number(value) >= 0 &&
        Number(value) <= 999_999_999_999.99),
    "Informe um valor monetário válido.",
  );

const isoDate = z.iso.date();
const isCivilDate = (value: string) => isoDate.safeParse(value).success;

const requiredDate = (message: string) =>
  z.string().trim().refine(isCivilDate, message);

export const offerSchema = z
  .object({
    applicationId: z.uuid("Candidatura inválida."),
    salaryAmount: z
      .string()
      .trim()
      .refine(
        (value) =>
          !Number.isNaN(Number(value)) &&
          Number(value) > 0 &&
          Number(value) <= 999_999_999_999.99,
        "Informe um salário maior que zero.",
      ),
    salaryPeriod: z.enum(OFFER_SALARY_PERIODS),
    currency: z.enum(SUPPORTED_CURRENCIES),
    bonusAmount: optionalMoney,
    equity: z.string().trim().max(1000, "Use no máximo 1.000 caracteres."),
    benefits: z.string().trim().max(3000, "Use no máximo 3.000 caracteres."),
    receivedAt: requiredDate("Informe a data de recebimento."),
    decisionDeadline: z
      .string()
      .trim()
      .refine(
        (value) => value === "" || isCivilDate(value),
        "Informe um prazo válido.",
      ),
    notes: z.string().trim().max(3000, "Use no máximo 3.000 caracteres."),
  })
  .superRefine((values, context) => {
    if (
      values.decisionDeadline &&
      values.decisionDeadline < values.receivedAt
    ) {
      context.addIssue({
        code: "custom",
        path: ["decisionDeadline"],
        message: "O prazo não pode ser anterior ao recebimento.",
      });
    }
  });

export const offerDeleteSchema = z.object({
  applicationId: z.uuid("Candidatura inválida."),
});

export type OfferFormValues = z.infer<typeof offerSchema>;
