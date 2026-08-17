import { describe, expect, it } from "vitest";

import {
  addApplicationTechnologySchema,
  removeApplicationTechnologySchema,
} from "@/features/technologies/schemas/technology-schema";

const applicationId = crypto.randomUUID();

describe("addApplicationTechnologySchema", () => {
  it("aceita e normaliza nomes profissionais", () => {
    const result = addApplicationTechnologySchema.safeParse({
      applicationId,
      name: "  Node.js   e Express  ",
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.name).toBe("Node.js e Express");
  });

  it("rejeita candidatura, nome vazio e nome muito longo", () => {
    expect(
      addApplicationTechnologySchema.safeParse({
        applicationId: "",
        name: "React",
      }).success,
    ).toBe(false);
    expect(
      addApplicationTechnologySchema.safeParse({ applicationId, name: "   " })
        .success,
    ).toBe(false);
    expect(
      addApplicationTechnologySchema.safeParse({
        applicationId,
        name: "a".repeat(61),
      }).success,
    ).toBe(false);
  });
});

describe("removeApplicationTechnologySchema", () => {
  it("exige dois identificadores válidos", () => {
    expect(
      removeApplicationTechnologySchema.safeParse({
        applicationId,
        technologyId: crypto.randomUUID(),
      }).success,
    ).toBe(true);
    expect(
      removeApplicationTechnologySchema.safeParse({
        applicationId,
        technologyId: "React",
      }).success,
    ).toBe(false);
  });
});
