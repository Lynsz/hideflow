import { describe, expect, it } from "vitest";

import {
  activityDeleteSchema,
  activityFormSchema,
  activityMutationSchema,
} from "@/features/activities/schemas/activity-schema";

const applicationId = "8e8cbddb-05ad-4d70-b00e-cf17d4292ed1";

describe("activity schemas", () => {
  it("normaliza uma interação manual válida", () => {
    const result = activityMutationSchema.parse({
      applicationId,
      activityType: "email",
      title: "  Retorno enviado  ",
      notes: "  Aguardando resposta.  ",
      occurredAt: "2026-08-19T15:30:00.000Z",
    });

    expect(result.title).toBe("Retorno enviado");
    expect(result.notes).toBe("Aguardando resposta.");
  });

  it("aceita o valor local usado pelo formulário", () => {
    expect(
      activityFormSchema.safeParse({
        applicationId,
        activityType: "phone_call",
        title: "Ligação com recrutadora",
        notes: "",
        occurredAt: "2026-08-19T12:30",
      }).success,
    ).toBe(true);
  });

  it("rejeita tipo, tamanho e identificadores manipulados", () => {
    expect(
      activityMutationSchema.safeParse({
        applicationId: "outro-usuario",
        activityType: "automatic_message",
        title: "x".repeat(121),
        notes: "",
        occurredAt: "agora",
      }).success,
    ).toBe(false);
    expect(
      activityDeleteSchema.safeParse({
        activityId: "inválido",
        applicationId,
      }).success,
    ).toBe(false);
  });
});
