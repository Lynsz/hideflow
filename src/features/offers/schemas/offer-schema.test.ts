import { describe, expect, it } from "vitest";

import { offerSchema } from "@/features/offers/schemas/offer-schema";

const valid = {
  applicationId: "11111111-1111-4111-8111-111111111111",
  salaryAmount: "12000",
  salaryPeriod: "monthly" as const,
  currency: "BRL" as const,
  bonusAmount: "15000",
  equity: "0,1% com vesting",
  benefits: "Plano de saúde",
  receivedAt: "2026-08-19",
  decisionDeadline: "2026-08-25",
  notes: "",
};

describe("offerSchema", () => {
  it("aceita e normaliza uma proposta válida", () => {
    const parsed = offerSchema.parse({ ...valid, benefits: "  Saúde  " });
    expect(parsed.benefits).toBe("Saúde");
  });

  it("rejeita salário vazio, negativo ou moeda não suportada", () => {
    expect(offerSchema.safeParse({ ...valid, salaryAmount: "" }).success).toBe(
      false,
    );
    expect(
      offerSchema.safeParse({ ...valid, salaryAmount: "-1" }).success,
    ).toBe(false);
    expect(offerSchema.safeParse({ ...valid, currency: "BTC" }).success).toBe(
      false,
    );
  });

  it("rejeita prazo anterior ao recebimento", () => {
    expect(
      offerSchema.safeParse({
        ...valid,
        decisionDeadline: "2026-08-18",
      }).success,
    ).toBe(false);
  });

  it("rejeita datas civis inexistentes", () => {
    expect(
      offerSchema.safeParse({ ...valid, receivedAt: "2026-02-30" }).success,
    ).toBe(false);
    expect(
      offerSchema.safeParse({ ...valid, decisionDeadline: "2026-13-01" })
        .success,
    ).toBe(false);
  });

  it("descarta campos de ownership enviados pelo cliente", () => {
    expect(
      offerSchema.parse({ ...valid, user_id: crypto.randomUUID() }),
    ).not.toHaveProperty("user_id");
  });
});
