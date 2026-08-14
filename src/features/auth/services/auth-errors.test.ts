import { describe, expect, it } from "vitest";

import { getAuthErrorMessage } from "@/features/auth/services/auth-errors";

describe("getAuthErrorMessage", () => {
  it("mapeia códigos conhecidos para mensagens amigáveis", () => {
    expect(getAuthErrorMessage({ code: "invalid_credentials" })).toBe(
      "E-mail ou senha incorretos.",
    );
  });

  it("não expõe mensagens internas desconhecidas", () => {
    const message = getAuthErrorMessage({
      code: "database_failure",
      message: "relation auth.users failed with internal id 123",
    });

    expect(message).toBe(
      "Não foi possível concluir a solicitação. Tente novamente.",
    );
    expect(message).not.toContain("auth.users");
  });

  it("reconhece a mensagem legada de credenciais inválidas", () => {
    expect(getAuthErrorMessage({ message: "Invalid login credentials" })).toBe(
      "E-mail ou senha incorretos.",
    );
  });
});
