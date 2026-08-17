import { describe, expect, it } from "vitest";

import {
  changePasswordSchema,
  preferencesSchema,
  profileSettingsSchema,
} from "@/features/settings/schemas/settings-schema";

describe("settings schemas", () => {
  it("normaliza o nome e aceita preferências suportadas", () => {
    expect(
      profileSettingsSchema.parse({ fullName: "  Maria Silva  " }),
    ).toEqual({ fullName: "Maria Silva" });
    expect(
      preferencesSchema.safeParse({
        defaultCurrency: "USD",
        analyticsPeriod: "6m",
      }).success,
    ).toBe(true);
  });

  it("rejeita preferências fora do domínio", () => {
    expect(
      preferencesSchema.safeParse({
        defaultCurrency: "BTC",
        analyticsPeriod: "forever",
      }).success,
    ).toBe(false);
  });

  it("exige confirmação e uma nova senha diferente", () => {
    const valid = {
      currentPassword: "atual123",
      password: "novaSenha123",
      passwordConfirmation: "novaSenha123",
    };

    expect(changePasswordSchema.safeParse(valid).success).toBe(true);
    expect(
      changePasswordSchema.safeParse({
        ...valid,
        password: "atual123",
        passwordConfirmation: "atual123",
      }).success,
    ).toBe(false);
    expect(
      changePasswordSchema.safeParse({
        ...valid,
        passwordConfirmation: "outraSenha123",
      }).success,
    ).toBe(false);
  });
});
