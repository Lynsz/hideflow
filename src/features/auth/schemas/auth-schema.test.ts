import { describe, expect, it } from "vitest";

import { loginSchema, signUpSchema } from "@/features/auth/schemas/auth-schema";

describe("loginSchema", () => {
  it("normaliza o e-mail e aceita credenciais válidas", () => {
    const result = loginSchema.parse({
      email: "  PESSOA@EXEMPLO.COM ",
      password: "senha123",
    });

    expect(result.email).toBe("pessoa@exemplo.com");
  });

  it("rejeita e-mail inválido e senha curta", () => {
    const result = loginSchema.safeParse({
      email: "invalido",
      password: "123",
    });

    expect(result.success).toBe(false);
  });
});

describe("signUpSchema", () => {
  const validInput = {
    fullName: "Maria da Silva",
    email: "maria@example.com",
    password: "segura123",
    passwordConfirmation: "segura123",
  };

  it("aceita um cadastro válido", () => {
    expect(signUpSchema.safeParse(validInput).success).toBe(true);
  });

  it("rejeita senhas sem letra ou número", () => {
    const result = signUpSchema.safeParse({
      ...validInput,
      password: "abcdefgh",
      passwordConfirmation: "abcdefgh",
    });

    expect(result.success).toBe(false);
  });

  it("rejeita confirmação de senha diferente", () => {
    const result = signUpSchema.safeParse({
      ...validInput,
      passwordConfirmation: "outra123",
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(["passwordConfirmation"]);
    }
  });
});
