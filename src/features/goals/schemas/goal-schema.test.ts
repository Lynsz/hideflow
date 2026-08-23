import { describe, expect, it } from "vitest";

import { productivityGoalSchema } from "@/features/goals/schemas/goal-schema";

describe("productivityGoalSchema", () => {
  it("aceita metas inteiras dentro do intervalo, inclusive zero", () => {
    expect(
      productivityGoalSchema.safeParse({
        applicationsTarget: 0,
        followUpsTarget: 4,
        outreachTarget: 100,
      }).success,
    ).toBe(true);
  });

  it.each([-1, 101, 2.5])("rejeita a meta inválida %s", (value) => {
    expect(
      productivityGoalSchema.safeParse({
        applicationsTarget: value,
        followUpsTarget: 3,
        outreachTarget: 3,
      }).success,
    ).toBe(false);
  });

  it("não converte strings recebidas diretamente pela Server Action", () => {
    expect(
      productivityGoalSchema.safeParse({
        applicationsTarget: "5",
        followUpsTarget: 3,
        outreachTarget: 3,
      }).success,
    ).toBe(false);
  });
});
