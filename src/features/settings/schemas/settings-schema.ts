import { z } from "zod";

import {
  SETTINGS_ANALYTICS_PERIODS,
  SUPPORTED_CURRENCIES,
} from "@/features/settings/constants";

export const profileSettingsSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Informe seu nome completo.")
    .max(120, "O nome deve ter no máximo 120 caracteres."),
});

export const preferencesSchema = z.object({
  defaultCurrency: z.enum(SUPPORTED_CURRENCIES),
  analyticsPeriod: z.enum(SETTINGS_ANALYTICS_PERIODS),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(8, "Informe sua senha atual.")
      .max(72, "A senha deve ter no máximo 72 caracteres."),
    password: z
      .string()
      .min(8, "A nova senha deve ter pelo menos 8 caracteres.")
      .max(72, "A senha deve ter no máximo 72 caracteres.")
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d).+$/,
        "Use pelo menos uma letra e um número.",
      ),
    passwordConfirmation: z.string(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: "As senhas precisam ser iguais.",
    path: ["passwordConfirmation"],
  })
  .refine((data) => data.currentPassword !== data.password, {
    message: "A nova senha precisa ser diferente da atual.",
    path: ["password"],
  });

export type ProfileSettingsValues = z.infer<typeof profileSettingsSchema>;
export type PreferencesValues = z.infer<typeof preferencesSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
