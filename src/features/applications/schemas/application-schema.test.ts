import { describe, expect, it } from "vitest";

import {
  applicationArchiveSchema,
  applicationSchema,
} from "@/features/applications/schemas/application-schema";

const validApplication = {
  companyId: "11111111-1111-4111-8111-111111111111",
  jobTitle: "Frontend Engineer",
  jobUrl: "https://example.com/jobs/1",
  location: "Remoto",
  workMode: "remote" as const,
  employmentType: "clt" as const,
  salaryMin: "5000",
  salaryMax: "8000",
  currency: "BRL",
  appliedAt: "2026-08-14",
  source: "LinkedIn",
  status: "applied" as const,
  description: "",
  notes: "",
};

describe("applicationSchema", () => {
  it("aceita uma candidatura válida", () => {
    expect(applicationSchema.safeParse(validApplication).success).toBe(true);
  });

  it("aceita apenas moedas disponíveis nas preferências", () => {
    expect(
      applicationSchema.safeParse({ ...validApplication, currency: "USD" })
        .success,
    ).toBe(true);
    expect(
      applicationSchema.safeParse({ ...validApplication, currency: "BTC" })
        .success,
    ).toBe(false);
  });

  it("rejeita salário negativo", () => {
    expect(
      applicationSchema.safeParse({ ...validApplication, salaryMin: "-1" })
        .success,
    ).toBe(false);
  });

  it("rejeita salário máximo menor que o mínimo", () => {
    const result = applicationSchema.safeParse({
      ...validApplication,
      salaryMin: "9000",
      salaryMax: "8000",
    });
    expect(result.success).toBe(false);
  });

  it.each([
    ["status", "unknown"],
    ["workMode", "anywhere"],
    ["employmentType", "volunteer"],
  ])("rejeita valor inválido em %s", (field, value) => {
    expect(
      applicationSchema.safeParse({ ...validApplication, [field]: value })
        .success,
    ).toBe(false);
  });

  it("rejeita URL de vaga inválida", () => {
    expect(
      applicationSchema.safeParse({
        ...validApplication,
        jobUrl: "example.com",
      }).success,
    ).toBe(false);
  });

  it("não propaga user_id enviado pelo navegador", () => {
    const result = applicationSchema.parse({
      ...validApplication,
      user_id: "22222222-2222-4222-8222-222222222222",
    });

    expect(result).not.toHaveProperty("user_id");
  });
});

describe("applicationArchiveSchema", () => {
  it("aceita somente UUID e estado booleano", () => {
    expect(
      applicationArchiveSchema.safeParse({
        applicationId: "11111111-1111-4111-8111-111111111111",
        archived: true,
      }).success,
    ).toBe(true);
    expect(
      applicationArchiveSchema.safeParse({
        applicationId: "outra-conta",
        archived: "true",
      }).success,
    ).toBe(false);
  });
});
