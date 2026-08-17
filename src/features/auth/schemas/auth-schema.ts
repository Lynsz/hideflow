import { z } from "zod";

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Informe um e-mail válido.")),
  password: z
    .string()
    .min(8, "A senha deve ter pelo menos 8 caracteres.")
    .max(72, "A senha deve ter no máximo 72 caracteres."),
});

export const signUpSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Informe seu nome completo.")
      .max(120, "O nome deve ter no máximo 120 caracteres."),
    email: z
      .string()
      .trim()
      .toLowerCase()
      .pipe(z.email("Informe um e-mail válido.")),
    password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres.")
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
  });

export const passwordRecoveryRequestSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .pipe(z.email("Informe um e-mail válido.")),
});

export const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres.")
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
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type PasswordRecoveryRequestValues = z.infer<
  typeof passwordRecoveryRequestSchema
>;
export type NewPasswordValues = z.infer<typeof newPasswordSchema>;
