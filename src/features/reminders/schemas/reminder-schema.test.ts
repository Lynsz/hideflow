import { describe, expect, it } from "vitest";

import { reminderMutationSchema } from "@/features/reminders/schemas/reminder-schema";

const valid = {
  applicationId: crypto.randomUUID(),
  title: "Enviar follow-up para recrutadora",
  notes: "Retomar o contato após a entrevista.",
  dueAt: "2026-08-20T15:00:00.000Z",
};

describe("reminderMutationSchema", () => {
  it("normaliza e aceita um lembrete válido", () => {
    const result = reminderMutationSchema.safeParse({
      ...valid,
      title: "  Revisar desafio  ",
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.title).toBe("Revisar desafio");
  });

  it("exige candidatura, título e data válidos", () => {
    expect(
      reminderMutationSchema.safeParse({
        ...valid,
        applicationId: "",
        title: "",
        dueAt: "amanhã",
      }).success,
    ).toBe(false);
  });

  it("aceita lembrete vencido para permitir correções e importações", () => {
    expect(
      reminderMutationSchema.safeParse({
        ...valid,
        dueAt: "2020-01-01T10:00:00.000Z",
      }).success,
    ).toBe(true);
  });

  it("limita título e observações", () => {
    expect(
      reminderMutationSchema.safeParse({
        ...valid,
        title: "a".repeat(161),
      }).success,
    ).toBe(false);
    expect(
      reminderMutationSchema.safeParse({
        ...valid,
        notes: "a".repeat(2001),
      }).success,
    ).toBe(false);
  });
});
